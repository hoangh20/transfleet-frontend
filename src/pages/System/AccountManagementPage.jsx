import React, { useState, useEffect } from 'react';
import { Table, Button, message, Select, Modal } from 'antd';
import { listUsers, deleteAccount, updateUserRole, connectUserToDriver, unlinkUserFromDriver } from '../../services/UserService';
import { getAllDrivers } from '../../services/DriverService';

const ROLE_OPTIONS = [
  { label: 'dev', value: 'dev' },
  { label: 'admin', value: 'admin' },
  { label: 'DHVT', value: 'DHVT' },
  { label: 'CS', value: 'CS' },
  { label: 'driver', value: 'driver' },
];

const AccountManagementPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');

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

  const openRoleModal = async (account) => {
    setEditingAccount(account);
    setSelectedRole(account.role);
    if (account.role === 'driver') {
      const driverList = await getAllDrivers();
      setDrivers(driverList.filter(d => d.hasAccount === 0));
    }
    setRoleModalVisible(true);
  };

  const handleRoleChange = async (value) => {
    setSelectedRole(value);
    if (value === 'driver') {
      const driverList = await getAllDrivers();
      setDrivers(driverList.filter(d => d.hasAccount === 0));
    }
  };

  const handleSaveRole = async () => {
    try {
      await updateUserRole(editingAccount._id, selectedRole);
      if (selectedRole === 'driver') {
        if (!selectedDriver) {
          message.error('Vui lòng chọn tài xế để gán!');
          return;
        }
        await connectUserToDriver(editingAccount._id, selectedDriver);
      } else {
        await unlinkUserFromDriver(editingAccount._id);
      }
      message.success('Cập nhật vai trò thành công');
      setRoleModalVisible(false);
      setEditingAccount(null);
      setSelectedDriver('');
      loadAccounts();
    } catch (error) {
      message.error('Lỗi khi cập nhật vai trò');
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
          <Button type="primary" onClick={() => openRoleModal(record)} style={{ marginLeft: 8 }}>
            Cấp quyền
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Quản lý tài khoản</h1>
      <Table
        columns={columns}
        dataSource={accounts}
        loading={loading}
        rowKey="_id"
      />
      <Modal
        title="Cập nhật vai trò"
        visible={roleModalVisible}
        onOk={handleSaveRole}
        onCancel={() => setRoleModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Select
          style={{ width: '100%', marginBottom: 16 }}
          value={selectedRole}
          onChange={handleRoleChange}
          options={ROLE_OPTIONS}
          placeholder="Chọn vai trò"
        />
        {selectedRole === 'driver' && (
          <Select
            style={{ width: '100%' }}
            placeholder="Chọn tài xế để gán"
            value={selectedDriver}
            onChange={setSelectedDriver}
            options={drivers.map(d => ({
              label: d.name,
              value: d._id,
            }))}
            showSearch
            optionFilterProp="label"
          />
        )}
      </Modal>
    </div>
  );
};

export default AccountManagementPage;