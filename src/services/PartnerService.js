import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const createPartner = async (partnerData) => {
  try {
    const response = await axios.post(`${API_URL}/partners/create`, partnerData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getAllPartners = async (page = 1, limit = 10, search = '') => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/partners/get-all`,
    {
      params: {
        page,
        limit,
        search,
      },
    },
  );
  return response.data;
};

export const getPartnerById = async (partnerId) => {
  try {
    const response = await axios.get(`${API_URL}/partners/get/${partnerId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const updatePartner = async (partnerId, partnerData) => {
  try {
    const response = await axios.put(`${API_URL}/partners/update/${partnerId}`, partnerData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const deletePartner = async (partnerId) => {
  try {
    const response = await axios.delete(`${API_URL}/partners/delete/${partnerId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};