# Bacteria Search

A mobile-first web application for searching bacteria and viewing antimicrobial resistance data from EUCAST Clinical Breakpoint Tables.

## Features

- **Search**: Find bacteria by name with instant results
- **Clinical Breakpoints**: View MIC and disk diffusion breakpoints for antimicrobial susceptibility testing
- **Intrinsic Resistance**: See which antimicrobials a bacterium is naturally resistant to
- **Taxonomy**: Browse full taxonomic classification
- **Dark Mode**: Automatic dark/light theme based on system preference
- **Mobile-First**: Optimized for phones, tablets, and desktops

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Vanilla CSS with Flexoki color scheme
- **Typography**: Instrument Sans
- **Data**: Static JSON files (no database required)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Sources

- **Bacteria**: 35,010 species and genera from the AMR package
- **Breakpoints**: EUCAST Clinical Breakpoint Tables v16.0 (2026)
- **Antimicrobials**: 498 antimicrobial agents

## Project Structure

```
app/
├── page.js                 # Home page
├── layout.js               # App shell (header, footer)
├── globals.css             # All styles (Flexoki theme)
├── api/search/route.js     # Search API
└── bacteria/[mo]/page.js   # Bacteria detail page

components/
├── HeaderSearch.js         # Header search with dropdown
├── SearchBar.js            # Main search input
├── SearchResults.js        # Search results list
├── BacteriaCard.js         # Result card component
├── BreakpointsTable.js     # Interactive breakpoints table
├── ResistanceTable.js      # Intrinsic resistance table
└── ThemeToggle.js          # Dark/light mode toggle

lib/
├── data.js                 # Data loading & organism group mapping
├── search.js               # Search logic
└── bacteria.js             # Bacteria utilities

data/
├── bacteria.json           # Filtered bacteria (species/genus)
├── antimicrobials.json     # Antimicrobial codes and names
├── intrinsic_resistant.json
├── clinical_breakpoints_eucast2026.json
└── microorganisms_groups.json
```

## License

Data sourced from EUCAST (European Committee on Antimicrobial Susceptibility Testing).
