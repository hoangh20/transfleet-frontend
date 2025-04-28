import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/system';

const SystemService = {
    async updateFixedCost(id, updates, userId) {
      try {
        const response = await axios.put(`${API_URL}/fixed-cost/${id}`, {
          updates,
          userId
        });
        return response.data;
      } catch (error) {
        console.error('Error updating fixed cost:', error);
        throw error.response ? error.response.data : new Error('Network Error');
      }
    },

  async getFixedCost() {
    try {
      const response = await axios.get(`${API_URL}/fixed-cost`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fixed costs:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },
  async getHistory(type) {
    try {
      const response = await axios.get(`${API_URL}/history`, { params: { type } });
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },
  async getFuelPrice() {
    try {
      const response = await axios.get(`${API_URL}/fuel-price`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fuel price:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },
  async updateFuelRegion1(data) {
    try {
      const response = await axios.put(`${API_URL}/fuel-region1`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating fuel region 1:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },
  async createSalePerson(salePersonName) {
    try {
      const response = await axios.post(`${API_URL}/sale-persons`, salePersonName);
      return response.data;
    } catch (error) {
      console.error('Error creating sale person:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },
  async getSalePersons() {
    try {
      const response = await axios.get(`${API_URL}/sale-persons`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sale persons:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },
  async deleteSalePerson(salePersonName) {
    try {
      const response = await axios.delete(`${API_URL}/sale-persons/${salePersonName}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting sale person:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },
};

export default SystemService;