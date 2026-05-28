import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10">
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Alta profesional</h1>
          <p className="mt-1 text-sm text-muted">La cuenta queda pendiente hasta que el Super Admin valide la matricula.</p>
        </div>
        <RegisterForm />
      </Card>
    </main>
  );
}
