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
  Checkbox,
  Modal,
} from 'antd';
import dayjs from 'dayjs';
import { createPackingOrder } from '../../services/OrderService';
import { getAllCustomersWithoutPagination } from '../../services/CustomerService';
import LocationSelector from '../location/LocationSelector';
import { checkIfRecordExists } from '../../services/ExternalFleetCostService';
import {
  fetchProvinceName,
  fetchDistrictName,
  fetchWardName,
} from '../../services/LocationService';
import CreateExternalFleetCost from '../location/CreateExternalFleetCost'; 
import AddSalesPersonModal from '../popup/AddSalesPersonModal';
import SystemService from '../../services/SystemService';
import WarehouseSelector from '../popup/WarehouseSelector'; 
import { PlusOutlined } from '@ant-design/icons';
import { updateCustomer } from '../../services/CustomerService';

const { Option } = Select;

const PackingOrderForm = () => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [modalData, setModalData] = useState({}); 
  const [quantity, setQuantity] = useState(1); 
  const [salesPersonList, setSalesPersonList] = useState([]); 
  const [isAddSalesPersonModalVisible, setIsAddSalesPersonModalVisible] = useState(false);
  const [isWarehouseModalVisible, setIsWarehouseModalVisible] = useState(false); 
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerItems, setSelectedCustomerItems] = useState([]);
  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
  const [newItemForm] = Form.useForm();

  useEffect(() => {
    fetchCustomers(); 
    fetchSalesPersons();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await getAllCustomersWithoutPagination();
      const customersData = response.customers || [];
      if (customersData.length > 0) {
        setCustomers(
          customersData.map((customer) => ({
            _id: customer._id,
            name: customer.name,
            shortName: customer.shortName,
            items: customer.items || [], // Đảm bảo có field items
          }))
        );
      } else {
        setCustomers([]);
        message.info('Không có khách hàng nào.');
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách khách hàng.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesPersons = async () => {
    try {
      const response = await SystemService.getSalePersons();
      if (response.status === 'OK' && Array.isArray(response.data)) {
        setSalesPersonList(response.data); 
      } else {
        setSalesPersonList([]);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách nhân viên kinh doanh.');
      setSalesPersonList([]);
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
      message.warning('Vui lòng chọn tuyến vận tải trước khi tạo đơn đóng hàng.');
      return;
    }

    const packingDate = values.packingDate
      ? dayjs(values.packingDate).format('YYYY-MM-DD')
      : null;
    const orderData = {
      ...values,
      packingDate: packingDate,
      externalFleetCostId: selectedRouteId,
      moocType: values.contType,
    };

    try {
      for (let i = 0; i < quantity; i++) {
        await createPackingOrder(orderData);
      }
      form.resetFields();

      setSelectedRouteId(null);
      message.success(`Tạo ${quantity} đơn đóng hàng thành công`);
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
    if (startPoint || endPoint) {
      setLoading(true);
      try {
        const response = await checkIfRecordExists(startPoint, endPoint);
        if (response && response.length > 0) {
          const updatedRoutes = await Promise.all(
            response.map(async (route) => {
              const startProvince = await fetchProvinceName(route.startPoint.provinceCode);
              const startDistrict = await fetchDistrictName(route.startPoint.districtCode);
              const startWard = route.startPoint.wardCode
                ? await fetchWardName(route.startPoint.wardCode)
                : null;

              const endProvince = await fetchProvinceName(route.endPoint.provinceCode);
              const endDistrict = await fetchDistrictName(route.endPoint.districtCode);
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
            })
          );
          const filteredRoutes = updatedRoutes.filter((route) => route.type === 1);
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

  const handleWarehouseSelect = (selectedWarehouse) => {
    form.setFieldsValue({
      location: {
        ...form.getFieldValue('location'),
        startPoint: {
          ...form.getFieldValue(['location', 'startPoint']),
          locationText: selectedWarehouse.name, 
          lat: selectedWarehouse.lat, 
          lng: selectedWarehouse.lng, 
        },
      },
    });
    setIsWarehouseModalVisible(false); 
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
  ];

  const rowSelection = {
    type: 'radio',
    onChange: (selectedRowKeys, selectedRows) => {
      handleRouteSelection(selectedRowKeys[0]);
    },
  };

  // Khi chọn ngày đóng hàng thì tự động set estimatedTime là 17h ngày đó
  const handlePackingDateChange = (date) => {
    if (date) {
      const estimated = dayjs(date).hour(17).minute(0).second(0);
      form.setFieldsValue({ estimatedTime: estimated });
    }
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c._id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setSelectedCustomerItems(customer.items || []);
      
      // Tự động chọn item đầu tiên nếu có
      if (customer.items && customer.items.length > 0) {
        form.setFieldsValue({ item: customer.items[0] });
      } else {
        form.setFieldsValue({ item: undefined });
      }
    } else {
      setSelectedCustomer(null);
      setSelectedCustomerItems([]);
      form.setFieldsValue({ item: undefined });
    }
  };

  const handleAddItem = async () => {
    try {
      const values = await newItemForm.validateFields();
      const newItem = values.item.trim();
      
      if (!newItem) {
        message.error('Vui lòng nhập tên mặt hàng');
        return;
      }

      if (selectedCustomerItems.includes(newItem)) {
        message.error('Mặt hàng này đã tồn tại');
        return;
      }

      const updatedItems = [...selectedCustomerItems, newItem];
      
      // Cập nhật customer trong database
      await updateCustomer(selectedCustomer._id, {
        ...selectedCustomer,
        items: updatedItems
      });

      // Cập nhật state local
      setSelectedCustomerItems(updatedItems);
      
      // Cập nhật customer trong danh sách customers
      setCustomers(prev => prev.map(customer => 
        customer._id === selectedCustomer._id 
          ? { ...customer, items: updatedItems }
          : customer
      ));

      // Tự động chọn item vừa thêm
      form.setFieldsValue({ item: newItem });
      
      setIsAddItemModalVisible(false);
      newItemForm.resetFields();
      message.success('Thêm mặt hàng thành công');
    } catch (error) {
      message.error('Lỗi khi thêm mặt hàng');
    }
  };

  return (
    <>
      <Card title='Thông Tin Địa Điểm' bordered={false} style={{ marginBottom: 16 }}>
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
              <Row gutter={8}>
                <Col span={18}>
                  <Form.Item
                    label="Địa Chỉ Điểm Đi"
                    name={['location', 'startPoint', 'locationText']}
                    style={{ marginBottom: 0 }} 
                  >
                    <Input placeholder="Nhập địa chỉ điểm đi" />
                  </Form.Item>
                </Col>
                <Col
                  span={6}
                  style={{ display: 'flex', alignItems: 'flex-end' }}
                >
                  <Button
                    type="primary"
                    onClick={() => setIsWarehouseModalVisible(true)} 
                    style={{ width: '100%' }}
                  >
                    Chọn Kho
                  </Button>
                </Col>
              </Row>
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
      {routes.filter((route) => route.type === 1).length > 0 ? (
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
            Không tìm được tuyến vận tải nào.{' '}
            <Button
              type="link"
              onClick={() => {
                const startPoint = form.getFieldValue(['location', 'startPoint']);
                const endPoint = form.getFieldValue(['location', 'endPoint']);
                setModalData({ startPoint, endPoint, transportType: 1 });
                setIsModalVisible(true);
              }}
            >
              Bạn có muốn tạo tuyến vận tải mới?
            </Button>
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
                name='packingDate'
                rules={[{ required: false, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  onChange={handlePackingDateChange}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label='Loại Cont'
                name='contType'
                rules={[{ required: true, message: 'Vui lòng chọn loại cont' }]}
              >
                <Select
                  placeholder='Chọn loại cont'
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
                  <Option value={0}>20</Option>
                  <Option value={1}>40</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label='Trọng Lượng (Tấn)'
                name='weight'
                rules={[{ required: true, message: 'Vui lòng nhập trọng lượng' }]}
                initialValue={28}
              >
                <Input type='number' placeholder='Nhập trọng lượng (Tấn)' />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label='Tàu Dự Kiến' name='expectedShip'>
                <Input placeholder='Nhập tàu dự kiến' />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label='Loại Đóng Hàng'
                name='closeCombination'
                rules={[{ required: true, message: 'Vui lòng chọn loại đóng hàng' }]}
              >
                <Select
                  placeholder='Chọn loại đóng hàng'
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
                  <Option value={0}>Gắp vỏ</Option>
                  <Option value={1}>Đóng kết hợp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label='Số Container'
                name='containerNumber'
                rules={[{ required: false, message: 'Vui lòng nhập số container' }]}
              >
                <Input placeholder='Nhập số container' />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label='Thời Gian Đóng Hàng Dự Kiến'
                name='estimatedTime'
                rules={[{ required: false, message: 'Vui lòng nhập thời gian dự kiến' }]}
              >
                <DatePicker showTime placeholder='Chọn thời gian dự kiến' style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label='Chủ vỏ' name='owner'>
                <Input placeholder='Nhập chủ vỏ' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label='Ghi chú' name='note'>
                <Input placeholder='Nhập ghi chú' />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item
                label="Hóa đơn"
                name="bill"
                valuePropName="checked"
                initialValue={false}
              >
                <Checkbox>
                  Hóa đơn
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label="Nhân Viên Kinh Doanh"
                name="salesPerson"
                rules={[{ required: true, message: 'Vui lòng chọn nhân viên kinh doanh' }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn nhân viên kinh doanh"
                  optionFilterProp="children"
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
                type="primary"
                onClick={() => setIsAddSalesPersonModalVisible(true)}
                style={{ marginTop: '32px' }}
              >
                Thêm Nhân Viên
              </Button>
            </Col>
          </Row>

          {/* Khách hàng và Mặt hàng */}
          <Row gutter={16}>
            <Col span={8}>
              {customers.length > 0 ? (
                <Form.Item
                  label="Khách Hàng"
                  name="customer"
                  rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn khách hàng"
                    optionFilterProp="children"
                    onChange={handleCustomerChange}
                    filterOption={(input, option) => {
                      const children = option.children;
                      if (typeof children === 'string') {
                        return children.toLowerCase().includes(input.toLowerCase());
                      }
                      return false;
                    }}
                  >
                    {customers.map((customer) => (
                      <Option key={customer._id} value={customer._id}>
                        {`${customer.name} (${customer.shortName})`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : (
                <Alert
                  style={{ marginBottom: 16 }}
                  message="Không có khách hàng nào."
                  type="info"
                  showIcon
                />
              )}
            </Col>
            
            <Col span={6}>
              <Form.Item label='Mặt Hàng' name='item'>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Select
                    placeholder='Chọn mặt hàng'
                    style={{ flex: 1 }}
                    disabled={!selectedCustomer}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    value={form.getFieldValue('item')}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {selectedCustomerItems.map((item) => (
                      <Option key={item} value={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddItemModalVisible(true)}
                    disabled={!selectedCustomer}
                    title="Thêm mặt hàng mới"
                    size="small"
                  >
                  </Button>
                </div>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Số Lượng Đơn" name="quantity">
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  defaultValue={1}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Nhập số lượng đơn"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle">
            <Col>
              <Button type='primary' htmlType='submit'>
                Tạo Đơn Đóng Hàng Mới
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Modal thêm mặt hàng */}
      <Modal
        title="Thêm mặt hàng mới"
        visible={isAddItemModalVisible}
        onCancel={() => {
          setIsAddItemModalVisible(false);
          newItemForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsAddItemModalVisible(false);
            newItemForm.resetFields();
          }}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddItem}>
            Thêm
          </Button>,
        ]}
      >
        <Form form={newItemForm} layout="vertical">
          <Form.Item
            label="Tên mặt hàng"
            name="item"
            rules={[{ required: true, message: 'Vui lòng nhập tên mặt hàng' }]}
          >
            <Input placeholder="Nhập tên mặt hàng" />
          </Form.Item>
          {selectedCustomer && (
            <div>
              <p style={{ marginBottom: 8 }}>
                <strong>Khách hàng:</strong> {selectedCustomer.name}
              </p>
              {selectedCustomerItems.length > 0 && (
                <div>
                  <p style={{ marginBottom: 4 }}>
                    <strong>Mặt hàng hiện có:</strong>
                  </p>
                  <div style={{ 
                    maxHeight: 100, 
                    overflowY: 'auto', 
                    border: '1px solid #d9d9d9', 
                    borderRadius: 4, 
                    padding: 8 
                  }}>
                    {selectedCustomerItems.map((item, index) => (
                      <div key={index} style={{ padding: '2px 0' }}>
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Form>
      </Modal>

      <CreateExternalFleetCost
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={(data) => {
          message.success('Tuyến vận tải mới đã được tạo.');
          setIsModalVisible(false);
        }}
        initialData={modalData}
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

export default PackingOrderForm;
