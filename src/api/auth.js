import axios from "axios";
import { baseURL } from "./config";

const patientAuthURL = baseURL + "/patients";
const adminAuthURL = baseURL + "/admins";

axios.defaults.headers.common["x-api-key"] = import.meta.env.VITE_API_KEY
axios.defaults.withCredentials = true;

export const register = async (payload) => {
  try {
   const res = await axios.post(`${patientAuthURL}`, {
     idNumber: payload.idNumber,
     birthDate: payload.birthDate,
     name: payload.name,
     email: payload.email || null,
     password: payload.password,
   });
    return res.data
  } catch (error) {
    console.error("[Register Failed]:", error);
    return error.response.data.message;
  }
};

export const login = async ({ idNumber, password }) => {
  try {
    const { data } = await axios.post(
      `${patientAuthURL}/sign-in`,
      {
        idNumber,
        password,
      }
    );
    
    return data;
  } catch (error) {
    console.error("[Login Failed]:", error);
    return error.response.data.message
  }
};

export const thirdPartyLogin = async () => {
  try {
    window.location.href = `${patientAuthURL}/login/google`;
  } catch (error) {
    console.error("[Login Failed]:", error);
  }
};

export const getEmail = async () => {
  try {
    const res = await axios.get(`${patientAuthURL}/pending-email`);
    return res.data
  } catch(error) {
    console.error("[Get Email Failed]:", error);
  }
}

export const adminLogin = async ({ account, password }) => {
  try {
    const { data } = await axios.post(
      `${adminAuthURL}/sign-in`,
      {
        account,
        password,
      },
      {
        withCredentials: true,
      }
    );
    return data;
  } catch (error) {
    console.error("[Login Failed]:", error);
     return error.response.data.message;
  }
};

export const CSRF_request = async () => {
  try {
    const res = await axios.get(`${baseURL}/csrf-token`);
    
    return res.data
    
  } catch (error) {
    console.error("請求失敗", error);
  }
}

export const logoutReqest = async () => {
  try {
    const { data } = await axios.post(`${baseURL}/sign-out`);
    return data;
  } catch (error) {
    console.error("[Logout Failed]:", error);
  }
};