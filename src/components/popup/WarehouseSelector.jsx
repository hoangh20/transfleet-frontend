import React, { useEffect, useState } from 'react';
import {
  Modal,
  List,
  Button,
  Spin,
  Alert,
  Input,
  Form,
  message,
  Row,
  Col,
  Popconfirm,
} from 'antd';
import {
  getWarehouseAddressesByExternalFleetCostId,
  addWarehouseAddress,
  deleteWarehouseAddressById,
} from '../../services/ExternalFleetCostService';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Tùy chỉnh icon cho kho
const warehouseIcon = new L.Icon({
  iconUrl: '/warehouse.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const InvalidateMapSize = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300); // Delay để đảm bảo modal đã render xong
  }, [map]);
  return null;
};

const WarehouseSelector = ({ visible, onCancel, onSelect, selectedRouteId }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingWarehouse, setAddingWarehouse] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedRouteId) {
      fetchWarehouses();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRouteId]);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await getWarehouseAddressesByExternalFleetCostId(
        selectedRouteId
      );
      setWarehouses(response.data || []);
    } catch (error) {
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWarehouse = async (values) => {
    if (!selectedRouteId) {
      message.warning('Vui lòng chọn tuyến vận tải trước khi thêm kho.');
      return;
    }

    const newWarehouse = {
      ...values,
      lat: selectedPosition?.lat || values.lat,
      lng: selectedPosition?.lng || values.lng,
      externalFleetCostId: selectedRouteId,
    };

    setAddingWarehouse(true);
    try {
      await addWarehouseAddress(newWarehouse);
      message.success('Thêm kho thành công!');
      fetchWarehouses();
      form.resetFields();
      setSelectedPosition(null);
      setShowAddForm(false);
    } catch (error) {
      message.error('Lỗi khi thêm kho.');
    } finally {
      setAddingWarehouse(false);
    }
  };

  const handleDeleteWarehouse = async (id) => {
    try {
      await deleteWarehouseAddressById(id);
      message.success('Xóa kho thành công!');
      fetchWarehouses();
    } catch (error) {
      message.error('Lỗi khi xóa kho.');
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setSelectedPosition(e.latlng);
        form.setFieldsValue({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      },
    });
    return null;
  };

  return (
    <Modal
      title="Chọn Kho"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnClose={false}
    >
      {!selectedRouteId ? (
        <Alert
          message="Chưa chọn tuyến vận tải"
          description="Vui lòng chọn tuyến vận tải trước khi chọn kho."
          type="warning"
          showIcon
        />
      ) : (
        <Row gutter={16}>
          <Col span={8}>
            {loading ? (
              <Spin tip="Đang tải danh sách kho..." />
            ) : (
              <>
                <List
                  header={<strong>Danh Sách Kho</strong>}
                  dataSource={warehouses}
                  renderItem={(warehouse) => (
                    <List.Item
                      actions={[
                        <Button type="link" onClick={() => onSelect(warehouse)}>
                          Chọn
                        </Button>,
                        <Popconfirm
                          title="Bạn có chắc chắn muốn xóa kho này?"
                          onConfirm={() =>
                            handleDeleteWarehouse(warehouse._id)
                          }
                          okText="Có"
                          cancelText="Không"
                        >
                          <Button type="link" danger>
                            Xóa
                          </Button>
                        </Popconfirm>,
                      ]}
                    >
                      {warehouse.name}
                    </List.Item>
                  )}
                />
                <Button
                  type="primary"
                  style={{ marginTop: '16px' }}
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? 'Ẩn Thêm Kho' : 'Thêm Kho'}
                </Button>
              </>
            )}
          </Col>

          <Col span={16}>
            <MapContainer
              center={[21.028511, 105.804817]}
              zoom={13}
              style={{ height: '450px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapClickHandler />
              <InvalidateMapSize /> {/* Gọi resize sau khi hiển thị */}
              {warehouses.map((warehouse) => (
                <Marker
                  key={warehouse._id}
                  position={[warehouse.lat, warehouse.lng]}
                  icon={warehouseIcon}
                >
                  <Tooltip direction="top" offset={[0, -20]} permanent>
                    {warehouse.name}
                  </Tooltip>
                  <Popup>
                    <Button type="link" onClick={() => onSelect(warehouse)}>
                      Chọn
                    </Button>
                  </Popup>
                </Marker>
              ))}
              {selectedPosition && (
                <Marker
                  position={[selectedPosition.lat, selectedPosition.lng]}
                  icon={warehouseIcon}
                >
                  <Tooltip direction="top" offset={[0, -20]} permanent>
                    Vị trí được chọn
                  </Tooltip>
                  <Popup>Vị trí được chọn</Popup>
                </Marker>
              )}
            </MapContainer>
          </Col>
        </Row>
      )}

      {showAddForm && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddWarehouse}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            label="Tên Kho"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên kho' }]}
          >
            <Input placeholder="Nhập tên kho" />
          </Form.Item>
          <Form.Item
            label="Vĩ Độ (Latitude)"
            name="lat"
            rules={[{ required: true, message: 'Vui lòng nhập vĩ độ' }]}
          >
            <Input type="number" placeholder="Nhập vĩ độ hoặc chọn trên bản đồ" />
          </Form.Item>
          <Form.Item
            label="Kinh Độ (Longitude)"
            name="lng"
            rules={[{ required: true, message: 'Vui lòng nhập kinh độ' }]}
          >
            <Input type="number" placeholder="Nhập kinh độ hoặc chọn trên bản đồ" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={addingWarehouse}>
            Thêm Kho
          </Button>
        </Form>
      )}
    </Modal>
  );
};

export default WarehouseSelector;
