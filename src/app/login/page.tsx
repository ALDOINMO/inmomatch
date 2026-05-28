import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-accent text-slate-950"><Building2 size={20} /></div>
          <div>
            <h1 className="text-xl font-semibold">InmoMatch</h1>
            <p className="text-sm text-muted">Ingreso seguro para inmobiliarias</p>
          </div>
        </div>
        <LoginForm />
      </Card>
    </main>
  );
}
