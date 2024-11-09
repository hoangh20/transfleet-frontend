import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Row,
  Col,
  Space,
  Image,
  Spin,
  Alert,
  Input,
  Slider,
  Button,
  Select,
  InputNumber,
  Form,
  message,
  Modal,
  notification
} from 'antd';
import { IoMdCar } from 'react-icons/io';
import { MdEmojiTransportation } from 'react-icons/md';
import { BsFillCalendarFill, BsCashStack } from 'react-icons/bs';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import styled from '@emotion/styled';
import L from 'leaflet';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { getVehicleById, updateVehicle, deleteVehicle } from '../../services/VehicleService';

const { Text } = Typography;
const { Option } = Select;

const VehicleDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const statusLabels = ['Đang rảnh', 'Đang thực hiện chuyến', 'Bảo dưỡng', 'Không còn sử dụng'];
  const typeLabels = ['Xe đầu kéo', 'Rơ moóc'];

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getVehicleById(id);
        setVehicle(response.data);
        setLocation({
          lat: response.data.location.lat,
          lng: response.data.location.long,
        });
        setImageUrl(response.data.imageUrl);
        form.setFieldsValue({
          ...response.data,
          lat: response.data.location.lat,
          lng: response.data.location.long,
        });
      } catch (error) {
        setError('Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, form]);

  const markerIcon = new L.Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (isEditing) {
          setLocation(e.latlng);
          form.setFieldsValue({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          });
        }
      },
    });
    return null;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.setFieldsValue({
      ...vehicle,
      lat: vehicle.location.lat,
      lng: vehicle.location.long,
    });
    setLocation({
      lat: vehicle.location.lat,
      lng: vehicle.location.long,
    });
    setImageUrl(vehicle.imageUrl);
  };

  const handleSubmit = async (values) => {
    try {
      const updatedData = {
        ...values,
        location: {
          lat: location.lat,
          long: location.lng,
        },
        imageUrl: imageUrl,
      };
      await updateVehicle(id, updatedData);
      message.success('Cập nhật thông tin xe thành công!');
      setIsEditing(false);
      setVehicle({ ...updatedData, location: { lat: location.lat, long: location.lng } });
    } catch (error) {
      message.error('Cập nhật thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  const showDeleteModal = () => {
    setIsDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
  };

  const handleDelete = async () => {
    try {
      await deleteVehicle(vehicle._id);
      setIsDeleteModalVisible(false);
      notification.success({
        message: 'Xóa xe thành công',
        description: 'Xe đã được xóa khỏi hệ thống.',
      });
      navigate('/vehicle/list');
    } catch (error) {
      message.error('Xóa xe thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Spin tip="Loading vehicle details..." />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Alert message="Error" description={error} type="error" showIcon />
      </PageWrapper>
    );
  }
  
  return (
    <PageWrapper>
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col>
          <Typography.Title level={2}>Thông tin xe</Typography.Title>
        </Col>
        <Col>
          {!isEditing ? (
            <Space>
              <Button type="primary" onClick={handleEdit} size="large">
                Chỉnh sửa thông tin
              </Button>
              <Button type="primary" danger onClick={showDeleteModal} size="large">
                Xóa xe
              </Button>
            </Space>
          ) : (
            <Space>
              <Button onClick={handleCancel} size="large">
                Hủy
              </Button>
              <Button type="primary" onClick={form.submit} size="large">
                Lưu thay đổi
              </Button>
            </Space>
          )}
        </Col>
      </Row>

      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        {/* Thông tin cơ bản */}
        <Card
          title="Thông tin cơ bản"
          bordered={false}
          style={{ marginBottom: '20px' }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    <IoMdCar size={20} /> Biển số xe
                  </Space>
                }
                name="licensePlate"
                rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
              >
                <Input readOnly={!isEditing} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    <MdEmojiTransportation size={20} /> Hãng xe
                  </Space>
                }
                name="brand"
                rules={[{ required: true, message: 'Vui lòng nhập hãng xe' }]}
              >
                <Input readOnly={!isEditing} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
            <Form.Item
              label={
                <Space>
                  <BsFillCalendarFill size={20} /> Loại xe
                </Space>
              }
              name="type"
              rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
            >
              {isEditing ? (
                <Select size="large">
                  <Option value={0}>Xe đầu kéo</Option>
                  <Option value={1}>Rơ moóc</Option>
                </Select>
              ) : (
                <Input
                  readOnly
                  value={typeLabels[vehicle.type] || 'Không xác định'}
                  size="large"
                />
              )}
            </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    <BsFillCalendarFill size={20} /> Trạng thái xe
                  </Space>
                }
                name="status"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái xe' }]}
              >
                {isEditing ? (
                  <Select size="large">
                    <Option value={0}>Đang rảnh</Option>
                    <Option value={1}>Đang thực hiện chuyến</Option>
                    <Option value={2}>Bảo dưỡng</Option>
                    <Option value={3}>Không còn sử dụng</Option>
                  </Select>
                ) : (
                  <Input readOnly value={statusLabels[vehicle.status] || 'Không xác định'} size="large" />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label={
                  <Space>
                    <BsCashStack size={20} /> Giá mua
                  </Space>
                }
                name="purchasePrice"
                rules={[{ required: true, message: 'Vui lòng nhập giá mua' }]}
              >
                {isEditing ? (
                  <InputNumber
                    style={{ width: '100%' }}
                    size="large"
                    formatter={value => `${value} VND`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\s?VND\s?|(,*)/g, '')}
                  />
                ) : (
                  <Input
                    readOnly
                    value={`${vehicle.purchasePrice.toLocaleString()} ` }
                    size="large"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin kỹ thuật */}
        <Card
          title="Thông tin kỹ thuật"
          bordered={false}
          style={{ marginBottom: '20px' }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    <BsCashStack size={20} /> Thông số kỹ thuật
                  </Space>
                }
                name="technicalSpecifications"
                rules={[{ required: true, message: 'Vui lòng nhập thông số kỹ thuật' }]}
              >
                <Input readOnly={!isEditing} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Độ mới của xe"
                name="depreciationRate"
                rules={[{ required: true, message: 'Vui lòng chọn độ mới của xe' }]}
              >
                <Slider
                  min={0}
                  max={100}
                  disabled={!isEditing}
                  marks={{
                    0: 'Cũ',
                    100: 'Mới',
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Ảnh */}
        <Card title="Ảnh" bordered={false} style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="URL Ảnh"
                name="imageUrl"
                rules={[{ type: 'url', message: 'Vui lòng nhập URL hợp lệ' }]}
              >
                <Input
                  readOnly={!isEditing}
                  size="large"
                  onChange={e => setImageUrl(e.target.value)}
                />
              </Form.Item>
              {imageUrl && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                  <Image
                    src={imageUrl}
                    alt="Vehicle"
                    style={{ width: '100%', maxWidth: '300px', maxHeight: '300px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </Col>
          </Row>
        </Card>

        {/* Vị trí */}
        <Card title="Vị trí" bordered={false}>
          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input readOnly={!isEditing} size="large" />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div style={{ marginBottom: '16px' }}>
                {isEditing && <Text>Click trên bản đồ để cập nhật vị trí</Text>}
              </div>
              <MapContainer
                center={location}
                zoom={13}
                style={{ height: '350px', width: '100%' }}
              >
                <TileLayer
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  attribution='&copy; OpenStreetMap contributors'
                />
                <MapClickHandler />
                <Marker position={location} icon={markerIcon} />
              </MapContainer>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Form.Item label="Latitude" name="lat">
                <Input readOnly size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Longitude" name="lng">
                <Input readOnly size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
      <Modal
        title="Xác nhận xóa xe"
        visible={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        centered
      >
        <p>Bạn có chắc chắn muốn xóa xe này?</p>
      </Modal>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

export default VehicleDetailPage;