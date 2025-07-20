import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Row,
  Col,
  Input,
  DatePicker,
  Select,
  Button,
  Space,
  Divider,
  Tooltip,
  Typography,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { containerFilters } from '../../services/CSSevice';

const { Option } = Select;
const { Text } = Typography;

const ContainerFormModal = ({
  visible,
  onCancel,
  onSubmit,
  editingRecord,
  customers,
  shipSchedules,
  loading,
  onShipSearch,
  onShipSelect,
  shipSearchText,
  onFetchShipSchedules,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        customer: editingRecord.customer?._id || editingRecord.customer,
        date: editingRecord.date ? dayjs(editingRecord.date) : null,
        ETD: editingRecord.ETD ? dayjs(editingRecord.ETD) : null,
        ETA: editingRecord.ETA ? dayjs(editingRecord.ETA) : null,
        untilDate: editingRecord.untilDate ? dayjs(editingRecord.untilDate) : null,
        returnDate: editingRecord.returnDate ? dayjs(editingRecord.returnDate) : null,
        billingDate: editingRecord.billingDate ? dayjs(editingRecord.billingDate) : null,
      });
    } else if (visible && !editingRecord) {
      form.resetFields();
    }
  }, [visible, editingRecord, form]);

  const handleSubmit = async (values) => {
    const submitData = {
      ...values,
      date: values.date ? values.date.format('YYYY-MM-DD') : null,
      ETD: values.ETD ? values.ETD.format('YYYY-MM-DD') : null,
      ETA: values.ETA ? values.ETA.format('YYYY-MM-DD') : null,
      untilDate: values.untilDate ? values.untilDate.format('YYYY-MM-DD') : null,
      returnDate: values.returnDate ? values.returnDate.format('YYYY-MM-DD') : null,
      billingDate: values.billingDate ? values.billingDate.format('YYYY-MM-DD') : null,
    };
    onSubmit(submitData);
  };

  const formatShipScheduleOption = (schedule) => {
    if (!schedule) return '';
    const shipName = schedule.shipName || 'Không có tên';
    const ETD = schedule.ETD ? dayjs(schedule.ETD).format('DD/MM/YYYY') : 'N/A';
    const ETA = schedule.ETA ? dayjs(schedule.ETA).format('DD/MM/YYYY') : 'N/A';
    const note = schedule.note ? ` | Ghi chú: ${schedule.note}` : '';
    return `${shipName} | ETD: ${ETD} | ETA: ${ETA}${note}`;
  };

  return (
    <Modal
      title={editingRecord ? 'Chỉnh Sửa Container' : 'Thêm Container Mới'}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Ngày đóng" name="date">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số Container" name="containerNumber">
              <Input placeholder="Nhập số container" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Loại Container" name="contType">
              <Select placeholder="Chọn loại container">
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
            <Form.Item
              label="Khách Hàng"
              name="customer"
              rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
            >
              <Select 
                placeholder="Chọn khách hàng"
                showSearch
                filterOption={(input, option) => {
                  const searchText = `${option.label}`.toLowerCase();
                  return searchText.includes(input.toLowerCase());
                }}
              >
                {customers.map(customer => (
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
              <Select placeholder="Chọn loại đóng hàng">
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
              <Select placeholder="Chọn chiều vận chuyển">
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
            <Form.Item
              label="Số xe đóng"
              name="soXeDong"
            >
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
            <Form.Item
              label="Số xe trả"
              name="soXeTra"
            >
              <Input placeholder="Nhập số xe trả" />
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
            <Form.Item label="Chuyến Tàu" name="trainTrip">
              <Input placeholder="Nhập chuyến tàu" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="HĐ/BK" name="bill">
              <Select placeholder="Chọn loại bill">
                {containerFilters.bill.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Chọn Chuyến Tàu (Tùy chọn)</Divider>
        
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Tìm và chọn chuyến tàu</span>
                  <Tooltip title="Chọn chuyến tàu để tự động điền thông tin Chuyến tàu, ETD và ETA">
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </div>
              }
            >
              <Select
                showSearch
                placeholder="Tìm kiếm và chọn chuyến tàu..."
                value={shipSearchText || undefined}
                onSearch={onShipSearch}
                onSelect={(value, option) => onShipSelect(value, option, form)}
                onClear={() => {
                  onShipSearch('');
                  onFetchShipSchedules('');
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
                  ) : shipSearchText ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <Text type="secondary">
                        Không tìm thấy chuyến tàu với từ khóa "{shipSearchText}"
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
                      {schedule.note && (
                        <div style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>
                          {schedule.note}
                        </div>
                      )}
                    </div>
                  </Option>
                ))}
              </Select>
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                {shipSearchText ? 
                  `Tìm thấy ${shipSchedules.length} chuyến tàu với từ khóa "${shipSearchText}"` :
                  `Có ${shipSchedules.length} chuyến tàu`
                }
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="ETD" name="ETD">
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Ngày tàu chạy" 
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="ETA" name="ETA">
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Ngày tàu đến" 
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Ngày Lưu Đến" name="untilDate">
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Ngày Trả Hàng" name="returnDate">
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Ngày Lập" name="billingDate">
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Row justify="end">
          <Space>
            <Button onClick={onCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingRecord ? 'Cập Nhật' : 'Tạo Mới'}
            </Button>
          </Space>
        </Row>
      </Form>
    </Modal>
  );
};

export default ContainerFormModal;