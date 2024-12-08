import { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Popconfirm, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getAllPartners, deletePartner } from '../../services/PartnerService';
import CreatePartnerModal from '../../components/popup/CreatePartner';
import UpdatePartnerModal from '../../components/popup/UpdatePartner';

const PartnerPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await getAllPartners(currentPage, pageSize, searchTerm);
      const transformedData = response.partners.map(partner => ({
        ...partner,
        id: partner._id
      }));
      setPartners(transformedData);
      setTotalItems(response.total);
    } catch (error) {
      console.log(error);
      message.error('Không thể tải danh sách đối tác');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (record) => {
    setSelectedPartnerId(record.id);
    setIsUpdateModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePartner(id);
      message.success('Xóa đối tác thành công');
      fetchPartners();
    } catch (error) {
      message.error('Lỗi khi xóa đối tác');
    }
  };

  const columns = [
    {
      title: 'Tên đối tác',
      dataIndex: 'name',
      key: 'name',
    },
    {
        title: 'Tên viết tắt',
        dataIndex: 'shortName',
        key: 'shortName',
    },
    {
      title: 'Mã đối tác',
      dataIndex: 'partnerCode', 
      key: 'partnerCode',
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
          placeholder="Tìm kiếm đối tác"
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
        dataSource={partners}
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
          showTotal: (total) => `Tổng ${total} đối tác`
        }}
      />

      <CreatePartnerModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSuccess={() => {
          setIsCreateModalVisible(false);
          message.success('Tạo đối tác mới thành công');
          fetchPartners();
        }}
      />

      <UpdatePartnerModal
        visible={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        onSuccess={() => {
          setIsUpdateModalVisible(false);
          message.success('Cập nhật đối tác thành công');
          fetchPartners();
        }}
        partnerId={selectedPartnerId}
      />
    </div>
  );
};

export default PartnerPage;