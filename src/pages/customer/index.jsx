import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Popconfirm, 
  message, 
  Card, 
  Tag, 
  Tooltip,
  Row,
  Col
} from 'antd';
import { 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  BarcodeOutlined,
  TagsOutlined,
  BankOutlined
} from '@ant-design/icons';
import { getAllCustomers, deleteCustomer } from '../../services/CustomerService';
import CreateCustomerModal from '../../components/popup/CreateCustomer';
import UpdateCustomerModal from '../../components/popup/UpdateCustomer';

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getAllCustomers(currentPage, pageSize, searchTerm);
      const transformedData = response.customers.map(customer => ({
        ...customer,
        id: customer._id 
      }));
      setCustomers(transformedData);
      setTotalItems(response.total);
    } catch (error) {
      message.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (record) => {
    setSelectedCustomerId(record.id);
    setIsUpdateModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id);
      message.success('Xóa khách hàng thành công');
      fetchCustomers();
    } catch (error) {
      message.error('Lỗi khi xóa khách hàng');
    }
  };

  const columns = [
    {
      title: 'Thông tin cơ bản',
      key: 'basicInfo',
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <UserOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>{record.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <span style={{ fontSize: 12, color: '#666', marginRight: 8 }}>Tên ngắn:</span>
            <Tag color="blue" style={{ fontSize: 11 }}>
              {record.shortName || 'N/A'}
            </Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BarcodeOutlined style={{ color: '#52c41a', marginRight: 6, fontSize: 12 }} />
            <span style={{ fontSize: 12, color: '#666' }}>{record.customerCode}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <MailOutlined style={{ color: '#fa8c16', marginRight: 6 }} />
            <Tooltip title={record.email}>
              <span style={{ 
                fontSize: 12, 
                maxWidth: 150, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block'
              }}>
                {record.email || 'Chưa có email'}
              </span>
            </Tooltip>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PhoneOutlined style={{ color: '#13c2c2', marginRight: 6 }} />
            <span style={{ fontSize: 12 }}>
              {record.phone || 'Chưa có SĐT'}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Mã công ty',
      key: 'maCty',
      width: 150,
      render: (_, record) => (
        <div>
          {record.maCty && record.maCty.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {record.maCty.slice(0, 2).map((ma, index) => (
                <Tag key={index} color="purple" style={{ fontSize: 10 }}>
                  <BankOutlined style={{ marginRight: 2 }} />
                  {ma}
                </Tag>
              ))}
              {record.maCty.length > 2 && (
                <Tooltip title={record.maCty.slice(2).join(', ')}>
                  <Tag color="default" style={{ fontSize: 10 }}>
                    +{record.maCty.length - 2}
                  </Tag>
                </Tooltip>
              )}
            </div>
          ) : (
            <span style={{ color: '#999', fontSize: 12 }}>Chưa có mã</span>
          )}
        </div>
      ),
    },
    {
      title: 'Mặt hàng',
      key: 'items',
      width: 200,
      render: (_, record) => (
        <div>
          {record.items && record.items.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {record.items.slice(0, 2).map((item, index) => (
                <Tag key={index} color="green" style={{ fontSize: 10 }}>
                  <TagsOutlined style={{ marginRight: 2 }} />
                  {item}
                </Tag>
              ))}
              {record.items.length > 2 && (
                <Tooltip title={record.items.slice(2).join(', ')}>
                  <Tag color="default" style={{ fontSize: 10 }}>
                    +{record.items.length - 2}
                  </Tag>
                </Tooltip>
              )}
            </div>
          ) : (
            <span style={{ color: '#999', fontSize: 12 }}>Chưa có mặt hàng</span>
          )}
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
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
            title="Bạn có chắc chắn muốn xóa khách hàng này?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record.id)}
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
            <Input
              placeholder="Tìm kiếm theo tên, mã khách hàng, email..."
              prefix={<SearchOutlined />}
              size="large"
              style={{ maxWidth: 400 }}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsCreateModalVisible(true)}
            >
              Thêm khách hàng
            </Button>
          </Col>
        </Row>
      </Card>


      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={customers}
          rowKey={(record) => record._id}
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '15', '20', '50'],
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} khách hàng`,
          }}
        />
      </Card>

      {/* Modals */}
      <CreateCustomerModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSuccess={() => {
          setIsCreateModalVisible(false);
          fetchCustomers();
        }}
      />

      <UpdateCustomerModal
        visible={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        onSuccess={() => {
          setIsUpdateModalVisible(false);
          fetchCustomers();
        }}
        customerId={selectedCustomerId}
      />
    </div>
  );
};

export default CustomerPage;