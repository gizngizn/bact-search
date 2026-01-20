'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';

export default function Home() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="search-page">
      <div className="search-container">
        <h1 className="page-title">Search Bacteria</h1>
        <p className="page-description">
          Search for bacteria by name to view antimicrobial resistance information and clinical breakpoints.
        </p>
        <SearchBar onResults={setResults} onLoading={setLoading} />
        <SearchResults results={results} loading={loading} />
      </div>
    </div>
  );
}
