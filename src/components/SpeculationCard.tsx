"use client";

import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import type { Speculation } from "@/data/mockData";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("fr-FR").format(value);

export default function SpeculationCard({
  speculation,
  onDelete,
}: {
  speculation: Speculation;
  onDelete?: (id: number) => void;
}) {
  const result =
    speculation.sales - speculation.expenses;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link
        href={`/speculations/${speculation.id}`}
        className="grid min-w-0 flex-1 items-center gap-5 md:grid-cols-[2fr_1fr_1fr_1fr_auto]"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-4xl">
            {speculation.emoji}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-gray-900">
              {speculation.name}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Campagne {speculation.campaign} ·{" "}
              {speculation.surface} ha
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase text-gray-400">
            Dépenses
          </p>

          <p className="mt-1 font-bold text-red-600">
            {formatMoney(speculation.expenses)}
          </p>

          <p className="text-[10px] text-gray-400">
            FCFA
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase text-gray-400">
            Ventes
          </p>

          <p className="mt-1 font-bold text-green-700">
            {formatMoney(speculation.sales)}
          </p>

          <p className="text-[10px] text-gray-400">
            FCFA
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase text-gray-400">
            Résultat
          </p>

          <p
            className={`mt-1 font-bold ${
              result >= 0
                ? "text-green-700"
                : "text-red-600"
            }`}
          >
            {result > 0 ? "+" : ""}
            {formatMoney(result)}
          </p>

          <p className="text-[10px] text-gray-400">
            FCFA
          </p>
        </div>

        <ChevronRight
          size={20}
          className="text-gray-400"
        />
      </Link>

      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            const confirmed = window.confirm(
              `Supprimer ${speculation.name} ?`
            );

            if (confirmed) {
              onDelete(speculation.id);
            }
          }}
          className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          title="Supprimer"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}