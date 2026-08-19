"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  Save,
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
  updateSupabaseSale,
} from "@/data/supabaseStorage";

export default function ModifierVentePage() {
  const router =
    useRouter();

  const params =
    useParams();

  const saleId =
    Number(
      params.id
    );

  const [
    allSpeculations,
    setAllSpeculations,
  ] =
    useState<Speculation[]>(
      []
    );

  const [
    saleFound,
    setSaleFound,
  ] =
    useState(false);

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
          setLoading(
            true
          );

          const [
            sales,
            speculations,
          ] =
            await Promise.all([
              getSupabaseSales(),
              getSupabaseSpeculations(),
            ]);

          setAllSpeculations(
            speculations
          );

          const sale =
            sales.find(
              (
                item
              ) =>
                item.id ===
                saleId
            );

          if (!sale) {
            setSaleFound(
              false
            );

            return;
          }

          setSaleFound(
            true
          );

          setForm({
            speculationId:
              String(
                sale.speculationId
              ),

            date:
              sale.date,

            quantity:
              String(
                sale.quantity
              ),

            unit:
              sale.unit,

            unitPrice:
              String(
                sale.unitPrice
              ),

            buyer:
              sale.buyer ||
              "",

            paymentStatus:
              sale.paymentStatus,

            note:
              sale.note ||
              "",
          });
        } catch (error) {
          console.error(
            "Erreur chargement vente :",
            error
          );

          setErrorMessage(
            "Impossible de charger la vente."
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadData();
  }, [
    saleId,
  ]);

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
    setForm({
      ...form,

      [e.target.name]:
        e.target.value,
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

  /*
    =========================
    MODIFICATION SUPABASE
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

      try {
        setSaving(
          true
        );

        setErrorMessage(
          ""
        );

        const updatedSale: Sale =
          {
            id:
              saleId,

            speculationId:
              Number(
                form.speculationId
              ),

            date:
              form.date,

            quantity:
              Number(
                form.quantity
              ) || 0,

            unit:
              form.unit,

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
          };

        const result =
          await updateSupabaseSale(
            updatedSale
          );

        console.log(
          "VENTE MODIFIÉE :",
          result
        );

        router.push(
          "/ventes"
        );
      } catch (error) {
        console.error(
          "Erreur modification vente :",
          error
        );

        let message =
          "Impossible de modifier la vente.";

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

        window.alert(
          `Erreur Supabase : ${message}`
        );
      } finally {
        setSaving(
          false
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
      <main className="min-h-screen bg-[#f7f8f7] p-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />

            <p className="mt-4 text-sm text-gray-500">
              Chargement de la vente...
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

  if (
    !saleFound
  ) {
    return (
      <main className="min-h-screen bg-[#f7f8f7] p-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/ventes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600"
          >
            <ArrowLeft
              size={18}
            />

            Retour aux ventes
          </Link>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <p className="font-semibold text-gray-900">
              Vente introuvable.
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
          href="/ventes"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-purple-600"
        >
          <ArrowLeft
            size={18}
          />

          Retour aux ventes
        </Link>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-purple-600">
              Modification
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Modifier la vente
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Corrigez les informations de cette vente.
            </p>
          </div>

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

            {/* QUANTITÉ + UNITÉ */}

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
                  value={
                    form.quantity
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
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
                  <option>
                    kg
                  </option>

                  <option>
                    tonne
                  </option>

                  <option>
                    sac
                  </option>

                  <option>
                    caisse
                  </option>

                  <option>
                    unité
                  </option>

                  <option>
                    autre
                  </option>
                </select>
              </div>
            </div>

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
                Nouveau montant total
              </p>

              <p className="mt-2 text-2xl font-bold text-purple-700">
                {new Intl.NumberFormat(
                  "fr-FR"
                ).format(
                  total
                )}{" "}
                FCFA
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Recalcul automatique : quantité × prix unitaire
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
                saving
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-4 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
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

                  Enregistrer les modifications
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}