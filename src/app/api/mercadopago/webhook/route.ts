import { NextRequest, NextResponse } from "next/server";

import MercadoPagoConfig, {
  Payment,
} from "mercadopago";

import { prisma } from "@/lib/prisma";

const client =
  new MercadoPagoConfig({
    accessToken:
      process.env
        .MERCADOPAGO_ACCESS_TOKEN!,
  });

export async function POST(
  req: NextRequest
) {
  try {
    const body =
      await req.json();

    console.log(
      "WEBHOOK MP:",
      body
    );

    if (
      body.type !==
      "payment"
    ) {
      return NextResponse.json({
        ok: true,
      });
    }

    const payment =
      new Payment(client);

    const paymentData =
      await payment.get({
        id: body.data.id,
      });

    console.log(
      "PAYMENT:",
      paymentData
    );

    if (
      paymentData.status !==
      "approved"
    ) {
      return NextResponse.json({
        ok: true,
      });
    }

    const realEstateId =
      paymentData.external_reference;

    if (!realEstateId) {
      return NextResponse.json(
        {
          error:
            "Sin realEstateId",
        },

        {
          status: 400,
        }
      );
    }

    const currentDate =
      new Date();

    const expiresAt =
      new Date(
        currentDate.getTime() +
          30 *
            24 *
            60 *
            60 *
            1000
      );

    await prisma.realEstate.update(
      {
        where: {
          id: realEstateId,
        },

        data: {
          status: "ACTIVE",

          membershipExpiresAt:
            expiresAt,
        },
      }
    );

    await prisma.membership.create(
      {
        data: {
          realEstateId,

          amount: 25000,

          currency: "ARS",

          provider:
            "MERCADOPAGO",

          providerReference:
            String(
              paymentData.id
            ),

          status: "APPROVED",

          expiresAt,
        },
      }
    );

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: true,
      },

      {
        status: 500,
      }
    );
  }
}