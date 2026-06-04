import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest
) {
  const provincia =
    request.nextUrl.searchParams.get(
      "provincia"
    );

  if (!provincia) {
    return NextResponse.json(
      {
        departamentos: [],
      }
    );
  }

  const response =
    await fetch(
      `https://apis.datos.gob.ar/georef/api/departamentos?provincia=${encodeURIComponent(
        provincia
      )}&max=500`
    );

  const data =
    await response.json();

  return NextResponse.json(
    data
  );
}