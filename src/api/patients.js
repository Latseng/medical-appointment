import axios from "axios";

const baseURL = "https://registration-system-2gho.onrender.com/api";

axios.defaults.headers.common["x-api-key"] = import.meta.env.VITE_API_KEY;
axios.defaults.withCredentials = true;

export const getPatients = async (CSRF_token) => {
  try {
    const res = await axios.get(`${baseURL}/patients`, {
      headers: { "x-csrf-Token": CSRF_token },
    });
    return res.data;
  } catch (error) {
    console.error("[Get doctors failed]: ", error);
  }
};