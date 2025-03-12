import axios from 'axios';

export const fetchProvinces = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/provinces-vn/provinces`);
    return response.data;
  };
  
  export const fetchDistricts = async (provinceCode) => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/provinces-vn/${provinceCode}/districts`);
    return response.data;
  };
  
  export const fetchWards = async (districtCode) => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/provinces-vn/${districtCode}/wards`);
    return response.data;
  };
  export const fetchProvinceName = async (provinceCode) => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/provinces-vn/provinces/${provinceCode}`);
    return response.data.name || 'N/A';
  };
  
  export const fetchDistrictName = async (districtCode) => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/provinces-vn/districts/${districtCode}`);
    return response.data.name || 'N/A';
  };
  
  export const fetchWardName = async (wardCode) => {
    const respone = await axios.get(`${process.env.REACT_APP_API_URL}/provinces-vn/wards/${wardCode}`);
    return respone.data.name || 'N/A';
  };