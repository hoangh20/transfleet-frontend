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
  Divider,
  Tooltip,
  Typography,
} from 'antd';
import {  InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { containerFilters } from '../../services/CSSevice';

const { Option } = Select;
const { Text } = Typography;

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
  selectedContainerIds,
  customers, // Thêm prop customers
}) => {
  const [form] = Form.useForm();
  const [localShipSearchText, setLocalShipSearchText] = useState('');
  const [, setIsManualTrainTrip] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setLocalShipSearchText('');
      setIsManualTrainTrip(false);
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Chỉ gửi các field có giá trị
      const updateData = {};
      
      // Text fields
      if (values.containerNumber) updateData.containerNumber = values.containerNumber;
      if (values.line) updateData.line = values.line;
      if (values.PTVC) updateData.PTVC = values.PTVC;
      if (values.item) updateData.item = values.item;
      if (values.salesPerson) updateData.salesPerson = values.salesPerson;
      if (values.closingPoint) updateData.closingPoint = values.closingPoint;
      if (values.fleetClosed) updateData.fleetClosed = values.fleetClosed;
      if (values.soXeDong) updateData.soXeDong = values.soXeDong;
      if (values.returnPoint) updateData.returnPoint = values.returnPoint;
      if (values.fleetReturned) updateData.fleetReturned = values.fleetReturned;
      if (values.soXeTra) updateData.soXeTra = values.soXeTra;
      
      // Select fields (có thể là 0)
      if (values.contType !== undefined && values.contType !== null) updateData.contType = values.contType;
      if (values.closeCombination !== undefined && values.closeCombination !== null) updateData.closeCombination = values.closeCombination;
      if (values.transportDirection !== undefined && values.transportDirection !== null) updateData.transportDirection = values.transportDirection;
      if (values.bill !== undefined && values.bill !== null) updateData.bill = values.bill;
      if (values.writeToSheet !== undefined && values.writeToSheet !== null) updateData.writeToSheet = values.writeToSheet;
      if (values.hasIncidentalCost !== undefined && values.hasIncidentalCost !== null) updateData.hasIncidentalCost = values.hasIncidentalCost;
      
      // Customer field
      if (values.customer) updateData.customer = values.customer;
      
      // Train trip - có thể từ select hoặc manual input
      if (values.trainTrip) updateData.trainTrip = values.trainTrip;
      if (values.manualTrainTrip) updateData.trainTrip = values.manualTrainTrip;
      
      // Date fields
      if (values.date) updateData.date = values.date.toISOString();
      if (values.ETD) updateData.ETD = values.ETD.toISOString();
      if (values.ETA) updateData.ETA = values.ETA.toISOString();
      if (values.untilDate) updateData.untilDate = values.untilDate.toISOString();
      if (values.returnDate) updateData.returnDate = values.returnDate.toISOString();
      if (values.billingDate) updateData.billingDate = values.billingDate.toISOString();

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

  const formatShipScheduleOption = (schedule) => {
    if (!schedule) return '';
    const shipName = schedule.shipName || 'Không có tên';
    const ETD = schedule.ETD ? dayjs(schedule.ETD).format('DD/MM/YYYY') : 'N/A';
    const ETA = schedule.ETA ? dayjs(schedule.ETA).format('DD/MM/YYYY') : 'N/A';
    return `${shipName} | ETD: ${ETD} | ETA: ${ETA}`;
  };

  return (
    <Modal
      title={`Cập nhật hàng loạt ${selectedCount} container`}
      visible={visible}
      onCancel={onCancel}
      width={1000}
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
        {/* Thông tin cơ bản */}
        <Divider orientation="left">Thông tin cơ bản</Divider>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Ngày đóng" name="date">
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
                placeholder="Chọn ngày đóng"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số Container" name="containerNumber">
              <Input placeholder="Nhập số container" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Loại Container" name="contType">
              <Select placeholder="Chọn loại container" allowClear>
                {containerFilters.contType.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Line" name="line">
              <Input placeholder="Nhập Line" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Khách Hàng" name="customer">
              <Select 
                placeholder="Chọn khách hàng"
                showSearch
                allowClear
                filterOption={(input, option) => {
                  const searchText = `${option.label}`.toLowerCase();
                  return searchText.includes(input.toLowerCase());
                }}
              >
                {customers?.map(customer => (
                  <Option 
                    key={customer._id} 
                    value={customer._id}
                    label={`${customer.shortName} - ${customer.name}`}
                  >
                    {customer.shortName} - {customer.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Nhân Viên KD" name="salesPerson">
              <Input placeholder="Nhập nhân viên kinh doanh" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Loại Đóng Hàng" name="closeCombination">
              <Select placeholder="Chọn loại đóng hàng" allowClear>
                {containerFilters.closeCombination.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Mặt Hàng" name="item">
              <Input placeholder="Nhập mặt hàng" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Chiều Vận Chuyển" name="transportDirection">
              <Select placeholder="Chọn chiều vận chuyển" allowClear>
                {containerFilters.transportDirection.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="PTVC" name="PTVC">
              <Input placeholder="Phương tiện vận chuyển" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="HĐ/BK" name="bill">
              <Select placeholder="Chọn loại bill" allowClear>
                {containerFilters.bill.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Ghi vào sheet" name="writeToSheet">
              <Select placeholder="Chọn ghi sheet" allowClear>
                <Option value={0}>Chưa ghi</Option>
                <Option value={1}>Đã ghi</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Thông tin điểm đóng/trả */}
        <Divider orientation="left">Thông tin điểm đóng/trả</Divider>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Điểm Đóng" name="closingPoint">
              <Input placeholder="Nhập điểm đóng" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Đội Đóng" name="fleetClosed">
              <Input placeholder="Nhập đội đóng" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số xe đóng" name="soXeDong">
              <Input placeholder="Nhập số xe đóng" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Điểm Trả" name="returnPoint">
              <Input placeholder="Nhập điểm trả" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Đội Trả" name="fleetReturned">
              <Input placeholder="Nhập đội trả" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số xe trả" name="soXeTra">
              <Input placeholder="Nhập số xe trả" />
            </Form.Item>
          </Col>
        </Row>

        {/* Thông tin chuyến tàu */}
        <Divider orientation="left">Thông tin chuyến tàu</Divider>
        
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Chọn chuyến tàu có sẵn</span>
                  <Tooltip title="Chọn chuyến tàu để tự động điền thông tin Chuyến tàu, ETD và ETA">
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </div>
              }
              name="trainTrip"
            >
              <Select
                showSearch
                placeholder="Tìm kiếm và chọn chuyến tàu..."
                value={localShipSearchText || undefined}
                onSearch={handleShipSearch}
                onSelect={handleShipSelectInternal}
                onClear={() => {
                  setLocalShipSearchText('');
                  form.setFieldsValue({
                    trainTrip: undefined,
                    ETD: undefined,
                    ETA: undefined,
                  });
                }}
                allowClear
                filterOption={false}
                style={{ width: '100%' }}
                dropdownStyle={{ maxHeight: 300 }}
                loading={loading}
                notFoundContent={
                  loading ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <Text type="secondary">Đang tìm kiếm...</Text>
                    </div>
                  ) : localShipSearchText ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <Text type="secondary">
                        Không tìm thấy chuyến tàu với từ khóa "{localShipSearchText}"
                      </Text>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <Text type="secondary">Nhập tên tàu để tìm kiếm</Text>
                    </div>
                  )
                }
              >
                {shipSchedules.map(schedule => (
                  <Option 
                    key={schedule._id} 
                    value={schedule._id}
                    title={formatShipScheduleOption(schedule)}
                  >
                    <div style={{ padding: '4px 0' }}>
                      <div style={{ fontWeight: 500, color: '#1890ff' }}>
                        {schedule.shipName || 'Không có tên'}
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>
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
          <Col span={24}>
            <Form.Item
              label="Hoặc nhập tên chuyến tàu thủ công"
              name="manualTrainTrip"
            >
              <Input 
                placeholder="Nhập tên chuyến tàu thủ công" 
                onChange={(e) => {
                  if (e.target.value) {
                    setIsManualTrainTrip(true);
                    form.setFieldsValue({ trainTrip: undefined });
                  } else {
                    setIsManualTrainTrip(false);
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="ETD (Ngày khởi hành)" name="ETD">
              <DatePicker 
                placeholder="Chọn ngày khởi hành"
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="ETA (Ngày đến)" name="ETA">
              <DatePicker 
                placeholder="Chọn ngày đến"
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Ngày Lưu Đến" name="untilDate">
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
                placeholder="Chọn ngày lưu đến"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Ngày Trả Hàng" name="returnDate">
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
                placeholder="Chọn ngày trả hàng"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ngày Lập Bill" name="billingDate">
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
                placeholder="Chọn ngày lập bill"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Chi phí phát sinh */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Chi phí phát sinh" name="hasIncidentalCost">
              <Select placeholder="Chọn chi phí phát sinh" allowClear>
                <Option value={0}>Không có</Option>
                <Option value={1}>Có</Option>
              </Select>
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
            <strong>Lưu ý:</strong> 
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>Chỉ các trường có giá trị sẽ được cập nhật</li>
              <li>Các trường để trống sẽ không thay đổi giá trị hiện tại</li>
              <li>Có thể chọn chuyến tàu có sẵn hoặc nhập thủ công</li>
              <li>Khi chọn chuyến tàu có sẵn, ETD và ETA sẽ được tự động điền</li>
            </ul>
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: 8 }}>
            Sẽ cập nhật <strong>{selectedCount}</strong> container được chọn
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default BulkUpdateModal;