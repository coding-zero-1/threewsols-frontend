import axios from "axios";

// Use your environment variable
const BASE_URL = `${import.meta.env.VITE_backendUrl}/api/v1/user`;

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
  name: string;
  email: string;
  password: string;
}) {
  const res = await api.post("/signup", data);
  return res.data; // expected { message, user?, token? }
}

/**
 * Sign in an existing user
 * POST /api/v1/user/signin
 * Store JWT in localStorage
 */
export async function signIn(credentials: {
  email: string;
  password: string;
}) {
  const res = await api.post("/signin", credentials);
  const token = res.data.token;
  if (token) {
    localStorage.setItem("token", token);
  }
  return res.data; // expected { token, user }
}

/**
 * Fetch the authenticated user's data
 * GET /api/v1/user/me
 */
export async function getMyProfile() {
  const res = await api.get("/me");
  return res.data.user ?? res.data;
}

/*
 * Update current user's profile (for name, bio, avatar, etc.)
 * PUT /api/v1/user/me
*/
export async function updateMyProfile(formData: FormData) {
  const res = await api.put("/me", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.user ?? res.data;
}

/**
 * Log out user — just clear localStorage token
 */
export function logout() {
  localStorage.removeItem("token");
}

export default api;