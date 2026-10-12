import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="auth-card not-found-card">
        <h1>404</h1>
        <p>Page not found.</p>
        <Link className="primary-btn" to="/">Go home</Link>
      </div>
    </div>
  );
}
