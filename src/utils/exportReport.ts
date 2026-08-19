import * as XLSX from "xlsx-js-style";

import type { Speculation } from "@/data/mockData";
import type { Expense } from "@/data/expenseData";
import type { Sale } from "@/data/saleData";

type CalculatedSpeculation = Speculation & {
  result: number;
  profitability: number;
};

type ExportReportParams = {
  speculations: CalculatedSpeculation[];
  expenses: Expense[];
  sales: Sale[];
};

type JournalRow = {
  date: string;
  type: "Dépense" | "Vente";
  category: string;
  description: string;
  quantity: number | "";
  unit: string;
  unitPrice: number | "";
  expenseAmount: number | "";
  saleAmount: number | "";
  partner: string;
  paymentStatus: string;
  note: string;
};

/* =========================================================
   COULEURS
========================================================= */

const COLORS = {
  darkGreen: "166534",
  green: "15803D",
  lightGreen: "DCFCE7",

  darkBlue: "1E3A8A",
  blue: "2563EB",
  lightBlue: "DBEAFE",

  purple: "7E22CE",
  lightPurple: "F3E8FF",

  red: "DC2626",
  lightRed: "FEE2E2",

  orange: "EA580C",
  lightOrange: "FFEDD5",

  darkGray: "374151",
  gray: "6B7280",
  lightGray: "F3F4F6",

  white: "FFFFFF",
  border: "D1D5DB",
};

/* =========================================================
   HELPERS
========================================================= */

function getTodayForFilename() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function safeSheetName(name: string) {
  return name
    .replace(/[\\/?*[\]:]/g, "")
    .slice(0, 31);
}

/* =========================================================
   STYLES
========================================================= */

const thinBorder = {
  top: {
    style: "thin",
    color: {
      rgb: COLORS.border,
    },
  },

  bottom: {
    style: "thin",
    color: {
      rgb: COLORS.border,
    },
  },

  left: {
    style: "thin",
    color: {
      rgb: COLORS.border,
    },
  },

  right: {
    style: "thin",
    color: {
      rgb: COLORS.border,
    },
  },
};

function styleCell(
  cell: XLSX.CellObject,
  options: {
    fill?: string;
    color?: string;
    bold?: boolean;
    center?: boolean;
    border?: boolean;
    fontSize?: number;
  } = {}
) {
  cell.s = {
    font: {
      name: "Calibri",
      sz: options.fontSize ?? 11,
      bold: options.bold ?? false,

      color: {
        rgb:
          options.color ??
          COLORS.darkGray,
      },
    },

    alignment: {
      vertical: "center",

      horizontal:
        options.center
          ? "center"
          : "left",

      wrapText: true,
    },

    ...(options.fill
      ? {
          fill: {
            patternType: "solid",

            fgColor: {
              rgb: options.fill,
            },

            bgColor: {
              rgb: options.fill,
            },
          },
        }
      : {}),

    ...(options.border
      ? {
          border: thinBorder,
        }
      : {}),
  };
}

/*
  IMPORTANT

  Contrairement à l'ancienne version,
  cette fonction crée également les
  cellules vides.

  Cela permet d'avoir des tableaux
  complètement encadrés et colorés.
*/

function styleTable(
  sheet: XLSX.WorkSheet,
  headerRow: number,
  lastRow: number,
  lastColumn: number,
  headerColor = COLORS.darkGreen
) {
  for (
    let row = headerRow;
    row <= lastRow;
    row++
  ) {
    for (
      let col = 0;
      col < lastColumn;
      col++
    ) {
      const address =
        XLSX.utils.encode_cell({
          r: row - 1,
          c: col,
        });

      if (!sheet[address]) {
        sheet[address] = {
          t: "s",
          v: "",
        };
      }

      const cell =
        sheet[address];

      if (row === headerRow) {
        styleCell(cell, {
          fill: headerColor,
          color: COLORS.white,
          bold: true,
          center: true,
          border: true,
        });
      } else {
        styleCell(cell, {
          fill:
            row % 2 === 0
              ? COLORS.lightGray
              : COLORS.white,

          border: true,
        });
      }
    }
  }
}

