const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || data.message || `HTTP ${res.status}`)
  }
  return data
}

export const api = {
  getMenus: () => request('/api/menus'),
  getOrders: () => request('/api/orders'),
  getOrder: (id) => request(`/api/orders/${id}`),
  createOrder: (body) =>
    request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateOrderStatus: (id, status) =>
    request(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updateMenuStock: (id, delta) =>
    request(`/api/menus/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ delta }),
    }),
}
