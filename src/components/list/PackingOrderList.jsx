import React, { useState, useEffect } from 'react';
import { Card, Col, Row, message, Typography } from 'antd';
import { getPackingOrdersByDate, getCostByOrderId } from '../../services/OrderService';
import { fetchProvinceName, fetchDistrictName } from '../../services/LocationService';
import { getCustomerById } from '../../services/CustomerService';

const { Title } = Typography;

const PackingOrderList = ({ startDate, onSelectChange }) => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const packingOrders = await getPackingOrdersByDate(startDate);
        const ordersWithDetails = await Promise.all(packingOrders.map(async (order) => {
          const startProvince = await fetchProvinceName(order.location.startPoint.provinceCode);
          const startDistrict = await fetchDistrictName(order.location.startPoint.districtCode);
          const endProvince = await fetchProvinceName(order.location.endPoint.provinceCode);
          const endDistrict = await fetchDistrictName(order.location.endPoint.districtCode);
          const customer = await getCustomerById(order.customer);
          const cost = await getCostByOrderId(order._id);
          const tripFare = cost.tripFare;
          const estimatedProfit = cost.tripFare - (
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
          );

          return {
            ...order,
            tripFare,
            estimatedProfit, // Use calculated estimatedProfit
            startLocation: `${startProvince}, ${startDistrict}`,
            endLocation: `${endProvince}, ${endDistrict}`,
            shortName: customer.shortName,
            moocType: order.moocType === 0 ? "20''" : "40''",
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
  }, [startDate]);

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

  return (
    <>
      <Title level={3}>Danh Sách Đơn Đóng Hàng</Title>
      <Row gutter={[16, 16]}>
        {orders.map((order) => (
          <Col span={8} key={order._id}>
            <Card
              title={
                <>
                  <div>{`Khách Hàng: ${order.shortName}`}</div>
                </>
              }
              bordered={false}
              onClick={() => onSelectChangeHandler(order._id)}
              style={{
                cursor: 'pointer',
                border: selectedRowKeys.includes(order._id) ? '2px solid #1890ff' : '1px solid #f0f0f0',
              }}
            >
              {order.tripFare === 0 ? (
                <div style={{ color: 'red', fontWeight: 'bold' }}>Không có tuyến</div>
              ) : (
                <div style={{ fontWeight: 'bold', fontSize: '16px', textAlign: 'right', margin: 0, color: 'green' }}>
                  {order.tripFare ? order.tripFare.toFixed(2) : 'N/A'}
                </div>
              )}
              <p style={{ margin: 0 }}><strong>Điểm Đi:</strong> {order.startLocation}</p>
              <p style={{ margin: 0 }}><strong>Điểm Đến:</strong> {order.endLocation}</p>
              <p style={{ margin: 0 }}><strong>Mooc:</strong> {order.moocType}</p>
              <p style={{ margin: 0 }}><strong>Số Cont:</strong> {order.containerNumber}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default PackingOrderList;