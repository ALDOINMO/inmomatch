import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest
) {
  const provincia =
    request.nextUrl.searchParams.get(
      "provincia"
    );

  const departamento =
    request.nextUrl.searchParams.get(
      "departamento"
    );

  if (
    !provincia ||
    !departamento
  ) {
    return NextResponse.json({
      localidades: [],
    });
  }

  const response =
    await fetch(
      `https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(
        provincia
      )}&departamento=${encodeURIComponent(
        departamento
      )}&max=1000`
    );

  const data =
    await response.json();

  return NextResponse.json(
    data
  );
}