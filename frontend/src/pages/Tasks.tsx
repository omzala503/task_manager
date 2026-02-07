import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../api/tasks";
import { departmentApi } from "../api/departments";
import Badge from "../components/Badge";
import Modal from "../components/Modal";

export default function Tasks() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  // form state
  const [title, setTitle] = useState("");
  const [deptId, setDeptId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", filterStatus],
    queryFn: () => taskApi.list(filterStatus ? { status: filterStatus } : undefined),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentApi.list,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const create = useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setTitle("");
      setDeptId("");
      setAssignedTo("");
      setDescription("");
      setDueDate("");
      setPriority("medium");
    },
  });

  const start = useMutation({ mutationFn: taskApi.start, onSuccess: invalidate });
  const complete = useMutation({ mutationFn: taskApi.complete, onSuccess: invalidate });
  const cancel = useMutation({ mutationFn: taskApi.cancel, onSuccess: invalidate });
  const del = useMutation({ mutationFn: taskApi.delete, onSuccess: invalidate });

  const deptName = (id: string) =>
    departments.find((d) => d.id === id)?.name ?? id.slice(0, 8);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + New Task
        </button>
      </div>

      <div className="mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-400">No tasks found.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{t.title}</span>
                  <Badge value={t.status} />
                  <Badge value={t.priority} />
                </div>
                <p className="text-sm text-gray-500">
                  {deptName(t.department_id)} &middot; Assigned to <span className="font-medium">{t.assigned_to}</span>
                  {t.due_date && <> &middot; Due: {t.due_date}</>}
                </p>
                {t.description && <p className="text-sm text-gray-400 mt-1">{t.description}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                {t.status === "open" && (
                  <button onClick={() => start.mutate(t.id)} className="text-xs px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100">
                    Start
                  </button>
                )}
                {(t.status === "open" || t.status === "in_progress") && (
                  <button onClick={() => complete.mutate(t.id)} className="text-xs px-3 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100">
                    Complete
                  </button>
                )}
                {t.status !== "completed" && t.status !== "cancelled" && (
                  <button onClick={() => cancel.mutate(t.id)} className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100">
                    Cancel
                  </button>
                )}
                <button onClick={() => del.mutate(t.id)} className="text-xs px-3 py-1 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Task">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({
              title,
              department_id: deptId,
              assigned_to: assignedTo,
              description,
              due_date: dueDate || undefined,
              priority,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department *</label>
            <select value={deptId} onChange={(e) => setDeptId(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Select...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assigned To *</label>
            <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
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
