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

export const createPartnerTransportCost = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/external-fleet-cost/create-partner-transport-cost`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating partner transport cost:', error);
    throw error;
  }
};

export const updatePartnerTransportCost = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/external-fleet-cost/update-partner-transport-cost/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating partner transport cost:', error);
    throw error;
  }
};

export const deletePartnerTransportCost = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/external-fleet-cost/delete-partner-transport-cost/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting partner transport cost:', error);
    throw error;
  }
};
export const getInternalCostsByExternalFleetCostId = async (externalFleetCostId) => {
  try {
    const response = await axios.get(`${API_URL}/external-fleet-cost/internal-costs/${externalFleetCostId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching internal costs:', error);
    throw error;
  }
};
export const updateInternalCosts = async (id, updates, userId) => {
  try {
    const response = await axios.put(`${API_URL}/external-fleet-cost/internal-costs/${id}`, {
      updates,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error updating internal costs:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
export const getHistoryByTypeAndExternalFleetCostId = async (type, internalCostsId) => {
  try {
    const response = await axios.get(`${API_URL}/external-fleet-cost/internal-costs-history`, {
      params: { type, internalCostsId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching internal costs history:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const checkIfRecordExists = async (startPoint, endPoint) => {
  try {
    const response = await axios.post(`${API_URL}/external-fleet-cost/check`, { startPoint, endPoint });
    return response.data;
  } catch (error) {
    console.error('Error checking if record exists:', error);
    throw error;
  }
};