"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Plus,
  Trash2,
  Sprout,
} from "lucide-react";

import type { Speculation } from "@/data/mockData";
import type { Expense } from "@/data/expenseData";
import type { Sale } from "@/data/saleData";

import {
  getSupabaseSpeculations,
  getSupabaseExpenses,
  getSupabaseSales,
  deleteSupabaseSpeculation,
} from "@/data/supabaseStorage";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("fr-FR").format(value);

export default function SpeculationsPage() {
  const [speculations, setSpeculations] =
    useState<Speculation[]>([]);

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [sales, setSales] =
    useState<Sale[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [
          supabaseSpeculations,
          supabaseExpenses,
          supabaseSales,
        ] = await Promise.all([
          getSupabaseSpeculations(),
          getSupabaseExpenses(),
          getSupabaseSales(),
        ]);

        setSpeculations(
          supabaseSpeculations
        );

        setExpenses(
          supabaseExpenses
        );

        setSales(
          supabaseSales
        );
      } catch (error) {
        console.error(
          "Erreur chargement spéculations :",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const calculatedSpeculations =
    speculations.map(
      (speculation) => {
        const totalExpenses =
          expenses
            .filter(
              (expense) =>
                expense.speculationId ===
                speculation.id
            )
            .reduce(
              (total, expense) =>
                total +
                expense.total,
              0
            );

        const totalSales =
          sales
            .filter(
              (sale) =>
                sale.speculationId ===
                speculation.id
            )
            .reduce(
              (total, sale) =>
                total +
                sale.total,
              0
            );

        return {
          ...speculation,
          expenses:
            totalExpenses,
          sales:
            totalSales,
        };
      }
    );

  const handleDelete = async (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        "Voulez-vous vraiment supprimer cette spéculation ainsi que toutes ses dépenses et ventes ?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSupabaseSpeculation(
        id
      );

      setSpeculations(
        (current) =>
          current.filter(
            (speculation) =>
              speculation.id !== id
          )
      );

      setExpenses(
        (current) =>
          current.filter(
            (expense) =>
              expense.speculationId !==
              id
          )
      );

      setSales(
        (current) =>
          current.filter(
            (sale) =>
              sale.speculationId !==
              id
          )
      );
    } catch (error) {
      console.error(
        "Erreur suppression spéculation :",
        error
      );

      window.alert(
        "Impossible de supprimer la spéculation."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8f7] p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-green-700"
          >
            <ArrowLeft size={18} />
            Retour au Dashboard
          </Link>

          <Link
            href="/speculations/nouvelle"
            className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"
          >
            <Plus size={18} />
            Nouvelle spéculation
          </Link>
        </div>

        {/* TITRE */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-green-700">
            Productions
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Spéculations
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Gérez toutes les cultures enregistrées dans le champ.
          </p>
        </div>

        {/* CHARGEMENT */}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

            <p className="mt-4 text-sm text-gray-500">
              Chargement des spéculations...
            </p>
          </div>
        ) : calculatedSpeculations.length === 0 ? (
          /* AUCUNE SPÉCULATION */

          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Sprout
              size={40}
              className="mx-auto text-green-600"
            />

            <h2 className="mt-3 text-lg font-bold text-gray-900">
              Aucune spéculation
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Ajoutez une première culture pour commencer.
            </p>

            <Link
              href="/speculations/nouvelle"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
            >
              <Plus size={18} />
              Nouvelle spéculation
            </Link>
          </div>
        ) : (
          /* LISTE */

          <div className="grid gap-4 md:grid-cols-2">
            {calculatedSpeculations.map(
              (speculation) => {
                const result =
                  speculation.sales -
                  speculation.expenses;

                return (
                  <div
                    key={speculation.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        href={`/speculations/${speculation.id}`}
                        className="flex items-center gap-4"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 text-4xl">
                          {speculation.emoji}
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-gray-900 hover:text-green-700">
                            {speculation.name}
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            Campagne{" "}
                            {speculation.campaign}
                            {" · "}
                            {speculation.surface} ha
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                              {speculation.status ||
                                "En préparation"}
                            </span>

                            {speculation.manager && (
                              <span className="text-xs text-gray-500">
                                Responsable :{" "}
                                {speculation.manager}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            speculation.id
                          )
                        }
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Supprimer la spéculation"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <Link
                      href={`/speculations/${speculation.id}`}
                      className="mt-5 grid grid-cols-3 gap-3"
                    >
                      <div className="rounded-xl bg-red-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-red-500">
                          Dépenses
                        </p>

                        <p className="mt-1 font-bold text-red-600">
                          {formatMoney(
                            speculation.expenses
                          )}
                        </p>

                        <p className="text-[10px] text-gray-400">
                          FCFA
                        </p>
                      </div>

                      <div className="rounded-xl bg-green-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-green-600">
                          Ventes
                        </p>

                        <p className="mt-1 font-bold text-green-700">
                          {formatMoney(
                            speculation.sales
                          )}
                        </p>

                        <p className="text-[10px] text-gray-400">
                          FCFA
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-gray-500">
                          Résultat
                        </p>

                        <p
                          className={`mt-1 font-bold ${
                            result >= 0
                              ? "text-green-700"
                              : "text-red-600"
                          }`}
                        >
                          {result > 0
                            ? "+"
                            : ""}

                          {formatMoney(
                            result
                          )}
                        </p>

                        <p className="text-[10px] text-gray-400">
                          FCFA
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}