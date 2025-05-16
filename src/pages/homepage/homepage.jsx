import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Card,  Button,  message, Modal } from 'antd';
import 'leaflet/dist/leaflet.css';
import {getVehicleLocations } from '../../services/VehicleService';
import VehicleMap from '../../components/statistics/VehicleMap';
import Statistics from '../../components/statistics/Statistics';
const { Content } = Layout;

const HomePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await getVehicleLocations();
        if (response.data && response.data.status === 'OK' && Array.isArray(response.data.data)) {
          setVehicles(response.data.data);
        } else {
          setVehicles([]);
          message.error('Dữ liệu xe không hợp lệ.');
        }
      } catch (error) {
        message.error('Không thể tải dữ liệu xe.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
    const interval = setInterval(fetchVehicles, 5000);
    return () => clearInterval(interval);
  }, []);
  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };


  return (
    <Layout style={{ padding: '24px' }}>
      <Content>
        {/* Theo dõi phương tiện trực tiếp */}
        <Card
          title="Theo dõi phương tiện trực tiếp"
          extra={
            <Row gutter={8}>
              <Col>
                <Button type="primary" onClick={() => window.location.reload()}>
                  Làm mới
                </Button>
              </Col>
            </Row>
          }
          style={{ marginBottom: 24 }}
        >
          <VehicleMap
            vehicles={vehicles}
            loading={loading}
            onPreview={handlePreview}
          />
        </Card>

        {/* Số liệu thống kê */}
        <Statistics />

         <Modal
          visible={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          <img
            alt="Preview"
            style={{ width: '100%' }}
            src={previewImage}
          />
        </Modal>
      </Content>
    </Layout>
  );
};

export default HomePage;
