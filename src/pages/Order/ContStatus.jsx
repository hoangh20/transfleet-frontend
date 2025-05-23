import { useState, useEffect, useMemo } from 'react';
import { DatePicker, message, Table, Tag, Typography, Card, Input, Checkbox, Modal, Form, Select } from 'antd';
import dayjs from 'dayjs';
import { getPackingOrdersByDate, getDeliveryOrdersByDate, updateDeliveryOrder, updatePackingOrder,getOrderPartnerConnectionByOrderId } from '../../services/OrderService';

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Search } = Input;

const deliveryColumns = [
    {
        title: 'Ngày giao',
        dataIndex: 'deliveryDate',
        key: 'deliveryDate',
        render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '',
    },
    {
        title: 'Số cont',
        dataIndex: 'containerNumber',
        key: 'containerNumber',
    },
    {
        title: 'Loại cont',
        dataIndex: 'contType',
        key: 'contType',
        render: (type) => type === 0 ? '20' : '40',
    },
    {
        title: 'Line',
        dataIndex: 'owner',
        key: 'owner',
    },
    {
        title: 'Tình trạng vỏ',
        dataIndex: 'containerStatus',
        key: 'containerStatus',
        render: (containerStatus) => {
            const map = {
                0: <Tag color="default">Không có</Tag>,
                1: <Tag color="green">OK</Tag>,
                2: <Tag color="red">Không OK</Tag>,
            };
            return map[containerStatus] || '';
        }
    },
    {
        title: 'Kết hợp',
        dataIndex: 'isCombinedTrip',
        key: 'isCombinedTrip',
        render: (v) => v ? <Tag color="green">Kết hợp</Tag> : <Tag color="default">Không</Tag>,
    },
    {
        title: 'Mặt hàng',
        dataIndex: 'item',
        key: 'item',
    },
    {
        title: 'Khách hàng',
        dataIndex: ['customer', 'shortName'],
        key: 'customer.shortName',
        render: (value, record) => record.customer?.shortName || '',
    },
    {
        title: 'Đơn vị VT',
        key: 'transportUnit',
        render: (_, record) => <TransportUnitCell record={record} />,
    },
    {
        title: 'Sales',
        dataIndex: 'salesPerson',
        key: 'salesPerson',
    },
    {
        title: 'Ghi chú',
        dataIndex: 'noteCS',
        key: 'noteCS',
    },
];

const packingColumns = [
    {
        title: 'Ngày đóng',
        dataIndex: 'packingDate',
        key: 'packingDate',
        render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '',
    },
    {
        title: 'Số cont',
        dataIndex: 'containerNumber',
        key: 'containerNumber',
    },
    {
        title: 'Loại cont',
        dataIndex: 'contType',
        key: 'contType',
        render: (type) => type === 0 ? '20' : '40',
    },
    {
        title: 'Kết hợp',
        dataIndex: 'isCombinedTrip',
        key: 'isCombinedTrip',
        render: (v) => v ? <Tag color="green">Có</Tag> : <Tag color="default">Không</Tag>,
    },
    {
        title: 'Line',
        dataIndex: 'owner',
        key: 'owner',
    },
    {
        title: 'Mặt hàng',
        dataIndex: 'item',
        key: 'item',
    },
    {
        title: 'Khách hàng',
        dataIndex: ['customer', 'shortName'],
        key: 'customer.shortName',
        render: (value, record) => record.customer?.shortName || '',
    },
    {
        title: 'Đơn vị VT',
        key: 'transportUnit',
        render: (_, record) => <TransportUnitCell record={record} />,
    },
    {
        title: 'Sales',
        dataIndex: 'salesPerson',
        key: 'salesPerson',
    },
    {
        title: 'Lệnh hạ',
        dataIndex: 'command',
        key: 'command',
        render: (command) => {
            const map = {
                0: <Tag color="default">Không có</Tag>,
                1: <Tag color="green">Hạ</Tag>,
                2: <Tag color="red">Không hạ</Tag>,
            };
            return map[command] || '';
        }
    },
    {
        title: 'Ghi chú',
        dataIndex: 'noteCS',
        key: 'noteCS',
    },
];

