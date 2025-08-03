import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Select,
  Card,
  Row,
  Col,
  message,
  Form,
  Popconfirm,
  Tag,
  Tooltip,
  Modal,
  InputNumber,
  DatePicker,
  Progress,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import {
  getAllUntilDates,
  createUntilDate,
  updateUntilDate,
  deleteUntilDate,
  getUntilDateFilterOptions,
  untilDateFilters,
  autoCalculateUntilDate,
  getAllLinesForDropdown,
} from '../../services/CSSevice';

const { Option } = Select;
const { RangePicker } = DatePicker;

const UntilDatePage = () => {
  const [form] = Form.useForm();
  const [calculationForm] = Form.useForm();
  const [untilDates, setUntilDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLines, setLoadingLines] = useState(false); // Add loading state for lines
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 25,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  const [filters, setFilters] = useState({});
  
  // State cho filter options
  const [filterOptions, setFilterOptions] = useState({
    lines: [],
    contTypes: [],
    transportDirections: []
  });

  // State cho calculation modal
  const [isCalculationModalVisible, setIsCalculationModalVisible] = useState(false);
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    fetchUntilDates();
    fetchFilterOptions();
    fetchLines();
  }, []);


  // Fetch lines for calculation filter
  const fetchLines = async () => {
    try {
      setLoadingLines(true); // Set loading state
      const response = await getAllLinesForDropdown();
      if (response.status === 'OK' && Array.isArray(response.data)) {
        setLines(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách lines:', error);
      message.error('Lỗi khi tải danh sách lines');
    } finally {
      setLoadingLines(false); // Clear loading state
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await getUntilDateFilterOptions();
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Lỗi khi tải filter options:', error);
      message.error('Lỗi khi tải danh sách bộ lọc');
    }
  };

  const fetchUntilDates = async (page = 1, pageSize = 25, filterParams = {}) => {
    setLoading(true);
    try {
      const response = await getAllUntilDates(page, pageSize, filterParams);
      setUntilDates(response.data);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.pagination.total,
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách ngày lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    const filterParams = { ...filters };
    setFilters(filterParams);
    fetchUntilDates(pagination.current, pagination.pageSize, filterParams);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      contType: record.contType,
      line: record.line,
      transportDirection: record.transportDirection,
      untilDate: record.untilDate,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUntilDate(id);
      message.success('Xóa bản ghi thành công');
      fetchUntilDates(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      message.error('Lỗi khi xóa bản ghi');
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingRecord) {
        await updateUntilDate(editingRecord._id, values);
        message.success('Cập nhật bản ghi thành công');
      } else {
        await createUntilDate(values);
        message.success('Thêm bản ghi thành công');
      }
      setIsModalVisible(false);
      fetchUntilDates(pagination.current, pagination.pageSize, filters);
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

  // Handle calculation modal
  const handleCalculationModalOpen = () => {
    setIsCalculationModalVisible(true);
    calculationForm.resetFields();
    setCalculationResult(null);
  };

  const handleCalculationModalCancel = () => {
    setIsCalculationModalVisible(false);
    calculationForm.resetFields();
    setCalculationResult(null);
  };

  const handleAutoCalculate = async (values) => {
    try {
      setCalculationLoading(true);
      
      // Prepare filters
      const filters = {};
      
      if (values.contType !== undefined) filters.contType = values.contType;
      if (values.transportDirection !== undefined) filters.transportDirection = values.transportDirection;
      if (values.line) filters.line = values.line;
      if (values.customerId) filters.customerId = values.customerId;
      
      if (values.dateRange && values.dateRange.length === 2) {
        filters.startDate = values.dateRange[0].format('YYYY-MM-DD');
        filters.endDate = values.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await autoCalculateUntilDate(filters);
      
      if (response.status === 'OK') {
        setCalculationResult(response.data);
        message.success(response.message);
      } else {
        message.error('Có lỗi xảy ra khi tính toán');
      }
    } catch (error) {
      message.error(error.message || 'Lỗi khi tính toán ngày lưu');
      console.error('Calculation error:', error);
    } finally {
      setCalculationLoading(false);
    }
  };

  const getColumnSelectProps = (dataIndex, options) => ({
    filters: options.map(option => ({
      text: option.label,
      value: option.value,
    })),
    onFilter: (value, record) => record[dataIndex] === value,
  });

  const getColumnMultiSelectProps = (dataIndex, options, placeholder) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Select
          mode="multiple"
          style={{ width: 200, marginBottom: 8, display: 'block' }}
          placeholder={placeholder}
          value={selectedKeys}
          onChange={setSelectedKeys}
        >
          {options.map(option => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}
        </Select>
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Lọc
          </Button>
          <Button
            onClick={() => clearFilters()}
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
      if (!value || value.length === 0) return true;
      return value.includes(record[dataIndex]);
    },
  });


  const columns = [
    {
      title: 'Loại',
      dataIndex: 'contType',
      key: 'contType',
      width: 80,
      fixed: 'left',
      render: (type) => (
        <Tag color={type === 0 ? 'blue' : 'green'}>
          {type === 0 ? '20' : '40'}
        </Tag>
      ),
      ...getColumnSelectProps('contType', untilDateFilters.contType),
    },
    {
      title: 'LINE',
      dataIndex: 'line',
      key: 'line',
      width: 100,
      render: (text) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {text || 'N/A'}
        </span>
      ),
      ...getColumnMultiSelectProps('line', filterOptions.lines, 'Chọn Line'),
    },
    {
      title: 'Chiều hàng',
      dataIndex: 'transportDirection',
      key: 'transportDirection',
      width: 120,
      render: (direction) => (
        <Tag color={direction === 0 ? 'orange' : 'purple'}>
          {direction === 0 ? 'HP-HCM' : 'HCM-HP'}
        </Tag>
      ),
      ...getColumnSelectProps('transportDirection', untilDateFilters.transportDirection),
    },
    {
      title: 'Số ngày lưu',
      dataIndex: 'untilDate',
      key: 'untilDate',
      width: 120,
      render: (days) => (
        <Tag color="cyan" style={{ fontSize: '13px', fontWeight: '500' }}>
          {days} ngày
        </Tag>
      ),
      sorter: (a, b) => a.untilDate - b.untilDate,
    },
    {
      title: 'Hành Động',
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
            title="Bạn có chắc chắn muốn xóa bản ghi này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
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
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0 }}>Quản Lý Ngày Lưu Container</h2>
            <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
              Quản lý số ngày được phép lưu container theo loại và chiều vận chuyển
            </p>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<CalculatorOutlined />}
                onClick={handleCalculationModalOpen}
                type="default"
                style={{ 
                  background: '#52c41a', 
                  borderColor: '#52c41a', 
                  color: 'white' 
                }}
              >
                Cập nhật ngày lưu cho container
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchUntilDates(pagination.current, pagination.pageSize, filters)}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Thêm bản ghi
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <div className="table-container-wrapper">
        <Table
          columns={columns}
          dataSource={untilDates}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['15', '25', '35', '50', '100'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} bản ghi`,
          }}
          onChange={handleTableChange}
          scroll={{ 
            x: 600,
            y: 'calc(100vh - 400px)'
          }}
          size="small"
          sticky={{
            offsetHeader: 0,
          }}
        />
      </div>

      {/* Form Modal */}
      <Modal
        title={editingRecord ? 'Chỉnh Sửa Bản Ghi' : 'Thêm Bản Ghi Mới'}
        visible={isModalVisible}
        onCancel={handleFormModalCancel}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại Container"
                name="contType"
                rules={[{ required: true, message: 'Vui lòng chọn loại container' }]}
              >
                <Select placeholder="Chọn loại container">
                  {untilDateFilters.contType.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Chiều vận chuyển"
                name="transportDirection"
                rules={[{ required: true, message: 'Vui lòng chọn chiều vận chuyển' }]}
              >
                <Select placeholder="Chọn chiều vận chuyển">
                  {untilDateFilters.transportDirection.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Line"
            name="line"
            rules={[{ required: true, message: 'Vui lòng chọn line' }]}
          >
            <Select
              placeholder={loadingLines ? "Đang tải danh sách line..." : "Chọn line"}
              loading={loadingLines}
              disabled={loadingLines}
              allowClear
              showSearch
              filterOption={(input, option) => {
                return option.value.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {lines.map((lineItem) => (
                <Option key={lineItem._id} value={lineItem.line}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>{lineItem.line}</span>
                    <span style={{ 
                      fontSize: 10, 
                      color: '#666', 
                      backgroundColor: '#f0f0f0', 
                      padding: '1px 4px', 
                      borderRadius: 3 
                    }}>
                      {lineItem.lineCode}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Số ngày được lưu"
            name="untilDate"
            rules={[
              { required: true, message: 'Vui lòng nhập số ngày' },
              { type: 'number', min: 0, message: 'Số ngày phải lớn hơn hoặc bằng 0' }
            ]}
          >
            <InputNumber
              placeholder="Nhập số ngày được lưu"
              style={{ width: '100%' }}
              min={0}
              max={365}
              addonAfter="ngày"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleFormModalCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRecord ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Auto Calculate Modal */}
      <Modal
        title="Tự động cập nhật ngày lưu cho container"
        visible={isCalculationModalVisible}
        onCancel={handleCalculationModalCancel}
        width={800}
        footer={null}
      >
        <Alert
          message="Tính năng tự động cập nhật"
          description="Tính năng này sẽ tự động tính toán và cập nhật ngày lưu cho các container có ETA nhưng chưa có ngày lưu hoặc ngày lưu bị trống."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={calculationForm}
          layout="vertical"
          onFinish={handleAutoCalculate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Loại Container" name="contType">
                <Select placeholder="Chọn loại container (tùy chọn)" allowClear>
                  {untilDateFilters.contType.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Chiều vận chuyển" name="transportDirection">
                <Select placeholder="Chọn chiều vận chuyển (tùy chọn)" allowClear>
                  {untilDateFilters.transportDirection.map(option => (
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
              <Form.Item label="Line" name="line" >
                <Select
                  placeholder="Chọn line (tùy chọn)"
                  allowClear
                  showSearch
                  filterOption={(input, option) => {
                    return option.value.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {lines.map((lineItem) => (
                    <Option key={lineItem._id} value={lineItem.line}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500 }}>{lineItem.line}</span>
                        <span style={{ 
                          fontSize: 10, 
                          color: '#666', 
                          backgroundColor: '#f0f0f0', 
                          padding: '1px 4px', 
                          borderRadius: 3 
                        }}>
                          {lineItem.lineCode}
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Khoảng thời gian ETA" name="dateRange">
            <RangePicker 
              style={{ width: '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCalculationModalCancel}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={calculationLoading}
                icon={<CalculatorOutlined />}
              >
                Bắt đầu tính toán
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* Calculation Results */}
        {calculationResult && (
          <div style={{ marginTop: 24 }}>
            <h4>Kết quả tính toán:</h4>
            
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                      {calculationResult.total}
                    </div>
                    <div style={{ color: '#666' }}>Tổng số</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                      {calculationResult.successful}
                    </div>
                    <div style={{ color: '#666' }}>Thành công</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>
                      {calculationResult.failed}
                    </div>
                    <div style={{ color: '#666' }}>Thất bại</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      size={60}
                      percent={Math.round((calculationResult.successful / calculationResult.total) * 100)}
                      format={(percent) => `${percent}%`}
                    />
                  </div>
                </Card>
              </Col>
            </Row>

            {calculationResult.results && calculationResult.results.length > 0 && (
              <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 4 }}>
                <Table
                  size="small"
                  dataSource={calculationResult.results}
                  pagination={false}
                  rowKey="containerId"
                  columns={[
                    {
                      title: 'Container',
                      dataIndex: 'containerNumber',
                      key: 'containerNumber',
                      width: 120,
                    },
                    {
                      title: 'Khách hàng',
                      dataIndex: 'customerName',
                      key: 'customerName',
                      width: 100,
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'success',
                      key: 'success',
                      width: 80,
                      render: (success) => (
                        <Tag color={success ? 'success' : 'error'}>
                          {success ? 'Thành công' : 'Thất bại'}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Ghi chú',
                      dataIndex: 'message',
                      key: 'message',
                      ellipsis: true,
                    },
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* CSS */}
      <style>{`
        .table-container-wrapper {
          background: white;
          border-radius: 6px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
          overflow: hidden;
        }
        
        .ant-table-thead > tr > th {
          position: sticky !important;
          top: 0 !important;
          z-index: 15 !important;
          background: #fafafa !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        
        .ant-table-cell-fix-left,
        .ant-table-cell-fix-right {
          z-index: 12 !important;
        }
        
        .ant-table-thead .ant-table-cell-fix-left {
          z-index: 16 !important;
          background: #fafafa !important;
        }
        
        .ant-table-thead .ant-table-cell-fix-right {
          z-index: 16 !important;
          background: #fafafa !important;
        }
        
        .ant-table-tbody .ant-table-cell-fix-left {
          background: #fff !important;
          z-index: 12 !important;
        }
        
        .ant-table-tbody .ant-table-cell-fix-right {
          background: #fff !important;
          z-index: 12 !important;
        }
        
        .ant-pagination {
          padding: 16px !important;
          border-top: 1px solid #f0f0f0 !important;
          background: #fafafa !important;
          margin: 0 !important;
        }
        
        .ant-table-tbody > tr:hover > td {
          background-color: #f5f5f5 !important;
        }
        
        .ant-table-filter-dropdown {
          border-radius: 6px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default UntilDatePage;