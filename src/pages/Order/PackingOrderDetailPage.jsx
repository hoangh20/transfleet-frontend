import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Spin, message, Button } from 'antd';
import { getPackingOrderDetails } from '../../services/OrderService';
import { fetchProvinceName, fetchDistrictName } from '../../services/LocationService';
import CostCard from '../../components/card/CostCard';
import DispatchVehicleCard from '../../components/card/DispatchVehicleCard';

const PackingOrderDetailPage = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getPackingOrderDetails(orderId);
        setOrderDetails(response);

        const startProvince = await fetchProvinceName(response.location.startPoint.provinceCode);
        const startDistrict = await fetchDistrictName(response.location.startPoint.districtCode);
        setStartLocation(`${startDistrict}, ${startProvince}`);

        const endProvince = await fetchProvinceName(response.location.endPoint.provinceCode);
        const endDistrict = await fetchDistrictName(response.location.endPoint.districtCode);
        setEndLocation(`${endDistrict}, ${endProvince}`);
      } catch (error) {
        message.error('Lỗi khi tải chi tiết đơn đóng hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleUpdateStatus = () => {
    // Logic to update the status
    message.info('Update status button clicked');
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!orderDetails) {
    return <p>Không tìm thấy chi tiết đơn đóng hàng</p>;
  }

  return (
    <>
      <Card
        title="Chi tiết đơn đóng hàng"
        bordered={false}
        extra={<Button onClick={handleUpdateStatus}>Cập nhật trạng thái</Button>}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}><strong>Khách hàng:</strong> {orderDetails.customer.name}</Col>
          <Col span={12}><strong>Ngày tạo:</strong> {new Date(orderDetails.createdAt).toLocaleString()}</Col>
          <Col span={12}><strong>Điểm đi:</strong> {startLocation}</Col>
          <Col span={12}><strong>Điểm đến:</strong> {endLocation}</Col>
          <Col span={12}><strong>Số container:</strong> {orderDetails.containerNumber}</Col>
          <Col span={12}><strong>Loại mooc:</strong> {orderDetails.moocType === 0 ? "20''" : "40''"}</Col>
          <Col span={12}><strong>Chủ sở hữu:</strong> {orderDetails.owner}</Col>
          <Col span={12}><strong>Ghi chú:</strong> {orderDetails.note}</Col>
          <Col span={12}><strong>Trạng thái:</strong> {orderDetails.status}</Col>
          <Col span={12}><strong>Đã có xe:</strong> {orderDetails.hasVehicle ? 'Có' : 'Không'}</Col>
          <Col span={12}><strong>Ghép chuyến:</strong> {orderDetails.isCombinedTrip ? 'Có' : 'Không'}</Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <CostCard orderId={orderDetails._id} />
        </Col>
        <Col span={12}>
          <DispatchVehicleCard delivery={orderDetails.delivery} />
        </Col>
      </Row>
    </>
  );
};

export default PackingOrderDetailPage;