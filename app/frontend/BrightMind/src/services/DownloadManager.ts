// src/services/DownloadManager.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse, CancelTokenSource } from 'axios';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import BackgroundFetch from 'react-native-background-fetch';

export interface DownloadTask {
  id: string;
  topicId: string;
  url: string;
  progress: number;
  status: DownloadStatus;
  size: number;
  downloadedSize: number;
  priority: number;
  cancelToken: CancelTokenSource;
  createdAt: number;
  error?: string;
}

export type DownloadStatus = 
  | 'queued'
  | 'downloading'
  | 'paused'
  | 'completed'
  | 'error'
  | 'cancelled';

export interface DownloadOptions {
  priority?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

class DownloadManager {
  private static instance: DownloadManager;
  private downloadQueue: Map<string, DownloadTask> = new Map();
  private activeDownloads: Map<string, DownloadTask> = new Map();
  private readonly MAX_CONCURRENT_DOWNLOADS = 2;
  private readonly STORAGE_KEY = 'downloadTasks';
  private readonly DOWNLOAD_DIR = `${FileSystem.documentDirectory}topics/`;
  private subscribers: Set<(tasks: Map<string, DownloadTask>) => void> = new Set();

  private constructor() {
    this.initializeBackgroundFetch();
    this.restoreState();
    this.setupNetworkListener();
  }

  static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  // Initialize background fetch
  private async initializeBackgroundFetch() {
    try {
      await BackgroundFetch.configure({
        minimumFetchInterval: 15, // 15 minutes
        stopOnTerminate: false,
        enableHeadless: true,
        startOnBoot: true,
      }, async (taskId) => {
        await this.processBackgroundDownloads();
        BackgroundFetch.finish(taskId);
      }, (error) => {
        console.error('Background fetch failed to start', error);
      });
    } catch (error) {
      console.error('Error configuring background fetch:', error);
    }
  }

