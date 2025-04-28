import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import SystemService from '../../services/SystemService';

const AddSalesPersonModal = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await SystemService.createSalePerson({ salePersonName: values.name }); 
      message.success('Nhân viên kinh doanh đã được thêm thành công!');
      onSubmit(values); 
      form.resetFields(); 
      onCancel(); 
    } catch (error) {
      if (error.response && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    }
  };

  return (
    <Modal
      title="Thêm Nhân Viên Kinh Doanh"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Lưu
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên Nhân Viên"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên kinh doanh' }]}
        >
          <Input placeholder="Nhập tên nhân viên kinh doanh" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSalesPersonModal;
