import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Steps, message } from 'antd';
import { fetchProvinceName, fetchDistrictName } from '../../services/LocationService';
import { 
  updateDeliveryOrderStatus, 
  updatePackingOrderStatus, 
  exportPackingOrderToSheet 
} from '../../services/OrderService';

const { Step } = Steps;

const CombinedOrderCard = ({
  deliveryTrip,
  packingTrip,
  onUpdateCombinedStatus,
  onViewDetailDelivery,
  onViewDetailPacking,
}) => {
  const [deliveryLocation, setDeliveryLocation] = useState({});
  const [packingLocation, setPackingLocation] = useState({});

  useEffect(() => {
    const fetchLocations = async () => {
      if (deliveryTrip.location) {
        const [startProvince, startDistrict, endProvince, endDistrict] = await Promise.all([
          fetchProvinceName(deliveryTrip.location.startPoint.provinceCode),
          fetchDistrictName(deliveryTrip.location.startPoint.districtCode),
          fetchProvinceName(deliveryTrip.location.endPoint.provinceCode),
          fetchDistrictName(deliveryTrip.location.endPoint.districtCode),
        ]);
        setDeliveryLocation({ startProvince, startDistrict, endProvince, endDistrict });
      }
      if (packingTrip.location) {
        const [startProvince, startDistrict, endProvince, endDistrict] = await Promise.all([
          fetchProvinceName(packingTrip.location.startPoint.provinceCode),
          fetchDistrictName(packingTrip.location.startPoint.districtCode),
          fetchProvinceName(packingTrip.location.endPoint.provinceCode),
          fetchDistrictName(packingTrip.location.endPoint.districtCode),
        ]);
        setPackingLocation({ startProvince, startDistrict, endProvince, endDistrict });
      }
    };
    fetchLocations();
  }, [deliveryTrip.location, packingTrip.location]);

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
      'Đang lên kho',
      'Chờ đóng hàng',
      'Đã đóng hàng',
      'Đang về cảng',
      'Đã hạ cảng',
      'Hoàn thành',
    ],
  };

  const deliverySteps = statusMap.delivery;
  const packingSteps = statusMap.packing;

  const currentDeliveryStep = deliveryTrip.status - 1 < deliverySteps.length ? deliveryTrip.status : 0;
  const currentPackingStep = packingTrip.status - 1 < packingSteps.length ? packingTrip.status : 0;

  // Xác định nút cập nhật trạng thái
  let updateButtonLabel = 'Cập nhật trạng thái';
  let updateAction = async () => {
    try {
      // Nếu đơn giao hàng chưa hoàn thành (status < 6) thì cập nhật đơn delivery
      if (deliveryTrip.status < 6) {
        await updateDeliveryOrderStatus(deliveryTrip._id);
        message.success('Cập nhật trạng thái đơn giao hàng thành công');
        onUpdateCombinedStatus(
          { ...deliveryTrip, status: deliveryTrip.status + 1 },
          packingTrip
        );
      }
      // Nếu đơn delivery đã hoàn thành và đơn packing chưa hoàn thành (status < 7)
      else if (deliveryTrip.status === 6 && packingTrip.status < 7) {
        await updatePackingOrderStatus(packingTrip._id);
        message.success('Cập nhật trạng thái đơn đóng hàng thành công');
        onUpdateCombinedStatus(
          deliveryTrip,
          { ...packingTrip, status: packingTrip.status + 1 }
        );
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái đơn hàng.');
    }
  };

  // Nếu packing đạt status 7 (và đơn delivery đã hoàn thành) thì nút chuyển thành "Xuất ra file"
  if (deliveryTrip.status === 6 && packingTrip.status === 7) {
    updateButtonLabel = 'Xuất ra file';
    updateAction = async () => {
      try {
        await exportPackingOrderToSheet(packingTrip._id);
        message.success('Đơn đóng hàng đã được xuất ra file thành công');
      } catch (error) {
        message.error('Lỗi khi xuất đơn hàng vào file.');
      }
    };
  }

  return (
    <Card style={{ border: '2px dashed #1890ff', marginBottom: '16px' }}>
      <Row gutter={16}>
        <Col span={12}>
          <h3>Đơn giao hàng</h3>
          <p><strong>Khách hàng:</strong> {deliveryTrip.customerName}</p>
          <p>
            <strong>Điểm đi:</strong> {deliveryLocation.startProvince}, {deliveryLocation.startDistrict}
          </p>
          <p>
            <strong>Điểm đến:</strong> {deliveryLocation.endProvince}, {deliveryLocation.endDistrict}
          </p>
          <p><strong>Loại cont:</strong> {deliveryTrip.moocType === 0 ? "20''" : "40''"}</p>
          <p><strong>Số container:</strong> {deliveryTrip.containerNumber}</p>
          {deliveryTrip.note && (
            <p>
              <strong>Ghi chú:</strong> <span style={{ color: '#8c8c8c' }}>{deliveryTrip.note}</span>
            </p>
          )}
          <Steps current={currentDeliveryStep} size="small" style={{ fontSize: '12px' }}>
            {deliverySteps.map((step, index) => (
              <Step key={index} title={<span style={{ fontSize: '10px' }}>{step}</span>} />
            ))}
          </Steps>
          <Button type="link" onClick={() => onViewDetailDelivery(deliveryTrip._id)}>
            Xem chi tiết
          </Button>
        </Col>
        <Col span={12}>
          <h3>Đơn đóng hàng</h3>
          <p><strong>Khách hàng:</strong> {packingTrip.customerName}</p>
          <p>
            <strong>Điểm đi:</strong> {packingLocation.startProvince}, {packingLocation.startDistrict}
          </p>
          <p>
            <strong>Điểm đến:</strong> {packingLocation.endProvince}, {packingLocation.endDistrict}
          </p>
          <p><strong>Loại cont:</strong> {packingTrip.moocType === 0 ? "20''" : "40''"}</p>
          <p><strong>Số container:</strong> {packingTrip.containerNumber}</p>
          {packingTrip.note && (
            <p>
              <strong>Ghi chú:</strong> <span style={{ color: '#8c8c8c' }}>{packingTrip.note}</span>
            </p>
          )}
          <Steps current={currentPackingStep} size="small" style={{ fontSize: '12px' }}>
            {packingSteps.map((step, index) => (
              <Step key={index} title={<span style={{ fontSize: '10px' }}>{step}</span>} />
            ))}
          </Steps>
          <Button type="link" onClick={() => onViewDetailPacking(packingTrip._id)}>
            Xem chi tiết
          </Button>
        </Col>
      </Row>
      <Row justify="end" style={{ marginTop: '16px' }}>
        <Button type="primary" onClick={updateAction}>
          {updateButtonLabel}
        </Button>
      </Row>
    </Card>
  );
};

export default CombinedOrderCard;
