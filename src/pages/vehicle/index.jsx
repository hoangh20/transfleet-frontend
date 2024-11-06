import React, { useEffect, useState } from 'react';
import ListVehicle from '../../components/list/vehicleList'; 
import { getAllVehicles } from '../../services/VehicleService'; 
import { Row, Col, Typography, Spin, Alert, Input, Select } from 'antd';

const { Option } = Select;

const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [type, setVehicleType] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllVehicles();
        setVehicles(response.data); 
      } catch (error) {
        setError('Failed to load vehicles');
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => {
    return (
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (type ? vehicle.type === Number(type) : true) &&
      (status ? vehicle.status === Number(status) : true)
    );
  });

  return (
    <div style={{ padding: '20px' }}>
      <Typography.Title level={2}>Danh sách xe</Typography.Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={16}>
        <Typography.Text>Tìm kiếm</Typography.Text>
          <Input
            placeholder="Tìm kiếm biển số xe"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }} 
          />
        </Col>
        
        <Col xs={24} sm={6} md={4}>
          <Typography.Text>Loại xe</Typography.Text>
          <Select
            placeholder="Chọn loại xe"
            value={type}
            onChange={value => setVehicleType(value)}
            style={{ width: '100%' }}
          >
            <Option value="">Tất cả</Option>
            <Option value="0">Xe đầu kéo</Option>
            <Option value="1">Rơ moóc</Option>
          </Select>
        </Col>

        <Col xs={24} sm={6} md={4}>
          <Typography.Text>Trạng thái</Typography.Text>
          <Select
            placeholder="Chọn trạng thái"
            value={status}
            onChange={value => setStatus(value)}
            style={{ width: '100%' }}
          >
            <Option value="">Tất cả</Option>
            <Option value="0">Hoạt động</Option>
            <Option value="1">Đang thực hiện chuyển</Option>
            <Option value="2">Đang bảo dưỡng</Option>
            <Option value="3">Ngừng hoạt động</Option>
          </Select>
        </Col>
      </Row>

      {loading ? (
          <Spin tip="Loading vehicles..." />
        ) : error ? (
          <Alert message="Error" description={error} type="error" showIcon />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredVehicles.map((vehicle) => (
              <Col key={vehicle._id} span={12}> {/* Adjusted to display 2 vehicles per row */}
                <ListVehicle vehicle={vehicle} />
              </Col>
            ))}
          </Row>
        )}
    </div>
  );
};

export default VehicleListPage;
