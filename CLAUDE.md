# Bacteria Search Project

A Next.js web application for searching bacteria and viewing their antimicrobial susceptibility data based on EUCAST 2026 clinical breakpoints.

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **React**: Version 19
- **Styling**: CSS with Flexoki color scheme, Inter font
- **Data**: Static JSON files (no database)

## Project Structure
```
app/
├── page.js              # Home page with search
├── layout.js            # Root layout
├── globals.css          # Flexoki theme, all styles
├── api/search/route.js  # Search API endpoint
└── bacteria/[mo]/page.js # Bacteria detail page

components/
├── SearchBar.js         # Autocomplete search component
└── BreakpointsTable.js  # Interactive breakpoints table (tabs, filters)

lib/
└── data.js              # Data loading, organism group mapping

data/
├── bacteria.json                        # Bacteria list with taxonomy
├── antimicrobials.json                  # Antimicrobial codes and names
├── intrinsic_resistant.json             # Intrinsic resistance data
├── clinical_breakpoints_eucast2026.json # EUCAST 2026 breakpoints (907 entries)
└── microorganisms_groups.json           # Organism groupings

scripts/
└── parse_eucast_excel.py  # Parser for EUCAST Excel breakpoint tables
```

## Key Concepts

### EUCAST Organism Groups
Breakpoints are defined at group level, not species level. The mapping in `lib/data.js`:
- E. coli, Klebsiella, Salmonella → "Enterobacterales"
- S. aureus → "Staphylococcus spp."
- P. aeruginosa → "Pseudomonas aeruginosa"

### Breakpoint Data Structure
```json
{
  "guideline": "EUCAST 2026",
  "organism_group": "Enterobacterales",
  "antimicrobial": "Cefotaxime",
  "ab": "CTX",
  "category": "Cephalosporins",
  "method": "MIC",           // or "DISK"
  "breakpoint_S": 1.0,       // Susceptible ≤
  "breakpoint_R": 2.0,       // Resistant >
  "unit": "mg/L",            // or "mm" for disk
  "indication": "non-meningitis"  // null, "UTI", "meningitis", etc.
}
```

### Clinical Breakpoints vs ECOFF
- **Clinical breakpoints**: S≤ and R> values for treatment decisions (what we use)
- **ECOFF**: Epidemiological cut-off for surveillance (not for treatment)

## Design System (Flexoki)
CSS variables in globals.css:
- `--paper`: #FFFCF0 (background)
- `--cyan-600`: #24837B (primary/links)
- `--green-600`: #66800B (susceptible values)
- `--red-600`: #AF3029 (resistant values)
- `--font`: Inter

## Common Tasks

### Run Development Server
```bash
npm run dev
```

### Update Breakpoint Data
1. Get new EUCAST Excel file
2. Update path in `scripts/parse_eucast_excel.py`
3. Run: `python scripts/parse_eucast_excel.py`
4. Output goes to `data/clinical_breakpoints_eucast2026.json`

### Add New Organism Group Mapping
Edit `getOrganismGroupForBacterium()` in `lib/data.js`

## API Endpoints
- `GET /api/search?q=<query>` - Search bacteria by name (returns top 10 matches)

## Session History
- Converted from old AMR package data to EUCAST 2026 Excel tables
- Added interactive BreakpointsTable with MIC/Disk tabs and filtering
- Implemented Flexoki color scheme and Inter font
