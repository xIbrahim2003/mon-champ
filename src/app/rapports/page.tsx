"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import ReportsChart from "@/components/ReportsChart";
import type {
  Speculation,
} from "@/data/mockData";

import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingCart,
  Trophy,
  BarChart3,
  Download,
} from "lucide-react";


import type {
  Expense,
} from "@/data/expenseData";

import type {
  Sale,
} from "@/data/saleData";

import {
  speculations as defaultSpeculations,
} from "@/data/mockData";

import {
  getSupabaseSpeculations,
  getSupabaseExpenses,
  getSupabaseSales,
} from "@/data/supabaseStorage";

import {
  exportReportToExcel,
} from "@/utils/exportReport";

const formatMoney = (
  value: number
) =>
  new Intl.NumberFormat(
    "fr-FR"
  ).format(value);

export default function RapportsPage() {
  const [
    speculations,
    setSpeculations,
  ] = useState<Speculation[]>([]);

  const [
    expenses,
    setExpenses,
  ] = useState<Expense[]>([]);

  const [
    sales,
    setSales,
  ] = useState<Sale[]>([]);

  useEffect(() => {
  const loadReports = async () => {
    try {
      console.log("=== CHARGEMENT RAPPORTS SUPABASE ===");

      const [
        supabaseSpeculations,
        supabaseExpenses,
        supabaseSales,
      ] = await Promise.all([
        getSupabaseSpeculations(),
        getSupabaseExpenses(),
        getSupabaseSales(),
      ]);

      console.log(
        "SPÉCULATIONS RAPPORTS :",
        supabaseSpeculations
      );

      console.log(
        "DÉPENSES RAPPORTS :",
        supabaseExpenses
      );

      console.log(
        "VENTES RAPPORTS :",
        supabaseSales
      );

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
        "ERREUR CHARGEMENT RAPPORTS :",
        error
      );
    }
  };

  loadReports();
}, []);
  /*
   =========================
   CALCULS PAR SPÉCULATION
   =========================
  */

  const calculatedSpeculations =
    useMemo(() => {
      return speculations.map(
        (speculation) => {
          const additionalExpenses =
            expenses
              .filter(
                (expense) =>
                  expense.speculationId ===
                  speculation.id
              )
              .reduce(
                (
                  total,
                  expense
                ) =>
                  total +
                  expense.total,
                0
              );

          const additionalSales =
            sales
              .filter(
                (sale) =>
                  sale.speculationId ===
                  speculation.id
              )
              .reduce(
                (
                  total,
                  sale
                ) =>
                  total +
                  sale.total,
                0
              );

          const totalExpenses =
            speculation.expenses +
            additionalExpenses;

          const totalSales =
            speculation.sales +
            additionalSales;

          const result =
            totalSales -
            totalExpenses;

          const profitability =
            totalExpenses > 0
              ? (result /
                  totalExpenses) *
                100
              : 0;

          return {
            ...speculation,

            expenses:
              totalExpenses,

            sales:
              totalSales,

            result,

            profitability,
          };
        }
      );
    }, [
      speculations,
      expenses,
      sales,
    ]);

  /*
   =========================
   CALCULS GLOBAUX
   =========================
  */

  const totalExpenses =
    calculatedSpeculations.reduce(
      (total, item) =>
        total +
        item.expenses,
      0
    );

  const totalSales =
    calculatedSpeculations.reduce(
      (total, item) =>
        total +
        item.sales,
      0
    );

  const globalResult =
    totalSales -
    totalExpenses;

  const globalProfitability =
    totalExpenses > 0
      ? (globalResult /
          totalExpenses) *
        100
      : 0;

  /*
   =========================
   CLASSEMENTS
   =========================
  */

  const bestProfitability =
    calculatedSpeculations.length >
    0
      ? [
          ...calculatedSpeculations,
        ].sort(
          (a, b) =>
            b.profitability -
            a.profitability
        )[0]
      : null;

  const worstProfitability =
    calculatedSpeculations.length >
    0
      ? [
          ...calculatedSpeculations,
        ].sort(
          (a, b) =>
            a.profitability -
            b.profitability
        )[0]
      : null;

  const highestSales =
    calculatedSpeculations.length >
    0
      ? [
          ...calculatedSpeculations,
        ].sort(
          (a, b) =>
            b.sales -
            a.sales
        )[0]
      : null;

  const highestExpenses =
    calculatedSpeculations.length >
    0
      ? [
          ...calculatedSpeculations,
        ].sort(
          (a, b) =>
            b.expenses -
            a.expenses
        )[0]
      : null;

  /*
   =========================
   EXPORT EXCEL
   =========================
  */

  const handleExcelExport =
    () => {
      exportReportToExcel({
        speculations:
          calculatedSpeculations,

        expenses,

        sales,
      });
    };

  return (
    <main className="min-h-screen bg-[#f7f8f7] p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* RETOUR */}

        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-green-700"
        >
          <ArrowLeft
            size={18}
          />

          Retour au Dashboard
        </Link>

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-green-700">
              Analyse financière
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Rapports
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Analysez les
              performances et la
              rentabilité de chaque
              spéculation.
            </p>
          </div>

          {/* EXPORT EXCEL */}

          <button
            type="button"
            onClick={
              handleExcelExport
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-green-800"
          >
            <Download
              size={19}
            />

            Exporter Excel
          </button>
        </div>

        {/* RÉSUMÉ GLOBAL */}

        <div className="grid gap-4 md:grid-cols-4">
          {/* DÉPENSES */}

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <Wallet
              size={22}
              className="text-red-600"
            />

            <p className="mt-3 text-xs font-bold uppercase text-red-600">
              Dépenses
            </p>

            <p className="mt-2 text-2xl font-bold text-red-700">
              {formatMoney(
                totalExpenses
              )}
            </p>

            <p className="text-xs text-gray-500">
              FCFA
            </p>
          </div>

          {/* VENTES */}

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <ShoppingCart
              size={22}
              className="text-green-700"
            />

            <p className="mt-3 text-xs font-bold uppercase text-green-700">
              Ventes
            </p>

            <p className="mt-2 text-2xl font-bold text-green-800">
              {formatMoney(
                totalSales
              )}
            </p>

            <p className="text-xs text-gray-500">
              FCFA
            </p>
          </div>

          {/* RÉSULTAT */}

          <div
            className={`rounded-2xl border p-5 ${
              globalResult >= 0
                ? "border-green-100 bg-green-50"
                : "border-red-100 bg-red-50"
            }`}
          >
            {globalResult >=
            0 ? (
              <TrendingUp
                size={22}
                className="text-green-700"
              />
            ) : (
              <TrendingDown
                size={22}
                className="text-red-600"
              />
            )}

            <p className="mt-3 text-xs font-bold uppercase text-gray-600">
              Résultat
            </p>

            <p
              className={`mt-2 text-2xl font-bold ${
                globalResult >=
                0
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {globalResult >
              0
                ? "+"
                : ""}

              {formatMoney(
                globalResult
              )}
            </p>

            <p className="text-xs text-gray-500">
              FCFA
            </p>
          </div>

          {/* RENTABILITÉ */}

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <BarChart3
              size={22}
              className="text-blue-700"
            />

            <p className="mt-3 text-xs font-bold uppercase text-blue-700">
              Rentabilité
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-800">
              {globalProfitability.toFixed(
                1
              )}
              %
            </p>
          </div>
        </div>

        {/* INDICATEURS */}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* PLUS RENTABLE */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <Trophy className="text-yellow-500" />

            <p className="mt-3 text-xs font-bold uppercase text-gray-500">
              Plus rentable
            </p>

            <p className="mt-2 text-lg font-bold text-gray-900">
              {bestProfitability
                ? `${bestProfitability.emoji} ${bestProfitability.name}`
                : "—"}
            </p>

            {bestProfitability && (
              <p className="mt-1 font-semibold text-green-700">
                {bestProfitability.profitability.toFixed(
                  1
                )}
                %
              </p>
            )}
          </div>

          {/* MOINS RENTABLE */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <TrendingDown className="text-red-500" />

            <p className="mt-3 text-xs font-bold uppercase text-gray-500">
              Moins rentable
            </p>

            <p className="mt-2 text-lg font-bold text-gray-900">
              {worstProfitability
                ? `${worstProfitability.emoji} ${worstProfitability.name}`
                : "—"}
            </p>

            {worstProfitability && (
              <p className="mt-1 font-semibold text-red-600">
                {worstProfitability.profitability.toFixed(
                  1
                )}
                %
              </p>
            )}
          </div>

          {/* PLUS DE VENTES */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <ShoppingCart className="text-green-600" />

            <p className="mt-3 text-xs font-bold uppercase text-gray-500">
              Plus de ventes
            </p>

            <p className="mt-2 text-lg font-bold text-gray-900">
              {highestSales
                ? `${highestSales.emoji} ${highestSales.name}`
                : "—"}
            </p>

            {highestSales && (
              <p className="mt-1 font-semibold text-green-700">
                {formatMoney(
                  highestSales.sales
                )}{" "}
                FCFA
              </p>
            )}
          </div>

          {/* PLUS DE DÉPENSES */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <Wallet className="text-red-600" />

            <p className="mt-3 text-xs font-bold uppercase text-gray-500">
              Plus de dépenses
            </p>

            <p className="mt-2 text-lg font-bold text-gray-900">
              {highestExpenses
                ? `${highestExpenses.emoji} ${highestExpenses.name}`
                : "—"}
            </p>

            {highestExpenses && (
              <p className="mt-1 font-semibold text-red-600">
                {formatMoney(
                  highestExpenses.expenses
                )}{" "}
                FCFA
              </p>
            )}
          </div>
        </div>

        {/* GRAPHIQUE */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Dépenses vs ventes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Comparez visuellement
              les dépenses et les
              ventes de chaque
              spéculation.
            </p>
          </div>

          <ReportsChart
            data={calculatedSpeculations.map(
              (
                speculation
              ) => ({
                name:
                  speculation.name,

                expenses:
                  speculation.expenses,

                sales:
                  speculation.sales,
              })
            )}
          />
        </div>

        {/* TABLEAU */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="text-xl font-bold text-gray-900">
              Performance par
              spéculation
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Comparaison complète
              des différentes
              productions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="px-5 py-4">
                    Spéculation
                  </th>

                  <th className="px-5 py-4">
                    Surface
                  </th>

                  <th className="px-5 py-4 text-right">
                    Dépenses
                  </th>

                  <th className="px-5 py-4 text-right">
                    Ventes
                  </th>

                  <th className="px-5 py-4 text-right">
                    Résultat
                  </th>

                  <th className="px-5 py-4 text-right">
                    Rentabilité
                  </th>
                </tr>
              </thead>

              <tbody>
                {calculatedSpeculations.map(
                  (
                    speculation
                  ) => (
                    <tr
                      key={
                        speculation.id
                      }
                      className="border-t border-gray-100"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/speculations/${speculation.id}`}
                          className="flex items-center gap-3 font-semibold text-gray-900 hover:text-green-700"
                        >
                          <span className="text-2xl">
                            {
                              speculation.emoji
                            }
                          </span>

                          {
                            speculation.name
                          }
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {
                          speculation.surface
                        }{" "}
                        ha
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-red-600">
                        {formatMoney(
                          speculation.expenses
                        )}{" "}
                        FCFA
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-green-700">
                        {formatMoney(
                          speculation.sales
                        )}{" "}
                        FCFA
                      </td>

                      <td
                        className={`px-5 py-4 text-right font-bold ${
                          speculation.result >=
                          0
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {speculation.result >
                        0
                          ? "+"
                          : ""}

                        {formatMoney(
                          speculation.result
                        )}{" "}
                        FCFA
                      </td>

                      <td
                        className={`px-5 py-4 text-right font-bold ${
                          speculation.profitability >=
                          0
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {speculation.profitability.toFixed(
                          1
                        )}
                        %
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}