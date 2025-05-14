import React, { useState, useEffect } from 'react';
import { Card, message, Typography, Tooltip, Button, Popconfirm, Space, Tag , Spin} from 'antd';
import { Link } from 'react-router-dom';
import { DeleteOutlined, EnvironmentOutlined, InfoCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { 
  getOrderConnectionsByDeliveryDate, 
  getCostByOrderId,
  deleteOrderConnection
} from '../../services/OrderService';
import { fetchProvinceName, fetchDistrictName, fetchWardName } from '../../services/LocationService';
import { getCustomerById } from '../../services/CustomerService';

const { Title, Text } = Typography;

const CombinedOrderList = ({ startDate, endDate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCombinedOrders = async () => {
      setLoading(true);
      try {
        const fuelPrice = parseFloat(localStorage.getItem('fuelPrice')) || 0; // Lấy giá trị fuelPrice từ localStorage
        const combinedOrders = await getOrderConnectionsByDeliveryDate(startDate, endDate);

        const ordersWithDetails = await Promise.all(
          combinedOrders.map(async (orderConnection) => {
            const enrichOrder = async (order) => {
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

              // Tính fuelCost
              const fuelCost = cost ? fuelPrice * cost.fuel * 1000 : 0;

              // Tính estimatedProfit
              const estimatedProfit = cost
                ? tripFare -
                  (
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
                  )
                : 0;

              return {
                ...order,
                cost,
                tripFare,
                fuelCost, // Thêm fuelCost vào đối tượng
                estimatedProfit,
                startLocation: `${startLocationText ? startLocationText + ', ' : ''}${startWard ? startWard + ', ' : ''}${startDistrict}, ${startProvince}`,
                endLocation: `${endLocationText ? endLocationText + ', ' : ''}${endWard ? endWard + ', ' : ''}${endDistrict}, ${endProvince}`,
                customerName: customer.shortName,
                moocType: order.moocType === 0 ? "20" : "40",
                containerNumber: order.containerNumber || 'Không có',
              };
            };

            return {
              _id: orderConnection._id,
              deliveryOrder: await enrichOrder(orderConnection.deliveryOrderId),
              packingOrder: await enrichOrder(orderConnection.packingOrderId),
              type: orderConnection.type,
            };
          })
        );

        // Filter out orders where deliveryOrder.hasVehicle === 1
        const filteredOrders = ordersWithDetails.filter(order => order.deliveryOrder.hasVehicle === 0);

        setOrders(filteredOrders);
      } catch (error) {
        message.error('Lỗi khi tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchCombinedOrders();
  }, [startDate, endDate]);

  const handleDelete = async (connectionId) => {
    try {
      await deleteOrderConnection(connectionId);
      message.success('Xóa kết nối đơn hàng thành công');
      setOrders(orders.filter(order => order._id !== connectionId));
      window.location.reload();
    } catch (error) {
      message.error('Lỗi khi xóa kết nối đơn hàng');
    }
  };

  const getTypeDescription = (type) => {
    switch (type) {
      case 0:
        return 'Trong ngày cùng điểm';
      case 1:
        return 'Trong ngày khác điểm';
      case 2:
        return 'Khác ngày';
      default:
        return 'Không xác định';
    }
  };

  const renderOrderCard = (order, type) => (
    <Card
      size="small"
      title={
        <Link to={`/order/${type}-orders/${order._id}`} style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 14 }}>
              {type === 'delivery' ? '🚚 ' : '📦 '} {order.customerName}
            </Text>
            <Tag color={order.moocType === "20" ? "blue" : "purple"}>{order.moocType}</Tag>
          </div>
        </Link>
      }
      style={{
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        height: '100%'
      }}
      bodyStyle={{ padding: '12px' }}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        {/* Thời gian và lợi nhuận */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {order.deliveryDate ? 
              new Date(order.deliveryDate).toLocaleDateString('vi-VN', { 
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }) 
              : '--/-- --:--'}
          </Text>
          {order.tripFare === 0 ? (
            <Tag color="error">Không tuyến</Tag>
          ) : (
            <Tooltip
              title={
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
              }
            >
              <Text
                strong
                style={{
                  color: order.estimatedProfit > 0 ? 'green' : 'red',
                  fontSize: 14,
                }}
              >
                {order.estimatedProfit?.toLocaleString() || '--'}
              </Text>
            </Tooltip>
          )}
        </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '4px 0' }}>
            <EnvironmentOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
            <div style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, whiteSpace: 'normal' }}>
                <span style={{ fontWeight: 500 }}>Đi: </span>
                {order.startLocation}
              </Text>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '4px 0' }}>
            <EnvironmentOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
            <div style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, whiteSpace: 'normal' }}>
                <span style={{ fontWeight: 500 }}>Đến: </span>
                {order.endLocation}
              </Text>
            </div>
          </div>

          {/* Thông tin phụ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
          <Text>Cont: {order.containerNumber || '--'} - {order.owner}</Text>
          {order.note && (
            <Tooltip title={order.note}>
              <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
            </Tooltip>
          )}
        </div>
      </Space>
    </Card>
  );

  return (
    <Spin spinning={loading} tip="Đang tải danh sách đơn hàng ghép...">
    <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Title level={4} style={{ marginBottom: 16 }}>Danh Sách Đơn Hàng Ghép ({orders.length})</Title>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 600px))',
        gap: '12px'
      }}>
        {orders.map((order) => {
          const totalEstimatedProfit = 
            (order.deliveryOrder.estimatedProfit || 0) +
            (order.packingOrder.estimatedProfit || 0) +
            (order.deliveryOrder.cost?.registrationFee || 0) +
            (order.deliveryOrder.cost?.insurance || 0) +
            (order.deliveryOrder.cost?.technicalTeamSalary || 0) +
            (order.deliveryOrder.cost?.bankLoanInterest || 0) +
            (order.deliveryOrder.cost?.repairCost || 0) +
            (order.deliveryOrder.cost?.monthlyTicket || 0) ;
          return (
            <Card
              key={order._id}
              style={{ 
                border: '1px solid #1890ff', 
                borderRadius: 8, 
                backgroundColor: '#fafafa' 
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <Text strong style={{ fontSize: 12 }}>
                    📅 {new Date(order.deliveryOrder.deliveryDate).toLocaleDateString()}
                  </Text>
                  <Tag color="geekblue" style={{ marginLeft: 8 }}>
                    {getTypeDescription(order.type)}
                  </Tag>
                </div>
                <Tooltip title="Tổng lợi nhuận ước tính">
                  <Text strong style={{ 
                    color: totalEstimatedProfit > 0 ? 'green' : 'red',
                    fontSize: 14
                  }}>
                    {totalEstimatedProfit.toLocaleString()}
                  </Text>
                </Tooltip>
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa kết nối đơn hàng này không?"
                  onConfirm={() => handleDelete(order._id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button 
                    type="text" 
                    icon={<DeleteOutlined />} 
                    size="small"
                    danger
                  />
                </Popconfirm>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {renderOrderCard(order.deliveryOrder, 'delivery')}
                <ArrowRightOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                {renderOrderCard(order.packingOrder, 'packing')}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
    </Spin>
  );
};

export default CombinedOrderList;