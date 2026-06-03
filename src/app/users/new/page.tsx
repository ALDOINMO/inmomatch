import { AppShell } from "@/components/app-shell";
import { UserForm } from "@/components/user-form";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";

export default async function NewUserPage() {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <Card>
        <h2 className="mb-1 text-2xl font-semibold">
          Nuevo corredor
        </h2>

        <p className="mb-6 text-sm text-muted">
          Creá usuarios para tu inmobiliaria.
        </p>

        <UserForm />
      </Card>
    </AppShell>
  );
}