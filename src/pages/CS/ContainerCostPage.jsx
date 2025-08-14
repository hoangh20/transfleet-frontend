import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Row,
  Col,
  message,
  Tag,
  Tooltip,
  Select,

} from 'antd';
import {
  EditOutlined,
  SearchOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Highlighter from 'react-highlight-words';
import {
  getAllContainersWithCosts,
  updateContainerCost,
  containerFilters,
  getContainerFilterOptions, // Thêm import này
} from '../../services/CSSevice';
import { getAllCustomersWithoutPagination } from '../../services/CustomerService';
import ContainerCostFormModal from '../../components/CS/ContainerCostFormModal';
import ExcelUploadModal from '../../components/CS/ExcelUploadModal';

const { Option } = Select; 

const ContainerCostPage = () => {
  const [containers, setContainers] = useState([]);
  const [customers, setCustomers] = useState([]);
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
    PTVCs: []
  });
  // State cho selection type và selected keys
  const [selectionType, ] = useState('radio');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Add state for upload modal
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);

  useEffect(() => {
    fetchContainers();
    fetchCustomers();
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
      const response = await getAllContainersWithCosts(page, pageSize, filterParams);
      setContainers(response.data || []);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách container và chi phí');
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

  // Format currency helper
  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };
  // Hàm filter cho số (range và dấu)
const getNumberRangeFilterProps = (dataIndex, label) => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
    const [from, to, sign] = selectedKeys[0] || [undefined, undefined, undefined];
    return (
      <div style={{ padding: 8, minWidth: 220 }}>
        <div style={{ marginBottom: 8 }}>
          <Input
            placeholder="Từ"
            type="number"
            value={from}
            onChange={e => setSelectedKeys([[e.target.value, to, sign]])}
            style={{ width: 90, marginRight: 8 }}
          />
          <Input
            placeholder="Đến"
            type="number"
            value={to}
            onChange={e => setSelectedKeys([[from, e.target.value, sign]])}
            style={{ width: 90 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <Select
            placeholder="Chọn dấu"
            value={sign}
            onChange={v => setSelectedKeys([[from, to, v]])}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="gt0">&gt; 0</Option>
            <Option value="lt0">&lt; 0</Option>
          </Select>
        </div>
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              confirm();
            }}
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
  onFilterDropdownVisibleChange: (visible) => {
    if (visible) setTimeout(() => searchInput.current?.select(), 100);
  },
  onFilter: () => true,
});

