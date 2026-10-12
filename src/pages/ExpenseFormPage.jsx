import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';

const emptyForm = {
  amount: '',
  categoryId: '',
  date: new Date().toISOString().slice(0, 10),
  description: '',
  paymentMethod: 'Cash',
  notes: '',
};

export default function ExpenseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoryRes = await api.get('/api/categories');
        setCategories(categoryRes.data || []);

        if (isEdit) {
          const expenseRes = await api.get(`/api/expenses/${id}`);
          const expense = expenseRes.data;
          setForm({
            amount: expense.amount,
            categoryId: expense.categoryId,
            date: expense.date,
            description: expense.description,
            paymentMethod: expense.paymentMethod,
            notes: expense.notes || '',
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load form');
      }
    };

    loadData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        categoryId: Number(form.categoryId),
      };

      if (isEdit) {
        await api.put(`/api/expenses/${id}`, payload);
        toast.success('Expense updated');
      } else {
        await api.post('/api/expenses', payload);
        toast.success('Expense added');
      }
      navigate('/expenses');
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        const firstMessage = Object.values(errors)[0];
        toast.error(firstMessage || 'Validation failed');
      } else {
        toast.error(error.response?.data?.message || 'Submission failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Entry</p>
          <h1>{isEdit ? 'Edit expense' : 'Add expense'}</h1>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Amount
            <input type="number" step="0.01" min="0.01" name="amount" value={form.amount} onChange={handleChange} required />
          </label>

          <label>
            Category
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </label>

          <label>
            Payment method
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </label>

          <label className="full-width">
            Description
            <input type="text" name="description" value={form.description} onChange={handleChange} required />
          </label>

          <label className="full-width">
            Notes
            <textarea name="notes" value={form.notes} onChange={handleChange} rows="4" />
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={() => navigate('/expenses')}>Cancel</button>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
