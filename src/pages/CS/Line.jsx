import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Tag,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  LineChartOutlined,
  BankOutlined
} from '@ant-design/icons';
import {
  createLine,
  getAllLines,
  updateLine,
  deleteLine
} from '../../services/CSSevice';
import SystemService from '../../services/SystemService';

const { Option } = Select;

const LinePage = () => {
  const [form] = Form.useForm();
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filters, setFilters] = useState({});
  const [availableMaCty, setAvailableMaCty] = useState([]);
  const [loadingMaCty, setLoadingMaCty] = useState(false);
  
  // Search states
  const [, setSearchText] = useState('');
  const [, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  useEffect(() => {
    fetchLines();
    fetchMaCtyOptions();
  }, []);

  // Fetch maCty options từ fixed cost
  const fetchMaCtyOptions = async () => {
    try {
      setLoadingMaCty(true);
      const response = await SystemService.getFixedCost();
      
      if (response && response.maCty && Array.isArray(response.maCty)) {
        setAvailableMaCty(response.maCty);
      } else {
        console.warn('Không tìm thấy maCty trong response:', response);
        setAvailableMaCty([]);
      }
    } catch (error) {
      console.error('Error fetching maCty options:', error);
      message.error('Lỗi khi tải danh sách mã công ty');
      setAvailableMaCty([]);
    } finally {
      setLoadingMaCty(false);
    }
  };

  const fetchLines = async (page = 1, pageSize = 20, filterParams = {}) => {
    setLoading(true);
    try {
      const response = await getAllLines(page, pageSize, filterParams);
      if (response.status === 'OK') {
        setLines(response.data || []);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: response.pagination?.total || 0,
        });
      } else {
        message.error(response.message || 'Lỗi khi tải danh sách line');
        setLines([]);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách line');
      setLines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationConfig, tableFilters) => {
    const apiFilters = {};
    
    Object.keys(tableFilters).forEach(key => {
      if (tableFilters[key] && tableFilters[key].length > 0) {
        apiFilters[key] = Array.isArray(tableFilters[key]) ? tableFilters[key] : [tableFilters[key]];
      }
    });

    setFilters(apiFilters);
    fetchLines(paginationConfig.current, paginationConfig.pageSize, apiFilters);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      line: record.line,
      lineCode: record.lineCode,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteLine(id);
      if (response.status === 'OK') {
        message.success('Xóa line thành công');
        fetchLines(pagination.current, pagination.pageSize, filters);
      } else {
        message.error(response.message || 'Lỗi khi xóa line');
      }
    } catch (error) {
      message.error('Lỗi khi xóa line');
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingRecord) {
        const response = await updateLine(editingRecord._id, values);
        if (response.status === 'OK') {
          message.success('Cập nhật line thành công');
        } else {
          message.error(response.message || 'Lỗi khi cập nhật line');
        }
      } else {
        const response = await createLine(values);
        if (response.status === 'OK') {
          message.success('Thêm line thành công');
        } else {
          message.error(response.message || 'Lỗi khi thêm line');
        }
      }
      setIsModalVisible(false);
      fetchLines(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleFormModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingRecord(null);
  };

  // Search functions
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    
    const newFilters = { ...filters };
    if (selectedKeys[0]) {
      newFilters[dataIndex] = selectedKeys[0];
    } else {
      delete newFilters[dataIndex];
    }
    
    setFilters(newFilters);
    fetchLines(pagination.current, pagination.pageSize, newFilters);
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSearchText('');
    
    const newFilters = { ...filters };
    delete newFilters[dataIndex];
    
    setFilters(newFilters);
    fetchLines(pagination.current, pagination.pageSize, newFilters);
  };

  const getColumnSearchProps = (dataIndex, placeholder = '') => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={placeholder || `Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      return record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '';
    },
  });

  const getColumnSelectProps = (dataIndex, options) => ({
    filters: options.map(option => ({
      text: option,
      value: option,
    })),
    onFilter: (value, record) => record[dataIndex] === value,
  });

  const columns = [
    {
      title: 'Tên Line',
      dataIndex: 'line',
      key: 'line',
      width: 200,
      fixed: 'left',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LineChartOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      ),
      ...getColumnSearchProps('line', 'Tìm tên line'),
    },
    {
      title: 'Mã Line',
      dataIndex: 'lineCode',
      key: 'lineCode',
      width: 150,
      render: (code) => (
        <Tag color="blue" style={{ fontWeight: 500 }}>
          <BankOutlined style={{ marginRight: 4 }} />
          {code}
        </Tag>
      ),
      ...getColumnSelectProps('lineCode', availableMaCty),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => new Date(date).toLocaleString('vi-VN'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date) => new Date(date).toLocaleString('vi-VN'),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa line này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <div>
              <h2 style={{ margin: 0, color: '#1890ff' }}>
                <LineChartOutlined style={{ marginRight: 8 }} />
                Quản lý Line
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                Quản lý các line vận chuyển và mã line tương ứng
              </p>
            </div>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleAdd}
            >
              Thêm Line
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={lines}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 800 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} line`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LineChartOutlined style={{ color: '#1890ff' }} />
            <span>{editingRecord ? 'Cập nhật Line' : 'Thêm Line mới'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleFormModalCancel}
        footer={[
          <Button key="cancel" onClick={handleFormModalCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            {editingRecord ? 'Cập nhật' : 'Thêm mới'}
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Tên Line"
                name="line"
                rules={[{ required: true, message: 'Vui lòng nhập tên line' }]}
              >
                <Input 
                  placeholder="Nhập tên line" 
                  prefix={<LineChartOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Mã Line"
                name="lineCode"
                rules={[{ required: true, message: 'Vui lòng chọn mã line' }]}
                help="Chọn mã line từ danh sách mã công ty có sẵn"
              >
                <Select
                  placeholder={loadingMaCty ? "Đang tải danh sách mã công ty..." : "Chọn mã line"}
                  loading={loadingMaCty}
                  disabled={loadingMaCty}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.value.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {availableMaCty.map(ma => (
                    <Option key={ma} value={ma}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <BankOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        <span style={{ fontWeight: 500 }}>{ma}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Hiển thị thống kê mã công ty */}
          {availableMaCty.length > 0 && (
            <Card size="small" style={{ backgroundColor: '#f5f5f5' }}>
              <div style={{ 
                fontSize: 12, 
                color: '#666'
              }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>📊 Thống kê mã công ty:</strong>
                </div>
                <div>
                  • Có {availableMaCty.length} mã công ty khả dụng
                </div>
                <div>
                  • Danh sách: {availableMaCty.join(', ')}
                </div>
              </div>
            </Card>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default LinePage;