import React, { useState, useEffect } from 'react';
import { Form, Select, message, Row, Col } from 'antd';
import { fetchProvinces, fetchDistricts, fetchWards } from '../../services/LocationService';

const { Option } = Select;

const ProvincesPage = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

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
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    setWards([]);
    if (value) {
      loadWards(value);
    }
  };

  const handleWardChange = (value) => {
    setSelectedWard(value);
  };

  return (
    <div>
      <h1>Provinces Page</h1>
      <Form>
        <Form.Item label="Province">
          <Row gutter={16}>
            <Col span={8}>
              <Select
                placeholder="Select Province"
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
                placeholder="Select District"
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
                placeholder="Select Ward"
                onChange={handleWardChange}
                value={selectedWard}
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
      </Form>
      <div>
        <p>Province Code: {selectedProvince}</p>
        <p>District Code: {selectedDistrict}</p>
        <p>Ward Code: {selectedWard}</p>
      </div>
    </div>
  );
};

export default ProvincesPage;