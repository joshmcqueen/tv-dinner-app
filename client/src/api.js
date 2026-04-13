async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const getMeals = () =>
  fetch('/api/meals').then(handleResponse);

export const getMeal = (id) =>
  fetch(`/api/meals/${id}`).then(handleResponse);

export const getMealHistory = (id) =>
  fetch(`/api/meals/${id}/history`).then(handleResponse);

export const createMeal = (formData) =>
  fetch('/api/meals', { method: 'POST', body: formData }).then(handleResponse);

export const updateMeal = (id, formData) =>
  fetch(`/api/meals/${id}`, { method: 'PUT', body: formData }).then(handleResponse);

export const consumeMeal = (id, servings = 1) =>
  fetch(`/api/meals/${id}/consume`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ servings }),
  }).then(handleResponse);

export const deleteMeal = (id) =>
  fetch(`/api/meals/${id}`, { method: 'DELETE' }).then(handleResponse);
