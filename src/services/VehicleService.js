import axios from 'axios';

export const createVehicle = async (data) => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/vehicle/create`,
    data,
  );
  return response.data;
};

export const getAllVehicles = async (page = 1, limit = 10) => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/vehicle/get-all-vehicles`,
    {
      params: {
        page,
        limit,
      },
    },
  );
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await axios.delete(
    `${process.env.REACT_APP_API_URL}/vehicle/delete/${id}`,
  );
  return response.data;
};

export const getVehicleById = async (id) => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/vehicle/get-detail/${id}`,
  );
  return response.data;
};

export const updateVehicle = async (id, data) => {
  const response = await axios.put(
    `${process.env.REACT_APP_API_URL}/vehicle/update/${id}`,
    data,
  );
  return response.data;
};

export const getDriverByVehicleId = async (vehicleId) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/vehicle/${vehicleId}/driver`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response
        ? error.response.data.message
        : 'Error fetching driver data',
    );
  }
};
export const linkDriverToVehicle = async (driverId, vehicleId) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/vehicle/link`,
      {
        driverId,
        vehicleId,
      },
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    } else {
      return { status: 'ERR', message: 'Network error' };
    }
  }
};
export const unlinkDriverFromVehicle = async (driverId, vehicleId) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/vehicle/unlink`, { driverId, vehicleId });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
export const getVehicleLocations = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicle/locations`);
    return response;
  } catch (error) {
    throw new Error(
      error.response
        ? error.response.data.message
        : 'Error fetching vehicle locations',
    );
  }
};

export const updateVehicleStatus = async (id, status) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/vehicle/update-status/${id}`,
      { status },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response
        ? error.response.data.message
        : 'Error updating vehicle status',
    );
  }
};