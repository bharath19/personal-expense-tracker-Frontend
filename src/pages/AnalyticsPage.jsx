import { useEffect, useState } from 'react';
import { BarChart, Bar, CartesianGrid, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/axios';
import { toast } from 'react-toastify';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export default function AnalyticsPage() {
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [categoryRes, trendRes] = await Promise.all([
          api.get('/api/expenses/category-summary'),
          api.get('/api/expenses/monthly-trend'),
        ]);
        setCategoryData(categoryRes.data || []);
        setTrendData(trendRes.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) return <div className="page-state">Loading analytics...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Analytics</h1>
        </div>
      </div>

      <div className="chart-grid">
        <section className="panel chart-panel">
          <h3>Category breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoryName" />
              <YAxis />
              <Tooltip formatter={(value) => currencyFormatter.format(value)} />
              <Bar dataKey="total" fill="#168a73" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="panel chart-panel">
          <h3>Monthly spend trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => currencyFormatter.format(value)} />
              <Line type="monotone" dataKey="total" stroke="#d19033" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
