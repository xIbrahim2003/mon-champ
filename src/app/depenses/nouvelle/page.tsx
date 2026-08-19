import {
  Suspense,
} from "react";

import NouvelleDepenseClient from "./NouvelleDepenseClient";

export default function NouvelleDepensePage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <NouvelleDepenseClient />
    </Suspense>
  );
}