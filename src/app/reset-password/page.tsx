import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ResetForm } from "@/components/auth/reset-form";

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold">Recuperar contraseña</h1>
        <p className="mb-6 mt-1 text-sm text-muted">Supabase enviara un enlace seguro al email indicado.</p>
        <ResetForm />
        <Link href="/login" className="mt-4 block text-sm text-muted">Volver al login</Link>
      </Card>
    </main>
  );
}
