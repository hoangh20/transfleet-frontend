import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';


const AddCustomerTripFareModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  form, 
  customers 
}) => {
  return (
    <Modal
      title="Thêm cước chuyến của khách hàng"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit}>
          Lưu
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Khách hàng"
          name="customer"
          rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
        >
          <Select
            placeholder="Chọn khách hàng"
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            options={customers.map((customer) => ({
              value: customer._id,
              label: `${customer.name} (${customer.shortName})`,
            }))}
          />
        </Form.Item>
        <Form.Item
          label="Cước chuyến 20"
          name="tripFare0"
          rules={[{ required: true, message: 'Vui lòng nhập cước chuyến 20"' }]}
        >
          <Input type="number" placeholder="Nhập cước chuyến 20" />
        </Form.Item>
        <Form.Item
          label="Cước chuyến 40"
          name="tripFare1"
          rules={[{ required: true, message: 'Vui lòng nhập cước chuyến 40"' }]}
        >
          <Input type="number" placeholder="Nhập cước chuyến 40" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCustomerTripFareModal;