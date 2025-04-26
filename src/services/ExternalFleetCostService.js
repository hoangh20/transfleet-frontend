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
    const { data, total, page, limit } = response.data; 
    return { data, total, page, limit }; 
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

export const getPartnerTransportCostsByTransportTrip = async (transportTripId) => {
  try {
    const response = await axios.get(`${API_URL}/external-fleet-cost/partner-transport-costs/${transportTripId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching partner transport costs by transport trip:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const createCustomerTripFare = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/external-fleet-cost/create-customer-trip-fare`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating customer trip fare:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const updateCustomerTripFare = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/external-fleet-cost/update-customer-trip-fare/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating customer trip fare:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const deleteCustomerTripFare = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/external-fleet-cost/delete-customer-trip-fare/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting customer trip fare:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getCustomerTripFaresByExternalFleetCostId = async (externalFleetCostId) => {
  try {
    const response = await axios.get(`${API_URL}/external-fleet-cost/list/${externalFleetCostId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer trip fares by external fleet cost ID:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};


export const createEmptyDistance = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/external-fleet-cost/empty-distance/create`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating empty distance:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getEmptyDistance = async (query = {}) => {
  try {
    const response = await axios.get(`${API_URL}/external-fleet-cost/empty-distance`, { params: query });
    return response.data;
  } catch (error) {
    console.error('Error fetching empty distance:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getAllEmptyDistances = async () => {
  try {
    const response = await axios.get(`${API_URL}/external-fleet-cost/empty-distances/get-all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all empty distances:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};