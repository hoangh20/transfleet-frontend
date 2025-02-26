import React, { useState, useEffect } from 'react';
import { Card, Col, Row, message, Typography, Tooltip, Button, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import { getDeliveryOrdersByDate, getCostByOrderId, deleteDeliveryOrder } from '../../services/OrderService';
import { fetchProvinceName, fetchDistrictName } from '../../services/LocationService';
import { getCustomerById } from '../../services/CustomerService';

const { Title } = Typography;

const DeliveryOrderList = ({ startDate, endDate, onSelectChange }) => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const deliveryOrders = await getDeliveryOrdersByDate(startDate, endDate);
        const filteredOrders = deliveryOrders.filter(order => order.isCombinedTrip === 0);
        const ordersWithDetails = await Promise.all(filteredOrders.map(async (order) => {
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
            shortName: customer.shortName,
            moocType: order.moocType === 0 ? "20''" : "40''",
            containerNumber: order.containerNumber 
          };
        }));
        setOrders(ordersWithDetails);
      } catch (error) {
        message.error('Lỗi khi tải danh sách đơn giao hàng');
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
      await deleteDeliveryOrder(orderId);
      setOrders(orders.filter(order => order._id !== orderId));
      message.success('Xóa đơn giao hàng thành công');
    } catch (error) {
      message.error('Lỗi khi xóa đơn giao hàng');
    }
  };

  return (
    <>
      <Title level={3}>Danh Sách Đơn Giao Hàng</Title>
      <Row gutter={[16, 16]}>
        {orders.map((order) => (
          <Col span={8} key={order._id}>
            <Card
              title={
                <Link to={`/order/delivery-orders/${order._id}`}>
                  <div>{`🚚 ${order.shortName}`}</div>
                </Link>
              }
              bordered={false}
              onClick={() => onSelectChangeHandler(order._id)}
              style={{
                cursor: 'pointer',
                border: selectedRowKeys.includes(order._id) ? '2px solid #1890ff' : '1px solid #f0f0f0',
              }}
              extra={
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa đơn giao hàng này không?"
                  onConfirm={() => handleDelete(order._id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button type="link" danger>
                    Xóa
                  </Button>
                </Popconfirm>
              }
            >
              {order.tripFare === 0 ? (
                <div style={{ color: 'red', fontWeight: 'bold', textAlign: 'right' }}>Không có tuyến</div>
              ) : (
                <Tooltip
                  title={
                    order.cost ? (
                      <div>
                        <p>Cước chuyến: {order.cost.tripFare.toLocaleString()}</p>
                        <p>Chi phí tài xế: {order.cost.driverAllowance.toLocaleString()}</p>
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
                  <div style={{ fontWeight: 'bold', fontSize: '16px', textAlign: 'right', margin: 0, color: 'green' }}>
                    {order.estimatedProfit !== null ? order.estimatedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Không có'}
                  </div>
                </Tooltip>
              )}
              <p style={{ margin: 0 }}><strong>Điểm Đi:</strong> {order.startLocation || 'Không có'}</p>
              <p style={{ margin: 0 }}><strong>Điểm Đến:</strong> {order.endLocation || 'Không có'}</p>
              <p style={{ margin: 0 }}><strong>Mooc:</strong> {order.moocType || 'Không có'}</p>
              <p style={{ margin: 0 }}><strong>Thời gian giao hàng dự tính :</strong> {order.estimatedTime ? new Date(order.estimatedTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Không có'}</p>
              <p style={{ margin: 0 }}><strong>Số Cont:</strong> {order.containerNumber || 'Không có'}</p>
              {order.note && (
                <p style={{ margin: 0 }}><strong>Ghi chú:</strong> {order.note}</p>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default DeliveryOrderList;