function formatMoneyColumn(
  sheet: XLSX.WorkSheet,
  column: number,
  startRow: number,
  endRow: number
) {
  for (
    let row = startRow;
    row <= endRow;
    row++
  ) {
    const address =
      XLSX.utils.encode_cell({
        r: row - 1,
        c: column,
      });

    const cell =
      sheet[address];

    if (
      cell &&
      typeof cell.v === "number"
    ) {
      cell.z =
        '#,##0 "FCFA"';
    }
  }
}

/* =========================================================
   EXPORT
========================================================= */

export function exportReportToExcel({
  speculations,
  expenses,
  sales,
}: ExportReportParams) {
  const workbook =
    XLSX.utils.book_new();

  /* =======================================================
     CALCULS GLOBAUX
  ======================================================= */

  const totalExpenses =
    speculations.reduce(
      (total, item) =>
        total + item.expenses,
      0
    );

  const totalSales =
    speculations.reduce(
      (total, item) =>
        total + item.sales,
      0
    );

  const globalResult =
    totalSales -
    totalExpenses;

  const globalProfitability =
    totalExpenses > 0
      ? (
          globalResult /
          totalExpenses
        ) * 100
      : 0;

  const getSpeculationName = (
    speculationId: number
  ) =>
    speculations.find(
      (item) =>
        item.id ===
        speculationId
    )?.name ||
    "Spéculation supprimée";

  /* =======================================================
     1 — RÉSUMÉ
  ======================================================= */

  const summaryData = [
    [
      "MON CHAMP",
      "",
    ],

    [
      "Rapport financier et de production agricole",
      "",
    ],

    [],

    [
      "Indicateur",
      "Valeur",
    ],

    [
      "Dépenses totales",
      totalExpenses,
    ],

    [
      "Ventes totales",
      totalSales,
    ],

    [
      "Résultat net",
      globalResult,
    ],

    [
      "Rentabilité globale (%)",
      Number(
        globalProfitability.toFixed(2)
      ),
    ],

    [],

    [
      "Nombre de spéculations",
      speculations.length,
    ],

    [
      "Nombre de dépenses détaillées",
      expenses.length,
    ],

    [
      "Nombre de ventes détaillées",
      sales.length,
    ],
  ];

  const summarySheet =
    XLSX.utils.aoa_to_sheet(
      summaryData
    );

  summarySheet["!merges"] = [
    XLSX.utils.decode_range(
      "A1:B1"
    ),

    XLSX.utils.decode_range(
      "A2:B2"
    ),
  ];

  summarySheet["!cols"] = [
    {
      wch: 38,
    },

    {
      wch: 24,
    },
  ];

  summarySheet["!rows"] = [
    {
      hpt: 34,
    },

    {
      hpt: 25,
    },
  ];

  /* TITRE */

  if (summarySheet["A1"]) {
    styleCell(
      summarySheet["A1"],
      {
        fill:
          COLORS.darkGreen,

        color:
          COLORS.white,

        bold:
          true,

        center:
          true,

        fontSize:
          20,
      }
    );
  }

  /* SOUS-TITRE */

  if (summarySheet["A2"]) {
    styleCell(
      summarySheet["A2"],
      {
        fill:
          COLORS.lightGreen,

        color:
          COLORS.darkGreen,

        bold:
          true,

        center:
          true,

        fontSize:
          12,
      }
    );
  }

  /* TABLEAU FINANCIER */

  styleTable(
    summarySheet,
    4,
    8,
    2
  );

  /* TABLEAU STATISTIQUES */

  styleTable(
    summarySheet,
    10,
    12,
    2,
    COLORS.darkBlue
  );

  formatMoneyColumn(
    summarySheet,
    1,
    5,
    7
  );

  /* DÉPENSES */

  if (summarySheet["B5"]) {
    styleCell(
      summarySheet["B5"],
      {
        fill:
          COLORS.lightRed,

        color:
          COLORS.red,

        bold:
          true,

        border:
          true,
      }
    );

    summarySheet["B5"].z =
      '#,##0 "FCFA"';
  }

  /* VENTES */

  if (summarySheet["B6"]) {
    styleCell(
      summarySheet["B6"],
      {
        fill:
          COLORS.lightGreen,

        color:
          COLORS.darkGreen,

        bold:
          true,

        border:
          true,
      }
    );

    summarySheet["B6"].z =
      '#,##0 "FCFA"';
  }

  /* RÉSULTAT */

  if (summarySheet["B7"]) {
    styleCell(
      summarySheet["B7"],
      {
        fill:
          globalResult >= 0
            ? COLORS.lightGreen
            : COLORS.lightRed,

        color:
          globalResult >= 0
            ? COLORS.darkGreen
            : COLORS.red,

        bold:
          true,

        border:
          true,
      }
    );

    summarySheet["B7"].z =
      '#,##0 "FCFA"';
  }

  /* RENTABILITÉ */

  if (summarySheet["B8"]) {
    styleCell(
      summarySheet["B8"],
      {
        fill:
          COLORS.lightBlue,

        color:
          COLORS.darkBlue,

        bold:
          true,

        border:
          true,
      }
    );

    summarySheet["B8"].z =
      '0.00"%"';
  }

  summarySheet["!freeze"] = {
    xSplit: 0,
    ySplit: 4,
  };

  XLSX.utils.book_append_sheet(
    workbook,
    summarySheet,
    "Résumé"
  );

  /* =======================================================
     2 — SPÉCULATIONS
  ======================================================= */

  const speculationRows =
    speculations.map(
      (speculation) => {
        const productionUnit =
          speculation.unit ||
          "kg";

        const producedQuantity =
          speculation.quantity ||
          0;

        const soldQuantity =
          sales
            .filter(
              (sale) =>
                sale.speculationId ===
                  speculation.id &&
                sale.unit ===
                  productionUnit
            )
            .reduce(
              (total, sale) =>
                total +
                sale.quantity,
              0
            );

        const remainingQuantity =
          Math.max(
            0,
            producedQuantity -
              soldQuantity
          );

        const sellThroughRate =
          producedQuantity > 0
            ? (
                soldQuantity /
                producedQuantity
              ) * 100
            : 0;

        return {
          Spéculation:
            speculation.name,

          Type:
            speculation.type,

          Campagne:
            speculation.campaign,

          Responsable:
            speculation.manager ||
            "Non renseigné",

          Statut:
            speculation.status ||
            "En préparation",

          Surface:
            speculation.surface,

          "Quantité produite":
            producedQuantity,

          "Quantité vendue":
            soldQuantity,

          "Quantité restante":
            remainingQuantity,

          Unité:
            productionUnit,

          "Taux d'écoulement (%)":
            Number(
              sellThroughRate.toFixed(
                2
              )
            ),

          "Dépenses totales":
            speculation.expenses,

          "Ventes totales":
            speculation.sales,

          Résultat:
            speculation.result,

          "Rentabilité (%)":
            Number(
              speculation.profitability.toFixed(
                2
              )
            ),
        };
      }
    );

  const speculationSheet =
    XLSX.utils.json_to_sheet(
      speculationRows
    );

  speculationSheet["!cols"] = [
    { wch: 24 },
    { wch: 16 },
    { wch: 13 },
    { wch: 24 },
    { wch: 18 },
    { wch: 13 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 12 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
  ];

  if (
    speculationRows.length > 0
  ) {
    styleTable(
      speculationSheet,
      1,
      speculationRows.length + 1,
      15
    );

    formatMoneyColumn(
      speculationSheet,
      11,
      2,
      speculationRows.length + 1
    );

    formatMoneyColumn(
      speculationSheet,
      12,
      2,
      speculationRows.length + 1
    );

    formatMoneyColumn(
      speculationSheet,
      13,
      2,
      speculationRows.length + 1
    );
  }

  speculationSheet["!freeze"] = {
    xSplit: 0,
    ySplit: 1,
  };

  XLSX.utils.book_append_sheet(
    workbook,
    speculationSheet,
    "Spéculations"
  );

  /* =======================================================
     3 — TOUTES LES DÉPENSES
  ======================================================= */

  const expenseRows =
    expenses
      .slice()
      .sort(
        (a, b) =>
          new Date(
            a.date
          ).getTime() -
          new Date(
            b.date
          ).getTime()
      )
      .map(
        (expense) => ({
          Date:
            expense.date,

          Spéculation:
            getSpeculationName(
              expense.speculationId
            ),

          Catégorie:
            expense.category,

          "Produit / Service":
            expense.productName,

          Quantité:
            expense.quantity,

          Unité:
            expense.unit,

          "Prix unitaire":
            expense.unitPrice,

          Dépense:
            expense.total,

          Fournisseur:
            expense.supplier ||
            "",

          Note:
            expense.note ||
            "",
        })
      );

  const expenseSheet =
    XLSX.utils.json_to_sheet(
      expenseRows
    );

  expenseSheet["!cols"] = [
    { wch: 15 },
    { wch: 24 },
    { wch: 22 },
    { wch: 30 },
    { wch: 14 },
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 25 },
    { wch: 40 },
  ];

  if (expenseRows.length > 0) {
    styleTable(
      expenseSheet,
      1,
      expenseRows.length + 1,
      10,
      COLORS.red
    );

    formatMoneyColumn(
      expenseSheet,
      6,
      2,
      expenseRows.length + 1
    );

    formatMoneyColumn(
      expenseSheet,
      7,
      2,
      expenseRows.length + 1
    );
  }

  expenseSheet["!freeze"] = {
    xSplit: 0,
    ySplit: 1,
  };

  XLSX.utils.book_append_sheet(
    workbook,
    expenseSheet,
    "Toutes dépenses"
  );

  /* =======================================================
     4 — TOUTES LES VENTES
  ======================================================= */

  const saleRows =
    sales
      .slice()
      .sort(
        (a, b) =>
          new Date(
            a.date
          ).getTime() -
          new Date(
            b.date
          ).getTime()
      )
      .map(
        (sale) => ({
          Date:
            sale.date,

          Spéculation:
            getSpeculationName(
              sale.speculationId
            ),

          "Quantité vendue":
            sale.quantity,

          Unité:
            sale.unit,

          "Prix unitaire":
            sale.unitPrice,

          Vente:
            sale.total,

          Acheteur:
            sale.buyer ||
            "",

          Paiement:
            sale.paymentStatus,

          Note:
            sale.note ||
            "",
        })
      );

  const saleSheet =
    XLSX.utils.json_to_sheet(
      saleRows
    );

  saleSheet["!cols"] = [
    { wch: 15 },
    { wch: 24 },
    { wch: 18 },
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 25 },
    { wch: 18 },
    { wch: 40 },
  ];

  if (saleRows.length > 0) {
    styleTable(
      saleSheet,
      1,
      saleRows.length + 1,
      9,
      COLORS.green
    );

    formatMoneyColumn(
      saleSheet,
      4,
      2,
      saleRows.length + 1
    );

    formatMoneyColumn(
      saleSheet,
      5,
      2,
      saleRows.length + 1
    );
  }

  saleSheet["!freeze"] = {
    xSplit: 0,
    ySplit: 1,
  };

  XLSX.utils.book_append_sheet(
    workbook,
    saleSheet,
    "Toutes ventes"
  );

  /* =======================================================
     5 — JOURNAL PAR SPÉCULATION
  ======================================================= */

  speculations.forEach(
    (speculation) => {
      const speculationExpenses =
        expenses.filter(
          (expense) =>
            expense.speculationId ===
            speculation.id
        );

      const speculationSales =
        sales.filter(
          (sale) =>
            sale.speculationId ===
            speculation.id
        );

      const productionUnit =
        speculation.unit ||
        "kg";

      const producedQuantity =
        speculation.quantity ||
        0;

      const soldQuantity =
        speculationSales
          .filter(
            (sale) =>
              sale.unit ===
              productionUnit
          )
          .reduce(
            (total, sale) =>
              total +
              sale.quantity,
            0
          );

      const remainingQuantity =
        Math.max(
          0,
          producedQuantity -
            soldQuantity
        );

      const sellThroughRate =
        producedQuantity > 0
          ? (
              soldQuantity /
              producedQuantity
            ) * 100
          : 0;

      const journal: JournalRow[] =
        [];

      /* DÉPENSES */

      speculationExpenses.forEach(
        (expense) => {
          journal.push({
            date:
              expense.date,

            type:
              "Dépense",

            category:
              expense.category,

            description:
              expense.productName,

            quantity:
              expense.quantity,

            unit:
              expense.unit,

            unitPrice:
              expense.unitPrice,

            expenseAmount:
              expense.total,

            saleAmount:
              "",

            partner:
              expense.supplier ||
              "",

            paymentStatus:
              "",

            note:
              expense.note ||
              "",
          });
        }
      );

      /* VENTES */

      speculationSales.forEach(
        (sale) => {
          journal.push({
            date:
              sale.date,

            type:
              "Vente",

            category:
              "",

            description:
              speculation.name,

            quantity:
              sale.quantity,

            unit:
              sale.unit,

            unitPrice:
              sale.unitPrice,

            expenseAmount:
              "",

            saleAmount:
              sale.total,

            partner:
              sale.buyer ||
              "",

            paymentStatus:
              sale.paymentStatus,

            note:
              sale.note ||
              "",
          });
        }
      );

      journal.sort(
        (a, b) =>
          new Date(
            a.date
          ).getTime() -
          new Date(
            b.date
          ).getTime()
      );

      const detailedExpenseTotal =
        speculationExpenses.reduce(
          (total, expense) =>
            total +
            expense.total,
          0
        );

      const detailedSaleTotal =
        speculationSales.reduce(
          (total, sale) =>
            total +
            sale.total,
          0
        );

      const legacyExpense =
        speculation.expenses -
        detailedExpenseTotal;

      const legacySale =
        speculation.sales -
        detailedSaleTotal;

      /* ===================================================
         INFORMATIONS GÉNÉRALES
      =================================================== */

      const rows: unknown[][] = [
        [
          speculation.name.toUpperCase(),
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],

        [
          "Campagne",
          speculation.campaign,

          "Surface",
          speculation.surface,

          "Responsable",
          speculation.manager ||
            "Non renseigné",

          "Statut",
          speculation.status ||
            "En préparation",
        ],

        [
          "Quantité produite",
          producedQuantity,

          "Unité",
          productionUnit,

          "Quantité vendue",
          soldQuantity,

          "Quantité restante",
          remainingQuantity,
        ],

        [
          "Taux d'écoulement",
          `${sellThroughRate.toFixed(
            2
          )}%`,
        ],

        [],

        [
          "Date",
          "Type",
          "Catégorie",
          "Description",
          "Quantité",
          "Unité",
          "Prix unitaire",
          "Dépense",
          "Vente",
          "Fournisseur / Acheteur",
          "Paiement",
          "Note",
        ],
      ];

      /* ===================================================
         ANCIENS TOTAUX
      =================================================== */

      if (legacyExpense > 0) {
        rows.push([
          "",
          "Dépense",
          "Historique",
          "Montant antérieur non détaillé",
          "",
          "",
          "",
          legacyExpense,
          "",
          "",
          "",
          "Donnée héritée avant journal détaillé",
        ]);
      }

      if (legacySale > 0) {
        rows.push([
          "",
          "Vente",
          "Historique",
          "Montant antérieur non détaillé",
          "",
          "",
          "",
          "",
          legacySale,
          "",
          "",
          "Donnée héritée avant journal détaillé",
        ]);
      }

      /* ===================================================
         JOURNAL
      =================================================== */

      journal.forEach(
        (operation) => {
          rows.push([
            operation.date,
            operation.type,
            operation.category,
            operation.description,
            operation.quantity,
            operation.unit,
            operation.unitPrice,
            operation.expenseAmount,
            operation.saleAmount,
            operation.partner,
            operation.paymentStatus,
            operation.note,
          ]);
        }
      );

      rows.push([]);

      const totalStartRow =
        rows.length + 1;

      rows.push([
        "",
        "",
        "",
        "",
        "",
        "",
        "TOTAL DÉPENSES",
        speculation.expenses,
        "",
      ]);

      rows.push([
        "",
        "",
        "",
        "",
        "",
        "",
        "TOTAL VENTES",
        "",
        speculation.sales,
      ]);

      rows.push([
        "",
        "",
        "",
        "",
        "",
        "",
        "RÉSULTAT",
        "",
        speculation.result,
      ]);

      rows.push([
        "",
        "",
        "",
        "",
        "",
        "",
        "RENTABILITÉ",
        `${speculation.profitability.toFixed(
          2
        )}%`,
        "",
      ]);

      const sheet =
        XLSX.utils.aoa_to_sheet(
          rows
        );

      /* ===================================================
         TITRE
      =================================================== */

      sheet["!merges"] = [
        XLSX.utils.decode_range(
          "A1:L1"
        ),
      ];

      /*
        On crée les cellules du titre
        pour permettre le remplissage
        complet de A1:L1.
      */

      for (
        let col = 0;
        col < 12;
        col++
      ) {
        const address =
          XLSX.utils.encode_cell({
            r: 0,
            c: col,
          });

        if (!sheet[address]) {
          sheet[address] = {
            t: "s",
            v: "",
          };
        }

        styleCell(
          sheet[address],
          {
            fill:
              COLORS.darkGreen,

            color:
              COLORS.white,

            bold:
              true,

            center:
              true,

            fontSize:
              col === 0
                ? 18
                : 11,
          }
        );
      }

      /* ===================================================
         INFORMATIONS A2:H4
      =================================================== */

      for (
        let row = 2;
        row <= 4;
        row++
      ) {
        for (
          let col = 0;
          col < 8;
          col++
        ) {
          const address =
            XLSX.utils.encode_cell({
              r: row - 1,
              c: col,
            });

          /*
            Crée aussi les cellules
            actuellement vides.
          */

          if (!sheet[address]) {
            sheet[address] = {
              t: "s",
              v: "",
            };
          }

          const cell =
            sheet[address];

          const isLabel =
            col % 2 === 0;

          styleCell(
            cell,
            {
              fill:
                isLabel
                  ? COLORS.lightGreen
                  : COLORS.white,

              color:
                isLabel
                  ? COLORS.darkGreen
                  : COLORS.darkGray,

              bold:
                isLabel,

              border:
                true,
            }
          );
        }
      }

      /* ===================================================
         JOURNAL
      =================================================== */

      const journalHeaderRow = 6;

      const journalLastRow =
        6 +
        (legacyExpense > 0
          ? 1
          : 0) +
        (legacySale > 0
          ? 1
          : 0) +
        journal.length;

      styleTable(
        sheet,
        journalHeaderRow,
        journalLastRow,
        12,
        COLORS.darkBlue
      );

      /* ===================================================
         COULEUR DES OPÉRATIONS
      =================================================== */

      for (
        let row =
          journalHeaderRow + 1;
        row <= journalLastRow;
        row++
      ) {
        const typeAddress =
          XLSX.utils.encode_cell({
            r: row - 1,
            c: 1,
          });

        const typeCell =
          sheet[typeAddress];

        if (!typeCell) {
          continue;
        }

        let rowColor =
          COLORS.white;

        if (
          typeCell.v === "Dépense"
        ) {
          rowColor =
            COLORS.lightRed;
        }

        if (
          typeCell.v === "Vente"
        ) {
          rowColor =
            COLORS.lightGreen;
        }

        for (
          let col = 0;
          col < 12;
          col++
        ) {
          const address =
            XLSX.utils.encode_cell({
              r: row - 1,
              c: col,
            });

          /*
            IMPORTANT :
            création des cellules vides.
          */

          if (!sheet[address]) {
            sheet[address] = {
              t: "s",
              v: "",
            };
          }

          const cell =
            sheet[address];

          styleCell(
            cell,
            {
              fill:
                rowColor,

              border:
                true,
            }
          );
        }
      }

      /* ===================================================
         TOTAUX
      =================================================== */

      for (
        let row =
          totalStartRow;
        row <
        totalStartRow + 4;
        row++
      ) {
        for (
          let col = 6;
          col <= 8;
          col++
        ) {
          const address =
            XLSX.utils.encode_cell({
              r: row - 1,
              c: col,
            });

          if (!sheet[address]) {
            sheet[address] = {
              t: "s",
              v: "",
            };
          }

          const cell =
            sheet[address];

          let fill =
            COLORS.lightGray;

          let color =
            COLORS.darkGray;

          /* TOTAL DÉPENSES */

          if (
            row === totalStartRow
          ) {
            fill =
              COLORS.lightRed;

            color =
              COLORS.red;
          }

          /* TOTAL VENTES */

          if (
            row ===
            totalStartRow + 1
          ) {
            fill =
              COLORS.lightGreen;

            color =
              COLORS.darkGreen;
          }

          /* RÉSULTAT */

          if (
            row ===
            totalStartRow + 2
          ) {
            fill =
              speculation.result >= 0
                ? COLORS.lightGreen
                : COLORS.lightRed;

            color =
              speculation.result >= 0
                ? COLORS.darkGreen
                : COLORS.red;
          }

          /* RENTABILITÉ */

          if (
            row ===
            totalStartRow + 3
          ) {
            fill =
              COLORS.lightBlue;

            color =
              COLORS.darkBlue;
          }

          styleCell(
            cell,
            {
              fill,
              color,
              bold: true,
              border: true,
            }
          );
        }
      }

      /* ===================================================
         FORMAT MONÉTAIRE JOURNAL
      =================================================== */

      formatMoneyColumn(
        sheet,
        6,
        journalHeaderRow + 1,
        journalLastRow
      );

      formatMoneyColumn(
        sheet,
        7,
        journalHeaderRow + 1,
        journalLastRow
      );

      formatMoneyColumn(
        sheet,
        8,
        journalHeaderRow + 1,
        journalLastRow
      );

      /* TOTAL DÉPENSES */

      const expenseTotalCell =
        sheet[
          XLSX.utils.encode_cell({
            r:
              totalStartRow - 1,

            c: 7,
          })
        ];

      if (
        expenseTotalCell &&
        typeof expenseTotalCell.v ===
          "number"
      ) {
        expenseTotalCell.z =
          '#,##0 "FCFA"';
      }

      /* TOTAL VENTES + RÉSULTAT */

      [
        totalStartRow + 1,
        totalStartRow + 2,
      ].forEach(
        (row) => {
          const cell =
            sheet[
              XLSX.utils.encode_cell({
                r:
                  row - 1,

                c: 8,
              })
            ];

          if (
            cell &&
            typeof cell.v ===
              "number"
          ) {
            cell.z =
              '#,##0 "FCFA"';
          }
        }
      );

      /* ===================================================
         DIMENSIONS
      =================================================== */

      sheet["!cols"] = [
        { wch: 15 },
        { wch: 14 },
        { wch: 24 },
        { wch: 32 },
        { wch: 14 },
        { wch: 14 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 28 },
        { wch: 18 },
        { wch: 40 },
      ];

      sheet["!rows"] = [
        {
          hpt: 32,
        },

        {
          hpt: 24,
        },

        {
          hpt: 24,
        },

        {
          hpt: 24,
        },

        {
          hpt: 10,
        },

        {
          hpt: 28,
        },
      ];

      sheet["!freeze"] = {
        xSplit: 0,
        ySplit: 6,
      };

      XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        safeSheetName(
          speculation.name
        )
      );
    }
  );

  /* =======================================================
     EXPORT FINAL
  ======================================================= */

  const filename =
    `Mon-Champ-Rapport-${getTodayForFilename()}.xlsx`;

  XLSX.writeFile(
  workbook,
  filename
);
}