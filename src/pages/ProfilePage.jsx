import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/useAuth';

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/api/users/me');
        setForm({ name: data.name, email: data.email, password: '' });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password || undefined,
      };
      const { data } = await api.put('/api/users/me', payload);
      updateUser(data);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile');
    }
  };

  if (loading) return <div className="page-state">Loading profile...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Profile</h1>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label className="full-width">
            New password
            <input type="password" name="password" placeholder="Leave empty to keep current password" value={form.password} onChange={handleChange} />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-btn">Save profile</button>
        </div>
      </form>
    </div>
  );
}
