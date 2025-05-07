import React, { useState, useEffect } from 'react';
import { Row, Col, DatePicker, Button, Modal, Radio, message, Input } from 'antd';
import dayjs from 'dayjs';
import PackingOrderList from '../../components/list/PackingOrderList';
import DeliveryOrderList from '../../components/list/DeliveryOrderList';
import CombinedOrderList from '../../components/list/CombinedOrderList';
import SuggestionModal from '../../components/popup/SuggestionModal';
import {
  createOrderConnection,
  getPackingOrderDetails,
  getDeliveryOrderDetails,
  suggestCombinations,
  suggestCombinationsForDelivery,
} from '../../services/OrderService';
import { getEmptyDistance, createEmptyDistance } from '../../services/ExternalFleetCostService';

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
  const [singleTicketInput, setSingleTicketInput] = useState('');
  const [singleTicket40Input, setSingleTicket40Input] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [notFoundAddresses, setNotFoundAddresses] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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


  const fetchSuggestionsForDelivery = async () => {
    if (selectedDeliveryOrders.length === 0) {
      try {
        setLoadingSuggestions(true);
        const startDay = selectedDates[0].format('YYYY-MM-DD');
        const endDay = selectedDates[1].format('YYYY-MM-DD');
        const response = await suggestCombinations(startDay, endDay);
        setSuggestions(response.suggestions || []);
        setNotFoundAddresses(response.notFoundAddresses || []);
        message.success('Gợi ý kết nối đã được tải thành công.');
      } catch (error) {
        message.error('Lỗi khi tải gợi ý kết nối.');
      } finally {
        setLoadingSuggestions(false);
      }
    } else {
      const deliveryOrderId = selectedDeliveryOrders[0];
      const startDay = selectedDates[0].format('YYYY-MM-DD');
      const endDay = selectedDates[1].format('YYYY-MM-DD');

      try {
        setLoadingSuggestions(true);
        const response = await suggestCombinationsForDelivery(deliveryOrderId, startDay, endDay);
        setSuggestions(response.suggestions || []);
        setNotFoundAddresses(response.notFoundAddresses || []);
        message.success('Gợi ý ghép đơn cho đơn giao hàng đã được tải thành công.');
      } catch (error) {
        message.error('Lỗi khi tải gợi ý ghép đơn cho đơn giao hàng.');
      } finally {
        setLoadingSuggestions(false);
      }
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSelectedDeliveryOrders([suggestion.deliveryOrder._id]);
    setSelectedPackingOrders([suggestion.packingOrder._id]);
    handleDeliveryOrderSelectChange([suggestion.deliveryOrder._id]);
    handlePackingOrderSelectChange([suggestion.packingOrder._id]);
    setSuggestions([]);
    message.success('Đã chọn đơn hàng từ gợi ý.');
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
        setSingleTicketInput(response.data.singleTicket);
        setSingleTicket40Input(response.data.singleTicket40);
      }

      setIsModalVisible(true);
    } catch (error) {
      message.error('Lỗi khi kiểm tra chi tiết đơn đóng hàng.');
    }
  };

  const handleCreateOrderConnection = async () => {
    if (
      emptyDistance === null &&
      (!emptyDistanceInput || !singleTicketInput || !singleTicket40Input)
    ) {
      message.error('Vui lòng nhập đầy đủ thông tin trước khi ghép chuyến.');
      return;
    }

    try {
      if (emptyDistance === null && emptyDistanceInput) {
        const packingOrderId = selectedPackingOrders[0];
        const packingOrderDetails = await getPackingOrderDetails(packingOrderId);
        const deliveryOrderId = selectedDeliveryOrders[0];
        const deliveryOrderDetails = await getDeliveryOrderDetails(deliveryOrderId);
        const newEmptyDistance = parseFloat(emptyDistanceInput);
        const newSingleTicket = parseFloat(singleTicketInput);
        const newSingleTicket40 = parseFloat(singleTicket40Input);

        await createEmptyDistance({
          deliveryRouteId: deliveryOrderDetails.externalFleetCostId,
          packingRouteId: packingOrderDetails.externalFleetCostId,
          emptyDistance: newEmptyDistance,
          singleTicket: newSingleTicket,
          singleTicket40: newSingleTicket40,
        });
        message.success('Khoảng cách rỗng mới đã được tạo thành công.');
      }

      const distanceToSend = emptyDistanceInput
        ? parseFloat(emptyDistanceInput)
        : emptyDistance;

      await createOrderConnection(
        selectedDeliveryOrders[0],
        selectedPackingOrders[0],
        connectionType,
        distanceToSend,
        parseFloat(singleTicketInput),
        parseFloat(singleTicket40Input)
      );

      message.success('Ghép chuyến thành công!');
      setIsModalVisible(false);
      setSelectedPackingOrders([]);
      setSelectedDeliveryOrders([]);
      setConnectionType(null);
      setEmptyDistance(null);
      setEmptyDistanceInput('');
      setSingleTicketInput('');
      setSingleTicket40Input('');
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
        <Button type="primary" onClick={handleGetSelectedOrders} style={{ marginBottom: 16 }}>
          Ghép Đơn Hàng Đã Chọn
        </Button>
        <Button type="default" onClick={fetchSuggestionsForDelivery} style={{ marginBottom: 16 }}>
          Gợi Ý Kết Nối
        </Button>
      </div>

      <Row gutter={16}>
        <Col xs={24} md={11}>
          <DeliveryOrderList
            startDate={selectedDates[0].format('YYYY-MM-DD')}
            endDate={selectedDates[1].format('YYYY-MM-DD')}
            selectedRowKeys={selectedDeliveryOrders}
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
            alignItems: 'center',
          }}
        />

        <Col xs={24} md={11}>
          <PackingOrderList
            startDate={selectedDates[0].format('YYYY-MM-DD')}
            endDate={selectedDates[1].format('YYYY-MM-DD')}
            selectedRowKeys={selectedPackingOrders}
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

        <div style={{ marginTop: 16 }}></div>

        <div style={{ marginTop: 16 }}>
          {emptyDistance === null ? (
            <>
              <p style={{ color: 'red' }}>
                Chưa có thông tin về khoảng cách rỗng giữa 2 tuyến, vui lòng nhập mới:
              </p>
              <label>Khoảng cách rỗng (km):</label>
              <Input
                type="number"
                placeholder="Nhập khoảng cách rỗng (km)"
                value={emptyDistanceInput}
                onChange={(e) => setEmptyDistanceInput(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <label>Vé kết hợp mooc 20'':</label>
              <Input
                type="number"
                placeholder="Nhập vé kết hợp mooc 20''"
                value={singleTicketInput}
                onChange={(e) => setSingleTicketInput(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <label>Vé kết hợp mooc 40'':</label>
              <Input
                type="number"
                placeholder="Nhập vé kết hợp mooc 40''"
                value={singleTicket40Input}
                onChange={(e) => setSingleTicket40Input(e.target.value)}
              />
            </>
          ) : (
            <>
              <p>Khoảng cách rỗng giữa 2 tuyến:</p>
              <label>Khoảng cách rỗng (km):</label>
              <Input
                type="number"
                placeholder="Chỉnh sửa khoảng cách rỗng (km) nếu cần"
                value={emptyDistanceInput || emptyDistance}
                onChange={(e) => setEmptyDistanceInput(e.target.value)}
                style={{ marginBottom: 8 }}
                readOnly 
              />
              <label>Vé kết hợp mooc 20'':</label>
              <Input
                type="number"
                placeholder="Nhập vé kết hợp mooc 20''"
                value={singleTicketInput}
                onChange={(e) => setSingleTicketInput(e.target.value)}
                style={{ marginBottom: 8 }}
                readOnly 
              />
              <label>Vé kết hợp mooc 40'':</label>
              <Input
                type="number"
                placeholder="Nhập vé kết hợp mooc 40''"
                value={singleTicket40Input}
                onChange={(e) => setSingleTicket40Input(e.target.value)}
                readOnly
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
      <SuggestionModal
        visible={suggestions.length > 0 || loadingSuggestions}
        loading={loadingSuggestions}
        suggestions={suggestions}
        notFoundAddresses={notFoundAddresses}
        onCancel={() => setSuggestions([])}
        onSelectSuggestion={handleSelectSuggestion}
      />
    </div>
  );
};

export default OrderPage;