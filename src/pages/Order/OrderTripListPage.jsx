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
  getActiveOrders,
} from '../../services/OrderService';

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
      return arr.map((d) => dayjs(d));
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
      JSON.stringify(selectedDateRange.map((d) => d.toISOString()))
    );
  }, [selectedDateRange]);

  const handleDateChange = (dates) => {
    if (!dates) {
      setSelectedDateRange([dayjs(), dayjs()]); 
    } else {
      setSelectedDateRange(dates);
    }
  };

  const handleMenuClick = async (e) => {
    setSelectedMenuItem(e.key);

    if (e.key === 'active') {
      try {
        const response = await getActiveOrders();
        const { deliveryOrders, packingOrders, combinedOrders } = response.data;
        const deliveryWithName = deliveryOrders.map((order) => ({
          ...order,
          customerName: order.customer?.shortName || '',
        }));
        const packingWithName = packingOrders.map((order) => ({
          ...order,
          customerName: order.customer?.shortName || '',
        }));
        const combinedWithName = combinedOrders.map((conn) => ({
          ...conn,
          deliveryOrderId: {
            ...conn.deliveryOrderId,
            customerName: conn.deliveryOrderId?.customer?.shortName || '',
          },
          packingOrderId: {
            ...conn.packingOrderId,
            customerName: conn.packingOrderId?.customer?.shortName || '',
          },
        }));

        setSingleTrips([...deliveryWithName, ...packingWithName]);
        setCombinedTrips(combinedWithName);
      } catch (error) {
        message.error('Lỗi khi tải danh sách chuyến đang vận chuyển.');
      }
    }
  };

  const handleViewDetail = (trip) => {
    const path =
      trip.type === 'delivery'
        ? `/order/delivery-orders/${trip._id}`
        : `/order/packing-orders/${trip._id}`;
    navigate(path);
  };

  const handleUpdateStatus = (orderId) => {
    setSingleTrips((prev) =>
      prev.map((t) => (t._id === orderId ? { ...t, status: t.status + 1 } : t))
    );
  };

  const handleUpdateCombinedStatus = (combinedOrderId, updatedStatus) => {
    setCombinedTrips((prev) =>
      prev.map((conn) =>
        conn._id === combinedOrderId ? { ...conn, status: updatedStatus } : conn
      )
    );
  };

  const filterTrips = async () => {
    try {
      const [start, end] = selectedDateRange;
      const from = start.format('YYYY-MM-DD');
      const to = end.format('YYYY-MM-DD');

      let singles = [];
      if (['all', 'delivery'].includes(selectedMenuItem)) {
        const deliveries = (await getDeliveryOrdersByDate(from, to)) || [];
        singles = singles.concat(
          deliveries
            .filter((o) => o.isCombinedTrip === 0 && o.hasVehicle !== 0)
            .map((o) => ({ ...o, type: 'delivery' }))
        );
      }
      if (['all', 'packing'].includes(selectedMenuItem)) {
        const packings = (await getPackingOrdersByDate(from, to)) || [];
        singles = singles.concat(
          packings
            .filter((o) => o.isCombinedTrip === 0 && o.hasVehicle !== 0)
            .map((o) => ({ ...o, type: 'packing' }))
        );
      }

      let combined = [];
      if (['all', 'combined'].includes(selectedMenuItem)) {
        const connections = (await getOrderConnectionsByDeliveryDate(from, to)) || [];
        combined = connections.filter(
          (c) => c.deliveryOrderId.hasVehicle !== 0 || c.packingOrderId.hasVehicle !== 0
        );
      }
      const singlesWithName = (singles || []).map((o) => ({
        ...o,
        customerName: o.customer?.shortName || '',
      }));
      const combinedWithName = (combined || []).map((conn) => ({
        ...conn,
        deliveryOrderId: {
          ...conn.deliveryOrderId,
          customerName: conn.deliveryOrderId?.customer?.shortName || '',
        },
        packingOrderId: {
          ...conn.packingOrderId,
          customerName: conn.packingOrderId?.customer?.shortName || '',
        },
      }));

      setSingleTrips(singlesWithName);
      setCombinedTrips(combinedWithName);
    } catch (err) {
      message.error('Lỗi khi tải danh sách đơn hàng');
    }
  };

  const totalDelivery = singleTrips.filter(t => t.type === 'delivery').length;
  const totalPacking = singleTrips.filter(t => t.type === 'packing').length;
  const totalCombined = combinedTrips.length;
  const totalAll = singleTrips.length + combinedTrips.length;
  const totalActive = selectedMenuItem === 'active'
    ? singleTrips.length + combinedTrips.length
    : 0;

  const singleToShow = singleTrips.filter((t) => {
    if (selectedMenuItem === 'all') return true;
    if (selectedMenuItem === 'active') return true; 
    return t.type === selectedMenuItem;
  });
  const combinedToShow =
    ['all', 'combined', 'active'].includes(selectedMenuItem) 
      ? combinedTrips
      : [];

  // Hàm so sánh owner (Line)
  const compareOwner = (a, b) => {
    const ownerA = (a.owner || '').toLowerCase();
    const ownerB = (b.owner || '').toLowerCase();
    if (ownerA < ownerB) return -1;
    if (ownerA > ownerB) return 1;
    return 0;
  };

  // Đơn lẻ: sort theo owner
  const sortedSingleToShow = [...singleToShow].sort(compareOwner);

  // Đơn ghép: sort theo owner của deliveryOrderId (ưu tiên), nếu không có thì lấy packingOrderId
  const compareCombinedOwner = (a, b) => {
    const ownerA = (a.deliveryOrderId?.owner || a.packingOrderId?.owner || '').toLowerCase();
    const ownerB = (b.deliveryOrderId?.owner || b.packingOrderId?.owner || '').toLowerCase();
    if (ownerA < ownerB) return -1;
    if (ownerA > ownerB) return 1;
    return 0;
  };
  const sortedCombinedToShow = [...combinedToShow].sort(compareCombinedOwner);

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
          <Menu.Item key="all">
            Tất cả <span style={{ color: '#1890ff' }}>({totalAll})</span>
          </Menu.Item>
          <Menu.Item key="delivery">
            Chuyến giao hàng <span style={{ color: '#1890ff' }}>({totalDelivery})</span>
          </Menu.Item>
          <Menu.Item key="packing">
            Chuyến đóng hàng <span style={{ color: '#1890ff' }}>({totalPacking})</span>
          </Menu.Item>
          <Menu.Item key="combined">
            Chuyến ghép <span style={{ color: '#1890ff' }}>({totalCombined})</span>
          </Menu.Item>
          <Menu.Item key="active">
            Chuyến đang vận chuyển <span style={{ color: '#1890ff' }}>({totalActive})</span>
          </Menu.Item>
        </Menu>
      </div>
      <Row gutter={[16, 16]}>
        {/* Đơn lẻ */}
        {sortedSingleToShow.map((trip) => (
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
        {sortedCombinedToShow.map((conn) => (
          <Col key={conn._id} xs={24} md={12}>
            <CombinedOrderCard
              combinedStatus={conn.status}
              combinedOrderId={conn._id}
              deliveryTrip={conn.deliveryOrderId}
              packingTrip={conn.packingOrderId}
              onUpdateCombinedStatus={handleUpdateCombinedStatus}
              onViewDetailDelivery={(id) =>
                handleViewDetail({ ...conn.deliveryOrderId, _id: id, type: 'delivery' })
              }
              onViewDetailPacking={(id) =>
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
