"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function approveRealEstateAction(realEstateId: string) {
  await requireUser([Role.SUPER_ADMIN]);
  await prisma.realEstate.update({ where: { id: realEstateId }, data: { status: "ACTIVE" } });
  await prisma.user.updateMany({ where: { realEstateId }, data: { status: "ACTIVE" } });
  revalidatePath("/admin");
}

export async function extendMembershipAction(realEstateId: string) {
  const user = await requireUser([Role.SUPER_ADMIN]);
  const until = addDays(new Date(), 30);
  await prisma.realEstate.update({ where: { id: realEstateId }, data: { membershipExpiresAt: until } });
  await prisma.membership.create({ data: { realEstateId, userId: user.id, activeUntil: until, notes: "Extension manual de 30 dias" } });
  revalidatePath("/admin");
}

export async function reactivatePropertyAction(propertyId: string) {
  await requireUser([Role.SUPER_ADMIN]);
  await prisma.property.update({ where: { id: propertyId }, data: { status: "ACTIVE", rejectionCount90: 0 } });
  revalidatePath("/admin");
}
