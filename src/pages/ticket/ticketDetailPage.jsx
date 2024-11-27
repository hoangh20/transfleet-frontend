import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spin, notification, Typography, Space, Tag, Row, Col, Badge, Divider } from 'antd';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import {
  CalendarOutlined,
  UserOutlined,
  ContainerOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { getTicketDetails, getAvailableVehicles, addCompanyVehicleToTicket } from '../../services/TicketService';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import VehicleAssignment from '../../components/card/VehicleAssignment';

const { Title, Text } = Typography;

// Configure Leaflet default icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const getStatusColor = (status) => ({
  0: '#1890ff',
  1: '#faad14',
  2: '#52c41a',
  3: '#ff4d4f'
}[status] || '#d9d9d9');

const getStatusText = (status) => ({
  0: 'Mới',
  1: 'Đang xử lý',
  2: 'Hoàn thành',
  3: 'Hủy'
}[status] || 'Unknown');

const cardStyle = {
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  marginBottom: '24px'
};

const TicketDetailPage = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const data = await getTicketDetails(id);
        setTicket(data);
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error.message || 'Failed to fetch ticket details'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [id]);

  useEffect(() => {
    if (ticket) {
      const fetchRoute = async () => {
        const coordinates = ticket.addresses.map(address => `${address.longitude},${address.latitude}`).join(';');
        const url = `http://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const routeCoordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRoute(routeCoordinates);
          }
        } catch (error) {
          console.error('Failed to fetch route:', error);
        }
      };

      const fetchAvailableVehicles = async () => {
        try {
          const data = await getAvailableVehicles(ticket.containerType);
          setVehicles(data);
        } catch (error) {
          notification.error({
            message: 'Error',
            description: error.message || 'Failed to fetch available vehicles'
          });
        }
      };

      fetchRoute();
      fetchAvailableVehicles();
    }
  }, [ticket]);

  const handleAddCompanyVehicle = async (vehicleId) => {
    try {
      await addCompanyVehicleToTicket(id, vehicleId);
      notification.success({
        message: 'Success',
        description: 'Vehicle added to ticket successfully'
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to add vehicle to ticket'
      });
    }
  };

  const handlePartnerSubmit = (values) => {
    console.log('Partner vehicle info:', values);
    // Handle partner vehicle submission
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const positions = ticket.addresses.map(address => [address.latitude, address.longitude]);
  const bounds = L.latLngBounds(positions);

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card style={cardStyle}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>Chi tiết vận chuyển</Title>
          </Col>
          <Col>
            <Badge 
              color={getStatusColor(ticket.status)}
              text={<Text strong style={{ fontSize: '16px' }}>{getStatusText(ticket.status)}</Text>}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card style={cardStyle}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>
                  <Space>
                    <ContainerOutlined />
                    Thông tin container
                  </Space>
                </Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}><Text strong>Mã cont:</Text> {ticket.countCode}</Col>
                  <Col span={12}><Text strong>Loại vỏ:</Text> {ticket.shellType}</Col>
                  <Col span={12}>
                    <Text strong>Loại container:</Text>{' '}
                    <Tag color={ticket.containerType === 0 ? 'blue' : 'green'}>
                      {ticket.containerType === 0 ? '20ft' : '40ft'}
                    </Tag>
                  </Col>
                  <Col span={12}><Text strong>Chủ container:</Text> {ticket.containerOwner}</Col>
                </Row>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div>
                <Title level={4}>
                  <Space>
                    <InfoCircleOutlined />
                    Thông tin vận chuyển
                  </Space>
                </Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Space direction="vertical" size="small">
                      <Space>
                        <CalendarOutlined />
                        <Text strong>Ngày giao hàng:</Text>
                      </Space>
                      <Text>{new Date(ticket.deliveryDate).toLocaleString()}</Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space direction="vertical" size="small">
                      <Space>
                        <UserOutlined />
                        <Text strong>Khách hàng:</Text>
                      </Space>
                      <Text>{ticket.customer}</Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space direction="vertical" size="small">
                      <Space>
                        <ShoppingOutlined />
                        <Text strong>Tàu:</Text>
                      </Space>
                      <Text>{ticket.ship}</Text>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Space>
                      <Text strong>Loại vận chuyển:</Text>
                      <Tag color={ticket.type === 0 ? 'blue' : 'cyan'}>
                        {ticket.type === 0 ? 'Đóng hàng' : 'Giao hàng nhập'}
                      </Tag>
                    </Space>
                  </Col>
                  {ticket.note && (
                    <Col span={24}>
                      <Space direction="vertical" size="small">
                        <Text strong>Ghi chú:</Text>
                        <Text>{ticket.note}</Text>
                      </Space>
                    </Col>
                  )}
                </Row>
              </div>
            </Space>
          </Card>

          <VehicleAssignment 
            ticket={ticket} 
            vehicles={vehicles} 
            handleAddCompanyVehicle={handleAddCompanyVehicle} 
            handlePartnerSubmit={handlePartnerSubmit} 
          />
        </Col>

        <Col xs={24} lg={12}>
          <Card style={{ ...cardStyle, height: '600px' }}>
            <Title level={4}>
              <Space>
                <EnvironmentOutlined />
                Địa chỉ
              </Space>
            </Title>
            <div style={{ marginBottom: '16px' }}>
              {ticket.addresses.map((address, index) => (
                <div key={address._id} style={{ marginBottom: '8px' }}>
                  <Tag color={index === 0 ? 'green' : 'orange'}>
                    {index === 0 ? 'Điểm đi' : 'Điểm đến'}
                  </Tag>
                  <Text>{address.address}</Text>
                </div>
              ))}
            </div>
            <div style={{ height: 'calc(100% - 120px)', position: 'relative', minHeight: '400px' }}>
              <MapContainer 
                bounds={bounds}
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {ticket.addresses.map((address, index) => (
                  <Marker key={address._id} position={[address.latitude, address.longitude]}>
                    <Popup>
                      <Text>{index === 0 ? 'Điểm đi' : 'Điểm đến'}: {address.address}</Text>
                    </Popup>
                  </Marker>
                ))}
                {route.length > 0 && (
                  <Polyline 
                    positions={route} 
                    color="blue" 
                    weight={3} 
                    opacity={0.7} 
                  />
                )}
              </MapContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TicketDetailPage;