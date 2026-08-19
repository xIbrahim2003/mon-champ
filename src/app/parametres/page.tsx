"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Save,
  Settings,
  Sprout,
  User,
  Coins,
  Ruler,
  CalendarDays,
} from "lucide-react";

import type {
  AppSettings,
} from "@/data/settingsData";

import {
  defaultSettings,
} from "@/data/settingsData";

import {
  getSupabaseSettings,
  saveSupabaseSettings,
} from "@/data/supabaseStorage";

export default function ParametresPage() {
  const [
    settings,
    setSettings,
  ] =
    useState<AppSettings>(
      defaultSettings
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
    saved,
    setSaved,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  /*
    =========================
    CHARGEMENT SUPABASE
    =========================
  */

  useEffect(() => {
    const loadSettings =
      async () => {
        try {
          setLoading(
            true
          );

          const data =
            await getSupabaseSettings();

          setSettings(
            data
          );
        } catch (error) {
          console.error(
            "Erreur chargement paramètres :",
            error
          );

          setErrorMessage(
            "Impossible de charger les paramètres."
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadSettings();
  }, []);

  /*
    =========================
    MODIFICATION FORMULAIRE
    =========================
  */

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSaved(
      false
    );

    setErrorMessage(
      ""
    );

    setSettings({
      ...settings,

      [e.target.name]:
        e.target.name ===
        "defaultCampaign"
          ? Number(
              e.target.value
            )
          : e.target.value,
    });
  };

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

      try {
        setSaving(
          true
        );

        setSaved(
          false
        );

        setErrorMessage(
          ""
        );

        await saveSupabaseSettings(
          settings
        );

        setSaved(
          true
        );
      } catch (error) {
        console.error(
          "Erreur sauvegarde paramètres :",
          error
        );

        let message =
          "Impossible d'enregistrer les paramètres.";

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
      <main className="min-h-screen bg-[#f7f8f7] p-5 md:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

            <p className="mt-4 text-sm text-gray-500">
              Chargement des paramètres...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f7] p-5 md:p-8">
      <div className="mx-auto max-w-3xl">
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
            Configuration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Paramètres
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Personnalisez les informations principales de votre exploitation.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="space-y-6">

            {/* NOM DU CHAMP */}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Sprout
                  size={18}
                />

                Nom du champ
              </label>

              <input
                name="farmName"
                value={
                  settings.farmName
                }
                onChange={
                  handleChange
                }
                placeholder="Ex : Ferme familiale"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            {/* PROPRIÉTAIRE */}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User
                  size={18}
                />

                Nom du propriétaire
              </label>

              <input
                name="ownerName"
                value={
                  settings.ownerName
                }
                onChange={
                  handleChange
                }
                placeholder="Ex : Moussa Diop"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            {/* DEVISE */}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Coins
                  size={18}
                />

                Devise
              </label>

              <select
                name="currency"
                value={
                  settings.currency
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="FCFA">
                  FCFA
                </option>

                <option value="EUR">
                  EUR
                </option>

                <option value="USD">
                  USD
                </option>

                <option value="CHF">
                  CHF
                </option>
              </select>
            </div>

            {/* UNITÉ DE SURFACE */}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Ruler
                  size={18}
                />

                Unité de surface
              </label>

              <select
                name="surfaceUnit"
                value={
                  settings.surfaceUnit
                }
                onChange={
                  handleChange
                }
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

            {/* CAMPAGNE */}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CalendarDays
                  size={18}
                />

                Campagne par défaut
              </label>

              <input
                name="defaultCampaign"
                type="number"
                value={
                  settings.defaultCampaign
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>
          </div>

          {/* SUCCÈS */}

          {saved && (
            <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-semibold text-green-700">
              ✓ Paramètres enregistrés dans Supabase
            </div>
          )}

          {/* ERREUR */}

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
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
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-4 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
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

                Enregistrer les paramètres
              </>
            )}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <Settings className="text-gray-500" />

            <div>
              <p className="font-semibold text-gray-900">
                Prototype V1
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Les paramètres sont maintenant enregistrés dans la base de données.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}