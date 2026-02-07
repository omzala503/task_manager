import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentApi } from "../api/departments";
import Modal from "../components/Modal";

export default function Departments() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentApi.list,
  });

  const create = useMutation({
    mutationFn: departmentApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setOpen(false);
      setName("");
      setDesc("");
    },
  });

  const del = useMutation({
    mutationFn: departmentApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + New Department
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : departments.length === 0 ? (
        <p className="text-gray-400">No departments yet. Create one to get started.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {departments.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-gray-500">{d.description || "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => del.mutate(d.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Department">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({ name, description: desc });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={create.isPending}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {create.isPending ? "Creating..." : "Create"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
