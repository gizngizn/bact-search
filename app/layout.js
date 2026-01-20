import "./globals.css";
import ThemeToggle from "../components/ThemeToggle";

export const metadata = {
  title: "Bacteria Search - EUCAST Data",
  description: "Search bacteria and view antimicrobial resistance information from EUCAST data",
};

// Script to prevent flash of wrong theme
const themeInitScript = `
  (function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <a href="/" className="logo">Bacteria Search</a>
              <span className="subtitle">EUCAST Antimicrobial Resistance Data</span>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="app-main">
          {children}
        </main>
        <footer className="app-footer">
          <p>Data source: EUCAST 2026</p>
        </footer>
      </body>
    </html>
  );
}
