import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Steps, message, Typography } from 'antd';
import {
  fetchProvinceName,
  fetchDistrictName,
} from '../../services/LocationService';
import {
  updateDeliveryOrderStatus,
  updatePackingOrderStatus,
  exportDeliveryOrderToSheet,
  exportPackingOrderToSheet,
  getVehicleByOrderId,
  getOrderPartnerConnectionByOrderId, // Import the new API
} from '../../services/OrderService';

const { Step } = Steps;
const { Link } = Typography;

const OrderTripCard = ({ trip, customerName, type, onViewDetail, onUpdateStatus }) => {
  const [startProvince, setStartProvince] = useState('');
  const [startDistrict, setStartDistrict] = useState('');
  const [endProvince, setEndProvince] = useState('');
  const [endDistrict, setEndDistrict] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState(null); // State to store vehicle details

  useEffect(() => {
    if (!trip.location) return;
    const fetchLocationNames = async () => {
      const [startProvinceName, startDistrictName, endProvinceName, endDistrictName] = await Promise.all([
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

  useEffect(() => {
    const fetchVehicleOrPartnerDetails = async () => {
      try {
        if (trip.hasVehicle === 1) {
          // Fetch vehicle details for internal fleet
          const vehicle = await getVehicleByOrderId(trip._id);
          setVehicleDetails(vehicle);
        } else if (trip.hasVehicle === 2) {
          // Fetch partner details for external fleet
          const partnerConnection = await getOrderPartnerConnectionByOrderId(trip._id);
          setVehicleDetails({ shortName: partnerConnection.partnerId.shortName });
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      }
    };

    if (trip.hasVehicle) {
      fetchVehicleOrPartnerDetails();
    }
  }, [trip._id, trip.hasVehicle]);

  const statusMap = {
    delivery: ['Đã giao xe', 'Đang giao hàng', 'Đã giao hàng', 'Đang hạ vỏ', 'Đã hạ vỏ', 'Hoàn thành'],
    packing: ['Đã giao xe', 'Đang lên kho', 'Chờ đóng hàng', 'Đã đóng hàng', 'Đang về cảng', 'Đã hạ cảng', 'Hoàn thành'],
  };

  const steps = statusMap[type] || [];
  const currentStep = trip.status - 1 < steps.length ? trip.status : 0;

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

  const handleUpdateStatusInternal = async (orderId) => {
    try {
      if (type === 'delivery') {
        await updateDeliveryOrderStatus(orderId);
        message.success('Cập nhật trạng thái đơn giao hàng thành công');
      } else if (type === 'packing') {
        await updatePackingOrderStatus(orderId);
        message.success('Cập nhật trạng thái đơn đóng hàng thành công');
      }
      onUpdateStatus(orderId);
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái đơn hàng.');
    }
  };

  // Tiêu đề tích hợp link xem chi tiết
  const titleContent = (
    <Link onClick={() => onViewDetail(trip._id)} style={{ fontSize: 14 }}>
      {type === 'delivery' ? `Chuyến giao hàng: ${customerName}` : `Chuyến đóng hàng: ${customerName}`}
    </Link>
  );

  // Extra: chỉ chứa nút cập nhật trạng thái hoặc xuất file
  const extraContent = (
    <Button
      type="link"
      onClick={() =>
        (type === 'delivery' && trip.status === 6 && trip.writeToSheet === 0) ||
        (type === 'packing' && trip.status === 7 && trip.writeToSheet === 0)
          ? handleExportOrder(trip._id)
          : handleUpdateStatusInternal(trip._id)
      }
      size="small"
    >
      {(type === 'delivery' && trip.status === 6 && trip.writeToSheet === 0) ||
      (type === 'packing' && trip.status === 7 && trip.writeToSheet === 0)
        ? 'Xuất vào file'
        : 'Cập nhật trạng thái'}
    </Button>
  );

  return (
    <Card key={trip._id} style={{ margin: 0, padding: 4 }} bodyStyle={{ padding: 4 }} title={titleContent} extra={extraContent}>
      <Row gutter={[4, 4]} justify="space-between">
        <Col span={12}>
          <strong>Điểm đi:</strong> {`${startProvince}, ${startDistrict}`}
        </Col>
        <Col span={12}>
          <strong>Điểm đến:</strong> {`${endProvince}, ${endDistrict}`}
        </Col>
        <Col span={8}>
          <strong>Loại cont:</strong> {trip.contType === 0 ? "20''" : "40''"}
        </Col>
        <Col span={8}>
          <strong>Số container:</strong> {trip.containerNumber}
        </Col>
        <Col span={8}>
        {vehicleDetails && (
            <Col span={24}>
              <strong>Thông tin xe:</strong>{' '}
              {trip.hasVehicle === 1
                ? `${vehicleDetails.headPlate || 'N/A'} - ${vehicleDetails.moocType === 0 ? "20''" : "40''"}`
                : vehicleDetails.shortName || 'Không xác định'}
            </Col>
        )}
        </Col>
        {trip.note && (
          <Col span={24}>
            <strong>Ghi chú:</strong> <span style={{ color: '#8c8c8c' }}>{trip.note}</span>
          </Col>
        )}
      </Row>
      <Row style={{ marginTop: 4 }}>
        <Col span={24}>
          <Steps current={currentStep} size="small" style={{ width: '100%', fontSize: '10px' }}>
            {steps.map((step, index) => (
              <Step key={index} title={<span style={{ fontSize: '10px', padding: '0 2px' }}>{step}</span>} />
            ))}
          </Steps>
        </Col>
      </Row>
    </Card>
  );
};

export default OrderTripCard;
