import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Button,
  message,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const BulkUpdateModal = ({
  visible,
  onCancel,
  onSubmit,
  loading,
  shipSchedules,
  onShipSearch,
  onShipSelect,
  shipSearchText,
  selectedCount,
  selectedContainerIds, // Thêm prop này để nhận danh sách ID containers
}) => {
  const [form] = Form.useForm();
  const [localShipSearchText, setLocalShipSearchText] = useState('');

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setLocalShipSearchText('');
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Chỉ gửi các field có giá trị
      const updateData = {};
      
      if (values.line) updateData.line = values.line;
      if (values.PTVC) updateData.PTVC = values.PTVC;
      if (values.trainTrip) updateData.trainTrip = values.trainTrip;
      if (values.ETD) updateData.ETD = values.ETD.toISOString();
      if (values.ETA) updateData.ETA = values.ETA.toISOString();

      if (Object.keys(updateData).length === 0) {
        message.warning('Vui lòng nhập ít nhất một trường để cập nhật');
        return;
      }

      // Tạo array theo format yêu cầu
      const bulkUpdatePayload = selectedContainerIds.map(containerId => ({
        id: containerId,
        data: updateData
      }));

      onSubmit(bulkUpdatePayload);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleShipSearch = (value) => {
    setLocalShipSearchText(value);
    onShipSearch(value);
  };

  const handleShipSelectInternal = (value, option) => {
    onShipSelect(value, option, form);
    setLocalShipSearchText('');
  };

  return (
    <Modal
      title={`Cập nhật ${selectedCount} container`}
      visible={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={handleSubmit}
        >
          Cập nhật
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Line"
              name="line"
            >
              <Input placeholder="Nhập Line" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="PTVC"
              name="PTVC"
            >
              <Input placeholder="Nhập PTVC" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Chuyến tàu"
              name="trainTrip"
            >
              <Select
                showSearch
                placeholder="Tìm và chọn chuyến tàu"
                value={localShipSearchText}
                onSearch={handleShipSearch}
                onSelect={handleShipSelectInternal}
                filterOption={false}
                notFoundContent={
                  <div style={{ textAlign: 'center', padding: 8 }}>
                    <SearchOutlined style={{ fontSize: 16, color: '#999' }} />
                    <div style={{ marginTop: 4, color: '#999' }}>
                      Tìm kiếm chuyến tàu...
                    </div>
                  </div>
                }
                allowClear
                onClear={() => {
                  setLocalShipSearchText('');
                  form.setFieldsValue({
                    trainTrip: undefined,
                    ETD: undefined,
                    ETA: undefined,
                  });
                }}
              >
                {shipSchedules.map((schedule) => (
                  <Option 
                    key={schedule._id} 
                    value={schedule._id}
                    label={schedule.shipName}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {schedule.shipName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        ETD: {schedule.ETD ? dayjs(schedule.ETD).format('DD/MM/YYYY') : 'N/A'} | 
                        ETA: {schedule.ETA ? dayjs(schedule.ETA).format('DD/MM/YYYY') : 'N/A'}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ETD (Ngày khởi hành)"
              name="ETD"
            >
              <DatePicker 
                placeholder="Chọn ngày khởi hành"
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="ETA (Ngày đến)"
              name="ETA"
            >
              <DatePicker 
                placeholder="Chọn ngày đến"
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ 
          background: '#f5f5f5', 
          padding: 12, 
          borderRadius: 6, 
          marginTop: 16 
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <strong>Lưu ý:</strong> Chỉ các trường có giá trị sẽ được cập nhật. 
            Các trường để trống sẽ không thay đổi giá trị hiện tại.
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: 8 }}>
            Sẽ cập nhật {selectedCount} container với cùng thông tin
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default BulkUpdateModal;