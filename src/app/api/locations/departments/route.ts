import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest
) {
  const province =
    request.nextUrl.searchParams.get(
      "province"
    );

  if (!province) {
    return NextResponse.json({
      departments: [],
    });
  }

  const departments =
    await prisma.location.findMany({
      where: {
        province,
      },

      distinct: [
        "department",
      ],

      orderBy: {
        department: "asc",
      },

      select: {
        department: true,
      },
    });

  return NextResponse.json({
    departments,
  });
}