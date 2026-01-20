#!/usr/bin/env python3
"""
Parse EUCAST Clinical Breakpoint Tables Excel file to JSON.
Handles v16.0 format (2026).
"""

import pandas as pd
import json
import re
from pathlib import Path

# Mapping of sheet names to organism group identifiers
ORGANISM_SHEETS = {
    'Enterobacterales': 'Enterobacterales',
    'Pseudomonas': 'Pseudomonas aeruginosa',
    'S.maltophilia': 'Stenotrophomonas maltophilia',
    'Acinetobacter': 'Acinetobacter spp.',
    'Staphylococcus': 'Staphylococcus spp.',
    'Enterococcus': 'Enterococcus spp.',
    'Streptococcus A,B,C,G': 'Streptococcus groups A,B,C,G',
    'S.pneumoniae': 'Streptococcus pneumoniae',
    'Viridans group streptococci': 'Viridans group streptococci',
    'H.influenzae': 'Haemophilus influenzae',
    'M.catarrhalis': 'Moraxella catarrhalis',
    'N.gonorrhoeae': 'Neisseria gonorrhoeae',
    'N.meningitidis': 'Neisseria meningitidis',
    'Anaerobic bacteria': 'Anaerobic bacteria',
    'H.pylori': 'Helicobacter pylori',
    'L.monocytogenes': 'Listeria monocytogenes',
    'Pasteurella': 'Pasteurella spp.',
    'C.jejuni_C.coli': 'Campylobacter jejuni/coli',
    'Corynebacterium': 'Corynebacterium spp.',
    'C.diphtheriae_C.ulcerans': 'Corynebacterium diphtheriae/ulcerans',
    'A.sanguinicola_A.urinae': 'Aerococcus sanguinicola/urinae',
    'K.kingae': 'Kingella kingae',
    'Aeromonas': 'Aeromonas spp.',
    'A.xylosoxidans': 'Achromobacter xylosoxidans',
    'Vibrio': 'Vibrio spp.',
    'Bacillus': 'Bacillus spp.',
    'B.anthracis': 'Bacillus anthracis',
    'B.melitensis ': 'Brucella melitensis',
    'B.pseudomallei': 'Burkholderia pseudomallei',
    'B.cepacia': 'Burkholderia cepacia',
    'L.pneumophila': 'Legionella pneumophila',
    'M.tuberculosis': 'Mycobacterium tuberculosis',
}

# Common antimicrobial name to code mappings
AB_CODES = {
    'benzylpenicillin': 'PEN',
    'ampicillin': 'AMP',
    'amoxicillin': 'AMX',
    'amoxicillin-clavulanic acid': 'AMC',
    'ampicillin-sulbactam': 'SAM',
    'piperacillin': 'PIP',
    'piperacillin-tazobactam': 'TZP',
    'ticarcillin-clavulanic acid': 'TCC',
    'temocillin': 'TEM',
    'mecillinam': 'MEC',
    'cefaclor': 'CEC',
    'cefalexin': 'LEX',
    'cefadroxil': 'CFR',
    'cefazolin': 'CZO',
    'cefuroxime': 'CXM',
    'cefotaxime': 'CTX',
    'ceftriaxone': 'CRO',
    'ceftazidime': 'CAZ',
    'ceftazidime-avibactam': 'CZA',
    'cefepime': 'FEP',
    'cefoxitin': 'FOX',
    'ceftaroline': 'CPT',
    'ceftobiprole': 'BPR',
    'cefiderocol': 'FDC',
    'ceftolozane-tazobactam': 'C/T',
    'cefixime': 'CFM',
    'cefpodoxime': 'CPD',
    'ceftibuten': 'CTB',
    'aztreonam': 'ATM',
    'meropenem': 'MEM',
    'imipenem': 'IPM',
    'ertapenem': 'ETP',
    'doripenem': 'DOR',
    'meropenem-vaborbactam': 'MVB',
    'imipenem-relebactam': 'IMR',
    'gentamicin': 'GEN',
    'tobramycin': 'TOB',
    'amikacin': 'AMK',
    'netilmicin': 'NET',
    'ciprofloxacin': 'CIP',
    'levofloxacin': 'LVX',
    'moxifloxacin': 'MXF',
    'ofloxacin': 'OFX',
    'norfloxacin': 'NOR',
    'nalidixic acid': 'NAL',
    'erythromycin': 'ERY',
    'azithromycin': 'AZM',
    'clarithromycin': 'CLR',
    'clindamycin': 'CLI',
    'tetracycline': 'TCY',
    'doxycycline': 'DOX',
    'minocycline': 'MNO',
    'tigecycline': 'TGC',
    'eravacycline': 'ERV',
    'chloramphenicol': 'CHL',
    'fosfomycin': 'FOS',
    'fusidic acid': 'FUS',
    'linezolid': 'LZD',
    'tedizolid': 'TZD',
    'rifampicin': 'RIF',
    'trimethoprim': 'TMP',
    'trimethoprim-sulfamethoxazole': 'SXT',
    'sulfamethoxazole': 'SMX',
    'nitrofurantoin': 'NIT',
    'metronidazole': 'MTZ',
    'vancomycin': 'VAN',
    'teicoplanin': 'TEC',
    'daptomycin': 'DAP',
    'colistin': 'COL',
    'polymyxin b': 'PLB',
    'mupirocin': 'MUP',
    'quinupristin-dalfopristin': 'QDA',
}


