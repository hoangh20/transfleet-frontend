import React, { useState } from 'react';
import { Row, Col, Button } from 'antd';
import LocationSelector from './LocationSelector';

const LocationFilter = ({ onFilterChange }) => {
  const [startLocation, setStartLocation] = useState({ provinceCode: null, districtCode: null, wardCode: null });
  const [endLocation, setEndLocation] = useState({ provinceCode: null, districtCode: null, wardCode: null });

  const handleStartChange = (value) => {
    const newStartLocation = { provinceCode: value.provinceCode, districtCode: value.districtCode, wardCode: value.wardCode };
    setStartLocation(newStartLocation);
    onFilterChange({
      startProvinceCode: newStartLocation.provinceCode,
      startDistrictCode: newStartLocation.districtCode,
      startWardCode: newStartLocation.wardCode,
    });
  };

  const handleEndChange = (value) => {
    const newEndLocation = { provinceCode: value.provinceCode, districtCode: value.districtCode, wardCode: value.wardCode };
    setEndLocation(newEndLocation);
    onFilterChange({
      endProvinceCode: newEndLocation.provinceCode,
      endDistrictCode: newEndLocation.districtCode,
      endWardCode: newEndLocation.wardCode,
    });
  };

  const handleReset = () => {
    const resetLocation = { provinceCode: null, districtCode: null, wardCode: null };
    setStartLocation(resetLocation);
    setEndLocation(resetLocation);
    onFilterChange({
      startProvinceCode: null,
      startDistrictCode: null,
      startWardCode: null,
      endProvinceCode: null,
      endDistrictCode: null,
      endWardCode: null,
    });
  };

return (
    <Row gutter={[16, 16]} align="middle">
        <Col span={10}>
            <LocationSelector label="Điểm đi" value={startLocation} onChange={handleStartChange} />
        </Col>
        <Col span={10}>
            <LocationSelector label="Điểm đến" value={endLocation} onChange={handleEndChange} />
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
            <Button onClick={handleReset}>Xóa bộ lọc</Button>
        </Col>
    </Row>
);
};

export default LocationFilter;