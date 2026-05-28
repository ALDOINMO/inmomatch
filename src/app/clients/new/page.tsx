import { AppShell } from "@/components/app-shell";
import { ClientForm } from "@/components/client-form";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";

export default async function NewClientPage() {
  const user = await requireUser();
  return (
    <AppShell user={user}>
      <Card>
        <h2 className="mb-1 text-2xl font-semibold">Nuevo cliente</h2>
        <p className="mb-6 text-sm text-muted">Cargá hasta 4 zonas como localidades separadas por coma y el sistema recalculará matches.</p>
        <ClientForm />
      </Card>
    </AppShell>
  );
}
