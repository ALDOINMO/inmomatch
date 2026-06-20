import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const provinces =
    await prisma.location.findMany({
      distinct: ["province"],
      orderBy: {
        province: "asc",
      },
      select: {
        province: true,
      },
    });

  return NextResponse.json({
    provinces,
  });
}