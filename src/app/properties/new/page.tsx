import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { PropertyForm } from "@/components/property-form";
import { requireUser } from "@/lib/auth";

export default async function NewPropertyPage() {
  const user = await requireUser();
  return (
    <AppShell user={user}>
      <Card>
        <h2 className="mb-1 text-2xl font-semibold">Nueva propiedad</h2>
        <p className="mb-6 text-sm text-muted">Los campos siguen la matriz de carga del formulario: generales, servicios, construccion y campos rurales.</p>
        <PropertyForm />
      </Card>
    </AppShell>
  );
}
