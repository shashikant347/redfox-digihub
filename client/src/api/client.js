// All calls to the Node backend live here.
async function request(path, options) {
  let res;
  try {
    res = await fetch(path, options);
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status}).`);
    err.fieldErrors = data?.errors || {};
    throw err;
  }
  return data;
}

export const getContent = () => request('/api/content');

export const submitQuote = (payload) =>
  request('/api/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
