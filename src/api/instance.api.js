//instance


import ky from 'ky';

const prefixUrl = process.env.API_BASE_URL;
const TOKEN_KEY = process.env.TOKEN_KEY || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const STORAGE_BASE_PATH = process.env.VITE_SUPABASE_STORAGE_BASE_PATH;

export const kyInstance = ky.extend({
  prefixUrl,
  hooks: {
    beforeRequest: [
      (options) => {
        // Get token from localstorage
        const token = JSON.parse(localStorage.getItem(TOKEN_KEY) || '{}') || {};
        const { access_token: accessToken } = token;
        // If token is present then add authorization to header
        if (accessToken) {
          options.headers.set('Authorization', `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [],
  },
});

export const getQuestionImageUrl = (filePath) => {
  return `${SUPABASE_URL}/${STORAGE_BASE_PATH}/${filePath}?${Date.now()}`;
}
