const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // auth
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (username, email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) }),
  getMe: () => request('/auth/me'),

  // items
  getItems: () => request('/items'),
  getItem: (id) => request(`/items/${id}`),
  createItem: (data) =>
    request('/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, data) =>
    request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id) =>
    request(`/items/${id}`, { method: 'DELETE' }),

  // images
  getImages: (itemId) => request(`/items/${itemId}/images`),
  uploadImages: (itemId, formData) =>
    fetch(`${BASE}/items/${itemId}/images`, {
      method: 'POST',
      headers: { ...authHeaders() },
      body: formData,
    }).then(r => r.json()),
  setPrimaryImage: (itemId, imageId) =>
    request(`/items/${itemId}/images/${imageId}/primary`, { method: 'PUT' }),
  deleteImage: (itemId, imageId) =>
    request(`/items/${itemId}/images/${imageId}`, { method: 'DELETE' }),

  //identify
  identifyItem: async (itemId, imageUrls) => {
  const result = await request(`/items/${itemId}/identify`, {
    method: 'POST',
    body: JSON.stringify({ imageUrls })
  });
  return result;
},
  
  // listings
  getListingsAll: () => request('/listings'),
  getListings: (itemId) => request(`/items/${itemId}/listings`),
  createListing: (itemId, data) =>
    request(`/items/${itemId}/listings`, { method: 'POST', body: JSON.stringify(data) }),
  updateListingStatus: (itemId, listingId, status) =>
    request(`/items/${itemId}/listings/${listingId}/status`, {
      method: 'PUT', body: JSON.stringify({ status })
    }),
  deleteListing: (itemId, listingId) =>
    request(`/items/${itemId}/listings/${listingId}`, { method: 'DELETE' }),

  // marketplaces
  getMarketplaces: () => request('/marketplaces'),
};
