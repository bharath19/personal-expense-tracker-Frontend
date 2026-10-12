import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/useAuth';

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/api/categories');
      setCategories(data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    api.get('/api/categories', { signal: controller.signal })
      .then(({ data }) => setCategories(data || []))
      .catch((error) => {
        if (!controller.signal.aborted) {
          toast.error(error.response?.data?.message || 'Unable to load categories');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/categories', form);
      toast.success('Category created');
      setForm({ name: '', description: '' });
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/api/categories/${id}`);
      toast.success('Category deleted');
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete category');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Setup</p>
          <h1>Categories</h1>
        </div>
      </div>

      {user?.role === 'ADMIN' && (
        <form onSubmit={handleCreate} className="form-card compact-form">
          <div className="form-grid">
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label className="full-width">
              Description
              <input name="description" value={form.description} onChange={handleChange} />
            </label>
          </div>
          <div className="form-actions">
            <button className="primary-btn" type="submit">Add category</button>
          </div>
        </form>
      )}

      <div className="table-panel">
        {loading ? (
          <p className="page-state">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="empty-state">No categories available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                {user?.role === 'ADMIN' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description || '—'}</td>
                  {user?.role === 'ADMIN' && (
                    <td>
                      <button className="danger-btn" onClick={() => handleDelete(category.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
