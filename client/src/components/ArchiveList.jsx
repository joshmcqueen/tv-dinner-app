import { useState, useEffect, useRef } from 'react';
import { getArchivedMeals, unconsumeMeal } from '../api.js';
import MealCard from './MealCard.jsx';

export default function ArchiveList() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getArchivedMeals();
      setMeals(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function showToast(message) {
    clearTimeout(toastTimer.current);
    const key = Date.now();
    toastTimer.current = setTimeout(() => setToast((t) => (t?.key === key ? null : t)), 3000);
    setToast({ message, key });
  }

  async function handleRestore(id) {
    try {
      await unconsumeMeal(id);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      showToast('↩ Meal restored to freezer');
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = meals.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📦 Archive</h1>
        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          {meals.length} meal{meals.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {meals.length > 3 && (
        <input
          className="search-bar"
          type="search"
          placeholder="Search archive…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {loading ? (
        <div className="loading">Loading archive…</div>
      ) : (
        <div className="meal-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📦</span>
              <p>{search ? 'No meals match your search.' : 'Nothing archived yet. Meals appear here once fully eaten.'}</p>
            </div>
          ) : (
            filtered.map((meal) => (
              <MealCard key={meal.id} meal={meal} archived onRestore={handleRestore} />
            ))
          )}
        </div>
      )}

      {toast && (
        <div className="toast" key={toast.key}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
