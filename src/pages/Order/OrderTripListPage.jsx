import React, { useState, useEffect } from 'react';
import { DatePicker, Row, Col, Menu, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import OrderTripCard from '../../components/card/OrderTripCard';
import CombinedOrderWrapper from '../../components/card/CombinedOrderWrapper';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { getPackingOrdersByDate, getDeliveryOrdersByDate, getOrderConnectionsByDeliveryDate } from '../../services/OrderService';
import { getCustomerById } from '../../services/CustomerService';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const OrderTripListPage = () => {
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([dayjs(), dayjs()]);
  const [selectedMenuItem, setSelectedMenuItem] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    filterTrips(selectedDateRange, selectedMenuItem);
  }, [selectedDateRange, selectedMenuItem]);

  const handleViewDetail = (trip) => {
    const path = trip.type === 'delivery' ? `/order/delivery-orders/${trip._id}` : `/order/packing-orders/${trip._id}`;
    navigate(path);
  };

  const handleDateChange = (dates) => {
    setSelectedDateRange(dates);
  };

  const handleMenuClick = (e) => {
    setSelectedMenuItem(e.key);
  };

  const filterTrips = async (selectedDateRange, selectedMenuItem) => {
    try {
      const [startDate, endDate] = selectedDateRange;
      let trips = [];

      if (selectedMenuItem === 'all' || selectedMenuItem === 'delivery') {
        const deliveryOrders = await getDeliveryOrdersByDate(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
        trips = trips.concat(deliveryOrders.filter(order => order.isCombinedTrip === 0).map(order => ({ ...order, type: 'delivery' })));
      }

      if (selectedMenuItem === 'all' || selectedMenuItem === 'packing') {
        const packingOrders = await getPackingOrdersByDate(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
        trips = trips.concat(packingOrders.filter(order => order.isCombinedTrip === 0).map(order => ({ ...order, type: 'packing' })));
      }

      if (selectedMenuItem === 'all' || selectedMenuItem === 'combined') {
        const combinedOrders = await getOrderConnectionsByDeliveryDate(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
        combinedOrders.forEach(order => {
          trips.push({ ...order.deliveryOrderId, type: 'delivery', combined: true });
          trips.push({ ...order.packingOrderId, type: 'packing', combined: true });
        });
      }

      // Fetch customer names
      const tripsWithCustomerNames = await Promise.all(trips.map(async (trip) => {
        const customer = await getCustomerById(trip.customer);
        return { ...trip, customerName: customer.shortName };
      }));

      setFilteredTrips(tripsWithCustomerNames);
    } catch (error) {
      message.error('Lỗi khi tải danh sách đơn hàng');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <RangePicker
        value={selectedDateRange}
        onChange={handleDateChange}
        style={{ marginBottom: 16 }}
      />
      <Row gutter={[16, 16]} style={{ marginBottom: '16px', marginTop: '16px' }}>
        <Col span={24}>
          <Menu onClick={handleMenuClick} selectedKeys={[selectedMenuItem]} mode="horizontal">
            <Menu.Item key="all">Tất cả</Menu.Item>
            <Menu.Item key="delivery">Chuyến giao hàng</Menu.Item>
            <Menu.Item key="packing">Chuyến đóng hàng</Menu.Item>
            <Menu.Item key="combined">Chuyến ghép</Menu.Item>
          </Menu>
        </Col>
      </Row>
      {filteredTrips.map((trip, index, trips) => {
        if (trip.combined) {
          if (index % 2 === 0) {
            return (
              <CombinedOrderWrapper key={trip._id}>
                <OrderTripCard
                  trip={trip}
                  customerName={trip.customerName}
                  type={trip.type}
                  onViewDetail={() => handleViewDetail(trip)}
                />
                {index + 1 < trips.length && trips[index + 1].combined && (
                  <OrderTripCard
                    trip={trips[index + 1]}
                    customerName={trips[index + 1].customerName}
                    type={trips[index + 1].type}
                    onViewDetail={() => handleViewDetail(trips[index + 1])}
                  />
                )}
              </CombinedOrderWrapper>
            );
          }
        } else if (!trip.combined && (index === 0 || !trips[index - 1].combined)) {
          return (
            <OrderTripCard
              key={trip._id}
              trip={trip}
              customerName={trip.customerName}
              type={trip.type}
              onViewDetail={() => handleViewDetail(trip)}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export default OrderTripListPage;