const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

async function processImage(filePath) {
  const tmpPath = filePath + '.tmp.jpg';
  await sharp(filePath)
    .rotate()  // read EXIF orientation, bake rotation into pixels, strip the tag
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(tmpPath);
  fs.renameSync(tmpPath, filePath);
}

// GET /api/meals — all meals with servings > 0
router.get('/', (req, res) => {
  const meals = db.prepare(
    'SELECT * FROM meals WHERE servings > 0 ORDER BY updated_at DESC'
  ).all();
  res.json(meals);
});

// GET /api/meals/all — all meals including empty (for history/admin)
router.get('/all', (req, res) => {
  const meals = db.prepare('SELECT * FROM meals ORDER BY updated_at DESC').all();
  res.json(meals);
});

// GET /api/meals/:id
router.get('/:id', (req, res) => {
  const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(req.params.id);
  if (!meal) return res.status(404).json({ error: 'Not found' });
  res.json(meal);
});

// GET /api/meals/:id/history
router.get('/:id/history', (req, res) => {
  const history = db.prepare(
    'SELECT * FROM meal_history WHERE meal_id = ? ORDER BY changed_at DESC'
  ).all(req.params.id);
  res.json(history);
});

// POST /api/meals — create
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    const { name, calories, protein, carbs, fat, rating, notes, servings } = req.body;

    let photo_path = null;
    if (req.file) {
      await processImage(req.file.path);
      photo_path = `uploads/${req.file.filename}`;
    }

    db.prepare(`
      INSERT INTO meals (id, name, photo_path, calories, protein, carbs, fat, rating, notes, servings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, photo_path,
      calories ? parseInt(calories) : null,
      protein ? parseFloat(protein) : null,
      carbs ? parseFloat(carbs) : null,
      fat ? parseFloat(fat) : null,
      rating ? parseInt(rating) : null,
      notes || null,
      servings ? parseInt(servings) : 1,
      now, now
    );

    const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(id);
    res.status(201).json(meal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/meals/:id — update (snapshots current to history first)
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const current = db.prepare('SELECT * FROM meals WHERE id = ?').get(req.params.id);
    if (!current) return res.status(404).json({ error: 'Not found' });

    const now = new Date().toISOString();
    const { name, calories, protein, carbs, fat, rating, notes, servings, change_note } = req.body;

    // Snapshot current to history
    db.prepare(`
      INSERT INTO meal_history (id, meal_id, name, photo_path, calories, protein, carbs, fat, rating, notes, servings, changed_at, change_note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(), current.id, current.name, current.photo_path,
      current.calories, current.protein, current.carbs, current.fat,
      current.rating, current.notes, current.servings, now,
      change_note || null
    );

    let photo_path = current.photo_path;
    if (req.file) {
      await processImage(req.file.path);
      photo_path = `uploads/${req.file.filename}`;
    }

    db.prepare(`
      UPDATE meals SET name=?, photo_path=?, calories=?, protein=?, carbs=?, fat=?, rating=?, notes=?, servings=?, updated_at=?
      WHERE id=?
    `).run(
      name || current.name,
      photo_path,
      calories !== undefined ? (calories ? parseInt(calories) : null) : current.calories,
      protein !== undefined ? (protein ? parseFloat(protein) : null) : current.protein,
      carbs !== undefined ? (carbs ? parseFloat(carbs) : null) : current.carbs,
      fat !== undefined ? (fat ? parseFloat(fat) : null) : current.fat,
      rating !== undefined ? (rating ? parseInt(rating) : null) : current.rating,
      notes !== undefined ? (notes || null) : current.notes,
      servings !== undefined ? parseInt(servings) : current.servings,
      now,
      req.params.id
    );

    const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(req.params.id);
    res.json(meal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/meals/:id/consume — decrement servings
router.patch('/:id/consume', (req, res) => {
  const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(req.params.id);
  if (!meal) return res.status(404).json({ error: 'Not found' });

  const amount = parseInt(req.body.servings) || 1;
  const newServings = Math.max(0, meal.servings - amount);
  const now = new Date().toISOString();

  db.prepare('UPDATE meals SET servings=?, updated_at=? WHERE id=?').run(newServings, now, meal.id);
  db.prepare(`
    INSERT INTO consumption_log (id, meal_id, meal_name, servings, consumed_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(uuidv4(), meal.id, meal.name, amount, now);

  const updated = db.prepare('SELECT * FROM meals WHERE id = ?').get(meal.id);
  res.json(updated);
});

// DELETE /api/meals/:id
router.delete('/:id', (req, res) => {
  const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(req.params.id);
  if (!meal) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM meals WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
