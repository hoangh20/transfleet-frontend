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
  Popconfirm,
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
  getAllContainerIncidentalCosts,
  deleteContainerIncidentalCost,
} from '../../services/CSSevice';
import ContainerIncidentalCostModal from '../../components/CS/ContainerIncidentalCostModal';

const ContainerIncidentalCost = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  // States cho search và filter
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [filters, setFilters] = useState({});

  // Mapping cho loại chi phí
  const costTypeOptions = [
    { value: 0, label: 'Phí quá tải', color: 'red' },
    { value: 1, label: 'Phát sinh lưu bãi', color: 'orange' },
    { value: 2, label: 'Sai tên mặt hàng', color: 'yellow' },
    { value: 3, label: 'Bốc xếp', color: 'blue' },
    { value: 4, label: 'Sửa chữa', color: 'purple' },
    { value: 5, label: 'Khác', color: 'default' },
  ];

  // Mapping cho trạng thái thanh toán
  const statusOptions = [
    { value: 0, label: 'Chưa thanh toán', color: 'red' },
    { value: 1, label: 'Đã thanh toán', color: 'green' },
  ];

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllContainerIncidentalCosts(
        pagination.current,
        pagination.pageSize,
        filters
      );
      
      if (response.status === 'OK') {
        setData(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));
      } else {
        message.error(response.message || 'Lỗi khi tải dữ liệu');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Lỗi khi tải dữ liệu chi phí phát sinh');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Search function
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
            onClick={() => handleReset(clearFilters)}
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
    onFilter: (value, record) =>
      record[dataIndex] && record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
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

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Handle CRUD operations
  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteContainerIncidentalCost(id);
      if (response.status === 'OK') {
        message.success('Xóa chi phí phát sinh thành công');
        fetchData();
      } else {
        message.error(response.message || 'Lỗi khi xóa chi phí phát sinh');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      message.error('Lỗi khi xóa chi phí phát sinh');
    }
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    fetchData();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
  };

  const handleTableChange = (paginationConfig, tableFilters) => {
    const apiFilters = {};
    
    Object.keys(tableFilters).forEach(key => {
      if (tableFilters[key] && tableFilters[key].length > 0) {
        apiFilters[key] = tableFilters[key];
      }
    });

    setFilters(apiFilters);
    setPagination({
      ...pagination,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    });
  };

  const columns = [
    {
      title: 'Ngày đồng hạng',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
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
      title: 'Số cont',
      dataIndex: ['container', 'containerNumber'],
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
      title: 'LINE',
      dataIndex: ['container', 'line'],
      key: 'line',
      width: 80,
      render: (text) => text || 'N/A',
    },
    {
      title: 'CHUYẾN TÀU',
      dataIndex: ['container', 'trainTrip'],
      key: 'trainTrip',
      width: 120,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Khách hàng',
      dataIndex: ['container', 'customer', 'shortName'],
      key: 'customerName',
      width: 120,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Mặt hàng',
      dataIndex: ['container', 'item'],
      key: 'item',
      width: 120,
      render: (text) => (
        <Tooltip title={text || 'N/A'}>
          <div style={{ 
            maxWidth: 110, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {text || 'N/A'}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Kinh doanh',
      dataIndex: ['container', 'salesPerson'],
      key: 'salesPerson',
      width: 100,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Ngày phát sinh phát sinh',
      dataIndex: 'createdAt',
      key: 'incidentDate',
      width: 120,
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
      title: 'Loại phát sinh',
      dataIndex: 'costType',
      key: 'costType',
      width: 130,
      render: (type) => {
        const option = costTypeOptions.find(opt => opt.value === type);
        return option ? (
          <Tag color={option.color}>{option.label}</Tag>
        ) : 'N/A';
      },
    },
    {
      title: 'Chi tiết',
      dataIndex: 'description',
      key: 'description',
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
    },
    {
      title: 'CHI PHÍ',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount) => (
        <span style={{ 
          whiteSpace: 'nowrap', 
          fontWeight: 'bold',
          color: '#f50'
        }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'ĐỘI XE',
      dataIndex: 'doiXe',
      key: 'doiXe',
      width: 120,
      render: (amount) => (
        <span style={{ whiteSpace: 'nowrap', color: '#1890ff' }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'THỰC CHU KHÁCH HÀNG',
      dataIndex: 'khachHang',
      key: 'khachHang',
      width: 140,
      render: (amount) => (
        <span style={{ whiteSpace: 'nowrap', color: '#52c41a' }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'HÃNG TÀU',
      dataIndex: 'hangTau',
      key: 'hangTau',
      width: 120,
      render: (amount) => (
        <span style={{ whiteSpace: 'nowrap', color: '#722ed1' }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'XÂY DỰNG S1',
      dataIndex: 'congTy',
      key: 'congTy',
      width: 120,
      render: (amount) => (
        <span style={{ whiteSpace: 'nowrap', color: '#fa8c16' }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Tình trạng xử lý',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option ? (
          <Tag color={option.color}>{option.label}</Tag>
        ) : 'N/A';
      },
    },
    {
      title: 'Ngày xử lý xong',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 120,
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
      title: 'Kinh doanh phát sinh tình trạng',
      dataIndex: 'note',
      key: 'businessNote',
      width: 180,
      render: (text) => (
        <Tooltip title={text || 'N/A'}>
          <div style={{ 
            maxWidth: 170, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {text || 'N/A'}
          </div>
        </Tooltip>
      ),
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
              type="link"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa chi phí phát sinh này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button
                type="link"
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
            <h2 style={{ margin: 0 }}>Quản Lý Chi Phí Phát Sinh Container</h2>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={() => fetchData()}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Thêm Chi Phí Phát Sinh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <div className="table-container-wrapper">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
          }}
          onChange={handleTableChange}
          scroll={{ 
            x: 2200,
            y: 'calc(100vh - 400px)'
          }}
          size="small"
          sticky={{
            offsetHeader: 0,
          }}
        />
      </div>

      {/* Modal Component */}
      <ContainerIncidentalCostModal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        editingRecord={editingRecord}
        onSuccess={handleModalSuccess}
      />

      {/* CSS Styling */}
      <style>{`
        .table-container-wrapper {
          background: white;
          border-radius: 6px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02);
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
        
        .ant-table-thead .ant-table-cell-fix-left,
        .ant-table-thead .ant-table-cell-fix-right {
          z-index: 16 !important;
          background: #fafafa !important;
        }
        
        .ant-table-tbody .ant-table-cell-fix-left,
        .ant-table-tbody .ant-table-cell-fix-right {
          background: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default ContainerIncidentalCost;