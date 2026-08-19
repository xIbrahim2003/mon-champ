"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ArrowLeft,
  Save,
  Package,
} from "lucide-react";

import type {
  Speculation,
} from "@/data/mockData";

import type {
  Sale,
} from "@/data/saleData";

import {
  getSupabaseSpeculations,
  getSupabaseSales,
  saveSupabaseSale,
} from "@/data/supabaseStorage";

const formatQuantity = (
  value: number
) =>
  new Intl.NumberFormat(
    "fr-FR",
    {
      maximumFractionDigits: 2,
    }
  ).format(value);

export default function NouvelleVentePage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const preselectedSpeculationId =
    searchParams.get(
      "speculationId"
    );

  const [
    allSpeculations,
    setAllSpeculations,
  ] =
    useState<Speculation[]>(
      []
    );

  const [
    existingSales,
    setExistingSales,
  ] =
    useState<Sale[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    form,
    setForm,
  ] =
    useState({
      speculationId: "",
      date: "",
      quantity: "",
      unit: "kg",
      unitPrice: "",
      buyer: "",
      paymentStatus: "Payé",
      note: "",
    });

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
            speculations,
            sales,
          ] =
            await Promise.all([
              getSupabaseSpeculations(),
              getSupabaseSales(),
            ]);

          setAllSpeculations(
            speculations
          );

          setExistingSales(
            sales
          );

          if (
            speculations.length >
            0
          ) {
            const exists =
              speculations.some(
                (
                  speculation
                ) =>
                  String(
                    speculation.id
                  ) ===
                  preselectedSpeculationId
              );

            const selectedId =
              exists &&
              preselectedSpeculationId
                ? preselectedSpeculationId
                : String(
                    speculations[0]
                      .id
                  );

            const selectedSpeculation =
              speculations.find(
                (
                  speculation
                ) =>
                  String(
                    speculation.id
                  ) ===
                  selectedId
              );

            setForm(
              (
                current
              ) => ({
                ...current,

                speculationId:
                  selectedId,

                unit:
                  selectedSpeculation?.unit ||
                  "kg",
              })
            );
          }
        } catch (error) {
          console.error(
            "Erreur chargement données vente :",
            error
          );

          setErrorMessage(
            "Impossible de charger les données."
          );
        } finally {
          setLoading(false);
        }
      };

    loadData();
  }, [
    preselectedSpeculationId,
  ]);

  /*
    =========================
    SPÉCULATION SÉLECTIONNÉE
    =========================
  */

  const selectedSpeculation =
    useMemo(() => {
      return (
        allSpeculations.find(
          (
            speculation
          ) =>
            speculation.id ===
            Number(
              form.speculationId
            )
        ) || null
      );
    }, [
      allSpeculations,
      form.speculationId,
    ]);

  /*
    =========================
    VENTES EXISTANTES
    COMPATIBLES
    =========================
  */

  const soldQuantity =
    useMemo(() => {
      if (
        !selectedSpeculation
      ) {
        return 0;
      }

      const productionUnit =
        selectedSpeculation.unit ||
        "kg";

      return existingSales
        .filter(
          (
            sale
          ) =>
            sale.speculationId ===
              selectedSpeculation.id &&
            sale.unit ===
              productionUnit
        )
        .reduce(
          (
            total,
            sale
          ) =>
            total +
            sale.quantity,
          0
        );
    }, [
      existingSales,
      selectedSpeculation,
    ]);

  /*
    =========================
    STOCK DISPONIBLE
    =========================
  */

  const producedQuantity =
    selectedSpeculation?.quantity ||
    0;

  const productionUnit =
    selectedSpeculation?.unit ||
    "kg";

  const availableStock =
    Math.max(
      0,
      producedQuantity -
        soldQuantity
    );

  /*
    =========================
    MODIFICATION FORMULAIRE
    =========================
  */

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const {
      name,
      value,
    } = e.target;

    setErrorMessage(
      ""
    );

    /*
      Si on change de spéculation,
      on remet automatiquement
      l'unité de production.
    */

    if (
      name ===
      "speculationId"
    ) {
      const speculation =
        allSpeculations.find(
          (
            item
          ) =>
            item.id ===
            Number(
              value
            )
        );

      setForm({
        ...form,

        speculationId:
          value,

        unit:
          speculation?.unit ||
          "kg",

        quantity:
          "",
      });

      return;
    }

    setForm({
      ...form,

      [name]:
        value,
    });
  };

  /*
    =========================
    TOTAL
    =========================
  */

  const total =
    useMemo(() => {
      const quantity =
        Number(
          form.quantity
        ) || 0;

      const unitPrice =
        Number(
          form.unitPrice
        ) || 0;

      return (
        quantity *
        unitPrice
      );
    }, [
      form.quantity,
      form.unitPrice,
    ]);

  const requestedQuantity =
    Number(
      form.quantity
    ) || 0;

  const stockExceeded =
    requestedQuantity >
    availableStock;

  const incompatibleUnit =
    Boolean(
      selectedSpeculation &&
        form.unit !==
          productionUnit
    );

  /*
    =========================
    ENREGISTREMENT
    =========================
  */

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (saving) {
        return;
      }

      if (
        !selectedSpeculation
      ) {
        setErrorMessage(
          "Veuillez sélectionner une spéculation."
        );

        return;
      }

      if (
        requestedQuantity <=
        0
      ) {
        setErrorMessage(
          "La quantité vendue doit être supérieure à 0."
        );

        return;
      }

      /*
        Pour le prototype,
        on exige la même unité
        que celle utilisée pour
        suivre la production.
      */

      if (
        incompatibleUnit
      ) {
        setErrorMessage(
          `Cette production est suivie en ${productionUnit}. Utilisez la même unité pour la vente.`
        );

        return;
      }

      if (
        requestedQuantity >
        availableStock
      ) {
        setErrorMessage(
          `Stock insuffisant. Il reste seulement ${formatQuantity(
            availableStock
          )} ${productionUnit} disponible(s).`
        );

        return;
      }

      try {
        setSaving(true);

        setErrorMessage(
          ""
        );

        const createdSale =
          await saveSupabaseSale({
            speculationId:
              selectedSpeculation.id,

            date:
              form.date,

            quantity:
              requestedQuantity,

            unit:
              productionUnit,

            unitPrice:
              Number(
                form.unitPrice
              ) || 0,

            total,

            buyer:
              form.buyer.trim() ||
              undefined,

            paymentStatus:
              form.paymentStatus as
                | "Payé"
                | "Non payé",

            note:
              form.note.trim() ||
              undefined,
          });

        console.log(
          "VENTE CRÉÉE :",
          createdSale
        );

        if (
          preselectedSpeculationId
        ) {
          router.push(
            `/speculations/${preselectedSpeculationId}`
          );

          return;
        }

        router.push(
          "/"
        );
      } catch (error) {
        console.error(
          "Erreur création vente :",
          error
        );

        let message =
          "Impossible d'enregistrer la vente.";

        if (
          error &&
          typeof error ===
            "object" &&
          "message" in error
        ) {
          message =
            String(
              (
                error as {
                  message?: unknown;
                }
              ).message ||
                message
            );
        }

        setErrorMessage(
          message
        );
      } finally {
        setSaving(false);
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
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />

            <p className="mt-4 text-sm text-gray-500">
              Chargement...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f7] p-5 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href={
            preselectedSpeculationId
              ? `/speculations/${preselectedSpeculationId}`
              : "/"
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-green-700"
        >
          <ArrowLeft
            size={18}
          />

          {preselectedSpeculationId
            ? "Retour à la spéculation"
            : "Retour au Dashboard"}
        </Link>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-purple-600">
              Nouvelle opération
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Ajouter une vente
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Enregistrez une vente liée à une spéculation.
            </p>
          </div>

          {allSpeculations.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="font-semibold text-gray-900">
                Aucune spéculation disponible
              </p>

              <Link
                href="/speculations/nouvelle"
                className="mt-5 inline-flex rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white"
              >
                Créer une spéculation
              </Link>
            </div>
          ) : (
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >
              {/* SPÉCULATION */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Spéculation
                </label>

                <select
                  name="speculationId"
                  value={
                    form.speculationId
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
                >
                  {allSpeculations.map(
                    (
                      speculation
                    ) => (
                      <option
                        key={
                          speculation.id
                        }
                        value={
                          speculation.id
                        }
                      >
                        {
                          speculation.emoji
                        }{" "}
                        {
                          speculation.name
                        }{" "}
                        — Campagne{" "}
                        {
                          speculation.campaign
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* STOCK */}

              {selectedSpeculation && (
                <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                  <div className="flex items-start gap-3">
                    <Package
                      size={22}
                      className="mt-1 shrink-0 text-green-700"
                    />

                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase text-green-700">
                        Stock disponible
                      </p>

                      <p className="mt-1 text-2xl font-bold text-green-800">
                        {formatQuantity(
                          availableStock
                        )}{" "}
                        {
                          productionUnit
                        }
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">
                            Produit
                          </p>

                          <p className="font-semibold text-gray-900">
                            {formatQuantity(
                              producedQuantity
                            )}{" "}
                            {
                              productionUnit
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Déjà vendu
                          </p>

                          <p className="font-semibold text-gray-900">
                            {formatQuantity(
                              soldQuantity
                            )}{" "}
                            {
                              productionUnit
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DATE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Date
                </label>

                <input
                  name="date"
                  type="date"
                  value={
                    form.date
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              {/* QUANTITÉ */}

              <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Quantité vendue
                  </label>

                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    max={
                      availableStock
                    }
                    value={
                      form.quantity
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className={`w-full rounded-xl border px-4 py-3 outline-none ${
                      stockExceeded
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-gray-300 focus:border-purple-600"
                    }`}
                  />

                  {stockExceeded && (
                    <p className="mt-2 text-sm font-semibold text-red-600">
                      Stock insuffisant : seulement{" "}
                      {formatQuantity(
                        availableStock
                      )}{" "}
                      {
                        productionUnit
                      }{" "}
                      disponible(s).
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Unité
                  </label>

                  <select
                    name="unit"
                    value={
                      form.unit
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  >
                    <option value="kg">
                      kg
                    </option>

                    <option value="tonne">
                      tonne
                    </option>

                    <option value="sac">
                      sac
                    </option>

                    <option value="caisse">
                      caisse
                    </option>

                    <option value="unité">
                      unité
                    </option>

                    <option value="autre">
                      autre
                    </option>
                  </select>
                </div>
              </div>

              {incompatibleUnit && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-700">
                  Cette spéculation est suivie en{" "}
                  {productionUnit}. Utilisez cette même unité pour éviter les erreurs de stock.
                </div>
              )}

              {/* PRIX */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Prix unitaire
                </label>

                <div className="relative">
                  <input
                    name="unitPrice"
                    type="number"
                    min="0"
                    value={
                      form.unitPrice
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    FCFA
                  </span>
                </div>
              </div>

              {/* TOTAL */}

              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
                <p className="text-xs font-bold uppercase text-purple-600">
                  Montant total
                </p>

                <p className="mt-2 text-2xl font-bold text-purple-700">
                  {new Intl.NumberFormat(
                    "fr-FR"
                  ).format(
                    total
                  )}{" "}
                  FCFA
                </p>
              </div>

              {/* ACHETEUR */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Acheteur
                </label>

                <input
                  name="buyer"
                  value={
                    form.buyer
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              {/* PAIEMENT */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Statut de paiement
                </label>

                <select
                  name="paymentStatus"
                  value={
                    form.paymentStatus
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                >
                  <option>
                    Payé
                  </option>

                  <option>
                    Non payé
                  </option>
                </select>
              </div>

              {/* NOTE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Note
                </label>

                <textarea
                  name="note"
                  value={
                    form.note
                  }
                  onChange={
                    handleChange
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              {/* ERREUR */}

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {
                    errorMessage
                  }
                </div>
              )}

              {/* BOUTON */}

              <button
                type="submit"
                disabled={
                  saving ||
                  stockExceeded ||
                  incompatibleUnit ||
                  availableStock <=
                    0
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-4 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save
                      size={19}
                    />

                    Enregistrer la vente
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}