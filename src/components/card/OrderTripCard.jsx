import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Steps } from 'antd';
import {
  fetchProvinceName,
  fetchDistrictName,
} from '../../services/LocationService';

const { Step } = Steps;

const OrderTripCard = ({
  trip,
  customerName,
  type,
  onViewDetail,
  onUpdateStatus,
}) => {
  const [startProvince, setStartProvince] = useState('');
  const [startDistrict, setStartDistrict] = useState('');
  const [endProvince, setEndProvince] = useState('');
  const [endDistrict, setEndDistrict] = useState('');

  useEffect(() => {
    if (!trip.location) return;

    const fetchLocationNames = async () => {
      const [
        startProvinceName,
        startDistrictName,
        endProvinceName,
        endDistrictName,
      ] = await Promise.all([
        fetchProvinceName(trip.location.startPoint.provinceCode),
        fetchDistrictName(trip.location.startPoint.districtCode),
        fetchProvinceName(trip.location.endPoint.provinceCode),
        fetchDistrictName(trip.location.endPoint.districtCode),
      ]);

      setStartProvince(startProvinceName);
      setStartDistrict(startDistrictName);
      setEndProvince(endProvinceName);
      setEndDistrict(endDistrictName);
    };

    fetchLocationNames();
  }, [trip.location]);

  const statusMap = {
    delivery: [
      'Mới',
      'Đã giao xe',
      'Đang giao hàng',
      'Đã giao hàng',
      'Đang hạ vỏ',
      'Đã hạ vỏ',
      'Kết thúc',
    ],
    packing: [
      'Đã giao xe',
      'Đang lên kho đóng hàng',
      'Chờ đóng hàng',
      'Đã đóng hàng',
      'Đang về cảng',
      'Đã hạ cảng',
      'Kết thúc',
    ],
  };

  const steps = statusMap[type] || [];
  const currentStep = trip.status < steps.length ? trip.status : 0;

  return (
    <Card
      key={trip._id}
      style={{ margin: 0 }}
      title={`Khách hàng: ${customerName}`}
      extra={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type='link' onClick={() => onViewDetail(trip._id)}>
            Xem chi tiết
          </Button>
          <Button type='link' onClick={() => onUpdateStatus(trip._id)}>
            Cập nhật trạng thái
          </Button>
        </div>
      }
    >
      <Row gutter={[8, 8]} justify='space-between'>
        <Col span={12} style={{ margin: 0 }}>
          <strong>Điểm đi:</strong> {`${startProvince}, ${startDistrict}`}
        </Col>
        <Col span={12} style={{ margin: 0 }}>
          <strong>Điểm đến:</strong> {`${endProvince}, ${endDistrict}`}
        </Col>
        <Col span={12} style={{ margin: 0 }}>
          <strong>Loại cont:</strong> {trip.moocType === 0 ? "20''" : "40''"}
        </Col>
        <Col span={12} style={{ margin: 0 }}>
          <strong>Số container:</strong> {trip.containerNumber}
        </Col>
        {trip.note && (
          <Col span={24} style={{ margin: 0 }}>
              <strong>Ghi chú:</strong>{' '}
              <span style={{ color: '#8c8c8c' }}>{trip.note}</span>
          </Col>
        )}
      </Row>
      <Row style={{ marginTop: '12px' }}>
        <Col span={24} style={{ margin: 0 }}>
          <Steps
            current={currentStep}
            size='small'
            style={{ width: '100%', fontSize: '12px' }}
            className='custom-steps'
          >
            {steps.map((step, index) => (
              <Step
                key={index}
                title={
                  <span style={{ fontSize: '10px', padding: '0 4px' }}>
                    {step}
                  </span>
                }
              />
            ))}
          </Steps>
        </Col>
      </Row>
    </Card>
  );
};

export default OrderTripCard;
