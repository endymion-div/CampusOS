import React, { useMemo, useState } from 'react';
import { CheckCircle2, MapPin, Plus, Search } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { LostFoundItem } from '../../types/campus';
import { EmptyState, ModalDialog, SafeImage } from '../ui/CommonUI';

const LF_CATEGORIES: ('All' | LostFoundItem['category'])[] = [
  'All',
  'Electronics',
  'ID & Keys',
  'Accessories',
  'Books & Notes',
  'Other',
];

export const LostFoundView: React.FC = () => {
  const { state, addLostFoundItem, toggleLostFoundResolved } = useCampus();
  const [kindFilter, setKindFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [catFilter, setCatFilter] = useState<'All' | LostFoundItem['category']>('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Post form
  const [kind, setKind] = useState<'lost' | 'found'>('lost');
  const [item, setItem] = useState('');
  const [category, setCategory] = useState<LostFoundItem['category']>('Electronics');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState(state.profile.email);
  const [imageUrl, setImageUrl] = useState('');

  const filtered = useMemo(() => {
    return state.lostFound.filter((entry) => {
      if (kindFilter !== 'all' && entry.kind !== kindFilter) return false;
      if (catFilter !== 'All' && entry.category !== catFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          entry.item.toLowerCase().includes(q) ||
          entry.location.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.lostFound, kindFilter, catFilter, search]);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim() || !location.trim()) return;
    addLostFoundItem({
      kind,
      item: item.trim(),
      category,
      location: location.trim(),
      date,
      description: description.trim(),
      contact: contact.trim() || state.profile.email,
      imageUrl: imageUrl || undefined,
    });
    setItem('');
    setLocation('');
    setDescription('');
    setImageUrl('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800">
            {(['all', 'lost', 'found'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKindFilter(k)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                  kindFilter === k
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <select
            aria-label="Filter Lost & Found by category"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value as 'All' | LostFoundItem['category'])}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            {LF_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items or locations..."
              aria-label="Search Lost & Found"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Item</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-5 h-5" />}
          title="No Lost & Found reports match"
          description="Post a lost or found item on campus so peers can return or claim it quickly."
          actionLabel="Post Report"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((entry) => (
            <article
              key={entry.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="h-44 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                  <SafeImage
                    src={entry.imageUrl}
                    alt={entry.item}
                    fallbackTitle={entry.item}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold uppercase tracking-wide ${
                        entry.kind === 'lost'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {entry.kind} · {entry.category}
                    </span>
                    <span className="font-mono text-slate-400 tabular-nums">{entry.date}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                    {entry.item}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{entry.location}</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {entry.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    Contact: <span className="text-slate-800 dark:text-slate-200">{entry.contact}</span>
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => toggleLostFoundResolved(entry.id)}
                  className={`w-full py-2 px-3 text-xs font-medium rounded-lg border transition-colors inline-flex items-center justify-center gap-1.5 ${
                    entry.resolved
                      ? 'border-emerald-600/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{entry.resolved ? 'Resolved / Claimed' : 'Mark Resolved'}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Post Lost & Found Modal */}
      <ModalDialog open={modalOpen} onClose={() => setModalOpen(false)} title="Post Lost & Found Item">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="lf-kind" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Report Type
              </label>
              <select
                id="lf-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as 'lost' | 'found')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="lost">Lost Item</option>
                <option value="found">Found Item</option>
              </select>
            </div>
            <div>
              <label htmlFor="lf-cat" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                id="lf-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as LostFoundItem['category'])}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                {LF_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="lf-item" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Item Name
            </label>
            <input
              id="lf-item"
              type="text"
              required
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="e.g., Black USB-C Hub & ID Card"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="lf-loc" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <input
                id="lf-loc"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Central Library 2F"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="lf-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                id="lf-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lf-desc" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="lf-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="lf-contact" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Contact Method
              </label>
              <input
                id="lf-contact"
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="lf-img" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Photo (optional)
              </label>
              <input
                id="lf-img"
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 dark:file:bg-slate-800 file:text-xs file:font-medium"
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
              Submit Report
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};
