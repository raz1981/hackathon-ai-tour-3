export async function getHealth() {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}
