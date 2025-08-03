import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  message, 
  Button, 
  Select, 
  Tag, 
  Row, 
  Col,
  Card,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BarcodeOutlined,
  TagsOutlined,
  BankOutlined
} from '@ant-design/icons';
import { createCustomer } from '../../services/CustomerService';
import SystemService from '../../services/SystemService';

const { Option } = Select;

const CreateCustomerModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingMaCty, setLoadingMaCty] = useState(false);
  const [availableMaCty, setAvailableMaCty] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    if (visible) {
      fetchMaCtyOptions();
      form.resetFields();
      setSelectedItems([]);
      setNewItem('');
    }
  }, [visible, form]);

  const fetchMaCtyOptions = async () => {
    try {
      setLoadingMaCty(true);
      const response = await SystemService.getFixedCost();
      
      // Xử lý response trực tiếp vì API trả về object chứa maCty array
      if (response && response.maCty && Array.isArray(response.maCty)) {
        setAvailableMaCty(response.maCty);
      } else {
        console.warn('Không tìm thấy maCty trong response:', response);
        setAvailableMaCty([]);
      }
    } catch (error) {
      console.error('Error fetching maCty options:', error);
      message.error('Lỗi khi tải danh sách mã công ty');
      setAvailableMaCty([]);
    } finally {
      setLoadingMaCty(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const customerData = {
        ...values,
        items: selectedItems
      };
      
      await createCustomer(customerData);
      message.success('Tạo khách hàng thành công');
      onSuccess();
    } catch (error) {
      if (error.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin');
      } else {
        message.error('Lỗi khi tạo khách hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (newItem.trim() && !selectedItems.includes(newItem.trim())) {
      setSelectedItems([...selectedItems, newItem.trim()]);
      setNewItem('');
    } else if (selectedItems.includes(newItem.trim())) {
      message.warning('Mặt hàng này đã tồn tại');
    }
  };

  const handleRemoveItem = (itemToRemove) => {
    setSelectedItems(selectedItems.filter(item => item !== itemToRemove));
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span>Thêm khách hàng mới</span>
        </div>
      }
      open={visible}
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
          Tạo khách hàng
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {/* Thông tin cơ bản */}
        <Card size="small" title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên đầy đủ"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên đầy đủ' }]}
              >
                <Input 
                  placeholder="Nhập tên đầy đủ khách hàng" 
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên viết tắt"
                name="shortName"
                rules={[{ required: true, message: 'Vui lòng nhập tên viết tắt' }]}
              >
                <Input 
                  placeholder="Nhập tên viết tắt" 
                  prefix={<TagsOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mã khách hàng"
            name="customerCode"
            rules={[{ required: true, message: 'Vui lòng nhập mã khách hàng' }]}
          >
            <Input 
              placeholder="Nhập mã khách hàng duy nhất" 
              prefix={<BarcodeOutlined />}
            />
          </Form.Item>
        </Card>

        {/* Thông tin liên hệ */}
        <Card size="small" title="Thông tin liên hệ" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input 
                  placeholder="Nhập email khách hàng" 
                  prefix={<MailOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
              >
                <Input 
                  placeholder="Nhập số điện thoại" 
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Mã công ty */}
        <Card 
          size="small" 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BankOutlined style={{ color: '#1890ff' }} />
              <span>Mã công ty</span>
              {loadingMaCty && <Spin size="small" />}
            </div>
          } 
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            label="Chọn mã công ty"
            name="maCty"
            help="Chọn một hoặc nhiều mã công ty mà khách hàng thuộc về"
          >
            <Select
              mode="multiple"
              placeholder={loadingMaCty ? "Đang tải danh sách mã công ty..." : "Chọn các mã công ty"}
              loading={loadingMaCty}
              disabled={loadingMaCty}
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.value.toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={loadingMaCty ? <Spin size="small" /> : 'Không tìm thấy mã công ty'}
            >
              {availableMaCty.map(ma => (
                <Option key={ma} value={ma}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BankOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    <span style={{ fontWeight: 500 }}>{ma}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          {/* Hiển thị thống kê mã công ty */}
          {availableMaCty.length > 0 && (
            <div style={{ 
              fontSize: 12, 
              color: '#666', 
              marginTop: 8,
              padding: 8,
              backgroundColor: '#f5f5f5',
              borderRadius: 4
            }}>
              📊 Có {availableMaCty.length} mã công ty khả dụng: {availableMaCty.join(', ')}
            </div>
          )}
        </Card>

        {/* Mặt hàng */}
        <Card size="small" title="Danh sách mặt hàng">
          <Form.Item label="Thêm mặt hàng mới">
            <Row gutter={8}>
              <Col flex="auto">
                <Input
                  placeholder="Nhập tên mặt hàng"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onPressEnter={handleAddItem}
                />
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                  disabled={!newItem.trim()}
                >
                  Thêm
                </Button>
              </Col>
            </Row>
          </Form.Item>

          {selectedItems.length > 0 && (
            <Form.Item label="Các mặt hàng đã thêm">
              <div style={{ 
                border: '1px solid #d9d9d9', 
                borderRadius: 6, 
                padding: 8,
                minHeight: 40,
                maxHeight: 120,
                overflowY: 'auto',
                backgroundColor: '#fafafa'
              }}>
                {selectedItems.map((item, index) => (
                  <Tag
                    key={index}
                    closable
                    onClose={() => handleRemoveItem(item)}
                    style={{ marginBottom: 4 }}
                    color="green"
                  >
                    <TagsOutlined style={{ marginRight: 4 }} />
                    {item}
                  </Tag>
                ))}
              </div>
            </Form.Item>
          )}
        </Card>
      </Form>
    </Modal>
  );
};

export default CreateCustomerModal;
