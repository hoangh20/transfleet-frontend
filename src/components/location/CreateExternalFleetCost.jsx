import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import LocationSelector from './LocationSelector';
import { getAllPartnersforcost } from '../../services/PartnerService';
import { createExternalFleetCost } from '../../services/ExternalFleetCostService';

const { Option } = Select;

const CreateExternalFleetCost = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [departure, setDeparture] = useState({});
  const [destination, setDestination] = useState({});
  const [cost, setCost] = useState('');
  const [transportType, setTransportType] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await getAllPartnersforcost();
        setPartners(response.partners);
      } catch (error) {
        message.error('Không thể tải danh sách đối tác');
      }
    };

    fetchPartners();
  }, []);

  const handlePartnerChange = (value) => {
    setSelectedPartner(value);
  };

  const handleDepartureChange = (location) => {
    setDeparture(location);
  };

  const handleDestinationChange = (location) => {
    setDestination(location);
  };

  const handleCostChange = (e) => {
    setCost(e.target.value);
  };

  const handleTransportTypeChange = (value) => {
    setTransportType(value);
  };

  const handleSubmit = async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const values = await form.validateFields();
      
      if (!departure.provinceCode || !departure.districtCode || !destination.provinceCode || !destination.districtCode || !cost || transportType === null) {
        message.error('Vui lòng điền đầy đủ thông tin');
        return;
      }

      const data = {
        partnerId: selectedPartner,
        startPoint: departure,
        endPoint: destination,
        type: transportType,
        cost: parseFloat(cost),
      };

      await createExternalFleetCost(data);
      message.success('Tạo mới chi phí vận chuyển thành công');
      onSubmit(data);
      form.resetFields();
      setDeparture({});
      setDestination({});
      setCost('');
      setTransportType(null);
      setSelectedPartner(null);
      
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Lỗi khi tạo chi phí vận chuyển');
    }
  };

  return (
    <Modal
      title="Tạo mới chi phí vận chuyển"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Tạo mới
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Chọn đối tác">
          <Select
            showSearch
            placeholder="Chọn đối tác"
            onChange={handlePartnerChange}
            value={selectedPartner}
            filterOption={(input, option) =>
              option.children.toString().toLowerCase().includes(input.toLowerCase())
            }
          >
            {partners.map((partner) => (
              <Option key={partner._id} value={partner._id}>
                {partner.name} - ({partner.shortName})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <LocationSelector label="Điểm đi" onChange={handleDepartureChange} />
        <LocationSelector label="Điểm đến" onChange={handleDestinationChange} />
        <Form.Item label="Giá vận chuyển">
          <Input
            type="number"
            value={cost}
            onChange={handleCostChange}
            placeholder="Nhập giá vận chuyển"
          />
        </Form.Item>
        <Form.Item label="Loại vận chuyển">
          <Select
            placeholder="Chọn loại vận chuyển"
            onChange={handleTransportTypeChange}
            value={transportType}
          >
            <Option value={0}>Đóng hàng</Option>
            <Option value={1}>Giao hàng nhập</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateExternalFleetCost;