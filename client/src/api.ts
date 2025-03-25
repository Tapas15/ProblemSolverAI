try {
  const response = await fetch('/api/frameworks');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Error fetching frameworks:', error);
  throw error;
}