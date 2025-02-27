import React, { useState, useEffect } from 'react';
import { Card, Row, Col, message, Typography, Tooltip, Divider, Button, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';
import { 
  getOrderConnectionsByDeliveryDate, 
  getCostByOrderId,
  deleteOrderConnection // Import the deleteOrderConnection function
} from '../../services/OrderService';
import { fetchProvinceName, fetchDistrictName } from '../../services/LocationService';
import { getCustomerById } from '../../services/CustomerService';

const { Title } = Typography;

const CombinedOrderList = ({ startDate, endDate }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchCombinedOrders = async () => {
      try {
        const combinedOrders = await getOrderConnectionsByDeliveryDate(startDate, endDate);
        // eslint-disable-next-line no-unused-vars
        const filteredOrders = combinedOrders.filter(orderConnection => 
          orderConnection.deliveryOrderId.hasVehicle === 0 && 
          orderConnection.packingOrderId.hasVehicle === 0
        );
        const ordersWithDetails = await Promise.all(combinedOrders.map(async (orderConnection) => {
          const enrichOrder = async (order) => {
            const startProvince = await fetchProvinceName(order.location.startPoint.provinceCode);
            const startDistrict = await fetchDistrictName(order.location.startPoint.districtCode);
            const endProvince = await fetchProvinceName(order.location.endPoint.provinceCode);
            const endDistrict = await fetchDistrictName(order.location.endPoint.districtCode);
            const customer = await getCustomerById(order.customer);
            const cost = await getCostByOrderId(order._id);
            const tripFare = cost ? cost.tripFare : 0;
            const estimatedProfit = cost ? cost.tripFare - (
              cost.driverAllowance +
              cost.driverSalary +
              cost.fuelCost +
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
              estimatedProfit,
              startLocation: `${startProvince}, ${startDistrict}`,
              endLocation: `${endProvince}, ${endDistrict}`,
              customerName: customer.shortName,
              moocType: order.moocType === 0 ? "20''" : "40''",
              containerNumber: order.containerNumber || 'Không có',
            };
          };

          return {
            _id: orderConnection._id, 
            deliveryOrder: await enrichOrder(orderConnection.deliveryOrderId),
            packingOrder: await enrichOrder(orderConnection.packingOrderId),
            type: orderConnection.type // Add type to the order connection
          };
        }));
        setOrders(ordersWithDetails);
      } catch (error) {
        message.error('Lỗi khi tải danh sách đơn hàng');
      }
    };

    fetchCombinedOrders();
  }, [startDate, endDate]);

  const handleDelete = async (connectionId) => {
    try {
      await deleteOrderConnection(connectionId);
      message.success('Xóa kết nối đơn hàng thành công');
      setOrders(orders.filter(order => order._id !== connectionId));
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
      title={
        <Link to={`/order/${type}-orders/${order._id}`}>
          <div style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
            <span style={{ marginRight: 8 }}>
              {type === 'delivery' ? '🚚 Đơn giao hàng:' : '📦 Đơn đóng hàng:'}
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              {order.customerName}
              {order.cost && (
                <Tooltip
                  title={
                    order.cost ? (
                      <div>
                        <p>Cước chuyến: {order.cost.tripFare.toLocaleString()}</p>
                        <p>Công tác phí: {order.cost.driverAllowance.toLocaleString()}</p>
                        <p>Lương tài xế: {order.cost.driverSalary.toLocaleString()}</p>
                        <p>Chi phí nhiên liệu: {order.cost.fuelCost.toLocaleString()}</p>
                        <p>Vé lượt: {order.cost.singleTicket.toLocaleString()}</p>
                        <p>Vé tháng: {order.cost.monthlyTicket.toLocaleString()}</p>
                        <p>Chi phí khác: {order.cost.otherCosts.toLocaleString()}</p>
                        <p>Phí đăng ký: {order.cost.registrationFee.toLocaleString()}</p>
                        <p>Bảo hiểm: {order.cost.insurance.toLocaleString()}</p>
                        <p>Lương đội kỹ thuật: {order.cost.technicalTeamSalary.toLocaleString()}</p>
                        <p>Lãi vay ngân hàng: {order.cost.bankLoanInterest.toLocaleString()}</p>
                        <p>Chi phí sửa chữa: {order.cost.repairCost.toLocaleString()}</p>
                      </div>
                    ) : 'Không có thông tin chi phí'
                  }
                >
                  <div style={{ fontWeight: 'bold', fontSize: '16px', textAlign: 'right', margin: 0, color: 'green', marginLeft: 8 }}>
                    {order.estimatedProfit !== null ? order.estimatedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Không có'}
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        </Link>
      }
      bordered={false}
      style={{
        position: 'relative',
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        height: '100%'
      }}
    >
      {order.tripFare === 0 && (
        <div style={{ color: 'red', fontWeight: 'bold', textAlign: 'right' }}>Không có tuyến</div>
      )}
      <p style={{ margin: 0 }}><strong>Điểm Đi:</strong> {order.startLocation}</p>
      <p style={{ margin: 0 }}><strong>Điểm Đến:</strong> {order.endLocation}</p>
      <p style={{ margin: 0 }}><strong>Mooc:</strong> {order.moocType}</p>
      <p style={{ margin: 0 }}><strong>Số Cont:</strong> {order.containerNumber}</p>
      {order.note && <p style={{ margin: 0 }}><strong>Ghi chú:</strong> {order.note}</p>}
    </Card>
  );

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>Danh Sách Đơn Hàng Ghép</Title>
      <Row gutter={[24, 24]}>
        {orders.map((order) => {
          const totalEstimatedProfit = (order.deliveryOrder.estimatedProfit || 0) + (order.packingOrder.estimatedProfit || 0);
            return (
            <Col span={24} key={order.deliveryOrder._id}>
              <Card className="combined-order-group" style={{ border: '1px solid #1890ff', borderRadius: 8, position: 'relative', background: '#fafafa' }} bodyStyle={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #e8e8e8' }}>
                <div>
                <span style={{ fontWeight: 500, marginRight: 16 }}>📅 {new Date(order.deliveryOrder.deliveryDate).toLocaleDateString()}</span>
                <span style={{ fontWeight: 500, marginRight: 16 }}>Loại: {getTypeDescription(order.type)}</span>
                </div>
                <Tooltip title="Tổng lợi nhuận ước tính">
                <span style={{ backgroundColor: '#52c41a', color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 'bold' }}>
                  {totalEstimatedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                </Tooltip>
                <Popconfirm
                title="Bạn có chắc chắn muốn xóa kết nối đơn hàng này không?"
                onConfirm={() => handleDelete(order._id)}
                okText="Yes"
                cancelText="No"
                >
                <Button type="primary" danger>Hủy kết nối</Button>
                </Popconfirm>
              </div>
              <Row gutter={24} align="middle">
                <Col xs={24} md={11}>{renderOrderCard(order.deliveryOrder, 'delivery')}</Col>
                <Col xs={24} md={1} style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: 'white', 
                  border: '1px solid #1890ff' 
                }}>
                  <ArrowRightOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                </div>
                </Col>
                <Col xs={24} md={11}>{renderOrderCard(order.packingOrder, 'packing')}</Col>
              </Row>
              <Divider style={{ margin: '16px 0 0 0' }} />
              </Card>
            </Col>
            );
        })}
      </Row>
    </div>
  );
};

export default CombinedOrderList;