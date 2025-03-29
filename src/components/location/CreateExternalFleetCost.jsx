import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Button, message, Input } from 'antd';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import LocationSelector from './LocationSelector';
import { createExternalFleetCost } from '../../services/ExternalFleetCostService';

const { Option } = Select;

const CreateExternalFleetCost = ({ visible, onCancel, onSubmit, initialData }) => {
  const [form] = Form.useForm();
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [departure, setDeparture] = useState(initialData?.startPoint || {});
  const [destination, setDestination] = useState(initialData?.endPoint || {});
  const [cost, setCost] = useState('');
  const [transportType, setTransportType] = useState(initialData?.transportType || null);
  const [moocType, setMoocType] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    if (initialData) {
      setDeparture(initialData.startPoint || {});
      setDestination(initialData.endPoint || {});
      setTransportType(initialData.transportType || 0);
      form.setFieldsValue({
        departure: initialData.startPoint || {},
        destination: initialData.endPoint || {},
        transportType: initialData.transportType || 0,

      });
    }
  }, [initialData, form]);

  const handleTransportTypeChange = (value) => {
    setTransportType(value);
  };

  const handleSubmit = async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const values = await form.validateFields();

      if (
        !departure.provinceCode ||
        !departure.districtCode ||
        !destination.provinceCode ||
        !destination.districtCode ||
        transportType === null
      ) {
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
      };

      const response = await createExternalFleetCost(data);
      console.log('API Response:', response);

      if (response &&  response._id) {
        message.success('Tạo mới tuyến vận tải thành công');
        const routeType = response.type === 0 ? 'delivery' : 'packing';
        navigate(`/transport-route/${routeType}/${response._id}`);
      } else {
        message.error('Không thể lấy thông tin tuyến vận tải vừa tạo.');
        return;
      }

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
        <LocationSelector label="Điểm đi" value={departure} onChange={setDeparture} />
        <LocationSelector label="Điểm đến" value={destination} onChange={setDestination} />
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
      </Form>
    </Modal>
  );
};

export default CreateExternalFleetCost;