// Thêm function cho multi-select dropdown filter
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

  const getColumnCustomerSelectProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Select
          showSearch
          placeholder="Chọn khách hàng"
          style={{ width: 250, marginBottom: 8 }}
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
  
  // Currency column render with tooltip
  const renderCurrencyWithTooltip = (noVATAmount, vatAmount, label) => {
    if (!noVATAmount && !vatAmount) return '0 ';
    
    return (
      <Tooltip
        title={
          <div>
            <div>{label} (có VAT): {formatCurrency(vatAmount)}</div>
            <div>{label} (không VAT): {formatCurrency(noVATAmount)}</div>
          </div>
        }
      >
        <span style={{ cursor: 'help', whiteSpace: 'nowrap' }}>
          {formatCurrency(noVATAmount || vatAmount)}
        </span>
      </Tooltip>
    );
  };

  const handleTableChange = (paginationConfig, tableFilters, sorter) => {
    const apiFilters = {};

    Object.keys(tableFilters).forEach(key => {
      if (tableFilters[key] && tableFilters[key].length > 0) {
        if (key === 'customer.shortName') {
          apiFilters['customer'] = tableFilters[key][0];
        } else {
          apiFilters[key] = tableFilters[key];
        }
      }
    });

    // Filter cho cước bán
    if (tableFilters.cuocBan && tableFilters.cuocBan[0]) {
      const [from, to, sign] = tableFilters.cuocBan[0];
      if (from !== undefined && from !== '') apiFilters.cuocBanFrom = from;
      if (to !== undefined && to !== '') apiFilters.cuocBanTo = to;
      if (sign) apiFilters.cuocBanSign = sign;
    }

    // Filter cho tổng chi phí hoạt động
    if (tableFilters.tongChiPhiNoVAT && tableFilters.tongChiPhiNoVAT[0]) {
      const [from, to, sign] = tableFilters.tongChiPhiNoVAT[0];
      if (from !== undefined && from !== '') apiFilters.tongChiPhiNoVATFrom = from;
      if (to !== undefined && to !== '') apiFilters.tongChiPhiNoVATTo = to;
      if (sign) apiFilters.tongChiPhiNoVATSign = sign;
    }
    // Filter cho lợi nhuận
    if (tableFilters.loiNhuan && tableFilters.loiNhuan[0]) {
      const [from, to, sign] = tableFilters.loiNhuan[0];
      if (from !== undefined && from !== '') apiFilters.loiNhuanFrom = from;
      if (to !== undefined && to !== '') apiFilters.loiNhuanTo = to;
      if (sign) apiFilters.loiNhuanSign = sign;
    }

    setFilters(apiFilters);
    fetchContainers(paginationConfig.current, paginationConfig.pageSize, apiFilters);
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

  const getColumnSelectProps = (dataIndex, options) => ({
    filters: options.map(option => ({
      text: option.label,
      value: option.value,
    })),
    onFilter: () => true,
  });

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (costData) => {
    try {
      await updateContainerCost(editingRecord._id, costData);
      message.success('Cập nhật chi phí container thành công');
      setIsModalVisible(false);
      fetchContainers(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      message.error('Lỗi khi cập nhật chi phí container');
    }
  };

  const handleUploadSuccess = () => {
    // Refresh data after successful upload
    fetchContainers(pagination.current, pagination.pageSize, filters);
    message.success('Dữ liệu đã được cập nhật');
  };

  // Handle selection change
  const handleSelectionChange = (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    setSelectedRowKeys(selectedRowKeys);
    
    if (selectedRows.length > 0) {
      const selectedContainer = selectedRows[0];
      message.success(`Đã chọn container: ${selectedContainer.containerNumber || 'N/A'}`);
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedRowKeys([]);
    message.info('Đã bỏ chọn container');
  };

  // Row class name for highlighting selected rows
  const getRowClassName = (record) => {
    const isSelected = selectedRowKeys.includes(record._id);
    return isSelected ? 'selected-row' : '';
  };

  const getColumns = () => [
    {
      title: 'Ngày',
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
      title: 'Line',
      dataIndex: 'line',
      key: 'line',
      width: 90,
      render: (text) => text || 'N/A',
      ...getColumnMultiSelectProps('line', filterOptions.lines, 'Chọn Line'), // Thay đổi từ search thành multi-select
    },
    {
      title: 'KH/KV',
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
      title: 'PTVC',
      dataIndex: 'PTVC',
      key: 'PTVC',
      width: 100,
      render: (text) => (
        <Tooltip title={text || 'N/A'}>
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
      ...getColumnMultiSelectProps('PTVC', filterOptions.PTVCs, 'Chọn PTVC'), 
    },
    {
      title: 'Mặt hàng',
      dataIndex: 'item',
      key: 'item',
      width: 100,
      render: (text) => (
        <Tooltip title={text || 'N/A'}>
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
      ...getColumnMultiSelectProps('item', filterOptions.items, 'Chọn mặt hàng'), 
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
      title: 'KD',
      dataIndex: 'salesPerson',
      key: 'salesPerson',
      width: 100,
      render: (text) => text || 'N/A',
      ...getColumnMultiSelectProps('salesPerson', filterOptions.salesPersons, 'Chọn KD'), 
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
      title: 'Chuyến tàu',
      dataIndex: 'trainTrip',
      key: 'trainTrip',
      width: 150,
      render: (text) => (
        <Tooltip title={text || 'N/A'}>
          <div style={{ 
            maxWidth: 140, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap'
          }}>
            {text || 'N/A'}
          </div>
        </Tooltip>
      ),
      ...getColumnMultiSelectProps('trainTrip', filterOptions.trainTrips, 'Chọn chuyến tàu'), 
    },
    {
      title: 'Đội xe đóng',
      dataIndex: 'fleetClosed',
      key: 'fleetClosed',
      width: 120,
      render: (text) => text || 'N/A',
      ...getColumnSearchProps('fleetClosed', 'Tìm đội đóng'),
    },
    {
      title: 'Số xe đóng',
      dataIndex: 'soXeDong',
      key: 'soXeDong',
      width: 120,
      render: (text) => text || 'N/A',
      ...getColumnSearchProps('soXeDong', 'Tìm số xe đóng'),
    },
    {
      title: 'Đội xe trả',
      dataIndex: 'fleetReturned',
      key: 'fleetReturned',
      width: 120,
      render: (text) => text || 'N/A',
      ...getColumnSearchProps('fleetReturned', 'Tìm đội trả'),
    },
    {
      title: 'Số xe trả',
      dataIndex: 'soXeTra',
      key: 'soXeTra',
      width: 120,
      render: (text) => text || 'N/A',
      ...getColumnSearchProps('soXeTra', 'Tìm số xe trả'),
    },
    {
      title: 'Cước bộ HP',
      dataIndex: ['containerCost', 'cuocBoHP'],
      key: 'cuocBoHP',
      width: 120,
      render: (amount) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {formatCurrency(amount)} 
        </span>
      ),
    },
    {
      title: 'Nâng vỏ/hàng Bắc',
      dataIndex: ['containerCost', 'nangBac'],
      key: 'nangBac',
      width: 140,
      render: (amount, record) => renderCurrencyWithTooltip(
        record.containerCost?.nangBacNoVAT,
        amount,
        'Nâng Bắc'
      ),
    },
    {
      title: 'Hạ vỏ/hàng Bắc',
      dataIndex: ['containerCost', 'haBac'],
      key: 'haBac',
      width: 140,
      render: (amount, record) => renderCurrencyWithTooltip(
        record.containerCost?.haBacNoVAT,
        amount,
        'Hạ Bắc'
      ),
    },
    {
      title: 'Cước biển',
      dataIndex: ['containerCost', 'cuocBien'],
      key: 'cuocBien',
      width: 120,
      render: (amount, record) => renderCurrencyWithTooltip(
        record.containerCost?.cuocBienNoVAT,
        amount,
        'Cước biển'
      ),
    },
    {
      title: 'Phí DOVS',
      dataIndex: ['containerCost', 'phiDOVS'],
      key: 'phiDOVS',
      width: 120,
      render: (amount, record) => renderCurrencyWithTooltip(
        record.containerCost?.phiDOVSNoVAT,
        amount,
        'Phí DOVS'
      ),
    },
    {
      title: 'Nâng hàng/vỏ Nam',
      dataIndex: ['containerCost', 'nangNam'],
      key: 'nangNam',
      width: 140,
      render: (amount, record) => renderCurrencyWithTooltip(
        record.containerCost?.nangNamNoVAT,
        amount,
        'Nâng Nam'
      ),
    },
    {
      title: 'Hạ hàng/vỏ Nam',
      dataIndex: ['containerCost', 'haNam'],
      key: 'haNam',
      width: 140,
      render: (amount, record) => renderCurrencyWithTooltip(
        record.containerCost?.haNamNoVAT,
        amount,
        'Hạ Nam'
      ),
    },
    {
      title: 'Cước bộ HCM',
      dataIndex: ['containerCost', 'cuocBoHCM'],
      key: 'cuocBoHCM',
      width: 120,
      render: (amount) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {formatCurrency(amount)} 
        </span>
      ),
    },
    {
      title: 'Bốc xếp HCM',
      dataIndex: ['containerCost', 'bocXepHCM'],
      key: 'bocXepHCM',
      width: 120,
      render: (amount) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {formatCurrency(amount)} 
        </span>
      ),
    },
    {
      title: 'Com',
      dataIndex: ['containerCost', 'com'],
      key: 'com',
      width: 100,
       render: (amount) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {formatCurrency(amount)} 
        </span>
      ),
    },
    {
      title: 'Chi phí phát sinh',
      dataIndex: ['containerCost', 'phatSinh'],
      key: 'phatSinh',
      width: 140,
      render: (amount) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {formatCurrency(amount)} 
        </span>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: ['containerCost', 'cuocBanNoVAT'],
      key: 'cuocBan',
      width: 120,
      render: (amount, record) => renderCurrencyWithTooltip(
        amount,
        record.containerCost?.cuocBan,
        'Doanh thu'
      ),
      ...getNumberRangeFilterProps('cuocBan', 'Doanh thu'),
    },
    {
      title: 'Tổng Chi phí',
      dataIndex: ['containerCost', 'tongChiPhiNoVAT'],
      key: 'tongChiPhiNoVAT',
      width: 120,
      render: (amount, record) => (
        <Tooltip
          title={
            <div>
              <div>Tổng chi phí (có VAT): {formatCurrency(record.containerCost?.tongChiPhi)} </div>
              <div>Tổng chi phí (không VAT): {formatCurrency(amount)} </div>
            </div>
          }
        >
          <span style={{ whiteSpace: 'nowrap', fontWeight: 'bold', color: '#f50' }}>
            {formatCurrency(amount)} 
          </span>
        </Tooltip>
      ),
      ...getNumberRangeFilterProps('tongChiPhiNoVAT', 'Tổng chi phí'),
    },
    {
      title: 'Lợi nhuận',
      key: 'loiNhuan',
      width: 120,
      render: (_, record) => {
        const profit = (record.containerCost?.cuocBanNoVAT || 0) - (record.containerCost?.tongChiPhiNoVAT || 0);
        const profitWithVAT = (record.containerCost?.cuocBan || 0) - (record.containerCost?.tongChiPhi || 0);
        return (
          <Tooltip
            title={
              <div>
                <div>Lợi nhuận (có VAT): {formatCurrency(profitWithVAT)} </div>
                <div>Lợi nhuận (không VAT): {formatCurrency(profit)} </div>
              </div>
            }
          >
            <span style={{ 
              whiteSpace: 'nowrap', 
              fontWeight: 'bold',
              color: profit >= 0 ? '#52c41a' : '#f50'
            }}>
              {formatCurrency(profit)} 
            </span>
          </Tooltip>
        );
      },
          ...getNumberRangeFilterProps('loiNhuan', 'Lợi nhuận'),
    },
    {
      title: 'Tháng chốt BK',
      dataIndex: 'date',
      key: 'month',
      width: 100,
      render: (date) => {
        if (!date) return 'N/A';
        return (
          <span style={{ whiteSpace: 'nowrap' }}>
            {dayjs(date).format('MM/YYYY')}
          </span>
        );
      },
    },
    {
      title: 'BK / HĐ',
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
      title: 'Hành Động',
      key: 'actions',
      width: 110,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa chi phí">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Row selection configuration
  const rowSelection = {
    type: selectionType,
    selectedRowKeys: selectedRowKeys,
    onChange: handleSelectionChange,
    getCheckboxProps: (record) => ({
      name: record.containerNumber,
    }),
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0 }}>Quản Lý Chi Phí Container</h2>
            {/* Hiển thị thông tin container được chọn */}
            {selectedRowKeys.length > 0 && (
              <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                Đang chọn: {containers.find(c => c._id === selectedRowKeys[0])?.containerNumber || 'N/A'}
                <Button 
                  type="link" 
                  size="small" 
                  onClick={handleClearSelection}
                  style={{ padding: '0 8px', fontSize: '12px' }}
                >
                  (Bỏ chọn)
                </Button>
              </div>
            )}
          </Col>
          <Col>
            <Space>
              <Button
                type="default"
                icon={<UploadOutlined />}
                onClick={() => setIsUploadModalVisible(true)}
              >
                Tải dữ liệu lên
              </Button>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={() => fetchContainers(pagination.current, pagination.pageSize, filters)}
                loading={loading}
              >
                Làm mới
              </Button>
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
            x: 3000, // Tổng width của tất cả columns 
            y: 'calc(130vh - 550px)' 
          }}
          size="small"
          sticky={{
            offsetHeader: 0, // Sticky header
          }}
        />
      </div>

      {/* Cost Form Modal */}
      <ContainerCostFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleFormSubmit}
        editingRecord={editingRecord}
        loading={loading}
      />

      {/* Excel Upload Modal */}
      <ExcelUploadModal
        visible={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        onSuccess={handleUploadSuccess}
      />

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
      `}</style>
    </div>
  );
};

export default ContainerCostPage;