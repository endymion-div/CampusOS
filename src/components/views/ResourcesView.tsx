import React, { useMemo, useState } from 'react';
import { Bookmark, Download, FileText, FolderOpen, Plus, Search } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { CampusResource, ResourceCategory } from '../../types/campus';
import { EmptyState, ModalDialog } from '../ui/CommonUI';

const RES_CATEGORIES: ('All' | ResourceCategory)[] = [
  'All',
  'Notes',
  'Previous year papers',
  'Lab manuals',
  'Books',
  'Tutorials',
  'Lecture slides',
  'Study guides',
];

function downloadResourceSummary(res: CampusResource) {
  const content = [
    `CampusOS Resource Pack`,
    `=======================`,
    `Title: ${res.title}`,
    `Subject: ${res.subject}`,
    `Category: ${res.category}`,
    `Author: ${res.author}`,
    `Uploaded: ${res.uploadedAt}`,
    ``,
    `Summary & Study Notes:`,
    res.summary,
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${res.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export const ResourcesView: React.FC = () => {
  const { state, addResource, toggleResourceBookmark, incrementResourceDownload } = useCampus();
  const [category, setCategory] = useState<'All' | ResourceCategory>('All');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Upload form
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(state.subjects[0]?.name ?? 'Engineering Mathematics I');
  const [resCat, setResCat] = useState<ResourceCategory>('Notes');
  const [summary, setSummary] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.2 MB');

  const filtered = useMemo(() => {
    return state.resources.filter((r) => {
      if (category !== 'All' && r.category !== category) return false;
      if (bookmarkedOnly && !r.bookmarked) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.author.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.resources, category, bookmarkedOnly, search]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addResource({
      title: title.trim(),
      subject,
      category: resCat,
      author: state.profile.name,
      fileSize: fileSize || '1.5 MB',
      fileType: fileName.split('.').pop()?.toUpperCase() || 'PDF',
      summary: summary.trim() || 'Student-contributed study notes and solved problems.',
    });
    setTitle('');
    setSummary('');
    setFileName('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter resources by category"
            value={category}
            onChange={(e) => setCategory(e.target.value as 'All' | ResourceCategory)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            {RES_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setBookmarkedOnly((prev) => !prev)}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors inline-flex items-center gap-1.5 ${
              bookmarkedOnly
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Bookmarked</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, papers, manuals..."
              aria-label="Search campus resources"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Resource</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-5 h-5" />}
          title="No study resources found"
          description="Try clearing filters or upload lecture notes and previous year papers."
          actionLabel="Upload Resource"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((res) => (
            <article
              key={res.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{res.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{res.subject}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    {res.fileType} · {res.fileSize}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-950 dark:text-white leading-snug">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {res.summary}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono tabular-nums">
                  By {res.author} · {res.uploadedAt} · {res.downloads} downloads
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    downloadResourceSummary(res);
                    incrementResourceDownload(res.id);
                  }}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleResourceBookmark(res.id)}
                  aria-label={res.bookmarked ? `Remove bookmark for ${res.title}` : `Bookmark ${res.title}`}
                  className={`p-2 rounded-lg border transition-colors ${
                    res.bookmarked
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Upload Resource Modal */}
      <ModalDialog open={modalOpen} onClose={() => setModalOpen(false)} title="Upload Study Resource">
        <form onSubmit={handleUpload} className="space-y-3.5">
          <div>
            <label htmlFor="res-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Resource Title
            </label>
            <input
              id="res-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Unit 3 Eigenvalues Solved Question Bank"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="res-sub" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                id="res-sub"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                {state.subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="res-cat" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                id="res-cat"
                value={resCat}
                onChange={(e) => setResCat(e.target.value as ResourceCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                {RES_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="res-sum" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Summary / Contents
            </label>
            <textarea
              id="res-sum"
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div>
            <label htmlFor="res-file" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Attach File (optional)
            </label>
            <input
              id="res-file"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFileName(file.name);
                  setFileSize(`${Math.max(0.1, file.size / (1024 * 1024)).toFixed(1)} MB`);
                }
              }}
              className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 dark:file:bg-slate-800 file:text-xs file:font-medium"
            />
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
              Publish Resource
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};
