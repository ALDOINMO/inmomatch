import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest
) {
  const city =
    request.nextUrl.searchParams.get(
      "city"
    );

  if (!city) {
    return NextResponse.json({
      neighborhoods: [],
    });
  }

  const neighborhoods =
    await prisma.neighborhood.findMany({
      where: {
        city,
      },

      orderBy: {
        name: "asc",
      },
    });

  return NextResponse.json({
    neighborhoods,
  });
}