// src/types/streak.ts
export interface StreakData {
    totalDays: number;
    message: string;
    streakDays: boolean[];  // Array of 7 booleans representing each day's completion
    userName: string;
  }
  
  export interface StreakIconProps {
    isActive: boolean;
    size?: number;
  }
  
  export interface StreakConnectorProps {
    isActive: boolean;
    animated?: boolean;
  }