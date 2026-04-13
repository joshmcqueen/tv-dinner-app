import { useState, useEffect } from 'react';
import { getMeals, consumeMeal } from '../api.js';
import MealCard from './MealCard.jsx';

export default function MealList() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getMeals();
      setMeals(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConsume(id) {
    try {
      const updated = await consumeMeal(id, 1);
      setMeals((prev) =>
        updated.servings === 0
          ? prev.filter((m) => m.id !== id)
          : prev.map((m) => (m.id === id ? updated : m))
      );
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
        <h1 className="page-title">📺 TV Dinners</h1>
        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          {meals.length} meal{meals.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {meals.length > 3 && (
        <input
          className="search-bar"
          type="search"
          placeholder="Search meals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {loading ? (
        <div className="loading">Loading freezer…</div>
      ) : (
        <div className="meal-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🧊</span>
              <p>{search ? 'No meals match your search.' : "Freezer's empty. Add your first meal prep!"}</p>
            </div>
          ) : (
            filtered.map((meal) => (
              <MealCard key={meal.id} meal={meal} onConsume={handleConsume} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
