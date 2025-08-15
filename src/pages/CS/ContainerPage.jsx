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
  Modal,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SyncOutlined,
  ExportOutlined,
  LinkOutlined,
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
  bulkUpdateContainers,
  getContainerFilterOptions,
  exportContainerToSheets,
  bulkExportContainersToSheets,
} from '../../services/CSSevice';
import { getAllCustomersWithoutPagination } from '../../services/CustomerService';

// Import các modal components
import ContainerFormModal from '../../components/CS/ContainerFormModal';
import DateRangeModal from '../../components/CS/DateRangeModal';
import ResultModal from '../../components/CS/ResultModal';
import BulkUpdateModal from '../../components/CS/BulkUpdateModal';

const { Option } = Select;

const ContainerPage = () => {
  const [form] = Form.useForm();
  const [containers, setContainers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [shipSchedules, setShipSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 25,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  // States cho search và filter
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [filters, setFilters] = useState({});
  
  // Thêm state cho filter options từ API
  const [filterOptions, setFilterOptions] = useState({
    lines: [],
    items: [],
    salesPersons: [],
    trainTrips: [],
    PTVCs: [],
    maKhach: [],
    notes: []
  });
  
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

  // Thêm state cho selection type và selected keys
  const [selectionType, setSelectionType] = useState('radio');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Thêm state cho export
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [isExportResultModalVisible, setIsExportResultModalVisible] = useState(false);

  useEffect(() => {
    fetchContainers();
    fetchCustomers();
    fetchShipSchedules('');
    fetchFilterOptions(); // Thêm gọi API filter options
  }, []);

  // Thêm function fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await getContainerFilterOptions();
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Lỗi khi tải filter options:', error);
      message.error('Lỗi khi tải danh sách bộ lọc');
    }
  };

  const fetchContainers = async (page = 1, pageSize = 25, filterParams = {}) => {
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

  const fetchShipSchedules = async (searchTerm = '') => {
    try {
      const filters = searchTerm ? { shipName: searchTerm } : {};
      const response = await getAllShipSchedulesNoPagination(filters);
      console.log('Ship schedules response:', response);
      
      const schedules = response.data || [];
      console.log('Schedules data:', schedules);
      
      setShipSchedules(schedules);
      setFilteredShipSchedules(schedules);
    } catch (error) {
      console.error('Lỗi khi tải danh sách chuyến tàu:', error);
      message.error('Lỗi khi tải danh sách chuyến tàu');
    }
  };

  const handleShipSearch = async (value) => {
    console.log('Search value:', value);
    setShipSearchText(value);
    
    if (!value || value.trim() === '') {
      // Nếu không có search term, load tất cả
      await fetchShipSchedules('');
      return;
    }

    // Gọi API với search term
    await fetchShipSchedules(value.trim());
  };

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
          // Gửi mảng cho các field hỗ trợ multiple selection
          apiFilters[key] = tableFilters[key];
        }
      }
    });

    setFilters(apiFilters);
    fetchContainers(paginationConfig.current, paginationConfig.pageSize, apiFilters);
  };

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
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSearchText('');
    
    const newFilters = { ...filters };
    delete newFilters[dataIndex];
    
    setFilters(newFilters);
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

  // Tạo dropdown filter cho các field có nhiều options
  const getColumnMultiSelectProps = (dataIndex, options, placeholder = '') => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8, minWidth: 220 }} onKeyDown={(e) => e.stopPropagation()}>
        <Select
          mode="multiple"
          placeholder={placeholder || `Chọn ${dataIndex}`}
          style={{ width: '100%', marginBottom: 8 }}
          value={selectedKeys}
          onChange={(values) => {
            setSelectedKeys(values || []);
          }}
          allowClear
          showSearch
          optionFilterProp="children"
          maxTagCount="responsive"
        >
          {options.map(option => (
            <Option key={option} value={option}>
              {option === 'empty' ? '(Trống)' : option}
            </Option>
          ))}
        </Select>
        <div>
          <Space>
            <Button
              type="primary"
              onClick={() => handleMultiSelectSearch(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters && handleMultiSelectReset(clearFilters, dataIndex)}
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
  });

  const handleMultiSelectSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    
    const newFilters = { ...filters };
    if (selectedKeys && selectedKeys.length > 0) {
      newFilters[dataIndex] = selectedKeys;
    } else {
      delete newFilters[dataIndex];
    }
    
    setFilters(newFilters);
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

  const handleMultiSelectReset = (clearFilters, dataIndex) => {
    clearFilters();
    
    const newFilters = { ...filters };
    delete newFilters[dataIndex];
    
    setFilters(newFilters);
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

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
    
    setShipSearchText('');
    fetchShipSchedules('');
    
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
    
    setShipSearchText('');
    fetchShipSchedules('');
    
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

  const handleFormModalCancel = () => {
    setIsModalVisible(false);
    setShipSearchText('');
    fetchShipSchedules('');
  };

  const handleDateRangeModalCancel = () => {
    setIsDateRangeModalVisible(false);
    setDateRange({ startDate: null, endDate: null });
  };

  const handleCreateFromPackingOrders = () => {
    setIsDateRangeModalVisible(true);
  };

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

  const getColumnDateRangeSearchProps = (dataIndex, placeholder = '') => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => {
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

  const handleDateRangeSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    
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
      delete newFilters[`${dataIndex}Start`];
      delete newFilters[`${dataIndex}End`];
    }
    
    setFilters(newFilters);
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

  const handleDateRangeReset = (clearFilters, dataIndex) => {
    clearFilters();
    
    const newFilters = { ...filters };
    delete newFilters[`${dataIndex}Start`];
    delete newFilters[`${dataIndex}End`];
    
    setFilters(newFilters);
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

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

  const handleCustomerSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    
    const newFilters = { ...filters };
    if (selectedKeys[0]) {
      newFilters[dataIndex] = selectedKeys[0];
    } else {
      delete newFilters[dataIndex];
    }
    
    setFilters(newFilters);
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

  const handleCustomerReset = (clearFilters, dataIndex) => {
    clearFilters();
    
    const newFilters = { ...filters };
    delete newFilters[dataIndex];
    
    setFilters(newFilters);
    fetchContainers(pagination.current, pagination.pageSize, newFilters);
  };

  const handleBulkUpdateToggle = () => {
    setBulkUpdateMode(!bulkUpdateMode);
    setSelectedContainers([]);
    setSelectedRowKeys([]);
    setSelectionType(bulkUpdateMode ? 'radio' : 'checkbox');
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

  // Handle selection change
  const handleSelectionChange = (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    
    if (bulkUpdateMode) {
      setSelectedContainers(selectedRowKeys);
    } else {
      setSelectedRowKeys(selectedRowKeys);
      if (selectedRows.length > 0) {
        const selectedContainer = selectedRows[0];
        message.success(`Đã chọn container: ${selectedContainer.containerNumber || 'N/A'}`);
      }
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedRowKeys([]);
    setSelectedContainers([]);
    message.info('Đã bỏ chọn container');
  };

  // Row class name for highlighting selected rows
  const getRowClassName = (record) => {
    const isSelected = bulkUpdateMode 
      ? selectedContainers.includes(record._id)
      : selectedRowKeys.includes(record._id);
    
    return isSelected ? 'selected-row' : '';
  };

  // Handle single container export
  const handleExportContainer = async (container, forceReExport = false) => {
    try {
      setIsExporting(true);
      const result = await exportContainerToSheets(container._id, forceReExport);
      
      message.success(`Container ${container.containerNumber} đã được export thành công`);
      
      // Refresh container data to update writeToSheet status
      fetchContainers(pagination.current, pagination.pageSize, filters);
      
      return result;
    } catch (error) {
      message.error(`Lỗi khi export container: ${error.message}`);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  // Handle bulk export with confirmation
  const handleBulkExport = () => {
    if (selectedContainers.length === 0) {
      message.warning('Vui lòng chọn ít nhất một container để export');
      return;
    }

    // Check how many containers already exported
    const selectedContainerData = containers.filter(c => selectedContainers.includes(c._id));
    const alreadyExported = selectedContainerData.filter(c => c.writeToSheet === 1);
    const notExported = selectedContainerData.filter(c => c.writeToSheet !== 1);

    let content;
    if (alreadyExported.length === 0) {
      content = (
        <div>
          <p>Bạn có chắc chắn muốn export <strong>{selectedContainers.length} container</strong> vào Google Sheets?</p>
          <p>Các containers sẽ được export vào 2 sheet:</p>
          <ul>
            <li>Tổng hợp đóng trả</li>
            <li>Chi phí chi tiết</li>
          </ul>
        </div>
      );
    } else {
      content = (
        <div>
          <p>Trong <strong>{selectedContainers.length} container</strong> đã chọn:</p>
          <ul>
            <li style={{ color: '#52c41a' }}><strong>{notExported.length}</strong> container chưa export</li>
            <li style={{ color: '#fa8c16' }}><strong>{alreadyExported.length}</strong> container đã export trước đó</li>
          </ul>
          <p>Bạn muốn:</p>
          <div style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                block 
                onClick={() => executeBulkExport(false)}
                style={{ textAlign: 'left' }}
              >
                Chỉ export {notExported.length} container chưa export
              </Button>
              <Button 
                type="primary" 
                danger 
                block 
                onClick={() => executeBulkExport(true)}
                style={{ textAlign: 'left' }}
              >
                Export lại tất cả {selectedContainers.length} container
              </Button>
            </Space>
          </div>
        </div>
      );
    }

    if (alreadyExported.length === 0) {
      Modal.confirm({
        title: 'Xác nhận Export vào Google Sheets',
        content,
        okText: 'Export',
        cancelText: 'Hủy',
        onOk: () => executeBulkExport(false),
        width: 500,
      });
    } else {
      Modal.confirm({
        title: 'Xác nhận Export vào Google Sheets',
        content,
        footer: null,
        width: 500,
        closable: true,
      });
    }
  };

  // Execute bulk export
  const executeBulkExport = async (forceReExport = false) => {
    try {
      setIsExporting(true);
      Modal.destroyAll(); // Close all modals
      
      const result = await bulkExportContainersToSheets(selectedContainers, forceReExport);
      
      setExportResult(result);
      setIsExportResultModalVisible(true);
      
      // Refresh container data
      fetchContainers(pagination.current, pagination.pageSize, filters);
      
      // Reset selection
      setSelectedContainers([]);
      setBulkUpdateMode(false);
      
    } catch (error) {
      message.error(`Lỗi khi bulk export: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle single export with confirmation
  const showExportConfirm = (record) => {
    const isAlreadyExported = record.writeToSheet === 1;
    
    const content = isAlreadyExported ? (
      <div>
        <p>Container <strong>{record.containerNumber}</strong> đã được export trước đó.</p>
        <p>Bạn có muốn export lại (tạo dữ liệu mới trong sheet)?</p>
        <p style={{ color: '#fa8c16', fontSize: '12px' }}>
          <strong>Lưu ý:</strong> Dữ liệu cũ trên Google Sheets sẽ không bị ghi đè mà sẽ được thêm mới vào cuối danh sách.
        </p>
      </div>
    ) : (
      <div>
        <p>Export container <strong>{record.containerNumber}</strong> vào Google Sheets?</p>
        <p>Container sẽ được thêm vào 2 sheet:</p>
        <ul>
          <li>Tổng hợp đóng trả</li>
          <li>Chi phí chi tiết</li>
        </ul>
      </div>
    );

    Modal.confirm({
      title: isAlreadyExported ? 'Export lại Container' : 'Export Container',
      content,
      okText: isAlreadyExported ? 'Export lại' : 'Export',
      okType: isAlreadyExported ? 'danger' : 'primary',
      cancelText: 'Hủy',
      onOk: () => handleExportContainer(record, isAlreadyExported),
      width: 450,
    });
  };

  // Update getColumns function to add export action
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
        render: (text, record) => (
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
        ...getColumnMultiSelectProps('line', filterOptions.lines || [], 'Chọn Line'),
      },
      {
        title: 'PTVC',
        dataIndex: 'PTVC',
        key: 'PTVC',
        width: 100,
        render: (text) => (
          <Tooltip title={text || ' '}>
            <div style={{ 
              maxWidth: 90, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {text || ' '}
            </div>
          </Tooltip>
        ),
        ...getColumnMultiSelectProps('PTVC', filterOptions.PTVCs || [], 'Chọn PTVC'),
      },
      {
        title: 'Kết hợp',
        dataIndex: 'closeCombination',
        key: 'closeCombination',
        width: 100,
        render: (type) => {
          const typeMap = { 0: 'Gắp vỏ', 1: 'Kết hợp' };
          const color = type === 0 ? 'blue' : 'green';
          return <Tag color={color}>{typeMap[type] || ' '}</Tag>;
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
          return <Tag color={color}>{dirMap[direction] || ' '}</Tag>;
        },
        ...getColumnSelectProps('transportDirection', containerFilters.transportDirection),
      },
      {
        title: 'Mặt hàng',
        dataIndex: 'item',
        key: 'item',
        width: 100,
        render: (text) => (
          <Tooltip title={text || ' '}>
            <div style={{ 
              maxWidth: 90, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {text || ' '}
            </div>
          </Tooltip>
        ),
        ...getColumnMultiSelectProps('item', filterOptions.items || [], 'Chọn mặt hàng'),
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
              {record.customer?.shortName || ' '}
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
        ...getColumnMultiSelectProps('salesPerson', filterOptions.salesPersons || [], 'Chọn KD'), 
      },
      {
        title: 'Điểm đóng',
        dataIndex: 'closingPoint',
        key: 'closingPoint',
        width: 120,
        ellipsis: true,
        render: (closingPoint) => (
          <span style={{ whiteSpace: 'nowrap' }}>
              {closingPoint || 'N/A'}
          </span>
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
        width: 120,
        ellipsis: true,
        render: (returnPoint) => (
        <span style={{ whiteSpace: 'nowrap' }}>
            {returnPoint || 'N/A'}
          </span>
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
        ...getColumnMultiSelectProps('trainTrip', filterOptions.trainTrips || [], 'Chọn chuyến tàu'), 
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
      title: 'Mã khách',
      dataIndex: 'maKhach',
      key: 'maKhach',
      width: 120,
      render: (text) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {text || ' '}
        </span>
      ),
      ...getColumnMultiSelectProps('maKhach', filterOptions.maKhach || [], 'Chọn mã khách hàng'),
      },
      {
        title: 'HĐ / BK',
        dataIndex: 'bill',
        key: 'bill',
        width: 80,
        render: (bill) => {
          if (bill === 2) {
            return null; // Không hiển thị gì khi bill = 2
          }
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
          if (!date) return ' ';
          return (
            <span style={{ whiteSpace: 'nowrap' }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </span>
          );
        },
        ...getColumnDateRangeSearchProps('billingDate', 'Chọn khoảng ngày bill'),
      },
      {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 150,
      render: (text) => (
        <Tooltip title={text || ' '}>
          <div style={{ 
            maxWidth: 140, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {text || ' '}
          </div>
        </Tooltip>
      ),
      ...getColumnMultiSelectProps('note', filterOptions.notes || [], 'Tìm ghi chú'),
      },
      {
        title: 'Hành Động',
        key: 'actions',
        width: 150,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="Export vào Google Sheets">
              <Button
                type="default"
                icon={<ExportOutlined />}
                size="small"
                onClick={() => showExportConfirm(record)}
                loading={isExporting}
                style={{ 
                  color: record.writeToSheet === 1 ? '#fa8c16' : '#52c41a',
                  borderColor: record.writeToSheet === 1 ? '#fa8c16' : '#52c41a'
                }}
              />
            </Tooltip>
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

  // Row selection configuration
  const rowSelection = {
    type: selectionType,
    selectedRowKeys: bulkUpdateMode ? selectedContainers : selectedRowKeys,
    onChange: handleSelectionChange,
    getCheckboxProps: (record) => ({
      name: record.containerNumber,
    }),
  };

  // Hàm mở Google Sheets
  const handleOpenGoogleSheets = () => {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/10iaQdl-N1DcO3TV_yUWOTenei_7UVEGAz46WuKXr708/edit?usp=sharing';
    window.open(sheetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0 }}>Quản Lý Container</h2>
            {/* Hiển thị thông tin container được chọn */}
            {(selectedRowKeys.length > 0 || selectedContainers.length > 0) && (
              <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                {bulkUpdateMode ? (
                  `Đã chọn ${selectedContainers.length} container`
                ) : (
                  selectedRowKeys.length > 0 && (
                    <>
                      Đang chọn: {containers.find(c => c._id === selectedRowKeys[0])?.containerNumber || 'N/A'}
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={handleClearSelection}
                        style={{ padding: '0 8px', fontSize: '12px' }}
                      >
                        (Bỏ chọn)
                      </Button>
                    </>
                  )
                )}
              </div>
            )}
          </Col>
          <Col>
            <Space>
              {/* Nút truy cập Google Sheets - luôn hiển thị */}
              <Tooltip title="Mở Google Sheets để xem dữ liệu đã export">
                <Button
                  type="default"
                  icon={<LinkOutlined />}
                  onClick={handleOpenGoogleSheets}
                  style={{
                    color: '#1890ff',
                    borderColor: '#1890ff',
                    background: '#f0f9ff'
                  }}
                >
                  Xem Google Sheets
                </Button>
              </Tooltip>

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
                    type="default"
                    icon={<ExportOutlined />}
                    onClick={handleBulkExport}
                    disabled={selectedContainers.length === 0}
                    loading={isExporting}
                    style={{ marginRight: 8 }}
                  >
                    Export {selectedContainers.length} cont vào Sheets
                  </Button>
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
      </Card>

      {/* Table với container có scroll ngang */}
      <div className="table-container-wrapper">
        <Table
          columns={getColumns()}
          dataSource={containers}
          loading={loading}
          rowKey="_id"
          rowSelection={rowSelection}
          rowClassName={getRowClassName}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['15', '25', '35', '50', '100'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} container`,
          }}
          onChange={handleTableChange}
          scroll={{ 
            x: 2600,
            y: 'calc(130vh - 550px)'
          }}
          size="small"
          sticky={{
            offsetHeader: 0,
          }}
        />
      </div>

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
        onShipSelect={handleShipSelect}
        shipSearchText={shipSearchText}
        selectedCount={selectedContainers.length}
        selectedContainerIds={selectedContainers}
        customers={customers}
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

      {/* Export Result Modal */}
      <Modal
        title="Kết quả Export vào Google Sheets"
        visible={isExportResultModalVisible}
        onCancel={() => setIsExportResultModalVisible(false)}
        footer={[
          <Button key="open-sheets" icon={<LinkOutlined />} onClick={handleOpenGoogleSheets}>
            Mở Google Sheets
          </Button>,
          <Button key="close" type="primary" onClick={() => setIsExportResultModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {exportResult && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">Tổng: {exportResult.data?.total || 0}</Tag>
              <Tag color="green">Thành công: {exportResult.data?.successful || 0}</Tag>
              <Tag color="red">Thất bại: {exportResult.data?.failed || 0}</Tag>
            </div>
            
            {/* Success message with link */}
            {exportResult.data?.successful > 0 && (
              <div style={{ 
                background: '#f6ffed', 
                border: '1px solid #b7eb8f', 
                borderRadius: 6, 
                padding: 12, 
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: '#52c41a', fontWeight: '500' }}>
                    ✅ Export thành công {exportResult.data.successful} container!
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                    Dữ liệu đã được thêm vào Google Sheets
                  </div>
                </div>
                <Button 
                  type="primary" 
                  size="small"
                  icon={<LinkOutlined />}
                  onClick={handleOpenGoogleSheets}
                >
                  Xem kết quả
                </Button>
              </div>
            )}
            
            {exportResult.data?.results && exportResult.data.results.length > 0 && (
              <Table
                dataSource={exportResult.data.results}
                columns={[
                  {
                    title: 'Container ID',
                    dataIndex: 'containerId',
                    key: 'containerId',
                    width: 150,
                    render: (id) => {
                      const container = containers.find(c => c._id === id);
                      return container?.containerNumber || id.slice(-8);
                    }
                  },
                  {
                    title: 'Trạng thái',
                    dataIndex: 'success',
                    key: 'success',
                    width: 100,
                    render: (success) => (
                      <Tag color={success ? 'green' : 'red'}>
                        {success ? 'Thành công' : 'Thất bại'}
                      </Tag>
                    )
                  },
                  {
                    title: 'Thông báo',
                    dataIndex: 'message',
                    key: 'message',
                    ellipsis: true,
                  },
                  {
                    title: 'Thời gian',
                    dataIndex: 'exportedAt',
                    key: 'exportedAt',
                    width: 150,
                    render: (time) => time ? dayjs(time).format('DD/MM/YYYY HH:mm:ss') : '-'
                  }
                ]}
                rowKey="containerId"
                pagination={{ pageSize: 10 }}
                size="small"
              />
            )}
          </div>
        )}
      </Modal>

       {/* CSS cho styling */}
      <style>{`
        .selected-row {
          background-color: #e6f7ff !important;
          border-left: 3px solid #1890ff !important;
        }
        .selected-row:hover {
          background-color: #bae7ff !important;
        }
        .selected-row td {
          background-color: #e6f7ff !important;
          border-color: #91d5ff !important;
        }
        .selected-row:hover td {
          background-color: #bae7ff !important;
        }
        
        /* Container wrapper cho table với scroll ngang */
        .table-container-wrapper {
          background: white;
          border-radius: 6px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
          overflow: hidden;
        }
        
        /* Sticky header styling - Z-index cao hơn để đè lên fixed columns */
        .ant-table-thead > tr > th {
          position: sticky !important;
          top: 0 !important;
          z-index: 15 !important;
          background: #fafafa !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        
        /* Fixed columns styling - Z-index thấp hơn sticky header */
        .ant-table-cell-fix-left,
        .ant-table-cell-fix-right {
          z-index: 12 !important;
        }
        
        /* Fixed left columns header - Z-index cao nhất */
        .ant-table-thead .ant-table-cell-fix-left {
          z-index: 16 !important;
          background: #fafafa !important;
        }
        
        /* Fixed right columns header */
        .ant-table-thead .ant-table-cell-fix-right {
          z-index: 16 !important;
          background: #fafafa !important;
        }
        
        /* Body fixed columns */
        .ant-table-tbody .ant-table-cell-fix-left {
          background: #fff !important;
          z-index: 12 !important;
        }
        
        .ant-table-tbody .ant-table-cell-fix-right {
          background: #fff !important;
          z-index: 12 !important;
        }
        
        /* Selected row fixed columns */
        .selected-row .ant-table-cell-fix-left {
          background: #e6f7ff !important;
          z-index: 12 !important;
        }
        
        .selected-row .ant-table-cell-fix-right {
          background: #e6f7ff !important;
          z-index: 12 !important;
        }
        
        /* Hover effect for fixed columns */
        .ant-table-tbody > tr:hover .ant-table-cell-fix-left {
          background-color: #f5f5f5 !important;
        }
        
        .ant-table-tbody > tr:hover .ant-table-cell-fix-right {
          background-color: #f5f5f5 !important;
        }
        
        .selected-row:hover .ant-table-cell-fix-left {
          background-color: #bae7ff !important;
        }
        
        .selected-row:hover .ant-table-cell-fix-right {
          background-color: #bae7ff !important;
        }
        
        /* Scroll container */
        .ant-table-body {
          overflow-x: auto !important;
          overflow-y: auto !important;
        }
        
        /* Pagination styling */
        .ant-pagination {
          padding: 16px !important;
          border-top: 1px solid #f0f0f0 !important;
          background: #fafafa !important;
          margin: 0 !important;
        }
        
        /* Table hover effect */
        .ant-table-tbody > tr:hover > td {
          background-color: #f5f5f5 !important;
        }
        
        /* Filter dropdown styling */
        .ant-table-filter-dropdown {
          border-radius: 6px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Fix shadow overlap for fixed columns */
        .ant-table-cell-fix-left-last::after,
        .ant-table-cell-fix-right-first::after {
          z-index: 11 !important;
        }

        /* Hover effect cho nút Google Sheets */
        .ant-btn:hover.ant-btn-default[style*="color: rgb(24, 144, 255)"] {
          background: #e6f7ff !important;
          border-color: #40a9ff !important;
          color: #096dd9 !important;
        }
      `}</style>
    </div>
  );
};

export default ContainerPage;