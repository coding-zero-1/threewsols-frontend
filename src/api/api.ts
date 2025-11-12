import axios from "axios";

// Use your environment variable
const BASE_URL = `${import.meta.env.VITE_backendUrl}api/v1/`;

// Create a configured Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.token = `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Sign up a new user
 * POST /api/v1/user/signup
 */
export async function signUp(data: {
  username: string;
  email: string;
  password: string;
}) {
  const res = await api.post("user/signup", data);
  return res.data; // expected { message }
}

/**
 * Sign in an existing user
 * POST /api/v1/user/signin
 * Store JWT in localStorage
 */
export async function signIn(data: {
  email: string;
  password: string;
}) {
  const res = await api.post("user/signin", data);
  const token = res.data.token;
  if (token) {
    localStorage.setItem("token", token);
  }
  return res.data; // expected { token, message  }
}
/*
 * Log out user — just clear localStorage token
 */
export function logout() {
  localStorage.removeItem("token");
}

export default api;