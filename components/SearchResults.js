'use client';

import Link from 'next/link';
import BacteriaCard from './BacteriaCard';

export default function SearchResults({ results, loading }) {
  if (loading) {
    return (
      <div className="search-results">
        <div className="loading">Searching...</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results">
        <div className="no-results">
          Start typing to search for bacteria
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="results-count">{results.length} results</div>
      <div className="results-list">
        {results.map((bacteria) => (
          <Link
            href={`/bacteria/${encodeURIComponent(bacteria.mo)}`}
            key={bacteria.mo}
            className="result-link"
          >
            <BacteriaCard bacteria={bacteria} />
          </Link>
        ))}
      </div>
    </div>
  );
}
