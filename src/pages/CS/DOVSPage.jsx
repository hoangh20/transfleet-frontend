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
  Tooltip,
  Select,
  Tag,
} from 'antd';
import {
  EditOutlined,
  SearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Highlighter from 'react-highlight-words';
import {
  getAllContainersWithCosts,
  updateContainerCost,
  getContainerFilterOptions,
} from '../../services/CSSevice';
import { getAllCustomersWithoutPagination } from '../../services/CustomerService';
import DovsFormModal from '../../components/CS/DovsFormModal';

const { Option } = Select;

const DOVSPage = () => {
  const [containers, setContainers] = useState([]);
  const [, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 25,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [filters, setFilters] = useState({});

  const [, setFilterOptions] = useState({
    lines: [],
    items: [],
    salesPersons: [],
    trainTrips: [],
    PTVCs: []
  });
  const [selectionType] = useState('radio');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    fetchContainers();
    fetchCustomers();
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await getContainerFilterOptions();
      setFilterOptions(response.data);
    } catch (error) {
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

  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

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

  const getColumnSearchProps = (dataIndex, placeholder = '') => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
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

    setFilters(apiFilters);
    fetchContainers(paginationConfig.current, paginationConfig.pageSize, apiFilters);
  };

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


  const handleSelectionChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys);
    if (selectedRows.length > 0) {
      const selectedContainer = selectedRows[0];
      message.success(`Đã chọn container: ${selectedContainer.containerNumber || 'N/A'}`);
    }
  };

  const handleClearSelection = () => {
    setSelectedRowKeys([]);
    message.info('Đã bỏ chọn container');
  };

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
      title: 'Loại cont',
      dataIndex: 'containerType',
      key: 'containerType',
      width: 100,
      render: (text) => text || 'N/A',
      ...getColumnSearchProps('containerType', 'Tìm loại cont'),
    },
    {
      title: 'KV/KH',
      dataIndex: 'closeCombination',
      key: 'closeCombination',
      width: 90,
      render: (type) => {
        const typeMap = { 0: 'Gắp vỏ', 1: 'Kết hợp' };
        const color = type === 0 ? 'blue' : 'green';
        return <Tag color={color}>{typeMap[type] || 'N/A'}</Tag>;
      },
    },
    {
      title: 'PTVC',
      dataIndex: 'PTVC',
      key: 'PTVC',
      width: 100,
      render: (text) => text || 'N/A',
      ...getColumnSearchProps('PTVC', 'Tìm PTVC'),
    },
    {
      title: 'Chiều',
      dataIndex: 'chieu',
      key: 'chieu',
      width: 80,
      render: (text) => text || 'N/A',
      ...getColumnSearchProps('chieu', 'Tìm chiều'),
    },
    {
      title: 'Mặt hàng',
      dataIndex: 'item',
      key: 'item',
      width: 100,
      render: (text) => text || 'N/A',
      ...getColumnSearchProps('item', 'Tìm mặt hàng'),
    },
    {
      title: 'Điểm đóng',
      dataIndex: 'closingPoint',
      key: 'closingPoint',
      width: 120,
      render: (text) => text || 'N/A',
      ...getColumnSearchProps('closingPoint', 'Tìm điểm đóng'),
    },
    {
      title: 'Tên Tàu',
      dataIndex: 'shipName',
      key: 'shipName',
      width: 120,
      render: (text) => text || 'N/A',
      ...getColumnSearchProps('shipName', 'Tìm tên tàu'),
    },
    {
      title: 'Line',
      dataIndex: 'line',
      key: 'line',
      width: 90,
      render: (text) => text || 'N/A',
      ...getColumnSearchProps('line', 'Tìm Line'),
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
      ...getColumnSearchProps('customer', 'Tìm khách hàng'),
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
      ...getNumberRangeFilterProps('cuocBien', 'Cước biển'),
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
      ...getNumberRangeFilterProps('phiDOVS', 'Phí DOVS'),
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
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0 }}>Quản Lý Cước Biển & Phí DOVS</h2>
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
            x: 1500,
            y: 'calc(130vh - 550px)'
          }}
          size="small"
          sticky={{
            offsetHeader: 0,
          }}
        />
      </div>

      <DovsFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleFormSubmit}
        editingRecord={editingRecord}
        loading={loading}
      />

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
        .selected-row .ant-table-cell-fix-left {
          background: #e6f7ff !important;
          z-index: 12 !important;
        }
        .selected-row .ant-table-cell-fix-right {
          background: #e6f7ff !important;
          z-index: 12 !important;
        }
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
        .ant-table-body {
          overflow-x: auto !important;
          overflow-y: auto !important;
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
        .ant-table-cell-fix-left-last::after,
        .ant-table-cell-fix-right-first::after {
          z-index: 11 !important;
        }
      `}</style>
    </div>
  );
};

export default DOVSPage;