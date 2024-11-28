import axios from 'axios';

export const createTicket = async (ticketData) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/tickets/create`, ticketData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getAllTickets = async ({ page = 1, limit = 10, deliveryDate, type, customer, status }) => {
  try {
    const query = {};

    if (deliveryDate) {
      query.deliveryDate = new Date(deliveryDate);
    }

    if (type !== undefined) {
      query.type = type;
    }

    if (customer) {
      query.customer = { $regex: customer, $options: 'i' };
    }

    if (status !== undefined) {
      query.status = status;
    }

    const response = await axios.get(`${process.env.REACT_APP_API_URL}/tickets/all`, {
      params: {
        page,
        limit,
        query: JSON.stringify(query)
      }
    });

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const getTicketDetails = async (ticketId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
export const deleteTicket = async (ticketId) => {
  try {
    const response = await axios.delete(`${process.env.REACT_APP_API_URL}/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
export const getAvailableVehicles = async (containerType) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/tickets/available-vehicle`, {
      params: { containerType }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
export const addCompanyVehicleToTicket = async (ticketId, vehicleId) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/tickets/add-company-vehicle`, {
      ticketId,
      vehicleId
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const addPartnerVehicleToTicket = async (ticketId, customerId, licensePlate, driverName, driverPhone) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/tickets/add-partner-vehicle`, {
      ticketId,
      customerId,
      licensePlate,
      driverName,
      driverPhone
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};

export const updateTicketStatus = async (ticketId) => {
  try {
    const response = await axios.put(`${process.env.REACT_APP_API_URL}/tickets/update-status/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};