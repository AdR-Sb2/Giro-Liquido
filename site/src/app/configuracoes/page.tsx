"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  QUICK_EARNING_VALUES_KEY,
  QUICK_FUEL_VALUES_KEY,
  getDefaultEarningValues,
  getDefaultFuelValues,
  getStoredQuickValues,
  persistQuickValues,
} from "@/lib/quick-values";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ConfiguracoesPage() {
  const [fuelValues, setFuelValues] = useState<number[]>(getDefaultFuelValues());
  const [earningValues, setEarningValues] = useState<number[]>(getDefaultEarningValues());
  const [newFuelValue, setNewFuelValue] = useState("");
  const [newEarningValue, setNewEarningValue] = useState("");

  useEffect(() => {
    setFuelValues(getStoredQuickValues(QUICK_FUEL_VALUES_KEY, getDefaultFuelValues()));
    setEarningValues(getStoredQuickValues(QUICK_EARNING_VALUES_KEY, getDefaultEarningValues()));
  }, []);

  function updateFuelValues(nextValues: number[]) {
    setFuelValues(nextValues);
    persistQuickValues(QUICK_FUEL_VALUES_KEY, nextValues);
  }

  function updateEarningValues(nextValues: number[]) {
    setEarningValues(nextValues);
    persistQuickValues(QUICK_EARNING_VALUES_KEY, nextValues);
  }

  function addFuelValue() {
    const numeric = Number(newFuelValue);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return;
    }

    updateFuelValues([...fuelValues, numeric]);
    setNewFuelValue("");
  }

  function addEarningValue() {
    const numeric = Number(newEarningValue);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return;
    }

    updateEarningValues([...earningValues, numeric]);
    setNewEarningValue("");
  }

  return (
    <AppShell title="Configurações">
      <div className="space-y-4">
        <Card className="p-5">
          <p className="text-sm text-slate-400">Perfil</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Dados pessoais e contato</h3>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <p className="text-sm text-slate-400">Atalhos de abastecimento</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Valores rápidos</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {fuelValues.map((value, index) => (
              <div key={`${value}-${index}`} className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">
                <span>{formatCurrency(value)}</span>
                <button
                  type="button"
                  aria-label={`Remover ${formatCurrency(value)}`}
                  onClick={() => updateFuelValues(fuelValues.filter((item) => item !== value))}
                  className="text-xs text-slate-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              value={newFuelValue}
              onChange={(event) => setNewFuelValue(event.target.value)}
              placeholder="Ex.: 25"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-brand-400"
            />
            <Button type="button" onClick={addFuelValue}>Adicionar</Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <p className="text-sm text-slate-400">Lançamento rápido</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Valores rápidos de ganho</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {earningValues.map((value, index) => (
              <div key={`${value}-${index}`} className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">
                <span>{formatCurrency(value)}</span>
                <button
                  type="button"
                  aria-label={`Remover ${formatCurrency(value)}`}
                  onClick={() => updateEarningValues(earningValues.filter((item) => item !== value))}
                  className="text-xs text-slate-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              value={newEarningValue}
              onChange={(event) => setNewEarningValue(event.target.value)}
              placeholder="Ex.: 25"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-brand-400"
            />
            <Button type="button" onClick={addEarningValue}>Adicionar</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
