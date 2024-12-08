import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Image,
  Button,
  Modal,
  notification,
} from 'antd';
import { Link } from 'react-router-dom';
import { IoMdCar } from 'react-icons/io';
import { MdEmojiTransportation } from 'react-icons/md';
import { BsFillCalendarFill } from 'react-icons/bs';
import { FiMapPin } from 'react-icons/fi';
import { FaBalanceScale } from 'react-icons/fa';
import {
  DeleteOutlined,
  UserOutlined,
  TruckOutlined,
  TagOutlined,
  PercentageOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import {
  deleteVehicle,
  getDriverByVehicleId,
} from '../../services/VehicleService';

const { Text } = Typography;

const ListVehicle = ({ vehicle, onDelete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [driver, setDriver] = useState(null);
  const statusLabels = [
    'Đang rảnh',
    'Đang thực hiện chuyến',
    'Bảo dưỡng',
    'Không còn sử dụng',
  ];
  const {
    headPlate,
    headRegCode,
    headRegExpiry,
    moocPlate,
    moocRegCode,
    moocRegExpiry,
    moocType,
    purchase_year,
    weight,
    imageUrl,
    address,
    status,
  } = vehicle;

  const moocTypeLabels = ["20''", "40''"];

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const result = await getDriverByVehicleId(vehicle._id);
        if (result && result.data) {
          setDriver(result.data);
        } else {
          setDriver(null);
        }
        console.log('Driver API Response:', result);
      } catch (error) {
        console.error('Error fetching driver by vehicle ID:', error);
        setDriver(null);
      }
    };

    if (vehicle._id && vehicle.hasDriver === 1) {
      fetchDriver();
    } else {
      setDriver(null);
    }
  }, [vehicle._id, vehicle.hasDriver]);

  const renderDriverInfo = () => {
    if (vehicle.hasDriver === 1) {
      if (driver) {
        return (
          <>
            <UserOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            <span>
              <Text strong>Lái xe</Text> {driver.name || 'N/A'}{' '}
              <Text strong>Bằng:</Text> {driver.licenseType || 'N/A'}
            </span>
          </>
        );
      } else {
        return (
          <>
            <UserOutlined style={{ color: '#faad14', marginRight: 8 }} />
            <span>Đang tải thông tin lái xe...</span>
          </>
        );
      }
    } else {
      return (
        <>
          <CloseCircleOutlined style={{ color: '#f5222d', marginRight: 8 }} />
          Chưa có lái xe
        </>
      );
    }
  };

  const handleDeleteClick = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleConfirmDelete = async () => {
    try {
      const result = await deleteVehicle(vehicle._id);
      if (result.status === 'OK') {
        notification.success({
          message: 'Xóa xe thành công',
          description: 'Xe đã được xóa khỏi hệ thống.',
        });
        onDelete(vehicle._id);
        window.location.reload();
      } else {
        notification.error({
          message: 'Lỗi khi xóa xe',
          description: result.message,
        });
      }
    } catch (error) {
    }
    setIsModalVisible(false);
  };

  return (
    <Card style={{ marginBottom: '20px', position: 'relative' }}>
      <Button
        type='text'
        icon={<DeleteOutlined />}
        onClick={handleDeleteClick}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1,
          color: 'red',
        }}
      />

      <Link to={`/vehicle/detail/${vehicle._id}`}>
        <Row gutter={[16, 16]}>
          {/* Image Column */}
          <Col xs={24} sm={8} md={6}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt='Vehicle'
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '180px',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '180px',
                  backgroundColor: '#f0f2f5',
                }}
              >
                <Text>No Image Available</Text>
              </div>
            )}
          </Col>

          {/* Information Column */}
          <Col xs={24} sm={16} md={18}>
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={12}>
                <Space>
                  <IoMdCar size={18} />
                  <Text strong>Biển số xe(Đầu):</Text> {headPlate}
                </Space>
              </Col>
              <Col xs={24} sm={12}>
                <Space>
                  <IoMdCar size={18} />
                  <Text strong>Biển số xe(moóc):</Text> {moocPlate}
                </Space>
              </Col>
            </Row>

            <Row gutter={[8, 8]} style={{ marginTop: '10px' }}>
              <Col xs={24} sm={12}>
                <Space>
                  <MdEmojiTransportation size={18} />
                  <Text strong>Mã đăng ký(Đầu):</Text> {headRegCode}
                </Space>
              </Col>
              <Col xs={24} sm={12}>
                <Space>
                  <MdEmojiTransportation size={18} />
                  <Text strong>Mã đăng ký(moóc):</Text> {moocRegCode}
                </Space>
              </Col>
            </Row>

            <Row gutter={[8, 8]} style={{ marginTop: '10px' }}>
              <Col xs={24} sm={12}>
                <Space>
                  <BsFillCalendarFill size={18} />
                  <Text strong>Ngày hết hạn(Đầu):</Text>{' '}
                  {new Date(headRegExpiry).toLocaleDateString()}
                </Space>
              </Col>
              <Col xs={24} sm={12}>
                <Space>
                  <BsFillCalendarFill size={18} />
                  <Text strong>Ngày hết hạn(moóc):</Text>{' '}
                  {new Date(moocRegExpiry).toLocaleDateString()}
                </Space>
              </Col>
            </Row>

            <Row gutter={[8, 8]} style={{ marginTop: '10px' }}>
              <Col xs={24} sm={12}>
                <Space>
                  <TruckOutlined size={18} />
                  <Text strong>Loại rơ moóc:</Text>{' '}
                  {moocTypeLabels[moocType] || 'Không xác định'}
                </Space>
              </Col>
              <Col xs={24} sm={12}>
                <Space>
                  <FaBalanceScale size={18} />
                  <Text strong>Trọng lượng (Tấn):</Text> {weight}
                </Space>
              </Col>
            </Row>

            <Row gutter={[8, 8]} style={{ marginTop: '10px' }}>
              <Col xs={24} sm={12}>
                <Space>
                  <PercentageOutlined size={18} />
                  <Text strong>Năm mua xe:</Text> {purchase_year}
                </Space>
              </Col>
              <Col xs={24} sm={12}>
                <Space>
                  <div>{renderDriverInfo()}</div>
                </Space>
              </Col>
            </Row>

            <Row gutter={[8, 8]} style={{ marginTop: '10px' }}>
              <Col xs={24} sm={12}>
                <Space>
                  <FiMapPin size={18} />
                  <Text strong>Vị trí:</Text> {address}
                </Space>
              </Col>
              <Col xs={24} sm={12}>
                <Space>
                  <TagOutlined size={18} />
                  <Text strong>Trạng thái:</Text>
                  <Tag
                    color={
                      status === 0
                        ? 'green'
                        : status === 1
                          ? 'blue'
                          : status === 2
                            ? 'orange'
                            : 'red'
                    }
                  >
                    {statusLabels[status] || 'Không xác định'}
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </Link>

      {/* Confirmation Modal */}
      <Modal
        title='Xác nhận xóa'
        visible={isModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancel}
        okText='Xóa'
        cancelText='Hủy'
        centered
      >
        <p>Bạn chắc chắn muốn xóa xe này không?</p>
      </Modal>
    </Card>
  );
};

export default ListVehicle;
