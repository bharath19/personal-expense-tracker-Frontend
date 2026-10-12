import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const initialFilters = {
  keyword: '',
  paymentMethod: '',
  categoryId: '',
  fromDate: '',
  toDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date',
  direction: 'desc',
  page: 0,
  size: 10,
};

export default function ExpensesPage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsFor, setSuggestionsFor] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);

  const requestExpenseData = (nextFilters) => {
    const params = {
      ...nextFilters,
      categoryId: nextFilters.categoryId || undefined,
      paymentMethod: nextFilters.paymentMethod || undefined,
      keyword: nextFilters.keyword || undefined,
      minAmount: nextFilters.minAmount || undefined,
      maxAmount: nextFilters.maxAmount || undefined,
      fromDate: nextFilters.fromDate || undefined,
      toDate: nextFilters.toDate || undefined,
      page: nextFilters.page || 0,
      size: nextFilters.size || 10,
    };

    return Promise.all([
      api.get('/api/expenses', { params }),
      api.get('/api/categories'),
    ]);
  };

  const updateExpenseResults = ([expenseRes, categoryRes]) => {
    setExpenses(expenseRes.data.content || []);
    setCategories(categoryRes.data || []);
    const page = expenseRes.data.page || expenseRes.data;
    setPageInfo({
      totalPages: page.totalPages || 0,
      number: page.number || 0,
    });
  };

  const fetchExpenses = async (nextFilters = filters) => {
    try {
      updateExpenseResults(await requestExpenseData(nextFilters));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    requestExpenseData(initialFilters)
      .then((responses) => {
        if (active) updateExpenseResults(responses);
      })
      .catch((error) => {
        if (active) toast.error(error.response?.data?.message || 'Unable to load expenses');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const query = filters.keyword.trim();
    if (query.length < 2) return undefined;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      api.get('/api/expenses/suggestions', {
        params: { query },
        signal: controller.signal,
      })
        .then(({ data }) => {
          setSuggestions(data || []);
          setSuggestionsFor(query);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setSuggestions([]);
            setSuggestionsFor(query);
          }
        });
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [filters.keyword]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setLoading(true);
    fetchExpenses({ ...filters, page: 0 });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    setLoading(true);
    try {
      await api.delete(`/api/expenses/${id}`);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Records</p>
          <h1>Expense history</h1>
        </div>
        <button className="primary-btn" onClick={() => navigate('/expenses/new')}>+ Add expense</button>
      </div>

      <div className="filter-panel">
        <input
          name="keyword"
          placeholder="Search descriptions, notes, categories"
          value={filters.keyword}
          onChange={handleFilterChange}
          list="expense-description-suggestions"
        />
        <datalist id="expense-description-suggestions">
          {suggestionsFor === filters.keyword.trim() && suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
        <input name="paymentMethod" placeholder="Payment method" value={filters.paymentMethod} onChange={handleFilterChange} />
        <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange}>
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} />
        <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} />
        <input type="number" name="minAmount" placeholder="Min" value={filters.minAmount} onChange={handleFilterChange} />
        <input type="number" name="maxAmount" placeholder="Max" value={filters.maxAmount} onChange={handleFilterChange} />
        <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
          <option value="date">Date</option>
          <option value="amount">Amount</option>
          <option value="description">Description</option>
        </select>
        <select name="direction" value={filters.direction} onChange={handleFilterChange}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <button className="secondary-btn" onClick={handleSearch}>Apply</button>
      </div>

      <div className="table-panel">
        {loading ? (
          <p className="page-state">Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="empty-state">No expenses match the selected filters.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.date}</td>
                  <td>
                    <div className="expense-preview-wrap">
                      <span
                        className="expense-preview-trigger"
                        tabIndex={0}
                        aria-describedby={`expense-preview-${expense.id}`}
                      >
                        {expense.description}
                      </span>
                      <div
                        className="expense-preview-card"
                        id={`expense-preview-${expense.id}`}
                        role="tooltip"
                      >
                        <div className="expense-preview-heading">
                          <strong>{expense.description}</strong>
                          <span>{currencyFormatter.format(expense.amount)}</span>
                        </div>
                        <div className="expense-preview-details">
                          <div>
                            <small>Category</small>
                            <strong>{expense.categoryName}</strong>
                          </div>
                          <div>
                            <small>Date</small>
                            <strong>{expense.date}</strong>
                          </div>
                          <div>
                            <small>Payment method</small>
                            <strong>{expense.paymentMethod}</strong>
                          </div>
                        </div>
                        {expense.notes && (
                          <p className="expense-preview-note">
                            <small>Note</small>
                            <span>{expense.notes}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{expense.categoryName}</td>
                  <td>{expense.paymentMethod}</td>
                  <td>{currencyFormatter.format(expense.amount)}</td>
                  <td className="table-actions">
                    <Link to={`/expenses/${expense.id}/edit`}>Edit</Link>
                    <button className="danger-btn" onClick={() => handleDelete(expense.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination-row">
        <button
          disabled={pageInfo.number === 0}
          onClick={() => {
            setLoading(true);
            fetchExpenses({ ...filters, page: Math.max(pageInfo.number - 1, 0) });
          }}
        >Previous</button>
        <span>Page {pageInfo.number + 1} / {Math.max(pageInfo.totalPages, 1)}</span>
        <button
          disabled={pageInfo.number >= pageInfo.totalPages - 1}
          onClick={() => {
            setLoading(true);
            fetchExpenses({ ...filters, page: pageInfo.number + 1 });
          }}
        >Next</button>
      </div>
    </div>
  );
}
