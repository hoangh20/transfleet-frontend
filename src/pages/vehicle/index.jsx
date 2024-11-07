import React, { useEffect, useState } from 'react';
import ListVehicle from '../../components/list/vehicleList'; 
import { getAllVehicles } from '../../services/VehicleService'; 
import { Row, Col, Typography, Alert, Input, Select, Pagination } from 'antd';
import LoadingPage from '../../components/loading/LoadingPage'; 

const { Option } = Select;

const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState([]);  
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [type, setVehicleType] = useState('');  
  const [status, setStatus] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1);  
  const [pageSize] = useState(8); 
  const [total, setTotal] = useState(0);  

  
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllVehicles(currentPage, pageSize);
        setVehicles(response.data); 
        setTotal(response.total);  
      } catch (error) {
        setError('Failed to load vehicles');
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchVehicles();
  }, [currentPage, pageSize]); 
  
  const filteredVehicles = vehicles.filter(vehicle => {
    return (
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (type ? vehicle.type === Number(type) : true) &&
      (status ? vehicle.status === Number(status) : true)
    );
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);  
  };

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
        <LoadingPage />
      ) : error ? (
        <Alert message="Error" description={error} type="error" showIcon />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {filteredVehicles.map((vehicle) => (
              <Col key={vehicle._id} span={12}> 
                <ListVehicle vehicle={vehicle} />
              </Col>
            ))}
          </Row>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange} 
            style={{ marginTop: '20px', textAlign: 'center' }}
          />
        </>
      )}
    </div>
  );
};

export default VehicleListPage;
