import React, { useState } from 'react';
import { Row, Col, DatePicker, Button, Modal, Radio, message } from 'antd';
import dayjs from 'dayjs';
import PackingOrderList from '../../components/list/PackingOrderList';
import DeliveryOrderList from '../../components/list/DeliveryOrderList';
import CombinedOrderList from '../../components/list/CombinedOrderList';
import { createOrderConnection } from '../../services/OrderService';

const { RangePicker } = DatePicker;

const OrderPage = () => {
  const [selectedDates, setSelectedDates] = useState([dayjs(), dayjs()]);
  const [selectedPackingOrders, setSelectedPackingOrders] = useState([]);
  const [selectedDeliveryOrders, setSelectedDeliveryOrders] = useState([]);
  const [connectionType, setConnectionType] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const handleGetSelectedOrders = () => {
    if (selectedPackingOrders.length === 0 || selectedDeliveryOrders.length === 0) {
      message.error('Vui lòng chọn cả đơn đóng hàng và đơn giao hàng.');
      return;
    }
    setIsModalVisible(true);
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
    } catch (error) {
      message.error('Lỗi khi ghép chuyến.');
    }
  };

  return (
    <div>
      <h1>Danh Sách Đơn Hàng</h1>
      <RangePicker
        value={selectedDates}
        onChange={handleDateChange}
        style={{ marginBottom: 16 }}
      />
      <Button
        type="primary"
        onClick={handleGetSelectedOrders}
        style={{ marginTop: 16, marginBottom: 16, marginLeft: 16 }}
      >
        Ghép Đơn Hàng Đã Chọn
      </Button>
      <Row gutter={16}>
        <Col span={11}>
          <DeliveryOrderList
            startDate={selectedDates[0].format('YYYY-MM-DD')}
            endDate={selectedDates[1].format('YYYY-MM-DD')}
            onSelectChange={handleDeliveryOrderSelectChange}
          />
        </Col>

        <Col
          span={1}
          style={{
            borderRight: '1px solid #e8e8e8',
            marginTop: 16,
          }}
        />

        <Col span={11}>
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