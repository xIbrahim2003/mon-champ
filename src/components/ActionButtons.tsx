import Link from "next/link";
import {
  Sprout,
  Wallet,
  ShoppingCart,
} from "lucide-react";

export default function ActionButtons() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Link
        href="/speculations/nouvelle"
        className="flex items-center justify-center gap-3 rounded-2xl bg-green-700 px-5 py-4 font-semibold text-white transition hover:bg-green-800"
      >
        <Sprout size={20} />
        Nouvelle spéculation
      </Link>

      <button className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 py-4 font-semibold text-white transition hover:bg-blue-700">
        <Wallet size={20} />
        Ajouter une dépense
      </button>

      <button className="flex items-center justify-center gap-3 rounded-2xl bg-violet-600 px-5 py-4 font-semibold text-white transition hover:bg-violet-700">
        <ShoppingCart size={20} />
        Ajouter une vente
      </button>
    </div>
  );
}