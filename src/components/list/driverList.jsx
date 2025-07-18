import React, { useState, useEffect } from 'react';
import {
  Card,
  Avatar,
  Typography,
  Row,
  Col,
  Tag,
  Statistic,
  Modal,
} from 'antd';
import {
  CarOutlined,
  PhoneOutlined,
  IdcardOutlined,
  ExperimentOutlined,
  BankOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import {
  deleteDriver,
  getVehicleByDriverId,
} from '../../services/DriverService';
import DriverDetail from '../popup/DriverDetail';
import dayjs from 'dayjs';
const { Title, Text } = Typography;

const DriverCard = ({ driver }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [vehicle, setVehicle] = useState(null);

  const successRate =
    driver.successfulTrips + driver.failedTrips === 0
      ? 'N/A'
      : (
          (driver.successfulTrips /
            (driver.successfulTrips + driver.failedTrips)) *
          100
        ).toFixed(1);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const result = await getVehicleByDriverId(driver._id);
        setVehicle(result.data);
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        setVehicle(null);
      }
    };

    if (driver._id && driver.hasVehicle === 1) {
      fetchVehicle();
    }
  }, [driver._id, driver.hasVehicle]);

  const showDeleteModal = () => {
    setIsModalVisible(true);
  };

  const calculateAge = (birthDate) => {
    return dayjs().diff(dayjs(birthDate), 'year');
  };

  const handleDeleteDriver = async () => {
    setLoading(true);
    try {
      await deleteDriver(driver._id);
      setIsModalVisible(false);
      window.location.reload();
    } catch (error) {
      setLoading(false);
      Modal.error({
        title: 'Xóa tài xế thất bại',
        content: 'Có lỗi xảy ra khi xóa tài xế. Vui lòng thử lại!',
      });
    }
  };

  const showDetailModal = () => {
    setIsDetailModalVisible(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
  };

  const renderVehicleInfo = () => {
    if (driver.hasVehicle === 1 && vehicle) {
      return (
        <>
          <CarOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          <span>
            Biển số: {vehicle.headPlate}, Mooc:{' '}
            {vehicle.moocType === 0 ? "20" : "40"}
          </span>
        </>
      );
    } else {
      return (
        <>
          <CloseCircleOutlined style={{ color: '#f5222d', marginRight: 8 }} />
          Chưa có xe
        </>
      );
    }
  };


  return (
    <>
      <Card
        hoverable
        style={{
          width: 350,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          position: 'relative',
        }}
        cover={
          <div
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              padding: '24px 0',
              textAlign: 'center',
            }}
            onClick={showDetailModal}
          >
            <Avatar
              src={driver.avatar}
              alt={driver.name}
              size={120}
              style={{
                border: '4px solid white',
                marginBottom: 16,
              }}
              onClick={showDetailModal}
            />
            <Title
              level={3}
              style={{ color: 'white', margin: 0, cursor: 'pointer' }}
              onClick={showDetailModal}
            >
              {driver.name} ({calculateAge(driver.birthDate)} tuổi)
            </Title>
          </div>
        }
      >
        <CloseCircleOutlined
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            fontSize: 24,
            color: '#ff4d4f',
            cursor: 'pointer',
          }}
          onClick={showDeleteModal}
        />

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
              <Text>{driver.yearsOfExperience} năm </Text>
            </div>
          </Col>

          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IdcardOutlined style={{ color: '#1890ff' }} />
              <Text>Bằng lái: </Text>
              <Tag color='blue'>{driver.licenseType}</Tag>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BankOutlined style={{ color: '#1890ff' }} />
              <Text copyable>{driver.bankAccount}</Text>
            </div>
          </Col>
          <Col span={24}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IdcardOutlined style={{ color: '#1890ff' }} />
              <Text copyable>{driver.citizenID}</Text>
            </div>
          </Col>

          <Col span={24}>
            <div>{renderVehicleInfo()}</div>
          </Col>
          <Col span={24}>
            <EnvironmentOutlined style={{ color: '#1890ff' }} />
            <Text> Quê quán: {driver.hometown}</Text>
          </Col>

          <Col span={8}>
            <Statistic
              title='Thành công'
              value={driver.successfulTrips}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title='Thất bại'
              value={driver.failedTrips}
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title='Tỷ lệ'
              value={successRate}
              suffix={successRate === 'N/A' ? '' : '%'}
              valueStyle={{ color: '#1890ff' }}
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
              style={{ background: '#f5f5f5' }}
            >
              <Text>
                Tổng số chuyến: {driver.successfulTrips + driver.failedTrips}
              </Text>
            </Card>
          </Col>

          <Col span={24}>
            {driver.hasAccount === 0 ? (
              <Tag color="red">Chưa có tài khoản</Tag>
            ) : (
              <Tag color="green">Đã có tài khoản</Tag>
            )}
          </Col>
        </Row>

        <Modal
          title='Xác nhận xóa tài xế'
          visible={isModalVisible}
          onOk={handleDeleteDriver}
          onCancel={() => setIsModalVisible(false)}
          confirmLoading={loading}
        >
          <p>Bạn có chắc chắn muốn xóa tài xế này không?</p>
        </Modal>

        <Modal
          title='Chi tiết tài xế'
          visible={isDetailModalVisible}
          onCancel={handleDetailModalClose}
          footer={null}
          width={800}
        >
          <DriverDetail
            driverId={driver._id}
            onDeleteSuccess={handleDetailModalClose}
            onUpdateSuccess={handleDetailModalClose}
          />
        </Modal>
      </Card>
    </>
  );
};

export default DriverCard;