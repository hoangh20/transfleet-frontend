import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Modal,
  Form,
  Popconfirm,
  Tag,
  message,
  Typography,
  Divider,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Highlighter from 'react-highlight-words';
import {
  getAllShipSchedules,
  createShipSchedule,
  updateShipSchedule,
  deleteShipSchedule,
  containerFilters
} from '../../services/CSSevice';

const { Option } = Select;
const { Title, Text } = Typography;

const ShipScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Dialog states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [form] = Form.useForm();

  // States cho search và filter
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [filters, setFilters] = useState({});

  // Load schedules
  const loadSchedules = async (page = 1, pageSize = 10, filterParams = {}) => {
    setLoading(true);
    try {
      const response = await getAllShipSchedules(page, pageSize, filterParams);
      
      if (response.status === 'OK') {
        setSchedules(response.data);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: response.pagination.total
        });
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách chuyến tàu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  // Handle table change với filters
  const handleTableChange = (paginationConfig, tableFilters, sorter) => {
    const apiFilters = {};
    
    Object.keys(tableFilters).forEach(key => {
      if (tableFilters[key] && tableFilters[key].length > 0) {
        if (key === 'ETD' || key === 'ETA') {
          // Xử lý date range filters
          const dateRange = tableFilters[key][0];
          if (dateRange && typeof dateRange === 'object') {
            if (dateRange.start) {
              apiFilters[`${key.toLowerCase()}Start`] = dateRange.start;
            }
            if (dateRange.end) {
              apiFilters[`${key.toLowerCase()}End`] = dateRange.end;
            }
          }
        } else {
          // Với các filter khác, gửi giá trị đầu tiên
          apiFilters[key] = Array.isArray(tableFilters[key]) ? tableFilters[key][0] : tableFilters[key];
        }
      }
    });

    setFilters(apiFilters);
    loadSchedules(paginationConfig.current, paginationConfig.pageSize, apiFilters);
  };

  // Hàm search trong bảng
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    
    // Gọi API với filter search
    const newFilters = { ...filters };
    if (selectedKeys[0]) {
      newFilters[dataIndex] = selectedKeys[0];
    } else {
      delete newFilters[dataIndex];
    }
    
    setFilters(newFilters);
    loadSchedules(pagination.current, pagination.pageSize, newFilters);
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSearchText('');
    
    // Remove filter và gọi lại API
    const newFilters = { ...filters };
    delete newFilters[dataIndex];
    
    setFilters(newFilters);
    loadSchedules(pagination.current, pagination.pageSize, newFilters);
  };

  // Hàm tạo search props cho các cột text
  const getColumnSearchProps = (dataIndex, placeholder = '') => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={placeholder || `Tìm kiếm ${dataIndex}`}
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
            onClick={() => clearFilters && handleReset(clearFilters, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: () => true,
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  // Hàm tạo filter cho Select
  const getColumnSelectProps = (dataIndex, options, optionValueKey = 'value', optionLabelKey = 'label') => ({
    filters: options.map(option => ({
      text: option[optionLabelKey],
      value: option[optionValueKey],
    })),
    onFilter: () => true,
  });

  // Hàm tạo date range search props
  const getColumnDateRangeSearchProps = (dataIndex, placeholder = '') => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => {
      // selectedKeys[0] sẽ là object {start: date, end: date}
      const dateRange = selectedKeys[0] || {};
      
      return (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <div style={{ marginBottom: 8 }}>
            <DatePicker
              placeholder="Từ ngày"
              value={dateRange.start ? dayjs(dateRange.start) : null}
              onChange={(date) => {
                const newRange = { ...dateRange };
                if (date) {
                  newRange.start = date.format('YYYY-MM-DD');
                } else {
                  delete newRange.start;
                }
                setSelectedKeys(Object.keys(newRange).length > 0 ? [newRange] : []);
              }}
              style={{ width: '100%', marginBottom: 4 }}
              format="DD/MM/YYYY"
            />
            <DatePicker
              placeholder="Đến ngày"
              value={dateRange.end ? dayjs(dateRange.end) : null}
              onChange={(date) => {
                const newRange = { ...dateRange };
                if (date) {
                  newRange.end = date.format('YYYY-MM-DD');
                } else {
                  delete newRange.end;
                }
                setSelectedKeys(Object.keys(newRange).length > 0 ? [newRange] : []);
              }}
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </div>
          <Space>
            <Button
              type="primary"
              onClick={() => handleDateRangeSearch(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters && handleDateRangeReset(clearFilters, dataIndex)}
              size="small"
              style={{ width: 90 }}
            >
              Xóa
            </Button>
          </Space>
        </div>
      );
    },
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: () => true,
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  // Hàm xử lý search date range
  const handleDateRangeSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    
    // Gọi API với filter date range
    const newFilters = { ...filters };
    
    if (selectedKeys[0] && Object.keys(selectedKeys[0]).length > 0) {
      const dateRange = selectedKeys[0];
      if (dateRange.start) {
        newFilters[`${dataIndex.toLowerCase()}Start`] = dateRange.start;
      }
      if (dateRange.end) {
        newFilters[`${dataIndex.toLowerCase()}End`] = dateRange.end;
      }
    } else {
      // Xóa cả start và end nếu không có giá trị
      delete newFilters[`${dataIndex.toLowerCase()}Start`];
      delete newFilters[`${dataIndex.toLowerCase()}End`];
    }
    
    setFilters(newFilters);
    loadSchedules(pagination.current, pagination.pageSize, newFilters);
  };

  // Hàm reset date range search
  const handleDateRangeReset = (clearFilters, dataIndex) => {
    clearFilters();
    
    // Remove filter và gọi lại API
    const newFilters = { ...filters };
    delete newFilters[`${dataIndex.toLowerCase()}Start`];
    delete newFilters[`${dataIndex.toLowerCase()}End`];
    
    setFilters(newFilters);
    loadSchedules(pagination.current, pagination.pageSize, newFilters);
  };

  // Dialog handlers
  const handleAdd = () => {
    setDialogMode('create');
    setSelectedSchedule(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setDialogMode('edit');
    setSelectedSchedule(record);
    form.setFieldsValue({
      shipName: record.shipName || '',
      transportDirection: record.transportDirection || 0,
      ETD: record.ETD ? dayjs(record.ETD) : null,
      ETA: record.ETA ? dayjs(record.ETA) : null,
      note: record.note || ''
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedSchedule(null);
    form.resetFields();
  };

  // Submit form
  const handleSubmit = async (values) => {
    try {
      if (!values.shipName?.trim()) {
        message.warning('Vui lòng nhập tên tàu');
        return;
      }

      const submitData = {
        ...values,
        ETD: values.ETD ? values.ETD.toISOString() : null,
        ETA: values.ETA ? values.ETA.toISOString() : null
      };

      let response;
      if (dialogMode === 'create') {
        response = await createShipSchedule(submitData);
      } else {
        response = await updateShipSchedule(selectedSchedule._id, submitData);
      }

      if (response.status === 'OK') {
        message.success(
          dialogMode === 'create' 
            ? 'Tạo chuyến tàu thành công' 
            : 'Cập nhật chuyến tàu thành công'
        );
        handleCancel();
        loadSchedules(pagination.current, pagination.pageSize, filters);
      }
    } catch (error) {
      message.error(
        `Lỗi khi ${dialogMode === 'create' ? 'tạo' : 'cập nhật'} chuyến tàu`
      );
    }
  };

  // Delete handler
  const handleDelete = async (record) => {
    try {
      const response = await deleteShipSchedule(record._id);
      if (response.status === 'OK') {
        message.success('Xóa chuyến tàu thành công');
        loadSchedules(pagination.current, pagination.pageSize, filters);
      }
    } catch (error) {
      message.error('Lỗi khi xóa chuyến tàu');
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '-';
    return dayjs(date).format('DD/MM/YYYY');
  };

  // Get transport direction label and color
  const getTransportDirectionInfo = (direction) => {
    const filter = containerFilters.transportDirection.find(f => f.value === direction);
    return {
      label: filter ? filter.label : 'N/A',
      color: direction === 0 ? 'orange' : 'purple'
    };
  };

  const columns = [
    {
      title: 'Tên tàu',
      dataIndex: 'shipName',
      key: 'shipName',
      width: 200,
      fixed: 'left',
      render: (text) => (
        <Text strong style={{ color: '#1890ff' }}>
          {text || 'N/A'}
        </Text>
      ),
      ...getColumnSearchProps('shipName', 'Tìm tên tàu'),
    },
    {
      title: 'Chiều vận chuyển',
      dataIndex: 'transportDirection',
      key: 'transportDirection',
      width: 150,
      align: 'center',
      render: (direction) => {
        const info = getTransportDirectionInfo(direction);
        return (
          <Tag color={info.color} style={{ minWidth: 80 }}>
            {info.label}
          </Tag>
        );
      },
      ...getColumnSelectProps('transportDirection', containerFilters.transportDirection),
    },
    {
      title: 'ETD',
      dataIndex: 'ETD',
      key: 'ETD',
      width: 150,
      align: 'center',
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CalendarOutlined style={{ marginRight: 4, color: '#52c41a' }} />
          <Text style={{ whiteSpace: 'nowrap' }}>{formatDate(date)}</Text>
        </div>
      ),
      ...getColumnDateRangeSearchProps('ETD', 'Chọn khoảng ETD'),
    },
    {
      title: 'ETA',
      dataIndex: 'ETA',
      key: 'ETA',
      width: 150,
      align: 'center',
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CalendarOutlined style={{ marginRight: 4, color: '#1890ff' }} />
          <Text style={{ whiteSpace: 'nowrap' }}>{formatDate(date)}</Text>
        </div>
      ),
      ...getColumnDateRangeSearchProps('ETA', 'Chọn khoảng ETA'),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: {
        showTitle: false,
      },
      render: (note) => (
        <Tooltip title={note} placement="topLeft">
          <Text type={note ? 'secondary' : 'secondary'} style={{ fontStyle: note ? 'normal' : 'italic' }}>
            {note || 'Không có ghi chú'}
          </Text>
        </Tooltip>
      ),
      ...getColumnSearchProps('note', 'Tìm trong ghi chú'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center',
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
            title={
              <div>
                <div>Bạn có chắc chắn muốn xóa?</div>
                <Text type="secondary">Chuyến tàu: {record.shipName}</Text>
              </div>
            }
            onConfirm={() => handleDelete(record)}
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
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              Quản lý chuyến tàu
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleAdd}
            >
              Thêm chuyến tàu
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text strong style={{ fontSize: 16 }}>
              Danh sách chuyến tàu ({pagination.total})
            </Text>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={schedules}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} chuyến tàu`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {dialogMode === 'create' ? 'Thêm chuyến tàu mới' : 'Chỉnh sửa chuyến tàu'}
          </div>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên tàu"
                name="shipName"
                rules={[{ required: true, message: 'Vui lòng nhập tên tàu' }]}
              >
                <Input placeholder="Nhập tên tàu" size="large" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Chiều vận chuyển"
                name="transportDirection"
                rules={[{ required: true, message: 'Vui lòng chọn chiều vận chuyển' }]}
              >
                <Select placeholder="Chọn chiều vận chuyển" size="large">
                  {containerFilters.transportDirection.map(option => (
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
                label="ETD (Ngày khởi hành)"
                name="ETD"
              >
                <DatePicker 
                  placeholder="Chọn ngày khởi hành"
                  style={{ width: '100%' }} 
                  size="large"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="ETA (Ngày đến)"
                name="ETA"
              >
                <DatePicker 
                  placeholder="Chọn ngày đến"
                  style={{ width: '100%' }} 
                  size="large"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ghi chú"
            name="note"
          >
            <Input.TextArea
              placeholder="Nhập ghi chú (tùy chọn)"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Divider />

          <Row justify="end">
            <Space>
              <Button size="large" onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" size="large">
                {dialogMode === 'create' ? 'Tạo mới' : 'Cập nhật'}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ShipScheduleManagement;