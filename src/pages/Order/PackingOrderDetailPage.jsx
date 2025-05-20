import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Spin, message, Button, Modal, Form, Input, Select,DatePicker } from 'antd';
import { getPackingOrderDetails, updatePackingOrder } from '../../services/OrderService';
import { fetchProvinceName, fetchDistrictName, fetchWardName } from '../../services/LocationService';
import CostCard from '../../components/card/CostCard';
import DispatchVehicleCard from '../../components/card/DispatchVehicleCard';
import LocationSelector from '../../components/location/LocationSelector';
import dayjs from 'dayjs';
import IncidentalCostCard from '../../components/card/IncidentalCostCard';
import { reExportOrderToSheet } from '../../services/OrderService';
const PackingOrderDetailPage = () => {
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
    2: 'Đang lên kho',
    3: 'Chờ đóng hàng',
    4: 'Đã đóng hàng',
    5: 'Đang về cảng',
    6: 'Đã về cảng',
    7: 'Hoàn thành',
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getPackingOrderDetails(orderId);
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
        message.error('Lỗi khi tải chi tiết đơn đóng hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);
  const handleReExport = async () => {
  try {
    await reExportOrderToSheet({ orderId: orderDetails._id, type: 'packing' });
    message.success('Xuất lại file thành công!');
  } catch (error) {
    message.error(error.message || 'Xuất lại file thất bại!');
  }
  };
  const handleUpdateStatus = () => {
    setIsModalVisible(true);
    form.setFieldsValue({
      containerNumber: orderDetails.containerNumber,
      note: orderDetails.note,
      owner: orderDetails.owner,
      closeCombination: orderDetails.closeCombination,
      startPoint: orderDetails.location.startPoint, 
      locationText: orderDetails.location.startPoint.locationText || '', 
      packingDate: orderDetails.packingDate ? dayjs(orderDetails.packingDate) : null, 
      estimatedTime: orderDetails.estimatedTime ? dayjs(orderDetails.estimatedTime) : null,
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedDetails = {
        ...values,
        packingDate: values.packingDate ? values.packingDate.format('YYYY-MM-DD') : null, 
        estimatedTime: values.estimatedTime ? values.estimatedTime.format('YYYY-MM-DD HH:mm:ss') : null,
        location: {
          ...orderDetails.location,
          startPoint: {
            ...values.startPoint,
            locationText: values.locationText, 
          },
        },
      };
      await updatePackingOrder(orderId, updatedDetails);
      message.success('Cập nhật thông tin đơn hàng thành công');
      setOrderDetails({ ...orderDetails, ...updatedDetails });
      setIsModalVisible(false);
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
    return <p>Không tìm thấy chi tiết đơn đóng hàng</p>;
  }

  return (
    <>
      <Card
        title="Chi tiết đơn đóng hàng"
        bordered={false}
        extra={
            <div>
              {orderDetails.writeToSheet === 1 && (
                <Button type="primary" onClick={handleReExport}>
                  Xuất lại ra file
                </Button>
              )}
              <Button onClick={handleUpdateStatus} style={{ marginLeft: 8 }}>
                Cập nhật thông tin đơn hàng
              </Button>
            </div>
          }
      >
        <Row gutter={[16, 16]}>
          <Col span={12}><strong>Khách hàng:</strong> {orderDetails.customer.name}</Col>
          <Col span={12}><strong>Ngày tạo đơn:</strong> {orderDetails.packingDate ? dayjs(orderDetails.packingDate).format('DD/MM/YYYY') : 'Chưa có'}</Col>
          <Col span={12}><strong>Thời gian dự kiến:</strong> {orderDetails.estimatedTime ? dayjs(orderDetails.estimatedTime).format('DD/MM/YYYY HH:mm:ss') : 'Chưa có'}</Col>
          <Col span={12}><strong>Điểm đi:</strong> {startLocation}</Col>
          <Col span={12}><strong>Điểm đến:</strong> {endLocation}</Col>
          <Col span={12}><strong>Số container:</strong> {orderDetails.containerNumber}</Col>
          <Col span={12}><strong>Loại cont:</strong> {orderDetails.contType === 0 ? "20" : "40"}</Col>
          <Col span={12}><strong>Trọng lượng:</strong> {orderDetails.weight} Tấn</Col>
          <Col span={12}><strong>Chủ sở hữu:</strong> {orderDetails.owner}</Col>
          <Col span={12}><strong>Ghi chú:</strong> {orderDetails.note}</Col>
          <Col span={12}><strong>Trạng thái:</strong> {statusMap[orderDetails.status]}</Col>
          <Col span={12}><strong>Loại đóng hàng: </strong> {orderDetails.closeCombination === 1 ? 'Đóng kết hợp' : 'Gắp vỏ'}</Col>
          <Col span={12}><strong>Đã có xe:</strong> {orderDetails.hasVehicle === 1 ? 'Có' : 'Không'}</Col>
          <Col span={12}><strong>Ghép chuyến:</strong> {orderDetails.isCombinedTrip ? 'Có' : 'Không'}</Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={6}>
          <CostCard orderId={orderDetails._id} />
        </Col>
        <Col span={6}>
          <IncidentalCostCard orderId={orderDetails._id} />
        </Col>
        <Col span={12}>
          <DispatchVehicleCard
            orderId={orderDetails._id}
            isDeliveryOrder={false}
            vehicles={orderDetails.vehicles}
            transportTripId={orderDetails.externalFleetCostId}
            hasVehicle={orderDetails.hasVehicle} 
            isCombinedTrip={orderDetails.isCombinedTrip}
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
          label="Ngày đóng hàng"
          name="packingDate"
          rules={[{ required: true, message: 'Vui lòng chọn ngày đóng hàng' }]}
        >
          <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày đóng hàng" format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Thời gian dự kiến"
          name="estimatedTime"
          rules={[{ required: true, message: 'Vui lòng chọn thời gian dự kiến' }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm:ss' }} 
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="Chọn thời gian dự kiến"
          />
        </Form.Item>
          <Form.Item
            label="Số container"
            name="containerNumber"
            rules={[{ required: false, message: 'Vui lòng nhập số container' }]}
          >
            <Input placeholder="Nhập số container" />
          </Form.Item>
          <Form.Item
            label="Loại đóng hàng"
            name="closeCombination"
            rules={[{ required: true, message: 'Vui lòng chọn loại đóng hàng' }]}
          >
            <Select placeholder="Chọn loại đóng hàng">
              <Select.Option value={0}>Gắp vỏ</Select.Option>
              <Select.Option value={1}>Kết hợp</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Chủ vỏ"
            name="owner"
            rules={[{ required: false, message: 'Vui lòng nhập chủ vỏ' }]}
          >
            <Input placeholder="Nhập chủ vỏ" />
          </Form.Item>
          <Form.Item
            label="Điểm đi"
            name="startPoint"
            rules={[{ required: true, message: 'Vui lòng chọn điểm đi' }]}
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
          <Form.Item
            label="Ghi chú"
            name="note"
            rules={[{ required: false }]}
          >
            <Input.TextArea placeholder="Nhập ghi chú" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PackingOrderDetailPage;