import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Card, Statistic, Select, Button, Progress, List, Avatar, Table, Tag, Spin, message } from 'antd';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Content } = Layout;
const { Option } = Select;

// Tùy chỉnh icon cho các marker
const vehicleIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png', // URL icon xe
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const HomePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.post('https://dvbk.vn/Home/get_AllTIBase', {
          UserID: 27668
        });
        setVehicles(response.data);
      } catch (error) {
        message.error('Không thể tải dữ liệu xe.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Dữ liệu mẫu
  const stats = [
    { title: 'Tổng doanh thu', value: 58920, prefix: '₫', change: 12.3 },
    { title: 'Tổng chi phí', value: 24350, prefix: '₫', change: -8.2 },
    { title: 'Chuyến giao hoàn thành', value: 185, change: 15.3 }
  ];

  const overviewCards = [
    { title: 'Phương tiện đang hoạt động', value: 42, change: 12 },
    { title: 'Tài xế đang hoạt động', value: 38, change: 5 },
    { title: 'Tuyến đã hoàn thành', value: 128, change: 15 },
    { title: 'Doanh thu hôm nay', prefix: '₫', value: 24500, change: 20 }
  ];

  const tripStats = [
    { label: 'Chuyến hoàn thành', percent: 65 },
    { label: 'Chuyến đang diễn ra', percent: 30 },
    { label: 'Chuyến bị hủy', percent: 5 }
  ];

  const drivers = [
    { name: 'John Smith', role: 'Tuyến: HCM - Vũng Tàu', avatar: null, status: 'Trực tuyến' },
    { name: 'Mike Johnson', role: 'Tuyến: HCM - Đà Lạt', avatar: null, status: 'Đang tải' },
    { name: 'David Brown', role: 'Tuyến: HCM - Cần Thơ', avatar: null, status: 'Nghỉ' }
  ];

  const vehicleStatus = [
    { status: 'Sẵn sàng', count: 80, color: 'green' },
    { status: 'Trên đường', count: 45, color: 'blue' },
    { status: 'Bảo trì', count: 12, color: 'orange' }
  ];

  const revenueByRoute = [
    { key: '1', route: 'HCM - Vũng Tàu', revenue: '₫12,400' },
    { key: '2', route: 'HCM - Đà Lạt', revenue: '₫10,200' },
    { key: '3', route: 'HCM - Cần Thơ', revenue: '₫8,300' }
  ];

  // Dữ liệu mẫu cho biểu đồ
  const financialData = [
    { name: 'Tháng 1', revenue: 4000, expense: 2400 },
    { name: 'Tháng 2', revenue: 3000, expense: 1398 },
    { name: 'Tháng 3', revenue: 2000, expense: 9800 },
    { name: 'Tháng 4', revenue: 2780, expense: 3908 },
    { name: 'Tháng 5', revenue: 1890, expense: 4800 },
    { name: 'Tháng 6', revenue: 2390, expense: 3800 },
    { name: 'Tháng 7', revenue: 3490, expense: 4300 },
  ];

  return (
    <Layout style={{ padding: '24px' }}>
      <Content>
        {/* Theo dõi phương tiện trực tiếp */}
        <Card
          title="Theo dõi phương tiện trực tiếp"
          extra={
            <Row gutter={8}>
              <Col>
                <Select defaultValue="Tất cả phương tiện">
                  <Option>Tất cả phương tiện</Option>
                  <Option>Đang hoạt động</Option>
                  <Option>Tạm dừng</Option>
                </Select>
              </Col>
              <Col>
                <Button type="primary" onClick={() => window.location.reload()}>
                  Làm mới
                </Button>
              </Col>
            </Row>
          }
          style={{ marginBottom: 24 }}
        >
          {loading ? (
            <Spin tip="Đang tải bản đồ..." />
          ) : (
            <MapContainer center={[21.028511, 105.804817]} zoom={10} style={{ height: '500px', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {vehicles.map((vehicle, index) => (
                <Marker
                  key={index}
                  position={[vehicle.Lt, vehicle.Ln]}
                  icon={vehicleIcon}
                >
                  <Popup>
                    <div>
                      <strong>Biển số:</strong> {vehicle.NumberPlate} <br />
                      <strong>Tài xế:</strong> {vehicle.DriverName || 'Không xác định'} <br />
                      <strong>Tốc độ:</strong> {vehicle.Speed} km/h <br />
                      <strong>Địa chỉ:</strong> {vehicle.Address || 'Không xác định'} <br />
                      <img
                        src={vehicle.ImageLink}
                        alt="Hình ảnh xe"
                        style={{ width: '100px', height: 'auto', marginTop: '8px' }}
                      />
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </Card>

        {/* Chỉ số chính */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {stats.map((item, idx) => (
            <Col span={8} key={idx}>
              <Card>
                <Statistic
                  title={item.title}
                  value={item.value}
                  precision={0}
                  prefix={item.prefix || null}
                  valueStyle={{ color: item.change >= 0 ? '#3f8600' : '#cf1322' }}
                  suffix={`${item.change >= 0 ? '+' : ''}${item.change}%`}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Tổng quan nhanh */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {overviewCards.map((card, idx) => (
            <Col span={6} key={idx}>
              <Card>
                <Statistic
                  title={card.title}
                  value={card.value}
                  prefix={card.prefix || null}
                  suffix={card.change ? `${card.change >= 0 ? '+' : ''}${card.change}%` : null}
                  valueStyle={{ color: card.change >= 0 ? '#52c41a' : '#ff4d4f' }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Tổng quan tài chính & Thống kê chuyến đi */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={16}>
            <Card title="Tổng quan tài chính">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
                  <Bar dataKey="expense" fill="#82ca9d" name="Chi phí" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Thống kê chuyến đi">
              {tripStats.map((t, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <span>{t.label}</span>
                  <Progress percent={t.percent} />
                </div>
              ))}
            </Card>
          </Col>
        </Row>

        {/* Danh sách: Tài xế hoạt động & Trạng thái phương tiện */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="Tài xế hoạt động" extra={<Button type="link">Xem tất cả</Button>}>
              <List
                itemLayout="horizontal"
                dataSource={drivers}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar>{item.name.charAt(0)}</Avatar>}
                      title={item.name}
                      description={item.role}
                    />
                    <Tag color={item.status === 'Trực tuyến' ? 'green' : item.status === 'Đang tải' ? 'blue' : 'orange'}>
                      {item.status}
                    </Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Trạng thái phương tiện" extra={<Button type="link">Xem tất cả</Button>}>
              <List
                dataSource={vehicleStatus}
                renderItem={item => (
                  <List.Item>
                    <Tag color={item.color} style={{ width: 100 }}>{item.status}</Tag>
                    <Statistic value={item.count} />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Phân tích lợi nhuận & Doanh thu theo tuyến */}
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Phân tích lợi nhuận">
              <div>Phân tích lợi nhuận nội dung</div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Doanh thu theo tuyến" extra={<Button type="link">Xem tất cả</Button>}>
              <Table
                dataSource={revenueByRoute}
                columns={[
                  { title: 'Tuyến', dataIndex: 'route', key: 'route' },
                  { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue' }
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        {/* Hiệu suất tài xế & Khách hàng hàng đầu */}
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title="Hiệu suất tài xế" extra={<Button type="link">Xem tất cả</Button>}>
              <div>Hiệu suất tài xế nội dung</div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Khách hàng hàng đầu" extra={<Button type="link">Xem tất cả</Button>}>
              <div>Khách hàng hàng đầu nội dung</div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default HomePage;
