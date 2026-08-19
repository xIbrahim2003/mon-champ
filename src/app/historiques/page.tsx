"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  History,
  Wallet,
  ShoppingCart,
} from "lucide-react";

import type {
  Expense,
} from "@/data/expenseData";

import type {
  Sale,
} from "@/data/saleData";

import type {
  Speculation,
} from "@/data/mockData";

import {
  getSupabaseExpenses,
  getSupabaseSales,
  getSupabaseSpeculations,
} from "@/data/supabaseStorage";

type HistoryItem = {
  id: string;
  type: "expense" | "sale";
  date: string;
  speculationId: number;
  title: string;
  subtitle: string;
  amount: number;
};

const formatMoney = (
  value: number
) =>
  new Intl.NumberFormat(
    "fr-FR"
  ).format(value);

export default function HistoriquesPage() {
  const [
    expenses,
    setExpenses,
  ] =
    useState<Expense[]>(
      []
    );

  const [
    sales,
    setSales,
  ] =
    useState<Sale[]>(
      []
    );

  const [
    speculations,
    setSpeculations,
  ] =
    useState<Speculation[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  /*
    =========================
    CHARGEMENT SUPABASE
    =========================
  */

  useEffect(() => {
    const loadData =
      async () => {
        try {
          setLoading(
            true
          );

          const [
            supabaseExpenses,
            supabaseSales,
            supabaseSpeculations,
          ] =
            await Promise.all([
              getSupabaseExpenses(),
              getSupabaseSales(),
              getSupabaseSpeculations(),
            ]);

          setExpenses(
            supabaseExpenses
          );

          setSales(
            supabaseSales
          );

          setSpeculations(
            supabaseSpeculations
          );
        } catch (error) {
          console.error(
            "Erreur chargement historique :",
            error
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadData();
  }, []);

  /*
    =========================
    HISTORIQUE GLOBAL
    =========================
  */

  const historyItems =
    useMemo(() => {
      const expenseItems: HistoryItem[] =
        expenses.map(
          (
            expense
          ) => ({
            id:
              `expense-${expense.id}`,

            type:
              "expense",

            date:
              expense.date,

            speculationId:
              expense.speculationId,

            title:
              expense.productName,

            subtitle:
              expense.category,

            amount:
              expense.total,
          })
        );

      const saleItems: HistoryItem[] =
        sales.map(
          (
            sale
          ) => ({
            id:
              `sale-${sale.id}`,

            type:
              "sale",

            date:
              sale.date,

            speculationId:
              sale.speculationId,

            title:
              `${sale.quantity} ${sale.unit}`,

            subtitle:
              sale.buyer
                ? `Vente à ${sale.buyer}`
                : "Vente",

            amount:
              sale.total,
          })
        );

      return [
        ...expenseItems,
        ...saleItems,
      ].sort(
        (
          a,
          b
        ) =>
          new Date(
            b.date
          ).getTime() -
          new Date(
            a.date
          ).getTime()
      );
    }, [
      expenses,
      sales,
    ]);

  /*
    =========================
    TOTAUX
    =========================
  */

  const totalExpenses =
    useMemo(() => {
      return expenses.reduce(
        (
          total,
          expense
        ) =>
          total +
          expense.total,
        0
      );
    }, [
      expenses,
    ]);

  const totalSales =
    useMemo(() => {
      return sales.reduce(
        (
          total,
          sale
        ) =>
          total +
          sale.total,
        0
      );
    }, [
      sales,
    ]);

  /*
    =========================
    SPÉCULATION ASSOCIÉE
    =========================
  */

  const getSpeculation = (
    id: number
  ) => {
    return speculations.find(
      (
        speculation
      ) =>
        speculation.id ===
        id
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f8f7] p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-green-700"
        >
          <ArrowLeft
            size={18}
          />

          Retour au Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold text-green-700">
            Suivi des opérations
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Historique
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Retrouvez toutes les dépenses et ventes du champ au même endroit.
          </p>
        </div>

        {/* =========================
            STATISTIQUES
        ========================= */}

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 text-gray-700">
                <History
                  size={22}
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-500">
                  Opérations
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {
                    historyItems.length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <div className="flex items-center gap-3">
              <Wallet
                size={22}
                className="text-red-600"
              />

              <div>
                <p className="text-xs font-bold uppercase text-red-600">
                  Dépenses ajoutées
                </p>

                <p className="mt-1 text-2xl font-bold text-red-700">
                  {formatMoney(
                    totalExpenses
                  )}{" "}
                  FCFA
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="flex items-center gap-3">
              <ShoppingCart
                size={22}
                className="text-green-700"
              />

              <div>
                <p className="text-xs font-bold uppercase text-green-700">
                  Ventes ajoutées
                </p>

                <p className="mt-1 text-2xl font-bold text-green-800">
                  {formatMoney(
                    totalSales
                  )}{" "}
                  FCFA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            CHARGEMENT
        ========================= */}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

            <p className="mt-4 text-sm text-gray-500">
              Chargement de l&apos;historique...
            </p>
          </div>
        ) : historyItems.length ===
          0 ? (
          /* =========================
             VIDE
          ========================= */

          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <History
              size={42}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-3 text-lg font-bold text-gray-900">
              Aucun historique
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Les dépenses et ventes apparaîtront ici automatiquement.
            </p>
          </div>
        ) : (
          /* =========================
             LISTE
          ========================= */

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {historyItems.map(
              (
                item
              ) => {
                const speculation =
                  getSpeculation(
                    item.speculationId
                  );

                return (
                  <div
                    key={
                      item.id
                    }
                    className="flex flex-col gap-4 border-b border-gray-100 p-5 last:border-b-0 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          item.type ===
                          "expense"
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {item.type ===
                        "expense" ? (
                          <Wallet
                            size={20}
                          />
                        ) : (
                          <ShoppingCart
                            size={20}
                          />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {speculation?.emoji ||
                              "🌱"}
                          </span>

                          <p className="font-bold text-gray-900">
                            {speculation?.name ||
                              "Spéculation supprimée"}
                          </p>
                        </div>

                        <p className="mt-1 text-sm text-gray-600">
                          {
                            item.title
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {
                            item.date
                          }{" "}
                          ·{" "}
                          {
                            item.subtitle
                          }
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          item.type ===
                          "expense"
                            ? "text-red-600"
                            : "text-green-700"
                        }`}
                      >
                        {item.type ===
                        "expense"
                          ? "-"
                          : "+"}

                        {formatMoney(
                          item.amount
                        )}{" "}
                        FCFA
                      </p>

                      <p className="mt-1 text-xs font-semibold text-gray-400">
                        {item.type ===
                        "expense"
                          ? "Dépense"
                          : "Vente"}
                      </p>
                    </div>
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