import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FileText, Cpu, BookOpen, Upload, BarChart3, Sliders, Home } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';

export default function Navbar() {
  const { results } = useScreening();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/jd-input', label: 'JD Input', icon: FileText },
    { path: '/jd-review', label: 'JD Review', icon: Cpu },
    { path: '/skill-dictionary', label: 'Skills', icon: BookOpen },
    { path: '/resume-upload', label: 'Resumes', icon: Upload },
    { path: '/results', label: 'Results', icon: BarChart3, count: results.length },
    { path: '/settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          <div className="navbar-logo-icon" style={{ padding: 0, overflow: 'hidden' }}>
            <img src="/logo.png" alt="Scorivia Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="navbar-logo-name">Scorivia</span>
              <span className="navbar-pill">Offline</span>
            </div>
            <div className="navbar-logo-sub">Rule-Based Resume Matching</div>
          </div>
        </NavLink>

        {/* Nav links */}
        <nav className="navbar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`navbar-nav-link${isActive ? ' active' : ''}`}
              >
                <Icon style={{ width: 13, height: 13 }} />
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span className="navbar-badge">{item.count}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

