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
  ShoppingCart,
  Trash2,
  Pencil,
} from "lucide-react";

import type {
  Sale,
} from "@/data/saleData";

import type {
  Speculation,
} from "@/data/mockData";

import {
  getSupabaseSales,
  getSupabaseSpeculations,
  deleteSupabaseSale,
} from "@/data/supabaseStorage";

const formatMoney = (
  value: number
) =>
  new Intl.NumberFormat(
    "fr-FR"
  ).format(value);

export default function VentesPage() {
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
            supabaseSales,
            supabaseSpeculations,
          ] =
            await Promise.all([
              getSupabaseSales(),
              getSupabaseSpeculations(),
            ]);

          setSales(
            supabaseSales
          );

          setSpeculations(
            supabaseSpeculations
          );
        } catch (error) {
          console.error(
            "Erreur chargement ventes :",
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
    STATISTIQUES
    =========================
  */

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
    }, [sales]);

  const paidSales =
    useMemo(() => {
      return sales
        .filter(
          (
            sale
          ) =>
            sale.paymentStatus ===
            "Payé"
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
    }, [sales]);

  const unpaidSales =
    useMemo(() => {
      return sales
        .filter(
          (
            sale
          ) =>
            sale.paymentStatus ===
            "Non payé"
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
    }, [sales]);

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
          "Voulez-vous vraiment supprimer cette vente ?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteSupabaseSale(
          id
        );

        setSales(
          (
            current
          ) =>
            current.filter(
              (
                sale
              ) =>
                sale.id !==
                id
            )
        );
      } catch (error) {
        console.error(
          "Erreur suppression vente :",
          error
        );

        window.alert(
          "Impossible de supprimer la vente."
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
            href="/ventes/nouvelle"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700"
          >
            <Plus
              size={18}
            />

            Ajouter une vente
          </Link>
        </div>

        {/* TITRE */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-purple-600">
            Gestion commerciale
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Ventes
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Retrouvez toutes les ventes enregistrées pour vos spéculations.
          </p>
        </div>

        {/* STATISTIQUES */}

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-purple-600 shadow-sm">
                <ShoppingCart
                  size={22}
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-purple-600">
                  Total des ventes
                </p>

                <p className="mt-1 text-2xl font-bold text-purple-800">
                  {formatMoney(
                    totalSales
                  )}{" "}
                  FCFA
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <p className="text-xs font-bold uppercase text-green-600">
              Ventes payées
            </p>

            <p className="mt-2 text-2xl font-bold text-green-700">
              {formatMoney(
                paidSales
              )}{" "}
              FCFA
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
            <p className="text-xs font-bold uppercase text-orange-600">
              Ventes non payées
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-700">
              {formatMoney(
                unpaidSales
              )}{" "}
              FCFA
            </p>
          </div>
        </div>

        {/* CHARGEMENT */}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />

            <p className="mt-4 text-sm text-gray-500">
              Chargement des ventes...
            </p>
          </div>
        ) : sales.length ===
          0 ? (
          /* VIDE */

          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="text-4xl">
              🛒
            </div>

            <h2 className="mt-3 text-lg font-bold text-gray-900">
              Aucune vente enregistrée
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Ajoutez votre première vente pour commencer.
            </p>

            <Link
              href="/ventes/nouvelle"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700"
            >
              <Plus
                size={18}
              />

              Ajouter une vente
            </Link>
          </div>
        ) : (
          /* TABLEAU */

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="px-5 py-4">
                      Date
                    </th>

                    <th className="px-5 py-4">
                      Spéculation
                    </th>

                    <th className="px-5 py-4">
                      Quantité
                    </th>

                    <th className="px-5 py-4">
                      Prix unitaire
                    </th>

                    <th className="px-5 py-4">
                      Acheteur
                    </th>

                    <th className="px-5 py-4">
                      Paiement
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
                  {sales
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
                        sale
                      ) => {
                        const speculation =
                          getSpeculation(
                            sale.speculationId
                          );

                        return (
                          <tr
                            key={
                              sale.id
                            }
                            className="border-t border-gray-100 hover:bg-gray-50"
                          >
                            {/* DATE */}

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {
                                sale.date
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

                            {/* QUANTITÉ */}

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {
                                sale.quantity
                              }{" "}
                              {
                                sale.unit
                              }
                            </td>

                            {/* PRIX */}

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {formatMoney(
                                sale.unitPrice
                              )}{" "}
                              FCFA
                            </td>

                            {/* ACHETEUR */}

                            <td className="px-5 py-4 text-sm text-gray-700">
                              {sale.buyer ||
                                "—"}
                            </td>

                            {/* PAIEMENT */}

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  sale.paymentStatus ===
                                  "Payé"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {
                                  sale.paymentStatus
                                }
                              </span>
                            </td>

                            {/* MONTANT */}

                            <td className="px-5 py-4 text-right font-bold text-green-700">
                              {formatMoney(
                                sale.total
                              )}{" "}
                              FCFA
                            </td>

                            {/* ACTIONS */}

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-1">
                                <Link
                                  href={`/ventes/${sale.id}/modifier`}
                                  className="rounded-lg p-2 text-gray-400 transition hover:bg-purple-50 hover:text-purple-600"
                                  title="Modifier la vente"
                                >
                                  <Pencil
                                    size={18}
                                  />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      sale.id
                                    )
                                  }
                                  className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                  title="Supprimer la vente"
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