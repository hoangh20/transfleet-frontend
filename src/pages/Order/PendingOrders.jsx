import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Spin, message, Button, Popconfirm } from 'antd';
import { getOrdersWithoutDate } from '../../services/OrderService';
import { fetchProvinceName, fetchDistrictName, fetchWardName } from '../../services/LocationService';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // Sửa lại import này
import { deleteDeliveryOrder } from '../../services/OrderService';
import { deletePackingOrder } from '../../services/OrderService';

const PendingOrders = () => {
  const [loading, setLoading] = useState(true);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [packingOrders, setPackingOrders] = useState([]);
  const navigate = useNavigate(); // Sử dụng useNavigate thay cho useHistory

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getOrdersWithoutDate();
        const { deliveryOrders = [], packingOrders = [] } = res.data || {};
        const deliveryOrdersWithAddress = await Promise.all(
          deliveryOrders.map(async (order) => {
            const { endPoint } = order.location || {};
            let address = '';
            if (endPoint) {
              const province = await fetchProvinceName(endPoint.provinceCode);
              const district = await fetchDistrictName(endPoint.districtCode);
              const ward = endPoint.wardCode ? await fetchWardName(endPoint.wardCode) : '';
              address = `${ward ? ward + ', ' : ''}${district}, ${province}`;
            }
            return { ...order, address };
          })
        );
        const packingOrdersWithAddress = await Promise.all(
          packingOrders.map(async (order) => {
            const { startPoint } = order.location || {};
            let address = '';
            if (startPoint) {
              const province = await fetchProvinceName(startPoint.provinceCode);
              const district = await fetchDistrictName(startPoint.districtCode);
              const ward = startPoint.wardCode ? await fetchWardName(startPoint.wardCode) : '';
              address = `${ward ? ward + ', ' : ''}${district}, ${province}`;
            }
            return { ...order, address };
          })
        );

        setDeliveryOrders(deliveryOrdersWithAddress);
        setPackingOrders(packingOrdersWithAddress);
      } catch (error) {
        message.error('Không thể tải danh sách đơn hàng chờ');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditDelivery = (order) => {
    navigate(`/order/delivery-orders/${order._id}`);
  };

  const handleEditPacking = (order) => {
    navigate(`/order/packing-orders/${order._id}`);
  };

  const handleDeleteDelivery = async (order) => {
    try {
      await deleteDeliveryOrder(order._id);
      setDeliveryOrders(deliveryOrders.filter(o => o._id !== order._id));
      message.success('Xóa đơn giao hàng thành công');
    } catch (error) {
      message.error('Lỗi khi xóa đơn giao hàng');
    }
  };

  const handleDeletePacking = async (order) => {
    try {
      await deletePackingOrder(order._id);
      setPackingOrders(packingOrders.filter(o => o._id !== order._id));
      message.success('Xóa đơn đóng hàng thành công');
    } catch (error) {
      message.error('Lỗi khi xóa đơn đóng hàng');
    }
  };

  const deliveryColumns = [
    {
      title: 'Khách hàng',
      dataIndex: ['customer', 'shortName'],
      key: 'customer',
      render: (v, record) => record.customer?.shortName || '--',
    },
    {
      title: 'Sales',
      dataIndex: 'salesPerson',
      key: 'salesPerson',
    },
    {
      title: 'Mooc',
      dataIndex: 'moocType',
      key: 'moocType',
      render: (v) => (
        <Tag color={v === 0 ? 'blue' : 'purple'}>{v === 0 ? '20' : '40'}</Tag>
      ),
    },
    {
      title: 'Điểm đến',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditDelivery(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa đơn này?"
            onConfirm={() => handleDeleteDelivery(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </>
      ),
    },
  ];

  const packingColumns = [
    {
      title: 'Khách hàng',
      dataIndex: ['customer', 'shortName'],
      key: 'customer',
      render: (v, record) => record.customer?.shortName || '--',
    },
    {
      title: 'Sales',
      dataIndex: 'salesPerson',
      key: 'salesPerson',
    },
    {
      title: 'Mooc',
      dataIndex: 'moocType',
      key: 'moocType',
      render: (v) => (
        <Tag color={v === 0 ? 'blue' : 'purple'}>{v === 0 ? '20' : '40'}</Tag>
      ),
    },
    {
      title: 'Điểm đi',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditPacking(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa đơn này?"
            onConfirm={() => handleDeletePacking(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
    <Card title="Đơn đóng hàng chờ ">
        <Table
          dataSource={packingOrders}
          columns={packingColumns}
          rowKey="_id"
          pagination={false}
          locale={{ emptyText: 'Không có đơn đóng hàng chờ ' }}
        />
      </Card>
      <Card title="Đơn giao hàng chờ " style={{ marginBottom: 24 }}>
        <Table
          dataSource={deliveryOrders}
          columns={deliveryColumns}
          rowKey="_id"
          pagination={false}
          locale={{ emptyText: 'Không có đơn giao hàng chờ ' }}
        />
      </Card>
    </Spin>
  );
};

export default PendingOrders;