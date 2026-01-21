import "./globals.css";
import ThemeToggle from "../components/ThemeToggle";
import HeaderSearch from "../components/HeaderSearch";

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
          <div className="header-container">
            <a href="/" className="header-brand">
              <span className="header-logo">Bacteria Search</span>
              <span className="header-tagline">EUCAST 2026</span>
            </a>
            <HeaderSearch />
            <ThemeToggle />
          </div>
        </header>
        <main className="app-main">
          <div className="main-container">
            {children}
          </div>
        </main>
        <footer className="app-footer">
          <div className="footer-container">
            <p>Data source: EUCAST Clinical Breakpoint Tables v16.0</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
