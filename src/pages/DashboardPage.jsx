import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/useAuth';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const dateFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryRes, expenseRes, categoryRes] = await Promise.all([
          api.get('/api/expenses/summary'),
          api.get('/api/expenses', { params: { page: 0, size: 5 } }),
          api.get('/api/expenses/category-summary'),
        ]);

        setSummary(summaryRes.data);
        setRecentExpenses(expenseRes.data.content || []);
        setCategoryData(categoryRes.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load dashboard');
      } finally {
        setCurrentDate(new Date());
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading || !currentDate) return <div className="page-state">Loading dashboard...</div>;

  const now = currentDate;
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';
  const monthlyBudget = Number(summary.monthlyBudget) || 0;
  const monthSpend = Number(summary.currentMonthExpenses) || 0;
  const remainingBudget = Number(summary.remainingBudget) || 0;
  const budgetUsed = monthlyBudget > 0 ? Math.min((monthSpend / monthlyBudget) * 100, 100) : 0;
  const overBudget = remainingBudget < 0;
  const topCategory = categoryData.reduce((top, category) => (
    Number(category.total) > Number(top?.total || 0) ? category : top
  ), null);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{dateFormatter.format(now)}</p>
          <h1>{greeting}, {firstName}</h1>
          <p className="dashboard-date">Your spending snapshot for {monthFormatter.format(now)}</p>
        </div>
        <Link
          className="primary-btn dashboard-add"
          to="/expenses/new"
        >+ Add expense</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>This month</span>
          <strong>{currencyFormatter.format(monthSpend)}</strong>
          <small>Spent so far</small>
        </div>
        <div className="stat-card accent">
          <span>Today</span>
          <strong>{currencyFormatter.format(summary.todayExpenses || 0)}</strong>
          <small>Today's spending</small>
        </div>
        <div className="stat-card">
          <span>Top category</span>
          <strong className="stat-category">{topCategory?.categoryName || 'No spending yet'}</strong>
          <small>{topCategory ? currencyFormatter.format(topCategory.total) : 'Add an expense to get started'}</small>
        </div>
        <div className="stat-card">
          <span>All-time spending</span>
          <strong>{currencyFormatter.format(summary.totalExpenses || 0)}</strong>
          <small>Across all recorded expenses</small>
        </div>
      </div>

      <section className="budget-panel">
        <div className="budget-heading">
          <div>
            <p className="budget-kicker">Monthly budget</p>
            <h2>{currencyFormatter.format(monthlyBudget)}</h2>
          </div>
          <div className={`budget-remaining${overBudget ? ' is-over-budget' : ''}`}>
            <strong>{currencyFormatter.format(Math.abs(remainingBudget))}</strong>
            <span>{overBudget ? 'over budget' : 'remaining'}</span>
          </div>
        </div>
        <div
          className={`budget-track${overBudget ? ' is-over-budget' : ''}`}
          role="progressbar"
          aria-label="Monthly budget used"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(budgetUsed)}
        >
          <span style={{ width: `${budgetUsed}%` }} />
        </div>
        <div className="budget-caption">
          <span>{currencyFormatter.format(monthSpend)} spent this month</span>
          <strong>{Math.round(budgetUsed)}% used</strong>
        </div>
      </section>

      <div className="panel-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Latest activity</p>
              <h3>Recent expenses</h3>
            </div>
            {recentExpenses.length > 0 && <Link to="/expenses">View all</Link>}
          </div>
          {recentExpenses.length === 0 ? (
            <div className="dashboard-empty">
              <p className="empty-title">Your first expense starts the picture.</p>
              <p>Record a purchase to see your budget and spending patterns come to life.</p>
              <Link className="secondary-btn" to="/expenses/new">Add your first expense</Link>
            </div>
          ) : (
            <ul className="transaction-list">
              {recentExpenses.map((expense) => (
                <li key={expense.id}>
                  <div>
                    <strong>{expense.description}</strong>
                    <small>{expense.categoryName} · {expense.paymentMethod} · {expense.date}</small>
                  </div>
                  <span>{currencyFormatter.format(expense.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <p className="panel-kicker">Shortcuts</p>
          <h3>Keep things moving</h3>
          <div className="quick-actions">
            <Link to="/expenses/new">Add an expense <span aria-hidden="true">↗</span></Link>
            <Link to="/expenses">Search history <span aria-hidden="true">↗</span></Link>
            <Link to="/analytics">Explore analytics <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </div>
    </div>
  );
}
