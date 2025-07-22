import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
  Input,
  Button,
  Space,
  message,
  Typography,
  Alert,
} from 'antd';
import dayjs from 'dayjs';
import {
  createContainerIncidentalCost,
  updateContainerIncidentalCost,
  getContainersForDropdown,
} from '../../services/CSSevice';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const ContainerIncidentalCostModal = ({
  visible,
  onCancel,
  editingRecord,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // States cho container dropdown
  const [containers, setContainers] = useState([]);
  const [containerLoading, setContainerLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [containerSearchText, setContainerSearchText] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [selectedContainer, setSelectedContainer] = useState(null);
  
  // States cho validation tổng chi phí
  const [totalAmount, setTotalAmount] = useState(0);
  const [detailAmounts, setDetailAmounts] = useState({
    doiXe: 0,
    khachHang: 0,
    hangTau: 0,
    congTy: 0
  });

  // Mapping cho loại chi phí
  const costTypeOptions = [
    { value: 0, label: 'Phí quá tải', color: 'red' },
    { value: 1, label: 'Phát sinh lưu bãi', color: 'orange' },
    { value: 2, label: 'Sai tên mặt hàng', color: 'yellow' },
    { value: 3, label: 'Bốc xếp', color: 'blue' },
    { value: 4, label: 'Sửa chữa', color: 'purple' },
    { value: 5, label: 'Khác', color: 'default' },
  ];

  // Mapping cho trạng thái thanh toán
  const statusOptions = [
    { value: 0, label: 'Chưa thanh toán', color: 'red' },
    { value: 1, label: 'Đã thanh toán', color: 'green' },
  ];

  // Load containers when modal opens
  useEffect(() => {
    if (visible) {
      fetchContainers();
    }
  }, [visible]);

  // Set form values when editing record or containers change
  useEffect(() => {
    if (visible && editingRecord) {
      // Set container info from editingRecord
      if (editingRecord.container) {
        setSelectedContainer({
          _id: editingRecord.container._id,
          containerNumber: editingRecord.container.containerNumber,
          date: editingRecord.container.date,
          line: editingRecord.container.line,
          customer: editingRecord.container.customer
        });
      }
      
      form.setFieldsValue({
        ...editingRecord,
        container: editingRecord.container?._id,
        createdAt: editingRecord.createdAt ? dayjs(editingRecord.createdAt) : null,
        paymentDate: editingRecord.paymentDate ? dayjs(editingRecord.paymentDate) : null,
      });
      
      // Set initial values for validation
      setTotalAmount(editingRecord.amount || 0);
      setDetailAmounts({
        doiXe: editingRecord.doiXe || 0,
        khachHang: editingRecord.khachHang || 0,
        hangTau: editingRecord.hangTau || 0,
        congTy: editingRecord.congTy || 0
      });
    } else if (visible && !editingRecord) {
      // Reset for new record
      form.resetFields();
      setSelectedContainer(null);
      setContainerSearchText('');
      setTotalAmount(0);
      setDetailAmounts({
        doiXe: 0,
        khachHang: 0,
        hangTau: 0,
        congTy: 0
      });
    }
  }, [visible, editingRecord, form]);

  const fetchContainers = async (searchTerm = '') => {
    setContainerLoading(true);
    try {
      const response = await getContainersForDropdown(searchTerm);
      if (response.status === 'OK') {
        setContainers(response.data || []);
      } else {
        console.error('Error fetching containers:', response.message);
      }
    } catch (error) {
      console.error('Error fetching containers:', error);
      message.error('Lỗi khi tải danh sách container');
    } finally {
      setContainerLoading(false);
    }
  };

  // Handle container search in dropdown
  const handleContainerSearch = (value) => {
    setContainerSearchText(value);
    if (value && value.length >= 2) {
      fetchContainers(value);
    } else if (!value) {
      fetchContainers();
    }
  };

  // Handle container selection
  const handleContainerSelect = (value) => {
    const container = containers.find(c => c._id === value);
    setSelectedContainer(container);
    setContainerSearchText(''); // Clear search text after selection
  };

  // Handle total amount change
  const handleTotalAmountChange = (value) => {
    setTotalAmount(value || 0);
  };

  // Handle detail amount change
  const handleDetailAmountChange = (field, value) => {
    setDetailAmounts(prev => ({
      ...prev,
      [field]: value || 0
    }));
  };

  // Calculate total of detail amounts
  const getDetailTotal = () => {
    return detailAmounts.doiXe + detailAmounts.khachHang + detailAmounts.hangTau + detailAmounts.congTy;
  };

  // Check if amounts are balanced
  const isAmountBalanced = () => {
    return totalAmount === getDetailTotal() && totalAmount > 0;
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const handleSubmit = async (values) => {
    // Validate amount balance
    if (!isAmountBalanced()) {
      message.error('Tổng chi phí phải bằng tổng của các khoản chi phí chi tiết và lớn hơn 0!');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...values,
        createdAt: values.createdAt?.toDate(),
        paymentDate: values.paymentDate?.toDate(),
      };

      let response;
      if (editingRecord) {
        response = await updateContainerIncidentalCost(editingRecord._id, submitData);
        if (response.status === 'OK') {
          message.success('Cập nhật chi phí phát sinh thành công');
        } else {
          message.error(response.message || 'Lỗi khi cập nhật chi phí phát sinh');
          return;
        }
      } else {
        response = await createContainerIncidentalCost(submitData);
        if (response.status === 'OK') {
          message.success('Thêm chi phí phát sinh thành công');
        } else {
          message.error(response.message || 'Lỗi khi thêm chi phí phát sinh');
          return;
        }
      }
      
      handleCancel();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting:', error);
      message.error('Lỗi khi lưu chi phí phát sinh');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setContainerSearchText('');
    setSelectedContainer(null);
    setTotalAmount(0);
    setDetailAmounts({
      doiXe: 0,
      khachHang: 0,
      hangTau: 0,
      congTy: 0
    });
    onCancel?.();
  };

  return (
    <Modal
      title={editingRecord ? 'Cập Nhật Chi Phí Phát Sinh' : 'Thêm Chi Phí Phát Sinh'}
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="container"
              label="Container"
              rules={[{ required: true, message: 'Vui lòng chọn container' }]}
            >
              <Select
                placeholder="Chọn container"
                showSearch
                loading={containerLoading}
                onSearch={handleContainerSearch}
                onSelect={handleContainerSelect}
                filterOption={false}
                notFoundContent={containerLoading ? 'Đang tải...' : 'Không tìm thấy'}
                allowClear
                value={form.getFieldValue('container')}
              >
                {containers.map(container => (
                  <Option key={container._id} value={container._id}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {container.containerNumber} - {container.date ? dayjs(container.date).format('DD/MM/YYYY') : 'N/A'} - {container.line || 'N/A'} - {container.customer?.shortName || 'N/A'}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="costType"
              label="Loại Chi Phí"
              rules={[{ required: true, message: 'Vui lòng chọn loại chi phí' }]}
            >
              <Select placeholder="Chọn loại chi phí">
                {costTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="amount"
              label="Tổng Chi Phí (VNĐ)"
              rules={[
                { required: true, message: 'Vui lòng nhập tổng chi phí' },
                { type: 'number', min: 1, message: 'Chi phí phải lớn hơn 0' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập tổng chi phí"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                onChange={handleTotalAmountChange}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Trạng Thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select placeholder="Chọn trạng thái">
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Amount validation display */}
        {(totalAmount > 0 || getDetailTotal() > 0) && (
          <Row style={{ marginBottom: 16 }}>
            <Col span={24}>
              <Alert
                type={isAmountBalanced() ? 'success' : 'warning'}
                message={
                  <Space direction="vertical" size={0}>
                    <div>
                      <Text>Tổng chi phí: </Text>
                      <Text strong style={{ color: '#1890ff' }}>
                        {formatCurrency(totalAmount)} VNĐ
                      </Text>
                    </div>
                    <div>
                      <Text>Tổng chi tiết: </Text>
                      <Text strong style={{ color: isAmountBalanced() ? '#52c41a' : '#fa8c16' }}>
                        {formatCurrency(getDetailTotal())} VNĐ
                      </Text>
                    </div>
                    {!isAmountBalanced() && totalAmount > 0 && (
                      <div>
                        <Text type="warning">
                          Chênh lệch: {formatCurrency(Math.abs(totalAmount - getDetailTotal()))} VNĐ
                        </Text>
                      </div>
                    )}
                  </Space>
                }
                showIcon
              />
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="doiXe"
              label="Đội Xe (VNĐ)"
              rules={[{ required: true, message: 'Vui lòng nhập chi phí đội xe' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Chi phí đội xe"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                min={0}
                onChange={(value) => handleDetailAmountChange('doiXe', value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="khachHang"
              label="Khách Hàng (VNĐ)"
              rules={[{ required: true, message: 'Vui lòng nhập chi phí khách hàng' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Chi phí khách hàng"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                min={0}
                onChange={(value) => handleDetailAmountChange('khachHang', value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="hangTau"
              label="Hãng Tàu (VNĐ)"
              rules={[{ required: true, message: 'Vui lòng nhập chi phí hãng tàu' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Chi phí hãng tàu"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                min={0}
                onChange={(value) => handleDetailAmountChange('hangTau', value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="congTy"
              label="Công Ty (VNĐ)"
              rules={[{ required: true, message: 'Vui lòng nhập chi phí công ty' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Chi phí công ty"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                min={0}
                onChange={(value) => handleDetailAmountChange('congTy', value)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="createdAt"
              label="Ngày Phát Sinh"
            >
              <DatePicker 
                placeholder="Chọn ngày phát sinh"
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="paymentDate"
              label="Ngày Thanh Toán"
            >
              <DatePicker 
                placeholder="Chọn ngày thanh toán"
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Mô Tả Chi Tiết"
        >
          <TextArea
            placeholder="Nhập mô tả chi tiết về chi phí phát sinh"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="note"
          label="Ghi Chú"
        >
          <TextArea
            placeholder="Nhập ghi chú bổ sung"
            rows={2}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Space>
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              disabled={!isAmountBalanced()}
            >
              {editingRecord ? 'Cập Nhật' : 'Thêm Mới'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ContainerIncidentalCostModal;