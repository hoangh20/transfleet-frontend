import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Avatar,
  Typography,
  Row,
  Col,
  Tag,
  Statistic,
  Select,
  Modal,
  Button,
  Form,
  Input,
  Spin,
  message,
} from 'antd';
import {
  PhoneOutlined,
  IdcardOutlined,
  ExperimentOutlined,
  BankOutlined,
  CarOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  getDriverDetails,
  updateDriver,
  deleteDriver,
} from '../../services/DriverService';
import dayjs from 'dayjs';
const { Title, Text } = Typography;

const DriverDetail = ({ driverId, onDeleteSuccess, onUpdateSuccess }) => {
  const [driver, setDriver] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  // Fetch driver details
  const fetchDriverDetails = useCallback(async () => {
    try {
      const driverData = await getDriverDetails(driverId);
      setDriver(driverData);
      form.setFieldsValue({
        name: driverData.name,
        phone: driverData.phone,
        licenseType: driverData.licenseType,
        birthDate: driverData.birthDate,
        bankAccount: driverData.bankAccount,
        citizenID: driverData.citizenID,
        yearsOfExperience: driverData.yearsOfExperience,
      });
    } catch (error) {
      message.error('Không thể tải thông tin tài xế');
    }
  }, [driverId, form]);

  useEffect(() => {
    fetchDriverDetails();
  }, [fetchDriverDetails]);

  // Calculate success rate
  const successRate =
    driver && driver.successfulTrips + driver.failedTrips === 0
      ? 'N/A'
      : driver
        ? (
            (driver.successfulTrips /
              (driver.successfulTrips + driver.failedTrips)) *
            100
          ).toFixed(1)
        : 'N/A';

  const handleDeleteDriver = async () => {
    setLoading(true);
    try {
      await deleteDriver(driverId);
      message.success('Xóa tài xế thành công');
      onDeleteSuccess?.();
      setIsDeleteModalVisible(false);
      window.location.reload(); // Reload lại trang sau khi xóa tài xế
    } catch (error) {
      message.error('Xóa tài xế thất bại');
    } finally {
      setLoading(false);
    }
  };
  const calculateAge = (birthDate) => {
    return dayjs().diff(dayjs(birthDate), 'year');
  };

  const handleUpdateDriver = async (values) => {
    setLoading(true);
    try {
      await updateDriver(driverId, values);
      message.success('Cập nhật thông tin thành công');
      await fetchDriverDetails(); // Refresh data
      onUpdateSuccess?.();
      setIsEditing(false);
      window.location.reload(); // Reload lại trang sau khi cập nhật thông tin tài xế
    } catch (error) {
      message.error('Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Render driver information
  const renderDriverInfo = () => {
    if (!driver) return null;

    return (
      <Row gutter={[16, 24]}>
        <Col span={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PhoneOutlined style={{ color: '#1890ff' }} />
            <Text copyable>{driver.phone}</Text>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExperimentOutlined style={{ color: '#1890ff' }} />
            <Text>{driver.yearsOfExperience} năm kinh nghiệm</Text>
          </div>
        </Col>

        <Col span={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IdcardOutlined style={{ color: '#1890ff' }} />
            <Tag color='blue'>{driver.licenseType}</Tag>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined style={{ color: '#1890ff' }} />
            <Text copyable>{driver.bankAccount}</Text>
          </div>
        </Col>

        <Col span={8}>
          <Statistic
            title='Thành công'
            value={driver.successfulTrips}
            valueStyle={{ color: '#3f8600' }}
            prefix='✓'
          />
        </Col>
        <Col span={8}>
          <Statistic
            title='Thất bại'
            value={driver.failedTrips}
            valueStyle={{ color: '#cf1322' }}
            prefix='✗'
          />
        </Col>
        <Col span={8}>
          <Statistic
            title='Tỷ lệ thành công'
            value={successRate}
            suffix={successRate === 'N/A' ? '' : '%'}
            valueStyle={{ color: '#1890ff' }}
            prefix='★'
          />
        </Col>

        <Col span={24}>
          <Card
            size='small'
            title={
              <>
                <CarOutlined /> Thống kê chuyến đi
              </>
            }
            style={{ background: '#f5f5f5', borderRadius: '8px' }}
          >
            <Text>
              Tổng số chuyến: {driver.successfulTrips + driver.failedTrips}
            </Text>
          </Card>
        </Col>
      </Row>
    );
  };

  // Render edit form
  const renderEditForm = () => (
    <Form
      form={form}
      onFinish={handleUpdateDriver}
      layout='vertical'
      initialValues={{
        name: driver.name,
        phone: driver.phone,
        licenseType: driver.licenseType,
        bankAccount: driver.bankAccount,
        yearsOfExperience: driver.yearsOfExperience,
      }}
    >
      <Form.Item
        label='Họ tên'
        name='name'
        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
      >
        <Input prefix={<IdcardOutlined />} placeholder='Nhập họ tên' />
      </Form.Item>

      <Form.Item
        label='Số điện thoại'
        name='phone'
        rules={[
          { required: true, message: 'Vui lòng nhập số điện thoại!' },
          { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' },
        ]}
      >
        <Input prefix={<PhoneOutlined />} placeholder='Nhập số điện thoại' />
      </Form.Item>

      <Form.Item
        name='licenseType'
        label='Loại bằng lái'
        rules={[{ required: true, message: 'Vui lòng chọn loại bằng lái!' }]}
      >
        <Select placeholder='Chọn loại bằng lái'>
          <Select.Option value='FB2'>FB2</Select.Option>
          <Select.Option value='FC'>FC</Select.Option>
          <Select.Option value='FD'>FD</Select.Option>
          <Select.Option value='FE'>FE</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label='Tài khoản ngân hàng'
        name='bankAccount'
        rules={[
          { required: true, message: 'Vui lòng nhập tài khoản ngân hàng!' },
        ]}
      >
        <Input
          prefix={<BankOutlined />}
          placeholder='Nhập tài khoản ngân hàng'
        />
      </Form.Item>

      <Form.Item
        label='Số năm kinh nghiệm'
        name='yearsOfExperience'
        rules={[
          { required: true, message: 'Vui lòng nhập số năm kinh nghiệm!' },
          { type: 'number', min: 0, transform: (value) => Number(value) },
        ]}
      >
        <Input
          prefix={<ExperimentOutlined />}
          placeholder='Nhập số năm kinh nghiệm'
          type='number'
        />
      </Form.Item>
      <Form.Item
        label='CMND/CCCD'
        name='citizenID'
        rules={[{ required: true, message: 'Vui lòng nhập CMND/CCCD!' }]}
      >
        <Input prefix={<IdcardOutlined />} placeholder='Nhập CMND/CCCD' />
      </Form.Item>

      <Form.Item>
        <Button
          type='primary'
          htmlType='submit'
          loading={loading}
          style={{ marginRight: 8 }}
        >
          Lưu thay đổi
        </Button>
        <Button onClick={() => setIsEditing(false)}>Hủy</Button>
      </Form.Item>
    </Form>
  );

  // Loading state
  if (!driver) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <Card
      style={{ maxWidth: 800, margin: '0 auto', borderRadius: '12px' }}
      actions={[
        <Button
          key='edit'
          type='link'
          icon={<EditOutlined />}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Hủy' : 'Chỉnh sửa'}
        </Button>,
        <Button
          key='delete'
          type='link'
          danger
          icon={<DeleteOutlined />}
          onClick={() => setIsDeleteModalVisible(true)}
        >
          Xóa tài xế
        </Button>,
      ]}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar
          src={driver.avatar}
          alt={driver.name}
          size={120}
          style={{
            border: '4px solid #1890ff',
            marginBottom: 16,
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
          }}
          onClick={() => {
            Modal.info({
              title: 'Xem ảnh tài xế',
              content: (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={driver.avatar}
                    alt={driver.name}
                    style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                  />
                </div>
              ),
              onOk() {},
            });
          }}
        />
        <Title level={3} style={{ marginBottom: 8 }}>
          {driver.name} ({calculateAge(driver.birthDate)} tuổi)
        </Title>
      </div>

      {isEditing ? renderEditForm() : renderDriverInfo()}

      {/* Delete Confirmation Modal */}
      <Modal
        title='Xóa tài xế'
        visible={isDeleteModalVisible}
        onOk={handleDeleteDriver}
        onCancel={() => setIsDeleteModalVisible(false)}
        confirmLoading={loading}
        okText='Xóa'
        cancelText='Hủy'
      >
        <Text>Chắc chắn muốn xóa tài xế này không?</Text>
      </Modal>
    </Card>
  );
};

export default DriverDetail;
