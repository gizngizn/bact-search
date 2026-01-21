import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getBacteriumByMo,
  getIntrinsicResistanceForBacterium,
  getBreakpointsForBacterium,
  getEcoffsForBacterium,
  getGroupsForBacterium,
  getClinicalRelevancy,
  getGramStain,
  getMorphology,
  getOxygenRequirements
} from '@/lib/data';
import ResistanceTable from '@/components/ResistanceTable';
import BreakpointsTable from '@/components/BreakpointsTable';
import EcoffTable from '@/components/EcoffTable';

export async function generateMetadata({ params }) {
  const { mo } = await params;
  const bacteria = getBacteriumByMo(mo);

  if (!bacteria) {
    return { title: 'Bacteria Not Found' };
  }

  return {
    title: `${bacteria.fullname} - Bacteria Search`,
    description: `Antimicrobial resistance information for ${bacteria.fullname}`
  };
}

export default async function BacteriaDetailPage({ params }) {
  const { mo } = await params;
  const bacteria = getBacteriumByMo(mo);

  if (!bacteria) {
    notFound();
  }

  const intrinsicResistance = getIntrinsicResistanceForBacterium(mo);
  const breakpoints = getBreakpointsForBacterium(mo);
  const ecoffs = getEcoffsForBacterium(mo);
  const groups = getGroupsForBacterium(mo);
  const relevancy = getClinicalRelevancy(bacteria.prevalence);

  // Get characteristics
  const gramStain = getGramStain(bacteria);
  const morphology = getMorphology(bacteria);
  const oxygenReq = getOxygenRequirements(bacteria);
  const hasCharacteristics = gramStain || morphology || oxygenReq;

  // Build taxonomy path
  const taxonomy = [
    { label: 'Kingdom', value: bacteria.kingdom },
    { label: 'Phylum', value: bacteria.phylum },
    { label: 'Class', value: bacteria.class },
    { label: 'Order', value: bacteria.order },
    { label: 'Family', value: bacteria.family },
    { label: 'Genus', value: bacteria.genus },
  ];

  if (bacteria.rank === 'species' && bacteria.species) {
    taxonomy.push({ label: 'Species', value: bacteria.species });
  }

  // Filter out unknown values
  const filteredTaxonomy = taxonomy.filter(
    t => t.value && !t.value.includes('(unknown')
  );

  return (
    <div className="detail-page">
      <Link href="/" className="back-link">
        &larr; Back to Search
      </Link>

      <header className="bacteria-header">
        <div className="header-main">
          <h1 className="bacteria-title">{bacteria.fullname}</h1>
          <span className={`relevancy-badge relevancy-${relevancy.level}`}>
            {relevancy.label}
          </span>
        </div>
        <div className="bacteria-subtitle">
          <span className="rank-badge">{bacteria.rank}</span>
          <span className="mo-code">Code: {bacteria.mo}</span>
        </div>
      </header>

      {hasCharacteristics && (
        <section className="characteristics-section">
          {gramStain && (
            <div className={`char-badge char-gram-${gramStain.stain}`}>
              <span className="char-icon">◉</span>
              <span className="char-label">{gramStain.label}</span>
            </div>
          )}
          {morphology && (
            <div className={`char-badge char-shape-${morphology.shape}`}>
              <span className="char-icon">⬭</span>
              <span className="char-label">{morphology.label}</span>
            </div>
          )}
          {oxygenReq && (
            <div className={`char-badge char-oxygen-${oxygenReq.type}`}>
              <span className="char-icon">○</span>
              <span className="char-label">{oxygenReq.label}</span>
            </div>
          )}
        </section>
      )}

      <section className="detail-section">
        <h2>Taxonomy</h2>
        <div className="taxonomy-path">
          {filteredTaxonomy.map((item, index) => (
            <div key={item.label} className="taxonomy-item">
              <span className="taxonomy-label">{item.label}</span>
              <span className="taxonomy-value">{item.value}</span>
              {index < filteredTaxonomy.length - 1 && (
                <span className="taxonomy-arrow">&rarr;</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {groups.length > 0 && (
        <section className="detail-section">
          <h2>Group Memberships</h2>
          <div className="groups-list">
            {groups.map((g, idx) => (
              <Link
                key={idx}
                href={`/group/${encodeURIComponent(g.mo_group)}`}
                className="group-item group-item-link"
              >
                <span className="group-name">{g.mo_group_name}</span>
                <span className="group-arrow">&rarr;</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="detail-section">
        <h2>Intrinsic Resistance</h2>
        <p className="section-description">
          Antimicrobials to which this organism is naturally resistant.
        </p>
        <ResistanceTable resistances={intrinsicResistance} />
      </section>

      <section className="detail-section">
        <h2>Clinical Breakpoints (EUCAST 2026)</h2>
        <p className="section-description">
          Susceptibility (S) and resistance (R) breakpoints for interpreting antimicrobial susceptibility testing.
          {breakpoints.length > 0 && breakpoints[0].organism_group && (
            <> Using breakpoints from: <strong>{breakpoints[0].organism_group}</strong></>
          )}
        </p>
        <BreakpointsTable breakpoints={breakpoints} />
      </section>

      <section className="detail-section">
        <h2>Epidemiological Cut-Offs (EUCAST 2025)</h2>
        <p className="section-description">
          ECOFF values distinguish wild-type organisms (without acquired resistance) from non-wild-type.
          Values below ECOFF indicate wild-type; values above suggest acquired resistance mechanisms.
        </p>
        <EcoffTable ecoffs={ecoffs} />
      </section>
    </div>
  );
}
