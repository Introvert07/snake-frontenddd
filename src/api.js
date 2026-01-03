import axios from 'axios';

// Your LIVE Render URL
const BASE_URL = 'https://snake-frontend-vhkv.onrender.com/api';

export const getRandomQuestion = async () => {
  const response = await axios.get(`${BASE_URL}/question`);
  return response.data;
};

export const saveUserScore = async (scoreData) => {
  const response = await axios.post(`${BASE_URL}/save-score`, scoreData);
  return response.data;
};