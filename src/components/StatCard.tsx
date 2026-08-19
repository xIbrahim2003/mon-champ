type StatCardProps = {
  title: string;
  value: number;
  type: "expense" | "sales" | "result";
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("fr-FR").format(value);

export default function StatCard({
  title,
  value,
  type,
}: StatCardProps) {
  const styles = {
    expense: {
      box: "border-red-100 bg-red-50/60",
      title: "text-red-600",
    },
    sales: {
      box: "border-green-100 bg-green-50/60",
      title: "text-green-700",
    },
    result: {
      box: "border-blue-100 bg-blue-50/60",
      title: "text-blue-700",
    },
  };

  return (
    <div className={`rounded-2xl border p-5 ${styles[type].box}`}>
      <p
        className={`mb-3 text-xs font-bold uppercase ${styles[type].title}`}
      >
        {title}
      </p>

      <p className="text-2xl font-bold tracking-tight text-gray-900">
        {value >= 0 && type === "result" ? "+" : ""}
        {formatMoney(value)}
      </p>

      <p className="mt-1 text-xs font-semibold text-gray-500">
        FCFA
      </p>
    </div>
  );
}