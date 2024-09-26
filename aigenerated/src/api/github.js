import axios from 'axios';

const BASE_URL = 'https://api.github.com';

export const getIssues = async (repo) => {
  const response = await axios.get(`${BASE_URL}/repos/${repo}/issues`);
  return response.data;
};