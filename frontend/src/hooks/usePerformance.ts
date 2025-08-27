import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  timestamp: number;
}

interface UsePerformanceOptions {
  componentName?: string;
  logToConsole?: boolean;
  threshold?: number; // milliseconds
}

export function usePerformance(options: UsePerformanceOptions = {}) {
  const {
    componentName = 'Component',
    logToConsole = process.env.NODE_ENV === 'development',
    threshold = 16, // 60fps threshold
  } = options;

  const renderStartTime = useRef<number>(0);
  const metrics = useRef<PerformanceMetrics[]>([]);

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    const timestamp = Date.now();
    
    const metric: PerformanceMetrics = {
      renderTime,
      timestamp,
    };

    // Get memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metric.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    metrics.current.push(metric);

    // Keep only last 100 metrics
    if (metrics.current.length > 100) {
      metrics.current = metrics.current.slice(-100);
    }

    if (logToConsole && renderTime > threshold) {
      console.warn(
        `🚨 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
      );
    }

    return metric;
  }, [componentName, logToConsole, threshold]);

  const getAverageRenderTime = useCallback(() => {
    if (metrics.current.length === 0) return 0;
    const total = metrics.current.reduce((sum, m) => sum + m.renderTime, 0);
    return total / metrics.current.length;
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize / 1024 / 1024, // MB
        total: memory.totalJSHeapSize / 1024 / 1024, // MB
        limit: memory.jsHeapSizeLimit / 1024 / 1024, // MB
      };
    }
    return null;
  }, []);

  const clearMetrics = useCallback(() => {
    metrics.current = [];
  }, []);

  // Auto-start render timing on mount
  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  }, [startRender, endRender]);

  return {
    startRender,
    endRender,
    getAverageRenderTime,
    getMemoryUsage,
    clearMetrics,
    metrics: metrics.current,
  };
}

// Hook for measuring specific operations
export function useOperationTimer(operationName: string) {
  const startTime = useRef<number>(0);

  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = useCallback(() => {
    const duration = performance.now() - startTime.current;
    if (process.env.NODE_ENV === 'development') {
      console.log(`${operationName} took ${duration.toFixed(2)}ms`);
    }
    return duration;
  }, [operationName]);

  return { start, end };
}

// Hook for detecting performance issues
export function usePerformanceMonitor() {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fps = useRef(60);

  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime.current >= 1000) {
        fps.current = frameCount.current;
        frameCount.current = 0;
        lastTime.current = currentTime;

        if (fps.current < 30 && process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ Low FPS detected: ${fps.current}`);
        }
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return { fps: fps.current };
}
