import React, { useEffect, useState } from 'react';
import { Card, List, Button, Modal, Form, Input, message, Popconfirm, Select, Tag } from 'antd';
import {
  getIncidentalCostsByOrderId,
  createIncidentalCost,
  updateIncidentalCost,
  deleteIncidentalCost,
} from '../../services/OrderService';

const { Option } = Select;

const IncidentalCostCard = ({ orderId }) => {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [form] = Form.useForm();

  const fetchCosts = async () => {
    setLoading(true);
    try {
      const data = await getIncidentalCostsByOrderId(orderId);
      setCosts(data.data);
    } catch (error) {
      message.error('Lỗi khi tải chi phí phát sinh.');
      setCosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleAdd = () => {
    setEditingCost(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (cost) => {
    setEditingCost(cost);
    form.setFieldsValue(cost);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteIncidentalCost(id);
      message.success('Xóa chi phí phát sinh thành công.');
      fetchCosts();
    } catch (error) {
      message.error('Lỗi khi xóa chi phí phát sinh.');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCost) {
        await updateIncidentalCost(editingCost._id, values);
        message.success('Cập nhật chi phí phát sinh thành công.');
      } else {
        await createIncidentalCost({ ...values, orderId });
        message.success('Thêm chi phí phát sinh thành công.');
      }
      setIsModalVisible(false);
      fetchCosts();
    } catch (error) {
      message.error('Lỗi khi lưu chi phí phát sinh.');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const renderTypeTag = (type) => {
    switch (type) {
      case 0:
        return <Tag color="blue">Đội xe</Tag>;
      case 1:
        return <Tag color="green">Khách hàng</Tag>;
      case 2:
        return <Tag color="red">Công ty</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  return (
    <Card
      title="Chi phí phát sinh"
      bordered={false}
      style={{ height: '100%' }}
      bodyStyle={{ padding: '12px 16px' }}
      extra={<Button type="primary" onClick={handleAdd}>Thêm</Button>}
    >
      <List
        loading={loading}
        dataSource={Array.isArray(costs) ? costs : []}
        renderItem={(item) => (
          <List.Item
            style={{
              borderBottom: '1px solid #f0f0f0',
              padding: '12px 0',
            }}
          >
            <div style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  marginBottom: 8,
                }}
              >
                {renderTypeTag(item.type)}
                <div>
                  <Button type="link" onClick={() => handleEdit(item)}>Sửa</Button>
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa chi phí này?"
                    onConfirm={() => handleDelete(item._id)}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button type="link" danger>Xóa</Button>
                  </Popconfirm>
                </div>
              </div>

              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {item.reason}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  color: '#555',
                }}
              >
                <div>
                  Số tiền: <strong>{Number(item.amount).toLocaleString()} VND</strong>
                </div>
                {item.responsiblePerson && (
                  <div>Người chịu trách nhiệm: {item.responsiblePerson}</div>
                )}
              </div>
            </div>
          </List.Item>
        )}
      />
      <Modal
        title={editingCost ? 'Cập nhật chi phí' : 'Thêm chi phí'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Loại chi phí"
            name="type"
            rules={[{ required: true, message: 'Vui lòng chọn loại chi phí' }]}
          >
            <Select placeholder="Chọn loại chi phí">
              <Option value={0}>Đội xe</Option>
              <Option value={1}>Khách hàng</Option>
              <Option value={2}>Công ty</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Lý do"
            name="reason"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <Input placeholder="Nhập lý do chi phí" />
          </Form.Item>
          <Form.Item
            label="Số tiền"
            name="amount"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
          >
            <Input type="number" placeholder="Nhập số tiền" />
          </Form.Item>
          <Form.Item
            label="Người chịu trách nhiệm"
            name="responsiblePerson"
          >
            <Input placeholder="Nhập tên người chịu trách nhiệm" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default IncidentalCostCard;
