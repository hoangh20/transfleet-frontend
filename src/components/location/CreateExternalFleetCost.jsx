import React, { useState,} from 'react';
import { Modal, Form, Select, Button, message } from 'antd';
import LocationSelector from './LocationSelector';
import { createExternalFleetCost } from '../../services/ExternalFleetCostService';

const { Option } = Select;

const CreateExternalFleetCost = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [departure, setDeparture] = useState({});
  const [destination, setDestination] = useState({});
  const [cost, setCost] = useState('');
  const [transportType, setTransportType] = useState(null);
  const [moocType, setMoocType] = useState(null);

  const handleDepartureChange = (location) => {
    setDeparture(location);
  };

  const handleDestinationChange = (location) => {
    setDestination(location);
  };

  const handleTransportTypeChange = (value) => {
    setTransportType(value);
  };

  const handleSubmit = async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const values = await form.validateFields();
      
      if (!departure.provinceCode || !departure.districtCode || !destination.provinceCode || !destination.districtCode || transportType === null) {
        message.error('Vui lòng điền đầy đủ thông tin');
        return;
      }

      const data = {
        partnerId: selectedPartner,
        startPoint: departure,
        endPoint: destination,
        type: transportType,
        moocType: moocType,
        cost: parseFloat(cost),
      };

      await createExternalFleetCost(data);
      message.success('Tạo mới tuyến vận tải thành công');
      onSubmit(data);
      form.resetFields();
      setDeparture({});
      setDestination({});
      setCost('');
      setTransportType(null);
      setMoocType(null);
      setSelectedPartner(null);
      
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Lỗi khi tạo tuyến vận tải');
    }
  };

  return (
    <Modal
      title="Tạo tuyến vận tải mới"
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
        <LocationSelector label="Điểm đi" onChange={handleDepartureChange} />
        <LocationSelector label="Điểm đến" onChange={handleDestinationChange} />
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