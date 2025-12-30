
import { WorkoutType, PhaseType, WorkoutSession } from './types';

export const INITIAL_USER_PROFILE = {
  name: "Athlete",
  weight: 175,
  maxSquat: 345,
  maxDeadlift: 386,
  maxBench: 245,
  maxMileSeconds: 465, // 7:45
  hrZone2Low: 146,
  hrZone2High: 160,
  hrZone5: 190,
  startDate: new Date().toISOString(),
};

export const PHASES = [
  { id: PhaseType.AEROBIC_BASE, name: "P1: Aerobic Base", weeks: [1, 8], description: "Expand blood volume & tendon stiffness. High volume, low intensity." },
  { id: PhaseType.STRENGTH_THRESHOLD, name: "P2: Strength & Threshold", weeks: [9, 20], description: "Force production & Lactic tolerance. Heavier weights, uncomfortable cardio." },
  { id: PhaseType.PEAK, name: "P3: The Peak", weeks: [21, 32], description: "Peak Power & PR attempts. Short duration, maximum intensity." },
  { id: PhaseType.WASHOUT, name: "P4: The Washout", weeks: [33, 36], description: "Systemic recovery & Fatigue drop. Dumbbells only, training by feel." },
  { id: PhaseType.RECALIBRATION, name: "P5: Re-calibration", weeks: [37, 52], description: "Re-test maxes & initiate new 52-week cycle." }
];