  // Network state listener
  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.resumeAllPausedDownloads();
      } else {
        this.pauseAllDownloads('No internet connection');
      }
    });
  }

  // Save current state
  private async saveState() {
    try {
      const state = Array.from(this.downloadQueue.entries());
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving download state:', error);
    }
  }

  // Restore saved state
  private async restoreState() {
    try {
      const state = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (state) {
        const tasks = new Map(JSON.parse(state));
        tasks.forEach((task) => {
          if (task.status === 'downloading') {
            task.status = 'paused';
          }
          this.downloadQueue.set(task.id, task);
        });
        this.processQueue();
      }
    } catch (error) {
      console.error('Error restoring download state:', error);
    }
  }

  // Subscribe to download updates
  subscribe(callback: (tasks: Map<string, DownloadTask>) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify subscribers of changes
  private notifySubscribers() {
    const allTasks = new Map([...this.downloadQueue, ...this.activeDownloads]);
    this.subscribers.forEach(callback => callback(allTasks));
    this.saveState();
  }

  // Check available storage
  private async checkStorage(size: number): Promise<boolean> {
    try {
      const { freeDiskStorage } = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
      // Add 10% buffer to required size
      return freeDiskStorage > (size * 1.1);
    } catch (error) {
      console.error('Error checking storage:', error);
      return false;
    }
  }

  // Get topic size
  private async getTopicSize(topicId: string): Promise<number> {
    try {
      const response = await axios.head(`backendurl/api/v1/topics/${topicId}/size`);
      return parseInt(response.headers['content-length'] || '0', 10);
    } catch (error) {
      console.error('Error getting topic size:', error);
      throw new Error('Could not determine topic size');
    }
  }

  // Add download to queue
  async queueDownload(
    topicId: string,
    options: DownloadOptions = {}
  ): Promise<string> {
    try {
      const size = await this.getTopicSize(topicId);
      const hasSpace = await this.checkStorage(size);
      
      if (!hasSpace) {
        throw new Error('Insufficient storage space');
      }

      const downloadId = `download_${Date.now()}_${topicId}`;
      const task: DownloadTask = {
        id: downloadId,
        topicId,
        url: `backendurl/api/v1/topics/${topicId}/content`,
        progress: 0,
        status: 'queued',
        size,
        downloadedSize: 0,
        priority: options.priority || 1,
        cancelToken: axios.CancelToken.source(),
        createdAt: Date.now(),
      };

      this.downloadQueue.set(downloadId, task);
      this.notifySubscribers();
      this.processQueue();

      return downloadId;
    } catch (error) {
      throw new Error(`Failed to queue download: ${error.message}`);
    }
  }

  // Process download queue
  private async processQueue() {
    if (this.activeDownloads.size >= this.MAX_CONCURRENT_DOWNLOADS) {
      return;
    }

    const sortedQueue = Array.from(this.downloadQueue.values())
      .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt)
      .filter(task => task.status === 'queued');

    for (const task of sortedQueue) {
      if (this.activeDownloads.size >= this.MAX_CONCURRENT_DOWNLOADS) {
        break;
      }

      this.downloadQueue.delete(task.id);
      this.activeDownloads.set(task.id, task);
      this.startDownload(task);
    }
  }

  // Start download
  private async startDownload(task: DownloadTask) {
    try {
      task.status = 'downloading';
      this.notifySubscribers();

      const downloadResumable = FileSystem.createDownloadResumable(
        task.url,
        `${this.DOWNLOAD_DIR}${task.topicId}`,
        {},
        (downloadProgress) => {
          const progress = (downloadProgress.totalBytesWritten / task.size) * 100;
          this.updateDownloadProgress(task.id, progress);
        }
      );

      await downloadResumable.downloadAsync();
      await this.completeDownload(task);
    } catch (error) {
      if (axios.isCancel(error)) {
        task.status = 'cancelled';
      } else {
        task.status = 'error';
        task.error = error.message;
      }
      this.activeDownloads.delete(task.id);
      this.notifySubscribers();
    }
  }

  // Update download progress
  private updateDownloadProgress(taskId: string, progress: number) {
    const task = this.activeDownloads.get(taskId);
    if (task) {
      task.progress = progress;
      task.downloadedSize = Math.floor((progress / 100) * task.size);
      this.notifySubscribers();
    }
  }

  // Complete download
  private async completeDownload(task: DownloadTask) {
    task.status = 'completed';
    task.progress = 100;
    task.downloadedSize = task.size;
    
    // Update downloaded topics list
    const downloadedTopicsStr = await AsyncStorage.getItem('downloadedTopics');
    const downloadedTopics = downloadedTopicsStr ? JSON.parse(downloadedTopicsStr) : {};
    downloadedTopics[task.topicId] = true;
    await AsyncStorage.setItem('downloadedTopics', JSON.stringify(downloadedTopics));

    this.activeDownloads.delete(task.id);
    this.notifySubscribers();
    this.processQueue();
  }

  // Pause download
  async pauseDownload(taskId: string) {
    const task = this.activeDownloads.get(taskId);
    if (task && task.status === 'downloading') {
      task.cancelToken.cancel('Download paused');
      task.status = 'paused';
      this.downloadQueue.set(taskId, task);
      this.activeDownloads.delete(taskId);
      this.notifySubscribers();
    }
  }

  // Resume download
  async resumeDownload(taskId: string) {
    const task = this.downloadQueue.get(taskId);
    if (task && task.status === 'paused') {
      task.status = 'queued';
      task.cancelToken = axios.CancelToken.source();
      this.notifySubscribers();
      this.processQueue();
    }
  }

  // Cancel download
  async cancelDownload(taskId: string) {
    const task = this.activeDownloads.get(taskId) || this.downloadQueue.get(taskId);
    if (task) {
      task.cancelToken.cancel('Download cancelled');
      task.status = 'cancelled';
      this.activeDownloads.delete(taskId);
      this.downloadQueue.delete(taskId);
      this.notifySubscribers();
      this.processQueue();
    }
  }

  // Pause all downloads
  private async pauseAllDownloads(reason: string) {
    this.activeDownloads.forEach(task => {
      if (task.status === 'downloading') {
        task.cancelToken.cancel(reason);
        task.status = 'paused';
        this.downloadQueue.set(task.id, task);
      }
    });
    this.activeDownloads.clear();
    this.notifySubscribers();
  }

  // Resume all paused downloads
  private async resumeAllPausedDownloads() {
    const pausedTasks = Array.from(this.downloadQueue.values())
      .filter(task => task.status === 'paused');
    
    pausedTasks.forEach(task => {
      task.status = 'queued';
      task.cancelToken = axios.CancelToken.source();
    });
    
    this.notifySubscribers();
    this.processQueue();
  }

  // Process background downloads
  private async processBackgroundDownloads() {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      return;
    }

    const tasks = Array.from(this.downloadQueue.values())
      .filter(task => task.status === 'queued' || task.status === 'paused');
    
    for (const task of tasks) {
      if (task.status === 'paused') {
        await this.resumeDownload(task.id);
      }
    }
  }
}

export default DownloadManager.getInstance();