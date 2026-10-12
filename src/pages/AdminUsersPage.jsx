import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await api.get('/api/admin/users');
        setUsers(data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>User management</h1>
        </div>
      </div>

      <div className="table-panel">
        {loading ? (
          <p className="page-state">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="empty-state">No users found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
