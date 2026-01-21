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
let ecoffsCache = null;

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
 * Load ECOFF (Epidemiological Cut-Off) data
 */
export function getEcoffs() {
  if (!ecoffsCache) {
    const filePath = path.join(dataDir, 'ecoffs.json');
    ecoffsCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return ecoffsCache;
}

/**
 * Get ECOFFs for a specific bacterium
 * ECOFFs are species-specific, so we match directly on mo code
 */
export function getEcoffsForBacterium(mo) {
  const allEcoffs = getEcoffs();
  const antimicrobials = getAntimicrobialsByAb();

  // Filter ECOFFs for this specific bacterium
  const filtered = allEcoffs.filter(ecoff => ecoff.mo === mo);

  // Deduplicate by ab + method combination (keep first occurrence)
  const seen = new Set();
  const deduped = filtered.filter(ecoff => {
    const key = `${ecoff.ab}-${ecoff.method}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped.map(ecoff => {
    const antimicrobial = antimicrobials.get(ecoff.ab);
    return {
      ...ecoff,
      antimicrobialName: antimicrobial ? antimicrobial.name : ecoff.ab,
      antimicrobialGroup: antimicrobial ? antimicrobial.group : [],
      // ECOFF has single value (S=R), representing the wild-type cutoff
      ecoff_value: ecoff.breakpoint_S
    };
  });
}

/**
 * Get groups that a bacterium belongs to
 */
export function getGroupsForBacterium(mo) {
  const allGroups = getMicroorganismsGroups();
  return allGroups.filter(g => g.mo === mo);
}

/**
 * Get all bacteria belonging to a specific group
 */
export function getBacteriaInGroup(moGroup) {
  const allGroups = getMicroorganismsGroups();
  const bacteriaMap = getBacteriaByMo();

  // Find all members of this group
  const groupMembers = allGroups.filter(g => g.mo_group === moGroup);

  // Get full bacteria info for each member
  return groupMembers.map(member => {
    const bacteria = bacteriaMap.get(member.mo);
    return {
      ...member,
      bacteria: bacteria || null
    };
  }).filter(m => m.bacteria); // Only return members we have bacteria data for
}

/**
 * Get group info by group code
 */
export function getGroupByCode(moGroup) {
  const allGroups = getMicroorganismsGroups();
  const groupMembers = allGroups.filter(g => g.mo_group === moGroup);

  if (groupMembers.length === 0) return null;

  return {
    mo_group: moGroup,
    mo_group_name: groupMembers[0].mo_group_name,
    member_count: groupMembers.length
  };
}

/**
 * Get all unique groups
 */
export function getAllGroups() {
  const allGroups = getMicroorganismsGroups();
  const groupMap = new Map();

  for (const g of allGroups) {
    if (!groupMap.has(g.mo_group)) {
      groupMap.set(g.mo_group, {
        mo_group: g.mo_group,
        mo_group_name: g.mo_group_name,
        member_count: 0
      });
    }
    groupMap.get(g.mo_group).member_count++;
  }

  return Array.from(groupMap.values()).sort((a, b) =>
    a.mo_group_name.localeCompare(b.mo_group_name)
  );
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

/**
 * Infer gram stain from bacterial phylum
 * Based on established microbiological classification
 */
export function getGramStain(bacteria) {
  if (!bacteria || !bacteria.phylum) return null;

  const phylum = bacteria.phylum.toLowerCase();

  // Gram-positive phyla
  const gramPositive = [
    'bacillota',        // formerly Firmicutes
    'firmicutes',       // older name
    'actinomycetota',   // formerly Actinobacteria
    'actinobacteria',   // older name
  ];

  // Gram-negative phyla
  const gramNegative = [
    'pseudomonadota',   // formerly Proteobacteria
    'proteobacteria',   // older name
    'bacteroidota',     // formerly Bacteroidetes
    'bacteroidetes',    // older name
    'spirochaetota',    // Spirochetes
    'spirochaetes',     // older name
    'cyanobacteria',
    'fusobacteriota',   // formerly Fusobacteria
    'fusobacteria',     // older name
    'chlamydiota',      // Chlamydiae (unique cell wall but stain negative)
    'chlamydiae',       // older name
    'verrucomicrobiota',
    'planctomycetota',
    'campylobacterota', // formerly Epsilonproteobacteria
  ];

  // Gram-variable/indeterminate
  const gramVariable = [
    'deinococcota',     // Deinococcus-Thermus (thick cell wall, stain variable)
    'mycoplasmatota',   // No cell wall, don't stain
  ];

  if (gramPositive.some(p => phylum.includes(p))) {
    return { stain: 'positive', label: 'Gram-positive' };
  }
  if (gramNegative.some(p => phylum.includes(p))) {
    return { stain: 'negative', label: 'Gram-negative' };
  }
  if (gramVariable.some(p => phylum.includes(p))) {
    return { stain: 'variable', label: 'Gram-variable' };
  }

  return null;
}

/**
 * Get bacterial morphology based on genus
 * Common genera with known morphologies
 */
export function getMorphology(bacteria) {
  if (!bacteria || !bacteria.genus) return null;

  const genus = bacteria.genus.toLowerCase();

  // Cocci (spherical)
  const cocci = [
    'staphylococcus', 'streptococcus', 'enterococcus', 'neisseria',
    'micrococcus', 'aerococcus', 'pediococcus', 'leuconostoc',
    'gemella', 'moraxella', 'veillonella', 'peptostreptococcus'
  ];

  // Rods (bacilli)
  const rods = [
    'escherichia', 'klebsiella', 'salmonella', 'shigella', 'proteus',
    'enterobacter', 'serratia', 'citrobacter', 'morganella', 'providencia',
    'pseudomonas', 'acinetobacter', 'stenotrophomonas', 'burkholderia',
    'bacillus', 'clostridium', 'listeria', 'corynebacterium', 'lactobacillus',
    'haemophilus', 'legionella', 'brucella', 'bordetella', 'francisella',
    'yersinia', 'vibrio', 'aeromonas', 'plesiomonas', 'campylobacter',
    'helicobacter', 'bacteroides', 'prevotella', 'fusobacterium',
    'mycobacterium', 'nocardia', 'actinomyces', 'propionibacterium',
    'gardnerella', 'pasteurella', 'bartonella', 'rickettsia', 'ehrlichia'
  ];

  // Coccobacilli (short rods, ovoid)
  const coccobacilli = [
    'acinetobacter', 'haemophilus', 'bordetella', 'brucella',
    'pasteurella', 'moraxella', 'kingella'
  ];

  // Spiral/curved
  const spiral = [
    'spirillum', 'campylobacter', 'helicobacter', 'vibrio',
    'treponema', 'borrelia', 'leptospira'
  ];

  // Check coccobacilli first (more specific)
  if (coccobacilli.includes(genus)) {
    return { shape: 'coccobacillus', label: 'Coccobacillus' };
  }
  if (spiral.includes(genus)) {
    return { shape: 'spiral', label: 'Spiral/Curved' };
  }
  if (cocci.includes(genus)) {
    return { shape: 'coccus', label: 'Coccus' };
  }
  if (rods.includes(genus)) {
    return { shape: 'rod', label: 'Rod (Bacillus)' };
  }

  return null;
}

/**
 * Get oxygen requirements from bacteria data
 * Returns formatted oxygen tolerance info
 */
export function getOxygenRequirements(bacteria) {
  if (!bacteria || !bacteria.oxygen_tolerance) return null;

  const tolerance = bacteria.oxygen_tolerance.toLowerCase();

  const oxygenMap = {
    'obligate aerobe': { type: 'aerobe', label: 'Obligate aerobe' },
    'aerobe': { type: 'aerobe', label: 'Aerobe' },
    'obligate anaerobe': { type: 'anaerobe', label: 'Obligate anaerobe' },
    'anaerobe': { type: 'anaerobe', label: 'Anaerobe' },
    'facultative anaerobe': { type: 'facultative', label: 'Facultative anaerobe' },
    'microaerophile': { type: 'microaerophile', label: 'Microaerophile' },
    'aerotolerant': { type: 'aerotolerant', label: 'Aerotolerant' },
  };

  // Check for exact match first
  if (oxygenMap[tolerance]) {
    return oxygenMap[tolerance];
  }

  // Partial match for variations like "likely facultative anaerobe"
  if (tolerance.includes('facultative')) {
    return { type: 'facultative', label: 'Facultative anaerobe' };
  }
  if (tolerance.includes('anaerobe') && !tolerance.includes('facultative')) {
    return { type: 'anaerobe', label: 'Anaerobe' };
  }
  if (tolerance.includes('aerobe') && !tolerance.includes('anaerobe')) {
    return { type: 'aerobe', label: 'Aerobe' };
  }
  if (tolerance.includes('microaerophil')) {
    return { type: 'microaerophile', label: 'Microaerophile' };
  }

  // Return the raw value if no match
  return { type: 'unknown', label: bacteria.oxygen_tolerance };
}
