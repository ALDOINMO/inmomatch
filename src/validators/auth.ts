import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(6),
  licenseNumber: z.string().min(3),
  realEstateName: z.string().min(2),
  realEstatePhone: z.string().min(6),
  realEstateAddress: z.string().min(4),
  neighborhood: z.string().optional(),
  city: z.string().min(2),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});
