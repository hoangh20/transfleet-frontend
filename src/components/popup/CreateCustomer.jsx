import React, { useState } from 'react';
import { Modal, Form, Input, message, Button } from 'antd';
import { createCustomer } from '../../services/CustomerService';

const CreateCustomerModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await createCustomer(values);
      message.success('Tạo khách hàng mới thành công!');
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error('Lỗi khi tạo khách hàng mới.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo khách hàng mới"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Lưu
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên đầy đủ"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên đầy đủ' }]}
        >
          <Input placeholder="Nhập tên đầy đủ" />
        </Form.Item>
        <Form.Item
          label="Tên viết tắt"
          name="shortName"
          rules={[{ required: true, message: 'Vui lòng nhập tên viết tắt' }]}
        >
          <Input placeholder="Nhập tên viết tắt" />
        </Form.Item>
        <Form.Item
          label="Mã khách hàng"
          name="customerCode"
          rules={[{ required: true, message: 'Vui lòng nhập mã khách hàng' }]}
        >
          <Input placeholder="Nhập mã khách hàng" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateCustomerModal;
