export const login = async () => {
  try {
    const response = await fetch('https://next-api-ruby.vercel.app/api/auth');
    console.log('checked');
    const data = await response.json();
    console.log('Data:', data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
