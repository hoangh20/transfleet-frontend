import React, { useEffect, useState } from 'react';
import { Spin, Row, Col, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import DriverList from '../../components/list/driverList';
import { getAllDrivers } from '../../services/DriverService';
import CreateDriverModal from '../../components/popup/CreateDriverModal';
const { Search } = Input;

const DriverListPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSuccess = () => {
    setIsModalVisible(false);
    fetchDrivers(); // Gọi lại API để cập nhật danh sách
  };
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const data = await getAllDrivers();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleAddNew = () => {
    showModal();
  };

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}
      >
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div style={{ padding: '30px' }}>
      <div
        style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
        }}
      >
        <Search
          placeholder='Tìm kiếm theo tên'
          allowClear
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            width: '600px',
          }}
        />
        <Button type='primary' icon={<PlusOutlined />} onClick={handleAddNew}>
          Thêm mới
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {filteredDrivers.map((driver) => (
          <Col key={driver._id} xs={24} sm={12} md={8} lg={6}>
            <DriverList driver={driver} />
          </Col>
        ))}
      </Row>
      <CreateDriverModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default DriverListPage;
