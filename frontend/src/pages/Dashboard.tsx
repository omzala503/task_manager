import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/tasks";

const statCard = (label: string, value: number | string, color: string) => (
  <div className={`rounded-xl p-5 ${color}`}>
    <p className="text-sm font-medium opacity-70">{label}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  });

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (!data) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCard("Departments", data.departments, "bg-indigo-50 text-indigo-900")}
        {statCard("Meetings", data.meetings, "bg-blue-50 text-blue-900")}
        {statCard("Total MOMs", data.moms.total, "bg-emerald-50 text-emerald-900")}
        {statCard("Total Tasks", data.tasks.total, "bg-amber-50 text-amber-900")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-semibold mb-4">MOMs by Status</h2>
          {Object.keys(data.moms.by_status).length === 0 ? (
            <p className="text-sm text-gray-400">No MOMs yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(data.moms.by_status).map(([status, count]) => (
                <div key={status} className="flex justify-between text-sm">
                  <span className="capitalize">{status.replace(/_/g, " ")}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-semibold mb-4">Tasks by Status</h2>
          {Object.keys(data.tasks.by_status).length === 0 ? (
            <p className="text-sm text-gray-400">No tasks yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(data.tasks.by_status).map(([status, count]) => (
                <div key={status} className="flex justify-between text-sm">
                  <span className="capitalize">{status.replace(/_/g, " ")}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
