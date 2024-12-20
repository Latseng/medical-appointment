import axios from "axios";

const baseURL = "https://registration-system-2gho.onrender.com/api";

axios.defaults.headers.common["x-api-key"] = import.meta.env.VITE_API_KEY;
axios.defaults.withCredentials = true;

export const getAppointments = async () => {
  try {
    const res = await axios.get(`${baseURL}/appointments`);
    console.log(res);
  } catch (error) {
    console.error("[Get Appointments failed]: ", error);
    return error.response;
  }
};

export const getAppointmentsBypatient = async (payload) => {
  const {
    idNumber,
    birthDate,
    recaptchaResponse,
    CSRF_token,
    isAuthenticated,
  } = payload;
  //使用者已登入
  if (isAuthenticated) {
    try {
      const res = await axios.post(
        `${baseURL}/appointments/by-patient`,
        {
          recaptchaResponse,
        },
        { headers: { "X-CSRF-Token": CSRF_token } }
      );
      return res.data;
    } catch (error) {
      console.error("[Get Appointments failed]: ", error);
      return error.response;
    }
  }

  try {
    const res = await axios.post(`${baseURL}/appointments/by-patient`, {
      idNumber,
      birthDate,
      recaptchaResponse,
    });
    return res.data;
  } catch (error) {
    console.error("[Get Appointments failed]: ", error);
    return error.response;
  }
};

export const createAppointment = async (payload) => {
  const { recaptchaResponse, doctorScheduleId,idNumber, birthDate, CSRF_token,
    isAuthenticated, } = payload
  // 如果使用者已登入
  if (isAuthenticated) {
    try {
      const res = await axios.post(
        `${baseURL}/appointments`,
        {
          recaptchaResponse,
          doctorScheduleId,
        },
        {
          headers: { "X-CSRF-Token": CSRF_token },
        }
      );
      return res.data;
    } catch (error) {
      console.error("[Create Appointment failed]: ", error);
      return error.response.data.message;
    }
  }
  try {
    const res = await axios.post(`${baseURL}/appointments`, {
      idNumber,
      birthDate,
      recaptchaResponse,
      doctorScheduleId,
    });
    return res.data;
  } catch (error) {
    console.error("[Create Appointment failed]: ", error);
    return error.response.data.message;
  }
};

export const createFirstAppointment = async (payload) => {
  const {
    idNumber,
    birthDate,
    recaptchaResponse,
    doctorScheduleId,
    name,
    contactInfo,
  } = payload;
  try {
    const res = await axios.post(`${baseURL}/appointments/first-visit`, {
      idNumber,
      birthDate,
      recaptchaResponse,
      doctorScheduleId,
      name,
      contactInfo,
    });
    console.log(res.data);

    return res.data;
  } catch (error) {
    console.error("[Create Appointment failed]: ", error);
  }
};

export const cancelAppointment = async (
  id,
  CSRF_token
) => {
  try {
    const res = await axios.patch(
      `${baseURL}/appointments/${id}`,
      {
        status: "CANCELED",
      },
      {
        headers: { "X-CSRF-Token": CSRF_token },
      }
    );
    return res;
  } catch (error) {
    console.error("[Cancel Appointment failed]: ", error);
  }
};

// 取消掛號：管理者權限
export const modifyAppointment = async (id, CSRF_token) => {
  try {
    const res = await axios.put(
      `${baseURL}/appointments/${id}`,
      {
        status: "CANCELED",
      },
      {
        headers: { "X-CSRF-Token": CSRF_token },
      }
    );
    return res;
  } catch (error) {
    console.error("[Cancel Appointment failed]: ", error);
  }
};

// 重新掛號：管理者權限
export const reCreateAppointment = async (id, CSRF_token) => {
  try {
    const res = await axios.put(
      `${baseURL}/appointments/${id}`,
      {
        status: "CONFIRMED",
      },
      {
        headers: { "X-CSRF-Token": CSRF_token },
      }
    );
    return res;
  } catch (error) {
    console.error("[Cancel Appointment failed]: ", error);
  }
};

export const deleteAppointment = async (id, CSRF_token) => {
  try {
    const res = await axios.delete(`${baseURL}/appointments/${id}`, {
      headers: { "X-CSRF-Token": CSRF_token },
    });
    return res;
  } catch (error) {
    console.error("[Delete Appointment failed]:", error);
  }
};
