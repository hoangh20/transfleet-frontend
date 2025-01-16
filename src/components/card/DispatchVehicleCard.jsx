import React, { useState, useEffect } from 'react';
import { Card, Radio, Checkbox, Button, message, List, Row, Col } from 'antd';
import { getAllVehicles } from '../../services/VehicleService'; // Assume you have this service

const DispatchVehicleCard = ({ delivery }) => {
  const [vehicleType, setVehicleType] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  const handleVehicleTypeChange = (e) => {
    setVehicleType(e.target.value);
  };

  useEffect(() => {
    if (vehicleType === 'internal') {
      const fetchVehicles = async () => {
        try {
          const response = await getAllVehicles();
          setVehicles(response.data); // Adjust based on your API response structure
        } catch (error) {
          message.error('Lỗi khi tải danh sách xe nội bộ');
        }
      };

      fetchVehicles();
    }
  }, [vehicleType]);

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicles((prevSelected) =>
      prevSelected.includes(vehicleId)
        ? prevSelected.filter((id) => id !== vehicleId)
        : [...prevSelected, vehicleId]
    );
  };

  const handleDispatch = () => {
    // Thêm logic xử lý khi nhấn nút "Giao xe" ở đây
    console.log('Giao xe', vehicleType, selectedVehicles);
  };

  return (
    <Card title="Giao xe" bordered={false}>
      <Radio.Group onChange={handleVehicleTypeChange} value={vehicleType} style={{ marginBottom: '16px' }}>
        <Radio.Button value="internal">Đội xe nội bộ</Radio.Button>
        <Radio.Button value="partner">Đội xe đối tác</Radio.Button>
      </Radio.Group>

      {vehicleType === 'internal' && (
        <>
          <p>Danh sách xe nội bộ có thể chạy chuyến này:</p>
          <List
            bordered
            dataSource={vehicles}
            renderItem={vehicle => (
              <List.Item>
                <Checkbox
                  onChange={() => handleVehicleSelect(vehicle._id)}
                  checked={selectedVehicles.includes(vehicle._id)}
                >
                  {vehicle.headPlate} - {vehicle.moocType === 0 ? "20''" : "40''"}
                </Checkbox>
              </List.Item>
            )}
          />
        </>
      )}

      {vehicleType === 'partner' && (
        <>
          <p>Danh sách đội xe đối tác:</p>
        </>
      )}

      <Row justify="end" style={{ marginTop: '16px' }}>
        <Col>
          <Button type="primary" onClick={handleDispatch}>
            Giao xe
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default DispatchVehicleCard;