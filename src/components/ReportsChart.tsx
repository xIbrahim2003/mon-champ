"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

type ChartItem = {
  name: string;
  expenses: number;
  sales: number;
};

type ReportsChartProps = {
  data: ChartItem[];
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("fr-FR").format(value);

export default function ReportsChart({
  data,
}: ReportsChartProps) {
  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{
              fontSize: 12,
            }}
          />

          <YAxis
            tick={{
              fontSize: 12,
            }}
            tickFormatter={(value) =>
              `${Math.round(
                Number(value) / 1000000
              )}M`
            }
          />

          <Tooltip
            formatter={(value) => [
              `${formatMoney(
                Number(value)
              )} FCFA`,
              "",
            ]}
          />

          <Legend />

          <Bar
            dataKey="expenses"
            name="Dépenses"
            fill="#ef4444"
            radius={[6, 6, 0, 0]}
          />

          <Bar
            dataKey="sales"
            name="Ventes"
            fill="#16a34a"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}