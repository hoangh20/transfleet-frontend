import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  DatePicker,
  Select,
  Card,
  Row,
  Col,
  message,
  Form,
  Popconfirm,
  Tag,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Highlighter from 'react-highlight-words';
import {
  getAllContainers,
  createContainer,
  updateContainer,
  deleteContainer,
  createContainersFromPackingOrders,
  containerFilters,
  getAllShipSchedulesNoPagination,
  bulkUpdateContainers, // Thêm import này
} from '../../services/CSSevice';
import { getAllCustomersWithoutPagination } from '../../services/CustomerService';

// Import các modal components
import ContainerFormModal from '../../components/CS/ContainerFormModal';
import DateRangeModal from '../../components/CS/DateRangeModal';
import ResultModal from '../../components/CS/ResultModal';
import BulkUpdateModal from '../../components/CS/BulkUpdateModal'; // Thêm import này

const { Option } = Select;

const ContainerPage = () => {
  const [form] = Form.useForm();
  const [containers, setContainers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [shipSchedules, setShipSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  // States cho search và filter
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [filters, setFilters] = useState({});
  
  // Thêm state cho popup thông báo kết quả
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [createResult, setCreateResult] = useState(null);

  // Thêm state cho date range picker
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [isDateRangeModalVisible, setIsDateRangeModalVisible] = useState(false);

  // Thêm states cho ship schedule search
  const [shipSearchText, setShipSearchText] = useState('');
  const [filteredShipSchedules, setFilteredShipSchedules] = useState([]);

  // Thêm states cho bulk update
  const [bulkUpdateMode, setBulkUpdateMode] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState([]);
  const [isBulkUpdateModalVisible, setIsBulkUpdateModalVisible] = useState(false);

  useEffect(() => {
    fetchContainers();
    fetchCustomers();
    fetchShipSchedules(''); // Load tất cả chuyến tàu ban đầu
  }, []);

  const fetchContainers = async (page = 1, pageSize = 10, filterParams = {}) => {
    setLoading(true);
    try {
      const response = await getAllContainers(page, pageSize, filterParams);
      setContainers(response.data);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.pagination.total,
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách container');
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

  // Cập nhật hàm fetchShipSchedules để nhận search parameter
  const fetchShipSchedules = async (searchTerm = '') => {
    try {
      const filters = searchTerm ? { shipName: searchTerm } : {};
      const response = await getAllShipSchedulesNoPagination(filters);
      console.log('Ship schedules response:', response); // Debug log
      
      const schedules = response.data || [];
      console.log('Schedules data:', schedules); // Debug log
      
      setShipSchedules(schedules);
      setFilteredShipSchedules(schedules);
    } catch (error) {
      console.error('Lỗi khi tải danh sách chuyến tàu:', error);
      message.error('Lỗi khi tải danh sách chuyến tàu');
    }
  };

  // Sửa lại hàm handleShipSearch để gọi API
  const handleShipSearch = async (value) => {
    console.log('Search value:', value); // Debug log
    setShipSearchText(value);
    
    if (!value || value.trim() === '') {
      // Nếu không có search term, load tất cả
      await fetchShipSchedules('');
      return;
    }

    // Gọi API với search term
    await fetchShipSchedules(value.trim());
  };

  // Hàm xử lý khi chọn chuyến tàu - cập nhật để nhận form parameter
  const handleShipSelect = (value, option, form) => {
    console.log('Selected ship ID:', value);
    
    const selectedSchedule = shipSchedules.find(schedule => schedule._id === value);
    console.log('Selected schedule:', selectedSchedule);
    
    if (selectedSchedule) {
      const updateFields = {
        trainTrip: selectedSchedule.shipName,
        ETD: selectedSchedule.ETD ? dayjs(selectedSchedule.ETD) : null,
        ETA: selectedSchedule.ETA ? dayjs(selectedSchedule.ETA) : null,
      };
      
      console.log('Updating form fields:', updateFields);
      form.setFieldsValue(updateFields);
      
      setShipSearchText('');
      message.success(`Đã chọn chuyến tàu: ${selectedSchedule.shipName}`);
    } else {
      message.error('Không tìm thấy thông tin chuyến tàu');
    }
  };

  // Hàm xử lý thay đổi date range
  const handleDateRangeChange = (field, date) => {
    setDateRange(prev => ({ ...prev, [field]: date }));
  };

  const handleTableChange = (paginationConfig, tableFilters, sorter) => {
    const apiFilters = {};
    
    Object.keys(tableFilters).forEach(key => {
      if (tableFilters[key] && tableFilters[key].length > 0) {
        if (key === 'customer.shortName') {
          // Không cần xử lý vì backend sẽ search theo customer text
          apiFilters['customer'] = tableFilters[key][0];
        } else {
          // Với các filter khác, gửi giá trị đầu tiên
          apiFilters[key] = Array.isArray(tableFilters[key]) ? tableFilters[key][0] : tableFilters[key];
        }
      }
    });

    setFilters(apiFilters);
    fetchContainers(paginationConfig.current, paginationConfig.pageSize, apiFilters);
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
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSearchText('');
    
    // Remove filter và gọi lại API
    const newFilters = { ...filters };
    delete newFilters[dataIndex];
    
    setFilters(newFilters);
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
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

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    
    // Reset ship search states
    setShipSearchText('');
    fetchShipSchedules(''); // Load lại tất cả chuyến tàu
    
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      customer: record.customer?._id || record.customer,
      date: record.date ? dayjs(record.date) : null,
      ETD: record.ETD ? dayjs(record.ETD) : null,
      ETA: record.ETA ? dayjs(record.ETA) : null,
      untilDate: record.untilDate ? dayjs(record.untilDate) : null,
      returnDate: record.returnDate ? dayjs(record.returnDate) : null,
      billingDate: record.billingDate ? dayjs(record.billingDate) : null,
    });
    
    // Reset ship search states khi edit
    setShipSearchText('');
    fetchShipSchedules(''); // Load lại tất cả chuyến tàu
    
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteContainer(id);
      message.success('Xóa container thành công');
      fetchContainers(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      message.error('Lỗi khi xóa container');
    }
  };

  // Hàm xử lý submit form
  const handleFormSubmit = async (submitData) => {
    try {
      if (editingRecord) {
        await updateContainer(editingRecord._id, submitData);
        message.success('Cập nhật container thành công');
      } else {
        await createContainer(submitData);
        message.success('Tạo container thành công');
      }

      setIsModalVisible(false);
      fetchContainers(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      message.error(editingRecord ? 'Lỗi khi cập nhật container' : 'Lỗi khi tạo container');
    }
  };

  // Hàm xử lý đóng modal form
  const handleFormModalCancel = () => {
    setIsModalVisible(false);
    setShipSearchText('');
    fetchShipSchedules('');
  };

  // Hàm xử lý đóng modal date range
  const handleDateRangeModalCancel = () => {
    setIsDateRangeModalVisible(false);
    setDateRange({ startDate: null, endDate: null });
  };

  const handleCreateFromPackingOrders = () => {
    setIsDateRangeModalVisible(true);
  };

  // Hàm xử lý confirm date range và tạo containers
  const handleConfirmDateRange = async () => {
    setLoading(true);
    setIsDateRangeModalVisible(false);
    
    try {
      const startDate = dateRange.startDate ? dateRange.startDate.format('YYYY-MM-DD') : null;
      const endDate = dateRange.endDate ? dateRange.endDate.format('YYYY-MM-DD') : null;
      
      const response = await createContainersFromPackingOrders(startDate, endDate);
      
      setCreateResult(response);
      setIsResultModalVisible(true);
      
      if (response.data?.successCount > 0) {
        fetchContainers(pagination.current, pagination.pageSize, filters);
      }
    } catch (error) {
      message.error('Lỗi khi tạo containers từ đơn đóng hàng');
    } finally {
      setLoading(false);
    }
  };

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
        newFilters[`${dataIndex}Start`] = dateRange.start;
      }
      if (dateRange.end) {
        newFilters[`${dataIndex}End`] = dateRange.end;
      }
    } else {
      // Xóa cả start và end nếu không có giá trị
      delete newFilters[`${dataIndex}Start`];
      delete newFilters[`${dataIndex}End`];
    }
    
    setFilters(newFilters);
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

  // Hàm reset date range search
  const handleDateRangeReset = (clearFilters, dataIndex) => {
    clearFilters();
    
    // Remove filter và gọi lại API
    const newFilters = { ...filters };
    delete newFilters[`${dataIndex}Start`];
    delete newFilters[`${dataIndex}End`];
    
    setFilters(newFilters);
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

  // Hàm tạo customer select filter props
  const getColumnCustomerSelectProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Select
          showSearch
          placeholder="Chọn khách hàng"
          style={{ width: 200, marginBottom: 8 }}
          value={selectedKeys[0]}
          onChange={(value) => {
            setSelectedKeys(value ? [value] : []);
          }}
          allowClear
          filterOption={(input, option) => {
            // Fix: Sử dụng option.label thay vì option.children
            const searchText = `${option.label}`.toLowerCase();
            return searchText.includes(input.toLowerCase());
          }}
        >
          {customers.map(customer => (
            <Option key={customer._id} value={customer._id} label={`${customer.shortName} - ${customer.name}`}>
              {customer.shortName} - {customer.name}
            </Option>
          ))}
        </Select>
        <div>
          <Space>
            <Button
              type="primary"
              onClick={() => handleCustomerSearch(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters && handleCustomerReset(clearFilters, dataIndex)}
              size="small"
              style={{ width: 90 }}
            >
              Xóa
            </Button>
          </Space>
        </div>
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
  });

  // Hàm xử lý search customer
  const handleCustomerSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    
    // Gọi API với customer ID
    const newFilters = { ...filters };
    if (selectedKeys[0]) {
      newFilters[dataIndex] = selectedKeys[0]; // Gửi ID thay vì text
    } else {
      delete newFilters[dataIndex];
    }
    
    setFilters(newFilters);
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

  // Hàm reset customer search
  const handleCustomerReset = (clearFilters, dataIndex) => {
    clearFilters();
    
    // Remove filter và gọi lại API
    const newFilters = { ...filters };
    delete newFilters[dataIndex];
    
    setFilters(newFilters);
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

  // Thêm các function mới cho bulk update
  const handleBulkUpdateToggle = () => {
    setBulkUpdateMode(!bulkUpdateMode);
    setSelectedContainers([]);
  };

  const handleContainerSelect = (selectedRowKeys) => {
    setSelectedContainers(selectedRowKeys);
  };

  const handleBulkUpdate = () => {
    if (selectedContainers.length === 0) {
      message.warning('Vui lòng chọn ít nhất một container để cập nhật');
      return;
    }
    setIsBulkUpdateModalVisible(true);
  };

  const handleBulkUpdateSubmit = async (bulkUpdatePayload) => {
    try {
      setLoading(true);
      
      // bulkUpdatePayload đã có format đúng từ BulkUpdateModal
      await bulkUpdateContainers(bulkUpdatePayload);
      
      message.success(`Cập nhật thành công ${selectedContainers.length} container`);
      setIsBulkUpdateModalVisible(false);
      setBulkUpdateMode(false);
      setSelectedContainers([]);
      fetchContainers(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      message.error('Lỗi khi cập nhật container');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật columns để thêm selection khi ở bulk update mode
  const getColumns = () => {
    let baseColumns = [
      {
        title: 'Ngày đóng',
        dataIndex: 'date',
        key: 'date',
        width: 110,
        fixed: 'left',
        render: (date) => {
          if (!date) return 'N/A';
          return (
            <span style={{ whiteSpace: 'nowrap' }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </span>
          );
        },
        ...getColumnDateRangeSearchProps('date', 'Chọn khoảng ngày'),
      },
      {
        title: 'Số Cont',
        dataIndex: 'containerNumber',
        key: 'containerNumber',
        width: 140,
        fixed: 'left',
        render: (text) => (
          <span style={{ whiteSpace: 'nowrap', fontWeight: '500' }}>
            {text || 'N/A'}
          </span>
        ),
        ...getColumnSearchProps('containerNumber', 'Tìm số container'),
      },
      {
        title: 'Loại',
        dataIndex: 'contType',
        key: 'contType',
        width: 70,
        render: (type) => {
          const typeText = type === 0 ? '20' : type === 1 ? '40' : 'N/A';
          const color = type === 0 ? 'blue' : type === 1 ? 'green' : 'default';
          return <Tag color={color}>{typeText}</Tag>;
        },
        ...getColumnSelectProps('contType', containerFilters.contType),
      },
      {
        title: 'LINE',
        dataIndex: 'line',
        key: 'line',
        width: 90,
        render: (text) => (
          <span style={{ whiteSpace: 'nowrap' }}>
            {text || 'N/A'}
          </span>
        ),
        ...getColumnSearchProps('line', 'Tìm Line'),
      },
      {
        title: 'PTVC',
        dataIndex: 'PTVC',
        key: 'PTVC',
        width: 100,
        render: (text) => (
          <Tooltip title={text}>
            <div style={{ 
              maxWidth: 90, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {text || 'N/A'}
            </div>
          </Tooltip>
        ),
        ...getColumnSearchProps('PTVC', 'Tìm PTVC'),
      },
      {
        title: 'Kết hợp',
        dataIndex: 'closeCombination',
        key: 'closeCombination',
        width: 100,
        render: (type) => {
          const typeMap = { 0: 'Gắp vỏ', 1: 'Kết hợp' };
          const color = type === 0 ? 'blue' : 'green';
          return <Tag color={color}>{typeMap[type] || 'N/A'}</Tag>;
        },
        ...getColumnSelectProps('closeCombination', containerFilters.closeCombination),
      },
      {
        title: 'Chiều hàng',
        dataIndex: 'transportDirection',
        key: 'transportDirection',
        width: 110,
        render: (direction) => {
          const dirMap = { 0: 'HP→HCM', 1: 'HCM→HP' };
          const color = direction === 0 ? 'orange' : 'purple';
          return <Tag color={color}>{dirMap[direction] || 'N/A'}</Tag>;
        },
        ...getColumnSelectProps('transportDirection', containerFilters.transportDirection),
      },
      {
        title: 'Mặt hàng',
        dataIndex: 'item',
        key: 'item',
        width: 100,
        render: (text) => (
          <Tooltip title={text}>
            <div style={{ 
              maxWidth: 90, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {text || 'N/A'}
            </div>
          </Tooltip>
        ),
        ...getColumnSearchProps('item', 'Tìm mặt hàng'),
      },
      {
        title: 'Khách hàng',
        dataIndex: ['customer', 'shortName'],
        key: 'customer',
        width: 140,
        render: (text, record) => (
          <Tooltip title={record.customer?.name}>
            <div style={{ 
              maxWidth: 130, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              fontWeight: '500'
            }}>
              {record.customer?.shortName || 'N/A'}
            </div>
          </Tooltip>
        ),
        ...getColumnCustomerSelectProps('customer'),
      },
      {
        title: 'Kinh doanh',
        dataIndex: 'salesPerson',
        key: 'salesPerson',
        width: 100,
        render: (text) => (
          <span style={{ whiteSpace: 'nowrap' }}>
            {text || 'N/A'}
          </span>
        ),
        ...getColumnSearchProps('salesPerson', 'Tìm KD'),
      },
      {
        title: 'Điểm đóng',
        dataIndex: 'closingPoint',
        key: 'closingPoint',
        width: 160,
        render: (text) => (
          <Tooltip title={text}>
            <div style={{ 
              maxWidth: 150, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {text || 'N/A'}
            </div>
          </Tooltip>
        ),
        ...getColumnSearchProps('closingPoint', 'Tìm điểm đóng'),
      },
      {
        title: 'Đội xe đóng',
        dataIndex: 'fleetClosed',
        key: 'fleetClosed',
        width: 120,
        render: (text) => (
          <span style={{ whiteSpace: 'nowrap' }}>
            {text || 'N/A'}
          </span>
        ),
        ...getColumnSearchProps('fleetClosed', 'Tìm đội đóng'),
      },
      {
        title: 'Số xe đóng',
        dataIndex: 'soXeDong',
        key: 'soXeDong',
        width: 120,
        render: (text) => (
          <span style={{ whiteSpace: 'nowrap' }}>
            {text || 'N/A'}
          </span>
        ),
        ...getColumnSearchProps('soXeDong', 'Tìm số xe đóng'),
      },
      {
        title: 'Điểm trả',
        dataIndex: 'returnPoint',
        key: 'returnPoint',
        width: 160,
        render: (text) => (
          <Tooltip title={text}>
            <div style={{ 
              maxWidth: 150, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {text || 'N/A'}
            </div>
          </Tooltip>
        ),
        ...getColumnSearchProps('returnPoint', 'Tìm điểm trả'),
      },
      {
        title: 'Đội xe trả',
        dataIndex: 'fleetReturned',
        key: 'fleetReturned',
        width: 120,
        render: (text) => (
          <span style={{ whiteSpace: 'nowrap' }}>
            {text || 'N/A'}
          </span>
        ),
        ...getColumnSearchProps('fleetReturned', 'Tìm đội trả'),
      },
      {
        title: 'Số xe trả',
        dataIndex: 'soXeTra',
        key: 'soXeTra',
        width: 120,
        render: (text) => (
          <span style={{ whiteSpace: 'nowrap' }}>
            {text || 'N/A'}
          </span>
        ),
        ...getColumnSearchProps('soXeTra', 'Tìm số xe trả'),
      },
      {
        title: 'Chuyến tàu',
        dataIndex: 'trainTrip',
        key: 'trainTrip',
        width: 150,
        render: (text) => (
          <span style={{ whiteSpace: 'nowrap' }}>
            {text || 'N/A'}
          </span>
        ),
        ...getColumnSearchProps('trainTrip', 'Tìm chuyến tàu'),
      },
      {
        title: 'ETD',
        dataIndex: 'ETD',
        key: 'ETD',
        width: 110,
        render: (date) => {
          if (!date) return 'N/A';
          return (
            <span style={{ whiteSpace: 'nowrap' }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </span>
          );
        },
        ...getColumnDateRangeSearchProps('etd', 'Chọn khoảng ETD'),
      },
      {
        title: 'ETA',
        dataIndex: 'ETA',
        key: 'ETA',
        width: 110,
        render: (date) => {
          if (!date) return 'N/A';
          return (
            <span style={{ whiteSpace: 'nowrap' }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </span>
          );
        },
        ...getColumnDateRangeSearchProps('eta', 'Chọn khoảng ETA'),
      },
      {
        title: 'Được lưu hết',
        dataIndex: 'untilDate',
        key: 'untilDate',
        width: 120,
        render: (date) => {
          if (!date) return 'N/A';
          return (
            <span style={{ whiteSpace: 'nowrap' }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </span>
          );
        },
        ...getColumnDateRangeSearchProps('untilDate', 'Chọn khoảng ngày lưu'),
      },
      {
        title: 'Ngày trả hàng',
        dataIndex: 'returnDate',
        key: 'returnDate',
        width: 120,
        render: (date) => {
          if (!date) return 'N/A';
          return (
            <span style={{ whiteSpace: 'nowrap' }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </span>
          );
        },
        ...getColumnDateRangeSearchProps('returnDate', 'Chọn khoảng ngày trả'),
      },
      {
        title: 'Tháng',
        dataIndex: 'date',
        key: 'month',
        width: 80,
        render: (date) => {
          if (!date) return 'N/A';
          return (
            <span style={{ whiteSpace: 'nowrap' }}>
              {dayjs(date).format('MM/YYYY')}
            </span>
          );
        },
        filters: [
          { text: 'Tháng 1', value: '01' },
          { text: 'Tháng 2', value: '02' },
          { text: 'Tháng 3', value: '03' },
          { text: 'Tháng 4', value: '04' },
          { text: 'Tháng 5', value: '05' },
          { text: 'Tháng 6', value: '06' },
          { text: 'Tháng 7', value: '07' },
          { text: 'Tháng 8', value: '08' },
          { text: 'Tháng 9', value: '09' },
          { text: 'Tháng 10', value: '10' },
          { text: 'Tháng 11', value: '11' },
          { text: 'Tháng 12', value: '12' },
        ],
        onFilter: () => true,
      },
      {
        title: 'HĐ / BK',
        dataIndex: 'bill',
        key: 'bill',
        width: 80,
        render: (bill) => {
          const text = bill === 0 ? 'BK' : 'HĐ';
          const color = bill === 0 ? 'green' : 'blue';
          return <Tag color={color}>{text}</Tag>;
        },
        ...getColumnSelectProps('bill', containerFilters.bill),
      },
      {
        title: 'Ngày làm bill',
        dataIndex: 'billingDate',
        key: 'billingDate',
        width: 120,
        render: (date) => {
          if (!date) return 'N/A';
          return (
            <span style={{ whiteSpace: 'nowrap' }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </span>
          );
        },
        ...getColumnDateRangeSearchProps('billingDate', 'Chọn khoảng ngày bill'),
      },
      {
        title: 'Hành Động',
        key: 'actions',
        width: 110,
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
              title="Bạn có chắc chắn muốn xóa container này?"
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

    return baseColumns;
  };

  // Cấu hình row selection cho bulk update
  const rowSelection = bulkUpdateMode ? {
    selectedRowKeys: selectedContainers,
    onChange: handleContainerSelect,
    getCheckboxProps: (record) => ({
      name: record.containerNumber,
    }),
  } : null;

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0 }}>Quản Lý Container</h2>
          </Col>
          <Col>
            <Space>
              {!bulkUpdateMode ? (
                <>
                  <Button
                    type="default"
                    onClick={handleBulkUpdateToggle}
                  >
                    Cập nhật nhiều cont
                  </Button>
                  <Button
                    type="primary"
                    icon={<SyncOutlined />}
                    onClick={handleCreateFromPackingOrders}
                    loading={loading}
                  >
                    Lấy dữ liệu từ Điều hành vận tải
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    Thêm Container
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="primary"
                    onClick={handleBulkUpdate}
                    disabled={selectedContainers.length === 0}
                  >
                    Cập nhật {selectedContainers.length} cont đã chọn
                  </Button>
                  <Button
                    onClick={handleBulkUpdateToggle}
                  >
                    Hủy
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>
        {bulkUpdateMode && (
          <Row style={{ marginTop: 8 }}>
            <Col>
              <span style={{ color: '#666' }}>
                Đã chọn {selectedContainers.length} container
              </span>
            </Col>
          </Row>
        )}
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={getColumns()}
          dataSource={containers}
          loading={loading}
          rowKey="_id"
          rowSelection={rowSelection}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} container`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1600 }}
          size="small"
        />
      </Card>

      {/* Container Form Modal */}
      <ContainerFormModal
        visible={isModalVisible}
        onCancel={handleFormModalCancel}
        onSubmit={handleFormSubmit}
        editingRecord={editingRecord}
        customers={customers}
        shipSchedules={filteredShipSchedules}
        loading={loading}
        onShipSearch={handleShipSearch}
        onShipSelect={handleShipSelect}
        shipSearchText={shipSearchText}
        onFetchShipSchedules={fetchShipSchedules}
      />

      {/* Bulk Update Modal */}
      <BulkUpdateModal
        visible={isBulkUpdateModalVisible}
        onCancel={() => setIsBulkUpdateModalVisible(false)}
        onSubmit={handleBulkUpdateSubmit}
        loading={loading}
        shipSchedules={filteredShipSchedules}
        onShipSearch={handleShipSearch}
        onShipSelect={(value, option, form) => handleShipSelect(value, option, form)}
        shipSearchText={shipSearchText}
        selectedCount={selectedContainers.length}
        selectedContainerIds={selectedContainers} // Thêm prop này
      />

      {/* Date Range Modal */}
      <DateRangeModal
        visible={isDateRangeModalVisible}
        onCancel={handleDateRangeModalCancel}
        onConfirm={handleConfirmDateRange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        loading={loading}
      />

      {/* Result Modal */}
      <ResultModal
        visible={isResultModalVisible}
        onCancel={() => setIsResultModalVisible(false)}
        createResult={createResult}
      />
    </div>
  );
};

export default ContainerPage;