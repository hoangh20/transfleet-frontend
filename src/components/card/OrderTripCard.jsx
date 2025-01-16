import React from 'react';
import { Card, Row, Col, Button, Steps } from 'antd';

const { Step } = Steps;

const OrderTripCard = ({ trip, onViewDetail, onUpdateStatus }) => {
  const getStatusStep = (status) => {
    switch (status) {
      case 1:
        return 0; // Đã giao xe
      case 2:
        return 1; // Đang vận chuyển
      case 3:
        return 2; // Hoàn thành
      default:
        return 0;
    }
  };

  return (
    <Card
      key={trip._id}
      style={{ marginBottom: '16px' }}
      title={`Mã chuyến hàng: ${trip.tripCode}`}
      extra={
        <>
          <Button type="link" onClick={() => onViewDetail(trip._id)}>Xem chi tiết</Button>
          <Button type="link" onClick={() => onUpdateStatus(trip._id)}>Cập nhật trạng thái</Button>
        </>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={12}><strong>Khách hàng:</strong> {trip.customerName}</Col>
        <Col span={12}><strong>Ngày khởi hành:</strong> {new Date(trip.departureDate).toLocaleString()}</Col>
        <Col span={12}><strong>Điểm đi:</strong> {trip.startPoint}</Col>
        <Col span={12}><strong>Điểm đến:</strong> {trip.endPoint}</Col>
        <Col span={12}><strong>Loại vận chuyển:</strong> {trip.transportType}</Col>
        <Col span={12}><strong>Số container:</strong> {trip.containerNumber}</Col>
        <Col span={24}>
          <Steps current={getStatusStep(trip.status)}>
            <Step title="Đã giao xe" />
            <Step title="Đang vận chuyển" />
            <Step title="Hoàn thành" />
          </Steps>
        </Col>
      </Row>
    </Card>
  );
};

export default OrderTripCard;