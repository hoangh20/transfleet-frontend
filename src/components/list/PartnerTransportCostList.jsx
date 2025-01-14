import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, Button, AutoComplete, Popconfirm, Space, Modal, Form, Input, message } from 'antd';
import { getPartnerById, getAllPartnersforcost } from '../../services/PartnerService';
import { updatePartnerTransportCost, deletePartnerTransportCost } from '../../services/ExternalFleetCostService';
import CreatePartnerTransportCost from '../popup/CreatePartnerTransportCost';

const PartnerTransportCostList = ({ transportTripId, partnerTransportCosts, fetchCostDetails }) => {
  const [filteredPartnerTransportCosts, setFilteredPartnerTransportCosts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    fetchPartners();
    fetchPartnerTransportCostsWithNames();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerTransportCosts]);

  useEffect(() => {
    if (searchTerm) {
      const filteredCosts = partnerTransportCosts.filter((cost) =>
        cost.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPartnerTransportCosts(filteredCosts);
    } else {
      setFilteredPartnerTransportCosts(partnerTransportCosts);
    }
  }, [searchTerm, partnerTransportCosts]);

  const fetchPartners = async () => {
    try {
      const response = await getAllPartnersforcost();
      setPartners(response.partners);
    } catch (error) {
      message.error('Lỗi khi tải danh sách đối tác');
    }
  };

  const fetchPartnerTransportCostsWithNames = async () => {
    const updatedCosts = await Promise.all(
      partnerTransportCosts.map(async (cost) => {
        const partner = await getPartnerById(cost.partner);
        return {
          ...cost,
          partnerName: partner.name,
        };
      })
    );
    setFilteredPartnerTransportCosts(updatedCosts);
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    fetchCostDetails();
  };

  const handleEdit = (cost) => {
    setEditingCost(cost);
    form.setFieldsValue({ cost: cost.cost });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await updatePartnerTransportCost(editingCost._id, { cost: values.cost });
      message.success('Cập nhật tuyến vận tải đối tác thành công');
      setIsEditModalVisible(false);
      fetchCostDetails();
    } catch (error) {
      message.error('Lỗi khi cập nhật tuyến vận tải đối tác');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePartnerTransportCost(id);
      message.success('Xóa tuyến vận tải đối tác thành công');
      fetchCostDetails();
    } catch (error) {
      message.error('Lỗi khi xóa tuyến vận tải đối tác');
    }
  };

  const columns = [
    {
      title: 'Đối tác',
      dataIndex: 'partnerName',
      key: 'partnerName',
    },
    {
      title: 'Chi phí',
      dataIndex: 'cost',
      key: 'cost',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tuyến vận tải này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const partnerOptions = partners.map((partner) => ({
    value: partner.name,
  }));

  return (
    <Card title="Danh sách tuyến vận tải đối tác" bordered={false} style={{ marginTop: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col span={16}>
          <AutoComplete
            options={partnerOptions}
            style={{ width: '100%' }}
            onSelect={(value) => setSearchTerm(value)}
            onSearch={(value) => setSearchTerm(value)}
            placeholder="Tìm kiếm đối tác"
          />
        </Col>
        <Col>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Thêm tuyến vận tải đối tác
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={filteredPartnerTransportCosts}
        rowKey="_id"
        pagination={false}
      />
      <CreatePartnerTransportCost
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleModalSuccess}
        transportTripId={transportTripId}
      />
      <Modal
        title="Cập nhật tuyến vận tải đối tác"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdate}>
            Lưu
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Chi phí"
            name="cost"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <Input type="number" placeholder="Nhập giá" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PartnerTransportCostList;