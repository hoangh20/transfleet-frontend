import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, Button, AutoComplete, Popconfirm, Space, Modal, Form, Input, message, Spin } from 'antd';
import { getPartnerById } from '../../services/PartnerService';
import { updatePartnerTransportCost, deletePartnerTransportCost } from '../../services/ExternalFleetCostService';
import CreatePartnerTransportCost from '../popup/CreatePartnerTransportCost';

const PartnerTransportCostList = ({ 
  transportTripId, 
  partnerTransportCosts, 
  fetchCostDetails, 
  pagination = false 
}) => {
  const [partnerCostsWithNames, setPartnerCostsWithNames] = useState([]);
  const [filteredPartnerTransportCosts, setFilteredPartnerTransportCosts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnerTransportCostsWithNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerTransportCosts]);

  useEffect(() => {
    if (searchTerm) {
      const filteredCosts = partnerCostsWithNames.filter((cost) =>
        cost.partnerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPartnerTransportCosts(filteredCosts);
    } else {
      setFilteredPartnerTransportCosts(partnerCostsWithNames);
    }
  }, [searchTerm, partnerCostsWithNames]);

  const fetchPartnerTransportCostsWithNames = async () => {
    setLoading(true);
    try {
      const updatedCosts = await Promise.all(
        partnerTransportCosts.map(async (cost) => {
          const partner = await getPartnerById(cost.partner);
          return {
            ...cost,
            cost1: cost.cost1 || 'N/A', 
            partnerName: partner.name,
          };
        })
      );
      setPartnerCostsWithNames(updatedCosts);
      setFilteredPartnerTransportCosts(updatedCosts);
    } catch (error) {
      message.error('Lỗi khi tải thông tin đối tác');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    fetchCostDetails();
  };

  const handleEdit = (cost) => {
    setEditingCost(cost);
    form.setFieldsValue({
      cost: cost.cost || '',
      cost1: cost.cost1 || '',
    });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await updatePartnerTransportCost(editingCost._id, {
        cost: values.cost,
        cost1: values.cost1, 
      });
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
      title: 'Chi phí cont 20',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => cost || 'N/A', 
    },
    {
      title: 'Chi phí cont 40',
      dataIndex: 'cost1',
      key: 'cost1',
      render: (cost1) => cost1 || 'N/A', 
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

  return (
    <Card title="Danh sách chi phí đối tác vận chuyển" style={{ marginTop: 16 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col span={16}>
          <AutoComplete
            style={{ width: '100%' }}
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
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredPartnerTransportCosts}
          rowKey="_id"
          pagination={pagination}
        />
      )}
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
            label="Chi phí cont 20"
            name="cost"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <Input type="number" placeholder="Nhập giá" />
          </Form.Item>
          <Form.Item
            label="Chi phí cont 40"
            name="cost1"
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