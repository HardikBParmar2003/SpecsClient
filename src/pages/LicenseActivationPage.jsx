import { useState, useEffect } from 'react';
import axios from 'axios';

const LicenseActivationPage = () => {
  const [licenseKey, setLicenseKey] = useState('');
  const [hwId, setHwId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedHwId = localStorage.getItem('hwId');
    if (storedHwId) {
      setHwId(storedHwId);
    }
  }, []);

  const handleActivate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Use raw axios to bypass the interceptor if baseURL is tricky
      // But we can just use the standard api, but the interceptor might redirect again?
      // No, interceptor only redirects on 403 with specific error.
      const res = await axios.post('/api/activate', { licenseKey });
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to activate license');
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl border border-green-500">
          <h2 className="text-3xl font-bold text-green-400 mb-4">Activation Successful!</h2>
          <p className="text-gray-300">Software unlocked. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            SpecsShop Pro
          </h1>
          <p className="text-gray-400">Software License Activation</p>
        </div>

        <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <p className="text-sm text-gray-400 mb-1">Your Hardware ID:</p>
          <p className="text-lg font-mono text-yellow-400 tracking-wider break-all select-all">
            {hwId || 'Fetching...'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Please provide this ID to your administrator to receive your license key.
          </p>
        </div>

        <form onSubmit={handleActivate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">License Key</label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-mono placeholder-gray-500 transition-all"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105"
          >
            Activate Software
          </button>
        </form>
      </div>
    </div>
  );
};

export default LicenseActivationPage;
