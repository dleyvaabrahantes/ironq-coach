// Mirrors the iOS Codable structs exactly so JSON decodes natively in Swift.

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: string          // "8-10", "12", "AMRAP"
  restSeconds: number
  isCompound: boolean
  tip: string
  muscleGroup: string
}

export interface TrainingDay {
  id: string
  dayIndex: number      // 0 = Mon … 6 = Sun
  isRestDay: boolean
  focusArea: string
  estimatedMinutes: number
  exercises: Exercise[]
}

export interface TrainingPlan {
  days: TrainingDay[]
  weeklyNotes: string
  generatedAt: string   // ISO 8601
}

export interface Macros {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export interface FoodItem {
  id: string
  name: string
  calories: number
  portionDescription: string
}

export interface Meal {
  id: string
  dayIndex: number
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  totalCalories: number
  macros: Macros
  items: FoodItem[]
}

export interface NutritionPlan {
  dailyMacros: Macros
  meals: Meal[]
  hydrationLiters: number
  notes: string
  generatedAt: string
}

export interface CoachPlan {
  version: number       // always 1
  coachName: string
  note: string
  createdAt: string
  trainingPlan: TrainingPlan
  nutritionPlan?: NutritionPlan
}

export interface PublishResult {
  id: string
  url: string
  expiresAt: string
}

// ─── Builder local state ─────────────────────────────────────────────────────

export interface ExerciseTemplate {
  name: string
  muscleGroup: string
  isCompound: boolean
  tip: string
}

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
