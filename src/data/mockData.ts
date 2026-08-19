export type SpeculationStatus =
  | "En préparation"
  | "En cours"
  | "Récolte"
  | "Terminée";

export type Speculation = {
  id: number;
  name: string;
  emoji: string;
  type: string;
  campaign: number;
  surface: number;
  expenses: number;
  sales: number;

  startDate?: string;
  harvestDate?: string;

  quantity?: number;
  unit?: string;

  // Gestion de la spéculation
  manager?: string;
  status?: SpeculationStatus;
};

export const speculations: Speculation[] = [
  {
    id: 1,
    name: "Pomme de terre",
    emoji: "🥔",
    type: "Légume",
    campaign: 2026,
    surface: 5,
    expenses: 0,
    sales: 0,
    manager: "",
    status: "En cours",
  },
  {
    id: 2,
    name: "Mangue",
    emoji: "🥭",
    type: "Fruit",
    campaign: 2026,
    surface: 3,
    expenses: 0,
    sales: 0,
    manager: "",
    status: "En cours",
  },
  {
    id: 3,
    name: "Citron",
    emoji: "🍋",
    type: "Fruit",
    campaign: 2026,
    surface: 2,
    expenses: 0,
    sales: 0,
    manager: "",
    status: "En cours",
  },
  {
    id: 4,
    name: "Pastèque",
    emoji: "🍉",
    type: "Fruit",
    campaign: 2026,
    surface: 4,
    expenses: 0,
    sales: 0,
    manager: "",
    status: "En cours",
  },
];