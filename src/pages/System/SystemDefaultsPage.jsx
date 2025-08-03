/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, Table, message, Modal, Tag } from 'antd';
import { HistoryOutlined, PlusOutlined,  } from '@ant-design/icons';
import SystemService from '../../services/SystemService';


const NumberInput = (props) => {
  const { value, onChange, ...rest } = props;

  const handleChange = (e) => {
    const newValue = e.target.value.replace(/[^0-9.]/g, ''); // Cho phép nhập số và dấu chấm
    // Đảm bảo chỉ có một dấu chấm
    const parts = newValue.split('.');
    if (parts.length > 2) {
      return; // Không cho phép nhiều hơn một dấu chấm
    }
    onChange(newValue);
  };

  return <Input {...rest} value={value} onChange={handleChange} />;
};

const SystemDefaultsPage = () => {
  const [form] = Form.useForm();
  const [fixedCosts, setFixedCosts] = useState({});
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // State cho maCty
  const [maCtyList, setMaCtyList] = useState([]);
  const [newMaCty, setNewMaCty] = useState('');

  useEffect(() => {
    fetchFixedCosts();
  }, []);

  const fetchFixedCosts = async () => {
    setLoading(true);
    try {
      const response = await SystemService.getFixedCost();
      setFixedCosts(response);
      setInitialValues(response);
      setMaCtyList(response.maCty || []);
      form.setFieldsValue(response);
    } catch (error) {
      message.error('Lỗi khi tải chi phí cố định');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user')); 
      const userId = user?.id;
      
      // Thêm maCty vào values
      const valuesWithMaCty = {
        ...values,
        maCty: maCtyList
      };
      
      const updatedFields = Object.keys(valuesWithMaCty).reduce((acc, key) => {
        if (JSON.stringify(valuesWithMaCty[key]) !== JSON.stringify(initialValues[key])) {
          acc[key] = valuesWithMaCty[key];
        }
        return acc;
      }, {});
      
      if (Object.keys(updatedFields).length > 0) {
        await SystemService.updateFixedCost(fixedCosts._id, updatedFields, userId);
        message.success('Cập nhật chi phí cố định thành công');
        setIsEditing(false);
        fetchFixedCosts();
      } else {
        message.info('Không có thay đổi nào để cập nhật');
        setIsEditing(false);
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật chi phí cố định');
    } finally {
      setLoading(false);
    }
  };

  const showHistoryModal = async (title, type) => {
    setModalTitle(title);
    setLoading(true);
    try {
      const history = await SystemService.getHistory(type);
      setHistoryData(history);
      setModalVisible(true);
    } catch (error) {
      message.error('Lỗi khi tải lịch sử');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý maCty
  const handleAddMaCty = () => {
    if (newMaCty.trim() && !maCtyList.includes(newMaCty.trim().toUpperCase())) {
      setMaCtyList([...maCtyList, newMaCty.trim().toUpperCase()]);
      setNewMaCty('');
    } else if (maCtyList.includes(newMaCty.trim().toUpperCase())) {
      message.warning('Mã công ty đã tồn tại');
    }
  };

  const handleRemoveMaCty = (maCtyToRemove) => {
    setMaCtyList(maCtyList.filter(maCty => maCty !== maCtyToRemove));
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Người thay đổi',
      dataIndex: ['user', 'name'],
      key: 'user.name',
    },
  ];

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={fixedCosts}
      >
        <Card
          title="Các thông số hệ thống"
          bordered={false}
          extra={
            !isEditing && (
              <Button type="primary" onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </Button>
            )
          }
        >
          {/* Phần Mã Công ty */}
          <Card 
            type="inner" 
            title="Danh sách mã công ty" 
            style={{ marginBottom: 24 }}
            size="small"
          >
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={20}>
                <Input
                  placeholder="Nhập mã công ty (VD: TRANSFLEET)"
                  value={newMaCty}
                  onChange={(e) => setNewMaCty(e.target.value.toUpperCase())}
                  onPressEnter={handleAddMaCty}
                  disabled={!isEditing}
                  style={{ textTransform: 'uppercase' }}
                />
              </Col>
              <Col span={4}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddMaCty}
                  disabled={!isEditing || !newMaCty.trim()}
                  block
                >
                  Thêm
                </Button>
              </Col>
            </Row>
            
            <div style={{ minHeight: '60px' }}>
              {maCtyList.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {maCtyList.map((maCty, index) => (
                    <Tag
                      key={index}
                      color="blue"
                      closable={isEditing}
                      onClose={() => handleRemoveMaCty(maCty)}
                      style={{ 
                        fontSize: '14px', 
                        padding: '4px 8px',
                        marginBottom: '8px'
                      }}
                    >
                      {maCty}
                    </Tag>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  color: '#999', 
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '20px 0'
                }}>
                  Chưa có mã công ty nào được thêm
                </div>
              )}
            </div>
          </Card>

          {/* Phần Chi phí cố định */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Chi phí đăng kiểm"
                name="registrationFee"
                rules={[{ required: true, message: 'Vui lòng nhập chi phí đăng kiểm' }]}
              >
                <NumberInput
                  placeholder="Nhập chi phí đăng kiểm"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi chi phí đăng kiểm', 'registrationFee')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Chi phí bảo hiểm"
                name="insurance"
                rules={[{ required: true, message: 'Vui lòng nhập chi phí bảo hiểm' }]}
              >
                <NumberInput
                  placeholder="Nhập chi phí bảo hiểm"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi chi phí bảo hiểm', 'insurance')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Lương đoàn kỹ thuật xe"
                name="technicalTeamSalary"
                rules={[{ required: true, message: 'Vui lòng nhập lương đoàn kỹ thuật xe' }]}
              >
                <NumberInput
                  placeholder="Nhập lương đoàn kỹ thuật xe"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi lương đoàn kỹ thuật xe', 'technicalTeamSalary')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Chi phí vay lãi ngân hàng"
                name="bankLoanInterest"
                rules={[{ required: true, message: 'Vui lòng nhập chi phí vay lãi ngân hàng' }]}
              >
                <NumberInput
                  placeholder="Nhập chi phí vay lãi ngân hàng"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi chi phí vay lãi ngân hàng', 'bankLoanInterest')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Chi phí sửa chữa"
                name="repairCost"
                rules={[{ required: true, message: 'Vui lòng nhập chi phí sửa chữa' }]}
              >
                <NumberInput
                  placeholder="Nhập chi phí sửa chữa"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi chi phí sửa chữa', 'repairCost')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Chi phí vé tháng"
                name="monthlyTicket"
                rules={[{ required: true, message: 'Vui lòng nhập chi phí vé tháng' }]}
              >
                <NumberInput
                  placeholder="Nhập chi phí vé tháng"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi chi phí vé tháng', 'monthlyTicket')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Định mức cấp dầu <8T"
                name="rate8"
                rules={[{ required: true, message: 'Vui lòng nhập định mức nặng' }]}
              >
                <NumberInput
                  placeholder="Nhập định mức cấp dầu <8T"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi định mức', 'rate8')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Định mức cấp dầu < 15T"
                name="rate15"
                rules={[{ required: true, message: 'Vui lòng nhập định mức nhẹ' }]}
              >
                <NumberInput
                  placeholder="Nhập định mức cấp dầu < 15T"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi định mức nhẹ', 'rate15')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Định mức cấp dầu 15-->26T"
                name="rate26"
                rules={[{ required: true, message: 'Vui lòng nhập định mức nặng' }]}
              >
                <NumberInput
                  placeholder="Nhập định mức cấp dầu 15-->26T"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi định mức nặng', 'rate26')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Định mức cấp dầu > 26T"
                name="rate27"
                rules={[{ required: true, message: 'Vui lòng nhập định mức nặng' }]}
              >
                <NumberInput
                  placeholder="Nhập định mức cấp dầu > 26T"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi định mức nặng', 'rate27')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Định mức rỗng cho cấp dầu"
                name="emptyRate"
                rules={[{ required: true, message: 'Vui lòng nhập định mức rỗng' }]}
              >
                <NumberInput
                  placeholder="Nhập định mức rỗng"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi định mức rỗng', 'emptyRate')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Công tác phí kết hợp"
                name="combinedDriverAllowance"
                rules={[{ required: true, message: 'Vui lòng nhập công tác phí kết hợp' }]}
              >
                <NumberInput
                  placeholder="Nhập công tác phí kết hợp"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi công tác phí kết hợp', 'combinedDriverAllowance')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Tỷ lệ VAT"
                name="rateVAT"
                rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ VAT' }]}
              >
                <NumberInput
                  placeholder="Nhập tỷ lệ VAT"
                  suffix={
                    <HistoryOutlined
                      onClick={() => showHistoryModal('Lịch sử thay đổi tỷ lệ VAT', 'rateVAT')}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
          </Row>
          
          {isEditing && (
            <Form.Item>
              <Row gutter={16}>
                <Col>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Cập nhật
                  </Button>
                </Col>
                <Col>
                  <Button 
                    onClick={() => {
                      setIsEditing(false);
                      setMaCtyList(initialValues.maCty || []);
                      form.setFieldsValue(initialValues);
                    }}
                  >
                    Hủy
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          )}
        </Card>
      </Form>

      <Modal
        title={modalTitle}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Table
          columns={columns}
          dataSource={historyData}
          rowKey="_id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default SystemDefaultsPage;