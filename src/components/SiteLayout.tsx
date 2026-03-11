import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/model', label: 'The Plan' },
  { to: '/timing', label: 'Decision Timing' }
];

export function SiteLayout() {
  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            <img src="https://storage.googleapis.com/permanent-assets/C3%20Logo.png" alt="C3 logo" className="brand-logo" />
            <div>
              <p className="brand-line-1">C³ Executive Suite</p>
              <p className="brand-line-2">Transitional & Interim Leadership</p>
            </div>
          </div>
          <nav>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {item.label}
              </NavLink>
            ))}
            <a href="https://calendly.com/mfackrell79/30min" className="nav-cta">
              30-Minute Gap Review
            </a>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} C³ Executive Suite</span>
          <span>Owner-led businesses deserve operator-grade leadership systems.</span>
        </div>
      </footer>
    </>
  );
}
