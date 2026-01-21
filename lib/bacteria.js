import { getBacteria, getAntimicrobials, getClinicalBreakpoints } from './data';

/**
 * Get statistics about the bacteria database
 */
export function getBacteriaStats() {
  const bacteria = getBacteria();
  const breakpoints = getClinicalBreakpoints();
  const antimicrobials = getAntimicrobials();

  return {
    totalBacteria: bacteria.length,
    totalBreakpoints: breakpoints.length,
    totalAntimicrobials: antimicrobials.length
  };
}

/**
 * Get the most common/clinically relevant bacteria
 * Returns bacteria with prevalence = 1 (Very Common) that have breakpoint data
 */
export function getCommonBacteria(limit = 8) {
  const bacteria = getBacteria();
  const breakpoints = getClinicalBreakpoints();

  // Get unique organism groups from breakpoints
  const organismGroups = new Set(breakpoints.map(b => b.organism_group));

  // Common clinically important bacteria
  const commonNames = [
    'Escherichia coli',
    'Staphylococcus aureus',
    'Klebsiella pneumoniae',
    'Pseudomonas aeruginosa',
    'Streptococcus pneumoniae',
    'Enterococcus faecalis',
    'Acinetobacter baumannii',
    'Salmonella enterica',
    'Enterobacter cloacae',
    'Haemophilus influenzae',
    'Neisseria gonorrhoeae',
    'Campylobacter jejuni'
  ];

  // Find these bacteria in our data
  const results = [];
  for (const name of commonNames) {
    const found = bacteria.find(b =>
      b.fullname.toLowerCase() === name.toLowerCase()
    );
    if (found) {
      // Count breakpoints for this organism's group
      const breakpointCount = breakpoints.filter(bp => {
        // Map bacteria name to organism group
        if (name.includes('Escherichia') || name.includes('Klebsiella') ||
            name.includes('Salmonella') || name.includes('Enterobacter')) {
          return bp.organism_group === 'Enterobacterales';
        }
        if (name.includes('Staphylococcus')) return bp.organism_group === 'Staphylococcus spp.';
        if (name.includes('Pseudomonas aeruginosa')) return bp.organism_group === 'Pseudomonas aeruginosa';
        if (name.includes('Streptococcus pneumoniae')) return bp.organism_group === 'Streptococcus pneumoniae';
        if (name.includes('Enterococcus')) return bp.organism_group === 'Enterococcus spp.';
        if (name.includes('Acinetobacter')) return bp.organism_group === 'Acinetobacter spp.';
        if (name.includes('Haemophilus')) return bp.organism_group === 'Haemophilus influenzae';
        if (name.includes('Neisseria gonorrhoeae')) return bp.organism_group === 'Neisseria gonorrhoeae';
        if (name.includes('Campylobacter')) return bp.organism_group === 'Campylobacter jejuni/coli';
        return false;
      }).length;

      results.push({
        ...found,
        breakpointCount
      });
    }
    if (results.length >= limit) break;
  }

  return results;
}
