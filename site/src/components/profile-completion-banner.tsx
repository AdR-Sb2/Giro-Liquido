import { Button } from "@/components/ui/button";
import { getProgressMessage } from "@/lib/tracking";

type ProfileCompletionBannerProps = {
  percent: number;
  pendingLabels: string[];
};

export function ProfileCompletionBanner({ percent, pendingLabels }: ProfileCompletionBannerProps) {
  if (percent >= 100) {
    return null;
  }

  const pending = pendingLabels.slice(0, 2).join(" e ");

  return (
    <div className="space-y-4 rounded-3xl border border-brand-500/30 bg-brand-500/5 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Complete seu perfil</p>
          <p className="mt-1 text-sm text-slate-300">
            {pending
              ? `Você ainda pode configurar ${pending}.`
              : "Faltam poucos detalhes para o painel ficar completo."}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-brand-300">
          {percent}%
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{getProgressMessage(percent)}</p>
        <Button asChild size="sm" className="justify-center">
          <a href="/onboarding?editar=1">Continuar configuração</a>
        </Button>
      </div>
    </div>
  );
}
