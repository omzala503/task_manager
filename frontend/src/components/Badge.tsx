const colors: Record<string, string> = {
  // MOM statuses
  draft: "bg-gray-100 text-gray-700",
  pending_review: "bg-yellow-100 text-yellow-800",
  validated: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  // Task statuses
  open: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  // Task priorities
  low: "bg-slate-100 text-slate-600",
  medium: "bg-indigo-100 text-indigo-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function Badge({ value }: { value: string }) {
  const cls = colors[value] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}
