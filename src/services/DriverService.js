// services/DriverService.js
import axios from 'axios';


// Tạo tài xế mới
export const createDriver = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/driver/create-drivers`, formData, config);
      return response;
    } catch (error) {
      console.error('Error in createDriver service:', error.response);
      throw error;
    }
  };

// Lấy danh sách tất cả tài xế
export const getAllDrivers = async () => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/driver/get-all-drivers`);
  return response.data;
};

// Lấy thông tin tài xế theo ID
export const getDriverDetails = async (driverId) => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/driver/get-detail-drivers/${driverId}`);
  return response.data;
};

// Cập nhật tài xế theo ID
export const updateDriver = async (driverId, data) => {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }
  const response = await axios.put(`${process.env.REACT_APP_API_URL}/driver/update-drivers/${driverId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Xóa tài xế theo ID
export const deleteDriver = async (driverId) => {
  const response = await axios.delete(`${process.env.REACT_APP_API_URL}/driver/delete-drivers/${driverId}`);
  return response.data;
};

export const getVehicleByDriverId = async (driverId) => {
  try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/driver/${driverId}/vehicle`);
      return response.data;
  } catch (error) {
      if (error.response) {
          return error.response.data;
      } else {
          return { status: 'ERR', message: 'Network error' };
      }
  }
};