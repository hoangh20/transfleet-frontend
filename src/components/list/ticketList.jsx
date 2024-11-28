import React from 'react';
import { Card, List, Badge, Space, Typography, Tag, Divider } from 'antd';
import { 
  CalendarOutlined,
  UserOutlined,
  NumberOutlined,
  ContainerOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  CarOutlined,
  PhoneOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const getStatusBadge = (status) => {
  const statusMap = {
    0: { text: 'Mới', color: 'blue' },
    1: { text: 'Đã giao', color: 'warning' },
    2: { text: 'Đang xử lý', color: 'processing' },
    3: { text: 'Hoàn thành', color: 'success' },
    4: { text: 'Hủy', color: 'error' }
  };
  return statusMap[status] || { text: 'Unknown', color: 'default' };
};

const TicketList = ({ tickets, onTicketClick, onDelete }) => {
return (
    <List
        grid={{
            gutter: [16, 16],
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 2,
            xxl: 2,
        }}
        dataSource={tickets}
        renderItem={ticket => (
            <List.Item onClick={() => onTicketClick(ticket._id)} style={{ cursor: 'pointer' }}>
                <Card
                    hoverable
                    style={{ 
                        borderRadius: '8px',
                        height: '100%'
                    }}
                    title={
                        <Space size="middle" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Space>
                                <NumberOutlined />
                                <Text strong style={{ fontSize: '14px' }}>Mã vé: {ticket._id}</Text>
                            </Space>
                            <Badge 
                                status={getStatusBadge(ticket.status).color}
                                text={getStatusBadge(ticket.status).text}
                            />
                        </Space>
                    }
                >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {/* Basic Information */}
                        <div>
                            <Title level={5}>Thông tin cơ bản</Title>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Space>
                                    <CalendarOutlined />
                                    <Text strong>Ngày tạo đơn:</Text>
                                    <Text>{new Date(ticket.deliveryDate).toLocaleString()}</Text>
                                </Space>
                                <Space>
                                    <UserOutlined />
                                    <Text strong>Khách hàng:</Text>
                                    <Text>{ticket.customer}</Text>
                                </Space>
                            </Space>
                        </div>

                        <Divider style={{ margin: '0px 0' }} />

                        {/* Container Information */}
                        <div>
                            <Title level={5}>Thông tin container</Title>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Space>
                                    <ContainerOutlined />
                                    <Text strong>Mã cont:</Text>
                                    <Text>{ticket.countCode}</Text>
                                </Space>
                                <Space wrap>
                                    <Text strong>Loại vỏ:</Text>
                                    <Tag color="blue">{ticket.shellType}</Tag>
                                    <Text strong>Loại container:</Text>
                                    <Tag color="green">{ticket.containerType === 0 ? '20ft' : '40ft'}</Tag>
                                    {ticket.containerOwner && (
                                        <>
                                            <Text strong>Chủ container:</Text>
                                            <Tag color="orange">{ticket.containerOwner}</Tag>
                                        </>
                                    )}
                                </Space>
                                <Space>
                                    <ShoppingOutlined />
                                    <Text strong>Tàu:</Text>
                                    <Text>{ticket.ship}</Text>
                                </Space>
                            </Space>
                        </div>

                        <Divider style={{ margin: '0px 0' }} />

                        {/* Delivery Information */}
                        <div>
                            <Title level={5}>Thông tin vận chuyển</Title>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Space>
                                    <Tag color={ticket.type === 0 ? 'blue' : 'green'}>
                                        {ticket.type === 0 ? 'Đóng hàng' : 'Giao hàng nhập'}
                                    </Tag>
                                </Space>
                                <div>
                                    <Space align="start">
                                        <EnvironmentOutlined />
                                        <Text strong>Địa chỉ:</Text>
                                    </Space>
                                    <ul style={{ 
                                        listStyle: 'none', 
                                        paddingLeft: '24px',
                                        marginTop: '6px',
                                        marginBottom: 0 
                                    }}>
                                        {ticket.addresses.map((address, index) => (
                                            <li key={address._id} style={{ marginBottom: '4px' }}>
                                                <Tag color={index === 0 ? 'green' : 'orange'}>
                                                    {index === 0 ? 'Điểm đi' : 'Điểm đến'}
                                                </Tag>
                                                <Text>{address.address}</Text>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Space>
                        </div>

                        {ticket.note && (
                            <>
                                <Divider style={{ margin: '0px 0' }} />
                                <Space>
                                    <InfoCircleOutlined />
                                    <Text strong>Ghi chú:</Text>
                                    <Text>{ticket.note}</Text>
                                </Space>
                            </>
                        )}

                        {ticket.hasVehicle && ticket.vehicles.length > 0 && (
                            <>
                                <Divider style={{ margin: '0px 0' }} />
                                <div>
                                    <Title level={5}>Thông tin xe</Title>
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <Space>
                                            <CarOutlined />
                                            <Text strong>Biển số xe:</Text>
                                            <Text>{ticket.vehicles[0].licensePlate}</Text>
                                        </Space>
                                        <Space>
                                            <Text strong>Đội xe:</Text>
                                            <Text>{ticket.fleet}</Text>
                                        </Space>
                                        <Space>
                                            <UserOutlined />
                                            <Text strong>Tên lái xe:</Text>
                                            <Text>{ticket.vehicles[0].driverName}</Text>
                                        </Space>
                                        <Space>
                                            <PhoneOutlined />
                                            <Text strong>Số điện thoại:</Text>
                                            <Text>{ticket.vehicles[0].driverPhone}</Text>
                                        </Space>
                                    </Space>
                                </div>
                            </>
                        )}
                    </Space>
                </Card>
            </List.Item>
        )}
    />
);
};

export default TicketList;