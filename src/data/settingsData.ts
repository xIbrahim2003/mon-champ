export type AppSettings = {
  farmName: string;
  ownerName: string;
  currency: string;
  surfaceUnit: string;
  defaultCampaign: number;
};

export const defaultSettings: AppSettings = {
  farmName: "Mon Champ",
  ownerName: "Papa",
  currency: "FCFA",
  surfaceUnit: "ha",
  defaultCampaign: 2026,
};