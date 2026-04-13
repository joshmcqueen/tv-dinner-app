import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating.jsx';

export default function MealCard({ meal, onConsume }) {
  const navigate = useNavigate();

  function handleConsume(e) {
    e.preventDefault();
    e.stopPropagation();
    onConsume(meal.id);
  }

  const isLow = meal.servings <= 2;

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
      </div>

      <button className="consume-btn" onClick={handleConsume}>
        ✓ Consumed one
      </button>
    </div>
  );
}
