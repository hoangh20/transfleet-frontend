import React, { useState, useEffect } from 'react';
import { Card, message, Typography, Tooltip, Button, Popconfirm, Space, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { DeleteOutlined, EnvironmentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { getPackingOrdersByDate, getCostByOrderId, deletePackingOrder } from '../../services/OrderService';
import { fetchProvinceName, fetchDistrictName, fetchWardName } from '../../services/LocationService';
import { getCustomerById } from '../../services/CustomerService';

const { Title, Text } = Typography;

const PackingOrderList = ({ startDate, endDate, onSelectChange }) => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const fuelPrice = parseFloat(localStorage.getItem('fuelPrice')) || 0; // Lấy giá trị fuelPrice từ localStorage
        const packingOrders = await getPackingOrdersByDate(startDate, endDate);
        const filteredOrders = packingOrders.filter(order => order.isCombinedTrip === 0 && order.hasVehicle === 0);
        const ordersWithDetails = await Promise.all(filteredOrders.map(async (order) => {
          const startProvince = await fetchProvinceName(order.location.startPoint.provinceCode);
                    const startDistrict = await fetchDistrictName(order.location.startPoint.districtCode);
                    const startWard = order.location.startPoint.wardCode
                      ? await fetchWardName(order.location.startPoint.wardCode)
                      : null;
                    const startLocationText = order.location.startPoint.locationText || '';
          
                    const endProvince = await fetchProvinceName(order.location.endPoint.provinceCode);
                    const endDistrict = await fetchDistrictName(order.location.endPoint.districtCode);
                    const endWard = order.location.endPoint.wardCode
                      ? await fetchWardName(order.location.endPoint.wardCode)
                      : null;
                    const endLocationText = order.location.endPoint.locationText || '';
          
          const customer = await getCustomerById(order.customer);
          const cost = await getCostByOrderId(order._id);
          const tripFare = cost ? cost.tripFare : 0;

          const fuelCost = cost ? fuelPrice * cost.fuel * 1000 : 0;
          const estimatedProfit = cost ? tripFare - (
            fuelCost +
            cost.driverAllowance +
            cost.driverSalary +
            cost.singleTicket +
            cost.monthlyTicket +
            cost.otherCosts +
            cost.registrationFee +
            cost.insurance +
            cost.technicalTeamSalary +
            cost.bankLoanInterest +
            cost.repairCost
          ) : 0;

          return {
            ...order,
            cost,
            tripFare,
            fuelCost,
            estimatedProfit,
            startLocation: `${startLocationText ? startLocationText + ', ' : ''}${startWard ? startWard + ', ' : ''}${startDistrict}, ${startProvince}`,
            endLocation: `${endLocationText ? endLocationText + ', ' : ''}${endWard ? endWard + ', ' : ''}${endDistrict}, ${endProvince}`,
            shortName: customer.shortName,
            contType: order.contType === 0 ? "20''" : "40''",
            moocType: order.moocType === 0 ? "20''" : "40''",
            closeCombination: order.closeCombination === 0 ? "Gắp vỏ" : "Kết hợp",
            containerNumber: order.containerNumber 
          };
        }));
        setOrders(ordersWithDetails);
      } catch (error) {
        message.error('Lỗi khi tải danh sách đơn đóng hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [startDate, endDate]);

  const onSelectChangeHandler = (orderId) => {
    let newSelectedRowKeys;
    if (selectedRowKeys.includes(orderId)) {
      newSelectedRowKeys = [];
    } else {
      newSelectedRowKeys = [orderId];
    }
    setSelectedRowKeys(newSelectedRowKeys);
    onSelectChange(newSelectedRowKeys);
  };

  const handleDelete = async (orderId) => {
    try {
      await deletePackingOrder(orderId);
      setOrders(orders.filter(order => order._id !== orderId));
      message.success('Xóa đơn đóng hàng thành công');
    } catch (error) {
      console.error('Delete packing order error:', error);
      message.error('Lỗi khi xóa đơn đóng hàng');
    }
  };

  return (
    <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Title level={4} style={{ marginBottom: 16 }}>Danh Sách Đơn Đóng Hàng ({orders.length})</Title>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px'
      }}>
        {orders.map((order) => (
          <Card
            key={order._id}
            size="small"
            title={
              <Link to={`/order/packing-orders/${order._id}`} style={{ display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 14 }}>📦 {order.shortName}</Text>
                  <Tag color={order.closeCombination === "gắp vỏ" ? "blue" : "green"}>{order.closeCombination}</Tag>
                  <Tag color={order.contType === "20''" ? "blue" : "purple"}>{order.contType}</Tag>
                </div>
              </Link>
            }
            hoverable
            onClick={() => onSelectChangeHandler(order._id)}
            style={{
              cursor: 'pointer',
              border: selectedRowKeys.includes(order._id) 
                ? '2px solid #1890ff' 
                : '1px solid #f0f0f0',
              margin: 0,
            }}
            bodyStyle={{ padding: '12px' }}
            extra={
              <Popconfirm
                title="Xóa đơn này?"
                onConfirm={() => handleDelete(order._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button 
                  type="text" 
                  icon={<DeleteOutlined />} 
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            }
          >
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              {/* Thời gian và lợi nhuận */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                  {order.packingDate ? 
                    new Date(order.packingDate).toLocaleDateString('vi-VN', { 
                      day: '2-digit',
                      month: '2-digit',
                    }) 
                    : '--/--'}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <span style={{ fontWeight: 500 }}>Dự kiến: </span>
                  {order.estimatedTime ? 
                    new Date(order.estimatedTime).toLocaleDateString('vi-VN', { 
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) 
                    : '--/-- --:--'}
                </Text>
                {order.tripFare === 0 ? (
                  <Tag color="error">Không có cước phí</Tag>
                ) : (
                  <Tooltip title={
                    order.cost ? (
                      <div>
                        <p>Cước chuyến: {order.cost.tripFare?.toLocaleString() || '--'}</p>
                        <p>Chi phí nhiên liệu: {order.fuelCost?.toLocaleString() || '--'}</p>
                        <p>Công tác phí: {order.cost.driverAllowance?.toLocaleString() || '--'}</p>
                        <p>Lương tài xế: {order.cost.driverSalary?.toLocaleString() || '--'}</p>
                        <p>Vé lượt: {order.cost.singleTicket?.toLocaleString() || '--'}</p>
                        <p>Vé tháng: {order.cost.monthlyTicket?.toLocaleString() || '--'}</p>
                        <p>Chi phí khác: {order.cost.otherCosts?.toLocaleString() || '--'}</p>
                        <p>Phí đăng ký: {order.cost.registrationFee?.toLocaleString() || '--'}</p>
                        <p>Bảo hiểm: {order.cost.insurance?.toLocaleString() || '--'}</p>
                        <p>Lương đội kỹ thuật: {order.cost.technicalTeamSalary?.toLocaleString() || '--'}</p>
                        <p>Lãi vay ngân hàng: {order.cost.bankLoanInterest?.toLocaleString() || '--'}</p>
                        <p>Chi phí sửa chữa: {order.cost.repairCost?.toLocaleString() || '--'}</p>
                      </div>
                    ) : 'Không có thông tin chi phí'
                  }>
                    <Text strong style={{ 
                      color: order.estimatedProfit > 0 ? 'green' : 'red',
                      fontSize: 14
                    }}>
                      {order.estimatedProfit?.toLocaleString() || '--'}
                    </Text>
                  </Tooltip>
                )}
              </div>

              {/* Địa chỉ */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '4px 0' }}>
                <EnvironmentOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, whiteSpace: 'normal' }}>
                    <span style={{ fontWeight: 500 }}>Đi: </span>
                    {order.startLocation}
                  </Text>
                  </div>
                  <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, whiteSpace: 'normal' }}>
                    <span style={{ fontWeight: 500 }}>Đến: </span>
                    {order.endLocation}
                  </Text>
                </div>
              </div>

              {/* Thông tin phụ */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <Text>Cont: {order.containerNumber || '--'}</Text>
                {order.note && (
                  <Tooltip title={order.note}>
                    <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                )}
              </div>
            </Space>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PackingOrderList;