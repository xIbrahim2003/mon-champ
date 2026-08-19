"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Sprout,
  WalletCards,
  ShoppingCart,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import SpeculationCard from "@/components/SpeculationCard";

import type { Speculation } from "@/data/mockData";
import type { Expense } from "@/data/expenseData";
import type { Sale } from "@/data/saleData";

import {
  getSupabaseSpeculations,
  getSupabaseExpenses,
  getSupabaseSales,
  deleteSupabaseSpeculation,
} from "@/data/supabaseStorage";

export default function Home() {
  const [
    allSpeculations,
    setAllSpeculations,
  ] = useState<Speculation[]>([]);

  const [
    expenses,
    setExpenses,
  ] = useState<Expense[]>([]);

  const [
    sales,
    setSales,
  ] = useState<Sale[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /*
    =========================
    CHARGEMENT SUPABASE
    =========================
  */

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

        setAllSpeculations(
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
          "Erreur chargement Dashboard :",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /*
    =========================
    CALCULS PAR SPÉCULATION
    =========================

    Les dépenses et ventes ne sont
    plus stockées directement dans
    la spéculation.

    Elles sont calculées à partir
    des tables expenses et sales.
  */

  const calculatedSpeculations =
    allSpeculations.map(
      (speculation) => {
        const totalExpenses =
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

        const totalSales =
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

        return {
          ...speculation,

          expenses:
            totalExpenses,

          sales:
            totalSales,
        };
      }
    );

  /*
    =========================
    TOTAL DÉPENSES
    =========================
  */

  const totalExpenses =
    calculatedSpeculations.reduce(
      (total, item) =>
        total +
        item.expenses,
      0
    );

  /*
    =========================
    TOTAL VENTES
    =========================
  */

  const totalSales =
    calculatedSpeculations.reduce(
      (total, item) =>
        total +
        item.sales,
      0
    );

  /*
    =========================
    RÉSULTAT GLOBAL
    =========================
  */

  const result =
    totalSales -
    totalExpenses;

  /*
    =========================
    SUPPRESSION SUPABASE
    =========================

    Grâce à ON DELETE CASCADE
    dans PostgreSQL :

    - la spéculation est supprimée
    - ses dépenses sont supprimées
    - ses ventes sont supprimées
  */

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

      /*
        Mise à jour immédiate
        de l'interface.
      */

      setAllSpeculations(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
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
    <main className="min-h-screen bg-[#f7f8f7]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1 p-5 md:p-8">
          <div className="mx-auto max-w-6xl">
            {/* TITRE */}

            <div className="mb-8">
              <p className="text-sm text-gray-500">
                Vue d&apos;ensemble
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
            </div>

            {/* STATISTIQUES */}

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Dépenses totales"
                value={
                  totalExpenses
                }
                type="expense"
              />

              <StatCard
                title="Ventes totales"
                value={
                  totalSales
                }
                type="sales"
              />

              <StatCard
                title="Résultat net"
                value={result}
                type="result"
              />
            </div>

            {/* SPÉCULATIONS */}

            <div className="mt-10">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-gray-900">
                  Mes spéculations
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Suivez la performance
                  de chaque production.
                </p>
              </div>

              <div className="space-y-3">
                {loading ? (
                  /*
                    CHARGEMENT
                  */

                  <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

                    <p className="mt-4 text-sm text-gray-500">
                      Chargement des données...
                    </p>
                  </div>
                ) : calculatedSpeculations.length ===
                  0 ? (
                  /*
                    AUCUNE SPÉCULATION
                  */

                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                    <div className="text-4xl">
                      🌱
                    </div>

                    <h3 className="mt-3 font-semibold text-gray-900">
                      Aucune spéculation
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Ajoutez votre première
                      production pour commencer.
                    </p>

                    <Link
                      href="/speculations/nouvelle"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                    >
                      <Sprout
                        size={18}
                      />

                      Nouvelle spéculation
                    </Link>
                  </div>
                ) : (
                  /*
                    LISTE
                  */

                  calculatedSpeculations.map(
                    (
                      speculation
                    ) => (
                      <SpeculationCard
                        key={
                          speculation.id
                        }
                        speculation={
                          speculation
                        }
                        onDelete={() =>
                          handleDelete(
                            speculation.id
                          )
                        }
                      />
                    )
                  )
                )}
              </div>
            </div>

            {/* ACTIONS */}

            <div className="mt-8 grid gap-3 pb-8 md:grid-cols-3">
              <Link
                href="/speculations/nouvelle"
                className="flex items-center justify-center gap-3 rounded-2xl bg-green-700 px-5 py-4 font-semibold text-white transition hover:bg-green-800"
              >
                <Sprout
                  size={21}
                />

                Nouvelle spéculation
              </Link>

              <Link
                href="/depenses/nouvelle"
                className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 py-4 font-semibold text-white transition hover:bg-blue-700"
              >
                <WalletCards
                  size={21}
                />

                Ajouter une dépense
              </Link>

              <Link
                href="/ventes/nouvelle"
                className="flex items-center justify-center gap-3 rounded-2xl bg-purple-600 px-5 py-4 font-semibold text-white transition hover:bg-purple-700"
              >
                <ShoppingCart
                  size={21}
                />

                Ajouter une vente
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}