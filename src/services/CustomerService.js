import axios from 'axios';

export const createCustomer = async (data) => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/customers/create`,
    data,
  );
  return response.data;
};

export const getAllCustomers = async (page = 1, limit = 10, search = '') => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/customers/get-all`,
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
export const getAllCustomersWithoutPagination = async () => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/customers/get-all`,
  );
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await axios.delete(
    `${process.env.REACT_APP_API_URL}/customers/delete/${id}`,
  );
  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/customers/${id}`,
  );
  return response.data;
};

export const updateCustomer = async (id, data) => {
  const response = await axios.put(
    `${process.env.REACT_APP_API_URL}/customers/update/${id}`,
    data,
  );
  return response.data;
};
