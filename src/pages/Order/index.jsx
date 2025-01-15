import React, { useState } from 'react';
import { Row, Col, DatePicker, Button } from 'antd';
import moment from 'moment';
import PackingOrderList from '../../components/list/PackingOrderList';
import DeliveryOrderList from '../../components/list/DeliveryOrderList';

const OrderPage = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedPackingOrders, setSelectedPackingOrders] = useState([]);
  const [selectedDeliveryOrders, setSelectedDeliveryOrders] = useState([]);

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
    } else {
      setSelectedDate(moment());
    }
  };

  const handlePackingOrderSelectChange = (selectedRowKeys) => {
    setSelectedPackingOrders(selectedRowKeys);
  };

  const handleDeliveryOrderSelectChange = (selectedRowKeys) => {
    setSelectedDeliveryOrders(selectedRowKeys);
  };

  const handleGetSelectedOrders = () => {
    console.log('Selected Packing Orders:', selectedPackingOrders);
    console.log('Selected Delivery Orders:', selectedDeliveryOrders);
  };

  return (
    <div>
      <h1>Danh Sách Đơn Hàng</h1>
      <DatePicker
        value={selectedDate}
        onChange={handleDateChange}
        style={{ marginBottom: 16 }}
      />
      <Button type="primary" onClick={handleGetSelectedOrders} style={{ marginTop: 16, marginBottom: 16, marginLeft : 16 }}>
        Ghép Đơn Hàng Đã Chọn
      </Button>
      <Row gutter={16}>
  <Col span={11}>
    <DeliveryOrderList
      startDate={selectedDate.format('YYYY-MM-DD')} 
      onSelectChange={handleDeliveryOrderSelectChange}
    />
  </Col>
  
  <Col span={1} style={{ 
    borderRight: '1px solid #e8e8e8',
    marginTop: 16,
  }} />

  <Col span={11}>
    <PackingOrderList
      startDate={selectedDate.format('YYYY-MM-DD')}
      onSelectChange={handlePackingOrderSelectChange} 
    />
  </Col>
</Row>
    </div>
  );
};

export default OrderPage;