const containerStatusOptions = [
  { label: 'Không có', value: 0 },
  { label: 'OK', value: 1 },
  { label: 'Không OK', value: 2 },
];
const commandOptions = [
  { label: 'Không có', value: 0 },
  { label: 'Hạ', value: 1 },
  { label: 'Không hạ', value: 2 },
];

const pageSizeOptions = [5, 10, 20, 50, 100];
const TransportUnitCell = ({ record }) => {
  const [partnerShortName, setPartnerShortName] = useState('');
  useEffect(() => {
    let ignore = false;
    const fetchPartner = async () => {
      if (record.hasVehicle === 2 && record._id) {
        try {
          const data = await getOrderPartnerConnectionByOrderId(record._id);
          if (!ignore && data && data.partnerId && data.partnerId.shortName) {
            setPartnerShortName(data.partnerId.shortName);
          }
        } catch {
          if (!ignore) setPartnerShortName('');
        }
      }
    };
    fetchPartner();
    return () => { ignore = true; };
  }, [record.hasVehicle, record._id]);
  if (record.hasVehicle === 1) return <>XD81</>;
  if (record.hasVehicle === 2) return <>{partnerShortName || ''}</>;
  return null;
};
const ContStatus = () => {
  const [selectedDates, setSelectedDates] = useState([dayjs(), dayjs()]);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [packingOrders, setPackingOrders] = useState([]);

  const [loading, setLoading] = useState(false);

  const [deliverySearch, setDeliverySearch] = useState('');
  const [packingSearch, setPackingSearch] = useState('');

  const [selectedDeliverySales, setSelectedDeliverySales] = useState([]);
  const [selectedPackingSales, setSelectedPackingSales] = useState([]);

  const [editModal, setEditModal] = useState({ visible: false, record: null, type: null });
  const [form] = Form.useForm();

  const [deliveryPageSize, setDeliveryPageSize] = useState(10);
  const [packingPageSize, setPackingPageSize] = useState(10);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [selectedDates]);
  
  const handleDateChange = (dates) => {
    setSelectedDates(dates);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [start, end] = selectedDates;
      const packing = await getPackingOrdersByDate(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
      const delivery = await getDeliveryOrdersByDate(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
      const sortByOwner = (arr) =>
        Array.isArray(arr)
          ? [...arr].sort((a, b) => (a.owner || '').localeCompare(b.owner || ''))
          : [];
      setPackingOrders(sortByOwner(packing));
      setDeliveryOrders(sortByOwner(delivery));
      setSelectedDeliverySales([...new Set(delivery.map(d => d.salesPerson).filter(Boolean))]);
      setSelectedPackingSales([...new Set(packing.map(d => d.salesPerson).filter(Boolean))]);
    } catch (error) {
      message.error(error?.message || 'Lỗi khi lấy dữ liệu đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const deliverySalesList = useMemo(
    () => [...new Set(deliveryOrders.map(d => d.salesPerson).filter(Boolean))],
    [deliveryOrders]
  );
  const packingSalesList = useMemo(
    () => [...new Set(packingOrders.map(d => d.salesPerson).filter(Boolean))],
    [packingOrders]
  );

  const filteredDeliveryOrders = deliveryOrders
    .filter(order =>
      order.containerNumber?.toLowerCase().includes(deliverySearch.toLowerCase())
    )
    .filter(order =>
      selectedDeliverySales.length === 0 ? true : selectedDeliverySales.includes(order.salesPerson)
    );

  const filteredPackingOrders = packingOrders
    .filter(order =>
      order.containerNumber?.toLowerCase().includes(packingSearch.toLowerCase())
    )
    .filter(order =>
      selectedPackingSales.length === 0 ? true : selectedPackingSales.includes(order.salesPerson)
    );

  const handleRowClick = (record, type) => {
    setEditModal({ visible: true, record, type });
    form.setFieldsValue({
      owner: record.owner,
      containerStatus: record.containerStatus ?? 0,
      command: record.command ?? 0,
      noteCS: record.noteCS,
    });
  };

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();
      if (editModal.type === 'delivery') {
        await updateDeliveryOrder(editModal.record._id, values);
        message.success('Cập nhật đơn giao hàng thành công');
        fetchOrders();
      } else {
        await updatePackingOrder(editModal.record._id, values);
        message.success('Cập nhật đơn đóng hàng thành công');
        fetchOrders();
      }
      setEditModal({ visible: false, record: null, type: null });
    } catch (error) {
      message.error('Lỗi khi cập nhật');
    }
  };

  const handleEditCancel = () => setEditModal({ visible: false, record: null, type: null });

  return (
    <div>
      <RangePicker
        value={selectedDates}
        onChange={handleDateChange}
        format="DD/MM/YYYY"
        style={{ marginBottom: 16, marginRight: 8 }}
      />

      <Card
        title={<Title level={5} style={{ margin: 0 }}>Danh sách Giao Hàng</Title>}
        bordered={false}
        extra={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Checkbox.Group
              options={deliverySalesList.map(s => ({ label: s, value: s }))}
              value={selectedDeliverySales}
              onChange={setSelectedDeliverySales}
              style={{ marginLeft: 8 }}
            />
            <Search
              placeholder="Tìm theo số cont"
              allowClear
              onChange={e => setDeliverySearch(e.target.value)}
              style={{ width: 200 }}
              value={deliverySearch}
            />
          </div>
        }
      >
        <Table
          dataSource={filteredDeliveryOrders}
          columns={deliveryColumns}
          rowKey="_id"
          loading={loading}
          size="small"
          pagination={{
            pageSize: deliveryPageSize,
            showSizeChanger: true,
            pageSizeOptions: pageSizeOptions.map(String),
            onShowSizeChange: (current, size) => setDeliveryPageSize(size),
            showTotal: (total, range) => (
              <span>
                Hiển thị {range[0]}-{range[1]} trên tổng {total} 
              </span>
            ),
          }}
          scroll={{ x: true }}
          onRow={record => ({
            onClick: () => handleRowClick(record, 'delivery')
          })}
        />
      </Card>
      <Card
        title={<Title level={5} style={{ margin: 0 }}>Danh sách Đóng Hàng</Title>}
        bordered={false}
        style={{ marginTop: 16 }}
        extra={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Checkbox.Group
              options={packingSalesList.map(s => ({ label: s, value: s }))}
              value={selectedPackingSales}
              onChange={setSelectedPackingSales}
              style={{ marginLeft: 8 }}
            />
            <Search
              placeholder="Tìm theo số cont"
              allowClear
              onChange={e => setPackingSearch(e.target.value)}
              style={{ width: 200 }}
              value={packingSearch}
            />
          </div>
        }
      >
        <Table
          dataSource={filteredPackingOrders}
          columns={packingColumns}
          rowKey="_id"
          loading={loading}
          size="small"
          pagination={{
            pageSize: packingPageSize,
            showSizeChanger: true,
            pageSizeOptions: pageSizeOptions.map(String),
            onShowSizeChange: (current, size) => setPackingPageSize(size),
            showTotal: (total, range) => (
              <span>
                Hiển thị {range[0]}-{range[1]} trên tổng {total}
              </span>
            ),
          }}
          scroll={{ x: true }}
          onRow={record => ({
            onClick: () => handleRowClick(record, 'packing')
          })}
        />
      </Card>
      <Modal
        title="Chỉnh sửa thông tin"
        visible={editModal.visible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Line" name="owner">
            <Input />
          </Form.Item>
          {editModal.type === 'delivery' && (
            <Form.Item label="Tình trạng vỏ" name="containerStatus">
              <Select options={containerStatusOptions} />
            </Form.Item>
          )}
          {editModal.type === 'packing' && (
            <Form.Item label="Lệnh hạ" name="command">
              <Select options={commandOptions} />
            </Form.Item>
          )}
          <Form.Item label="Ghi chú CS" name="noteCS">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContStatus;