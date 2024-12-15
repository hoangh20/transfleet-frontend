import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const createExternalFleetCost = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/external-fleet-cost/create`, data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getAllExternalFleetCosts = async (query = {}) => {
  try {
    const response = await axios.get(`${API_URL}/external-fleet-cost/get-all`, { params: query });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getExternalFleetCostById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/external-fleet-cost/get/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const updateExternalFleetCost = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/external-fleet-cost/update/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const deleteExternalFleetCost = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/external-fleet-cost/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};