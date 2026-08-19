export type Expense = {
  id: number;
  speculationId: number;
  date: string;
  category: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  supplier?: string;
  note?: string;
};