import React, { useState, useEffect } from 'react';
import { Card, Radio, Checkbox, Button, message, List, Row, Col } from 'antd';
import { getAllVehicles } from '../../services/VehicleService';
import { connectVehicleToDeliveryOrder, connectVehicleToPackingOrder } from '../../services/OrderService';
import { getPartnerTransportCostsByTransportTrip } from '../../services/ExternalFleetCostService';
import { getPartnerById } from '../../services/PartnerService';

const DispatchVehicleCard = ({ orderId, delivery, transportTripId }) => {
  const [vehicleType, setVehicleType] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [partnerVehicles, setPartnerVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleVehicleTypeChange = (e) => {
    setVehicleType(e.target.value);
    setSelectedVehicles([]); // Reset selected vehicles khi thay đổi loại xe
  };

  useEffect(() => {
    if (vehicleType === 'internal') {
      const fetchVehicles = async () => {
        setLoading(true);
        try {
          const response = await getAllVehicles();
          setVehicles(response.data);
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
          const partnerCosts = response?.data || [];
      
          if (partnerCosts.length === 0) {
            message.info('Không có đối tác vận chuyển nào khả dụng cho chuyến này');
            setPartnerVehicles([]);
            return;
          }
      
          const partnerVehiclesWithNames = await Promise.all(
            partnerCosts.map(async (partnerCosts) => {
              if (!partnerCosts.partner) return null;
      
              try {
                const partnerResponse = await getPartnerById(partnerCosts.partner);
                return {
                  ...partnerCosts,
                  partnerName: partnerResponse?.data?.name || 'Không xác định',
                };
              } catch (err) {
                console.error(`Lỗi khi tải đối tác ${partnerCosts.partner}:`, err);
                return { ...partnerCosts, partnerName: 'Lỗi tải đối tác' };
              }
            })
          );
      
          setPartnerVehicles(partnerVehiclesWithNames);
        } catch (error) {
          console.error('Lỗi khi tải danh sách xe đối tác:', error);
          message.error('Không thể tải danh sách xe đối tác');
        } finally {
          setLoading(false);
        }
      };

      fetchPartnerTransport();
    }
  }, [vehicleType, transportTripId]);

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicles((prevSelected) =>
      prevSelected.includes(vehicleId)
        ? prevSelected.filter((id) => id !== vehicleId)
        : [...prevSelected, vehicleId]
    );
  };

  const handleDispatch = async () => {
    if (selectedVehicles.length === 0) {
      message.warning('Vui lòng chọn ít nhất một xe để giao.');
      return;
    }

    try {
      const vehicleId = selectedVehicles[0]; // Hiện tại chỉ hỗ trợ chọn 1 xe
      if (delivery) {
        await connectVehicleToDeliveryOrder(orderId, vehicleId);
        message.success('Giao xe cho đơn giao hàng thành công');
      } else {
        await connectVehicleToPackingOrder(orderId, vehicleId);
        message.success('Giao xe cho đơn đóng hàng thành công');
      }
      setSelectedVehicles([]); // Reset selected vehicles sau khi giao thành công
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
          {partnerVehicles.length === 0 ? (
            <div style={{ padding: '16px', color: '#999' }}>
              Không có đối tác vận chuyển nào khả dụng
            </div>
          ) : (
            <List
              bordered
              dataSource={partnerVehicles}
              renderItem={(vehicle) => (
                <List.Item key={vehicle._id}>
                  <Checkbox
                    onChange={() => handleVehicleSelect(vehicle._id)}
                    checked={selectedVehicles.includes(vehicle._id)}
                  >
                    {vehicle.partnerName} - {vehicle.cost.toLocaleString()} VND
                  </Checkbox>
                </List.Item>
              )}
            />
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