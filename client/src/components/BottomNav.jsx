import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">🧊</span>
        <span>Freezer</span>
      </NavLink>
      <NavLink to="/add" className={({ isActive }) => `nav-item add-btn ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, background: 'var(--accent)', borderRadius: '50%', fontSize: '1.5rem', color: 'white' }}>+</span>
        </span>
        <span>Add Meal</span>
      </NavLink>
      <NavLink to="/archive" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">📦</span>
        <span>Archive</span>
      </NavLink>
    </nav>
  );
}
