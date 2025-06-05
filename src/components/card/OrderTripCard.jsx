import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Steps, message, Typography, Tag, Tooltip } from 'antd';
import {
  fetchProvinceName,
  fetchDistrictName,
  fetchWardName,
} from '../../services/LocationService';
import {
  updateDeliveryOrderStatus,
  updatePackingOrderStatus,
  exportDeliveryOrderToSheet,
  exportPackingOrderToSheet,
  getVehicleByOrderId,
  getOrderPartnerConnectionByOrderId,
} from '../../services/OrderService';
import OrderStatusDetails from '../popup/OrderStatusDetails';

const { Step } = Steps;
const { Link } = Typography;

const OrderTripCard = ({ trip, customerName, type, onViewDetail, onUpdateStatus }) => {
  const [startProvince, setStartProvince] = useState('');
  const [startDistrict, setStartDistrict] = useState('');
  const [startWard, setStartWard] = useState('');
  const [startLocationText, setStartLocationText] = useState('');
  const [endProvince, setEndProvince] = useState('');
  const [endDistrict, setEndDistrict] = useState('');
  const [endWard, setEndWard] = useState('');
  const [endLocationText, setEndLocationText] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    if (!trip.location) return;
    const fetchLocationNames = async () => {
      const [
        startProvinceNameRaw,
        startDistrictNameRaw,
        startWardName,
        endProvinceNameRaw,
        endDistrictNameRaw,
        endWardName,
      ] = await Promise.all([
        fetchProvinceName(trip.location.startPoint.provinceCode),
        fetchDistrictName(trip.location.startPoint.districtCode),
        trip.location.startPoint.wardCode
          ? fetchWardName(trip.location.startPoint.wardCode)
          : null,
        fetchProvinceName(trip.location.endPoint.provinceCode),
        fetchDistrictName(trip.location.endPoint.districtCode),
        trip.location.endPoint.wardCode
          ? fetchWardName(trip.location.endPoint.wardCode)
          : null,
      ]);
      const startProvinceName = startProvinceNameRaw
        ? startProvinceNameRaw.replace(/^(Tỉnh|Thành Phố)\s*/i, '')
        : '';
      const startDistrictName = startDistrictNameRaw
        ? startDistrictNameRaw.replace(/^(Huyện|Thị Xã|Quận)\s*/i, '')
        : '';
      const endProvinceName = endProvinceNameRaw
        ? endProvinceNameRaw.replace(/^(Tỉnh|Thành Phố)\s*/i, '')
        : '';
      const endDistrictName = endDistrictNameRaw
        ? endDistrictNameRaw.replace(/^(Huyện|Thị Xã|Quận)\s*/i, '')
        : '';

      setStartProvince(startProvinceName);
      setStartDistrict(startDistrictName);
      setStartWard(startWardName || '');
      setStartLocationText(trip.location.startPoint.locationText || '');

      setEndProvince(endProvinceName);
      setEndDistrict(endDistrictName);
      setEndWard(endWardName || '');
      setEndLocationText(trip.location.endPoint.locationText || '');
    };

    fetchLocationNames();
  }, [trip.location]);

  useEffect(() => {
    const fetchVehicleOrPartnerDetails = async () => {
      try {
        if (trip.hasVehicle === 1) {
          const vehicle = await getVehicleByOrderId(trip._id);
          setVehicleDetails(vehicle);
        } else if (trip.hasVehicle === 2) {
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
    delivery: [ 'Đang giao hàng', 'Đã giao hàng', 'Đang hạ vỏ', 'Đã hạ vỏ', 'Hoàn thành'],
    packing: [ 'Đang lên kho', 'Chờ đóng hàng', 'Đã đóng hàng', 'Đang về cảng', 'Đã hạ cảng', 'Hoàn thành'],
  };

  const steps = statusMap[type] || [];
  const currentStep = trip.status - 1 <= steps.length ? trip.status - 1 : 0;

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    setStatusModalVisible(true);
  };

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
      const userId = JSON.parse(localStorage.getItem('user'))?.id;

      if (type === 'delivery') {
        await updateDeliveryOrderStatus(orderId, userId); 
        message.success('Cập nhật trạng thái đơn giao hàng thành công');
      } else if (type === 'packing') {
        await updatePackingOrderStatus(orderId, userId); 
        message.success('Cập nhật trạng thái đơn đóng hàng thành công');
      }
      onUpdateStatus(orderId);
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái đơn hàng.');
    }
  };

  const titleContent = (
    <Link onClick={() => onViewDetail(trip._id)} style={{ fontSize: 14, padding: 0, lineHeight: '16px' }}>
      {type === 'delivery' ? `Chuyến giao hàng: ${customerName}` : `Chuyến đóng hàng: ${customerName}`}
    </Link>
  );

  const extraContent = trip.writeToSheet === 1 ? (
  <span style={{ color: 'green', fontWeight: 'bold', fontSize: 12, lineHeight: '16px' }}>
    Đã hoàn thành
  </span>
) : (
  <Button
    type="link"
    onClick={() =>
      (type === 'delivery' && trip.status === 6 && trip.writeToSheet === 0) ||
      (type === 'packing' && trip.status === 7 && trip.writeToSheet === 0)
        ? handleExportOrder(trip._id)
        : handleUpdateStatusInternal(trip._id)
    }
    size="small"
    style={{ padding: 0, fontSize: 12, height: 'auto', lineHeight: '16px' }}
  >
    {(type === 'delivery' && trip.status === 6 && trip.writeToSheet === 0) ||
    (type === 'packing' && trip.status === 7 && trip.writeToSheet === 0)
      ? 'Xuất vào file'
      : 'Cập nhật trạng thái'}
  </Button>
);

  return (
    <>
      <Card key={trip._id} style={{ margin: 0, padding: 2 }} bodyStyle={{ padding: 2 }} title={titleContent} extra={extraContent}>
        <Row gutter={[4, 4]} justify="space-between">
          <Col span={12}>
            <strong>Đi:</strong>{' '}
            {`${startLocationText ? startLocationText + ', ' : ''}${startWard ? startWard + ', ' : ''}${startDistrict}, ${startProvince}`}
          </Col>
          <Col span={12}>
            <strong>Đến:</strong>{' '}
            {`${endLocationText ? endLocationText + ', ' : ''}${endWard ? endWard + ', ' : ''}${endDistrict}, ${endProvince}`}
          </Col>
          <Col span={8}>
            <strong>Loại cont:</strong> {trip.contType === 0 ? "20" : "40"}
          </Col>
          <Col span={8}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <strong>{trip.containerNumber || '--'}</strong>
              <span>{`- ${trip.owner || ''}`}</span>
              {type === 'delivery' && trip.containerStatus === 1 &&
                (trip.noteCS ? (
                  <Tooltip title={trip.noteCS}>
                    <Tag color="green" style={{ marginLeft: 2, cursor: 'pointer' }}>OK</Tag>
                  </Tooltip>
                ) : (
                  <Tag color="green" style={{ marginLeft: 2 }}>OK</Tag>
                ))}
              {type === 'delivery' && trip.containerStatus === 2 &&
                (trip.noteCS ? (
                  <Tooltip title={trip.noteCS}>
                    <Tag color="red" style={{ marginLeft: 2, cursor: 'pointer' }}>Không OK</Tag>
                  </Tooltip>
                ) : (
                  <Tag color="red" style={{ marginLeft: 2 }}>Không OK</Tag>
                ))}
              {type === 'packing' && trip.command === 1 &&
                (trip.noteCS ? (
                  <Tooltip title={trip.noteCS}>
                    <Tag color="green" style={{ marginLeft: 2, cursor: 'pointer' }}>Hạ</Tag>
                  </Tooltip>
                ) : (
                  <Tag color="green" style={{ marginLeft: 2 }}>Hạ</Tag>
                ))}
              {type === 'packing' && trip.command === 2 &&
                (trip.noteCS ? (
                  <Tooltip title={trip.noteCS}>
                    <Tag color="red" style={{ marginLeft: 2, cursor: 'pointer' }}>Không hạ</Tag>
                  </Tooltip>
                ) : (
                  <Tag color="red" style={{ marginLeft: 2 }}>Không hạ</Tag>
                ))}
            </span>
          </Col>
          <Col span={8}>
            {vehicleDetails && (
              <Col span={24}>
                <strong>Thông tin xe:</strong>{' '}
                {trip.hasVehicle === 1
                  ? `${vehicleDetails.headPlate || 'N/A'} - ${vehicleDetails.moocType === 0 ? "20" : "40"}`
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
                <Step
                  key={index}
                  title={
                    <span
                      style={{ fontSize: '10px', padding: '0 2px', cursor: 'pointer' }}
                      onClick={() => handleStatusClick(index + 2)}
                    >
                      {step}
                    </span>
                  }
                />
              ))}
            </Steps>
          </Col>
        </Row>
      </Card>
      {selectedStatus && (
        <OrderStatusDetails
          orderId={trip._id}
          status={selectedStatus}
          visible={statusModalVisible}
          onClose={() => setStatusModalVisible(false)}
        />
      )}
    </>
  );
};

export default OrderTripCard;
