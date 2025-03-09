import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { listUsers, deleteAccount } from '../../services/UserService';

const AccountManagementPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await listUsers();
      const data = response.data; // Lấy dữ liệu từ trường 'data' của response
      if (Array.isArray(data)) {
        setAccounts(data);
      } else {
        throw new Error('Dữ liệu trả về không phải là một mảng');
      }
    } catch (error) {
      console.error(error.message);
      message.error('Lỗi khi tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (accountId) => {
    try {
      await deleteAccount(accountId);
      message.success('Xóa tài khoản thành công');
      loadAccounts();
    } catch (error) {
      console.error(error.message);
      message.error('Lỗi khi xóa tài khoản');
    }
  };

const columns = [
    {
        title: 'Tên tài khoản',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Vai trò',
        dataIndex: 'role',
        key: 'role',
    },
    {
        title: 'Hành động',
        key: 'action',
        render: (text, record) => (
            <>
                <Button type="danger" onClick={() => handleDelete(record._id)}>
                    Xóa
                </Button>
                <Button type="primary" onClick={() => handleGrantPermission(record._id)} style={{ marginLeft: 8 }}>
                    Cấp quyền
                </Button>
            </>
        ),
    },
];

const handleGrantPermission = async (accountId) => {
    try {
        // Logic to grant permission
        message.success('Cấp quyền thành công');
        loadAccounts();
    } catch (error) {
        console.error(error.message);
        message.error('Lỗi khi cấp quyền');
    }
};

  return (
    <div>
      <h1>Quản lý tài khoản</h1>
      <Table
        columns={columns}
        dataSource={accounts}
        loading={loading}
        rowKey="_id"
      />
    </div>
  );
};

export default AccountManagementPage;