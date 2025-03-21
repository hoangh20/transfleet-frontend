import React, { useState, useEffect } from 'react';
import { Row, Col, DatePicker, Button, Modal, Radio, message } from 'antd';
import dayjs from 'dayjs';
import PackingOrderList from '../../components/list/PackingOrderList';
import DeliveryOrderList from '../../components/list/DeliveryOrderList';
import CombinedOrderList from '../../components/list/CombinedOrderList';
import { createOrderConnection, getPackingOrderDetails } from '../../services/OrderService';

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
      if (packingOrderDetails.closeCombination === 0) {
        message.error('Không thể kết hợp đơn đóng gắp vỏ.');
        return;
      }

      setIsModalVisible(true);
    } catch (error) {
      message.error('Lỗi khi kiểm tra chi tiết đơn đóng hàng.');
    }
  };

  const handleCreateOrderConnection = async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await createOrderConnection(
        selectedDeliveryOrders[0],
        selectedPackingOrders[0],
        connectionType
      );
      message.success('Ghép chuyến thành công!');
      setIsModalVisible(false);
      setSelectedPackingOrders([]);
      setSelectedDeliveryOrders([]);
      setConnectionType(null);
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