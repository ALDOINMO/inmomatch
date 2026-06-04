import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response =
      await fetch(
        "https://apis.datos.gob.ar/georef/api/provincias"
      );

    const data =
      await response.json();

    return NextResponse.json(
      data
    );
  } catch {
    return NextResponse.json(
      {
        provincias: [],
      },
      {
        status: 500,
      }
    );
  }
}