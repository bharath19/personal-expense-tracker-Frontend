import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/categories', label: 'Categories' },
  { to: '/profile', label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">₹</div>
          <div>
            <h2>Expense Tracker</h2>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              User Management
            </NavLink>
          )}
        </nav>

        <div className="user-panel">
          <div>
            <strong>{user?.name || 'User'}</strong>
            <p>{user?.email || 'user@example.com'}</p>
          </div>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="content-panel">
        <Outlet />
      </main>
    </div>
  );
}
