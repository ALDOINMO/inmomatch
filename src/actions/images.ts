"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function registerPropertyImageAction(propertyId: string, path: string, publicUrl: string) {
  const user = await requireUser();
  const property = await prisma.property.findUnique({ where: { id: propertyId }, include: { images: true } });
  if (!property) return { error: "Propiedad inexistente." };
  if (user.role !== Role.SUPER_ADMIN && property.realEstateId !== user.realEstateId) return { error: "Sin permiso." };
  await prisma.propertyImage.create({ data: { propertyId, path, publicUrl, sortOrder: property.images.length } });
  revalidatePath(`/properties/${propertyId}`);
}

export async function deletePropertyImageAction(imageId: string) {
  const user = await requireUser();
  const image = await prisma.propertyImage.findUnique({ where: { id: imageId }, include: { property: true } });
  if (!image) return { error: "Imagen inexistente." };
  if (user.role !== Role.SUPER_ADMIN && image.property.realEstateId !== user.realEstateId) return { error: "Sin permiso." };
  const supabase = createSupabaseAdminClient();
  await supabase.storage.from("property-images").remove([image.path]);
  await prisma.propertyImage.delete({ where: { id: imageId } });
  revalidatePath(`/properties/${image.propertyId}`);
}
