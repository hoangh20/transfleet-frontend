import React, { useState, useEffect } from 'react';
import { Form, Select, message, Row, Col } from 'antd';
import { fetchProvinces, fetchDistricts, fetchWards } from '../../services/LocationService';

const { Option } = Select;

const LocationSelector = ({ label, onChange }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      const data = await fetchProvinces();
      setProvinces(data);
    } catch (error) {
      console.error(error.message);
      message.error(error.message);
    }
  };

  const loadDistricts = async (provinceCode) => {
    try {
      const data = await fetchDistricts(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error(error.message);
      message.error(error.message);
    }
  };

  const loadWards = async (districtCode) => {
    try {
      const data = await fetchWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error(error.message);
      message.error(error.message);
    }
  };

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setDistricts([]);
    setWards([]);
    if (value) {
      loadDistricts(value);
    }
    onChange({ provinceCode: value, districtCode: '', wardCode: '' });
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    setWards([]);
    if (value) {
      loadWards(value);
    }
    onChange({ provinceCode: selectedProvince, districtCode: value, wardCode: '' });
  };

  const handleWardChange = (value) => {
    onChange({ provinceCode: selectedProvince, districtCode: selectedDistrict, wardCode: value });
  };

  return (
    <Form.Item label={label}>
      <Row gutter={16}>
        <Col span={8}>
          <Select
            placeholder="Chọn tỉnh/thành phố"
            onChange={handleProvinceChange}
            value={selectedProvince}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {provinces.map((province) => (
              <Option key={province.code} value={province.code}>
                {province.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            placeholder="Chọn quận/huyện"
            onChange={handleDistrictChange}
            value={selectedDistrict}
            disabled={!selectedProvince}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {districts.map((district) => (
              <Option key={district.code} value={district.code}>
                {district.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            placeholder="Chọn phường/xã (không bắt buộc)"
            onChange={handleWardChange}
            disabled={!selectedDistrict}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {wards.map((ward) => (
              <Option key={ward.code} value={ward.code}>
                {ward.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </Form.Item>
  );
};

export default LocationSelector;