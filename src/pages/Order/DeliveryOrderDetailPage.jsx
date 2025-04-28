import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Spin, message, Button, Modal, Form, Input } from 'antd';
import { getDeliveryOrderDetails, updateDeliveryOrder } from '../../services/OrderService';
import { fetchProvinceName, fetchDistrictName, fetchWardName } from '../../services/LocationService';
import CostCard from '../../components/card/CostCard';
import DispatchVehicleCard from '../../components/card/DispatchVehicleCard';
import LocationSelector from '../../components/location/LocationSelector';

const DeliveryOrderDetailPage = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const statusMap = {
    0: 'Mới',
    1: 'Đã giao xe',
    2: 'Đang giao hàng',
    3: 'Đã giao hàng',
    4: 'Đang hạ vỏ',
    5: 'Đã hạ vỏ',
    6: 'Hoàn thành',
  };

  const fetchOrderDetails = React.useCallback(async () => {
    try {
      const response = await getDeliveryOrderDetails(orderId);
      setOrderDetails(response);

      // Fetch start location details
      const startProvince = await fetchProvinceName(response.location.startPoint.provinceCode);
      const startDistrict = await fetchDistrictName(response.location.startPoint.districtCode);
      const startWard = response.location.startPoint.wardCode
        ? await fetchWardName(response.location.startPoint.wardCode)
        : null;
      const startLocationText = response.location.startPoint.locationText || '';
      setStartLocation(
        `${startLocationText ? startLocationText + ', ' : ''}${startWard ? startWard + ', ' : ''}${startDistrict}, ${startProvince}`
      );

      // Fetch end location details
      const endProvince = await fetchProvinceName(response.location.endPoint.provinceCode);
      const endDistrict = await fetchDistrictName(response.location.endPoint.districtCode);
      const endWard = response.location.endPoint.wardCode
        ? await fetchWardName(response.location.endPoint.wardCode)
        : null;
      const endLocationText = response.location.endPoint.locationText || '';
      setEndLocation(
        `${endLocationText ? endLocationText + ', ' : ''}${endWard ? endWard + ', ' : ''}${endDistrict}, ${endProvince}`
      );
    } catch (error) {
      message.error('Lỗi khi tải chi tiết đơn giao hàng');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleUpdateStatus = () => {
    setIsModalVisible(true);
    form.setFieldsValue({
      containerNumber: orderDetails.containerNumber,
      note: orderDetails.note,
      endPoint: orderDetails.location.endPoint, // Set the current endPoint value
      locationText: orderDetails.location.endPoint.locationText || '', // Set locationText
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedDetails = {
        ...values,
        location: {
          ...orderDetails.location,
          endPoint: {
            ...values.endPoint,
            locationText: values.locationText, // Update locationText
          },
        },
      };
      await updateDeliveryOrder(orderId, updatedDetails);
      message.success('Cập nhật thông tin đơn hàng thành công');
      setOrderDetails({ ...orderDetails, ...updatedDetails });
      setIsModalVisible(false);
      fetchOrderDetails();
    } catch (error) {
      message.error('Lỗi khi cập nhật thông tin đơn hàng');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!orderDetails) {
    return <p>Không tìm thấy chi tiết đơn giao hàng</p>;
  }

  return (
    <>
      <Card
        title="Chi tiết đơn giao hàng"
        bordered={false}
        extra={<Button onClick={handleUpdateStatus}>Cập nhật thông tin đơn hàng</Button>}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}><strong>Khách hàng:</strong> {orderDetails.customer.name}</Col>
          <Col span={12}><strong>Tên ngắn:</strong> {orderDetails.customer.shortName}</Col>
          <Col span={12}><strong>Điểm đi:</strong> {startLocation}</Col>
          <Col span={12}><strong>Điểm đến:</strong> {endLocation}</Col>
          <Col span={12}><strong>Đã có xe:</strong> {orderDetails.hasVehicle ? 'Có' : 'Không'}</Col>
          <Col span={12}><strong>Thời gian dự kiến:</strong> {orderDetails.estimatedTime ? orderDetails.estimatedTime : 'Chưa có'}</Col>
          <Col span={12}><strong>Ghép chuyến:</strong> {orderDetails.isCombinedTrip ? 'Có' : 'Không'}</Col>
          <Col span={12}><strong>Trạng thái:</strong> {statusMap[orderDetails.status]}</Col>
          <Col span={12}><strong>Loại cont:</strong> {orderDetails.contType === 0 ? "20''" : "40''"}</Col>
          <Col span={12}><strong>Trọng lượng:</strong> {orderDetails.weight} tấn</Col>
          <Col span={12}><strong>Chủ sở hữu:</strong> {orderDetails.owner}</Col>
          <Col span={12}><strong>Số container:</strong> {orderDetails.containerNumber}</Col>
          <Col span={12}><strong>Ghi chú:</strong> {orderDetails.note}</Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <CostCard orderId={orderDetails._id} />
        </Col>
        <Col span={12}>
          <DispatchVehicleCard 
            orderId={orderDetails._id} 
            delivery={true} 
            contType ={orderDetails.contType} 
            vehicles={orderDetails.vehicles}
            transportTripId={orderDetails.externalFleetCostId}
            hasVehicle={orderDetails.hasVehicle} 
            />
        </Col>
      </Row>

      <Modal
        title="Cập nhật thông tin đơn hàng"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Số container"
            name="containerNumber"
            rules={[{ required: false, message: 'Vui lòng nhập số container' }]}
          >
            <Input placeholder="Nhập số container" />
          </Form.Item>
          <Form.Item
            label="Ghi chú"
            name="note"
            rules={[{ required: false }]}
          >
            <Input.TextArea placeholder="Nhập ghi chú" rows={4} />
          </Form.Item>
          <Form.Item
            label="Điểm đến"
            name="endPoint"
            rules={[{ required: true, message: 'Vui lòng chọn điểm đến' }]}
          >
            <LocationSelector />
          </Form.Item>
          <Form.Item
            label="Địa chỉ chi tiết"
            name="locationText"
            rules={[{ required: false, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
          >
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DeliveryOrderDetailPage;