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

export const getPackingOrdersByDate = async (date) => {
  try {
    const response = await axios.get(`${API_URL}/orders/packing-orders`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching packing orders:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getDeliveryOrdersByDate = async (date) => {
  try {
    const response = await axios.get(`${API_URL}/orders/delivery-orders`, {
      params: { date },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
export const getCostByOrderId = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/costs/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cost by order ID:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const createOrderConnection = async (deliveryOrderId, packingOrderId, type) => {
  try {
    const response = await axios.post(`${API_URL}/orders/order-connections`, {
      deliveryOrderId,
      packingOrderId,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Error creating order connection:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getDeliveryOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orders/delivery-orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery order details:', error);
    throw error;
  }
};

export const getPackingOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orders/packing-orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching packing order details:', error);
    throw error;
  }
};