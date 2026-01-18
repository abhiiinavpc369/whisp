async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('whisp_token');

  const res = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  });

  return res.json();
}
