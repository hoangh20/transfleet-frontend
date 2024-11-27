import React, { useEffect, useState } from 'react';
import { getAllTickets } from '../../services/TicketService';
import { notification, Row, Col, Typography, Form, Input, DatePicker, Select, Button, Card, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import TicketList from '../../components/list/ticketList';
import LoadingPage from '../../components/loading/LoadingPage';
import { useNavigate } from 'react-router-dom';
const { Title } = Typography;
const { Option } = Select;

const TicketListPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const fetchTickets = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await getAllTickets({ page: 1, limit: 10, ...filters });
      setTickets(response.tickets);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to fetch tickets'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onFinish = (values) => {
    const filters = {
      customer: values.customer ? values.customer : undefined,
      deliveryDate: values.deliveryDate ? values.deliveryDate.format('YYYY-MM-DD') : undefined,
      type: values.type,
      status: values.status
    };
    fetchTickets(filters);
  };

  const handleReset = () => {
    form.resetFields();
    fetchTickets();
  };
  const handleTicketClick = (ticketId) => {
    navigate(`/ticket/detail/${ticketId}`);
  };
  const handleDelete = (ticketId) => {
    setTickets(tickets.filter(ticket => ticket._id !== ticketId));
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>Danh sách vận chuyển</Title>
          </Col>
        </Row>

        <Form 
          form={form} 
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="customer" label="Khách hàng">
                <Input 
                  placeholder="Tìm kiếm theo khách hàng" 
                  prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="deliveryDate" label="Ngày vận chuyển">
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="type" label="Loại vận chuyển">
                <Select placeholder="Chọn loại vận chuyển">
                  <Option value={0}>Đóng hàng</Option>
                  <Option value={1}>Giao hàng nhập</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="status" label="Trạng thái">
                <Select placeholder="Chọn trạng thái">
                  <Option value={0}>Mới</Option>
                  <Option value={1}>Đã giao</Option>
                  <Option value={2}>Đang xử lý</Option>
                  <Option value={3}>Hoàn thành</Option>
                  <Option value={4}>Hủy</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleReset}
              >
                Xóa bộ lọc
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SearchOutlined />}
              >
                Tìm kiếm
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>

      <Card bodyStyle={{ padding: loading ? '48px 24px' : '24px' }}>
          {loading ? (
          <LoadingPage />
        ) : (
          <TicketList  tickets={tickets} onTicketClick={handleTicketClick} onDelete={handleDelete}/>
        )}
      </Card>
    
    </div>
  );
};

export default TicketListPage;