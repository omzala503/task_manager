import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { momApi } from "../api/moms";
import { meetingApi } from "../api/meetings";
import type { MinutesOfMeeting } from "../types";
import Badge from "../components/Badge";
import Modal from "../components/Modal";

export default function MOMs() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<MinutesOfMeeting | null>(null);
  const [agendaOpen, setAgendaOpen] = useState(false);

  // create form
  const [meetingId, setMeetingId] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [summary, setSummary] = useState("");

  // agenda form
  const [agTitle, setAgTitle] = useState("");
  const [agDiscussion, setAgDiscussion] = useState("");
  const [agDecisions, setAgDecisions] = useState("");

  // validate/reject forms
  const [validatedBy, setValidatedBy] = useState("");
  const [rejectedBy, setRejectedBy] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const { data: moms = [], isLoading } = useQuery({
    queryKey: ["moms", filterStatus],
    queryFn: () => momApi.list(filterStatus || undefined),
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings"],
    queryFn: () => meetingApi.list(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["moms"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const refreshDetail = async (mom: MinutesOfMeeting) => {
    invalidate();
    setDetail(mom);
  };

  const create = useMutation({
    mutationFn: momApi.create,
    onSuccess: (mom) => {
      invalidate();
      setCreateOpen(false);
      setMeetingId("");
      setPreparedBy("");
      setSummary("");
      setDetail(mom);
    },
  });

  const addAgenda = useMutation({
    mutationFn: (d: { title: string; discussion: string; decisions: string }) =>
      momApi.addAgendaItem(detail!.id, d),
    onSuccess: (mom) => {
      refreshDetail(mom);
      setAgendaOpen(false);
      setAgTitle("");
      setAgDiscussion("");
      setAgDecisions("");
    },
  });

  const submitMom = useMutation({ mutationFn: momApi.submit, onSuccess: refreshDetail });
  const validateMom = useMutation({
    mutationFn: (id: string) => momApi.validate(id, validatedBy),
    onSuccess: (mom) => { refreshDetail(mom); setValidatedBy(""); },
  });
  const rejectMom = useMutation({
    mutationFn: (id: string) => momApi.reject(id, rejectedBy, rejectReason),
    onSuccess: (mom) => { refreshDetail(mom); setRejectedBy(""); setRejectReason(""); },
  });
  const reviseMom = useMutation({ mutationFn: momApi.revise, onSuccess: refreshDetail });

  const meetingTitle = (id: string) =>
    meetings.find((m) => m.id === id)?.title ?? id.slice(0, 8);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Minutes of Meeting</h1>
        <button onClick={() => setCreateOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + New MOM
        </button>
      </div>

      <div className="mb-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="pending_review">Pending Review</option>
          <option value="validated">Validated</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : moms.length === 0 ? (
        <p className="text-gray-400">No MOMs found.</p>
      ) : (
        <div className="space-y-3">
          {moms.map((m) => (
            <div
              key={m.id}
              onClick={() => setDetail(m)}
              className="bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{meetingTitle(m.meeting_id)}</span>
                <Badge value={m.status} />
              </div>
              <p className="text-sm text-gray-500">
                Prepared by {m.prepared_by} &middot; {new Date(m.created_at).toLocaleDateString()}
                {m.summary && <> &middot; {m.summary.slice(0, 80)}{m.summary.length > 80 ? "..." : ""}</>}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create MOM Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New MOM">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({ meeting_id: meetingId, prepared_by: preparedBy, summary });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Meeting *</label>
            <select value={meetingId} onChange={(e) => setMeetingId(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Select...</option>
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>{m.title} ({m.date})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prepared By *</label>
            <input value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
          </div>
          <button type="submit" disabled={create.isPending} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {create.isPending ? "Creating..." : "Create"}
          </button>
        </form>
      </Modal>

      {/* MOM Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="MOM Details">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{meetingTitle(detail.meeting_id)}</span>
              <Badge value={detail.status} />
            </div>
            <div className="text-sm space-y-1 text-gray-600">
              <p>Prepared by: <span className="font-medium text-gray-900">{detail.prepared_by}</span></p>
              {detail.summary && <p>Summary: {detail.summary}</p>}
              {detail.validated_by && <p>Validated/Rejected by: {detail.validated_by}</p>}
              {detail.rejection_reason && <p className="text-red-600">Rejection reason: {detail.rejection_reason}</p>}
            </div>

            {/* Agenda Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Agenda Items</h3>
                {detail.status === "draft" && (
                  <button onClick={() => setAgendaOpen(true)} className="text-xs text-indigo-600 hover:underline">
                    + Add Item
                  </button>
                )}
              </div>
              {detail.agenda_items.length === 0 ? (
                <p className="text-sm text-gray-400">No agenda items yet.</p>
              ) : (
                <div className="space-y-2">
                  {detail.agenda_items.map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3 text-sm">
                      <p className="font-medium">{i + 1}. {item.title}</p>
                      {item.discussion && <p className="text-gray-500 mt-1">Discussion: {item.discussion}</p>}
                      {item.decisions && <p className="text-gray-500">Decisions: {item.decisions}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workflow Actions */}
            <div className="border-t pt-4 space-y-3">
              {detail.status === "draft" && (
                <button
                  onClick={() => submitMom.mutate(detail.id)}
                  className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600"
                >
                  Submit for Review
                </button>
              )}

              {detail.status === "pending_review" && (
                <>
                  <div className="flex gap-2">
                    <input value={validatedBy} onChange={(e) => setValidatedBy(e.target.value)} placeholder="Validated by..." className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                    <button
                      onClick={() => validatedBy && validateMom.mutate(detail.id)}
                      disabled={!validatedBy}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      Validate
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input value={rejectedBy} onChange={(e) => setRejectedBy(e.target.value)} placeholder="Rejected by..." className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                    <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason..." className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                    <button
                      onClick={() => rejectedBy && rejectReason && rejectMom.mutate(detail.id)}
                      disabled={!rejectedBy || !rejectReason}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}

              {detail.status === "rejected" && (
                <button
                  onClick={() => reviseMom.mutate(detail.id)}
                  className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600"
                >
                  Revise (back to Draft)
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Agenda Item Modal */}
      <Modal open={agendaOpen} onClose={() => setAgendaOpen(false)} title="Add Agenda Item">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addAgenda.mutate({ title: agTitle, discussion: agDiscussion, decisions: agDecisions });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input value={agTitle} onChange={(e) => setAgTitle(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discussion</label>
            <textarea value={agDiscussion} onChange={(e) => setAgDiscussion(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Decisions</label>
            <textarea value={agDecisions} onChange={(e) => setAgDecisions(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <button type="submit" disabled={addAgenda.isPending} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {addAgenda.isPending ? "Adding..." : "Add"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
