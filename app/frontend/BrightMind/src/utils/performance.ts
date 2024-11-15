// src/utils/performance.ts
import { InteractionManager } from 'react-native';
import { analytics } from './analytics';
import { PerformanceMetric } from '../types';

interface ThresholdConfig {
  warning: number;
  error: number;
}

interface MetricThresholds {
  [key: string]: ThresholdConfig;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private thresholds: MetricThresholds = {
    'fetch_home_topics': { warning: 1000, error: 3000 },
    'topic_render': { warning: 16, error: 32 },
    'image_load': { warning: 500, error: 2000 },
  };

  startMetric(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      metadata,
    });
  }

  endMetric(name: string, additionalMetadata?: Record<string, any>): void {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`No metric found with name: ${name}`);
      return;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.metadata = {
      ...metric.metadata,
      ...additionalMetadata,
    };

    // Check against thresholds
    const threshold = this.thresholds[name];
    if (threshold) {
      if (metric.duration > threshold.error) {
        console.error(`Performance error: ${name} took ${metric.duration}ms (threshold: ${threshold.error}ms)`);
      } else if (metric.duration > threshold.warning) {
        console.warn(`Performance warning: ${name} took ${metric.duration}ms (threshold: ${threshold.warning}ms)`);
      }
    }

    // Track the metric
    analytics.trackEvent('PERFORMANCE_METRIC', {
      metricName: name,
      duration: metric.duration,
      exceededWarning: threshold?.warning && metric.duration > threshold.warning,
      exceededError: threshold?.error && metric.duration > threshold.error,
      ...metric.metadata,
    });

    this.metrics.delete(name);
  }

  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startMetric(name, metadata);
    try {
      const result = await fn();
      this.endMetric(name);
      return result;
    } catch (error) {
      this.endMetric(name, { error: error.message });
      throw error;
    }
  }

  measure<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startMetric(name, metadata);
    try {
      const result = fn();
      this.endMetric(name);
      return result;
    } catch (error) {
      this.endMetric(name, { error: error.message });
      throw error;
    }
  }

  async runAfterInteractions(
    name: string,
    task: () => Promise<void>,
    metadata?: Record<string, any>
  ): Promise<void> {
    this.startMetric(name, { ...metadata, type: 'interaction' });
    
    await InteractionManager.runAfterInteractions(async () => {
      try {
        await task();
      } catch (error) {
        console.error(`Error in interaction task ${name}:`, error);
        this.endMetric(name, { error: error.message });
        throw error;
      }
    });

    this.endMetric(name);
  }

  setThreshold(name: string, warning: number, error: number): void {
    this.thresholds[name] = { warning, error };
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  getAverageMetric(name: string, sampleSize: number = 10): number | null {
    const metrics = this.getMetrics()
      .filter(m => m.name === name && m.duration !== undefined)
      .slice(-sampleSize);

    if (metrics.length === 0) return null;

    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / metrics.length;
  }
}

export const performanceMonitor = new PerformanceMonitor();
