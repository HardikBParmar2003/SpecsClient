import axios from 'axios';

const api = axios.create({
  baseURL: window.location.protocol === 'file:' ? 'http://localhost:5000/api' : '/api',
});

import { Capacitor } from '@capacitor/core';

// Request interceptor to add JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle hardware lock
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403 && (error.response.data?.error === 'Application is locked. License required.' || error.response.data?.error === 'Invalid license key for this machine.')) {
      if (error.response.data?.hwId) {
        localStorage.setItem('hwId', error.response.data.hwId);
      }
      if (window.location.hash !== '#/activate') {
        window.location.hash = '#/activate';
      }
    }
    return Promise.reject(error);
  }
);

// Network Scanner Function for Mobile Apps
export const discoverServer = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Try mDNS first
    await axios.get('http://specs-shop-server.local:5000/ping', { timeout: 1500 });
    api.defaults.baseURL = 'http://specs-shop-server.local:5000/api';
    return;
  } catch(e) {}

  // Fallback: IP Sweep the local subnet
  const baseIp = '192.168.1'; // Ideally dynamically fetch phone's subnet
  const promises = [];
  for (let i = 1; i < 255; i++) {
    const targetUrl = `http://${baseIp}.${i}:5000`;
    promises.push(
      axios.get(`${targetUrl}/ping`, { timeout: 1500 })
        .then(() => targetUrl)
        .catch(() => null)
    );
  }
  
  const results = await Promise.all(promises);
  const foundUrl = results.find(url => url !== null);
  
  if (foundUrl) {
    api.defaults.baseURL = `${foundUrl}/api`;
  }
};

export default api;
