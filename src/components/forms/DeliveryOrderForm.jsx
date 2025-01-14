import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  message,
  Row,
  Col,
  Card,
  Select,
} from 'antd';
import { createDeliveryOrder } from '../../services/OrderService';
import { getAllCustomersWithoutPagination } from '../../services/CustomerService';
import LocationSelector from '../location/LocationSelector';

const { Option } = Select;

const DeliveryOrderForm = () => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await getAllCustomersWithoutPagination();
        setCustomers(
          Array.isArray(response.customers) ? response.customers : [],
        );
      } catch (error) {
        message.error('Lỗi khi tải danh sách khách hàng');
      }
    };

    fetchCustomers();
  }, []);

  const handleSubmit = async (values) => {
    try {
      await createDeliveryOrder(values);
      form.resetFields();
      message.success('Tạo đơn giao hàng thành công');
    } catch (error) {
      message.error('Lỗi khi tạo đơn giao hàng');
    }
  };

  const handleLocationChange = (field, location) => {
    form.setFieldsValue({
      location: {
        ...form.getFieldValue('location'),
        [field]: location,
      },
    });
  };

  return (
    <>
      <Card title='Thông Tin Đơn Giao Hàng Nhập' bordered={false} style={{ marginBottom: 16 }}>
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label='Ngày Giao Hàng'
                name='deliveryDate'
                rules={[{ required: true, message: 'Vui lòng chọn ngày giao hàng' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label='Khách Hàng'
                name='customer'
                rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
              >
                <Select
                  showSearch
                  placeholder='Chọn khách hàng'
                  optionFilterProp='children'
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {customers.map((customer) => (
                    <Option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.shortName})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label='Số Container'
                name='containerNumber'
                rules={[{ required: true, message: 'Vui lòng nhập số container' }]}
              >
                <Input placeholder='Nhập số container' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label='Chủ Vỏ'
                name='owner'
                rules={[{ required: true, message: 'Vui lòng nhập tên chủ sở hữu' }]}
              >
                <Input placeholder='Nhập tên chủ sở hữu' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label='Loại Mooc'
                name='moocType'
                rules={[{ required: true, message: 'Vui lòng chọn loại mooc' }]}
              >
                <Select placeholder='Chọn loại mooc'>
                  <Option value={0}>20''</Option>
                  <Option value={1}>40''</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label='Ghi Chú' name='note'>
                <Input placeholder='Nhập ghi chú' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
             <Col span={6}>
              <Form.Item
                label="Thời Gian Giao Hàng Dự Kiến"
                name="estimatedTime"
                rules={[{ required: false, message: 'Vui lòng nhập thời gian dự kiến' }]}
              >
                <DatePicker showTime placeholder="Chọn thời gian dự kiến" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card title='Thông Tin Địa Điểm' bordered={false}>
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label='Điểm Đi'
                name={['location', 'startPoint']}
                rules={[{ required: true, message: 'Vui lòng chọn điểm bắt đầu' }]}
              >
                <LocationSelector
                  onChange={(location) =>
                    handleLocationChange('startPoint', location)
                  }
                />
              </Form.Item>
              <Form.Item
                label='Địa Chỉ Điểm Đi'
                name={['location', 'startPoint', 'locationText']}
              >
                <Input placeholder='Nhập địa chỉ điểm bắt đầu' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label='Điểm Đến'
                name={['location', 'endPoint']}
                rules={[{ required: true, message: 'Vui lòng chọn điểm kết thúc' }]}
              >
                <LocationSelector
                  onChange={(location) =>
                    handleLocationChange('endPoint', location)
                  }
                />
              </Form.Item>
              <Form.Item
                label='Địa Chỉ Điểm Đến'
                name={['location', 'endPoint', 'locationText']}
              >
                <Input placeholder='Nhập địa chỉ điểm kết thúc' />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Tạo Đơn Giao Hàng Nhập Mới
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default DeliveryOrderForm;