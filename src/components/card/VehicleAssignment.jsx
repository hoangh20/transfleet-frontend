import React, { useState } from 'react';
import { Card, Typography, Space, Row, Col, List, Button, Popconfirm, Radio, Form, Input } from 'antd';
import { CarOutlined, UserOutlined, PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const VehicleAssignment = ({ ticket, vehicles, handleAddCompanyVehicle, handlePartnerSubmit }) => {
  const [vehicleSource, setVehicleSource] = useState(null); // null, 'company', 'partner'
  const [partnerForm] = Form.useForm();

  const handleVehicleSourceChange = (e) => {
    setVehicleSource(e.target.value);
  };

  const handleBack = () => {
    setVehicleSource(null);
  };

  const renderVehicleSelection = () => {
    if (!vehicleSource) {
      return (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Title level={4}>Chọn nguồn xe</Title>
          <Radio.Group onChange={handleVehicleSourceChange} style={{ marginTop: '16px' }}>
            <Space direction="vertical" size="large">
              <Radio value="company">Xe công ty</Radio>
              <Radio value="partner">Đội xe đối tác</Radio>
            </Space>
          </Radio.Group>
        </div>
      );
    }

    return (
      <>
        <Space style={{ marginBottom: '16px' }}>
          <Button onClick={handleBack} icon={<ArrowLeftOutlined />}>
            Quay lại
          </Button>
        </Space>
        
        {vehicleSource === 'company' ? (
          <List
            dataSource={vehicles}
            renderItem={vehicle => (
              <List.Item
                actions={[
                  <Popconfirm
                    title="Bạn có chắc chắn muốn thêm xe này vào vé?"
                    onConfirm={() => handleAddCompanyVehicle(vehicle._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary">Thêm xe</Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={<CarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                  title={<Text strong>{vehicle.licensePlate}</Text>}
                  description={
                    <Space size="large">
                      <Space>
                        <UserOutlined />
                        <Text>{vehicle.driverName}</Text>
                      </Space>
                      <Space>
                        <PhoneOutlined />
                        <Text>{vehicle.driverPhone}</Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Form
            form={partnerForm}
            layout="vertical"
            onFinish={handlePartnerSubmit}
          >
            <Form.Item
              name="partnerName"
              label="Tên đội xe"
              rules={[{ required: true, message: 'Vui lòng nhập tên đội xe' }]}
            >
              <Input placeholder="Nhập tên đội xe" />
            </Form.Item>
            
            <Form.Item
              name="licensePlate"
              label="Biển số xe"
              rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
            >
              <Input placeholder="Nhập biển số xe" />
            </Form.Item>
            
            <Form.Item
              name="driverName"
              label="Tên lái xe"
              rules={[{ required: true, message: 'Vui lòng nhập tên lái xe' }]}
            >
              <Input placeholder="Nhập tên lái xe" />
            </Form.Item>
            
            <Form.Item
              name="driverPhone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Xác nhận
              </Button>
            </Form.Item>
          </Form>
        )}
      </>
    );
  };

  return (
    <Card style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
      <Title level={4}>
        <Space>
          <CarOutlined />
          {vehicleSource === 'company' ? 'Xe khả dụng' : 
           vehicleSource === 'partner' ? 'Đội xe đối tác' : 
           'Chọn xe'}
        </Space>
      </Title>
      {ticket.hasVehicle ? (
        <div>
          <Title level={4}>Thông tin xe</Title>
          <Row gutter={[16, 16]}>
            <Col span={12}><Text strong>Đội xe:</Text> {ticket.fleet}</Col>
            <Col span={12}><Text strong>Biển số xe:</Text> {ticket.vehicles[0].licensePlate}</Col>
            <Col span={12}><Text strong>Tên lái xe:</Text> {ticket.vehicles[0].driverName}</Col>
            <Col span={12}><Text strong>Số điện thoại:</Text> {ticket.vehicles[0].driverPhone}</Col>
          </Row>
        </div>
      ) : (
        renderVehicleSelection()
      )}
    </Card>
  );
};

export default VehicleAssignment;