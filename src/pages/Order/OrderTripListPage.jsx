import React, { useState, useEffect } from 'react';
import { DatePicker, Row, Col, Menu, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import OrderTripCard from '../../components/card/OrderTripCard';
import CombinedOrderCard from '../../components/card/CombinedOrderCard';
import {
  getPackingOrdersByDate,
  getDeliveryOrdersByDate,
  getOrderConnectionsByDeliveryDate,
} from '../../services/OrderService';
import { getCustomerById } from '../../services/CustomerService';

dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

const OrderTripListPage = () => {
  const navigate = useNavigate();
  const [singleTrips, setSingleTrips] = useState([]);
  const [combinedTrips, setCombinedTrips] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    const saved = localStorage.getItem('selectedDateRange');
    if (saved) {
      const arr = JSON.parse(saved);
      return arr.map(d => dayjs(d));
    }
    return [dayjs(), dayjs()];
  });
  const [selectedMenuItem, setSelectedMenuItem] = useState('all');

  useEffect(() => {
    filterTrips();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateRange, selectedMenuItem]);

  useEffect(() => {
    localStorage.setItem(
      'selectedDateRange',
      JSON.stringify(selectedDateRange.map(d => d.toISOString()))
    );
  }, [selectedDateRange]);

  const handleDateChange = dates => {
    setSelectedDateRange(dates);
  };

  const handleMenuClick = e => {
    setSelectedMenuItem(e.key);
  };

  const handleViewDetail = trip => {
    const path = trip.type === 'delivery'
      ? `/order/delivery-orders/${trip._id}`
      : `/order/packing-orders/${trip._id}`;
    navigate(path);
  };

  // Cập nhật trạng thái đơn lẻ
  const handleUpdateStatus = orderId => {
    setSingleTrips(prev =>
      prev.map(t => (t._id === orderId ? { ...t, status: t.status + 1 } : t))
    );
  };

  // Cập nhật trạng thái đơn ghép
  const handleUpdateCombinedStatus = (updatedDelivery, updatedPacking) => {
    setCombinedTrips(prev =>
      prev.map(conn => {
        if (conn.deliveryOrderId._id === updatedDelivery._id) {
          return { ...conn, deliveryOrderId: updatedDelivery };
        }
        if (conn.packingOrderId._id === updatedPacking._id) {
          return { ...conn, packingOrderId: updatedPacking };
        }
        return conn;
      })
    );
  };

  // Lấy dữ liệu và gắn tên khách
  const filterTrips = async () => {
    try {
      const [start, end] = selectedDateRange;
      const from = start.format('YYYY-MM-DD');
      const to = end.format('YYYY-MM-DD');

      // 1) Đơn lẻ
      let singles = [];
      if (['all', 'delivery'].includes(selectedMenuItem)) {
        const deliveries = await getDeliveryOrdersByDate(from, to);
        singles = singles.concat(
          deliveries
            .filter(o => o.isCombinedTrip === 0 && o.hasVehicle !== 0)
            .map(o => ({ ...o, type: 'delivery' }))
        );
      }
      if (['all', 'packing'].includes(selectedMenuItem)) {
        const packings = await getPackingOrdersByDate(from, to);
        singles = singles.concat(
          packings
            .filter(o => o.isCombinedTrip === 0 && o.hasVehicle !== 0)
            .map(o => ({ ...o, type: 'packing' }))
        );
      }

      // 2) Đơn ghép
      let combined = [];
      if (['all', 'combined'].includes(selectedMenuItem)) {
        const connections = await getOrderConnectionsByDeliveryDate(from, to);
        combined = connections.filter(
          c => c.deliveryOrderId.hasVehicle !== 0 || c.packingOrderId.hasVehicle !== 0
        );
      }

      // 3) Gắn tên khách
      const attachName = async order => {
        const cust = await getCustomerById(order.customer);
        return { ...order, customerName: cust.shortName };
      };
      const singlesWithName = await Promise.all(
        singles.map(async o => await attachName(o))
      );
      const combinedWithName = await Promise.all(
        combined.map(async conn => ({
          ...conn,
          deliveryOrderId: await attachName(conn.deliveryOrderId),
          packingOrderId: await attachName(conn.packingOrderId),
        }))
      );

      setSingleTrips(singlesWithName);
      setCombinedTrips(combinedWithName);
    } catch (err) {
      message.error('Lỗi khi tải danh sách đơn hàng');
    }
  };

  // Lọc để render theo tab
  const singleToShow = singleTrips.filter(t => {
    if (selectedMenuItem === 'all') return true;
    return t.type === selectedMenuItem;
  });
  const combinedToShow = ['all', 'combined'].includes(selectedMenuItem)
    ? combinedTrips
    : [];

  return (
    <div style={{ padding: 16, overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <RangePicker
          value={selectedDateRange}
          onChange={handleDateChange}
          style={{ minWidth: 250 }}
        />
        <Menu
          onClick={handleMenuClick}
          selectedKeys={[selectedMenuItem]}
          mode="horizontal"
          style={{ flex: 1, minWidth: 200 }}
        >
          <Menu.Item key="all">Tất cả</Menu.Item>
          <Menu.Item key="delivery">Chuyến giao hàng</Menu.Item>
          <Menu.Item key="packing">Chuyến đóng hàng</Menu.Item>
          <Menu.Item key="combined">Chuyến ghép</Menu.Item>
        </Menu>
      </div>
      <Row gutter={[16, 16]}>
        {/* Đơn lẻ */}
        {singleToShow.map(trip => (
          <Col key={trip._id} xs={24} md={12}>
            <OrderTripCard
              trip={trip}
              customerName={trip.customerName}
              type={trip.type}
              onViewDetail={() => handleViewDetail(trip)}
              onUpdateStatus={handleUpdateStatus}
            />
          </Col>
        ))}

        {/* Đơn ghép */}
        {combinedToShow.map(conn => (
          <Col key={conn._id} xs={24} md={12}>
            <CombinedOrderCard
              combinedOrderId={conn._id}
              deliveryTrip={conn.deliveryOrderId}
              packingTrip={conn.packingOrderId}
              onUpdateCombinedStatus={handleUpdateCombinedStatus}
              onViewDetailDelivery={id =>
                handleViewDetail({ ...conn.deliveryOrderId, _id: id, type: 'delivery' })
              }
              onViewDetailPacking={id =>
                handleViewDetail({ ...conn.packingOrderId, _id: id, type: 'packing' })
              }
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default OrderTripListPage;
