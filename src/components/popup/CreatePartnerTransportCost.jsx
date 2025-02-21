import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { getAllPartnersforcost } from '../../services/PartnerService';
import { createPartnerTransportCost } from '../../services/ExternalFleetCostService';

const { Option } = Select;

const CreatePartnerTransportCost = ({ visible, onCancel, onSuccess, transportTripId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await getAllPartnersforcost();
        setPartners(response.partners);
      } catch (error) {
        message.error('Lỗi khi tải danh sách đối tác');
      }
    };

    fetchPartners();
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data = {
        transportTrip: transportTripId,
        partner: values.partner,
        cost: parseFloat(values.cost),
      };

      await createPartnerTransportCost(data);
      message.success('Tạo mới chi phí vận chuyển đối tác thành công');
      onSuccess();
      form.resetFields();
    } catch (error) {
      message.error('Lỗi khi tạo chi phí vận chuyển đối tác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo mới chi phí vận chuyển đối tác"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Lưu
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Đối tác"
          name="partner"
          rules={[{ required: true, message: 'Vui lòng chọn đối tác' }]}
        >
          <Select
            showSearch
            placeholder="Chọn đối tác"
            optionFilterProp="children"
            filterOption={(input, option) => {
              const children = option.children;
              if (Array.isArray(children)) {
                return children.join('').toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
          >
            {partners.map((partner) => (
              <Option key={partner._id} value={partner._id}>
                {partner.name} ({partner.shortName})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Giá"
          name="cost"
          rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
        >
          <Input type="number" placeholder="Nhập giá" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePartnerTransportCost;