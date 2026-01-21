# Bacteria Search - Developer Guide

A Next.js web application for searching bacteria and viewing EUCAST antimicrobial susceptibility data.

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **React**: Version 19
- **Styling**: Vanilla CSS with Flexoki color scheme, Instrument Sans font
- **Data**: Static JSON files (no database)

## Project Structure
```
app/
├── page.js                 # Home page with common pathogens
├── layout.js               # Root layout with header search
├── globals.css             # Flexoki theme, mobile-first styles
├── api/search/route.js     # Search API endpoint
└── bacteria/[mo]/page.js   # Bacteria detail page

components/
├── HeaderSearch.js         # Header search with autocomplete dropdown
├── SearchBar.js            # Standalone search input
├── SearchResults.js        # Search results list
├── BacteriaCard.js         # Bacteria result card
├── BreakpointsTable.js     # Interactive breakpoints table (MIC/Disk tabs, filters)
├── EcoffTable.js           # ECOFF table with MIC/Disk tabs
├── ResistanceTable.js      # Intrinsic resistance display
└── ThemeToggle.js          # Dark/light mode toggle

lib/
├── data.js                 # Data loading, caching, organism group mapping
├── search.js               # Search algorithm with relevancy scoring
└── bacteria.js             # Stats and common bacteria utilities

data/
├── bacteria.json                        # 35,010 bacteria (species/genus only)
├── antimicrobials.json                  # 498 antimicrobial codes and names
├── intrinsic_resistant.json             # Intrinsic resistance records
├── clinical_breakpoints.json            # EUCAST 2025 clinical breakpoints (22,730 entries)
├── ecoffs.json                          # EUCAST 2025 ECOFFs (1,592 entries, 80 species)
└── microorganisms_groups.json           # Organism group memberships

scripts/
├── prepare-data.js        # Filter source JSON files
└── parse_eucast_excel.py  # Parser for EUCAST Excel breakpoint tables
```

## Key Concepts

### EUCAST Organism Groups
Breakpoints are defined at group level, not species level. Mapping in `lib/data.js`:
- E. coli, Klebsiella, Salmonella → "Enterobacterales"
- S. aureus → "Staphylococcus spp."
- P. aeruginosa → "Pseudomonas aeruginosa"
- Enterococcus → "Enterococcus spp."

### Breakpoint Data Structure
```json
{
  "guideline": "EUCAST 2026",
  "organism_group": "Enterobacterales",
  "antimicrobial": "Cefotaxime",
  "ab": "CTX",
  "category": "Cephalosporins",
  "method": "MIC",
  "breakpoint_S": 1.0,
  "breakpoint_R": 2.0,
  "unit": "mg/L",
  "indication": "non-meningitis"
}
```

### Clinical Breakpoints vs ECOFF
- **Clinical breakpoints**: S≤ and R> values for treatment decisions (group-level, e.g., Enterobacterales)
- **ECOFF**: Epidemiological cut-off values distinguishing wild-type from non-wild-type (species-specific)

### ECOFF Data Structure
```json
{
  "guideline": "EUCAST 2025",
  "type": "ECOFF",
  "method": "MIC",
  "mo": "B_ESCHR_COLI",
  "ab": "AMC",
  "breakpoint_S": 8,
  "breakpoint_R": 8
}
```
Note: ECOFF has S=R (single cutoff value). Values at or below indicate wild-type.

## Design System

### Flexoki Color Palette
```css
--paper: #FFFCF0        /* Light background */
--black: #100F0F        /* Dark background */
--cyan-600: #24837B     /* Primary (light mode) */
--cyan-400: #3AA99F     /* Primary (dark mode) */
--green-600: #66800B    /* Susceptible values */
--red-600: #AF3029      /* Resistant values */
```

### Typography
- **Font**: Instrument Sans (display + body)
- **Monospace**: System UI monospace for data values

### Responsive Breakpoints
- Base: 320px (phones)
- 480px: 2-column grids
- 640px: Tablet adjustments
- 768px: Desktop tables (cards → traditional table layout)

### Touch Targets
- Minimum: 44px height for all interactive elements
- Large: 52px for primary actions (search input)

## Common Tasks

### Run Development Server
```bash
npm run dev
```

### Regenerate Data Files
```bash
node scripts/prepare-data.js
```

### Update EUCAST Breakpoints
1. Download new EUCAST Excel file
2. Update path in `scripts/parse_eucast_excel.py`
3. Run: `python scripts/parse_eucast_excel.py`

### Add New Organism Group Mapping
Edit `getOrganismGroupForBacterium()` in `lib/data.js`

## API Endpoints

### GET /api/search
Search bacteria by name.

**Parameters:**
- `q` (required): Search query
- `limit` (optional): Max results (default: 50, max: 100)

**Response:**
```json
[
  {
    "mo": "B_ESCHR_COLI",
    "fullname": "Escherichia coli",
    "rank": "species",
    "genus": "Escherichia",
    "family": "Enterobacteriaceae",
    "prevalence": 1,
    "relevancy": { "level": "high", "label": "Very Common" }
  }
]
```

## Session Notes
- Started with AMR package data, converted to EUCAST 2026 Excel tables
- Implemented mobile-first responsive design with Flexoki colors
- Added dark mode support with system preference detection
- BreakpointsTable has MIC/Disk tabs and category filtering
- Font changed from Inter to Instrument Sans for distinctive look
- Added bacteria characteristics (gram stain inferred from phylum, morphology from genus, oxygen tolerance from data)
- Added ECOFF support (1,592 values for 80 species from EUCAST 2025, sourced from AMR package)
