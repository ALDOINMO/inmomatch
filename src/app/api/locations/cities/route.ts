import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest
) {
  const province =
    request.nextUrl.searchParams.get(
      "province"
    );

  const department =
    request.nextUrl.searchParams.get(
      "department"
    );

  if (
    !province ||
    !department
  ) {
    return NextResponse.json({
      cities: [],
    });
  }

  const cities =
    await prisma.location.findMany({
      where: {
        province,
        department,
      },

      orderBy: {
        city: "asc",
      },

      select: {
        city: true,
      },
    });

  return NextResponse.json({
    cities,
  });
}