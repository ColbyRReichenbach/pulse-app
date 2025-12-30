
export enum WorkoutType {
  STRENGTH = 'Strength',
  ENDURANCE = 'Endurance',
  METCON = 'MetCon',
  RECOVERY = 'Recovery',
  HYBRID = 'Hybrid'
}

export enum PhaseType {
  AEROBIC_BASE = 1,
  STRENGTH_THRESHOLD = 2,
  PEAK = 3,
  WASHOUT = 4,
  RECALIBRATION = 5
}

export interface UserProfile {
  name: string;
  weight: number;
  maxSquat: number;
  maxDeadlift: number;
  maxBench: number;
  maxMileSeconds: number;
  hrZone2Low: number;
  hrZone2High: number;
  hrZone5: number;
  startDate: string; // ISO string
}

export interface Movement {
  name: string;
  prescribed?: string;
  reps?: string;
  sets?: number;
  rpe?: number;
  notes?: string;
  isSkill?: boolean; // New: To distinguish skill/warmup from load-bearing sets
}

export interface WorkoutSession {
  title: string;
  type: WorkoutType;
  description: string;
  movements: Movement[];
  cardio?: {
    activity: string;
    durationMinutes: number;
    targetHr?: string;
    pace?: string;
    notes?: string;
  };
}

export interface StrengthEntry {
  exercise: string;
  isSkill: boolean;
  sets: { weight: number; reps: number; completed: boolean }[];
}

export interface CardioEntry {
  activity: string;
  distanceMeters?: number;
  durationSeconds: number;
  avgHr?: number;
  peakHr?: number;
  splits?: { distance: number; time: number }[];
}

export interface MetConEntry {
  format: string;
  rounds: number;
  reps: number;
  notes?: string;
}

export interface PerformanceData {
  strength?: StrengthEntry[];
  cardio?: CardioEntry;
  metcon?: MetConEntry;
  recoveryNote?: string;
  yogaDone?: boolean;
  syncedFromWatch: boolean;
  timestamp: string;
}

export interface WorkoutLog {
  week: number;
  day: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  performanceData?: PerformanceData;
}

export interface UserProgress {
  currentWeek: number;
  completedWorkouts: Record<string, WorkoutLog>; // Key: date (YYYY-MM-DD)
}

// AI Specific Types
export interface AIInsight {
  message: string;
  chartData?: any[];
  chartType?: 'BAR' | 'LINE' | 'AREA';
  recommendation?: string;
  isPR?: boolean;
}
