"use client";
function ChevronIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDiscoveryStore } from '@/store/discovery.store';
import { getDiscovery, DiscoveryResult } from '@/lib/api/public';
import {
  getLanguages,
  getFrameworksGrouped,
  getDomains,
  CanonicalLanguage,
  CanonicalFramework,
  CanonicalDomain,
} from '@/lib/api/meta';
import { IssueCard } from '@/components/cards/IssueCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';

const DIFFICULTY_LEVELS = [
  { id: 1, label: 'Very small / beginner-friendly' },
  { id: 2, label: 'Small but meaningful' },
  { id: 3, label: 'Moderate' },
  { id: 4, label: 'Advanced' },
  { id: 5, label: 'Core / architectural' },
];

interface GroupedFrameworks {
  [category: string]: CanonicalFramework[];
}

export default function DiscoveryPage() {
  const searchParams = useSearchParams();
  const store = useDiscoveryStore();

  const [results, setResults] = useState<DiscoveryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Meta data
  const [languages, setLanguages] = useState<CanonicalLanguage[]>([]);
  const [frameworksGrouped, setFrameworksGrouped] = useState<GroupedFrameworks>({});
  const [domains, setDomains] = useState<CanonicalDomain[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);

  // Search/filter inputs
  const [languageSearch, setLanguageSearch] = useState('');
  const [frameworkSearch, setFrameworkSearch] = useState('');
  const [domainSearch, setDomainSearch] = useState('');

  const [initializedFromQuery, setInitializedFromQuery] = useState<string | null>(null);

  // Parse query params from Explore on mount
  useEffect(() => {
    if (!searchParams) return;

    const queryString = searchParams.toString();
    if (!queryString || initializedFromQuery === queryString) return;

    // Parse difficulties as array
    const diffParam = searchParams.get('difficulties');
    if (diffParam) {
      const difficulties = diffParam
        .split(',')
        .map(Number)
        .filter((n) => !Number.isNaN(n));
      if (difficulties.length > 0) {
        difficulties.forEach((d) => store.toggleDifficulty(d));
      }
    }

    // Parse languageIds
    const languageIdsParam = searchParams.get('languageIds');
    if (languageIdsParam) {
      const ids = languageIdsParam
        .split(',')
        .map(Number)
        .filter((n) => !Number.isNaN(n));
      ids.forEach((id) => store.toggleLanguageId(id));
    }

    // Parse frameworkIds
    const frameworkIdsParam = searchParams.get('frameworkIds');
    if (frameworkIdsParam) {
      const ids = frameworkIdsParam
        .split(',')
        .map(Number)
        .filter((n) => !Number.isNaN(n));
      ids.forEach((id) => store.toggleFrameworkId(id));
    }

    // Parse domainIds
    const domainIdsParam = searchParams.get('domainIds');
    if (domainIdsParam) {
      const ids = domainIdsParam
        .split(',')
        .map(Number)
        .filter((n) => !Number.isNaN(n));
      ids.forEach((id) => store.toggleDomainId(id));
    }

    // Parse includeUnclassified
    const includeParam = searchParams.get('includeUnclassified');
    if (includeParam === '1') {
      store.setIncludeUnclassified(true);
    }

    setInitializedFromQuery(queryString);
  }, [initializedFromQuery, searchParams, store]);

  // Fetch canonical meta data
  useEffect(() => {
    async function fetch() {
      try {
        const [langs, fwsGrouped, doms] = await Promise.all([
          getLanguages(),
          getFrameworksGrouped(),
          getDomains(),
        ]);
        setLanguages(langs);
        setFrameworksGrouped(fwsGrouped);
        setDomains(doms);
      } catch (err) {
        console.error('Failed to load meta data:', err);
      } finally {
        setMetaLoading(false);
      }
    }
    fetch();
  }, []);

  // Fetch discovery results on filter change
  useEffect(() => {
    async function fetchDiscovery() {
      try {
        setLoading(true);
        setError(null);

        const params: any = {};
        if (store.difficulties.length > 0) params.difficulties = store.difficulties;
        if (store.languageIds.length > 0) params.languageIds = store.languageIds;
        if (store.frameworkIds.length > 0) params.frameworkIds = store.frameworkIds;
        if (store.domainIds.length > 0) params.domainIds = store.domainIds;
        if (store.includeUnclassified) params.includeUnclassified = true;

        const data = await getDiscovery(params);
        setResults(data);
      } catch (err) {
        console.error('Discovery error:', err);
        setError('Unable to load discovery results. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchDiscovery();
  }, [store.difficulties, store.languageIds, store.frameworkIds, store.domainIds, store.includeUnclassified]);

  // Compute filtered options for search
  const filteredLanguages = useMemo(
    () =>
      languages.filter((l) =>
        l.displayName.toLowerCase().includes(languageSearch.toLowerCase()) ||
        l.matchingName.toLowerCase().includes(languageSearch.toLowerCase())
      ),
    [languages, languageSearch]
  );

  const filteredDomains = useMemo(
    () =>
      domains.filter((d) =>
        d.displayName.toLowerCase().includes(domainSearch.toLowerCase()) ||
        d.matchingName.toLowerCase().includes(domainSearch.toLowerCase())
      ),
    [domains, domainSearch]
  );

  const filteredFrameworksByCategory = useMemo(() => {
    const result: GroupedFrameworks = {};
    Object.entries(frameworksGrouped).forEach(([category, fws]) => {
      const filtered = fws.filter(
        (fw) =>
          fw.displayName.toLowerCase().includes(frameworkSearch.toLowerCase()) ||
          fw.matchingName.toLowerCase().includes(frameworkSearch.toLowerCase())
      );
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    });
    return result;
  }, [frameworksGrouped, frameworkSearch]);

  // Maps for displaying names
  const languageMap = useMemo(
    () => new Map(languages.map((l) => [l.id, l.displayName])),
    [languages]
  );

  const frameworkMap = useMemo(() => {
    const map = new Map<number, string>();
    Object.values(frameworksGrouped).forEach((fws) => {
      fws.forEach((fw) => map.set(fw.id, fw.displayName));
    });
    return map;
  }, [frameworksGrouped]);

  const domainMap = useMemo(
    () => new Map(domains.map((d) => [d.id, d.displayName])),
    [domains]
  );

  const hasActiveFilters =
    store.difficulties.length > 0 ||
    store.languageIds.length > 0 ||
    store.frameworkIds.length > 0 ||
    store.domainIds.length > 0 ||
    store.includeUnclassified;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-100 mb-4">Discover opportunities</h1>
        <p className="text-neutral-400">
          Browse issues with live filters on the left. Adjust anytime to see new results.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
        {/* FILTERS SIDEBAR */}
        <aside className="space-y-4">
          {/* Difficulty Section */}
          <CollapsibleSection
            title="Difficulty"
            isOpen={store.expandedSections.difficulty}
            onToggle={() => store.toggleSection('difficulty')}
          >
            <div className="space-y-2">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => store.toggleDifficulty(level.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                    store.difficulties.includes(level.id)
                      ? 'border-neutral-600 bg-neutral-800 text-neutral-100 font-medium'
                      : 'border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/50'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* Languages Section */}
          <CollapsibleSection
            title="Languages"
            isOpen={store.expandedSections.languages}
            onToggle={() => store.toggleSection('languages')}
            count={store.languageIds.length}
          >
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search languages..."
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-200 placeholder-neutral-600 focus:border-neutral-700 focus:outline-none"
              />
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {/* Selected languages first */}
                {store.languageIds
                  .map((id) => languages.find((l) => l.id === id))
                  .filter(Boolean)
                  .map((lang) => (
                    <button
                      key={lang!.id}
                      onClick={() => store.toggleLanguageId(lang!.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-100 font-medium text-sm hover:bg-neutral-700 transition-all"
                    >
                      {lang!.displayName}
                    </button>
                  ))}
                {/* Filtered unselected languages */}
                {filteredLanguages
                  .filter((l) => !store.languageIds.includes(l.id))
                  .map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => store.toggleLanguageId(lang.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-neutral-800 text-neutral-400 text-sm hover:border-neutral-700 hover:bg-neutral-900/50 transition-all"
                    >
                      {lang.displayName}
                    </button>
                  ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Frameworks Section */}
          <CollapsibleSection
            title="Frameworks"
            isOpen={store.expandedSections.frameworks}
            onToggle={() => store.toggleSection('frameworks')}
            count={store.frameworkIds.length}
          >
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search frameworks..."
                value={frameworkSearch}
                onChange={(e) => setFrameworkSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-200 placeholder-neutral-600 focus:border-neutral-700 focus:outline-none"
              />
              <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                {/* Selected frameworks grouped by category */}
                {Object.entries(frameworksGrouped).map(([category, fws]) => {
                  const selectedInCategory = fws.filter((fw) =>
                    store.frameworkIds.includes(fw.id)
                  );
                  if (selectedInCategory.length === 0) return null;

                  return (
                    <div key={category}>
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                        {category}
                      </div>
                      <div className="space-y-2 mb-2">
                        {selectedInCategory.map((fw) => (
                          <button
                            key={fw.id}
                            onClick={() => store.toggleFrameworkId(fw.id)}
                            className="w-full text-left px-4 py-3 rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-100 font-medium text-sm hover:bg-neutral-700 transition-all"
                          >
                            {fw.displayName}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Unselected frameworks grouped by category */}
                {Object.entries(filteredFrameworksByCategory).map(([category, fws]) => {
                  const unselected = fws.filter((fw) => !store.frameworkIds.includes(fw.id));
                  if (unselected.length === 0) return null;

                  return (
                    <div key={category}>
                      {Object.entries(filteredFrameworksByCategory).some(
                        ([c, f]) => c === category && f.some((fw) => store.frameworkIds.includes(fw.id))
                      ) || (
                        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                          {category}
                        </div>
                      )}
                      <div className="space-y-2">
                        {unselected.map((fw) => (
                          <button
                            key={fw.id}
                            onClick={() => store.toggleFrameworkId(fw.id)}
                            className="w-full text-left px-4 py-3 rounded-lg border border-neutral-800 text-neutral-400 text-sm hover:border-neutral-700 hover:bg-neutral-900/50 transition-all"
                          >
                            {fw.displayName}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleSection>

          {/* Domains Section */}
          <CollapsibleSection
            title="Domains"
            isOpen={store.expandedSections.domains}
            onToggle={() => store.toggleSection('domains')}
            count={store.domainIds.length}
          >
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search domains..."
                value={domainSearch}
                onChange={(e) => setDomainSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-200 placeholder-neutral-600 focus:border-neutral-700 focus:outline-none"
              />
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {/* Selected domains first */}
                {store.domainIds
                  .map((id) => domains.find((d) => d.id === id))
                  .filter(Boolean)
                  .map((domain) => (
                    <button
                      key={domain!.id}
                      onClick={() => store.toggleDomainId(domain!.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-100 font-medium text-sm hover:bg-neutral-700 transition-all"
                    >
                      {domain!.displayName}
                    </button>
                  ))}
                {/* Filtered unselected domains */}
                {filteredDomains
                  .filter((d) => !store.domainIds.includes(d.id))
                  .map((domain) => (
                    <button
                      key={domain.id}
                      onClick={() => store.toggleDomainId(domain.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-neutral-800 text-neutral-400 text-sm hover:border-neutral-700 hover:bg-neutral-900/50 transition-all"
                    >
                      {domain.displayName}
                    </button>
                  ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Unclassified Option */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <button
              onClick={() => store.setIncludeUnclassified(!store.includeUnclassified)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                store.includeUnclassified
                  ? 'border-neutral-600 bg-neutral-800 text-neutral-100 font-medium'
                  : 'border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/50'
              }`}
            >
              Include unclassified issues
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={() => store.clearFilters()} className="w-full">
              Clear all filters
            </Button>
          )}
        </aside>

        {/* RESULTS */}
        <div className="space-y-6">
          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="p-4 border border-neutral-800 rounded-lg bg-neutral-900/40">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Active filters
              </div>
              <div className="flex flex-wrap gap-2">
                {store.difficulties.map((id) => (
                  <span
                    key={id}
                    className="px-3 py-1 text-xs rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700"
                  >
                    {DIFFICULTY_LEVELS.find((d) => d.id === id)?.label || `Difficulty ${id}`}
                  </span>
                ))}
                {store.languageIds.map((id) => (
                  <span
                    key={id}
                    className="px-3 py-1 text-xs rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700"
                  >
                    {languageMap.get(id) || `Language ${id}`}
                  </span>
                ))}
                {store.frameworkIds.map((id) => (
                  <span
                    key={id}
                    className="px-3 py-1 text-xs rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700"
                  >
                    {frameworkMap.get(id) || `Framework ${id}`}
                  </span>
                ))}
                {store.domainIds.map((id) => (
                  <span
                    key={id}
                    className="px-3 py-1 text-xs rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700"
                  >
                    {domainMap.get(id) || `Domain ${id}`}
                  </span>
                ))}
                {store.includeUnclassified && (
                  <span className="px-3 py-1 text-xs rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700">
                    Unclassified included
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {(loading || metaLoading) && (
            <div className="text-center py-16">
              <p className="text-neutral-500">Loading opportunities...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <EmptyState
              title="Unable to load results"
              description={error}
              action={
                <Button onClick={() => window.location.reload()} variant="secondary">
                  Try again
                </Button>
              }
            />
          )}

          {/* Results */}
          {!loading && !error && results.length > 0 && (
            <div className="grid gap-6">
              {results.map((result, index) => (
                <IssueCard key={`${result.issue.id}-${index}`} result={result} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && results.length === 0 && (
            <EmptyState
              title="No issues found"
              description="Try adjusting your filters or come back later as new opportunities are added."
              action={
                <Button onClick={() => store.clearFilters()} variant="secondary">
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Collapsible Section Component
 */
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  count?: number;
}

function CollapsibleSection({ title, children, isOpen, onToggle, count }: CollapsibleSectionProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40">
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-neutral-900/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-neutral-200">{title}</h3>
          {count !== undefined && count > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-neutral-800 text-neutral-400">
              {count}
            </span>
          )}
        </div>
        <ChevronIcon
          className={`w-4 h-4 text-neutral-600 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-neutral-800">
          {children}
        </div>
      )}
    </div>
  );
}
