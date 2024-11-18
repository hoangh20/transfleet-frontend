import React, { useState, useEffect } from 'react';
import { Table, Input, Pagination, Space, Button, Popconfirm, message } from 'antd';
import { getAllCustomers } from '../../services/CustomerService';
import { PlusOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import CreateCustomer from '../../components/popup/CreateCustomer'; 
import { deleteCustomer } from '../../services/CustomerService'; // Import API xóa

const { Search } = Input;

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize, searchTerm]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getAllCustomers(currentPage, pageSize, searchTerm);
      setCustomers(data.customers);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTableChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleCopy = (customerCode) => {
    navigator.clipboard.writeText(customerCode);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCustomerCreated = () => {
    fetchCustomers();
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id); // Gọi API xóa khách hàng
      message.success('Xóa khách hàng thành công');
      fetchCustomers(); // Làm mới danh sách sau khi xóa
    } catch (error) {
      message.error('Xóa khách hàng thất bại');
    }
  };

  const columns = [
    {
      title: 'Tên viết tắt',
      dataIndex: 'shortName',
      key: 'shortName',
    },
    {
      title: 'Mã khách hàng',
      dataIndex: 'customerCode',
      key: 'customerCode',
      render: (text) => (
        <Space>
          {text}
          <Button 
            icon={<CopyOutlined />} 
            onClick={() => handleCopy(text)} 
            size="small" 
            type="link"
          />
        </Space>
      ),
    },
    {
      title: 'Tên khách',
      dataIndex: 'name',
      key: 'name',
    },
    {
      key: 'action',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa khách hàng này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              type="link" 
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Thanh tìm kiếm và nút thêm mới */}
        <Space style={{ justifyContent: 'center', width: '100%' }}>
          <Search
            placeholder="Tìm kiếm theo tên hoặc tên viết tắt"
            allowClear
            enterButton="Tìm kiếm"
            size="large"
            onSearch={handleSearch}
            style={{ flex: 2, marginRight: 100 }}
          />
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
          >
            Thêm mới
          </Button>
        </Space>

        {/* Bảng hiển thị danh sách khách hàng */}
        <Table
          columns={columns}
          dataSource={customers}
          loading={loading}
          rowKey={(record) => record._id}
          pagination={false} 
        />

        {/* Phân trang */}
        <Pagination
          current={currentPage}
          total={total}
          pageSize={pageSize}
          showSizeChanger
          pageSizeOptions={[5, 10, 20, 50]}
          onChange={handleTableChange}
          showTotal={(total) => `Tổng số ${total} khách hàng`}
        />
      </Space>

      {/* Popup tạo khách hàng mới */}
      <CreateCustomer
        visible={isModalOpen}
        onCancel={handleCloseModal}
        onSuccess={handleCustomerCreated}
      />
    </div>
  );
};

export default CustomerPage;
