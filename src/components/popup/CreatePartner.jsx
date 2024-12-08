import React, { useState } from 'react';
import { Modal, Form, Input, message, Button } from 'antd';
import { createPartner } from '../../services/PartnerService';

const CreatePartnerModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await createPartner(values);
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error('Lỗi khi tạo đối tác mới.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title='Tạo đối tác mới'
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key='cancel' onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key='submit'
          type='primary'
          loading={loading}
          onClick={handleSubmit}
        >
          Lưu
        </Button>,
      ]}
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          label='Tên đối tác'
          name='name'
          rules={[{ required: true, message: 'Vui lòng nhập tên đối tác' }]}
        >
          <Input placeholder='Nhập tên đối tác' />
        </Form.Item>
        <Form.Item
          label='Tên viết tắt'
          name='shortName'
          rules={[{ required: true, message: 'Vui lòng nhập tên viết tắt' }]}
        >
          <Input placeholder='Nhập tên viết tắt' />
        </Form.Item>
        <Form.Item
          label='Mã đối tác'
          name='partnerCode'
          rules={[{ required: true, message: 'Vui lòng nhập mã đối tác' }]}
        >
          <Input placeholder='Nhập mã đối tác' />
        </Form.Item>
        <Form.Item
          label='Email'
          name='email'
          rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
        >
          <Input placeholder='Nhập email' />
        </Form.Item>
        <Form.Item
          label='Số điện thoại'
          name='phone'
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
        >
          <Input placeholder='Nhập số điện thoại' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePartnerModal;
