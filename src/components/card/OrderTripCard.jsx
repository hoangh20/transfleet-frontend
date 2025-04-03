import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Steps, message } from 'antd';
import {
  fetchProvinceName,
  fetchDistrictName,
} from '../../services/LocationService';
import { updateDeliveryOrderStatus, updatePackingOrderStatus, exportDeliveryOrderToSheet, exportPackingOrderToSheet } from '../../services/OrderService';

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
      'Đã giao xe',
      'Đang giao hàng',
      'Đã giao hàng',
      'Đang hạ vỏ',
      'Đã hạ vỏ',
      'Hoàn thành',
    ],
    packing: [
      'Đã giao xe',
      'Đang lên kho ',
      'Chờ đóng hàng',
      'Đã đóng hàng',
      'Đang về cảng',
      'Đã hạ cảng',
      'Hoàn thành',
    ],
  };

  const steps = statusMap[type] || [];
  const currentStep = trip.status-1 < steps.length ? trip.status : 0;

  const handleExportOrder = async (orderId) => {
    try {
      if (type === 'delivery' && trip.status === 6) {
        await exportDeliveryOrderToSheet(orderId);
        message.success('Đơn giao hàng đã được xuất ra file thành công');
      } else if (type === 'packing' && trip.status === 7) {
        await exportPackingOrderToSheet(orderId);
        message.success('Đơn đóng hàng đã được xuất ra file thành công');
      } else {
        message.error('Không thể xuất đơn hàng vào file với trạng thái hiện tại.');
      }
    } catch (error) {
      message.error('Lỗi khi xuất đơn hàng vào file.');
    }
  };

  const handleUpdateStatus = async (orderId) => {
    try {
      if (type === 'delivery') {
        // Update status for delivery orders
        await updateDeliveryOrderStatus(orderId);
        message.success('Cập nhật trạng thái đơn giao hàng thành công');
      } else if (type === 'packing') {
        // Update status for packing orders
        await updatePackingOrderStatus(orderId);
        message.success('Cập nhật trạng thái đơn đóng hàng thành công');
      }
      onUpdateStatus(orderId);
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái đơn hàng.');
    }
  };

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
          {(type === 'delivery' && trip.status === 6 && trip.writeToSheet === 0) || (type === 'packing' && trip.status === 7 && trip.writeToSheet === 0) ? (
            <Button
              type='link'
              onClick={() => handleExportOrder(trip._id)}
            >
              Xuất vào file
            </Button>
          ) : (
            <Button
              type='link'
              onClick={() => handleUpdateStatus(trip._id)}
            >
              Cập nhật trạng thái
            </Button>
          )}
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
