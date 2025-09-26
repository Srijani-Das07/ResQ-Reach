const BASE_URL = 'http://localhost:3000/api';

export async function fetchLanguages() {
  const res = await fetch(`${BASE_URL}/languages`);
  return res.json();
}

export async function fetchVideos(langCode) {
  const res = await fetch(`${BASE_URL}/languages/${langCode}/videos`);
  return res.json();
}