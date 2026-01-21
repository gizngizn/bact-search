'use client';

import { useState, useMemo } from 'react';

export default function BreakpointsTable({ breakpoints }) {
  const [activeTab, setActiveTab] = useState('MIC');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories from the new data structure
  const categories = useMemo(() => {
    const catSet = new Set();
    breakpoints?.forEach(bp => {
      if (bp.category) {
        catSet.add(bp.category);
      }
    });
    return Array.from(catSet).sort();
  }, [breakpoints]);

  // Filter breakpoints by method, search, and category
  const filteredBreakpoints = useMemo(() => {
    if (!breakpoints) return [];

    return breakpoints.filter(bp => {
      // Filter by method (tab)
      if (bp.method !== activeTab) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = bp.antimicrobialName?.toLowerCase().includes(query);
        const codeMatch = bp.ab?.toLowerCase().includes(query);
        if (!nameMatch && !codeMatch) return false;
      }

      // Filter by category
      if (selectedCategory !== 'all') {
        if (bp.category !== selectedCategory) return false;
      }

      return true;
    });
  }, [breakpoints, activeTab, searchQuery, selectedCategory]);

  // Group filtered breakpoints by category for display
  const groupedBreakpoints = useMemo(() => {
    const grouped = {};
    filteredBreakpoints.forEach(bp => {
      const groupName = bp.category || 'Other';
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(bp);
    });

    // Sort groups alphabetically, but put 'Other' at the end
    return Object.entries(grouped).sort(([a], [b]) => {
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      return a.localeCompare(b);
    });
  }, [filteredBreakpoints]);

  if (!breakpoints || breakpoints.length === 0) {
    return (
      <div className="breakpoints-table-empty">
        No clinical breakpoint data available
      </div>
    );
  }

  const micCount = breakpoints.filter(b => b.method === 'MIC').length;
  const diskCount = breakpoints.filter(b => b.method === 'DISK').length;

  const hasFilters = searchQuery || selectedCategory !== 'all';

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

      {/* Filters */}
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

        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {/* Results count */}
      <div className="breakpoints-count">
        {filteredBreakpoints.length} {filteredBreakpoints.length === 1 ? 'result' : 'results'}
        {hasFilters && (
          <button
            className="clear-filters"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {filteredBreakpoints.length === 0 ? (
        <div className="breakpoints-no-results">
          No breakpoints match your filters
        </div>
      ) : (
        <div className="breakpoints-table-wrapper">
          <table className="breakpoints-table">
            <thead>
              <tr>
                <th className="th-group">Category</th>
                <th className="th-antimicrobial">Antimicrobial</th>
                {activeTab === 'DISK' && <th className="th-dose">Dose</th>}
                <th className="th-s">S ≤</th>
                <th className="th-r">R &gt;</th>
                <th className="th-indication">Indication</th>
              </tr>
            </thead>
            <tbody>
              {groupedBreakpoints.map(([groupName, items]) => (
                items.map((bp, idx) => (
                  <tr key={`${bp.ab}-${bp.indication || 'default'}-${idx}`} className="breakpoint-row">
                    <td className="cell-group">
                      <span className="group-label">{idx === 0 ? groupName : ''}</span>
                    </td>
                    <td>
                      <div className="cell-antimicrobial">
                        <span className="antimicrobial-name">{bp.antimicrobialName}</span>
                        <span className="antimicrobial-code">{bp.ab}</span>
                      </div>
                    </td>
                    {activeTab === 'DISK' && (
                      <td className="cell-dose">{bp.disk_dose || '—'}</td>
                    )}
                    <td className="cell-value cell-s">{bp.breakpoint_S ?? '—'}</td>
                    <td className="cell-value cell-r">{bp.breakpoint_R ?? '—'}</td>
                    <td className="cell-indication">
                      {bp.indication && (
                        <span className={`indication-badge ${bp.indication === 'UTI' ? 'uti' : ''}`}>
                          {bp.indication}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="breakpoints-legend">
        <div className="legend-item">
          <span className="legend-s">S ≤</span>
          <span className="legend-text">Susceptible at or below</span>
        </div>
        <div className="legend-item">
          <span className="legend-r">R &gt;</span>
          <span className="legend-text">Resistant above</span>
        </div>
        <div className="legend-item">
          <span className="legend-unit">{activeTab === 'MIC' ? 'mg/L' : 'mm'}</span>
        </div>
      </div>
    </div>
  );
}
