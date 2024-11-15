// src/types/progress.ts
export interface ProgressBarProps {
    progress: number;
    showLabel?: boolean;
  }
  
  export interface CircularProgressProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
  }