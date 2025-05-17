import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL + '/summary';

class SummaryService {
  static async getDailyTripsSummary(date) {
    try {
      const response = await axios.get(`${API_URL}/daily-trips-summary`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  static async getWeeklyTripsSummary(startDate) {
    try {
      const response = await axios.get(`${API_URL}/weekly-summary`, {
        params: { startDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  static async getMonthlyTripsSummary(startDate) {
    try {
      const response = await axios.get(`${API_URL}/monthly-summary`, {
        params: { startDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
  static async getIncidentalCostsByDay(date) {
  try {
    const response = await axios.get(`${API_URL}/incidental-costs/day`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

static async getIncidentalCostsByWeek(startDate) {
  try {
    const response = await axios.get(`${API_URL}/incidental-costs/week`, {
      params: { startDate }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

static async getIncidentalCostsByMonth(startDate) {
  try {
    const response = await axios.get(`${API_URL}/incidental-costs/month`, {
      params: { startDate }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}
}



export default SummaryService;
