"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingCart,
  User,
  Activity,
  Package,
  Boxes,
  Save,
} from "lucide-react";

import type {
  Speculation,
  SpeculationStatus,
} from "@/data/mockData";

import type {
  Expense,
} from "@/data/expenseData";

import type {
  Sale,
} from "@/data/saleData";

import {
  getSupabaseSpeculations,
  getSupabaseExpenses,
  getSupabaseSales,
  updateSupabaseSpeculation,
} from "@/data/supabaseStorage";

const formatMoney = (
  value: number
) =>
  new Intl.NumberFormat(
    "fr-FR"
  ).format(value);

const formatQuantity = (
  value: number
) =>
  new Intl.NumberFormat(
    "fr-FR",
    {
      maximumFractionDigits: 2,
    }
  ).format(value);

const statusOptions: SpeculationStatus[] = [
  "En préparation",
  "En cours",
  "Récolte",
  "Terminée",
];

export default function SpeculationDetailPage() {
  const params =
    useParams();

  const id =
    Number(
      params.id
    );

  const [
    speculation,
    setSpeculation,
  ] =
    useState<Speculation | null>(
      null
    );

  const [
    expenses,
    setExpenses,
  ] =
    useState<Expense[]>([]);

  const [
    sales,
    setSales,
  ] =
    useState<Sale[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    producedQuantityInput,
    setProducedQuantityInput,
  ] = useState("");

  const [
    quantitySaved,
    setQuantitySaved,
  ] = useState(false);

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
            supabaseSpeculations,
            supabaseExpenses,
            supabaseSales,
          ] =
            await Promise.all([
              getSupabaseSpeculations(),
              getSupabaseExpenses(),
              getSupabaseSales(),
            ]);

          const found =
            supabaseSpeculations.find(
              (
                item
              ) =>
                item.id ===
                id
            ) || null;

          setSpeculation(
            found
          );

          if (found) {
            setProducedQuantityInput(
              found.quantity
                ? String(
                    found.quantity
                  )
                : ""
            );
          }

          setExpenses(
            supabaseExpenses.filter(
              (
                expense
              ) =>
                expense.speculationId ===
                id
            )
          );

          setSales(
            supabaseSales.filter(
              (
                sale
              ) =>
                sale.speculationId ===
                id
            )
          );
        } catch (error) {
          console.error(
            "Erreur chargement détail spéculation :",
            error
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadData();
  }, [id]);

  /*
    =========================
    DÉPENSES
    =========================
  */

  const additionalExpenses =
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
    VENTES
    =========================
  */

  const additionalSales =
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

  /*
    =========================
    MODIFIER STATUT
    SUPABASE
    =========================
  */

  const handleStatusChange =
    async (
      newStatus:
        SpeculationStatus
    ) => {
      if (!speculation) {
        return;
      }

      const updatedSpeculation: Speculation =
        {
          ...speculation,

          status:
            newStatus,
        };

      try {
        await updateSupabaseSpeculation(
          updatedSpeculation
        );

        setSpeculation(
          updatedSpeculation
        );
      } catch (error) {
        console.error(
          "Erreur modification statut :",
          error
        );

        window.alert(
          "Impossible de modifier le statut."
        );
      }
    };

  /*
    =========================
    QUANTITÉ PRODUITE
    SUPABASE
    =========================
  */

  const handleSaveQuantity =
    async () => {
      if (!speculation) {
        return;
      }

      const quantity =
        Math.max(
          0,
          Number(
            producedQuantityInput
          ) || 0
        );

      const updatedSpeculation: Speculation =
        {
          ...speculation,

          quantity,
        };

      try {
        await updateSupabaseSpeculation(
          updatedSpeculation
        );

        setSpeculation(
          updatedSpeculation
        );

        setProducedQuantityInput(
          String(
            quantity
          )
        );

        setQuantitySaved(
          true
        );

        window.setTimeout(
          () => {
            setQuantitySaved(
              false
            );
          },
          2000
        );
      } catch (error) {
        console.error(
          "Erreur modification quantité :",
          error
        );

        window.alert(
          "Impossible d'enregistrer la quantité produite."
        );
      }
    };

  /*
    =========================
    CHARGEMENT
    =========================
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8f7] p-5 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

            <p className="mt-4 text-sm text-gray-500">
              Chargement de la spéculation...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
    =========================
    INTROUVABLE
    =========================
  */

  if (!speculation) {
    return (
      <main className="min-h-screen bg-[#f7f8f7] p-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/speculations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600"
          >
            <ArrowLeft
              size={18}
            />

            Retour
          </Link>

          <div className="mt-10 rounded-2xl bg-white p-10 text-center">
            Spéculation introuvable.
          </div>
        </div>
      </main>
    );
  }

  /*
    =========================
    CALCULS FINANCIERS
    =========================

    Les dépenses et ventes viennent
    directement de Supabase.
  */

  const totalExpenses =
    additionalExpenses;

  const totalSales =
    additionalSales;

  const result =
    totalSales -
    totalExpenses;

  const profitability =
    totalExpenses > 0
      ? (
          result /
          totalExpenses
        ) * 100
      : 0;

  /*
    =========================
    SUIVI PRODUCTION
    =========================
  */

  const productionUnit =
    speculation.unit ||
    "kg";

  const producedQuantity =
    speculation.quantity ||
    0;

  const compatibleSales =
    sales.filter(
      (
        sale
      ) =>
        sale.unit ===
        productionUnit
    );

  const incompatibleSales =
    sales.filter(
      (
        sale
      ) =>
        sale.unit !==
        productionUnit
    );

  const soldQuantity =
    compatibleSales.reduce(
      (
        total,
        sale
      ) =>
        total +
        sale.quantity,
      0
    );

  const remainingQuantity =
    Math.max(
      0,
      producedQuantity -
        soldQuantity
    );

  const sellThroughRate =
    producedQuantity > 0
      ? (
          soldQuantity /
          producedQuantity
        ) * 100
      : 0;

  return (
    <main className="min-h-screen bg-[#f7f8f7] p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/speculations"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-green-700"
        >
          <ArrowLeft
            size={18}
          />

          Retour aux spéculations
        </Link>

        {/* =========================
            FICHE PRINCIPALE
        ========================= */}

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">

          {/* HEADER */}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-5xl">
                {
                  speculation.emoji
                }
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {
                    speculation.name
                  }
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Campagne{" "}
                  {
                    speculation.campaign
                  }
                  {" · "}
                  {
                    speculation.surface
                  }{" "}
                  ha
                </p>
              </div>
            </div>

            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                result >= 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {result >= 0
                ? "Rentable"
                : "Déficitaire"}
            </div>
          </div>

          {/* RESPONSABLE + STATUT */}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-700">
                  <User
                    size={19}
                  />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">
                    Responsable
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {speculation.manager?.trim()
                      ? speculation.manager
                      : "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-700">
                  <Activity
                    size={19}
                  />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-bold uppercase text-gray-400">
                    Statut
                  </p>

                  <select
                    value={
                      speculation.status ||
                      "En préparation"
                    }
                    onChange={(
                      e
                    ) =>
                      handleStatusChange(
                        e.target
                          .value as SpeculationStatus
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 outline-none focus:border-green-600"
                  >
                    {statusOptions.map(
                      (
                        status
                      ) => (
                        <option
                          key={
                            status
                          }
                          value={
                            status
                          }
                        >
                          {
                            status
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* STATS FINANCIÈRES */}

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-red-50 p-5">
              <div className="flex items-center gap-2 text-red-600">
                <Wallet
                  size={18}
                />

                <p className="text-xs font-bold uppercase">
                  Dépenses
                </p>
              </div>

              <p className="mt-3 text-2xl font-bold text-red-700">
                {formatMoney(
                  totalExpenses
                )}
              </p>

              <p className="text-xs text-gray-500">
                FCFA
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5">
              <div className="flex items-center gap-2 text-green-700">
                <ShoppingCart
                  size={18}
                />

                <p className="text-xs font-bold uppercase">
                  Ventes
                </p>
              </div>

              <p className="mt-3 text-2xl font-bold text-green-700">
                {formatMoney(
                  totalSales
                )}
              </p>

              <p className="text-xs text-gray-500">
                FCFA
              </p>
            </div>

            <div
              className={`rounded-2xl p-5 ${
                result >= 0
                  ? "bg-green-50"
                  : "bg-red-50"
              }`}
            >
              <div
                className={`flex items-center gap-2 ${
                  result >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {result >= 0 ? (
                  <TrendingUp
                    size={18}
                  />
                ) : (
                  <TrendingDown
                    size={18}
                  />
                )}

                <p className="text-xs font-bold uppercase">
                  Résultat
                </p>
              </div>

              <p
                className={`mt-3 text-2xl font-bold ${
                  result >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {result > 0
                  ? "+"
                  : ""}

                {formatMoney(
                  result
                )}
              </p>

              <p className="text-xs text-gray-500">
                FCFA
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="text-xs font-bold uppercase text-blue-700">
                Rentabilité
              </p>

              <p className="mt-3 text-2xl font-bold text-blue-800">
                {profitability.toFixed(
                  1
                )}{" "}
                %
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            SUIVI DE PRODUCTION
        ========================= */}

        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Package
                  size={24}
                  className="text-green-700"
                />

                <h2 className="text-xl font-bold text-gray-900">
                  Suivi de production
                </h2>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Suivez la quantité réellement produite, vendue et encore disponible.
              </p>
            </div>

            <div className="flex w-full gap-2 md:w-auto">
              <div className="relative flex-1 md:w-48">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    producedQuantityInput
                  }
                  onChange={(
                    e
                  ) => {
                    setProducedQuantityInput(
                      e.target.value
                    );

                    setQuantitySaved(
                      false
                    );
                  }}
                  placeholder="Quantité produite"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-16 outline-none focus:border-green-600"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  {
                    productionUnit
                  }
                </span>
              </div>

              <button
                type="button"
                onClick={
                  handleSaveQuantity
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
              >
                <Save
                  size={18}
                />

                <span className="hidden sm:inline">
                  Enregistrer
                </span>
              </button>
            </div>
          </div>

          {quantitySaved && (
            <p className="mt-3 text-right text-sm font-semibold text-green-700">
              ✓ Quantité produite enregistrée
            </p>
          )}

          {/* CARTES */}

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="text-xs font-bold uppercase text-blue-600">
                Quantité produite
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-800">
                {formatQuantity(
                  producedQuantity
                )}{" "}
                {
                  productionUnit
                }
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-5">
              <p className="text-xs font-bold uppercase text-purple-600">
                Quantité vendue
              </p>

              <p className="mt-2 text-2xl font-bold text-purple-800">
                {formatQuantity(
                  soldQuantity
                )}{" "}
                {
                  productionUnit
                }
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-xs font-bold uppercase text-green-600">
                Quantité restante
              </p>

              <p className="mt-2 text-2xl font-bold text-green-800">
                {formatQuantity(
                  remainingQuantity
                )}{" "}
                {
                  productionUnit
                }
              </p>
            </div>

            <div className="rounded-2xl bg-orange-50 p-5">
              <p className="text-xs font-bold uppercase text-orange-600">
                Taux d&apos;écoulement
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-800">
                {sellThroughRate.toFixed(
                  1
                )}
                %
              </p>
            </div>
          </div>

          {/* PROGRESSION */}

          {producedQuantity > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500">
                <span>
                  Stock écoulé
                </span>

                <span>
                  {sellThroughRate.toFixed(
                    1
                  )}
                  %
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-green-600 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      sellThroughRate
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* UNITÉS INCOMPATIBLES */}

          {incompatibleSales.length >
            0 && (
            <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <Boxes
                  size={20}
                  className="mt-0.5 shrink-0 text-orange-600"
                />

                <div>
                  <p className="font-semibold text-orange-800">
                    Certaines ventes ne sont pas comptées dans le stock
                  </p>

                  <p className="mt-1 text-sm text-orange-700">
                    La production est suivie en{" "}
                    <strong>
                      {productionUnit}
                    </strong>
                    , mais{" "}
                    {
                      incompatibleSales.length
                    }{" "}
                    vente
                    {incompatibleSales.length >
                    1
                      ? "s utilisent"
                      : " utilise"}{" "}
                    une autre unité.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =========================
            DÉPENSES + VENTES
        ========================= */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* DÉPENSES */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Dépenses
                </h2>

                <p className="text-sm text-gray-500">
                  Dépenses ajoutées à cette spéculation.
                </p>
              </div>

              <Link
                href={`/depenses/nouvelle?speculationId=${speculation.id}`}
                className="text-sm font-semibold text-blue-600"
              >
                + Ajouter
              </Link>
            </div>

            {expenses.length === 0 ? (
              <p className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
                Aucune dépense ajoutée.
              </p>
            ) : (
              <div className="space-y-3">
                {expenses.map(
                  (
                    expense
                  ) => (
                    <div
                      key={
                        expense.id
                      }
                      className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {
                            expense.productName
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            expense.date
                          }{" "}
                          ·{" "}
                          {
                            expense.category
                          }
                        </p>
                      </div>

                      <p className="font-bold text-red-600">
                        {formatMoney(
                          expense.total
                        )}{" "}
                        FCFA
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* VENTES */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Ventes
                </h2>

                <p className="text-sm text-gray-500">
                  Ventes liées à cette spéculation.
                </p>
              </div>

              <Link
                href={`/ventes/nouvelle?speculationId=${speculation.id}`}
                className="text-sm font-semibold text-purple-600"
              >
                + Ajouter
              </Link>
            </div>

            {sales.length === 0 ? (
              <p className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
                Aucune vente ajoutée.
              </p>
            ) : (
              <div className="space-y-3">
                {sales.map(
                  (
                    sale
                  ) => (
                    <div
                      key={
                        sale.id
                      }
                      className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {
                            sale.quantity
                          }{" "}
                          {
                            sale.unit
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            sale.date
                          }

                          {sale.buyer
                            ? ` · ${sale.buyer}`
                            : ""}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-green-700">
                          {formatMoney(
                            sale.total
                          )}{" "}
                          FCFA
                        </p>

                        <p
                          className={`mt-1 text-xs font-semibold ${
                            sale.paymentStatus ===
                            "Payé"
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {
                            sale.paymentStatus
                          }
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}