def clean_value(val):
    """Clean a breakpoint value, removing footnotes and handling special cases."""
    if pd.isna(val) or val == '' or val == '-' or val == 'nan':
        return None

    val = str(val).strip()

    # Handle "IE" (Insufficient Evidence) or "IP" or similar
    if val.upper() in ['IE', 'IP', '-', 'NA']:
        return None

    # Handle "Note" references
    if val.lower().startswith('note'):
        return None

    # Remove parentheses (tentative values) but keep the number
    val = val.replace('(', '').replace(')', '')

    # Remove letter footnotes (A, B, C, etc.) at the end
    val = re.sub(r'[A-Za-z,]+$', '', val)

    # Remove numeric footnotes (superscript numbers)
    val = re.sub(r'[\d]+$', '', val) if not re.match(r'^[\d.]+$', val) else val

    # Handle remaining edge cases
    val = val.strip()

    if val == '' or val == '-':
        return None

    try:
        return float(val)
    except ValueError:
        return None


def get_ab_code(name):
    """Get antimicrobial code from name."""
    # Clean the name
    clean_name = name.lower().strip()

    # Remove indication info in parentheses for matching
    base_name = re.sub(r'\s*\([^)]*\)', '', clean_name).strip()

    # Remove footnote numbers
    base_name = re.sub(r'\d+$', '', base_name).strip()

    # Direct lookup
    if base_name in AB_CODES:
        return AB_CODES[base_name]

    # Try partial matching
    for ab_name, code in AB_CODES.items():
        if ab_name in base_name or base_name in ab_name:
            return code

    # Generate code from first 3 letters as fallback
    return base_name[:3].upper()


def parse_indication(name):
    """Extract indication from antimicrobial name."""
    match = re.search(r'\(([^)]+)\)', name)
    if match:
        indication = match.group(1).lower()
        if 'other than meningitis' in indication or 'indications other' in indication:
            return 'non-meningitis'
        elif 'uti' in indication or 'urinary' in indication:
            return 'UTI'
        elif 'meningitis' in indication:
            return 'meningitis'
        elif 'oral' in indication:
            return 'oral'
        else:
            return indication
    return None


def clean_category(category):
    """Clean category name by removing footnote numbers."""
    if category is None:
        return None
    # Remove trailing numbers (footnotes)
    return re.sub(r'\d+$', '', category).strip()


