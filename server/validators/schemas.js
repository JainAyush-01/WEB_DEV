const { z } = require('zod');

// User Registration
const userRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  collegeId: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

// Plan
const planSchema = z.object({
  name: z.enum(["monthly", "semester", "yearly"]),
  durationDays: z.number().positive(),
  price: z.number().positive(),
  max_users_limit: z.number().positive(),
  is_seasonal_discount: z.boolean().optional(),
  discount_start: z.string().datetime().optional(),
  discount_end: z.string().datetime().optional(),
  discount_percentage: z.number().min(0).max(100).optional()
});

// Membership Actions
const membershipSubscribeSchema = z.object({
  planId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Plan ID")
});

const membershipFreezeSchema = z.object({
  freeze_days: z.number().int().positive().max(10, "Maximum freeze duration is 10 days")
});

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  planSchema,
  membershipSubscribeSchema,
  membershipFreezeSchema
};
