import React, { useEffect, useState } from 'react';
import {
  List,
  Card,
  DatePicker,
  Spin,
  message,
  Typography,
  Pagination,
  Row,
  Col,
  Divider,
} from 'antd';
import dayjs from 'dayjs';
import { getOrdersByVehicleId } from '../../services/OrderService';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const PAGE_SIZE = 3;

const VehicleOrderList = ({ vehicleId, dateRange, onDateRangeChange, onSelectOrder }) => {
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [packingOrders, setPackingOrders] = useState([]);
  const [combinedOrders, setCombinedOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [totalAll, setTotalAll] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderType, setSelectedOrderType] = useState(null);

  useEffect(() => {
    setSelectedOrderId(null);
    setSelectedOrderType(null);
  }, [vehicleId, dateRange, page]);

  useEffect(() => {
    if (!vehicleId || !dateRange[0] || !dateRange[1]) return;

    setLoading(true);
    getOrdersByVehicleId(
      vehicleId,
      page,
      PAGE_SIZE,
      dateRange[0].format('YYYY-MM-DD'),
      dateRange[1].format('YYYY-MM-DD')
    )
      .then((res) => {
        setDeliveryOrders(res.data.deliveryOrders || []);
        setPackingOrders(res.data.packingOrders || []);
        setCombinedOrders(res.data.combinedOrders || []);
        const pag = res.data.pagination || {};
        const tDelivery = pag.totalDelivery || 0;
        const tPacking = pag.totalPacking || 0;
        const tCombined = pag.totalCombined || 0;
        setTotalAll(tDelivery + tPacking + tCombined);
      })
      .catch(() => {
        message.error('Không thể lấy danh sách đơn hàng');
        setDeliveryOrders([]);
        setPackingOrders([]);
        setCombinedOrders([]);
        setTotalAll(0);
      })
      .finally(() => setLoading(false));
  }, [vehicleId, dateRange, page]);

  const handleDateRangeChange = (dates) => {
    setPage(1);
    onDateRangeChange(dates);
  };

  const handleSelectOrder = (item, type) => {
    setSelectedOrderId(item._id);
    setSelectedOrderType(type);
    onSelectOrder({ ...item, __orderType: type });
  };

  const renderOrderItem = (item, type) => {
    let containerNumber = '';
    let customerName = '';
    let dateLabel = '';
    let rawDateValue = null;

    if (type === 'delivery') {
      containerNumber = item.containerNumber;
      customerName = item.customer?.shortName || item.customer?.name;
      rawDateValue = item.deliveryDate;
    } else if (type === 'packing') {
      containerNumber = item.containerNumber;
      customerName = item.customer?.shortName || item.customer?.name;
      rawDateValue = item.packingDate;
    } else if (type === 'combined') {
      containerNumber =
        item.deliveryOrderId?.containerNumber;
      customerName =
        item.deliveryOrderId?.customer?.shortName ||
        item.deliveryOrderId?.customer?.name ||
        item.packingOrderId?.customer?.shortName ||
        item.packingOrderId?.customer?.name;
      rawDateValue = item.deliveryOrderId?.deliveryDate;
    }
    const isSelected = selectedOrderId === item._id && selectedOrderType === type;

    return (
      <List.Item
        key={item._id}
        style={{
          cursor: 'pointer',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0',
          background: isSelected ? '#e6f7ff' : undefined,
          borderLeft: isSelected ? '4px solid #1890ff' : '4px solid transparent',
          transition: 'background 0.2s, border-left 0.2s',
        }}
        onClick={() => handleSelectOrder(item, type)}
      >
        <div style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Text strong>{containerNumber}</Text>
              {isSelected && (
                <span style={{ color: '#1890ff', marginLeft: 8, fontWeight: 500 }}>
                  (Đang chọn)
                </span>
              )}
            </Col>
          </Row>
          <div style={{ marginTop: 4 }}>
            <Text>{customerName}</Text>
          </div>
          <div style={{ marginTop: 4 }}>
            {rawDateValue ? (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(rawDateValue).format('DD/MM/YYYY')}
              </Text>
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dateLabel}: Chưa có dữ liệu
              </Text>
            )}
          </div>
        </div>
      </List.Item>
    );
  };

  return (
    <Card
      size="small"
      style={{ marginTop: 16, marginBottom: 8 }}
      bodyStyle={{ padding: 12 }}
    >
      <Row gutter={8}>
        <Col span={24}>
          <Text strong style={{ fontSize: 16 }}>
            Danh sách đơn hàng của xe
          </Text>
        </Col>
        <Col span={24} style={{ marginTop: 8, marginBottom: 12 }}>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            style={{ width: 260 }}
            format="YYYY-MM-DD"
          />
        </Col>
      </Row>

      {loading ? (
        <Spin style={{ width: '100%', marginTop: 40 }} />
      ) : (
        <>
          {deliveryOrders.length > 0 && (
            <>
              <Divider orientation="left" orientationMargin="0">
                <Text type="secondary">🚚 Đơn Giao Hàng</Text>
              </Divider>
              <List
                dataSource={deliveryOrders}
                renderItem={(item) => renderOrderItem(item, 'delivery')}
                locale={{ emptyText: '' }}
                pagination={false}
              />
            </>
          )}
          {packingOrders.length > 0 && (
            <>
              <Divider orientation="left" orientationMargin="0">
                <Text type="secondary">📦 Đơn Lấy Hàng</Text>
              </Divider>
              <List
                dataSource={packingOrders}
                renderItem={(item) => renderOrderItem(item, 'packing')}
                locale={{ emptyText: '' }}
                pagination={false}
              />
            </>
          )}
          {combinedOrders.length > 0 && (
            <>
              <Divider orientation="left" orientationMargin="0">
                <Text type="secondary">🔁 Đơn Kết Hợp</Text>
              </Divider>
              <List
                dataSource={combinedOrders}
                renderItem={(item) => renderOrderItem(item, 'combined')}
                locale={{ emptyText: '' }}
                pagination={false}
              />
            </>
          )}
          {deliveryOrders.length + packingOrders.length + combinedOrders.length === 0 && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <Text type="secondary">Không có đơn hàng nào trong khoảng thời gian đã chọn.</Text>
            </div>
          )}
          {totalAll > 0 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={totalAll}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
                size="small"
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default VehicleOrderList;
