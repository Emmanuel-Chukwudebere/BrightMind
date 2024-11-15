import { useState, useEffect, useCallback } from 'react';
import DownloadManager, { DownloadTask, DownloadStatus } from '../services/DownloadManager';

export const useDownloadManager = (topicId: string) => {
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('queued');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = DownloadManager.subscribe((tasks) => {
      const task = Array.from(tasks.values()).find(t => t.topicId === topicId);
      if (task) {
        setDownloadStatus(task.status);
        setProgress(task.progress);
      }
    });

    // Check initial status
    const initialTask = DownloadManager.getTask(topicId);
    if (initialTask) {
      setDownloadStatus(initialTask.status);
      setProgress(initialTask.progress);
    }

    return () => {
      unsubscribe();
    };
  }, [topicId]);

  const startDownload = useCallback(async (url: string) => {
    try {
      await DownloadManager.addDownload(topicId, url, {
        onProgress: (progress) => setProgress(progress),
        onComplete: () => setDownloadStatus('completed'),
        onError: (error) => {
          console.error('Download error:', error);
          setDownloadStatus('error');
        }
      });
    } catch (error) {
      console.error('Failed to start download:', error);
      setDownloadStatus('error');
    }
  }, [topicId]);

  const cancelDownload = useCallback(async () => {
    try {
      await DownloadManager.cancelDownload(topicId);
      setDownloadStatus('cancelled');
      setProgress(0);
    } catch (error) {
      console.error('Failed to cancel download:', error);
    }
  }, [topicId]);

  const pauseDownload = useCallback(async () => {
    try {
      await DownloadManager.pauseDownload(topicId);
      setDownloadStatus('paused');
    } catch (error) {
      console.error('Failed to pause download:', error);
    }
  }, [topicId]);

  const resumeDownload = useCallback(async () => {
    try {
      await DownloadManager.resumeDownload(topicId);
      setDownloadStatus('downloading');
    } catch (error) {
      console.error('Failed to resume download:', error);
    }
  }, [topicId]);

  return {
    downloadStatus,
    progress,
    startDownload,
    cancelDownload,
    pauseDownload,
    resumeDownload
  };
};
