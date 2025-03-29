import React, { useState, useEffect } from 'react';
import { Row, Col, DatePicker, Button, Modal, Radio, message, Input } from 'antd';
import dayjs from 'dayjs';
import PackingOrderList from '../../components/list/PackingOrderList';
import DeliveryOrderList from '../../components/list/DeliveryOrderList';
import CombinedOrderList from '../../components/list/CombinedOrderList';
import { createOrderConnection, getPackingOrderDetails, getDeliveryOrderDetails,} from '../../services/OrderService';
import { getEmptyDistance,createEmptyDistance } from '../../services/ExternalFleetCostService'; // Import the API

const { RangePicker } = DatePicker;

const OrderPage = () => {
  const [selectedDates, setSelectedDates] = useState(() => {
    const savedDates = localStorage.getItem('selectedDates');
    return savedDates ? JSON.parse(savedDates).map(date => dayjs(date)) : [dayjs(), dayjs()];
  });
  const [selectedPackingOrders, setSelectedPackingOrders] = useState([]);
  const [selectedDeliveryOrders, setSelectedDeliveryOrders] = useState([]);
  const [connectionType, setConnectionType] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [emptyDistance, setEmptyDistance] = useState(null); 
  const [emptyDistanceInput, setEmptyDistanceInput] = useState(''); 

  useEffect(() => {
    localStorage.setItem('selectedDates', JSON.stringify(selectedDates));
  }, [selectedDates]);

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setSelectedDates(dates);
    } else {
      setSelectedDates([dayjs(), dayjs()]);
    }
  };

  const handlePackingOrderSelectChange = (selectedRowKeys) => {
    setSelectedPackingOrders(selectedRowKeys);
  };

  const handleDeliveryOrderSelectChange = (selectedRowKeys) => {
    setSelectedDeliveryOrders(selectedRowKeys);
  };

  const handleGetSelectedOrders = async () => {
    if (selectedPackingOrders.length === 0 || selectedDeliveryOrders.length === 0) {
      message.error('Vui lòng chọn cả đơn đóng hàng và đơn giao hàng.');
      return;
    }

    try {
      const packingOrderId = selectedPackingOrders[0];
      const packingOrderDetails = await getPackingOrderDetails(packingOrderId);
      const deliveryOrderId = selectedDeliveryOrders[0];
      const deliveryOrderDetails = await getDeliveryOrderDetails(deliveryOrderId);
      if (packingOrderDetails.closeCombination === 0) {
        message.error('Không thể kết hợp đơn đóng gắp vỏ.');
        return;
      }

      const deliveryRouteId = deliveryOrderDetails.externalFleetCostId;
      const packingRouteId = packingOrderDetails.externalFleetCostId;

    if (!deliveryRouteId || !packingRouteId) {
      message.error('Không thể lấy thông tin tuyến vận tải. Vui lòng kiểm tra lại.');
      return;
    }
      const response = await getEmptyDistance({ deliveryRouteId, packingRouteId });

      if (!response || response.data === null) {
        setEmptyDistance(null);
      } else {
        setEmptyDistance(response.data.emptyDistance);
        console.log('Khoảng cách rỗng:', response.data.emptyDistance);
      }

      setIsModalVisible(true);
    } catch (error) {
      message.error('Lỗi khi kiểm tra chi tiết đơn đóng hàng.');
    }
  };

  const handleCreateOrderConnection = async () => {
    if (emptyDistance === null && !emptyDistanceInput) {
      message.error('Vui lòng nhập khoảng cách rỗng trước khi ghép chuyến.');
      return;
    }

    try {
      if (emptyDistance === null && emptyDistanceInput) {
        const packingOrderId = selectedPackingOrders[0];
        const packingOrderDetails = await getPackingOrderDetails(packingOrderId);
        const deliveryOrderId = selectedDeliveryOrders[0];
        const deliveryOrderDetails = await getDeliveryOrderDetails(deliveryOrderId);
        const newEmptyDistance = parseFloat(emptyDistanceInput);
        await createEmptyDistance({
          deliveryRouteId: deliveryOrderDetails.externalFleetCostId,
          packingRouteId: packingOrderDetails.externalFleetCostId,
          emptyDistance: newEmptyDistance,
        });
        message.success('Khoảng cách rỗng mới đã được tạo thành công.');
      }
      const distanceToSend = emptyDistanceInput
      ? parseFloat(emptyDistanceInput) // Use user input if provided
      : emptyDistance;
      // eslint-disable-next-line no-unused-vars
      const response = await createOrderConnection(
        selectedDeliveryOrders[0], // deliveryOrderId
        selectedPackingOrders[0],  // packingOrderId
        connectionType,            // type
        distanceToSend             // emptyDistance
      );
      message.success('Ghép chuyến thành công!');
      setIsModalVisible(false);
      setSelectedPackingOrders([]);
      setSelectedDeliveryOrders([]);
      setConnectionType(null);
      setEmptyDistance(null);
      setEmptyDistanceInput('');
      window.location.reload();
    } catch (error) {
      message.error('Lỗi khi ghép chuyến.');
    }
  };

  return (
    <div style={{ padding: '16px', maxWidth: '100%', overflowX: 'auto' }}>
      <h1>Danh Sách Đơn Hàng</h1>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <RangePicker
          value={selectedDates}
          onChange={handleDateChange}
          style={{ marginBottom: 16 }}
        />
        <Button
          type="primary"
          onClick={handleGetSelectedOrders}
          style={{ marginBottom: 16 }}
        >
          Ghép Đơn Hàng Đã Chọn
        </Button>
      </div>
      <Row gutter={16}>
        <Col xs={24} md={11}>
          <DeliveryOrderList
            startDate={selectedDates[0].format('YYYY-MM-DD')}
            endDate={selectedDates[1].format('YYYY-MM-DD')}
            onSelectChange={handleDeliveryOrderSelectChange}
          />
        </Col>

        <Col
          xs={24}
          md={1}
          style={{
            borderRight: '1px solid #e8e8e8',
            marginTop: 16,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        />

        <Col xs={24} md={11}>
          <PackingOrderList
            startDate={selectedDates[0].format('YYYY-MM-DD')}
            endDate={selectedDates[1].format('YYYY-MM-DD')}
            onSelectChange={handlePackingOrderSelectChange}
          />
        </Col>
      </Row>

      <Modal
        title="Xác Nhận Ghép Chuyến"
        visible={isModalVisible}
        onOk={handleCreateOrderConnection}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>Chọn loại ghép chuyến:</p>
        <Radio.Group
          onChange={(e) => setConnectionType(e.target.value)}
          value={connectionType}
        >
          <Radio value={0}>Cùng ngày cùng điểm</Radio>
          <Radio value={1}>Cùng ngày khác điểm</Radio>
          <Radio value={2}>Khác ngày</Radio>
        </Radio.Group>

        <div style={{ marginTop: 16 }}>
          {emptyDistance === null ? (
            <>
              <p style={{ color: 'red' }}>
                Chưa có thông tin về khoảng cách rỗng giữa 2 tuyến, vui lòng nhập mới:
              </p>
              <Input
                type="number"
                placeholder="Nhập khoảng cách rỗng (km)"
                value={emptyDistanceInput}
                onChange={(e) => setEmptyDistanceInput(e.target.value)}
              />
            </>
          ) : (
            <>
              <p>Khoảng cách rỗng giữa 2 tuyến:</p>
              <Input
                type="number"
                placeholder="Chỉnh sửa khoảng cách rỗng (km) nếu cần"
                value={emptyDistanceInput || emptyDistance}
                onChange={(e) => setEmptyDistanceInput(e.target.value)}
              />
            </>
          )}
        </div>
      </Modal>

      <CombinedOrderList
        startDate={selectedDates[0].format('YYYY-MM-DD')}
        endDate={selectedDates[1].format('YYYY-MM-DD')}
        onSelectChange={handleDeliveryOrderSelectChange}
      />
    </div>
  );
};

export default OrderPage;