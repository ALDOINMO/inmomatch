import { Resend } from "resend";

export const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function sendNewMatchEmail({
  to,
  score,
  clientName,
  propertyTitle,
  matchId,
}: {
  to: string;
  score: number;
  clientName: string;
  propertyTitle: string;
  matchId: string;
}) {
  try {
    await resend.emails.send({
      from:
        "InmoMatch <onboarding@resend.dev>",

      to,

      subject:
        `🔥 Nuevo Match Premium (${score}%)`,

      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Nuevo Match Premium</h2>

          <p>
            Encontramos una oportunidad
            con <strong>${score}%</strong>
            de compatibilidad.
          </p>

          <p>
            Cliente:
            <strong>${clientName}</strong>
          </p>

          <p>
            Propiedad:
            <strong>${propertyTitle}</strong>
          </p>

          <p>
            <a
              href="https://inmomatch-41hf.vercel.app/matches/${matchId}"
              style="
                background:#2563eb;
                color:white;
                padding:12px 20px;
                text-decoration:none;
                border-radius:8px;
                display:inline-block;
              "
            >
              Ver Match
            </a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error(
      "Error enviando email:",
      error
    );
  }
}