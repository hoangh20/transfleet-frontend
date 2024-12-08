import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Button } from 'antd';
import { updateCustomer, getCustomerById } from '../../services/CustomerService';

const UpdateCustomerModal = ({ visible, onCancel, onSuccess, customerId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        if (customerId && visible) {
          setLoading(true);
          const response = await getCustomerById(customerId);      
          setInitialData(response);
          form.setFieldsValue(response);
        }
      } catch (error) {
        message.error('Lỗi khi tải thông tin khách hàng');
      } finally {
        setLoading(false);
      }
    };

    if (visible && customerId) {
      fetchCustomerData();
    }
  }, [customerId, visible, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await updateCustomer(customerId, values);
      onSuccess();
    } catch (error) {
      message.error('Lỗi khi cập nhật khách hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title='Cập nhật khách hàng'
      open={visible}
      onCancel={onCancel}
      confirmLoading={loading}
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
      <Form 
        form={form} 
        layout='vertical'
        initialValues={initialData}
      >
        <Form.Item
          label='Tên đầy đủ'
          name='name'
          rules={[{ required: true, message: 'Vui lòng nhập tên đầy đủ' }]}
        >
          <Input placeholder='Nhập tên đầy đủ' />
        </Form.Item>
        <Form.Item
          label='Tên viết tắt'
          name='shortName'
          rules={[{ required: true, message: 'Vui lòng nhập tên viết tắt' }]}
        >
          <Input placeholder='Nhập tên viết tắt' />
        </Form.Item>
        <Form.Item
          label='Mã khách hàng'
          name='customerCode'
          rules={[{ required: true, message: 'Vui lòng nhập mã khách hàng' }]}
        >
          <Input placeholder='Nhập mã khách hàng' />
        </Form.Item>
        <Form.Item
          label='Email'
          name='email'
          rules={[{ required: false, type: 'email', message: 'Email không hợp lệ' }]}
        >
          <Input placeholder='Nhập email' />
        </Form.Item>
        <Form.Item
          label='Số điện thoại'
          name='phone'
          rules={[{ required: false, message: 'Vui lòng nhập số điện thoại' }]}
        >
          <Input placeholder='Nhập số điện thoại' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateCustomerModal;