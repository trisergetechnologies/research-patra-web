import { z } from 'zod';
import { ALL_ROLES } from '../config/roles.js';

const email = z.string().trim().toLowerCase().email().max(254);
const name = z.string().trim().min(1).max(100);

export const requestCodeSchema = z.object({ email });

export const verifyCodeSchema = z.object({
  email,
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const updateProfileSchema = z
  .object({ name: name.optional() })
  .strict()
  .refine((d) => Object.keys(d).length > 0, 'Nothing to update');

export const createUserSchema = z.object({
  name,
  email,
  role: z.enum(ALL_ROLES).default('staff'),
});

export const adminUpdateUserSchema = z
  .object({
    name: name.optional(),
    role: z.enum(ALL_ROLES).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, 'Nothing to update');
