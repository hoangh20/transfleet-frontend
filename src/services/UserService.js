import axios from 'axios';
export const axiosJWT = axios.create()


export const SignupUser = async (data) => {
  const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/sign-up`, data);
  return response.data;
}


export const SigninUser = async (data) => {
  const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/sign-in`, data);
  return response.data;
}

export const getDetailsUser = async (id, access_token) => {
  const response = await axiosJWT.get(`${process.env.REACT_APP_API_URL}/user/get-detail-user/${id}`, {
    Headers:{
      token: `Bearer ${access_token}`,
    }

  });
  return response.data;
}

export const refreshToken = async () => {
  const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/refresh-token`, {
    withCredentials: true
  });
  return response.data;
}

export const signoutUser = async () => {
  const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/sign-out`);
  return response.data;
}