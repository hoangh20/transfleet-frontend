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
  Alert,
} from 'antd';
import dayjs from 'dayjs';
import { createDeliveryOrder } from '../../services/OrderService';
import {
  getCustomerTripFaresByExternalFleetCostId,
  createCustomerTripFare,
} from '../../services/ExternalFleetCostService';
import { getAllCustomersWithoutPagination } from '../../services/CustomerService';
import LocationSelector from '../location/LocationSelector';
import { checkIfRecordExists } from '../../services/ExternalFleetCostService';
import {
  fetchProvinceName,
  fetchDistrictName,
  fetchWardName,
} from '../../services/LocationService';
import { Link } from 'react-router-dom';
import CreateExternalFleetCost from '../location/CreateExternalFleetCost';
import AddCustomerTripFareModal from '../popup/AddCustomerTripFareModal';
import AddSalesPersonModal from '../popup/AddSalesPersonModal';
import SystemService from '../../services/SystemService'; // Import APIs
import WarehouseSelector from '../popup/WarehouseSelector'; // Import component map và danh sách kho

const { Option } = Select;

const DeliveryOrderForm = () => {
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddCustomerModalVisible, setIsAddCustomerModalVisible] =
    useState(false);
  const [modalData, setModalData] = useState({});
  const [isAddSalesPersonModalVisible, setIsAddSalesPersonModalVisible] =
    useState(false);
  const [salesPersonList, setSalesPersonList] = useState([]);
  const [isWarehouseModalVisible, setIsWarehouseModalVisible] = useState(false);

  useEffect(() => {
    fetchAllCustomers();
    if (selectedRouteId) {
      fetchCustomersByRoute(selectedRouteId);
    } else {
      setCustomers([]);
    }
  }, [selectedRouteId]);

  const fetchCustomersByRoute = async (routeId) => {
    setLoading(true);
    try {
      const response = await getCustomerTripFaresByExternalFleetCostId(routeId);
      const fares = response.data || [];
      if (fares.length > 0) {
        setCustomers(
          fares.map((fare) => ({
            _id: fare.customer._id,
            name: fare.customer.name,
            shortName: fare.customer.shortName,
          })),
        );
      } else {
        setCustomers([]);
        message.info('Không có khách hàng nào trong tuyến.');
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách khách hàng trong tuyến.');
    } finally {
      setLoading(false);
    }
  };
  const fetchAllCustomers = async () => {
    try {
      const response = await getAllCustomersWithoutPagination();
      setAllCustomers(response.customers || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách khách hàng.');
    }
  };
  const handleAddCustomerSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      await createCustomerTripFare({
        ...values,
        externalFleetCostId: selectedRouteId,
      });
      message.success('Thêm khách hàng mới thành công!');
      setIsAddCustomerModalVisible(false);
      fetchCustomersByRoute(selectedRouteId);
    } catch (error) {
      message.error('Lỗi khi thêm khách hàng mới.');
    }
  };
  const handleAddSalesPerson = async (newSalesPerson) => {
    try {
      await fetchSalesPersons();
      message.success('Thêm nhân viên kinh doanh thành công!');
    } catch (error) {
      message.error('Lỗi khi thêm nhân viên kinh doanh.');
    }
  };

  const handleSubmit = async (values) => {
    if (!selectedRouteId) {
      message.warning(
        'Vui lòng chọn tuyến vận tải trước khi tạo đơn giao hàng.',
      );
      return;
    }

    const deliveryDate = values.deliveryDate
      ? dayjs(values.deliveryDate).format('YYYY-MM-DD')
      : null;
    const orderData = {
      ...values,
      deliveryDate: deliveryDate,
      externalFleetCostId: selectedRouteId,
      customer: values.customer,
      moocType: values.contType,
    };

    try {
      await createDeliveryOrder(orderData);
      form.resetFields();
      setSelectedRouteId(null);
      setSelectedRouteId(null);
      setCustomers([]);
      setRoutes([]);
      setModalData({});
      message.success('Tạo đơn giao hàng thành công');
    } catch (error) {
      message.error('Lỗi khi tạo đơn giao hàng');
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
    if (startPoint || endPoint) {
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
          const filteredRoutes = updatedRoutes.filter(
            (route) => route.type === 0,
          );
          setRoutes(filteredRoutes);
        } else {
          setRoutes([]);
        }
      } catch (error) {
        message.error('Lỗi khi kiểm tra tuyến vận tải');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRouteSelection = (selectedRouteId) => {
    const selectedRoute = routes.find((route) => route._id === selectedRouteId);
    if (selectedRoute) {
      form.setFieldsValue({
        location: {
          startPoint: selectedRoute.startPoint,
          endPoint: selectedRoute.endPoint,
        },
      });
    }
    setSelectedRouteId(selectedRouteId);
  };

  const handleModalSubmit = (data) => {
    message.success('Tuyến vận tải mới đã được tạo.');
    setIsModalVisible(false);
    setModalData(data);
    setRoutes([data]);
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
      render: (type) => (type === 0 ? 'Giao hàng nhập' : 'Đóng hàng'),
    },
  ];

  const rowSelection = {
    type: 'radio',
    onChange: (selectedRowKeys) => {
      handleRouteSelection(selectedRowKeys[0]);
    },
  };

  const fetchSalesPersons = async () => {
    try {
      const response = await SystemService.getSalePersons();
      if (response.status === 'OK' && Array.isArray(response.data)) {
        setSalesPersonList(response.data); // Lưu toàn bộ dữ liệu trả về
      } else {
        setSalesPersonList([]);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách nhân viên kinh doanh.');
      setSalesPersonList([]);
    }
  };

  useEffect(() => {
    fetchSalesPersons();
  }, []);

  const handleWarehouseSelect = (selectedWarehouse) => {
    form.setFieldsValue({
      location: {
        ...form.getFieldValue('location'),
        endPoint: {
          ...form.getFieldValue(['location', 'endPoint']),
          locationText: selectedWarehouse.name,
          lat: selectedWarehouse.lat,
          lng: selectedWarehouse.lng,
        },
      },
    });
    setIsWarehouseModalVisible(false);
  };

  // Khi chọn ngày giao hàng thì tự động set estimatedTime là 12h trưa ngày đó
  const handleDeliveryDateChange = (date) => {
    if (date) {
      const estimated = dayjs(date).hour(12).minute(0).second(0);
      form.setFieldsValue({ estimatedTime: estimated });
    }
  };

  return (
    <>
      <Card
        title='Thông Tin Địa Điểm'
        bordered={false}
        style={{ marginBottom: 16 }}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label='Điểm Đi'
                name={['location', 'startPoint']}
                rules={[
                  { required: true, message: 'Vui lòng chọn điểm bắt đầu' },
                ]}
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
                rules={[
                  { required: true, message: 'Vui lòng chọn điểm kết thúc' },
                ]}
              >
                <LocationSelector
                  onChange={(location) =>
                    handleLocationChange('endPoint', location)
                  }
                />
              </Form.Item>

              <Row gutter={8}>
                {' '}
                {/* Đặt trong 1 hàng */}
                <Col span={18}>
                  <Form.Item
                    label='Địa Chỉ Điểm Đến'
                    name={['location', 'endPoint', 'locationText']}
                    style={{ marginBottom: 0 }} 
                  >
                    <Input placeholder='Nhập địa chỉ điểm kết thúc' />
                  </Form.Item>
                </Col>
                <Col
                  span={6}
                  style={{ display: 'flex', alignItems: 'flex-end' }}
                >
                  <Button
                    type='primary'
                    onClick={() => setIsWarehouseModalVisible(true)}
                    style={{ width: '100%' }}
                  >
                    Chọn Kho
                  </Button>
                </Col>
              </Row>
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
            pagination={{ pageSize: 5 }}
          />
        </Card>
      ) : (
        <Card
          title='Chọn Tuyến Vận Tải Tương Ứng'
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          <p>
            Không tìm được tuyến vận tải nào.
            <Button
              type='link'
              onClick={() => {
                const startPoint = form.getFieldValue([
                  'location',
                  'startPoint',
                ]);
                const endPoint = form.getFieldValue(['location', 'endPoint']);
                setModalData({ startPoint, endPoint, transportType: 0 });
                setIsModalVisible(true);
              }}
            >
              Bạn có muốn tạo tuyến vận tải mới?
            </Button>
          </p>
        </Card>
      )}
      <Card
        title='Thông Tin Đơn Giao Hàng Nhập'
        bordered={false}
        style={{ marginBottom: 16 }}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label='Ngày Giao Hàng'
                name='deliveryDate'
                rules={[
                  { required: false, message: 'Vui lòng chọn ngày giao hàng' },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  onChange={handleDeliveryDateChange}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label='Số Container'
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
                label='Chủ Vỏ'
                name='owner'
                rules={[
                  { required: false, message: 'Vui lòng nhập tên chủ sở hữu' },
                ]}
              >
                <Input placeholder='Nhập tên chủ sở hữu' />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label='Loại Cont'
                name='contType'
                rules={[{ required: true, message: 'Vui lòng chọn loại cont' }]}
              >
                <Select placeholder='Chọn loại cont'>
                  <Option value={0}>20</Option>
                  <Option value={1}>40</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item
                label='Trọng Lượng (Tấn)'
                name='weight'
                rules={[
                  { required: true, message: 'Vui lòng nhập trọng lượng'},
                ]}
                initialValue={28} 
              >
                <Input type='number' placeholder='Nhập trọng lượng (tấn)' />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label='Thời Gian Hoàn Thành Dự Kiến'
                name='estimatedTime'
                rules={[
                  {
                    required: false,
                    message: 'Vui lòng nhập thời gian dự kiến',
                  },
                ]}
              >
                <DatePicker showTime placeholder='Chọn thời gian dự kiến' style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label='Ghi Chú' name='note'>
                <Input placeholder='Nhập ghi chú' />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label='Nhân Viên Kinh Doanh'
                name='salesPerson'
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn nhân viên kinh doanh',
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder='Chọn nhân viên kinh doanh'
                  optionFilterProp='children'
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {salesPersonList.map((person) => (
                    <Option key={person.name} value={person.name}>
                      {person.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={1}>
              <Button
                type='primary'
                onClick={() => setIsAddSalesPersonModalVisible(true)}
                style={{ marginTop: '32px' }}
              >
                Thêm Nhân Viên
              </Button>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              {selectedRouteId ? (
                customers.length > 0 ? (
                  <Row align='middle' gutter={16}>
                    <Col flex='auto'>
                      <Form.Item
                        label='Khách Hàng'
                        name='customer'
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng chọn khách hàng',
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          placeholder='Chọn khách hàng'
                          optionFilterProp='children'
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
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
                    <Col>
                      <Button
                        type='primary'
                        onClick={() => setIsAddCustomerModalVisible(true)}
                      >
                        Thêm mới khách hàng
                      </Button>
                    </Col>
                  </Row>
                ) : (
                  <Alert
                    style={{ marginBottom: 16 }}
                    message='Không có khách hàng nào trong tuyến.'
                    description={
                      <>
                        <Link
                          to={`/transport-route/delivery/${selectedRouteId}`}
                        >
                          Xem chi tiết tuyến vận tải.
                        </Link>
                        <Button
                          type='link'
                          onClick={() => setIsAddCustomerModalVisible(true)}
                          style={{ marginLeft: 8 }}
                        >
                          Thêm khách hàng vào tuyến
                        </Button>
                      </>
                    }
                    type='info'
                    showIcon
                  />
                )
              ) : (
                <Alert
                  style={{ marginBottom: 16 }}
                  message='Vui lòng chọn tuyến vận tải trước.'
                  type='warning'
                  showIcon
                />
              )}
            </Col>
          </Row>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Tạo Đơn Giao Hàng Nhập Mới
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <CreateExternalFleetCost
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleModalSubmit}
        initialData={modalData}
      />
      <AddCustomerTripFareModal
        visible={isAddCustomerModalVisible}
        onCancel={() => setIsAddCustomerModalVisible(false)}
        onSubmit={handleAddCustomerSubmit}
        form={createForm}
        customers={allCustomers}
      />
      <AddSalesPersonModal
        visible={isAddSalesPersonModalVisible}
        onCancel={() => setIsAddSalesPersonModalVisible(false)}
        onSubmit={handleAddSalesPerson}
      />
      <WarehouseSelector
        visible={isWarehouseModalVisible}
        onCancel={() => setIsWarehouseModalVisible(false)}
        onSelect={handleWarehouseSelect}
        selectedRouteId={selectedRouteId} 
      />
    </>
  );
};

export default DeliveryOrderForm;