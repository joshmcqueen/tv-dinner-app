import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createMeal, updateMeal, getMeal } from '../api.js';
import StarRating from './StarRating.jsx';

function todayPT() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
}

const EMPTY = {
  name: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  rating: 0,
  notes: '',
  servings: 1,
  cooked_at: todayPT(),
  change_note: '',
};

export default function MealForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [fields, setFields] = useState(EMPTY);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    getMeal(id)
      .then((meal) => {
        setFields({
          name: meal.name || '',
          calories: meal.calories ?? '',
          protein: meal.protein ?? '',
          carbs: meal.carbs ?? '',
          fat: meal.fat ?? '',
          rating: meal.rating || 0,
          notes: meal.notes || '',
          servings: meal.servings ?? 1,
          cooked_at: meal.cooked_at || todayPT(),
          change_note: '',
        });
        if (meal.photo_path) setExistingPhoto(`/${meal.photo_path}`);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(key, val) {
    setFields((prev) => ({ ...prev, [key]: val }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fields.name.trim()) {
      setError('Name is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append('name', fields.name.trim());
      if (fields.calories !== '') fd.append('calories', fields.calories);
      if (fields.protein !== '') fd.append('protein', fields.protein);
      if (fields.carbs !== '') fd.append('carbs', fields.carbs);
      if (fields.fat !== '') fd.append('fat', fields.fat);
      if (fields.rating) fd.append('rating', fields.rating);
      if (fields.notes.trim()) fd.append('notes', fields.notes.trim());
      fd.append('servings', fields.servings);
      fd.append('cooked_at', fields.cooked_at);
      if (isEdit && fields.change_note.trim()) fd.append('change_note', fields.change_note.trim());
      if (photoFile) fd.append('photo', photoFile);

      const meal = isEdit ? await updateMeal(id, fd) : await createMeal(fd);
      navigate(isEdit ? '/' : `/meal/${meal.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page"><div className="loading">Loading…</div></div>;

  const preview = photoPreview || existingPhoto;

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="page-title">{isEdit ? 'Edit Meal' : 'New Meal'}</h1>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <form className="form" onSubmit={handleSubmit}>
        {/* Photo */}
        <div className="field">
          <label>Photo</label>
          <div className="photo-upload" onClick={() => fileInputRef.current?.click()}>
            {preview ? (
              <img src={preview} alt="preview" className="photo-preview" />
            ) : (
              <div className="photo-placeholder">
                <span>📷</span>
                <span>Tap to take a photo or choose one</span>
              </div>
            )}
            {preview && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.8rem' }}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                Change photo
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="photo-input"
            onChange={handlePhotoChange}
          />
        </div>

        {/* Name */}
        <div className="field">
          <label>Name *</label>
          <input
            type="text"
            placeholder="e.g. Chicken Tikka Masala"
            value={fields.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>

        {/* Date cooked */}
        <div className="field">
          <label>Date cooked{isEdit ? ' (updates entire batch)' : ''}</label>
          <input
            type="date"
            value={fields.cooked_at}
            onChange={(e) => set('cooked_at', e.target.value)}
          />
        </div>

        {/* Servings */}
        <div className="field">
          <label>Containers in freezer</label>
          <input
            type="number"
            min="0"
            value={fields.servings}
            onChange={(e) => set('servings', parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Macros */}
        <div className="field">
          <label>Macros (per container)</label>
          <div className="macro-grid">
            <input
              type="number"
              placeholder="Calories"
              min="0"
              value={fields.calories}
              onChange={(e) => set('calories', e.target.value)}
            />
            <input
              type="number"
              placeholder="Protein (g)"
              min="0"
              step="0.1"
              value={fields.protein}
              onChange={(e) => set('protein', e.target.value)}
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              min="0"
              step="0.1"
              value={fields.carbs}
              onChange={(e) => set('carbs', e.target.value)}
            />
            <input
              type="number"
              placeholder="Fat (g)"
              min="0"
              step="0.1"
              value={fields.fat}
              onChange={(e) => set('fat', e.target.value)}
            />
          </div>
        </div>

        {/* Rating */}
        <div className="field">
          <label>Rating</label>
          <StarRating value={fields.rating} onChange={(v) => set('rating', v)} />
        </div>

        {/* Notes */}
        <div className="field">
          <label>Notes</label>
          <textarea
            placeholder="Ingredients, changes you made, how to reheat…"
            value={fields.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>

        {/* Change note (edit only) */}
        {isEdit && (
          <div className="field">
            <label>What changed? (optional)</label>
            <input
              type="text"
              placeholder="e.g. Reduced salt, added paprika"
              value={fields.change_note}
              onChange={(e) => set('change_note', e.target.value)}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add to freezer'}
        </button>
      </form>
    </div>
  );
}
