import React, { useState,} from 'react';
import { Modal, Form, Select, Button, message,Input } from 'antd';
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
        driverAllowance: parseFloat(cost.driverAllowance),
        driverSalary: parseFloat(cost.driverSalary),
        solidDistance: parseFloat(cost.solidDistance),
        emtyDistance: parseFloat(cost.emtyDistance),
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
            <Option value={0}>Giao hàng nhập</Option>
            <Option value={1}>Đóng hàng</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Công tác phí">
          <Input
            type="number"
            placeholder="Nhập công tác phí"
            value={cost.driverAllowance || ''}
            onChange={(e) => setCost({ ...cost, driverAllowance: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Lương tài xế">
          <Input
            type="number"
            placeholder="Nhập lương tài xế"
            value={cost.driverSalary || ''}
            onChange={(e) => setCost({ ...cost, driverSalary: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Khoảng cách đặc">
          <Input
            type="number"
            placeholder="Nhập khoảng cách đặc"
            value={cost.solidDistance || ''}
            onChange={(e) => setCost({ ...cost, solidDistance: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Khoảng cách rỗng">
          <Input
            type="number"
            placeholder="Nhập khoảng cách rỗng"
            value={cost.emtyDistance || ''}
            onChange={(e) => setCost({ ...cost, emtyDistance: e.target.value })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateExternalFleetCost;