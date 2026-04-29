import { z } from 'zod'

// Score validation schema
export const ScoreSchema = z.object({
  score: z.number().min(1).max(45, 'Score must be between 1 and 45 (Stableford)'),
  play_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  course_name: z.string().min(1, 'Course name is required').max(200, 'Course name too long'),
  notes: z.string().max(500, 'Notes too long').optional(),
})

// Auth validation schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
})

// Draw participant validation
export const DrawNumbersSchema = z.object({
  numbers: z.array(z.number().min(1).max(50))
    .length(5, 'Must select exactly 5 numbers')
    .refine((nums) => new Set(nums).size === 5, 'All numbers must be unique'),
})

// Charity contribution validation
export const CharityContributionSchema = z.object({
  percentage: z.number().min(10, 'Minimum contribution is 10%').max(100, 'Maximum is 100%'),
})

// Winner verification validation
export const WinnerVerificationSchema = z.object({
  proof_image_url: z.string().url('Invalid image URL'),
})

// Admin draw configuration
export const DrawConfigSchema = z.object({
  algorithm: z.enum(['random', 'weighted']),
  jackpot_amount: z.number().min(0),
})
