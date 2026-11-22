import { apiUrl } from '../api/config.js';

// All admin calls. The login cookie is httpOnly, so the browser sends it automatically.
async function request(path, { method = 'GET', body, form } = {}) {
  const opts = { method, credentials: 'include', headers: {} };
  if (form) opts.body = form;
  else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(apiUrl(`/api/admin${path}`), opts);
  } catch {
    throw new Error('Cannot reach the server. Check your connection.');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    if (res.status === 401 && path !== '/login') window.dispatchEvent(new Event('rf-admin-401'));
    const err = new Error(data?.message || `Request failed (${res.status}).`);
    err.status = res.status;
    err.fieldErrors = data?.errors || {};
    throw err;
  }
  return data;
}

export const api = {
  me: () => request('/me'),
  login: (email, password) => request('/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/logout', { method: 'POST' }),
  changePassword: (current, next) => request('/password', { method: 'POST', body: { current, next } }),
  stats: () => request('/stats'),
  upload: (file) => {
    const form = new FormData();
    form.append('image', file);
    return request('/upload', { method: 'POST', form });
  },
  list: (res, query = '') => request(`/${res}${query}`),
  get: (res, id) => request(`/${res}/${id}`),
  create: (res, body) => request(`/${res}`, { method: 'POST', body }),
  update: (res, id, body) => request(`/${res}/${id}`, { method: 'PUT', body }),
  patch: (res, id, body) => request(`/${res}/${id}`, { method: 'PATCH', body }),
  remove: (res, id) => request(`/${res}/${id}`, { method: 'DELETE' }),
  reorder: (res, ids) => request(`/${res}/reorder`, { method: 'POST', body: { ids } }),
  getFaq: () => request('/faq'),
  saveFaq: (items) => request('/faq', { method: 'PUT', body: { items } }),
  getBrand: () => request('/brand'),
  saveBrand: (brand) => request('/brand', { method: 'PUT', body: brand }),
  saveWorkCategories: (items) => request('/work/categories', { method: 'PUT', body: { items } }),
  getPages: () => request('/pages'),
  savePages: (values) => request('/pages', { method: 'PUT', body: { values } }),
  getSeo: () => request('/seo'),
  saveSeo: (value) => request('/seo', { method: 'PUT', body: value }),
  getContent: (section) => request(`/content/${section}`),
  saveContent: (section, value) => request(`/content/${section}`, { method: 'PUT', body: { value } }),
};
