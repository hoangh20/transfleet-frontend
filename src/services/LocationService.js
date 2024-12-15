// src/services/LocationService.js
export const fetchProvinces = async () => {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Lỗi khi lấy danh sách tỉnh');
    }
  };
  
  export const fetchDistricts = async (provinceCode) => {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await response.json();
      return data.districts;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách huyện của tỉnh ${provinceCode}`);
    }
  };
  
  export const fetchWards = async (districtCode) => {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await response.json();
      return data.wards;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách xã của huyện ${districtCode}`);
    }
  };