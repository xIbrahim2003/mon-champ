"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import {
  getSupabaseSettings,
  saveSupabaseSpeculation,
  saveSupabaseExpense,
} from "@/data/supabaseStorage";

import type {
  Speculation,
  SpeculationStatus,
} from "@/data/mockData";

import { getCropEmoji } from "@/data/cropEmojis";

export default function NouvelleSpeculationPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "Légume",
    manager: "",
    status: "En préparation" as SpeculationStatus,
    surface: "",
    surfaceUnit: "ha",
    campaign: "",
    startDate: "",
    harvestDate: "",
    quantity: "",
    unit: "kg",
    initialPrice: "",
  });

  /*
  ========================================
  CHARGEMENT DES PARAMÈTRES DEPUIS SUPABASE
  ========================================
  */

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSupabaseSettings();

        setForm((current) => ({
          ...current,
          campaign: String(settings.defaultCampaign),
          surfaceUnit: settings.surfaceUnit || "ha",
        }));
      } catch (error) {
        console.error(
          "Erreur chargement paramètres :",
          error
        );

        setErrorMessage(
          "Impossible de charger les paramètres."
        );
      }
    };

    loadSettings();
  }, []);

  /*
  ========================================
  MODIFICATION DU FORMULAIRE
  ========================================
  */

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    setErrorMessage("");

    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  /*
  ========================================
  ENREGISTREMENT
  ========================================
  */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    setErrorMessage("");

    /*
    ========================================
    VALIDATIONS
    ========================================
    */

    if (!form.name.trim()) {
      setErrorMessage(
        "Veuillez renseigner le nom du produit."
      );
      return;
    }

    if (Number(form.surface) <= 0) {
      setErrorMessage(
        "La surface doit être supérieure à 0."
      );
      return;
    }

    if (!Number(form.campaign)) {
      setErrorMessage(
        "Veuillez renseigner une campagne valide."
      );
      return;
    }

    if (
      form.harvestDate &&
      form.startDate &&
      form.harvestDate < form.startDate
    ) {
      setErrorMessage(
        "La date de récolte ne peut pas être antérieure à la date de début."
      );
      return;
    }

    try {
      setSaving(true);

      /*
      ========================================
      CRÉATION DE LA SPÉCULATION
      ========================================
      */

      const speculation: Speculation = {
        id: 0,

        name: form.name.trim(),

        emoji: getCropEmoji(
          form.name,
          form.type
        ),

        type: form.type,

        manager: form.manager.trim(),

        status: form.status,

        surface:
          Number(form.surface) || 0,

        campaign:
          Number(form.campaign),

        expenses: 0,

        sales: 0,

        startDate:
          form.startDate || undefined,

        harvestDate:
          form.harvestDate || undefined,

        quantity:
          Number(form.quantity) || 0,

        unit: form.unit,
      };

      const createdSpeculation =
        await saveSupabaseSpeculation(
          speculation
        );

      const speculationId =
        Number(createdSpeculation.id);

      if (
        !Number.isFinite(speculationId) ||
        speculationId <= 0
      ) {
        throw new Error(
          "Supabase n'a pas retourné un ID de spéculation valide."
        );
      }

      /*
      ========================================
      CRÉATION DU COÛT INITIAL
      ========================================

      Si l'utilisateur entre un coût initial,
      on crée automatiquement une dépense
      liée à la nouvelle spéculation.
      */

      const initialPrice =
        Number(form.initialPrice) || 0;

      if (initialPrice > 0) {
        const expenseDate =
          form.startDate ||
          new Date()
            .toISOString()
            .split("T")[0];

        await saveSupabaseExpense({
          speculationId,

          date: expenseDate,

          category: "Semences",

          productName: "Coût initial",

          quantity: 1,

          unit: "opération",

          unitPrice: initialPrice,

          total: initialPrice,

          supplier: undefined,

          note:
            "Dépense initiale enregistrée lors de la création de la spéculation",
        });
      }

      /*
      ========================================
      REDIRECTION
      ========================================
      */

      router.push(
        `/speculations/${speculationId}`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erreur création spéculation :",
        error
      );

      let message =
        "Impossible d'enregistrer la spéculation.";

      if (
        error &&
        typeof error === "object" &&
        "message" in error
      ) {
        const errorWithMessage =
          error as {
            message?: unknown;
          };

        if (errorWithMessage.message) {
          message = String(
            errorWithMessage.message
          );
        }
      }

      setErrorMessage(message);

      window.alert(
        `Erreur Supabase : ${message}`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8f7] p-5 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* RETOUR */}

        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-green-700"
        >
          <ArrowLeft size={18} />
          Retour au Dashboard
        </Link>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          {/* TITRE */}

          <div className="mb-8">
            <p className="text-sm font-semibold text-green-700">
              Nouvelle production
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Nouvelle spéculation
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Ajoutez un fruit, un légume ou une autre culture à suivre.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* NOM */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nom du produit
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex : Pomme de terre"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* TYPE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="Légume">
                  Légume
                </option>

                <option value="Fruit">
                  Fruit
                </option>

                <option value="Céréale">
                  Céréale
                </option>

                <option value="Autre">
                  Autre
                </option>
              </select>
            </div>

            {/* RESPONSABLE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Responsable
              </label>

              <input
                name="manager"
                value={form.manager}
                onChange={handleChange}
                placeholder="Ex : Mamadou Diop"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* STATUT */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Statut
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="En préparation">
                  En préparation
                </option>

                <option value="En cours">
                  En cours
                </option>

                <option value="Récolte">
                  Récolte
                </option>

                <option value="Terminée">
                  Terminée
                </option>
              </select>
            </div>

            {/* SURFACE */}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Surface cultivée
                </label>

                <input
                  name="surface"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.surface}
                  onChange={handleChange}
                  placeholder="Ex : 5"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Unité de surface
                </label>

                <select
                  name="surfaceUnit"
                  value={form.surfaceUnit}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                >
                  <option value="ha">
                    Hectares (ha)
                  </option>

                  <option value="m²">
                    Mètres carrés (m²)
                  </option>
                </select>
              </div>
            </div>

            {/* CAMPAGNE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Campagne
              </label>

              <input
                name="campaign"
                type="number"
                value={form.campaign}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            {/* DATES */}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Date de début
                </label>

                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Date estimée de récolte
                </label>

                <input
                  name="harvestDate"
                  type="date"
                  value={form.harvestDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                />
              </div>
            </div>

            {/* QUANTITÉ INITIALE */}

            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Quantité initiale
                </label>

                <input
                  name="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="Ex : 2000"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Unité
                </label>

                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
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

                  <option value="plant">
                    plant
                  </option>

                  <option value="autre">
                    autre
                  </option>
                </select>
              </div>
            </div>

            {/* COÛT INITIAL */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Coût initial
              </label>

              <div className="relative">
                <input
                  name="initialPrice"
                  type="number"
                  min="0"
                  step="1"
                  value={form.initialPrice}
                  onChange={handleChange}
                  placeholder="Ex : 350000"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 outline-none focus:border-green-600"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  FCFA
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Ce montant sera automatiquement enregistré comme une dépense liée à cette spéculation.
              </p>
            </div>

            {/* ERREUR */}

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            {/* BOUTON */}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-4 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={19} />
                  Enregistrer la spéculation
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}