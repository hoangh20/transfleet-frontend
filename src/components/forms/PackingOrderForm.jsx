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
import { createPackingOrder } from '../../services/OrderService';
import { getAllCustomersWithoutPagination } from '../../services/CustomerService';
import LocationSelector from '../location/LocationSelector';

const { Option } = Select;

const PackingOrderForm = () => {
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
      await createPackingOrder(values);
      form.resetFields();
      message.success('Tạo đơn đóng hàng thành công');
    } catch (error) {
      message.error('Lỗi khi tạo đơn đóng hàng');
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
      <Card
        title='Thông Tin Đơn Đóng Hàng'
        bordered={false}
        style={{ marginBottom: 16 }}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label='Ngày'
                name='date'
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label='Mặt Hàng' name='item'>
                <Input placeholder='Nhập mặt hàng' />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label='Số container'
                name='containerNumber'
                rules={[
                  { required: false, message: 'Vui lòng nhập số container' },
                ]}
              >
                <Input placeholder='Nhập số container' />
              </Form.Item>
            </Col>
            <Col span={6}>
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
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label='Loại Vỏ'
                name='containerType'
                rules={[
                  { required: true, message: 'Vui lòng nhập loại vỏ' },
                ]}
              >
                <Input placeholder='Nhập loại container' />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label='Tàu Dự Kiến' name='expectedShip'>
                <Input placeholder='Nhập tàu dự kiến' />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label='Ghi chú' name='note'>
                <Input placeholder='Nhập ghi chú' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label='Khách Hàng'
                name='customer'
                rules={[
                  { required: true, message: 'Vui lòng chọn khách hàng' },
                ]}
              >
                <Select
                  showSearch
                  placeholder='Chọn khách hàng'
                  optionFilterProp='children'
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => form.setFieldsValue({ customer: value })}
                >
                  {customers.map((customer) => (
                    <Option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.shortName})
                    </Option>
                  ))}
                </Select>
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
                rules={[{ required: true, message: 'Vui lòng nhập điểm đi' }]}
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
                <Input placeholder='Nhập địa chỉ điểm đi' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label='Điểm Đến'
                name={['location', 'endPoint']}
                rules={[{ required: true, message: 'Vui lòng nhập điểm đến' }]}
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
                <Input placeholder='Nhập địa chỉ điểm đến' />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Tạo Đơn Đóng Hàng Mới
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default PackingOrderForm;
