import React, { useMemo, useState } from 'react';
import { Calendar, Check, Search, Users } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { ClubCategory } from '../../types/campus';
import { EmptyState } from '../ui/CommonUI';

const CLUB_CATEGORIES: ('All' | ClubCategory)[] = [
  'All',
  'Coding',
  'AI/ML',
  'Robotics',
  'Music',
  'Dance',
  'Photography',
  'Sports',
  'Entrepreneurship',
];

export const ClubsView: React.FC = () => {
  const { state, toggleClubMembership } = useCampus();
  const [category, setCategory] = useState<'All' | ClubCategory>('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return state.clubs.filter((c) => {
      if (category !== 'All' && c.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.clubs, category, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800">
          {CLUB_CATEGORIES.map((cat) => (
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

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs..."
            aria-label="Search campus clubs"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-5 h-5" />}
          title="No clubs found in this category"
          description="Select All categories or clear your search filter to explore campus communities."
          actionLabel="Show All Clubs"
          onAction={() => {
            setCategory('All');
            setSearch('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((club) => (
            <article
              key={club.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-display font-bold text-sm shrink-0"
                      style={{ backgroundColor: club.accentColor }}
                      aria-hidden="true"
                    >
                      {club.monogram}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{club.category}</p>
                      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                        {club.name}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {club.membersCount}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {club.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">{club.upcomingEvent}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleClubMembership(club.id)}
                className={`w-full py-2 px-4 text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 ${
                  club.joined
                    ? 'border border-emerald-600/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {club.joined ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{club.joined ? 'Joined' : 'Join Club'}</span>
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
