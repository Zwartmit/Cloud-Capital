import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to handle concurrent refresh requests
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is from auth endpoints
    const isLoginRequest = originalRequest?.url?.includes('/auth/login');
    const isRegisterRequest = originalRequest?.url?.includes('/auth/register');
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');

    // Handle 401 (Unauthorized)
    const isAuthError = error.response?.status === 401;
    // Handle 403 (Forbidden) - e.g. Blocked Account
    const isForbidden = error.response?.status === 403;
    // Handle 404 (Not Found) on user endpoints - indicates deleted user
    // Also handle 500 errors if they happen on profile/status endpoints (sometimes backend errors out on missing user)
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // Check if it's a user-specific endpoint
    const isUserEndpoint = url.includes('/user/') || url.includes('/profile') || url.includes('/balance');

    // Critical endpoints that indicate user existence
    const isCriticalUserEndpoint = url.includes('/user/profile') || url.includes('/user/contract-status');

    // If we get 404 on any user endpoint, OR 500 on critical "get user" endpoints
    // It usually means the user record is gone from DB but session is active
    if ((status === 404 && isUserEndpoint) || (status === 500 && isCriticalUserEndpoint)) {
      // Avoid infinite refresh loops if we are already processing a logout
      if (!localStorage.getItem('is_logging_out')) {
        localStorage.setItem('is_logging_out', 'true');

        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Redirect with a message parameter
        window.location.replace('/login?message=account_deleted');

        // Cleanup flag after a moment (though redirect happens fast)
        setTimeout(() => localStorage.removeItem('is_logging_out'), 1000);
      }
      return Promise.reject(error);
    }

    if (isForbidden) {
      // Clear tokens and redirect to login immediately for generic 403s
      // (Assuming 403 always means 'Access Denied' which requires re-login or contact admin)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isAuthError && !isLoginRequest && !isRegisterRequest && !isRefreshRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Use a separate axios instance/call to avoid interceptors loop
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        originalRequest.headers.Authorization = 'Bearer ' + accessToken;

        processQueue(null, accessToken);

        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // Token expired or invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
