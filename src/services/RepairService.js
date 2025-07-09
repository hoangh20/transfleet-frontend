import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const RepairService = {
  async getAllRepairs(params = {}) {
    try {
      const {
        status,
        repairType,
        startDate,
        endDate,
        headPlate,
        page = 1,
        limit = 10
      } = params;

      const queryParams = new URLSearchParams();
      
      if (status && status !== 'all') queryParams.append('status', status);
      if (repairType !== undefined && repairType !== 'all') queryParams.append('repairType', repairType);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (headPlate) queryParams.append('headPlate', headPlate);
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      const response = await axios.get(`${API_URL}/repairs?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching repairs:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  async getRepairById(repairId) {
    try {
      const response = await axios.get(`${API_URL}/repairs/${repairId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching repair by ID:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  async createRepair(repairData) {
    try {
      const response = await axios.post(`${API_URL}/repairs`, repairData);
      return response.data;
    } catch (error) {
      console.error('Error creating repair:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  async deleteRepair(repairId) {
    try {
      const response = await axios.delete(`${API_URL}/repairs/${repairId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting repair:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  async approveRepair(repairId, userConfirmId) {
    try {
      const response = await axios.patch(`${API_URL}/repairs/${repairId}/approve`, {
        userConfirmId
      });
      return response.data;
    } catch (error) {
      console.error('Error approving repair:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  async rejectRepair(repairId, userConfirmId, cancelReason = '') {
    try {
      const data = { userConfirmId };
      if (cancelReason) {
        data.cancelReason = cancelReason;
      }

      const response = await axios.patch(`${API_URL}/repairs/${repairId}/reject`, data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting repair:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  async updateQuotation(repairId, quotationData) {
    try {
      const response = await axios.patch(`${API_URL}/repairs/${repairId}/quotation`, quotationData);
      return response.data;
    } catch (error) {
      console.error('Error updating quotation:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  async addQuotationFile(repairId, fileUrl, userQuote = null) {
    try {
      const data = { fileUrl };
      if (userQuote) data.userQuote = userQuote;

      const response = await axios.patch(`${API_URL}/repairs/${repairId}/quotation/file/add`, data);
      return response.data;
    } catch (error) {
      console.error('Error adding quotation file:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  async removeQuotationFile(repairId, fileUrl) {
    try {
      const response = await axios.patch(`${API_URL}/repairs/${repairId}/quotation/file/remove`, { fileUrl });
      return response.data;
    } catch (error) {
      console.error('Error removing quotation file:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  async updateQuotedCost(repairId, quotedCost, userQuote = null) {
    try {
      const data = { quotedCost };
      if (userQuote) data.userQuote = userQuote;

      const response = await axios.patch(`${API_URL}/repairs/${repairId}/quotation/cost`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating quoted cost:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },
  async completeRepair(repairId, completedBy, actualCost = null) {
    try {
      const data = { completedBy };
      if (actualCost !== null) {
        data.actualCost = actualCost;
      }

      const response = await axios.patch(`${API_URL}/repairs/${repairId}/complete`, data);
      return response.data;
    } catch (error) {
      console.error('Error completing repair:', error);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },
};

export default RepairService;