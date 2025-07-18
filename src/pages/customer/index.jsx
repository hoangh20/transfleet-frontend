import { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Popconfirm, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getAllCustomers, deleteCustomer } from '../../services/CustomerService';
import CreateCustomerModal from '../../components/popup/CreateCustomer';
import UpdateCustomerModal from '../../components/popup/UpdateCustomer';

const CustommerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
      title: 'Tên đầy đủ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tên viết tắt',
      dataIndex: 'shortName',
      key: 'shortName',
    },
    {
      title: 'Mã khách hàng',
      dataIndex: 'customerCode',
      key: 'customerCode',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
        <Input
          placeholder="Tìm kiếm khách hàng"
          prefix={<SearchOutlined />}
          style={{ width: 400, marginRight: 16 }}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalVisible(true)}
        >
          Thêm mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey={(record) => record._id}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
          showTotal: (total) => `Tổng ${total} khách hàng`
        }}
      />

      <CreateCustomerModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSuccess={() => {
          setIsCreateModalVisible(false);
          message.success('Tạo khách hàng mới thành công');
          fetchCustomers();
        }}
      />

      <UpdateCustomerModal
        visible={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        onSuccess={() => {
          setIsUpdateModalVisible(false);
          message.success('Cập nhật khách hàng thành công');
          fetchCustomers();
        }}
        customerId={selectedCustomerId}
      />
    </div>
  );
};

export default CustommerPage;