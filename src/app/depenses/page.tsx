"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Plus,
  Trash2,
  WalletCards,
  Pencil,
} from "lucide-react";

import type {
  Expense,
} from "@/data/expenseData";

import type {
  Speculation,
} from "@/data/mockData";

import {
  getSupabaseExpenses,
  getSupabaseSpeculations,
  deleteSupabaseExpense,
} from "@/data/supabaseStorage";

const formatMoney = (
  value: number
) =>
  new Intl.NumberFormat(
    "fr-FR"
  ).format(value);

export default function DepensesPage() {
  const [
    expenses,
    setExpenses,
  ] = useState<Expense[]>([]);

  const [
    speculations,
    setSpeculations,
  ] = useState<Speculation[]>([]);

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
    const loadData =
      async () => {
        try {
          setLoading(true);

          const [
            supabaseExpenses,
            supabaseSpeculations,
          ] =
            await Promise.all([
              getSupabaseExpenses(),
              getSupabaseSpeculations(),
            ]);

          setExpenses(
            supabaseExpenses
          );

          setSpeculations(
            supabaseSpeculations
          );
        } catch (error) {
          console.error(
            "Erreur chargement dépenses :",
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
    TOTAL DÉPENSES
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
    }, [expenses]);

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

  /*
    =========================
    SUPPRESSION SUPABASE
    =========================
  */

  const handleDelete =
    async (
      id: number
    ) => {
      const confirmed =
        window.confirm(
          "Voulez-vous vraiment supprimer cette dépense ?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteSupabaseExpense(
          id
        );

        /*
          Mise à jour immédiate
          de l'interface.
        */

        setExpenses(
          (
            current
          ) =>
            current.filter(
              (
                expense
              ) =>
                expense.id !==
                id
            )
        );
      } catch (error) {
        console.error(
          "Erreur suppression dépense :",
          error
        );

        window.alert(
          "Impossible de supprimer la dépense."
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
            <ArrowLeft
              size={18}
            />

            Retour au Dashboard
          </Link>

          <Link
            href="/depenses/nouvelle"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus
              size={18}
            />

            Ajouter une dépense
          </Link>
        </div>

        {/* TITRE */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">
            Gestion financière
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Dépenses
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Retrouvez toutes les dépenses enregistrées pour vos spéculations.
          </p>
        </div>

        {/* TOTAL */}

        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <WalletCards
                size={22}
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-blue-600">
                Total des dépenses ajoutées
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-800">
                {formatMoney(
                  totalExpenses
                )}{" "}
                FCFA
              </p>
            </div>
          </div>
        </div>

        {/* CHARGEMENT */}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-4 text-sm text-gray-500">
              Chargement des dépenses...
            </p>
          </div>
        ) : expenses.length ===
          0 ? (
          /* VIDE */

          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="text-4xl">
              💸
            </div>

            <h2 className="mt-3 text-lg font-bold text-gray-900">
              Aucune dépense enregistrée
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Ajoutez votre première dépense pour commencer le suivi.
            </p>

            <Link
              href="/depenses/nouvelle"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
            >
              <Plus
                size={18}
              />

              Ajouter une dépense
            </Link>
          </div>
        ) : (
          /* TABLEAU */

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="px-5 py-4">
                      Date
                    </th>

                    <th className="px-5 py-4">
                      Spéculation
                    </th>

                    <th className="px-5 py-4">
                      Catégorie
                    </th>

                    <th className="px-5 py-4">
                      Produit / service
                    </th>

                    <th className="px-5 py-4">
                      Quantité
                    </th>

                    <th className="px-5 py-4">
                      Fournisseur
                    </th>

                    <th className="px-5 py-4 text-right">
                      Montant
                    </th>

                    <th className="px-5 py-4 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {expenses
                    .slice()
                    .sort(
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
                    )
                    .map(
                      (
                        expense
                      ) => {
                        const speculation =
                          getSpeculation(
                            expense.speculationId
                          );

                        return (
                          <tr
                            key={
                              expense.id
                            }
                            className="border-t border-gray-100 hover:bg-gray-50"
                          >
                            {/* DATE */}

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {
                                expense.date
                              }
                            </td>

                            {/* SPÉCULATION */}

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">
                                  {speculation?.emoji ||
                                    "🌱"}
                                </span>

                                <span className="font-semibold text-gray-900">
                                  {speculation?.name ||
                                    "Spéculation supprimée"}
                                </span>
                              </div>
                            </td>

                            {/* CATÉGORIE */}

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {
                                expense.category
                              }
                            </td>

                            {/* PRODUIT */}

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {
                                expense.productName
                              }
                            </td>

                            {/* QUANTITÉ */}

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {
                                expense.quantity
                              }{" "}
                              {
                                expense.unit
                              }
                            </td>

                            {/* FOURNISSEUR */}

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {expense.supplier ||
                                "—"}
                            </td>

                            {/* MONTANT */}

                            <td className="px-5 py-4 text-right font-bold text-red-600">
                              {formatMoney(
                                expense.total
                              )}{" "}
                              FCFA
                            </td>

                            {/* ACTIONS */}

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-1">
                                <Link
                                  href={`/depenses/${expense.id}/modifier`}
                                  className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                                  title="Modifier la dépense"
                                >
                                  <Pencil
                                    size={18}
                                  />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      expense.id
                                    )
                                  }
                                  className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                  title="Supprimer la dépense"
                                >
                                  <Trash2
                                    size={18}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}