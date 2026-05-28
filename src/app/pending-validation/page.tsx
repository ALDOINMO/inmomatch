export default function PendingValidationPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-xl rounded-2xl border border-border bg-background p-10 text-center">
        <h1 className="text-3xl font-semibold">
          Cuenta pendiente de validación
        </h1>

        <p className="mt-4 text-muted">
          Tu matrícula y tu inmobiliaria
          todavía están siendo revisadas
          por el equipo de InmoMatch.
        </p>

        <p className="mt-2 text-sm text-muted">
          Cuando se apruebe la validación
          tendrás acceso completo a la
          plataforma.
        </p>
      </div>
    </main>
  );
}