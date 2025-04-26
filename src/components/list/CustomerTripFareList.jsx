import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, Button, AutoComplete, Popconfirm, Space, Modal, Form, Input, Select, message, Spin } from 'antd';
import { getAllCustomersWithoutPagination } from '../../services/CustomerService';
import { 
  createCustomerTripFare, 
  updateCustomerTripFare, 
  deleteCustomerTripFare, 
  getCustomerTripFaresByExternalFleetCostId 
} from '../../services/ExternalFleetCostService';

const { Option } = Select;

const CustomerTripFareList = ({ externalFleetCostId, fetchCostDetails }) => {
  const [customerTripFares, setCustomerTripFares] = useState([]);
  const [filteredCustomerTripFares, setFilteredCustomerTripFares] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFare, setEditingFare] = useState(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomerTripFares();
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFleetCostId]);

  useEffect(() => {
    if (searchTerm) {
      const filteredFares = customerTripFares.filter((fare) =>
        fare.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomerTripFares(filteredFares);
    } else {
      setFilteredCustomerTripFares(customerTripFares);
    }
  }, [searchTerm, customerTripFares]);

  const fetchCustomerTripFares = async () => {
    setLoading(true);
    try {
      const response = await getCustomerTripFaresByExternalFleetCostId(externalFleetCostId);
      const fares = response.data || [];
      const faresWithCustomerNames = fares.map((fare) => ({
        ...fare,
        customerName: fare.customer?.name || 'Không xác định',
      }));
      setCustomerTripFares(faresWithCustomerNames);
      setFilteredCustomerTripFares(faresWithCustomerNames);
    } catch (error) {
      message.error('Lỗi khi tải thông tin cước chuyến của khách hàng');
      setCustomerTripFares([]); 
      setFilteredCustomerTripFares([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await getAllCustomersWithoutPagination();
      setCustomers(response.customers || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách khách hàng');
    }
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      await createCustomerTripFare({
        ...values,
        externalFleetCostId,
      });
      message.success('Tạo cước chuyến của khách hàng thành công');
      setIsModalVisible(false);
      fetchCostDetails();
    } catch (error) {
      message.error('Lỗi khi tạo cước chuyến của khách hàng');
    }
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await updateCustomerTripFare(editingFare._id, values);
      message.success('Cập nhật cước chuyến của khách hàng thành công');
      setIsEditModalVisible(false);
      fetchCustomerTripFares();
      fetchCostDetails();
    } catch (error) {
      message.error('Lỗi khi cập nhật cước chuyến của khách hàng');
    }
  };

  const handleEdit = (record) => {
    setEditingFare(record);
    setIsEditModalVisible(true);
    form.setFieldsValue({
      customer: record.customer._id,
      tripFare0: record.tripFare0 || 0,
      tripFare1: record.tripFare1 || 0,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomerTripFare(id);
      message.success('Xóa cước chuyến của khách hàng thành công');
      fetchCustomerTripFares();
      fetchCostDetails();
    } catch (error) {
      message.error('Lỗi khi xóa cước chuyến của khách hàng');
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Cước chuyến 20"',
      dataIndex: 'tripFare0',
      key: 'tripFare0',
    },
    {
      title: 'Cước chuyến 40"',
      dataIndex: 'tripFare1',
      key: 'tripFare1',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa cước chuyến này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Danh sách cước chuyến của khách hàng" bordered={false} style={{ marginTop: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col span={16}>
          <AutoComplete
            style={{ width: '100%' }}
            onSearch={(value) => setSearchTerm(value)}
            placeholder="Tìm kiếm khách hàng "
          />
        </Col>
        <Col>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Thêm cước chuyến
          </Button>
        </Col>
      </Row>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          dataSource={Array.isArray(filteredCustomerTripFares) ? filteredCustomerTripFares : []} 
          rowKey="_id"
          pagination={false}
        />
      )}
      <Modal
        title="Thêm cước chuyến của khách hàng"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleCreate}>
            Lưu
          </Button>,
        ]}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            label="Khách hàng"
            name="customer"
            rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
          >
            <Select
              placeholder="Chọn khách hàng"
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              options={customers.map((customer) => ({
                value: customer._id,
                label: `${customer.name} (${customer.shortName})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Cước chuyến 20''"
            name="tripFare0"
            rules={[{ required: true, message: 'Vui lòng nhập cước chuyến 20"' }]}
          >
            <Input type="number" placeholder="Nhập cước chuyến 20''" />
          </Form.Item>
          <Form.Item
            label="Cước chuyến 40''"
            name="tripFare1"
            rules={[{ required: true, message: 'Vui lòng nhập cước chuyến 40"' }]}
          >
            <Input type="number" placeholder="Nhập cước chuyến 40''" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Chỉnh sửa cước chuyến của khách hàng"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdate}>
            Lưu
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Khách hàng"
            name="customer"
            rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
          >
            <Select placeholder="Chọn khách hàng" disabled>
              {customers.map((customer) => (
                <Option key={customer._id} value={customer._id}>
                  {customer.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Cước chuyến 20''"
            name="tripFare0"
            rules={[{ required: true, message: 'Vui lòng nhập cước chuyến 20"' }]}
          >
            <Input type="number" placeholder="Nhập cước chuyến 20''" />
          </Form.Item>
          <Form.Item
            label="Cước chuyến 40''"
            name="tripFare1"
            rules={[{ required: true, message: 'Vui lòng nhập cước chuyến 40"' }]}
          >
            <Input type="number" placeholder="Nhập cước chuyến 40''" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CustomerTripFareList;