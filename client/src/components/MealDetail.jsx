import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMeal, getMealHistory, consumeMeal, deleteMeal } from '../api.js';
import StarRating from './StarRating.jsx';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [consumeCount, setConsumeCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [m, h] = await Promise.all([getMeal(id), getMealHistory(id)]);
        setMeal(m);
        setHistory(h);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleConsume() {
    try {
      const updated = await consumeMeal(id, consumeCount);
      if (updated.servings === 0) {
        navigate('/');
      } else {
        setMeal(updated);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${meal.name}"? This cannot be undone.`)) return;
    try {
      await deleteMeal(id);
      navigate('/');
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <div className="page"><div className="loading">Loading…</div></div>;
  if (!meal) return <div className="page"><div className="error-msg">{error || 'Meal not found.'}</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="page-title" style={{ fontSize: '1.1rem' }}>{meal.name}</h1>
        <Link to={`/meal/${id}/edit`} className="btn btn-secondary" style={{ padding: '0 14px', fontSize: '0.8rem' }}>
          Edit
        </Link>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {meal.photo_path ? (
        <img src={`/${meal.photo_path}`} alt={meal.name} className="detail-photo" />
      ) : (
        <div className="detail-photo-placeholder">🍱</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="detail-name">{meal.name}</h2>
        <span className={`servings-badge ${meal.servings <= 2 ? 'low' : ''}`} style={{ fontSize: '0.85rem', padding: '4px 12px' }}>
          {meal.servings} left
        </span>
      </div>

      {meal.rating && (
        <StarRating value={meal.rating} readonly />
      )}

      {(meal.calories || meal.protein || meal.carbs || meal.fat) && (
        <div className="macro-row">
          {meal.calories != null && (
            <div className="macro-box">
              <div className="value">{meal.calories}</div>
              <div className="label">cal</div>
            </div>
          )}
          {meal.protein != null && (
            <div className="macro-box">
              <div className="value">{meal.protein}g</div>
              <div className="label">protein</div>
            </div>
          )}
          {meal.carbs != null && (
            <div className="macro-box">
              <div className="value">{meal.carbs}g</div>
              <div className="label">carbs</div>
            </div>
          )}
          {meal.fat != null && (
            <div className="macro-box">
              <div className="value">{meal.fat}g</div>
              <div className="label">fat</div>
            </div>
          )}
        </div>
      )}

      {meal.notes && (
        <div className="detail-section">
          <div className="detail-section-title">Notes</div>
          <div className="notes-text">{meal.notes}</div>
        </div>
      )}

      <div className="detail-section">
        <div className="detail-section-title">Consume</div>
        <div className="consume-row">
          <input
            type="number"
            min="1"
            max={meal.servings}
            value={consumeCount}
            onChange={(e) => setConsumeCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="count-input"
          />
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConsume}>
            ✓ Mark {consumeCount === 1 ? 'one' : consumeCount} consumed
          </button>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">Added {formatDate(meal.created_at)}</div>
      </div>

      {history.length > 0 && (
        <div className="detail-section">
          <button className="history-toggle" onClick={() => setShowHistory(!showHistory)}>
            <span>Recipe history ({history.length} version{history.length !== 1 ? 's' : ''})</span>
            <span>{showHistory ? '▲' : '▼'}</span>
          </button>
          {showHistory && (
            <div className="history-list">
              {history.map((h) => (
                <div key={h.id} className="history-item">
                  <div className="history-item-date">{formatDate(h.changed_at)}</div>
                  {h.change_note && <div className="history-item-note">"{h.change_note}"</div>}
                  <div className="history-macros">
                    {[
                      h.calories && `${h.calories} cal`,
                      h.protein && `${h.protein}g protein`,
                      h.carbs && `${h.carbs}g carbs`,
                      h.fat && `${h.fat}g fat`,
                    ].filter(Boolean).join(' · ') || 'No macros recorded'}
                  </div>
                  {h.notes && (
                    <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: '0.8rem' }}>{h.notes}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="action-row" style={{ marginTop: 24 }}>
        <button className="btn btn-danger btn-full" onClick={handleDelete}>
          Delete meal
        </button>
      </div>
    </div>
  );
}
