import Link from 'next/link';
import { getCommonBacteria } from '@/lib/bacteria';

export default async function Home() {
  const commonBacteria = await getCommonBacteria(8);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          Clinical Breakpoint Data
        </h1>
        <p className="hero-description">
          Search and explore antimicrobial resistance data from EUCAST Clinical Breakpoint Tables v16.0
        </p>
      </section>

      {/* Common Bacteria Section */}
      <section className="common-section">
        <h2 className="section-title">Common Pathogens</h2>
        <div className="bacteria-grid">
          {commonBacteria.map((bacteria) => (
            <Link
              key={bacteria.mo}
              href={`/bacteria/${encodeURIComponent(bacteria.mo)}`}
              className="bacteria-link"
            >
              <span className="bacteria-link-name">{bacteria.fullname}</span>
              {bacteria.breakpointCount > 0 && (
                <span className="bacteria-link-count">{bacteria.breakpointCount}</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <div className="info-card">
          <h3 className="info-title">About EUCAST</h3>
          <p className="info-text">
            The European Committee on Antimicrobial Susceptibility Testing (EUCAST) provides clinical breakpoints
            to determine whether a microorganism is susceptible, intermediate, or resistant to antimicrobial agents.
          </p>
        </div>
        <div className="info-card">
          <h3 className="info-title">How to Use</h3>
          <p className="info-text">
            Use the search bar above to find a microorganism by name. View MIC and disk diffusion breakpoints
            to guide antimicrobial therapy decisions.
          </p>
        </div>
      </section>
    </div>
  );
}
