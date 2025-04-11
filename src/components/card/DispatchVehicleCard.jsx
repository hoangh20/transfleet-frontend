import React, { useState, useEffect } from 'react';
import { Card, Radio, Checkbox, Button, message, List, Row, Col } from 'antd';
import { getAllVehicles } from '../../services/VehicleService';
import { connectVehicleToDeliveryOrder, connectVehicleToPackingOrder } from '../../services/OrderService';
import { getPartnerTransportCostsByTransportTrip } from '../../services/ExternalFleetCostService';

const DispatchVehicleCard = ({ orderId, delivery, contType, transportTripId }) => {
  const [vehicleType, setVehicleType] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [partnerVehicles, setPartnerVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleVehicleTypeChange = (e) => {
    setVehicleType(e.target.value);
    setSelectedVehicles([]); 
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
      const fetchPartnerTransport = async () => {
        setLoading(true);
        try {
          const response = await getPartnerTransportCostsByTransportTrip(transportTripId);

          let partnerCosts = [];
          if (response ) {
            partnerCosts = Array.isArray(response)
              ? response
              : [response];
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

          console.log('Mapped Partner Vehicles:', partnerVehiclesWithDetails); // Debug log
          setPartnerVehicles(partnerVehiclesWithDetails);
        } catch (error) {
          console.error('Lỗi khi tải danh sách xe đối tác:', error);
          message.error('Không thể tải danh sách xe đối tác');
        } finally {
          setLoading(false);
        }
      };

      fetchPartnerTransport();
    }
  }, [vehicleType, transportTripId, contType]);

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicles((prevSelected) =>
      prevSelected.includes(vehicleId) ? [] : [vehicleId]
    );
  };

  const handleDispatch = async () => {
    if (selectedVehicles.length === 0) {
      message.warning('Vui lòng chọn ít nhất một xe để giao.');
      return;
    }

    try {
      const vehicleId = selectedVehicles[0]; // Currently supports selecting only one vehicle
      if (delivery) {
        await connectVehicleToDeliveryOrder(orderId, vehicleId);
        message.success('Giao xe cho đơn giao hàng thành công');
      } else {
        await connectVehicleToPackingOrder(orderId, vehicleId);
        message.success('Giao xe cho đơn đóng hàng thành công');
      }
      setSelectedVehicles([]); // Reset selected vehicles after successful dispatch
    } catch (error) {
      console.error('Lỗi khi giao xe:', error);
      message.error('Lỗi khi giao xe');
    }
  };

  return (
    <Card title="Giao xe" bordered={false} loading={loading}>
      <Radio.Group
        onChange={handleVehicleTypeChange}
        value={vehicleType}
        style={{ marginBottom: '16px' }}
      >
        <Radio.Button value="internal">Đội xe nội bộ</Radio.Button>
        <Radio.Button value="partner">Đội xe đối tác</Radio.Button>
      </Radio.Group>

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
                    onChange={() => handleVehicleSelect(vehicle._id)}
                    checked={selectedVehicles.includes(vehicle._id)}
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
        </>
      )}

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
    </Card>
  );
};

export default DispatchVehicleCard;
