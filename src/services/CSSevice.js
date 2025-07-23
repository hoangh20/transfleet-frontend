import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Tạo container mới
export const createContainer = async (containerData) => {
    try {
        const response = await axios.post(`${API_URL}/cs`, containerData);
        return response.data;
    } catch (error) {
        console.error('Error creating container:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Lấy tất cả containers với phân trang và filter
export const getAllContainers = async (page = 1, limit = 10, filters = {}) => {
    try {
        const params = {
            page,
            limit,
            ...filters
        };
        const response = await axios.get(`${API_URL}/cs`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching containers:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Lấy container theo ID
export const getContainerById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/cs/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching container by ID:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Cập nhật container
export const updateContainer = async (id, updateData) => {
    try {
        const response = await axios.put(`${API_URL}/cs/${id}`, updateData);
        return response.data;
    } catch (error) {
        console.error('Error updating container:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Xóa container
export const deleteContainer = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/cs/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting container:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Cập nhật hàng loạt containers
export const bulkUpdateContainers = async (updates) => {
    try {
        const response = await axios.put(`${API_URL}/cs/bulk-update`, { updates });
        return response.data;
    } catch (error) {
        console.error('Error bulk updating containers:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const createContainersFromPackingOrders = async (startDate = null, endDate = null) => {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        
        const response = await axios.post(`${API_URL}/cs/create-from-packing-orders`, {}, { params });
        return response.data;
    } catch (error) {
        console.error('Error creating containers from packing orders:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Các filter options để sử dụng trong UI
export const containerFilters = {
    contType: [
        { value: 0, label: '20' },
        { value: 1, label: '40' }
    ],
    transportDirection: [
        { value: 0, label: 'HP→HCM' },
        { value: 1, label: 'HCM→HP' }
    ],
    closeCombination: [
        { value: 0, label: 'Gắp vỏ' },
        { value: 1, label: 'Kết hợp' }
    ],
    bill: [
        { value: 0, label: 'BK' },
        { value: 1, label: 'HĐ' }
    ]
};


// Tạo chuyến tàu mới
export const createShipSchedule = async (scheduleData) => {
    try {
        const response = await axios.post(`${API_URL}/cs/ship-schedules`, scheduleData);
        return response.data;
    } catch (error) {
        console.error('Error creating ship schedule:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Lấy tất cả chuyến tàu với phân trang và filter
export const getAllShipSchedules = async (page = 1, limit = 10, filters = {}) => {
    try {
        const params = {
            page,
            limit,
            ...filters
        };
        const response = await axios.get(`${API_URL}/cs/ship-schedules`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching ship schedules:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Lấy tất cả chuyến tàu không phân trang
export const getAllShipSchedulesNoPagination = async (filters = {}) => {
    try {
        const response = await axios.get(`${API_URL}/cs/ship-schedules/all`, { params: filters });
        return response.data;
    } catch (error) {
        console.error('Error fetching all ship schedules:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Lấy chuyến tàu theo ID
export const getShipScheduleById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/cs/ship-schedules/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching ship schedule by ID:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Cập nhật chuyến tàu
export const updateShipSchedule = async (id, updateData) => {
    try {
        const response = await axios.put(`${API_URL}/cs/ship-schedules/${id}`, updateData);
        return response.data;
    } catch (error) {
        console.error('Error updating ship schedule:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Xóa chuyến tàu
export const deleteShipSchedule = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/cs/ship-schedules/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting ship schedule:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Cập nhật hàng loạt chuyến tàu
export const bulkUpdateShipSchedules = async (updates) => {
    try {
        const response = await axios.patch(`${API_URL}/cs/ship-schedules/bulk-update`, { updates });
        return response.data;
    } catch (error) {
        console.error('Error bulk updating ship schedules:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Lấy tất cả containers kèm thông tin chi phí
export const getAllContainersWithCosts = async (page = 1, limit = 10, filters = {}) => {
    try {
        const params = {
            page,
            limit,
            ...filters
        };
        const response = await axios.get(`${API_URL}/cs/containers-with-costs`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching containers with costs:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Cập nhật chi phí container
export const updateContainerCost = async (containerId, costData) => {
    try {
        const response = await axios.put(`${API_URL}/cs/container-costs/${containerId}`, costData);
        return response.data;
    } catch (error) {
        console.error('Error updating container cost:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getContainerFilterOptions = async () => {
    try {
        const response = await axios.get(`${API_URL}/cs/filter-options`);
        return response.data;
    } catch (error) {
        console.error('Error fetching container filter options:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Container Incidental Cost APIs
export const createContainerIncidentalCost = async (incidentalCostData) => {
    try {
        const response = await axios.post(`${API_URL}/cs/incidental-costs`, incidentalCostData);
        return response.data;
    } catch (error) {
        console.error('Error creating container incidental cost:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getAllContainerIncidentalCosts = async (page = 1, limit = 10, filters = {}) => {
    try {
        const params = {
            page,
            limit,
            ...filters
        };
        const response = await axios.get(`${API_URL}/cs/incidental-costs`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching container incidental costs:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getContainerIncidentalCostById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/cs/incidental-costs/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching container incidental cost by ID:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const updateContainerIncidentalCost = async (id, updateData) => {
    try {
        const response = await axios.put(`${API_URL}/cs/incidental-costs/${id}`, updateData);
        return response.data;
    } catch (error) {
        console.error('Error updating container incidental cost:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const deleteContainerIncidentalCost = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/cs/incidental-costs/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting container incidental cost:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getContainersForDropdown = async (search = '') => {
    try {
        const params = {};
        if (search && search.trim() !== '') {
            params.search = search.trim();
        }
        
        const response = await axios.get(`${API_URL}/cs/containers/dropdown`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching containers for dropdown:', error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};


// Bulk cost update validation
export const validateBulkCostUpdate = async (requestData) => {
    try {
        const response = await axios.post(`${API_URL}/cs/validate-bulk-cost-update`, requestData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Execute bulk cost update
export const executeBulkCostUpdate = async (requestData, forceUpdate = false) => {
    try {
        const params = forceUpdate ? { forceUpdate: 'true' } : {};
        const response = await axios.post(`${API_URL}/cs/execute-bulk-cost-update`, requestData, { params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Validate bulk delivery update
export const validateBulkDeliveryUpdate = async (requestData) => {
    try {
        const response = await axios.post(`${API_URL}/cs/validate-bulk-delivery-update`, requestData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// Execute bulk delivery update
export const executeBulkDeliveryUpdate = async (requestData, forceUpdate = false) => {
    try {
        const params = forceUpdate ? { forceUpdate: 'true' } : {};
        const response = await axios.post(`${API_URL}/cs/execute-bulk-delivery-update`, requestData, { params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};