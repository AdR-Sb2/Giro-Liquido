"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function formatMinutes(value: number | null | undefined) {
  const minutes = Number(value ?? 0);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "0h 00min";
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${String(rest).padStart(2, "0")}min`;
}

type SessionLike = {
  id?: string;
  started_at?: string;
  ended_at?: string | null;
} | null;

export function TurnControls({ activeSession }: { activeSession: SessionLike }) {
  const sessionSeconds = activeSession?.started_at
    ? Math.max(0, (Date.now() - new Date(activeSession.started_at).getTime()) / 1000)
    : 0;

  if (activeSession) {
    return (
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Turno ativo</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{formatMinutes(Math.max(0, sessionSeconds / 60))}</h3>
          </div>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Finalizar turno</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Turno não iniciado</h3>
        </div>
        <Button asChild>
          <Link href="/dashboard">Iniciar turno</Link>
        </Button>
      </div>
    </Card>
  );
}
