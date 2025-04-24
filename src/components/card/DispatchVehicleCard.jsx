import React, { useState, useEffect } from 'react';
import { Card, Radio, Checkbox, Button, message, List, Row, Col } from 'antd';
import { getAllVehicles } from '../../services/VehicleService';
import { connectVehicleToDeliveryOrder, connectVehicleToPackingOrder } from '../../services/OrderService';
import { getPartnerTransportCostsByTransportTrip } from '../../services/ExternalFleetCostService';
import { assignPartnerToDeliveryOrder, assignPartnerToPackingOrder } from '../../services/OrderService';
import { getOrderPartnerConnectionByOrderId, getVehicleByOrderId } from '../../services/OrderService'; // Import new APIs
import CreatePartnerTransportCost from '../popup/CreatePartnerTransportCost';

const DispatchVehicleCard = ({ orderId, delivery, contType, transportTripId, hasVehicle }) => {
  const [vehicleType, setVehicleType] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [partnerVehicles, setPartnerVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [assignedData, setAssignedData] = useState(null); // State to store assigned vehicle/partner data

  const handleVehicleTypeChange = (e) => {
    setVehicleType(e.target.value);
    setSelectedVehicles([]);
  };

  const fetchAssignedData = async () => {
    setLoading(true);
    try {
      if (hasVehicle === 1) {
        // Fetch assigned vehicle for internal fleet
        const response = await getVehicleByOrderId(orderId);
        setAssignedData(response);
      } else if (hasVehicle === 2) {
        // Fetch assigned partner for external fleet
        const response = await getOrderPartnerConnectionByOrderId(orderId);
        setAssignedData(response);
      } else {
        setAssignedData(null);
      }
    } catch (error) {
      message.error('Không thể tải thông tin giao xe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVehicle, orderId]);

  const fetchPartnerVehicles = async () => {
    setLoading(true);
    try {
      const response = await getPartnerTransportCostsByTransportTrip(transportTripId);

      let partnerCosts = [];
      if (response) {
        partnerCosts = Array.isArray(response) ? response : [response];
      }

      if (partnerCosts.length === 0) {
        message.info('Không có đối tác vận chuyển nào khả dụng cho chuyến này');
        setPartnerVehicles([]);
        return;
      }

      const partnerVehiclesWithDetails = partnerCosts.map((partnerCost) => ({
        ...partnerCost,
        partnerName: partnerCost.partner?.shortName || 'Không xác định',
      }));

      setPartnerVehicles(partnerVehiclesWithDetails);
    } catch (error) {
      message.error('Không thể tải danh sách xe đối tác');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleType === 'internal') {
      const fetchVehicles = async () => {
        setLoading(true);
        try {
          const response = await getAllVehicles();
          const filteredVehicles = contType === 1
            ? response.data.filter((vehicle) => vehicle.moocType === 1)
            : response.data;
          setVehicles(filteredVehicles);
        } catch (error) {
          message.error('Lỗi khi tải danh sách xe nội bộ');
        } finally {
          setLoading(false);
        }
      };

      fetchVehicles();
    } else if (vehicleType === 'partner') {
      fetchPartnerVehicles();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleType, transportTripId, contType]);

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicles((prevSelected) =>
      prevSelected.includes(vehicleId) ? [] : [vehicleId]
    );
  };

  const handleInternalDispatch = async (vehicleId) => {
    try {
      if (delivery) {
        await connectVehicleToDeliveryOrder(orderId, vehicleId);
        message.success('Giao xe cho đơn giao hàng thành công');
      } else {
        await connectVehicleToPackingOrder(orderId, vehicleId);
        message.success('Giao xe cho đơn đóng hàng thành công');
      }
      setSelectedVehicles([]);
      fetchAssignedData(); // Refresh assigned data
    } catch (error) {
      message.error('Lỗi khi giao xe nội bộ');
    }
  };

  const handlePartnerDispatch = async (partnerId) => {
    try {
      if (delivery) {
        await assignPartnerToDeliveryOrder(orderId, partnerId);
        message.success('Giao đối tác cho đơn giao hàng thành công');
      } else {
        await assignPartnerToPackingOrder(orderId, partnerId);
        message.success('Giao đối tác cho đơn đóng hàng thành công');
      }
      setSelectedVehicles([]);
      fetchAssignedData(); // Refresh assigned data
    } catch (error) {
       message.error(error.message);
    }
  };

  const handleDispatch = async () => {
    if (selectedVehicles.length === 0) {
      message.warning('Vui lòng chọn ít nhất một xe hoặc đối tác để giao.');
      return;
    }

    const selectedId = selectedVehicles[0];

    if (vehicleType === 'internal') {
      await handleInternalDispatch(selectedId);
    } else if (vehicleType === 'partner') {
      await handlePartnerDispatch(selectedId);
    }
  };

  const handleCreatePartnerSuccess = () => {
    setIsModalVisible(false);
    fetchPartnerVehicles();
  };

  return (
    <Card title="Giao xe" bordered={false} loading={loading}>
      {assignedData && (
        <div style={{ marginBottom: '16px', color: '#1890ff' }}>
          {hasVehicle === 1 ? (
            <p>Xe đã được giao: {assignedData.headPlate} - {assignedData.moocType === 0 ? "20''" : "40''"}</p>
          ) : hasVehicle === 2 ? (
            <p>Đối tác đã được giao: {assignedData.partnerId?.shortName} - {Number(assignedData.partnerFee).toLocaleString()} VND</p>
          ) : null}
        </div>
      )}

      {(hasVehicle !== 1 && hasVehicle !== 2) && (
        <Radio.Group
          onChange={handleVehicleTypeChange}
          value={vehicleType}
          style={{ marginBottom: '16px' }}
        >
          <Radio.Button value="internal">Đội xe nội bộ</Radio.Button>
          <Radio.Button value="partner">Đội xe đối tác</Radio.Button>
        </Radio.Group>
      )}

      {vehicleType === 'internal' && (
        <>
          <p>Danh sách xe nội bộ có thể chạy chuyến này:</p>
          <List
            bordered
            dataSource={vehicles.filter((vehicle) => vehicle.status === 0)}
            renderItem={(vehicle) => (
              <List.Item key={vehicle._id}>
                <Checkbox
                  onChange={() => handleVehicleSelect(vehicle._id)}
                  checked={selectedVehicles.includes(vehicle._id)}
                >
                  {vehicle.headPlate} - {vehicle.moocType === 0 ? "20''" : "40''"}
                </Checkbox>
              </List.Item>
            )}
          />
        </>
      )}

      {vehicleType === 'partner' && (
        <>
          <p>Danh sách đội xe đối tác:</p>
          {partnerVehicles && partnerVehicles.length > 0 ? (
            <List
              bordered
              dataSource={partnerVehicles}
              renderItem={(vehicle) => (
                <List.Item key={vehicle._id}>
                  <Checkbox
                    onChange={() => handleVehicleSelect(vehicle.partner._id)}
                    checked={selectedVehicles.includes(vehicle.partner._id)}
                  >
                    {vehicle.partnerName} - {Number(vehicle.cost).toLocaleString()} VND
                  </Checkbox>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ padding: '16px', color: '#999' }}>
              Không có đối tác vận chuyển nào khả dụng
            </div>
          )}
          <Button
            type="dashed"
            style={{ marginTop: '16px' }}
            onClick={() => setIsModalVisible(true)}
          >
            Thêm đối tác vận chuyển
          </Button>
        </>
      )}
      {(hasVehicle !== 1 && hasVehicle !== 2) && (
      <Row justify="end" style={{ marginTop: '16px' }}>
        <Col>
          <Button
            type="primary"
            onClick={handleDispatch}
            disabled={selectedVehicles.length === 0}
          >
            Giao xe
          </Button>
        </Col>
      </Row>
      )}

      <CreatePartnerTransportCost
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleCreatePartnerSuccess}
        transportTripId={transportTripId}
      />
    </Card>
  );
};

export default DispatchVehicleCard;
