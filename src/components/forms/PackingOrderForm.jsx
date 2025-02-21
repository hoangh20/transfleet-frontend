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
  Table,
} from 'antd';
import moment from 'moment';
import { createPackingOrder } from '../../services/OrderService';
import { getAllCustomersWithoutPagination } from '../../services/CustomerService';
import LocationSelector from '../location/LocationSelector';
import { checkIfRecordExists } from '../../services/ExternalFleetCostService'; // Import the new API function
import {
  fetchProvinceName,
  fetchDistrictName,
  fetchWardName,
} from '../../services/LocationService'; // Import location services
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const { Option } = Select;

const PackingOrderForm = () => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [routes, setRoutes] = useState([]); // State to store transport routes
  const [loading, setLoading] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null); // State to store selected route ID

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
    const orderData = {
      ...values,
      date: values.date ? moment(values.date).format('YYYY-MM-DD') : null,
      externalFleetCostId: selectedRouteId,
    };

    try {
      await createPackingOrder(orderData);
      form.resetFields();
      setSelectedRouteId(null); // Reset selected route ID
      message.success('Tạo đơn đóng hàng thành công');
    } catch (error) {
      message.error('Lỗi khi tạo đơn đóng hàng');
    }
  };

  const handleLocationChange = async (field, location) => {
    form.setFieldsValue({
      location: {
        ...form.getFieldValue('location'),
        [field]: location,
      },
    });

    const { startPoint, endPoint } = form.getFieldValue('location');
    if (startPoint && endPoint) {
      setLoading(true);
      try {
        const response = await checkIfRecordExists(startPoint, endPoint);
        if (response && response.length > 0) {
          const updatedRoutes = await Promise.all(
            response.map(async (route) => {
              const startProvince = await fetchProvinceName(
                route.startPoint.provinceCode,
              );
              const startDistrict = await fetchDistrictName(
                route.startPoint.districtCode,
              );
              const startWard = route.startPoint.wardCode
                ? await fetchWardName(route.startPoint.wardCode)
                : null;

              const endProvince = await fetchProvinceName(
                route.endPoint.provinceCode,
              );
              const endDistrict = await fetchDistrictName(
                route.endPoint.districtCode,
              );
              const endWard = route.endPoint.wardCode
                ? await fetchWardName(route.endPoint.wardCode)
                : null;

              return {
                ...route,
                startPoint: {
                  ...route.startPoint,
                  fullName: `${startWard ? startWard + ', ' : ''}${startDistrict}, ${startProvince}`,
                },
                endPoint: {
                  ...route.endPoint,
                  fullName: `${endWard ? endWard + ', ' : ''}${endDistrict}, ${endProvince}`,
                },
              };
            }),
          );
          console.log('Updated Routes:', updatedRoutes); // Log updated routes
          setRoutes(updatedRoutes);
        } else {
          console.error('Invalid data structure:', response); // Log invalid data structure
          setRoutes([]);
        }
      } catch (error) {
        console.error('Error checking routes:', error); // Log error
        message.error('Lỗi khi kiểm tra tuyến vận tải');
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    {
      title: 'Điểm đi',
      dataIndex: 'startPoint',
      key: 'startPoint',
      render: (startPoint) => startPoint.fullName || 'N/A',
    },
    {
      title: 'Điểm đến',
      dataIndex: 'endPoint',
      key: 'endPoint',
      render: (endPoint) => endPoint.fullName || 'N/A',
    },
    {
      title: 'Loại vận chuyển',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (type === 0 ? 'Đóng hàng' : 'Giao hàng nhập'),
    },
  ];

  const rowSelection = {
    type: 'radio',
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRouteId(selectedRowKeys[0]);
    },
  };

  return (
    <>
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
        </Form>
      </Card>
      {routes.length > 0 ? (
        <Card
          title='Chọn Tuyến Vận Tải Tương Ứng'
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          <Table
            columns={columns}
            dataSource={routes}
            loading={loading}
            rowKey='_id'
            rowSelection={rowSelection}
            pagination={false}
          />
        </Card>
      ) : (
        <Card
          title='Chọn Tuyến Vận Tải Tương Ứng'
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          <p>
            Không tìm được tuyến vận tải nào.{' '}
            <Link to='/transport-route'>
              Bạn có muốn tạo tuyến vận tải mới?
            </Link>
          </p>
        </Card>
      )}
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
                <Select
                  placeholder='Chọn loại mooc'
                  showSearch
                  optionFilterProp='children'
                  filterOption={(input, option) => {
                    const children = option.children;
                    if (typeof children === 'string') {
                      return children
                        .toLowerCase()
                        .includes(input.toLowerCase());
                    }
                    return false;
                  }}
                >
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
                rules={[{ required: true, message: 'Vui lòng nhập loại vỏ' }]}
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
                  filterOption={(input, option) => {
                    const children = option.children;
                    if (Array.isArray(children)) {
                      return children
                        .join('')
                        .toLowerCase()
                        .includes(input.toLowerCase());
                    }
                    if (typeof children === 'string') {
                      return children
                        .toLowerCase()
                        .includes(input.toLowerCase());
                    }
                    return false;
                  }}
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
