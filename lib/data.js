import fs from 'fs';
import path from 'path';

// Cache for loaded data
let bacteriaCache = null;
let bacteriaByMoCache = null;
let antimicrobialsCache = null;
let antimicrobialsByAbCache = null;
let intrinsicResistantCache = null;
let clinicalBreakpointsCache = null;
let microorganismsGroupsCache = null;

const dataDir = path.join(process.cwd(), 'data');

/**
 * Load bacteria data
 */
export function getBacteria() {
  if (!bacteriaCache) {
    const filePath = path.join(dataDir, 'bacteria.json');
    bacteriaCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return bacteriaCache;
}

/**
 * Get bacteria indexed by mo code
 */
export function getBacteriaByMo() {
  if (!bacteriaByMoCache) {
    const bacteria = getBacteria();
    bacteriaByMoCache = new Map();
    for (const b of bacteria) {
      bacteriaByMoCache.set(b.mo, b);
    }
  }
  return bacteriaByMoCache;
}

/**
 * Get a single bacterium by mo code
 */
export function getBacteriumByMo(mo) {
  const bacteriaMap = getBacteriaByMo();
  return bacteriaMap.get(mo) || null;
}

/**
 * Load antimicrobials data
 */
export function getAntimicrobials() {
  if (!antimicrobialsCache) {
    const filePath = path.join(dataDir, 'antimicrobials.json');
    antimicrobialsCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return antimicrobialsCache;
}

/**
 * Get antimicrobials indexed by ab code
 */
export function getAntimicrobialsByAb() {
  if (!antimicrobialsByAbCache) {
    const antimicrobials = getAntimicrobials();
    antimicrobialsByAbCache = new Map();
    for (const a of antimicrobials) {
      antimicrobialsByAbCache.set(a.ab, a);
    }
  }
  return antimicrobialsByAbCache;
}

/**
 * Get antimicrobial name by ab code
 */
export function getAntimicrobialName(ab) {
  const antimicrobials = getAntimicrobialsByAb();
  const antimicrobial = antimicrobials.get(ab);
  return antimicrobial ? antimicrobial.name : ab;
}

/**
 * Load intrinsic resistance data
 */
export function getIntrinsicResistant() {
  if (!intrinsicResistantCache) {
    const filePath = path.join(dataDir, 'intrinsic_resistant.json');
    intrinsicResistantCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return intrinsicResistantCache;
}

/**
 * Get intrinsic resistance for a specific bacterium
 */
export function getIntrinsicResistanceForBacterium(mo) {
  const allResistance = getIntrinsicResistant();
  const antimicrobials = getAntimicrobialsByAb();

  return allResistance
    .filter(ir => ir.mo === mo)
    .map(ir => {
      const antimicrobial = antimicrobials.get(ir.ab);
      return {
        ab: ir.ab,
        name: antimicrobial ? antimicrobial.name : ir.ab,
        group: antimicrobial ? antimicrobial.group : []
      };
    });
}

/**
 * Load clinical breakpoints data (EUCAST 2026)
 */
export function getClinicalBreakpoints() {
  if (!clinicalBreakpointsCache) {
    const filePath = path.join(dataDir, 'clinical_breakpoints_eucast2026.json');
    clinicalBreakpointsCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return clinicalBreakpointsCache;
}

/**
 * Map a bacterium to its EUCAST organism group based on taxonomy
 */
function getOrganismGroupForBacterium(bacteria) {
  if (!bacteria) return null;

  const fullname = (bacteria.fullname || '').toLowerCase();
  const genus = (bacteria.genus || '').toLowerCase();
  const family = (bacteria.family || '').toLowerCase();
  const order = (bacteria.order || '').toLowerCase();

  // Specific species/genus matches first
  if (fullname.includes('escherichia coli') || genus === 'escherichia') return 'Enterobacterales';
  if (fullname.includes('klebsiella') || genus === 'klebsiella') return 'Enterobacterales';
  if (fullname.includes('salmonella') || genus === 'salmonella') return 'Enterobacterales';
  if (fullname.includes('enterobacter') || genus === 'enterobacter') return 'Enterobacterales';
  if (fullname.includes('citrobacter') || genus === 'citrobacter') return 'Enterobacterales';
  if (fullname.includes('proteus') || genus === 'proteus') return 'Enterobacterales';
  if (fullname.includes('morganella') || genus === 'morganella') return 'Enterobacterales';
  if (fullname.includes('serratia') || genus === 'serratia') return 'Enterobacterales';
  if (fullname.includes('providencia') || genus === 'providencia') return 'Enterobacterales';
  if (fullname.includes('shigella') || genus === 'shigella') return 'Enterobacterales';

  if (fullname.includes('pseudomonas aeruginosa') || (genus === 'pseudomonas' && fullname.includes('aeruginosa'))) return 'Pseudomonas aeruginosa';
  if (fullname.includes('stenotrophomonas maltophilia')) return 'Stenotrophomonas maltophilia';
  if (genus === 'acinetobacter') return 'Acinetobacter spp.';

  if (fullname.includes('staphylococcus aureus') || genus === 'staphylococcus') return 'Staphylococcus spp.';
  if (genus === 'enterococcus') return 'Enterococcus spp.';

  if (fullname.includes('streptococcus pneumoniae')) return 'Streptococcus pneumoniae';
  if (fullname.includes('streptococcus pyogenes') || fullname.includes('streptococcus agalactiae')) return 'Streptococcus groups A,B,C,G';
  if (genus === 'streptococcus') return 'Viridans group streptococci';

  if (fullname.includes('haemophilus influenzae') || genus === 'haemophilus') return 'Haemophilus influenzae';
  if (fullname.includes('moraxella catarrhalis')) return 'Moraxella catarrhalis';
  if (fullname.includes('neisseria gonorrhoeae')) return 'Neisseria gonorrhoeae';
  if (fullname.includes('neisseria meningitidis')) return 'Neisseria meningitidis';

  if (fullname.includes('helicobacter pylori')) return 'Helicobacter pylori';
  if (fullname.includes('listeria monocytogenes')) return 'Listeria monocytogenes';
  if (fullname.includes('campylobacter jejuni') || fullname.includes('campylobacter coli')) return 'Campylobacter jejuni/coli';

  if (genus === 'corynebacterium') {
    if (fullname.includes('diphtheriae') || fullname.includes('ulcerans')) return 'Corynebacterium diphtheriae/ulcerans';
    return 'Corynebacterium spp.';
  }

  if (genus === 'pasteurella') return 'Pasteurella spp.';
  if (genus === 'aeromonas') return 'Aeromonas spp.';
  if (genus === 'vibrio') return 'Vibrio spp.';
  if (fullname.includes('achromobacter xylosoxidans')) return 'Achromobacter xylosoxidans';
  if (fullname.includes('kingella kingae')) return 'Kingella kingae';
  if (fullname.includes('aerococcus')) return 'Aerococcus sanguinicola/urinae';

  if (genus === 'bacillus') {
    if (fullname.includes('anthracis')) return 'Bacillus anthracis';
    return 'Bacillus spp.';
  }
  if (fullname.includes('brucella melitensis')) return 'Brucella melitensis';
  if (fullname.includes('burkholderia pseudomallei')) return 'Burkholderia pseudomallei';
  if (fullname.includes('burkholderia cepacia')) return 'Burkholderia cepacia';
  if (fullname.includes('legionella pneumophila')) return 'Legionella pneumophila';
  if (fullname.includes('mycobacterium tuberculosis')) return 'Mycobacterium tuberculosis';

  // Order-level matching
  if (order === 'enterobacterales') return 'Enterobacterales';

  // Family-level matching for anaerobes
  if (family === 'bacteroidaceae' || genus === 'bacteroides' || genus === 'clostridium' ||
      genus === 'fusobacterium' || genus === 'prevotella') return 'Anaerobic bacteria';

  return null;
}

/**
 * Get clinical breakpoints for a specific bacterium
 * Maps bacterium to organism group and returns appropriate breakpoints
 */
export function getBreakpointsForBacterium(mo) {
  const allBreakpoints = getClinicalBreakpoints();
  const antimicrobials = getAntimicrobialsByAb();
  const bacteria = getBacteriumByMo(mo);

  if (!bacteria) return [];

  // Get the organism group for this bacterium
  const organismGroup = getOrganismGroupForBacterium(bacteria);

  if (!organismGroup) {
    // No matching organism group found
    return [];
  }

  // Filter breakpoints for this organism group
  const filtered = allBreakpoints.filter(cb => cb.organism_group === organismGroup);

  // Deduplicate by ab + method + indication combination
  const seen = new Set();
  const deduped = filtered.filter(cb => {
    const key = `${cb.ab}-${cb.method}-${cb.indication || 'default'}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped.map(cb => {
    const antimicrobial = antimicrobials.get(cb.ab);
    return {
      ...cb,
      antimicrobialName: cb.antimicrobial || (antimicrobial ? antimicrobial.name : cb.ab),
      antimicrobialGroup: antimicrobial ? antimicrobial.group : [],
      isEcoff: false, // All new data is clinical breakpoints
      breakpointSource: 'Clinical',
      uti: cb.indication === 'UTI'
    };
  });
}

/**
 * Load microorganisms groups data
 */
export function getMicroorganismsGroups() {
  if (!microorganismsGroupsCache) {
    const filePath = path.join(dataDir, 'microorganisms_groups.json');
    microorganismsGroupsCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return microorganismsGroupsCache;
}

/**
 * Get groups that a bacterium belongs to
 */
export function getGroupsForBacterium(mo) {
  const allGroups = getMicroorganismsGroups();
  return allGroups.filter(g => g.mo === mo);
}

/**
 * Get clinical relevancy label based on prevalence
 */
export function getClinicalRelevancy(prevalence) {
  if (prevalence === 1.0) {
    return { level: 'high', label: 'Very Common' };
  } else if (prevalence >= 1.15 && prevalence <= 1.25) {
    return { level: 'high', label: 'Common' };
  } else if (prevalence === 1.5) {
    return { level: 'medium', label: 'Moderate' };
  } else {
    return { level: 'low', label: 'Less Common' };
  }
}
