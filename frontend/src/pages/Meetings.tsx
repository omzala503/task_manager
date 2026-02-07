import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingApi } from "../api/meetings";
import { departmentApi } from "../api/departments";
import Modal from "../components/Modal";

export default function Meetings() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [deptId, setDeptId] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [attendees, setAttendees] = useState("");
  const [filterDept, setFilterDept] = useState("");

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["meetings", filterDept],
    queryFn: () => meetingApi.list(filterDept || undefined),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentApi.list,
  });

  const create = useMutation({
    mutationFn: meetingApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meetings"] });
      setOpen(false);
      setTitle("");
      setDeptId("");
      setDate("");
      setLocation("");
      setAttendees("");
    },
  });

  const deptName = (id: string) =>
    departments.find((d) => d.id === id)?.name ?? id.slice(0, 8);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + New Meeting
        </button>
      </div>

      <div className="mb-4">
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : meetings.length === 0 ? (
        <p className="text-gray-400">No meetings found.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Attendees</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {meetings.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{m.title}</td>
                  <td className="px-4 py-3 text-gray-500">{deptName(m.department_id)}</td>
                  <td className="px-4 py-3">{m.date}</td>
                  <td className="px-4 py-3 text-gray-500">{m.location || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{m.attendees.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Meeting">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({
              title,
              department_id: deptId,
              date,
              location,
              attendees: attendees
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean),
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
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Attendees (comma-separated)</label>
            <input value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="Alice, Bob, Charlie" className="w-full border rounded-lg px-3 py-2 text-sm" />
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
