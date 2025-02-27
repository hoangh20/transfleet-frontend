import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Steps } from 'antd';
import { fetchProvinceName, fetchDistrictName } from '../../services/LocationService';

const { Step } = Steps;

const OrderTripCard = ({ trip, customerName, type, onViewDetail, onUpdateStatus }) => {
  const [startProvince, setStartProvince] = useState('');
  const [startDistrict, setStartDistrict] = useState('');
  const [endProvince, setEndProvince] = useState('');
  const [endDistrict, setEndDistrict] = useState('');

  useEffect(() => {
    const fetchLocationNames = async () => {
      const startProvinceName = await fetchProvinceName(trip.location.startPoint.provinceCode);
      const startDistrictName = await fetchDistrictName(trip.location.startPoint.districtCode);
      const endProvinceName = await fetchProvinceName(trip.location.endPoint.provinceCode);
      const endDistrictName = await fetchDistrictName(trip.location.endPoint.districtCode);

      setStartProvince(startProvinceName);
      setStartDistrict(startDistrictName);
      setEndProvince(endProvinceName);
      setEndDistrict(endDistrictName);
    };

    fetchLocationNames();
  }, [trip.location]);

  const getStatusStep = (status, type) => {
    if (type === 'delivery') {
      switch (status) {
        case 0:
          return 0; // Mới
        case 1:
          return 1; // Đã giao xe
        case 2:
          return 2; // Đang giao hàng
        case 3:
          return 3; // Đã giao hàng
        case 4:
          return 4; // Đang hạ vỏ
        case 5:
          return 5; // Đã hạ vỏ
        case 6:
          return 6; // Kết thúc
        default:
          return 0;
      }
    } else if (type === 'packing') {
      switch (status) {
        case 1:
          return 0; // Đã giao xe
        case 2:
          return 1; // Đang lên kho đóng hàng
        case 3:
          return 2; // Chờ đóng hàng
        case 4:
          return 3; // Đã đóng hàng
        case 5:
          return 4; // Đang về cảng
        case 6:
          return 5; // Đã hạ cảng
        case 7:
          return 6; // Kết thúc
        default:
          return 0;
      }
    }
  };

  const renderTripDetails = (trip, type) => {
    return (
      <>
      <Col span={12} style={{ margin: 0 }}><strong>Điểm đi:</strong> {`${startProvince}, ${startDistrict}`}</Col>
      <Col span={12} style={{ margin: 0 }}><strong>Điểm đến:</strong> {`${endProvince}, ${endDistrict}`}</Col>
      <Col span={12} style={{ margin: 0 }}><strong>Loại cont:</strong> {trip.moocType === 0 ? "20''" : "40''"}</Col>
      <Col span={12} style={{ margin: 0 }}><strong>Số container:</strong> {trip.containerNumber}</Col>
      <Col span={24} style={{ margin: 0 }}><strong>Ghi chú:</strong> {trip.note ? trip.note : 'Không có'}</Col>
      {type === 'delivery' && (
      <Col span={24} style={{ margin: 0 }}>
      <Steps current={getStatusStep(trip.status, 'delivery')}>
        <Step title="Đã giao xe" />
        <Step title="Đang giao hàng" />
        <Step title="Đã giao hàng" />
        <Step title="Đang hạ vỏ" />
        <Step title="Đã hạ vỏ" />
        <Step title="Kết thúc" />
      </Steps>
      </Col>
      )}
      {type === 'packing' && (
      <Col span={24} style={{ margin: 0 }}>
      <Steps current={getStatusStep(trip.status, 'packing')}>
        <Step title="Đã giao xe" />
        <Step title="Đang lên kho đóng hàng" />
        <Step title="Chờ đóng hàng" />
        <Step title="Đã đóng hàng" />
        <Step title="Đang về cảng" />
        <Step title="Đã hạ cảng" />
        <Step title="Kết thúc" />
      </Steps>
      </Col>
      )}
      </>
    );
  };

  if (type === 'combined') {
    return (
      <Card
        key={trip._id}
        style={{ marginBottom: '16px', border: '2px solid #1890ff' }}
        title={`Khách hàng: ${customerName}`}
        extra={
          <>
            <Button type="link" onClick={() => onViewDetail(trip._id)}>Xem chi tiết</Button>
            <Button type="link" onClick={() => onUpdateStatus(trip._id)}>Cập nhật trạng thái</Button>
          </>
        }
      >
        <Card type="inner" title="Chuyến giao hàng" style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]}>
            {renderTripDetails(trip.deliveryOrderId, 'delivery')}
          </Row>
        </Card>
        <Card type="inner" title="Chuyến đóng hàng">
          <Row gutter={[16, 16]}>
            {renderTripDetails(trip.packingOrderId, 'packing')}
          </Row>
        </Card>
      </Card>
    );
  }

  return (
    <Card
      key={trip._id}
      style={{ marginBottom: '16px' }}
      title={`Khách hàng: ${customerName}`}
      extra={
        <>
          <Button type="link" onClick={() => onViewDetail(trip._id)}>Xem chi tiết</Button>
          <Button type="link" onClick={() => onUpdateStatus(trip._id)}>Cập nhật trạng thái</Button>
        </>
      }
    >
      <Row gutter={[16, 16]}>
        {renderTripDetails(trip, type)}
      </Row>
    </Card>
  );
};

export default OrderTripCard;