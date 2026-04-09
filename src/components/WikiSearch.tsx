import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

interface SearchResult {
  url: string;
  meta: { title: string };
  excerpt: string;
}

export default function WikiSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchAvailable, setSearchAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const pagefindRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const pf = await import('/pagefind/pagefind.js');
        pagefindRef.current = pf;
        setSearchAvailable(true);
      } catch {
        // Pagefind not available in dev mode
      }
    })();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchAvailable || !query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const pf = pagefindRef.current;
      if (!pf) return;

      const search = await pf.search(query);
      const data = await Promise.all(
        search.results.slice(0, 8).map((r: any) => r.data())
      );
      const filtered = data.filter((r: SearchResult) => r.url.includes('/wiki/'));
      setResults(filtered.slice(0, 5));
      setOpen(filtered.length > 0);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchAvailable]);

  if (!searchAvailable) {
    return (
      <p className="text-xs text-[var(--color-text-sub)] mb-6">
        검색은 빌드 후 사용 가능합니다.
      </p>
    );
  }

  return (
    <div ref={wrapperRef} className="relative mb-8">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="노트 검색..."
        className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2 text-sm bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-sub)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
      />
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-lg z-10 overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--color-text-sub)]">결과 없음</p>
          ) : (
            results.map((result, i) => (
              <a
                key={i}
                href={result.url}
                className="block px-4 py-3 hover:bg-[var(--color-bg-alt)] transition-colors border-b border-[var(--color-border)] last:border-0"
              >
                <div className="text-sm font-medium text-[var(--color-text)]">
                  {result.meta.title}
                </div>
                {result.excerpt && (
                  <div
                    className="text-xs text-[var(--color-text-sub)] mt-0.5 line-clamp-1"
                    dangerouslySetInnerHTML={{ __html: result.excerpt }}
                  />
                )}
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
