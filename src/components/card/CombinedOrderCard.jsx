import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Steps, message, Typography, Popconfirm, Tag, Tooltip } from 'antd';
import { fetchProvinceName, fetchDistrictName, fetchWardName } from '../../services/LocationService';
import { 
  updateCombinationOrderStatus,
  exportOrderConnectionsToSheet,
  getVehicleByOrderId, 
  getOrderPartnerConnectionByOrderId,
  deleteOrderConnection 
} from '../../services/OrderService';
import OrderStatusDetails from '../popup/OrderStatusDetails'; 

const { Step } = Steps;
const { Title, Text, Link } = Typography;

const CombinedOrderCard = ({
  combinedStatus,
  combinedOrderId,
  deliveryTrip,
  packingTrip,
  onUpdateCombinedStatus,
  onViewDetailDelivery,
  onViewDetailPacking,
  onDeleteCombinedOrder,
  deliveryLineCode,
}) => {
  const [deliveryLocation, setDeliveryLocation] = useState({});
  const [packingLocation, setPackingLocation] = useState({});
  const [deliveryVehicleDetails, setDeliveryVehicleDetails] = useState(null); 
  const [packingVehicleDetails, setPackingVehicleDetails] = useState(null); 
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      if (deliveryTrip.location) {
        const [
          startProvinceRaw,
          startDistrictRaw,
          startWard,
          startLocationText,
          endProvinceRaw,
          endDistrictRaw,
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
        const startProvince = startProvinceRaw ? startProvinceRaw.replace(/^(Tỉnh|Thành Phố)\s*/i, '') : '';
        const startDistrict = startDistrictRaw ? startDistrictRaw.replace(/^(Huyện|Thị Xã|Quận)\s*/i, '') : '';
        const endProvince = endProvinceRaw ? endProvinceRaw.replace(/^(Tỉnh|Thành Phố)\s*/i, '') : '';
        const endDistrict = endDistrictRaw ? endDistrictRaw.replace(/^(Huyện|Thị Xã|Quận)\s*/i, '') : '';
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
          startProvinceRaw,
          startDistrictRaw,
          startWard,
          startLocationText,
          endProvinceRaw,
          endDistrictRaw,
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
        const startProvince = startProvinceRaw ? startProvinceRaw.replace(/^(Tỉnh|Thành Phố)\s*/i, '') : '';
        const startDistrict = startDistrictRaw ? startDistrictRaw.replace(/^(Huyện|Thị Xã|Quận)\s*/i, '') : '';
        const endProvince = endProvinceRaw ? endProvinceRaw.replace(/^(Tỉnh|Thành Phố)\s*/i, '') : '';
        const endDistrict = endDistrictRaw ? endDistrictRaw.replace(/^(Huyện|Thị Xã|Quận)\s*/i, '') : '';
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

  const deliverySteps = ['Giao hàng', 'Đã giao hàng', 'Đang lên kho', 'Đã đến kho'];
  const packingSteps = ['Đang đóng hàng', 'Đã đóng hàng', 'Đang về cảng', 'Hoàn thành'];

  const currentDeliveryStep = deliveryTrip.hasVehicle === 2 && deliveryTrip.status > 0
    ? deliverySteps.length 
    : (combinedStatus >= 0 && combinedStatus <= 5 ? combinedStatus - 1 : 4);

  const currentPackingStep = packingTrip.hasVehicle === 2 && packingTrip.status > 0
    ? packingSteps.length 
    : (combinedStatus >= 6 && combinedStatus <= 9 ? combinedStatus - 5 : -1); 


  let updateButtonLabel = 'Cập nhật trạng thái';
  let updateAction = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      await updateCombinationOrderStatus(combinedOrderId, userId);
      message.success('Cập nhật trạng thái thành công');
      onUpdateCombinedStatus(combinedOrderId, combinedStatus + 1); 
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  if (combinedStatus === 9 ) {
    if (packingTrip.writeToSheet === 1) {
      updateButtonLabel = 'Đã hoàn thành';
      updateAction = null; 
    } else if (packingTrip.writeToSheet === 0) {
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
  }

  const handleStatusClick = (statusIndex) => {
    if (statusIndex !== undefined && statusIndex !== null) {
      setSelectedStatus({ statusIndex }); 
      setStatusModalVisible(true);
    } else {
      console.error('Invalid statusIndex:', statusIndex);
    }
  };

  const containerStyle = {
    border: '2px dashed #1890ff',
    padding: 2,
    position: 'relative',
  };
  const blockStyle = { marginBottom: 4 };
  const labelStyle = { fontWeight: 'bold', marginRight: 2 };
  const noteStyle = { color: '#8c8c8c' };
  const stepsStyle = { marginTop: 0, marginBottom: 0, fontSize: '10px' }; 
  const topRightButtonStyle = {
    position: 'absolute',
    top: 2,
    right: 2,
  };

  return (
    <Card style={containerStyle} bodyStyle={{ padding: 4 }}>
      <div style={topRightButtonStyle}>
        {updateAction ? (
          <Button type="link" onClick={updateAction} size="small">
            {updateButtonLabel}
          </Button>
        ) : (
          <span style={{ color: 'green', fontWeight: 'bold' }}>{updateButtonLabel}</span>
        )}
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
              <Text style={labelStyle}>Đi:</Text>
              <Text>
                {`${deliveryLocation.startLocationText ? deliveryLocation.startLocationText + ', ' : ''}${deliveryLocation.startWard ? deliveryLocation.startWard + ', ' : ''}${deliveryLocation.startDistrict}, ${deliveryLocation.startProvince}`}
              </Text>
            </Col>
            <Col span={12}>
              <Text style={labelStyle}>Đến:</Text>
              <Text>
                {`${deliveryLocation.endLocationText ? deliveryLocation.endLocationText + ', ' : ''}${deliveryLocation.endWard ? deliveryLocation.endWard + ', ' : ''}${deliveryLocation.endDistrict}, ${deliveryLocation.endProvince}`}
              </Text>
            </Col> 
            <Col span={8}>
              <Text style={labelStyle}>Loại cont:</Text>
              <Text>{deliveryTrip.contType === 0 ? "20" : "40"}</Text>
            </Col>
            <Col span={8}>
              <Text style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Text>{deliveryTrip.containerNumber || '--'}</Text>
                  <Text> - {deliveryTrip.owner}</Text>
                  {deliveryLineCode && (
                    <Text> ({deliveryLineCode})</Text>
                  )}
                  {deliveryTrip.containerStatus === 1 &&
                    (deliveryTrip.noteCS ? (
                      <Tooltip title={deliveryTrip.noteCS}>
                        <Tag color="green" style={{ marginLeft: 2, cursor: 'pointer' }}>OK</Tag>
                      </Tooltip>
                    ) : (
                      <Tag color="green" style={{ marginLeft: 2 }}>OK</Tag>
                    ))}
                  {deliveryTrip.containerStatus === 2 &&
                    (deliveryTrip.noteCS ? (
                      <Tooltip title={deliveryTrip.noteCS}>
                        <Tag color="red" style={{ marginLeft: 2, cursor: 'pointer' }}>Không OK</Tag>
                      </Tooltip>
                    ) : (
                      <Tag color="red" style={{ marginLeft: 2 }}>Không OK</Tag>
                    ))}
                </span>
              </Text>
            </Col> 
            <Col span={8}>
              {deliveryVehicleDetails && (
                <>
                  <Text style={labelStyle}>Thông tin xe:</Text>
                  <Text>
                    {deliveryTrip.hasVehicle === 1
                      ? `${deliveryVehicleDetails.headPlate || 'N/A'} - ${deliveryVehicleDetails.moocType === 0 ? "20" : "40"}`
                      : deliveryVehicleDetails.shortName || 'Không xác định'}
                  </Text>
                </>
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
                    onClick={() => handleStatusClick(index + 1)}
                  >
                    {step}
                  </span>
                }
              />
            ))}
          </Steps>
        </div>

        <div style={blockStyle}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                <Link onClick={() => onViewDetailPacking(packingTrip._id)}>
                  Chuyến đóng hàng: {packingTrip.customerName}
                </Link>
              </Title>
            </Col>
            {combinedStatus < 4 && (
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
            <Col span={8} style={{ paddingTop: 0, paddingBottom: 0 }}>
              <Text style={labelStyle}>Loại cont:</Text>
              <Text>{packingTrip.contType === 0 ? "20" : "40"}</Text>
            </Col>
            <Col span={8} style={{ paddingTop: 0, paddingBottom: 0 }}>
              <Text style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Text >{packingTrip.containerNumber || '--'}</Text>
                  <Text> - {packingTrip.owner}</Text>
                  {packingTrip.command === 1 &&
                    (packingTrip.noteCS ? (
                      <Tooltip title={packingTrip.noteCS}>
                        <Tag color='green' style={{ marginLeft: 2, cursor: 'pointer' }}>Hạ</Tag>
                      </Tooltip>
                    ) : (
                      <Tag color='green' style={{ marginLeft: 2 }}>Hạ</Tag>
                    ))}
                  {packingTrip.command === 2 &&
                    (packingTrip.noteCS ? (
                      <Tooltip title={packingTrip.noteCS}>
                        <Tag color='red' style={{ marginLeft: 2, cursor: 'pointer' }}>Không hạ</Tag>
                      </Tooltip>
                    ) : (
                      <Tag color='red' style={{ marginLeft: 2 }}>Không hạ</Tag>
                    ))}
                </span>
              </Text>
            </Col> 
            <Col span={8} style={{ paddingTop: 0, paddingBottom: 0 }}>
              {packingVehicleDetails && (
                <>
                  <Text style={labelStyle}>Thông tin xe:</Text>
                  <Text>
                    {packingTrip.hasVehicle === 1
                      ? `${packingVehicleDetails.headPlate || 'N/A'} - ${packingVehicleDetails.moocType === 0 ? "20" : "40"}`
                      : packingVehicleDetails.shortName || 'Không xác định'}
                  </Text>
                </>
              )}
            </Col>
            {packingTrip.note && (
              <>
                <Text style={labelStyle}>Ghi chú:</Text>
                <Text style={noteStyle}>{packingTrip.note}</Text>
              </>
            )}
          </Row>
          <Steps current={currentPackingStep} size="small" style={stepsStyle}>
            {packingSteps.map((step, index) => (
              <Step
                key={index}
                title={
                  <span
                    style={{ fontSize: '10px', padding: '0 2px', cursor: 'pointer' }}
                    onClick={() => handleStatusClick(index + 5)}
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
      {selectedStatus && selectedStatus.statusIndex !== undefined && (
        <OrderStatusDetails
          orderId={combinedOrderId}
          status={selectedStatus.statusIndex}
          visible={statusModalVisible}
          onClose={() => setStatusModalVisible(false)}
        />
      )}
    </Card>
  );
};

export default CombinedOrderCard;
