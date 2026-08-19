export type Sale = {
  id: number;
  speculationId: number;
  date: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  buyer?: string;
  paymentStatus: "Payé" | "Non payé";
  note?: string;
};