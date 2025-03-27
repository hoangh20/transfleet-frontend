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
          label="Cước chuyến 20''"
          name="tripFare0"
          rules={[{ required: true, message: 'Vui lòng nhập cước chuyến 20"' }]}
        >
          <Input type="number" placeholder="Nhập cước chuyến 20''" />
        </Form.Item>
        <Form.Item
          label="Cước chuyến kết hợp 20''"
          name="combinedTripFare0"
          rules={[{ required: false, message: 'Vui lòng nhập cước chuyến kết hợp 20"' }]}
        >
          <Input type="number" placeholder="Nhập cước chuyến kết hợp 20''" />
        </Form.Item>
        <Form.Item
          label="Cước chuyến 40''"
          name="tripFare1"
          rules={[{ required: true, message: 'Vui lòng nhập cước chuyến 40"' }]}
        >
          <Input type="number" placeholder="Nhập cước chuyến 40''" />
        </Form.Item>
        <Form.Item
          label="Cước chuyến kết hợp 40''"
          name="combinedTripFare1"
          rules={[{ required: false, message: 'Vui lòng nhập cước chuyến kết hợp 40"' }]}
        >
          <Input type="number" placeholder="Nhập cước chuyến kết hợp 40''" />
        </Form.Item>
        <p style={{ color: 'gray', fontSize: '12px' }}>
          * Nếu không có 2 loại cước chuyến, vui lòng nhập cả 2 cước chuyến giống nhau.
        </p>
      </Form>
    </Modal>
  );
};

export default AddCustomerTripFareModal;