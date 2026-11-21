import React, { useMemo, useState } from 'react';
import { Bookmark, Calendar, CalendarPlus, Check, MapPin, Plus, Search, Users } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { CampusEvent, EventCategory } from '../../types/campus';
import { EmptyState, ModalDialog, SafeImage } from '../ui/CommonUI';

const CATEGORIES: ('All' | EventCategory)[] = [
  'All',
  'Hackathons',
  'Workshops',
  'Seminars',
  'Cultural',
  'Sports',
  'Clubs',
  'Competitions',
];

function downloadIcsForEvent(evt: CampusEvent) {
  const dateCompact = evt.date.replace(/-/g, '');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusOS//Events//EN',
    'BEGIN:VEVENT',
    `UID:${evt.id}@campusos.edu`,
    `DTSTART;VALUE=DATE:${dateCompact}`,
    `SUMMARY:${evt.title}`,
    `LOCATION:${evt.location}`,
    `DESCRIPTION:${evt.description} (Organizer: ${evt.organizer})`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${evt.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export const EventsView: React.FC = () => {
  const { state, toggleEventRegistration, toggleEventSaved, addCampusEvent, pushToast } = useCampus();
  const [category, setCategory] = useState<'All' | EventCategory>('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [evtCat, setEvtCat] = useState<EventCategory>('Workshops');
  const [date, setDate] = useState(new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10));
  const [time, setTime] = useState('05:00 PM');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [description, setDescription] = useState('');

  const filtered = useMemo(() => {
    return state.events.filter((e) => {
      if (category !== 'All' && e.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.events, category, search]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addCampusEvent({
      title: title.trim(),
      category: evtCat,
      date,
      time: time.trim() || '05:00 PM',
      location: location.trim() || 'Main Auditorium',
      organizer: organizer.trim() || state.profile.name,
      description: description.trim() || 'Student-organized campus session.',
    });
    setTitle('');
    setLocation('');
    setOrganizer('');
    setDescription('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                category === cat
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              aria-label="Search campus events"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-5 h-5" />}
          title="No campus events match your filters"
          description="Try another category or host a new campus workshop or meetup."
          actionLabel="Create Event"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((evt) => (
            <article
              key={evt.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {evt.imageUrl ? (
                  <div className="h-44 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                    <SafeImage
                      src={evt.imageUrl}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-blue-700 dark:text-blue-400">
                      {evt.category} · {evt.organizer}
                    </span>
                    <span className="font-mono tabular-nums inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {evt.attendeesCount}
                    </span>
                  </div>

                  <h3 className="text-base font-display font-bold text-slate-950 dark:text-white">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                      <Calendar className="w-3.5 h-3.5" />
                      {evt.date} · {evt.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {evt.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleEventRegistration(evt.id)}
                  className={`flex-1 py-2 px-4 text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 ${
                    evt.registered
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {evt.registered ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{evt.registered ? 'Registered' : 'Register'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleEventSaved(evt.id)}
                  aria-label={evt.saved ? `Unsave ${evt.title}` : `Save ${evt.title}`}
                  className={`p-2 rounded-lg border transition-colors ${
                    evt.saved
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadIcsForEvent(evt);
                    pushToast({ title: 'Calendar file (.ics) downloaded', tone: 'success' });
                  }}
                  aria-label={`Add ${evt.title} to calendar`}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <CalendarPlus className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <ModalDialog open={modalOpen} onClose={() => setModalOpen(false)} title="Create Campus Event">
        <form onSubmit={handleCreate} className="space-y-3.5">
          <div>
            <label htmlFor="ev-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Event Title
            </label>
            <input
              id="ev-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Rust Systems Workshop"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="ev-cat" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                id="ev-cat"
                value={evtCat}
                onChange={(e) => setEvtCat(e.target.value as EventCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ev-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                id="ev-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="ev-time" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Time
              </label>
              <input
                id="ev-time"
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ev-loc" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <input
                id="ev-loc"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Auditorium B"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="ev-org" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Organizer
              </label>
              <input
                id="ev-org"
                type="text"
                required
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="Turing Coding Society"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>
          <div>
            <label htmlFor="ev-desc" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="ev-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div className="flex justify-end gap-2">
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
              Publish Event
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};
