import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Row,
  Col,
  Space,
  Typography,
  message,
  Modal,
  Form,
  InputNumber,
  Pagination,
  Spin,
  Table,
  Radio,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { 
  getAllIncidentalCostsWithOrderInfo, 
  createIncidentalCost, 
  updateIncidentalCost, 
  deleteIncidentalCost,
  getOrdersByContainerNumber 
} from '../../services/OrderService';
import IncidentalCostCard from '../../components/cards/IncidentalCostCard';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const IncidentalCost = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });
  const [filters, setFilters] = useState({
    containerNumber: '',
    type: null,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // States cho tìm kiếm đơn hàng
  const [searchContainer, setSearchContainer] = useState('');
  const [searchingOrders, setSearchingOrders] = useState(false);
  const [foundOrders, setFoundOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Mapping cho type
  const typeOptions = [
    { value: 0, label: 'Đội xe', color: 'blue' },
    { value: 1, label: 'Khách hàng', color: 'green' },
    { value: 2, label: 'Công ty', color: 'orange' },
  ];

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllIncidentalCostsWithOrderInfo(
        pagination.current,
        pagination.pageSize,
        filters.containerNumber,
        filters.type
      );
      
      // Xử lý dữ liệu từ API response
      const processedData = response.data?.map(item => ({
        ...item,
        orderInfo: {
          ...item.orderInfo,
          customerName: item.orderInfo?.customer?.name || 'N/A',
          customerShortName: item.orderInfo?.customer?.shortName || 'N/A',
        }
      })) || [];

      setData(processedData);
      setPagination(prev => ({
        ...prev,
        total: response.total || response.data?.length || 0,
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Lỗi khi tải dữ liệu chi phí phát sinh');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchOrders = async () => {
    if (!searchContainer.trim()) {
      message.warning('Vui lòng nhập số container');
      return;
    }

    setSearchingOrders(true);
    try {
      const response = await getOrdersByContainerNumber(searchContainer.trim());
      setFoundOrders(response.data || []);
      if (response.data?.length === 0) {
        message.info('Không tìm thấy đơn hàng nào với số container này');
      }
    } catch (error) {
      console.error('Error searching orders:', error);
      message.error('Lỗi khi tìm kiếm đơn hàng');
      setFoundOrders([]);
    } finally {
      setSearchingOrders(false);
    }
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleReset = () => {
    setFilters({
      containerNumber: '',
      type: null,
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setSearchContainer('');
    setFoundOrders([]);
    setSelectedOrderId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      orderId: record.orderId,
      type: record.type,
      amount: record.amount,
      reason: record.reason,
      responsiblePerson: record.responsiblePerson || '',
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa chi phí phát sinh này?',
      onOk: async () => {
        try {
          await deleteIncidentalCost(id);
          message.success('Xóa chi phí phát sinh thành công');
          fetchData();
        } catch (error) {
          message.error('Lỗi khi xóa chi phí phát sinh');
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        orderId: editingRecord ? values.orderId : selectedOrderId,
      };

      if (!editingRecord && !selectedOrderId) {
        message.error('Vui lòng chọn đơn hàng');
        return;
      }

      if (editingRecord) {
        await updateIncidentalCost(editingRecord._id, submitData);
        message.success('Cập nhật chi phí phát sinh thành công');
      } else {
        await createIncidentalCost(submitData);
        message.success('Thêm chi phí phát sinh thành công');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      setSearchContainer('');
      setFoundOrders([]);
      setSelectedOrderId(null);
      fetchData();
    } catch (error) {
      console.error('Error submitting incidental cost:', error);
      
      // Xử lý các loại lỗi khác nhau
      if (error.message && error.message.includes('OrderPartnerConnection record not found')) {
        message.error('Đơn hàng này chưa được gán cho đối tác vận chuyển. Vui lòng chọn đơn hàng khác hoặc liên hệ quản trị viên.');
      } else if (error.message) {
        message.error(`Lỗi: ${error.message}`);
      } else {
        message.error('Lỗi khi lưu chi phí phát sinh');
      }
    }
  };

  // Filter data based on search criteria
  const filteredData = data.filter(item => {
    const containerMatch = !filters.containerNumber || 
      item.orderInfo?.containerNumber?.toLowerCase().includes(filters.containerNumber.toLowerCase());
    const typeMatch = filters.type === null || item.type === filters.type;
    return containerMatch && typeMatch;
  });

  const orderColumns = [
    {
      title: 'Chọn',
      dataIndex: '_id',
      key: 'select',
      width: 60,
      render: (id) => (
        <Radio
          checked={selectedOrderId === id}
          onChange={() => setSelectedOrderId(id)}
        />
      ),
    },
    {
      title: 'Số Container',
      dataIndex: 'containerNumber',
      key: 'containerNumber',
    },
    {
      title: 'Khách hàng',
      dataIndex: ['customer', 'shortName'],
      key: 'customer',
      render: (text, record) => record.customer?.shortName || record.customer?.name || 'N/A',
    },
    {
      title: 'Ngày Giao',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
    },
    {
      title: 'Có Đối Tác',
      dataIndex: 'hasVehicle',
      key: 'hasVehicle',
      width: 100,
      render: (hasVehicle, record) => {
        // Kiểm tra xem đơn hàng có được gán cho đối tác hay không
        const hasPartner = hasVehicle === 1;
        return hasPartner ? 
          <span style={{ color: 'green' }}>✓ Có</span> : 
          <span style={{ color: 'red' }}>✗ Chưa</span>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản Lý Chi Phí Phát Sinh</Title>
      
      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input
              placeholder="Tìm theo số container"
              value={filters.containerNumber}
              onChange={(e) => setFilters(prev => ({ ...prev, containerNumber: e.target.value }))}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Chọn loại chi phí"
              value={filters.type}
              onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              allowClear
              style={{ width: '100%' }}
            >
              {typeOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
                Tìm Kiếm
              </Button>
              <Button onClick={handleReset}>Đặt Lại</Button>
            </Space>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={handleAdd} icon={<PlusOutlined />}>
              Thêm Chi Phí
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Cards View */}
      <Card title="Danh Sách Chi Phí Phát Sinh" style={{ marginBottom: 24 }}>
        <Spin spinning={loading}>
          <Row gutter={[16, 16]} style={{ minHeight: 400 }}>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Col key={item._id} xs={24} sm={12} lg={8} xl={6}>
                  <IncidentalCostCard
                    data={item}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDelete(item._id)}
                    typeOptions={typeOptions}
                  />
                </Col>
              ))
            ) : (
              <Col span={24} style={{ textAlign: 'center', paddingTop: 50 }}>
                <div style={{ color: '#999' }}>
                  {loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu chi phí phát sinh'}
                </div>
              </Col>
            )}
          </Row>
        </Spin>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: 24,
            padding: '16px 0',
            borderTop: '1px solid #f0f0f0'
          }}>
            <div style={{ color: '#666' }}>
              Hiển thị {filteredData.length} mục
            </div>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePaginationChange}
              onShowSizeChange={handlePaginationChange}
              showSizeChanger
              showQuickJumper
              pageSizeOptions={['8', '12', '16', '24', '32']}
              size="default"
            />
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingRecord ? 'Sửa Chi Phí Phát Sinh' : 'Thêm Chi Phí Phát Sinh'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSearchContainer('');
          setFoundOrders([]);
          setSelectedOrderId(null);
        }}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {!editingRecord && (
            <>
              {/* Tìm kiếm đơn hàng */}
              <Card title="Tìm Kiếm Đơn Hàng" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={16}>
                    <Input
                      placeholder="Nhập số container để tìm đơn hàng"
                      value={searchContainer}
                      onChange={(e) => setSearchContainer(e.target.value)}
                      onPressEnter={handleSearchOrders}
                      prefix={<SearchOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Button
                      type="primary"
                      onClick={handleSearchOrders}
                      loading={searchingOrders}
                      icon={<EyeOutlined />}
                      style={{ width: '100%' }}
                    >
                      Tìm Kiếm
                    </Button>
                  </Col>
                </Row>

                {/* Danh sách đơn hàng tìm được */}
                {foundOrders.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Title level={5}>Chọn đơn hàng:</Title>
                    <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                      * Chỉ có thể tạo chi phí phát sinh cho đơn hàng đã được gán đối tác vận chuyển
                    </div>
                    <Table
                      columns={orderColumns}
                      dataSource={foundOrders}
                      rowKey="_id"
                      pagination={false}
                      size="small"
                      scroll={{ y: 200 }}
                      rowClassName={(record) => {
                        // Highlight các đơn hàng chưa có đối tác
                        return record.hasVehicle !== 1 ? 'disabled-row' : '';
                      }}
                    />
                  </div>
                )}
              </Card>
            </>
          )}

          {/* Form chi phí phát sinh */}
          <Row gutter={16}>
            {editingRecord && (
              <Col span={12}>
                <Form.Item
                  name="orderId"
                  label="ID Đơn Hàng"
                  rules={[{ required: true, message: 'Vui lòng nhập ID đơn hàng' }]}
                >
                  <Input placeholder="Nhập ID đơn hàng" disabled />
                </Form.Item>
              </Col>
            )}
            <Col span={editingRecord ? 12 : 24}>
              <Form.Item
                name="type"
                label="Loại Chi Phí"
                rules={[{ required: true, message: 'Vui lòng chọn loại chi phí' }]}
              >
                <Select placeholder="Chọn loại chi phí">
                  {typeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Số Tiền (VNĐ)"
                rules={[
                  { required: true, message: 'Vui lòng nhập số tiền' },
                  { type: 'number', min: 0, message: 'Số tiền phải lớn hơn 0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập số tiền"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="responsiblePerson"
                label="Người Chịu Trách Nhiệm"
              >
                <Input placeholder="Nhập tên người chịu trách nhiệm" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="reason"
            label="Lý Do Phát Sinh"
            rules={[{ required: true, message: 'Vui lòng nhập lý do phát sinh' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập lý do chi tiết về chi phí phát sinh này"
              showCount
              maxLength={500}
            />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                disabled={!editingRecord && !selectedOrderId}
              >
                {editingRecord ? 'Cập Nhật' : 'Thêm Mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IncidentalCost;