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
} from "lucide-react";

import type {
  Speculation,
} from "@/data/mockData";

import {
  getSupabaseSpeculations,
  saveSupabaseExpense,
} from "@/data/supabaseStorage";

export default function NouvelleDepensePage() {
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
  ] = useState({
    speculationId: "",
    date: "",
    category: "Engrais",
    productName: "",
    quantity: "",
    unit: "sac",
    unitPrice: "",
    supplier: "",
    note: "",
  });

  /*
    =========================
    CHARGEMENT SPÉCULATIONS
    DEPUIS SUPABASE
    =========================
  */

  useEffect(() => {
    const loadSpeculations =
      async () => {
        try {
          setLoading(true);

          const data =
            await getSupabaseSpeculations();

          setAllSpeculations(
            data
          );

          if (
            data.length > 0
          ) {
            const exists =
              data.some(
                (
                  speculation
                ) =>
                  String(
                    speculation.id
                  ) ===
                  preselectedSpeculationId
              );

            setForm(
              (
                current
              ) => ({
                ...current,

                speculationId:
                  exists &&
                  preselectedSpeculationId
                    ? preselectedSpeculationId
                    : current.speculationId ||
                      String(
                        data[0]
                          .id
                      ),
              })
            );
          }
        } catch (error) {
          console.error(
            "Erreur chargement spéculations :",
            error
          );

          setErrorMessage(
            "Impossible de charger les spéculations."
          );
        } finally {
          setLoading(false);
        }
      };

    loadSpeculations();
  }, [
    preselectedSpeculationId,
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
    CALCUL TOTAL
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
    ENREGISTREMENT SUPABASE
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
        !form.speculationId
      ) {
        setErrorMessage(
          "Veuillez sélectionner une spéculation."
        );

        return;
      }

      try {
        setSaving(true);

        setErrorMessage(
          ""
        );

        /*
          Pas besoin de créer
          Date.now().

          Supabase génère
          automatiquement l'ID.
        */

        const createdExpense =
          await saveSupabaseExpense(
            {
              speculationId:
                Number(
                  form.speculationId
                ),

              date:
                form.date,

              category:
                form.category,

              productName:
                form.productName.trim(),

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

              supplier:
                form.supplier.trim() ||
                undefined,

              note:
                form.note.trim() ||
                undefined,
            }
          );

        console.log(
          "DÉPENSE SUPABASE CRÉÉE :",
          createdExpense
        );

        /*
          Si on vient d'une fiche
          de spéculation, retour
          sur cette fiche.
        */

        if (
          preselectedSpeculationId
        ) {
          router.push(
            `/speculations/${preselectedSpeculationId}`
          );

          return;
        }

        /*
          Sinon retour Dashboard.
        */

        router.push(
          "/"
        );
      } catch (error) {
        console.error(
          "ERREUR CRÉATION DÉPENSE :",
          error
        );

        let message =
          "Impossible d'enregistrer la dépense.";

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
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

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
          {/* HEADER */}

          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600">
              Nouvelle opération
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Ajouter une dépense
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Enregistrez une dépense et rattachez-la à une spéculation.
            </p>
          </div>

          {/* AUCUNE SPÉCULATION */}

          {allSpeculations.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="font-semibold text-gray-900">
                Aucune spéculation disponible
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Vous devez créer une spéculation avant d&apos;enregistrer une dépense.
              </p>

              <Link
                href="/speculations/nouvelle"
                className="mt-5 inline-flex rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"
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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              {/* CATÉGORIE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Catégorie
                </label>

                <select
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                >
                  <option>
                    Semences
                  </option>

                  <option>
                    Engrais
                  </option>

                  <option>
                    Produits phytosanitaires
                  </option>

                  <option>
                    Salaires
                  </option>

                  <option>
                    Carburant
                  </option>

                  <option>
                    Transport
                  </option>

                  <option>
                    Eau / Irrigation
                  </option>

                  <option>
                    Matériel
                  </option>

                  <option>
                    Réparation
                  </option>

                  <option>
                    Location
                  </option>

                  <option>
                    Emballage
                  </option>

                  <option>
                    Autre
                  </option>
                </select>
              </div>

              {/* PRODUIT */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Produit / Service
                </label>

                <input
                  name="productName"
                  value={
                    form.productName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Ex : Engrais NPK 15-15-15"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              {/* QUANTITÉ + UNITÉ */}

              <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Quantité
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
                    placeholder="Ex : 10"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
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
                      sac
                    </option>

                    <option>
                      kg
                    </option>

                    <option>
                      tonne
                    </option>

                    <option>
                      litre
                    </option>

                    <option>
                      unité
                    </option>

                    <option>
                      jour
                    </option>

                    <option>
                      heure
                    </option>

                    <option>
                      autre
                    </option>
                  </select>
                </div>
              </div>

              {/* PRIX UNITAIRE */}

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
                    placeholder="Ex : 18000"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 outline-none focus:border-blue-600"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    FCFA
                  </span>
                </div>
              </div>

              {/* TOTAL */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase text-blue-600">
                  Montant total
                </p>

                <p className="mt-2 text-2xl font-bold text-blue-700">
                  {new Intl.NumberFormat(
                    "fr-FR"
                  ).format(
                    total
                  )}{" "}
                  FCFA
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Calcul automatique : quantité × prix unitaire
                </p>
              </div>

              {/* FOURNISSEUR */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Fournisseur
                </label>

                <input
                  name="supplier"
                  value={
                    form.supplier
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Ex : Agro Plus"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />
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
                  placeholder="Ajouter une note..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

                    Enregistrer la dépense
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