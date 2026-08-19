"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  Home,
  Sprout,
  Wallet,
  ShoppingCart,
  History,
  ChartNoAxesCombined,
  Settings,
  Menu,
  X,
} from "lucide-react";

import type {
  AppSettings,
} from "@/data/settingsData";

import {
  defaultSettings,
} from "@/data/settingsData";

import {
  getSupabaseSettings,
} from "@/data/supabaseStorage";

const menu = [
  {
    name: "Accueil",
    icon: Home,
    href: "/",
  },
  {
    name: "Spéculations",
    icon: Sprout,
    href: "/speculations",
  },
  {
    name: "Dépenses",
    icon: Wallet,
    href: "/depenses",
  },
  {
    name: "Ventes",
    icon: ShoppingCart,
    href: "/ventes",
  },
  {
    name: "Historiques",
    icon: History,
    href: "/historiques",
  },
  {
    name: "Rapports",
    icon: ChartNoAxesCombined,
    href: "/rapports",
  },
  {
    name: "Paramètres",
    icon: Settings,
    href: "/parametres",
  },
];

export default function Sidebar() {
  const pathname =
    usePathname();

  const [
    settings,
    setSettings,
  ] =
    useState<AppSettings>(
      defaultSettings
    );

  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(false);

  /*
    =========================
    CHARGEMENT PARAMÈTRES
    DEPUIS SUPABASE
    =========================
  */

  useEffect(() => {
    const loadSettings =
      async () => {
        try {
          const data =
            await getSupabaseSettings();

          setSettings(
            data
          );
        } catch (error) {
          console.error(
            "Erreur chargement paramètres Sidebar :",
            error
          );
        }
      };

    loadSettings();

    /*
      Ferme automatiquement
      le menu mobile lorsqu'on
      change de page.
    */

    setMobileOpen(
      false
    );
  }, [
    pathname,
  ]);

  /*
    =========================
    LIEN ACTIF
    =========================
  */

  const isActive = (
    href: string
  ) => {
    if (
      href === "/"
    ) {
      return (
        pathname === "/"
      );
    }

    return pathname.startsWith(
      href
    );
  };

  /*
    =========================
    CONTENU SIDEBAR
    =========================
  */

  const SidebarContent = ({
    mobile = false,
  }: {
    mobile?: boolean;
  }) => (
    <>
      {/* LOGO / NOM DU CHAMP */}

      <div className="mb-10 flex items-center justify-between">
        <Link
          href="/"
          onClick={() =>
            mobile &&
            setMobileOpen(
              false
            )
          }
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-xl">
            🌱
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-green-700">
              {
                settings.farmName
              }
            </h1>
          </div>
        </Link>

        {/* FERMETURE MOBILE */}

        {mobile && (
          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                false
              )
            }
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100"
            aria-label="Fermer le menu"
          >
            <X
              size={24}
            />
          </button>
        )}
      </div>

      {/* MENU */}

      <nav className="flex flex-col gap-2">
        {menu.map(
          (
            item
          ) => {
            const Icon =
              item.icon;

            const active =
              isActive(
                item.href
              );

            return (
              <Link
                key={
                  item.name
                }
                href={
                  item.href
                }
                onClick={() =>
                  mobile &&
                  setMobileOpen(
                    false
                  )
                }
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-green-700 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={19}
                />

                {
                  item.name
                }
              </Link>
            );
          }
        )}
      </nav>

      {/* UTILISATEUR */}

      <div className="mt-auto rounded-2xl bg-gray-50 p-4">
        <p className="text-xs text-gray-500">
          Bonjour,
        </p>

        <p className="mt-1 truncate font-semibold text-gray-800">
          {settings.ownerName ||
            "Utilisateur"}
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* =========================
          DESKTOP
      ========================= */}

      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-gray-200 bg-white p-5 lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* =========================
          BOUTON MOBILE
      ========================= */}

      <button
        type="button"
        onClick={() =>
          setMobileOpen(
            true
          )
        }
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-md lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu
          size={23}
        />
      </button>

      {/* =========================
          OVERLAY MOBILE
      ========================= */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() =>
            setMobileOpen(
              false
            )
          }
        />
      )}

      {/* =========================
          SIDEBAR MOBILE
      ========================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-gray-200 bg-white p-5 shadow-xl transition-transform duration-300 lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <SidebarContent
          mobile
        />
      </aside>
    </>
  );
}