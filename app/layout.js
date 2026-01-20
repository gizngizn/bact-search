import "./globals.css";

export const metadata = {
  title: "Bacteria Search - EUCAST Data",
  description: "Search bacteria and view antimicrobial resistance information from EUCAST data",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <div className="header-content">
            <a href="/" className="logo">Bacteria Search</a>
            <span className="subtitle">EUCAST Antimicrobial Resistance Data</span>
          </div>
        </header>
        <main className="app-main">
          {children}
        </main>
        <footer className="app-footer">
          <p>Data source: EUCAST 2025</p>
        </footer>
      </body>
    </html>
  );
}
