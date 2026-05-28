"use server";

import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, resetPasswordSchema } from "@/validators/auth";

export async function loginAction(input: unknown) {
  const data = loginSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function registerAction(input: unknown) {
  const data = registerSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const { data: auth, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { firstName: data.firstName, lastName: data.lastName } },
  });
  if (error || !auth.user) {
  console.log(error);
  return { error: error?.message ?? "No se pudo crear el usuario." };
}

  const realEstate = await prisma.realEstate.create({
    data: {
      name: data.realEstateName,
      phone: data.realEstatePhone,
      address: data.realEstateAddress,
      neighborhood: data.neighborhood,
      city: data.city,
      professionalLicense: data.licenseNumber,
    },
  });

  const user = await prisma.user.create({
    data: {
      authUserId: auth.user.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      role: Role.ADMIN_REAL_ESTATE,
      realEstateId: realEstate.id,
    },
  });

  await prisma.realEstate.update({ where: { id: realEstate.id }, data: { ownerId: user.id } });
  return { ok: true };
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPasswordAction(input: unknown) {
  const data = resetPasswordSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });
  if (error) return { error: error.message };
  return { ok: true };
}
