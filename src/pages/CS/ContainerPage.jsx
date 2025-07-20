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
  Modal,
  Form,
  Popconfirm,
  Tag,
  Tooltip,
  Divider,
  Alert,
  Statistic,
  List,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
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
} from '../../services/CSSevice';
import { getAllCustomersWithoutPagination } from '../../services/CustomerService';

const { Option } = Select;
const { Text } = Typography;

const ContainerPage = () => {
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
  const [form] = Form.useForm();
  
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

  const formatShipScheduleOption = (schedule) => {
    if (!schedule) return '';
    const shipName = schedule.shipName || 'Không có tên';
    const ETD = schedule.ETD ? dayjs(schedule.ETD).format('DD/MM/YYYY') : 'N/A';
    const ETA = schedule.ETA ? dayjs(schedule.ETA).format('DD/MM/YYYY') : 'N/A';
    const note = schedule.note ? ` | Ghi chú: ${schedule.note}` : '';
    return `${shipName} | ETD: ${ETD} | ETA: ${ETA}${note}`;
  };

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

  // Hàm xử lý khi chọn chuyến tàu
  const handleShipSelect = (value, option) => {
    console.log('Selected ship ID:', value); // Debug log
    
    const selectedSchedule = shipSchedules.find(schedule => schedule._id === value);
    console.log('Selected schedule:', selectedSchedule); // Debug log
    
    if (selectedSchedule) {
      // Tự động điền thông tin chuyến tàu
      const updateFields = {
        trainTrip: selectedSchedule.shipName,
        ETD: selectedSchedule.ETD ? dayjs(selectedSchedule.ETD) : null,
        ETA: selectedSchedule.ETA ? dayjs(selectedSchedule.ETA) : null,
      };
      
      console.log('Updating form fields:', updateFields); // Debug log
      form.setFieldsValue(updateFields);
      
      // Clear search text sau khi chọn
      setShipSearchText('');
      
      message.success(`Đã chọn chuyến tàu: ${selectedSchedule.shipName}`);
    } else {
      message.error('Không tìm thấy thông tin chuyến tàu');
    }
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

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : null,
        ETD: values.ETD ? values.ETD.format('YYYY-MM-DD') : null,
        ETA: values.ETA ? values.ETA.format('YYYY-MM-DD') : null,
        untilDate: values.untilDate ? values.untilDate.format('YYYY-MM-DD') : null,
        returnDate: values.returnDate ? values.returnDate.format('YYYY-MM-DD') : null,
        billingDate: values.billingDate ? values.billingDate.format('YYYY-MM-DD') : null,
      };

      if (editingRecord) {
        await updateContainer(editingRecord._id, submitData);
        message.success('Cập nhật container thành công');
      } else {
        await createContainer(submitData);
        message.success('Tạo container thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchContainers(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      message.error(editingRecord ? 'Lỗi khi cập nhật container' : 'Lỗi khi tạo container');
    }
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

  const columns = [
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
      title: 'KV or KH',
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
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={containers}
          loading={loading}
          rowKey="_id"
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

      {/* Modal Form */}
      <Modal
        title={editingRecord ? 'Chỉnh Sửa Container' : 'Thêm Container Mới'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setShipSearchText('');
          fetchShipSchedules(''); // Load lại tất cả khi đóng modal
        }}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Ngày đóng"
                name="date"
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Số Container"
                name="containerNumber"
              >
                <Input placeholder="Nhập số container" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Loại Container"
                name="contType"
              >
                <Select placeholder="Chọn loại container">
                  {containerFilters.contType.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Line"
                name="line"
              >
                <Input placeholder="Nhập Line" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Khách Hàng"
                name="customer"
                rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
              >
                <Select 
                  placeholder="Chọn khách hàng"
                  showSearch
                  filterOption={(input, option) => {
                    const searchText = `${option.label}`.toLowerCase();
                    return searchText.includes(input.toLowerCase());
                  }}
                >
                  {customers.map(customer => (
                    <Option 
                      key={customer._id} 
                      value={customer._id}
                      label={`${customer.shortName} - ${customer.name}`}
                    >
                      {customer.shortName} - {customer.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Nhân Viên KD"
                name="salesPerson"
              >
                <Input placeholder="Nhập nhân viên kinh doanh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Loại Đóng Hàng"
                name="closeCombination"
              >
                <Select placeholder="Chọn loại đóng hàng">
                  {containerFilters.closeCombination.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Mặt Hàng"
                name="item"
              >
                <Input placeholder="Nhập mặt hàng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Chiều Vận Chuyển"
                name="transportDirection"
              >
                <Select placeholder="Chọn chiều vận chuyển">
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
                label="Điểm Đóng"
                name="closingPoint"
              >
                <Input placeholder="Nhập điểm đóng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Đội Đóng"
                name="fleetClosed"
              >
                <Input placeholder="Nhập đội đóng" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Điểm Trả"
                name="returnPoint"
              >
                <Input placeholder="Nhập điểm trả" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Đội Trả"
                name="fleetReturned"
              >
                <Input placeholder="Nhập đội trả" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="PTVC"
                name="PTVC"
              >
                <Input placeholder="Phương tiện vận chuyển" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Chuyến Tàu"
                name="trainTrip"
              >
                <Input placeholder="Nhập chuyến tàu" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="HĐ/BK"
                name="bill"
              >
                <Select placeholder="Chọn loại bill">
                  {containerFilters.bill.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Thêm section chọn chuyến tàu */}
          <Divider orientation="left">Chọn Chuyến Tàu (Tùy chọn)</Divider>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Tìm và chọn chuyến tàu</span>
                    <Tooltip title="Chọn chuyến tàu để tự động điền thông tin Chuyến tàu, ETD và ETA">
                      <InfoCircleOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                  </div>
                }
              >
                <Select
                  showSearch
                  placeholder="Tìm kiếm và chọn chuyến tàu..."
                  value={shipSearchText || undefined}
                  onSearch={handleShipSearch}
                  onSelect={handleShipSelect}
                  onClear={() => {
                    setShipSearchText('');
                    fetchShipSchedules(''); // Load lại tất cả khi clear
                  }}
                  allowClear
                  filterOption={false} // Quan trọng: tắt filter client-side
                  style={{ width: '100%' }}
                  dropdownStyle={{ maxHeight: 300 }}
                  loading={loading} // Thêm loading state
                  notFoundContent={
                    loading ? (
                      <div style={{ textAlign: 'center', padding: 20 }}>
                        <Text type="secondary">Đang tìm kiếm...</Text>
                      </div>
                    ) : shipSearchText ? (
                      <div style={{ textAlign: 'center', padding: 20 }}>
                        <Text type="secondary">
                          Không tìm thấy chuyến tàu với từ khóa "{shipSearchText}"
                        </Text>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 20 }}>
                        <Text type="secondary">Nhập tên tàu để tìm kiếm</Text>
                      </div>
                    )
                  }
                >
                  {filteredShipSchedules.map(schedule => (
                    <Option 
                      key={schedule._id} 
                      value={schedule._id}
                      title={formatShipScheduleOption(schedule)}
                    >
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ fontWeight: 500, color: '#1890ff' }}>
                          {schedule.shipName || 'Không có tên'}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          ETD: {schedule.ETD ? dayjs(schedule.ETD).format('DD/MM/YYYY') : 'N/A'} | 
                          ETA: {schedule.ETA ? dayjs(schedule.ETA).format('DD/MM/YYYY') : 'N/A'}
                        </div>
                        {schedule.note && (
                          <div style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>
                            {schedule.note}
                          </div>
                        )}
                      </div>
                    </Option>
                  ))}
                </Select>
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  {shipSearchText ? 
                    `Tìm thấy ${filteredShipSchedules.length} chuyến tàu với từ khóa "${shipSearchText}"` :
                    `Có ${shipSchedules.length} chuyến tàu`
                  }
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="ETD"
                name="ETD"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Ngày tàu chạy" 
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="ETA"
                name="ETA"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Ngày tàu đến" 
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Ngày Lưu Đến"
                name="untilDate"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Ngày Trả Hàng"
                name="returnDate"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Ngày Lập"
                name="billingDate"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row justify="end">
            <Space>
              <Button onClick={() => {
                setIsModalVisible(false);
                setShipSearchText('');
                fetchShipSchedules(''); // Load lại tất cả khi đóng modal
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRecord ? 'Cập Nhật' : 'Tạo Mới'}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>

      {/* Modal Chọn Khoảng Ngày */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SyncOutlined style={{ color: '#1890ff' }} />
            <span>Chọn Khoảng Ngày Lấy Dữ Liệu</span>
          </div>
        }
        visible={isDateRangeModalVisible}
        onCancel={() => {
          setIsDateRangeModalVisible(false);
          setDateRange({ startDate: null, endDate: null });
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setIsDateRangeModalVisible(false);
              setDateRange({ startDate: null, endDate: null });
            }}
          >
            Hủy
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            onClick={handleConfirmDateRange}
            loading={loading}
          >
            Lấy Dữ Liệu
          </Button>
        ]}
        width={500}
      >
        <div style={{ padding: '20px 0' }}>
          <Alert
            message="Chọn khoảng ngày để lấy dữ liệu từ Điều hành vận tải"
            description="Nếu không chọn ngày, hệ thống sẽ lấy tất cả dữ liệu có sẵn."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Từ ngày:</Text>
              </div>
              <DatePicker
                placeholder="Chọn ngày bắt đầu"
                style={{ width: '100%' }}
                value={dateRange.startDate}
                onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Đến ngày:</Text>
              </div>
              <DatePicker
                placeholder="Chọn ngày kết thúc"
                style={{ width: '100%' }}
                value={dateRange.endDate}
                onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
                format="DD/MM/YYYY"
                disabledDate={(current) => {
                  return dateRange.startDate && current && current < dateRange.startDate;
                }}
              />
            </Col>
          </Row>
          
          {dateRange.startDate && dateRange.endDate && (
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
              <Text type="success">
                <CheckCircleOutlined /> Sẽ lấy dữ liệu từ {dateRange.startDate.format('DD/MM/YYYY')} đến {dateRange.endDate.format('DD/MM/YYYY')}
              </Text>
            </div>
          )}
          
          {(!dateRange.startDate && !dateRange.endDate) && (
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: 6 }}>
              <Text type="warning">
                <InfoCircleOutlined /> Sẽ lấy tất cả dữ liệu có sẵn
              </Text>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Kết Quả */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span>Lấy dữ liệu Container từ Điều hành vận tải</span>
          </div>
        }
        visible={isResultModalVisible}
        onCancel={() => setIsResultModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsResultModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {createResult && (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card>
                  <Statistic 
                    title="Tổng Đơn Xử Lý" 
                    value={createResult.data?.totalProcessed || 0}
                    prefix={<InfoCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic 
                    title="Thành Công" 
                    value={createResult.data?.successCount || 0}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic 
                    title="Thất Bại" 
                    value={createResult.data?.failedCount || 0}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Alert
              message={createResult.message}
              type={createResult.data?.successCount > 0 ? 'success' : 'warning'}
              showIcon
              style={{ marginBottom: 16 }}
            />


            {/* Chi tiết kết quả */}
            {createResult.data?.results && createResult.data.results.length > 0 && (
              <Card title="Chi Tiết Kết Quả" size="small">
                <List
                  size="small"
                  dataSource={createResult.data.results}
                  pagination={{ pageSize: 5, size: 'small' }}
                  renderItem={(item) => (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <Row justify="space-between" align="middle">
                          <Col span={6}>
                            <Text strong>{item.containerNumber || 'N/A'}</Text>
                          </Col>
                          <Col span={4}>
                            <Tag color={item.success ? 'green' : 'red'}>
                              {item.success ? (
                                <><CheckCircleOutlined /> Thành công</>
                              ) : (
                                <><CloseCircleOutlined /> Thất bại</>
                              )}
                            </Tag>
                          </Col>
                          <Col span={14}>
                            <Text 
                              type={item.success ? 'success' : 'danger'}
                              style={{ fontSize: '12px' }}
                            >
                              {item.message}
                            </Text>
                            {item.closingPoint && (
                              <div>
                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                  Điểm đóng: {item.closingPoint}
                                </Text>
                              </div>
                            )}
                          </Col>
                        </Row>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContainerPage;