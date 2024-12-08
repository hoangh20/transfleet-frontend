import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Button } from 'antd';
import { updatePartner, getPartnerById } from '../../services/PartnerService';

const UpdatePartnerModal = ({ visible, onCancel, onSuccess, partnerId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        if (partnerId && visible) {
          setLoading(true);
          const response = await getPartnerById(partnerId);      
          setInitialData(response);
          form.setFieldsValue(response);
        }
      } catch (error) {
        message.error('Lỗi khi tải thông tin đối tác');
      } finally {
        setLoading(false);
      }
    };

    if (visible && partnerId) {
      fetchPartnerData();
    }
  }, [partnerId, visible, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await updatePartner(partnerId, values);
      onSuccess();
    } catch (error) {
      message.error('Lỗi khi cập nhật đối tác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title='Cập nhật đối tác'
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
          label='Tên đối tác'
          name='name'
          rules={[{ required: true, message: 'Vui lòng nhập tên đối tác' }]}
        >
          <Input placeholder='Nhập tên đối tác' />
        </Form.Item>
        <Form.Item
          label='Mã đối tác'
          name='partnerCode'
            rules={[{ required: true, message: 'Vui lòng nhập mã đối tác' }]}
        >
            <Input placeholder='Nhập mã đối tác' />
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

export default UpdatePartnerModal;