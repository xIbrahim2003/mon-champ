import { supabase } from "@/lib/supabase";

import type { Speculation } from "./mockData";
import type { Expense } from "./expenseData";
import type { Sale } from "./saleData";
import type { AppSettings } from "./settingsData";

/* =========================================================
   SPÉCULATIONS
========================================================= */

export async function getSupabaseSpeculations(): Promise<
  Speculation[]
> {
  const { data, error } = await supabase
    .from("speculations")
    .select("*")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Erreur récupération spéculations :",
      error
    );

    return [];
  }

  return (data || []).map((item) => ({
    id: Number(item.id),

    name: item.name,
    emoji: item.emoji || "🌱",
    type: item.type,

    campaign: Number(item.campaign),
    surface: Number(item.surface),

    expenses: 0,
    sales: 0,

    startDate:
      item.start_date || undefined,

    harvestDate:
      item.harvest_date || undefined,

    quantity:
      Number(item.quantity) || 0,

    unit:
      item.unit || "kg",

    manager:
      item.manager || undefined,

    status:
      item.status || "En préparation",
  }));
}

export async function saveSupabaseSpeculation(
  speculation: Speculation
) {
  const { data, error } = await supabase
    .from("speculations")
    .insert({
      name:
        speculation.name,

      emoji:
        speculation.emoji,

      type:
        speculation.type,

      campaign:
        speculation.campaign,

      surface:
        speculation.surface,

      start_date:
        speculation.startDate || null,

      harvest_date:
        speculation.harvestDate || null,

      quantity:
        speculation.quantity || 0,

      unit:
        speculation.unit || "kg",

      manager:
        speculation.manager || null,

      status:
        speculation.status || "En préparation",
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Erreur création spéculation :",
      error
    );

    throw error;
  }

  return data;
}

export async function updateSupabaseSpeculation(
  speculation: Speculation
) {
  const { data, error } = await supabase
    .from("speculations")
    .update({
      name:
        speculation.name,

      emoji:
        speculation.emoji,

      type:
        speculation.type,

      campaign:
        speculation.campaign,

      surface:
        speculation.surface,

      start_date:
        speculation.startDate || null,

      harvest_date:
        speculation.harvestDate || null,

      quantity:
        speculation.quantity || 0,

      unit:
        speculation.unit || "kg",

      manager:
        speculation.manager || null,

      status:
        speculation.status || "En préparation",
    })
    .eq(
      "id",
      speculation.id
    )
    .select()
    .single();

  if (error) {
    console.error(
      "Erreur modification spéculation :",
      error
    );

    throw error;
  }

  return data;
}

export async function deleteSupabaseSpeculation(
  id: number
) {
  const { error } = await supabase
    .from("speculations")
    .delete()
    .eq(
      "id",
      id
    );

  if (error) {
    console.error(
      "Erreur suppression spéculation :",
      error
    );

    throw error;
  }
}

/* =========================================================
   DÉPENSES
========================================================= */

export async function getSupabaseExpenses(): Promise<
  Expense[]
> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Erreur récupération dépenses :",
      error
    );

    return [];
  }

  return (data || []).map((item) => ({
    id:
      Number(item.id),

    speculationId:
      Number(
        item.speculation_id
      ),

    date:
      item.date,

    category:
      item.category,

    productName:
      item.product_name,

    quantity:
      Number(
        item.quantity
      ),

    unit:
      item.unit,

    unitPrice:
      Number(
        item.unit_price
      ),

    total:
      Number(
        item.total
      ),

    supplier:
      item.supplier || undefined,

    note:
      item.note || undefined,
  }));
}

export async function saveSupabaseExpense(
  expense: Omit<Expense, "id">
) {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      speculation_id:
        expense.speculationId,

      date:
        expense.date,

      category:
        expense.category,

      product_name:
        expense.productName,

      quantity:
        expense.quantity,

      unit:
        expense.unit,

      unit_price:
        expense.unitPrice,

      total:
        expense.total,

      supplier:
        expense.supplier || null,

      note:
        expense.note || null,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Erreur création dépense :",
      error
    );

    throw error;
  }

  return data;
}

export async function updateSupabaseExpense(
  expense: Expense
) {
  const { data, error } = await supabase
    .from("expenses")
    .update({
      speculation_id:
        expense.speculationId,

      date:
        expense.date,

      category:
        expense.category,

      product_name:
        expense.productName,

      quantity:
        expense.quantity,

      unit:
        expense.unit,

      unit_price:
        expense.unitPrice,

      total:
        expense.total,

      supplier:
        expense.supplier || null,

      note:
        expense.note || null,
    })
    .eq(
      "id",
      expense.id
    )
    .select()
    .single();

  if (error) {
    console.error(
      "Erreur modification dépense :",
      error
    );

    throw error;
  }

  return data;
}

export async function deleteSupabaseExpense(
  id: number
) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq(
      "id",
      id
    );

  if (error) {
    console.error(
      "Erreur suppression dépense :",
      error
    );

    throw error;
  }
}

/* =========================================================
   VENTES
========================================================= */

export async function getSupabaseSales(): Promise<
  Sale[]
> {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("date", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Erreur récupération ventes :",
      error
    );

    return [];
  }

  return (data || []).map((item) => ({
    id:
      Number(item.id),

    speculationId:
      Number(
        item.speculation_id
      ),

    date:
      item.date,

    quantity:
      Number(
        item.quantity
      ),

    unit:
      item.unit,

    unitPrice:
      Number(
        item.unit_price
      ),

    total:
      Number(
        item.total
      ),

    buyer:
      item.buyer || undefined,

    paymentStatus:
      item.payment_status,

    note:
      item.note || undefined,
  }));
}

export async function saveSupabaseSale(
  sale: Omit<Sale, "id">
) {
  const { data, error } = await supabase
    .from("sales")
    .insert({
      speculation_id:
        sale.speculationId,

      date:
        sale.date,

      quantity:
        sale.quantity,

      unit:
        sale.unit,

      unit_price:
        sale.unitPrice,

      total:
        sale.total,

      buyer:
        sale.buyer || null,

      payment_status:
        sale.paymentStatus,

      note:
        sale.note || null,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Erreur création vente :",
      error
    );

    throw error;
  }

  return data;
}

export async function updateSupabaseSale(
  sale: Sale
) {
  const { data, error } = await supabase
    .from("sales")
    .update({
      speculation_id:
        sale.speculationId,

      date:
        sale.date,

      quantity:
        sale.quantity,

      unit:
        sale.unit,

      unit_price:
        sale.unitPrice,

      total:
        sale.total,

      buyer:
        sale.buyer || null,

      payment_status:
        sale.paymentStatus,

      note:
        sale.note || null,
    })
    .eq(
      "id",
      sale.id
    )
    .select()
    .single();

  if (error) {
    console.error(
      "Erreur modification vente :",
      error
    );

    throw error;
  }

  return data;
}

export async function deleteSupabaseSale(
  id: number
) {
  const { error } = await supabase
    .from("sales")
    .delete()
    .eq(
      "id",
      id
    );

  if (error) {
    console.error(
      "Erreur suppression vente :",
      error
    );

    throw error;
  }
}

/* =========================================================
   PARAMÈTRES
========================================================= */

export async function getSupabaseSettings(): Promise<
  AppSettings
> {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .order("id", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Erreur récupération paramètres :",
      error
    );

    throw error;
  }

  if (!data) {
    return {
      farmName:
        "Mon Champ",

      ownerName:
        "Papa",

      currency:
        "FCFA",

      surfaceUnit:
        "ha",

      defaultCampaign:
        2026,
    };
  }

  return {
    farmName:
      data.farm_name ||
      "Mon Champ",

    ownerName:
      data.owner_name ||
      "Papa",

    currency:
      data.currency ||
      "FCFA",

    surfaceUnit:
      data.surface_unit ||
      "ha",

    defaultCampaign:
      Number(
        data.default_campaign
      ) || 2026,
  };
}

export async function saveSupabaseSettings(
  settings: AppSettings
) {
  /*
    Vérifie si une ligne
    de paramètres existe déjà.
  */

  const {
    data: existing,
    error: readError,
  } = await supabase
    .from("settings")
    .select("id")
    .order("id", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (readError) {
    console.error(
      "Erreur lecture paramètres :",
      readError
    );

    throw readError;
  }

  /*
    =========================
    UPDATE
    =========================
  */

  if (existing) {
    const {
      data,
      error,
    } = await supabase
      .from("settings")
      .update({
        farm_name:
          settings.farmName,

        owner_name:
          settings.ownerName,

        currency:
          settings.currency,

        surface_unit:
          settings.surfaceUnit,

        default_campaign:
          settings.defaultCampaign,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        existing.id
      )
      .select()
      .single();

    if (error) {
      console.error(
        "Erreur modification paramètres :",
        error
      );

      throw error;
    }

    return data;
  }

  /*
    =========================
    INSERT
    =========================
  */

  const {
    data,
    error,
  } = await supabase
    .from("settings")
    .insert({
      farm_name:
        settings.farmName,

      owner_name:
        settings.ownerName,

      currency:
        settings.currency,

      surface_unit:
        settings.surfaceUnit,

      default_campaign:
        settings.defaultCampaign,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Erreur création paramètres :",
      error
    );

    throw error;
  }

  return data;
}