export const getWorkoutForDay = (phase: PhaseType, week: number, day: string, profile: any): WorkoutSession => {
  const isPhase1Deload = week === 4 || week === 8;
  const isPhase2Deload = week === 14;
  const isDeload = isPhase1Deload || isPhase2Deload;

  let p1StrengthBonus = 0;
  if (phase === PhaseType.AEROBIC_BASE && week >= 5 && week <= 7) {
    p1StrengthBonus = (week - 4) * 5;
  }

  switch (phase) {
    case PhaseType.AEROBIC_BASE:
      switch (day) {
        case 'Monday':
          return {
            title: "Lower Body Hypertrophy & Flush",
            type: WorkoutType.STRENGTH,
            description: "High volume focus. Strictly 3 min rest.",
            movements: [
              { name: "Warmup: Air Bike & Calisthenics", reps: "10 min", isSkill: true },
              { 
                name: "Low Bar Back Squat", 
                prescribed: `${Math.round(profile.maxSquat * (isDeload ? 0.5 : 0.7)) + p1StrengthBonus} lbs`, 
                reps: "3x8", 
                rpe: 7,
                warmups: [{ weight: "135", reps: "10" }, { weight: "185", reps: "5" }]
              },
              { name: "DB Walking Lunges", prescribed: "35 lb DBs", reps: "3x12/leg" },
              { name: "Leg Extensions", reps: "3x15", rpe: 7 }
            ],
            cardio: { activity: "Bike Erg Flush", durationMinutes: 15, targetHr: "130-140 bpm", notes: "Zone 1. Constant RPM. Do not sprint." }
          };
        case 'Tuesday':
          return {
            title: "Upper Push/Pull & Row Volume",
            type: WorkoutType.HYBRID,
            description: "Aerobic power and antagonist strength balance.",
            movements: [
              { name: "Warmup: Band Pull-aparts & Pushups", reps: "10 min", isSkill: true },
              { 
                name: "Bench Press", 
                prescribed: `${Math.round(profile.maxBench * (isDeload ? 0.5 : 0.7)) + p1StrengthBonus} lbs`, 
                reps: "3x8",
                warmups: [{ weight: "135", reps: "10" }, { weight: "155", reps: "5" }]
              },
              { name: "Pendlay Row", prescribed: "135 lbs", reps: "3x10", notes: "Strict form, back parallel." },
              { name: "DB Overhead Press", prescribed: "40 lbs", reps: "3x10" },
              { name: "Face Pulls", reps: "3x15" }
            ],
            cardio: { activity: "Row Erg Intervals", durationMinutes: 20, pace: "2:15/500m", targetHr: "<140 bpm recovery", notes: "5 x 500m. 1:00 rest." }
          };
        case 'Wednesday':
          let baseMinutes = 35;
          if (week === 2) baseMinutes = 40;
          if (week === 3) baseMinutes = 45;
          if (week === 4) baseMinutes = 30;
          if (week >= 5 && week <= 7) baseMinutes = 45 + (week - 4) * 5;
          if (week === 8) baseMinutes = 30;

          return {
            title: "Pure Zone 2 Endurance",
            type: WorkoutType.ENDURANCE,
            description: "Strict limit: 146-160 bpm. Walk if HR hits 162.",
            movements: [],
            cardio: { activity: "Outdoor Run", durationMinutes: baseMinutes, targetHr: "146-160 bpm", notes: "Run as slow as needed to maintain HR zone." }
          };
        case 'Thursday':
          return {
            title: "Athleticism & Flow",
            type: WorkoutType.METCON,
            description: "20 Min AMRAP. 70% effort. Nasal breathing only.",
            movements: [
              { name: "Double Unders (Skill)", reps: "10 min EMOM", isSkill: true },
              { name: "Power Clean", prescribed: "135 lbs", reps: "5x3", notes: "Perfect technique, fast elbows." }
            ],
            cardio: { activity: "Aerobic Flow (AMRAP)", durationMinutes: 20, notes: "200m Run, 10 T2B, 15 KB Swings (53lb)." }
          };
        case 'Friday':
          return {
            title: "Full Body Hypertrophy (Pump)",
            type: WorkoutType.STRENGTH,
            description: "Bodybuilding focus. Antagonist supersets.",
            movements: [
              { name: "Incline DB Bench Press", prescribed: "55 lbs", reps: "4x10-12" },
              { name: "Weighted Pull-ups", prescribed: "BW or +10 lbs", reps: "4x5-8" },
              { name: "Romanian Deadlift", prescribed: "185 lbs", reps: "3x10" },
              { name: "DB Lateral Raises", prescribed: "20 lbs", reps: "3x15" },
              { name: "EZ Bar Bicep Curls", reps: "3x12", isSkill: false },
              { name: "Tricep Rope Pushdowns", reps: "3x15", isSkill: false },
              { name: "Hanging Leg Raise", reps: "3x15", isSkill: false }
            ]
          };
        case 'Saturday':
          return {
            title: "Long Aerobic Session",
            type: WorkoutType.ENDURANCE,
            description: "45 Minutes Continuous Mixed Movement.",
            movements: [],
            cardio: { activity: "Row/Bike/Ski/Run", durationMinutes: 45, targetHr: "150 bpm average", notes: "10m Row, 10m Bike, 10m Ski, 10m Run, 5m Cooldown." }
          };
        default: return { title: "Mandatory Recovery", type: WorkoutType.RECOVERY, description: "30 mins Yoga flow or static stretching.", movements: [{ name: "Yoga Flow", reps: "30 min", isSkill: true }] };
      }

    case PhaseType.STRENGTH_THRESHOLD:
      let p2SquatWeight = 295;
      if (week >= 13 && week <= 16) p2SquatWeight = 305;
      if (week >= 17 && week <= 19) p2SquatWeight = 315;

      switch (day) {
        case 'Monday':
          return {
            title: "Heavy Lower Session",
            type: WorkoutType.STRENGTH,
            description: "Absolute force production.",
            movements: [
              { name: "Box Jumps (Warmup)", reps: "3x5", isSkill: true },
              { 
                name: "Back Squat", 
                prescribed: `${isDeload ? Math.round(p2SquatWeight * 0.7) : p2SquatWeight} lbs`, 
                reps: "5x3", 
                notes: "Rest 3-5 mins.",
                warmups: [{ weight: "135", reps: "10" }, { weight: "225", reps: "5" }, { weight: "275", reps: "3" }]
              },
              { name: "Deadlift", prescribed: `${isDeload ? 230 : 325} lbs`, reps: "3x3", notes: "Full reset every rep. No bouncing." },
              { name: "Bulgarian Split Squats", prescribed: "40 lbs", reps: "3x8/leg" }
            ]
          };
        case 'Tuesday':
          const intervals = week >= 13 ? "3 x 10 Minutes" : "3 x 8 Minutes";
          return {
            title: "Threshold Intervals",
            type: WorkoutType.ENDURANCE,
            description: "Lactic tolerance. 2 min walking rest.",
            movements: [],
            cardio: { activity: "Running (Track)", durationMinutes: week >= 13 ? 40 : 35, pace: "8:45-9:00 / mile", notes: `${intervals}. Target sustained pace.` }
          };
        case 'Wednesday':
          return {
            title: "Heavy Upper Session",
            type: WorkoutType.STRENGTH,
            description: "Standing overhead press and weighted pulls.",
            movements: [
              { name: "Strict Overhead Press", prescribed: "105 lbs", reps: "5x5" },
              { name: "Weighted Pull-ups", prescribed: "BW + 25 lbs", reps: "5x3" },
              { name: "Weighted Dips", reps: "3x10" },
              { name: "Single Arm DB Row", prescribed: "70 lbs", reps: "3x10" }
            ]
          };
        case 'Thursday':
          return {
            title: "Dynamic Effort & MetCon",
            type: WorkoutType.METCON,
            description: "Speed work + Lactic Bath.",
            movements: [
              { name: "Power Snatch", prescribed: "95 lbs", reps: "6x2", notes: "Rest 45s between sets." }
            ],
            cardio: { activity: "Lactic Bath (5 RFT)", durationMinutes: 15, notes: "15 Wall Balls, 12 Box Jumps, 9 Burpees over Box." }
          };
        case 'Friday':
          return {
            title: "Prehab & Accessory",
            type: WorkoutType.STRENGTH,
            description: "4 Rounds Circuit for quality.",
            movements: [
              { name: "SL RDL (KB)", reps: "4x10/leg" },
              { name: "Copenhagen Plank", reps: "4x30s/side", isSkill: true },
              { name: "Z-Press", reps: "4x10", notes: "Seated on floor." },
              { name: "Pallof Press", reps: "4x12/side" }
            ]
          };
        case 'Saturday':
          return {
            title: "Tempo Run",
            type: WorkoutType.ENDURANCE,
            description: "Uncomfortable but sustainable.",
            movements: [],
            cardio: { activity: "4 Mile Run", durationMinutes: 40, pace: "8:15-8:30 pace", notes: "Mile 1 warm, Mile 2-3 Tempo, Mile 4 cool." }
          };
        default: return { title: "Mandatory Rest", type: WorkoutType.RECOVERY, description: "Total rest. Focused recovery.", movements: [] };
      }

    case PhaseType.PEAK:
      let targetWeight = profile.maxSquat * 0.9;
      if (week >= 25) targetWeight = profile.maxSquat * 0.95;
      if (week >= 30) targetWeight = profile.maxSquat + 5;

      switch (day) {
        case 'Monday':
          return {
            title: "Max Effort Lower + Alactic Power",
            type: WorkoutType.STRENGTH,
            description: "Peak neurological recruitment.",
            movements: [
              { 
                name: "Back Squat", 
                prescribed: `${Math.round(targetWeight)} lbs`, 
                reps: "Build to Heavy 2",
                warmups: [{ weight: "135", reps: "10" }, { weight: "225", reps: "5" }, { weight: "275", reps: "3" }, { weight: "315", reps: "1" }]
              }
            ],
            cardio: { activity: "Assault Bike Sprints", durationMinutes: 20, notes: "10 Rounds: 20s MAX / 1:40 rest." }
          };
        case 'Tuesday':
          return {
            title: "Track Speed (VO2 Max)",
            type: WorkoutType.ENDURANCE,
            description: "400m Repeats. 1:1 work:rest ratio.",
            movements: [],
            cardio: { activity: "8 x 400m", durationMinutes: 30, pace: "1:50-1:55/lap", notes: "7:20-7:40 mile pace equivalent." }
          };
        case 'Wednesday':
          return {
            title: "Max Effort Upper & Benchmark",
            type: WorkoutType.HYBRID,
            description: "Bench Press Single + CrossFit Fran.",
            movements: [
              { 
                name: "Bench Press", 
                prescribed: `${Math.round(profile.maxBench * 0.95)} lbs`, 
                reps: "Build to Single",
                warmups: [{ weight: "135", reps: "10" }, { weight: "185", reps: "5" }, { weight: "225", reps: "1" }]
              },
              { name: "Thrusters", prescribed: "95 lbs", reps: "21-15-9" },
              { name: "Pull-ups", reps: "21-15-9" }
            ]
          };
        case 'Friday':
          return {
            title: "Olympic Lifting & Plyos",
            type: WorkoutType.STRENGTH,
            description: "Explosiveness and landing mechanics.",
            movements: [
              { name: "Clean & Jerk", prescribed: "185 lbs", reps: "10x1 EMOM" },
              { name: "Depth Jumps", reps: "4x5", notes: "Off 12\" box." },
              { name: "Broad Jumps", reps: "4x3", notes: "Max distance." }
            ]
          };
        case 'Saturday':
          let simActivity = "5k Run for Time";
          if (week >= 25) simActivity = "Murph (Partitioned)";
          if (week >= 29) simActivity = "1 Mile Run Time Trial";
          return {
            title: "Simulation Day (Game Day)",
            type: WorkoutType.ENDURANCE,
            description: "PR Attempt / High Intensity simulation.",
            movements: [],
            cardio: { activity: simActivity, durationMinutes: 45, notes: "Race effort. Leave it all out there." }
          };
        default: return { title: "Active Flush", type: WorkoutType.RECOVERY, description: "Very low intensity spin or swim.", movements: [], cardio: { activity: "Recovery Protocol", durationMinutes: 45 } };
      }

    case PhaseType.WASHOUT:
      return { 
        title: "Washout Recovery", 
        type: WorkoutType.RECOVERY, 
        description: "Drop all fatigue. Dumbbells only, nothing over 50lbs.", 
        movements: [
          { name: "Nature Walk/Hike", reps: "30-45 min", isSkill: true },
          { name: "DB Pump (Light)", reps: "3x20" }
        ] 
      };

    default:
      return { title: "Re-Calibration Week", type: WorkoutType.RECOVERY, description: "Re-test all baseline maxes.", movements: [{ name: "1RM Testing", reps: "Squat/Dead/Bench/Mile", isSkill: true }] };
  }
};
