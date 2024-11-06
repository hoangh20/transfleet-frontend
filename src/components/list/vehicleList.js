import React, { useState } from 'react';
import { Card, Row, Col, Typography, Space, Image, Tag, Button, Modal, notification } from 'antd';
import { Link } from 'react-router-dom';
import { IoMdCar } from 'react-icons/io';
import { MdEmojiTransportation } from 'react-icons/md';
import { BsFillCalendarFill, BsCashStack } from 'react-icons/bs';
import { FiMapPin } from 'react-icons/fi';
import { DeleteOutlined } from '@ant-design/icons';
import { deleteVehicle } from '../../services/VehicleService';

const { Title, Text } = Typography;

  const ListVehicle = ({ vehicle, onDelete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false); 

  const {
    licensePlate,
    brand,
    imageUrl,
    technicalSpecifications,
    type,
    status,
    purchasePrice,
    depreciationRate,
    address,
  } = vehicle;

  const typeLabels = ['Xe đầu kéo', 'Rơ moóc'];
  const statusLabels = ['Đang rảnh', 'Đang thực hiện chuyến', 'Bảo dưỡng', 'Không còn sử dụng'];


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
        type="text"
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
                alt="Vehicle"
                style={{ width: '100%', height: 'auto', maxHeight: '180px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', backgroundColor: '#f0f2f5' }}>
                <Text>No Image Available</Text>
              </div>
            )}
          </Col>

          {/* Information Column */}
          <Col xs={24} sm={16} md={18}>
            <Title level={4}>
              <Space>
                <IoMdCar size={20} /> {licensePlate}
              </Space>
            </Title>

            <Row gutter={[8, 8]}>
              <Col xs={24} sm={12}>
                <Space>
                  <MdEmojiTransportation size={18} />
                  <Text strong>Hãng xe:</Text> {brand}
                </Space>
              </Col>
              <Col xs={24} sm={12}>
                <Space>
                  <BsFillCalendarFill size={18} />
                  <Text strong>Loại xe:</Text> {typeLabels[type] || 'Không xác định'}
                </Space>
              </Col>
            </Row>

            <Row gutter={[8, 8]} style={{ marginTop: '10px' }}>
              <Col xs={24} sm={12}>
                <Space>
                  <BsCashStack size={18} />
                  <Text strong>Giá mua:</Text> {purchasePrice.toLocaleString()} VND
                </Space>
              </Col>
              <Col xs={24} sm={12}>
                <Space>
                  <Text strong>Trạng thái:</Text>
                  <Tag color={status === 0 ? 'green' : status === 1 ? 'blue' : status === 2 ? 'orange' : 'red'}>
                    {statusLabels[status] || 'Không xác định'}
                  </Tag>
                </Space>
              </Col>
            </Row>

            <Row gutter={[8, 8]} style={{ marginTop: '10px' }}>
              <Col xs={24} sm={12}>
                <Space>
                  <Text strong>Thông số kỹ thuật:</Text> {technicalSpecifications || 'Không có'}
                </Space>
              </Col>
              <Col xs={24} sm={12}>
                <Space>
                  <Text strong>Độ mới của xe:</Text> {depreciationRate}% 
                </Space>
              </Col>
            </Row>

            <Row gutter={[8, 8]} style={{ marginTop: '10px' }}>
              <Col xs={24}>
                <Space>
                  <FiMapPin size={18} />
                  <Text strong>Vị trí:</Text> {address}
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </Link>

      {/* Confirmation Modal */}
      <Modal
        title="Xác nhận xóa"
        visible={isModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancel}
        okText="Xóa"
        cancelText="Hủy"
        centered
      >
        <p>Bạn chắc chắn muốn xóa xe này không?</p>
      </Modal>
    </Card>
  );
};

export default ListVehicle;
