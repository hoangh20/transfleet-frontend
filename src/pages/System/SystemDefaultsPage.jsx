/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, Table, message, Modal } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import SystemService from '../../services/SystemService';

const formatNumber = (value) => {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const NumberInput = (props) => {
  const { value, onChange, ...rest } = props;

  const handleChange = (e) => {
    const formattedValue = formatNumber(e.target.value.replace(/\./g, ''));
    onChange(formattedValue);
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

  useEffect(() => {
    fetchFixedCosts();
  }, []);

  const fetchFixedCosts = async () => {
    setLoading(true);
    try {
      const response = await SystemService.getFixedCost();
      setFixedCosts(response);
      setInitialValues(response);
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
      const updatedFields = Object.keys(values).reduce((acc, key) => {
        if (values[key] !== initialValues[key]) {
          acc[key] = values[key];
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
          title="Chi phí cố định"
          bordered={false}
          extra={
            !isEditing && (
              <Button type="primary" onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </Button>
            )
          }
        >
          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
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
            <Col span={12}>
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
            <Col span={12}>
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
            <Col span={12}>
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
          </Row>
          {isEditing && (
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
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