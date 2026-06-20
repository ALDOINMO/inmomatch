import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function AgendaPage() {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <div>
        <h1 className="text-2xl font-semibold">
          Agenda
        </h1>

        <p className="mt-2 text-muted">
          Gestioná visitas, captaciones,
          reservas y escrituras.
        </p>
      </div>
    </AppShell>
  );
}