def parse_sheet(xlsx, sheet_name, organism_group):
    """Parse a single organism sheet."""
    try:
        df = pd.read_excel(xlsx, sheet_name=sheet_name, header=None)
    except Exception as e:
        print(f"  Error reading sheet {sheet_name}: {e}")
        return []

    breakpoints = []
    current_category = None
    num_cols = len(df.columns)

    # Find the header row (contains "S ≤")
    header_row = None
    has_disk = False
    for i in range(min(15, len(df))):
        row_str = ' '.join(df.iloc[i].astype(str))
        if 'S ≤' in row_str or 'S≤' in row_str:
            header_row = i
            # Check if this sheet has disk diffusion columns
            has_disk = 'S ≥' in row_str or 'Zone' in row_str
            break

    if header_row is None:
        print(f"  Could not find header row in {sheet_name}")
        return []

    # Parse data rows
    for i in range(header_row + 1, len(df)):
        row = df.iloc[i]
        name = str(row[0]).strip() if pd.notna(row[0]) else ''

        if not name or name == 'nan':
            continue

        # Check if this is a category header
        if pd.isna(row[1]) or str(row[1]).strip() in ['', 'nan', 'MIC breakpoints \n(mg/L)', 'MIC breakpoints']:
            # Check if it looks like a category (ends with specific patterns)
            if any(cat in name.lower() for cat in ['penicillin', 'cephalosporin', 'carbapenem', 'aminoglycoside',
                                                     'fluoroquinolone', 'macrolide', 'glycopeptide', 'tetracycline',
                                                     'various', 'other', 'anti-mrsa', 'agent']):
                current_category = name.replace('\n', ' ').strip()
                continue

        # Parse breakpoint values (handle variable column counts)
        mic_s = clean_value(row[1]) if num_cols > 1 else None
        mic_r = clean_value(row[2]) if num_cols > 2 else None

        # Disk columns are typically at index 4, 5, 6 for sheets with 9 columns
        disk_content = None
        zone_s = None
        zone_r = None

        if has_disk and num_cols >= 7:
            disk_content = str(row[4]).strip() if num_cols > 4 and pd.notna(row[4]) and str(row[4]).strip() not in ['', 'nan', '-'] else None
            zone_s = clean_value(row[5]) if num_cols > 5 else None
            zone_r = clean_value(row[6]) if num_cols > 6 else None

        # Skip if no valid breakpoints
        if mic_s is None and mic_r is None and zone_s is None and zone_r is None:
            continue

        # Get antimicrobial info
        ab_code = get_ab_code(name)
        indication = parse_indication(name)
        clean_name = re.sub(r'\d+$', '', name).strip()  # Remove trailing footnotes

        # Create MIC breakpoint entry
        if mic_s is not None or mic_r is not None:
            entry = {
                'guideline': 'EUCAST 2026',
                'organism_group': organism_group,
                'antimicrobial': clean_name,
                'ab': ab_code,
                'category': clean_category(current_category),
                'method': 'MIC',
                'breakpoint_S': mic_s,
                'breakpoint_R': mic_r,
                'unit': 'mg/L',
                'indication': indication,
                'source': 'clinical'
            }
            breakpoints.append(entry)

        # Create disk diffusion breakpoint entry
        if zone_s is not None or zone_r is not None:
            entry = {
                'guideline': 'EUCAST 2026',
                'organism_group': organism_group,
                'antimicrobial': clean_name,
                'ab': ab_code,
                'category': clean_category(current_category),
                'method': 'DISK',
                'disk_dose': disk_content,
                'breakpoint_S': zone_s,
                'breakpoint_R': zone_r,
                'unit': 'mm',
                'indication': indication,
                'source': 'clinical'
            }
            breakpoints.append(entry)

    return breakpoints


def main():
    excel_path = Path('/Users/georgnaver/Developer/claude-konsulten/v_16.0__BreakpointTables.xlsx')
    output_path = Path('/Users/georgnaver/Developer/claude-konsulten/bacteria-search/data/clinical_breakpoints_eucast2026.json')

    print(f"Reading {excel_path}")
    xlsx = pd.ExcelFile(excel_path)

    all_breakpoints = []

    for sheet_name, organism_group in ORGANISM_SHEETS.items():
        if sheet_name in xlsx.sheet_names:
            print(f"Parsing {sheet_name}...")
            breakpoints = parse_sheet(xlsx, sheet_name, organism_group)
            print(f"  Found {len(breakpoints)} breakpoints")
            all_breakpoints.extend(breakpoints)
        else:
            print(f"  Sheet {sheet_name} not found")

    print(f"\nTotal breakpoints: {len(all_breakpoints)}")

    # Save to JSON
    with open(output_path, 'w') as f:
        json.dump(all_breakpoints, f, indent=2)

    print(f"Saved to {output_path}")

    # Print some stats
    by_organism = {}
    for bp in all_breakpoints:
        org = bp['organism_group']
        by_organism[org] = by_organism.get(org, 0) + 1

    print("\nBreakpoints by organism group:")
    for org, count in sorted(by_organism.items(), key=lambda x: -x[1]):
        print(f"  {org}: {count}")


if __name__ == '__main__':
    main()
