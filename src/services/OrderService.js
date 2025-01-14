import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const createPackingOrder = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/orders/create-packing-order`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating packing order:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const createDeliveryOrder = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/orders/create-delivery-order`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating delivery order:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getPackingOrdersByDate = async (filterDate) => {
  try {
    const response = await axios.get(`${API_URL}/orders/packing-orders`, {
      params: { filterDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching packing orders:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getDeliveryOrdersByDate = async (filterDate) => {
  try {
    const response = await axios.get(`${API_URL}/orders/delivery-orders`, {
      params: { filterDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};