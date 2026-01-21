'use client';

import { useState, useMemo } from 'react';

export default function EcoffTable({ ecoffs }) {
  const [activeTab, setActiveTab] = useState('MIC');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter ECOFFs by method and search
  const filteredEcoffs = useMemo(() => {
    if (!ecoffs) return [];

    return ecoffs.filter(ecoff => {
      // Filter by method (tab)
      if (ecoff.method !== activeTab) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = ecoff.antimicrobialName?.toLowerCase().includes(query);
        const codeMatch = ecoff.ab?.toLowerCase().includes(query);
        if (!nameMatch && !codeMatch) return false;
      }

      return true;
    });
  }, [ecoffs, activeTab, searchQuery]);

  // Sort alphabetically by antimicrobial name
  const sortedEcoffs = useMemo(() => {
    return [...filteredEcoffs].sort((a, b) =>
      (a.antimicrobialName || a.ab).localeCompare(b.antimicrobialName || b.ab)
    );
  }, [filteredEcoffs]);

  if (!ecoffs || ecoffs.length === 0) {
    return (
      <div className="breakpoints-table-empty">
        No ECOFF data available for this species
      </div>
    );
  }

  const micCount = ecoffs.filter(e => e.method === 'MIC').length;
  const diskCount = ecoffs.filter(e => e.method === 'DISK').length;

  return (
    <div className="breakpoints-container">
      {/* Tabs */}
      <div className="breakpoints-tabs">
        <button
          className={`breakpoints-tab ${activeTab === 'MIC' ? 'active' : ''}`}
          onClick={() => setActiveTab('MIC')}
        >
          MIC
          <span className="tab-count">{micCount}</span>
        </button>
        <button
          className={`breakpoints-tab ${activeTab === 'DISK' ? 'active' : ''}`}
          onClick={() => setActiveTab('DISK')}
        >
          Disk Diffusion
          <span className="tab-count">{diskCount}</span>
        </button>
      </div>

      {/* Search */}
      <div className="breakpoints-filters">
        <div className="filter-search">
          <input
            type="text"
            placeholder="Search antimicrobial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input"
          />
          {searchQuery && (
            <button
              className="filter-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="breakpoints-count">
        {filteredEcoffs.length} {filteredEcoffs.length === 1 ? 'result' : 'results'}
        {searchQuery && (
          <button
            className="clear-filters"
            onClick={() => setSearchQuery('')}
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Table */}
      {sortedEcoffs.length === 0 ? (
        <div className="breakpoints-no-results">
          No ECOFFs match your filter
        </div>
      ) : (
        <div className="breakpoints-table-wrapper">
          <table className="breakpoints-table ecoff-table">
            <thead>
              <tr>
                <th className="th-antimicrobial">Antimicrobial</th>
                {activeTab === 'DISK' && <th className="th-dose">Dose</th>}
                <th className="th-ecoff">ECOFF</th>
              </tr>
            </thead>
            <tbody>
              {sortedEcoffs.map((ecoff, idx) => (
                <tr key={`${ecoff.ab}-${idx}`} className="breakpoint-row">
                  <td>
                    <div className="cell-antimicrobial">
                      <span className="antimicrobial-name">{ecoff.antimicrobialName}</span>
                      <span className="antimicrobial-code">{ecoff.ab}</span>
                    </div>
                  </td>
                  {activeTab === 'DISK' && (
                    <td className="cell-dose">{ecoff.disk_dose || '—'}</td>
                  )}
                  <td className="cell-value cell-ecoff">{ecoff.ecoff_value ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="breakpoints-legend ecoff-legend">
        <div className="legend-item">
          <span className="legend-ecoff">ECOFF</span>
          <span className="legend-text">Wild-type upper limit</span>
        </div>
        <div className="legend-item">
          <span className="legend-unit">{activeTab === 'MIC' ? 'mg/L' : 'mm'}</span>
        </div>
      </div>
    </div>
  );
}
