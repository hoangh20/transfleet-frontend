import axios from 'axios';
export const axiosJWT = axios.create();

export const SignupUser = async (data) => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/sign-up`,
    data,
  );
  return response.data;
};

export const SigninUser = async (data) => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/sign-in`,
    data,
  );
  return response.data;
};

export const getDetailsUser = async (id, access_token) => {
  const response = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/user/get-detail-user/${id}`,
    {
      Headers: {
        token: `Bearer ${access_token}`,
      },
    },
  );
  return response.data;
};

export const refreshToken = async (access_token) => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/refresh-token`,
    {
      withCredentials: true,
      headers: {
        token: `Bearer ${access_token}`,
      },
    },
  );
  return response.data;
};

export const signoutUser = async () => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/sign-out`,
  );
  return response.data;
};

export const listUsers = async () => {
  const response = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/user/list-users`
  );
  return response.data;
};
export const deleteAccount = async (accountId) => {
  const response = await axiosJWT.delete(
    `${process.env.REACT_APP_API_URL}/user/delete-user/${accountId}`
  );
  return response.data;
};
export const updateUserRole = async (userId, role) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/user/update-role/${userId}`,
    { role }
  );
  return res.data;
};

export const connectUserToDriver = async (userId, driverId) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/connect-user-driver`,
    { userId, driverId }
  );
  return res.data;
};

export const unlinkUserFromDriver = async (userId) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/unlink-user-driver`,
    { userId }
  );
  return res.data;
};