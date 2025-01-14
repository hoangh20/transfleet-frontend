import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import { getPackingOrdersByDate } from '../../services/OrderService';
import { fetchProvinceName, fetchDistrictName } from '../../services/LocationService';
import { getCustomerById } from '../../services/CustomerService';

const PackingOrderList = ({ startDate, onSelectChange }) => {
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
          return {
            ...order,
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

  const onSelectChangeHandler = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
    onSelectChange(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChangeHandler,
  };

  const columns = [
    {
      title: 'Khách Hàng',
      dataIndex: 'shortName',
      key: 'shortName',
    },
    {
      title: 'Điểm Đi',
      dataIndex: 'startLocation',
      key: 'startLocation',
    },
    {
      title: 'Điểm Đến',
      dataIndex: 'endLocation',
      key: 'endLocation',
    },
    {
      title: 'Mooc',
      dataIndex: 'moocType',
      key: 'moocType',
    },
    {
      title: 'Số Cont',
      dataIndex: 'containerNumber',
      key: 'containerNumber',
    },
  ];

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={orders}
      rowKey="_id"
      loading={loading}
      title={() => 'Danh Sách Đơn Đóng Hàng'}
    />
  );
};

export default PackingOrderList;