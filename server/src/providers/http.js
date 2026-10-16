export async function postJson(url, { headers, body, fetchImpl = fetch, timeoutMs = 60000 }) {
  let res;
  try {
    res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    throw new Error(err.name === 'TimeoutError' ? 'Request timed out' : 'Network error');
  }
  if (!res.ok) throw new Error(`Provider returned status ${res.status}`);
  return res.json();
}
