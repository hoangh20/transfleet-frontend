import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Steps, message, Typography, Popconfirm } from 'antd';
import { fetchProvinceName, fetchDistrictName, fetchWardName } from '../../services/LocationService';
import { 
  updateDeliveryOrderStatus, 
  updatePackingOrderStatus, 
  exportOrderConnectionsToSheet,
  getVehicleByOrderId, 
  getOrderPartnerConnectionByOrderId,
  deleteOrderConnection // Import API
} from '../../services/OrderService';
import OrderStatusDetails from '../popup/OrderStatusDetails'; 

const { Step } = Steps;
const { Title, Text, Link } = Typography;

const CombinedOrderCard = ({
  combinedOrderId,
  deliveryTrip,
  packingTrip,
  onUpdateCombinedStatus,
  onViewDetailDelivery,
  onViewDetailPacking,
  onDeleteCombinedOrder, // Callback để cập nhật danh sách sau khi xóa
}) => {
  const [deliveryLocation, setDeliveryLocation] = useState({});
  const [packingLocation, setPackingLocation] = useState({});
  const [deliveryVehicleDetails, setDeliveryVehicleDetails] = useState(null); 
  const [packingVehicleDetails, setPackingVehicleDetails] = useState(null); 
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      if (deliveryTrip.location) {
        const [
          startProvince,
          startDistrict,
          startWard,
          startLocationText,
          endProvince,
          endDistrict,
          endWard,
          endLocationText,
        ] = await Promise.all([
          fetchProvinceName(deliveryTrip.location.startPoint.provinceCode),
          fetchDistrictName(deliveryTrip.location.startPoint.districtCode),
          deliveryTrip.location.startPoint.wardCode
            ? fetchWardName(deliveryTrip.location.startPoint.wardCode)
            : null,
          deliveryTrip.location.startPoint.locationText || '',
          fetchProvinceName(deliveryTrip.location.endPoint.provinceCode),
          fetchDistrictName(deliveryTrip.location.endPoint.districtCode),
          deliveryTrip.location.endPoint.wardCode
            ? fetchWardName(deliveryTrip.location.endPoint.wardCode)
            : null,
          deliveryTrip.location.endPoint.locationText || '',
        ]);
        setDeliveryLocation({
          startProvince,
          startDistrict,
          startWard,
          startLocationText,
          endProvince,
          endDistrict,
          endWard,
          endLocationText,
        });
      }
      if (packingTrip.location) {
        const [
          startProvince,
          startDistrict,
          startWard,
          startLocationText,
          endProvince,
          endDistrict,
          endWard,
          endLocationText,
        ] = await Promise.all([
          fetchProvinceName(packingTrip.location.startPoint.provinceCode),
          fetchDistrictName(packingTrip.location.startPoint.districtCode),
          packingTrip.location.startPoint.wardCode
            ? fetchWardName(packingTrip.location.startPoint.wardCode)
            : null,
          packingTrip.location.startPoint.locationText || '',
          fetchProvinceName(packingTrip.location.endPoint.provinceCode),
          fetchDistrictName(packingTrip.location.endPoint.districtCode),
          packingTrip.location.endPoint.wardCode
            ? fetchWardName(packingTrip.location.endPoint.wardCode)
            : null,
          packingTrip.location.endPoint.locationText || '',
        ]);
        setPackingLocation({
          startProvince,
          startDistrict,
          startWard,
          startLocationText,
          endProvince,
          endDistrict,
          endWard,
          endLocationText,
        });
      }
    };

    const fetchVehicleDetails = async () => {
      try {
        if (deliveryTrip.hasVehicle === 1) {
          const vehicle = await getVehicleByOrderId(deliveryTrip._id);
          setDeliveryVehicleDetails(vehicle);
        } else if (deliveryTrip.hasVehicle === 2) {
          const partner = await getOrderPartnerConnectionByOrderId(deliveryTrip._id);
          setDeliveryVehicleDetails({ shortName: partner.partnerId.shortName });
        }
        if (packingTrip.hasVehicle === 1) {
          const vehicle = await getVehicleByOrderId(packingTrip._id);
          setPackingVehicleDetails(vehicle);
        } else if (packingTrip.hasVehicle === 2) {
          const partner = await getOrderPartnerConnectionByOrderId(packingTrip._id);
          setPackingVehicleDetails({ shortName: partner.partnerId.shortName });
        }
      } catch (error) {
        console.error('Error fetching vehicle or partner details:', error);
      }
    };

    fetchLocations();
    fetchVehicleDetails();
  }, [deliveryTrip, packingTrip]);

  const handleDelete = async () => {
    try {
      await deleteOrderConnection(combinedOrderId); 
      message.success('Xóa kết nối đơn hàng thành công');
      onDeleteCombinedOrder(combinedOrderId); 
    } catch (error) {
      message.error('Lỗi khi xóa kết nối đơn hàng.');
    }
  };

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

  const currentDeliveryStep = deliveryTrip.status - 1 < deliverySteps.length
    ? deliveryTrip.status
    : 0;
  const currentPackingStep = packingTrip.status - 1 < packingSteps.length
    ? packingTrip.status
    : 0;

  let updateButtonLabel = 'Cập nhật trạng thái';
  let updateAction = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id; // Lấy userId từ localStorage

      if (deliveryTrip.status < 6) {
        await updateDeliveryOrderStatus(deliveryTrip._id, userId, deliveryTrip.status + 1); // Gửi userId và status
        message.success('Cập nhật trạng thái đơn giao hàng thành công');
        onUpdateCombinedStatus(
          { ...deliveryTrip, status: deliveryTrip.status + 1 },
          packingTrip
        );
      } else if (deliveryTrip.status === 6 && packingTrip.status < 7) {
        await updatePackingOrderStatus(packingTrip._id, userId, packingTrip.status + 1); // Gửi userId và status
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

  if (deliveryTrip.status === 6 && packingTrip.status === 7 && packingTrip.writeToSheet === 0) {
    updateButtonLabel = 'Xuất ra file';
    updateAction = async () => {
      try {
        await exportOrderConnectionsToSheet(combinedOrderId);
        message.success('Đơn ghép đã được xuất ra file thành công');
      } catch (error) {
        message.error('Lỗi khi xuất đơn hàng vào file.');
      }
    };
  }

  const handleStatusClick = (orderId, status) => {
    setSelectedOrderId(orderId);
    setSelectedStatus(status);
    setStatusModalVisible(true);
  };

  // Style được tối giản để tiết kiệm diện tích
  const containerStyle = {
    border: '2px dashed #1890ff',
    padding: 4,
    position: 'relative',
  };
  const blockStyle = { marginBottom: 4 };
  const labelStyle = { fontWeight: 'bold', marginRight: 2 };
  const noteStyle = { color: '#8c8c8c' };
  const stepsStyle = { marginTop: 4, fontSize: '10px' };
  const topRightButtonStyle = {
    position: 'absolute',
    top: 2,
    right: 2,
  };

  return (
    <Card style={containerStyle} bodyStyle={{ padding: 4 }}>
      {/* Nút cập nhật trạng thái ở góc trên bên phải */}
      <div style={topRightButtonStyle}>
        <Button type="link" onClick={updateAction} size="small">
          {updateButtonLabel}
        </Button>
      </div>

      <div>
        {/* Đơn giao hàng */}
        <div style={blockStyle}>
          <Title level={5} style={{ margin: 0 }}>
            <Link onClick={() => onViewDetailDelivery(deliveryTrip._id)}>
              Chuyến giao hàng: {deliveryTrip.customerName}
            </Link>
          </Title>
          <Row gutter={[4, 2]}>
            <Col span={12}>
              <Text style={labelStyle}>Điểm đi:</Text>
              <Text>
                {`${deliveryLocation.startLocationText ? deliveryLocation.startLocationText + ', ' : ''}${deliveryLocation.startWard ? deliveryLocation.startWard + ', ' : ''}${deliveryLocation.startDistrict}, ${deliveryLocation.startProvince}`}
              </Text>
            </Col>
            <Col span={12}>
              <Text style={labelStyle}>Điểm đến:</Text>
              <Text>
                {`${deliveryLocation.endLocationText ? deliveryLocation.endLocationText + ', ' : ''}${deliveryLocation.endWard ? deliveryLocation.endWard + ', ' : ''}${deliveryLocation.endDistrict}, ${deliveryLocation.endProvince}`}
              </Text>
            </Col>
            <Col span={8}>
              <Text style={labelStyle}>Số container:</Text>
              <Text>{deliveryTrip.containerNumber}</Text>
            </Col>
            <Col span={8}>
              <Text style={labelStyle}>Loại cont:</Text>
              <Text>{deliveryTrip.contType === 0 ? "20''" : "40''"}</Text>
            </Col>
            <Col span={8}>
              {deliveryVehicleDetails && (
                <Col span={24}>
                  <Text style={labelStyle}>Thông tin xe:</Text>
                  <Text>
                    {deliveryTrip.hasVehicle === 1
                      ? `${deliveryVehicleDetails.headPlate || 'N/A'} - ${deliveryVehicleDetails.moocType === 0 ? "20''" : "40''"}`
                      : deliveryVehicleDetails.shortName || 'Không xác định'}
                  </Text>
                </Col>
              )}
            </Col>
            {deliveryTrip.note && (
              <Col span={24}>
                <Text style={labelStyle}>Ghi chú:</Text>
                <Text style={noteStyle}>{deliveryTrip.note}</Text>
              </Col>
            )}
          </Row>
          <Steps current={currentDeliveryStep} size="small" style={stepsStyle}>
            {deliverySteps.map((step, index) => (
              <Step
                key={index}
                title={
                  <span
                    style={{ fontSize: '10px', padding: '0 2px', cursor: 'pointer' }}
                    onClick={() => handleStatusClick(deliveryTrip._id, index + 1)}
                  >
                    {step}
                  </span>
                }
              />
            ))}
          </Steps>
        </div>

        {/* Đơn đóng hàng */}
        <div style={blockStyle}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                <Link onClick={() => onViewDetailPacking(packingTrip._id)}>
                  Chuyến đóng hàng: {packingTrip.customerName}
                </Link>
              </Title>
            </Col>
            {deliveryTrip.status !== 6 && (
              <Col>
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa kết nối đơn hàng này không?"
                  onConfirm={handleDelete} // Gọi hàm xóa khi xác nhận
                  okText="Có"
                  cancelText="Không"
                >
                  <Button type="text" danger>
                    Xóa kết nối
                  </Button>
                </Popconfirm>
              </Col>
            )}
          </Row>
          <Row gutter={[4, 2]}>
            <Col span={12}>
              <Text style={labelStyle}>Điểm đi:</Text>
              <Text>
                {`${packingLocation.startLocationText ? packingLocation.startLocationText + ', ' : ''}${packingLocation.startWard ? packingLocation.startWard + ', ' : ''}${packingLocation.startDistrict}, ${packingLocation.startProvince}`}
              </Text>
            </Col>
            <Col span={12}>
              <Text style={labelStyle}>Điểm đến:</Text>
              <Text>
                {`${packingLocation.endLocationText ? packingLocation.endLocationText + ', ' : ''}${packingLocation.endWard ? packingLocation.endWard + ', ' : ''}${packingLocation.endDistrict}, ${packingLocation.endProvince}`}
              </Text>
            </Col>
            <Col span={8}>
              <Text style={labelStyle}>Số container:</Text>
              <Text>{packingTrip.containerNumber}</Text>
            </Col>
            <Col span={8}>
              <Text style={labelStyle}>Loại cont:</Text>
              <Text>{packingTrip.contType === 0 ? "20''" : "40''"}</Text>
            </Col>
            <Col span={8}>
              {packingVehicleDetails && (
                <Col span={24}>
                  <Text style={labelStyle}>Thông tin xe:</Text>
                  <Text>
                    {packingTrip.hasVehicle === 1
                      ? `${packingVehicleDetails.headPlate || 'N/A'} - ${packingVehicleDetails.moocType === 0 ? "20''" : "40''"}`
                      : packingVehicleDetails.shortName || 'Không xác định'}
                  </Text>
                </Col>
              )}
            </Col>
            {packingTrip.note && (
              <Col span={24}>
                <Text style={labelStyle}>Ghi chú:</Text>
                <Text style={noteStyle}>{packingTrip.note}</Text>
              </Col>
            )}
          </Row>
          <Steps current={currentPackingStep} size="small" style={stepsStyle}>
            {packingSteps.map((step, index) => (
              <Step
                key={index}
                title={
                  <span
                    style={{ fontSize: '10px', padding: '0 2px', cursor: 'pointer' }}
                    onClick={() => handleStatusClick(packingTrip._id, index + 1)}
                  >
                    {step}
                  </span>
                }
              />
            ))}
          </Steps>
        </div>
      </div>

      {/* Modal hiển thị chi tiết trạng thái */}
      {selectedStatus && (
        <OrderStatusDetails
          orderId={selectedOrderId}
          status={selectedStatus}
          visible={statusModalVisible}
          onClose={() => setStatusModalVisible(false)}
        />
      )}
    </Card>
  );
};

export default CombinedOrderCard;
