import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Edit3,
  GripVertical,
  List,
  Paperclip,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { AssignmentItem, AssignmentPriority, AssignmentStatus } from '../../types/campus';
import { classifyAssignments, getDaysUntil } from '../../utils/academicMath';
import { ConfirmDialog, EmptyState, ModalDialog } from '../ui/CommonUI';

type FilterTab = 'all' | 'pending' | 'completed' | 'overdue';

export const AssignmentsView: React.FC = () => {
  const { state, addAssignment, updateAssignment, deleteAssignment } = useCampus();
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'board'>('list');
  const [search, setSearch] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AssignmentItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AssignmentItem | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(state.subjects[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<AssignmentPriority>('medium');
  const [status, setStatus] = useState<AssignmentStatus>('pending');
  const [attachment, setAttachment] = useState('');
  const [notes, setNotes] = useState('');

  const buckets = useMemo(() => classifyAssignments(state.assignments), [state.assignments]);
  const completionPct = useMemo(() => {
    if (state.assignments.length === 0) return 0;
    return Math.round((buckets.completed.length / state.assignments.length) * 100);
  }, [state.assignments.length, buckets.completed.length]);

  const filtered = useMemo(() => {
    let base = state.assignments;
    if (filterTab === 'pending') base = buckets.pending;
    if (filterTab === 'completed') base = buckets.completed;
    if (filterTab === 'overdue') base = buckets.overdue;

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subjectName.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }

    return [...base].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [state.assignments, filterTab, buckets, search]);

  const calendarGroups = useMemo(() => {
    const map = new Map<string, AssignmentItem[]>();
    for (const item of filtered) {
      const existing = map.get(item.dueDate) ?? [];
      existing.push(item);
      map.set(item.dueDate, existing);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setSubjectId(state.subjects[0]?.id ?? '');
    setDescription('');
    setDueDate(new Date().toISOString().slice(0, 10));
    setPriority('medium');
    setStatus('pending');
    setAttachment('');
    setNotes('');
    setModalOpen(true);
  };

  const openEdit = (item: AssignmentItem) => {
    setEditing(item);
    setTitle(item.title);
    setSubjectId(item.subjectId);
    setDescription(item.description);
    setDueDate(item.dueDate);
    setPriority(item.priority);
    setStatus(item.status);
    setAttachment(item.attachment ?? '');
    setNotes(item.notes ?? '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = state.subjects.find((s) => s.id === subjectId) ?? state.subjects[0];
    if (!title.trim() || !subject) return;

    const payload = {
      title: title.trim(),
      subjectId: subject.id,
      subjectName: subject.name,
      description: description.trim(),
      dueDate,
      priority,
      status,
      attachment: attachment.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (editing) {
      updateAssignment(editing.id, payload);
    } else {
      addAssignment(payload);
    }
    setModalOpen(false);
  };

  const handleDropToStatus = (targetStatus: AssignmentStatus) => {
    if (!draggedId) return;
    updateAssignment(draggedId, { status: targetStatus });
    setDraggedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Progress Statistics */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Total</span>
              <p className="text-lg font-display font-bold tabular-nums text-slate-950 dark:text-white">
                {state.assignments.length}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Pending</span>
              <p className="text-lg font-display font-bold tabular-nums text-blue-600 dark:text-blue-400">
                {buckets.pending.length}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Overdue</span>
              <p className="text-lg font-display font-bold tabular-nums text-red-600 dark:text-red-400">
                {buckets.overdue.length}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Completed</span>
              <p className="text-lg font-display font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {buckets.completed.length}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-600 dark:text-slate-300">Completion progress</span>
              <span className="font-mono font-semibold tabular-nums">{completionPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800">
            {(['all', 'pending', 'completed', 'overdue'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap ${
                  filterTab === tab
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignments..."
              aria-label="Search assignments"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1 ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1 ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>Board</span>
            </button>
          </div>

          <button
            type="button"
            onClick={openNew}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Assignment</span>
          </button>
        </div>
      </div>

      {/* Views */}
      {filtered.length === 0 && viewMode !== 'board' ? (
        <EmptyState
          icon={<CheckCircle2 className="w-5 h-5" />}
          title="No assignments match this filter"
          description="Try switching filter tabs or create a new coursework task."
          actionLabel="Add Assignment"
          onAction={openNew}
        />
      ) : null}

      {viewMode === 'list' && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => {
            const days = getDaysUntil(item.dueDate);
            const isOverdue = item.status !== 'completed' && days < 0;
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() =>
                      updateAssignment(item.id, {
                        status: item.status === 'completed' ? 'pending' : 'completed',
                      })
                    }
                    aria-label={
                      item.status === 'completed'
                        ? `Mark "${item.title}" pending`
                        : `Mark "${item.title}" completed`
                    }
                    className="mt-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0"
                  >
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.subjectName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">Due {item.dueDate}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-medium capitalize ${
                          item.priority === 'high'
                            ? 'text-red-600 dark:text-red-400'
                            : item.priority === 'medium'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-500'
                        }`}
                      >
                        {item.priority} priority
                      </span>
                      {isOverdue ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            Overdue ({Math.abs(days)}d)
                          </span>
                        </>
                      ) : null}
                    </div>

                    <h3
                      className={`text-sm font-semibold mt-1 ${
                        item.status === 'completed'
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-950 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </h3>

                    {item.description ? (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    ) : null}

                    {(item.attachment || item.notes) ? (
                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                        {item.attachment ? (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Paperclip className="w-3 h-3" />
                            {item.attachment}
                          </span>
                        ) : null}
                        {item.notes ? <span>Note: {item.notes}</span> : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <select
                    aria-label={`Change status for ${item.title}`}
                    value={item.status}
                    onChange={(e) =>
                      updateAssignment(item.id, { status: e.target.value as AssignmentStatus })
                    }
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    aria-label={`Edit "${item.title}"`}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    aria-label={`Delete "${item.title}"`}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {viewMode === 'calendar' && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calendarGroups.map(([dateStr, items]) => {
            const days = getDaysUntil(dateStr);
            const label =
              days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days < 0 ? `${Math.abs(days)}d ago` : `In ${days}d`;
            return (
              <div
                key={dateStr}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                    {dateStr}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50"
                    >
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.subjectName} · {item.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(
            [
              { key: 'pending', title: 'Pending' },
              { key: 'in-progress', title: 'In Progress' },
              { key: 'completed', title: 'Completed' },
            ] as { key: AssignmentStatus; title: string }[]
          ).map((col) => {
            const colItems = state.assignments.filter((a) => a.status === col.key);
            return (
              <div
                key={col.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropToStatus(col.key)}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 min-h-[260px] flex flex-col gap-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">{col.title}</h3>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">{colItems.length}</span>
                </div>
                <div className="space-y-2.5 flex-1">
                  {colItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => setDraggedId(item.id)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 cursor-grab active:cursor-grabbing space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.subjectName}
                        </span>
                        <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Due {item.dueDate}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Add/Edit Modal */}
      <ModalDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Assignment' : 'New Assignment'}
      >
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label htmlFor="asgn-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <input
              id="asgn-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Signal Processing Lab 3"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="asgn-sub" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                id="asgn-sub"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                {state.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="asgn-due" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                id="asgn-due"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="asgn-prio" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                id="asgn-prio"
                value={priority}
                onChange={(e) => setPriority(e.target.value as AssignmentPriority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label htmlFor="asgn-stat" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                id="asgn-stat"
                value={status}
                onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="asgn-desc" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="asgn-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="asgn-att" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Attachment Reference
              </label>
              <input
                id="asgn-att"
                type="text"
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
                placeholder="e.g., Lab4_Report.pdf"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="asgn-notes" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <input
                id="asgn-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Submission details..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {editing ? 'Save Assignment' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteAssignment(deleteTarget.id);
        }}
        title="Delete Assignment"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
};
