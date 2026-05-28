import { NextResponse } from "next/server";

import MercadoPagoConfig, {
  Preference,
} from "mercadopago";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const client =
  new MercadoPagoConfig({
    accessToken:
      process.env
        .MERCADOPAGO_ACCESS_TOKEN!,
  });

export async function POST() {
  try {
    const supabase =
      await createSupabaseServerClient();

    const { data } =
      await supabase.auth.getUser();

    if (!data.user) {
      return NextResponse.json(
        {
          error:
            "No autenticado",
        },

        {
          status: 401,
        }
      );
    }

    const user =
      await prisma.user.findUnique(
        {
          where: {
            authUserId:
              data.user.id,
          },

          include: {
            realEstate: true,
          },
        }
      );

    if (!user?.realEstateId) {
      return NextResponse.json(
        {
          error:
            "Sin inmobiliaria",
        },

        {
          status: 400,
        }
      );
    }

    const preference =
      new Preference(client);

    const response =
      await preference.create({
        body: {
          items: [
            {
              id: "membership",

              title:
                "Membresía InmoMatch",

              quantity: 1,

              currency_id:
                "ARS",

              unit_price: 25000,
            },
          ],

          external_reference:
            user.realEstateId,

          notification_url:
             "https://inmomatch-lilac.vercel.app/api/mercadopago/webhook",
        },
      });

    return NextResponse.json({
      id: response.id,

      init_point:
        response.init_point,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Error MercadoPago",
      },

      {
        status: 500,
      }
    );
  }
}