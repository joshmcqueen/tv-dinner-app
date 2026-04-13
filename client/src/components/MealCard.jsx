import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating.jsx';

function cookedInfo(cookedAt) {
  if (!cookedAt) return null;
  const [y, m, d] = cookedAt.split('-').map(Number);
  const cooked = new Date(y, m - 1, d);

  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const today = new Date(ty, tm - 1, td);

  const days = Math.round((today - cooked) / (1000 * 60 * 60 * 24));
  const dateLabel = cooked.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const ageLabel = days === 0 ? 'today' : days === 1 ? '1 day old' : `${days} days old`;

  return { dateLabel, ageLabel, days };
}

export default function MealCard({ meal, onConsume }) {
  const navigate = useNavigate();
  const [eating, setEating] = useState(false);

  function handleConsume(e) {
    e.preventDefault();
    e.stopPropagation();
    if (eating) return;
    setEating(true);
    onConsume(meal.id);
    setTimeout(() => setEating(false), 1400);
  }

  const isLow = meal.servings <= 2;
  const cooked = cookedInfo(meal.cooked_at);

  return (
    <div className="meal-card" onClick={() => navigate(`/meal/${meal.id}`)}>
      {meal.photo_path ? (
        <img
          src={`/${meal.photo_path}`}
          alt={meal.name}
          className="meal-card-photo"
          loading="lazy"
        />
      ) : (
        <div className="meal-card-photo-placeholder">🍱</div>
      )}

      <div className="meal-card-body">
        <div className="meal-card-name">{meal.name}</div>

        <div className="meal-card-meta">
          <StarRating value={meal.rating} readonly size="small" />
          <span className={`servings-badge ${isLow ? 'low' : ''}`}>
            {meal.servings} left
          </span>
        </div>

        {(meal.calories || meal.protein) && (
          <div className="macro-line">
            {meal.calories && <span>{meal.calories} cal</span>}
            {meal.calories && meal.protein && ' · '}
            {meal.protein && <span>{meal.protein}g protein</span>}
          </div>
        )}

        {cooked && (
          <div className="cooked-line">
            <span className="cooked-date">{cooked.dateLabel}</span>
            <span className={`cooked-age ${cooked.days >= 21 ? 'old' : cooked.days >= 14 ? 'aging' : ''}`}>
              {cooked.ageLabel}
            </span>
          </div>
        )}
      </div>

      <button className={`consume-btn ${eating ? 'eating' : ''}`} onClick={handleConsume}>
        {eating ? '✓ Logged!' : '🥡 I ate!'}
      </button>
    </div>
  );
}
