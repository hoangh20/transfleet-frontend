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


export const getPackingOrdersByDate = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${API_URL}/orders/packing-orders`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching packing orders:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getDeliveryOrdersByDate = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${API_URL}/orders/delivery-orders`, {
      params: { startDate, endDate }
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

export const createOrderConnection = async (deliveryOrderId, packingOrderId, type, emptyDistance) => {
  try {
    const response = await axios.post(`${API_URL}/orders/order-connections`, {
      deliveryOrderId,
      packingOrderId,
      type,
      emptyDistance
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
export const deleteDeliveryOrder = async (orderId) => {
  try {
    const response = await axios.delete(`${API_URL}/orders/delivery-orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting delivery order:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const deletePackingOrder = async (orderId) => {
  try {
    const response = await axios.delete(`${API_URL}/orders/packing-orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting packing order:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
export const updateCostByOrderId = async (orderId, costData) => {
  try {
    const response = await axios.put(`${API_URL}/orders/costs/${orderId}`, costData);
    return response.data;
  } catch (error) {
    console.error('Error updating cost by order ID:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
export const getOrderConnectionsByDeliveryDate = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${API_URL}/orders/order-connections-by-delivery-date`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order connections by delivery date:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
export const deleteOrderConnection = async (connectionId) => {
  try {
    const response = await axios.delete(`${API_URL}/orders/order-connections/${connectionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order connection:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const connectVehicleToDeliveryOrder = async (orderId, vehicleId) => {
  try {
    const response = await axios.post(`${API_URL}/orders/connect-vehicle-to-delivery-order`, {
      orderId,
      vehicleId
    });
    return response.data;
  } catch (error) {
    console.error('Error connecting vehicle to delivery order:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const connectVehicleToPackingOrder = async (orderId, vehicleId) => {
  try {
    const response = await axios.post(`${API_URL}/orders/connect-vehicle-to-packing-order`, {
      orderId,
      vehicleId
    });
    return response.data;
  } catch (error) {
    console.error('Error connecting vehicle to packing order:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const updateDeliveryOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(`${API_URL}/orders/update-status-delivery/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error updating delivery order status:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const updatePackingOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(`${API_URL}/orders/update-status-packing/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error updating packing order status:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const updateDeliveryOrder = async (orderId, orderData) => {
  try {
    const response = await axios.put(`${API_URL}/orders/delivery-orders/update/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    console.error('Error updating delivery order:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const updatePackingOrder = async (orderId, orderData) => {
  try {
    const response = await axios.put(`${API_URL}/orders/packing-orders/update/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    console.error('Error updating packing order:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const exportDeliveryOrderToSheet = async (orderId) => {
  try {
    const response = await axios.post(`${API_URL}/orders/delivery-orders/write-to-sheet/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error exporting delivery order to sheet:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
export const exportPackingOrderToSheet = async (orderId) => {
  try {
    const response = await axios.post(`${API_URL}/orders/packing-orders/write-to-sheet/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error exporting packing order to sheet:', error);
    throw error.response ? error.response.data : new Error('Network Error');
  }
}