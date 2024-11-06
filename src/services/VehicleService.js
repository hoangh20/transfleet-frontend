import axios from 'axios'

export const createVehicle = async (data) => {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/vehicle/create`, data)
    return response.data
}
export const getAllVehicles = async (page = 1, limit = 10) => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicle/get-all-vehicles`,  {
        params: {
          page,
          limit,
        },
      })
    return response.data
}
export const deleteVehicle = async (id) => {
  const response = await axios.delete(`${process.env.REACT_APP_API_URL}/vehicle/delete/${id}`);
  return response.data;
}
export const getVehicleById = async (id) => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicle/get-detail/${id}`);
  return response.data;
};

export const updateVehicle = async (id, data) => {
  const response = await axios.put(`${process.env.REACT_APP_API_URL}/vehicle/update/${id}`, data);
  return response.data;
};