import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Row,
  Col,
  Space,
  Image,
  Alert,
  Input,
  Button,
  Select,
  InputNumber,
  Form,
  message,
  Modal,
  notification,
  List,
  Avatar,
} from 'antd';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import styled from '@emotion/styled';
import L from 'leaflet';
import axios from 'axios';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import {
  getVehicleById,
  linkDriverToVehicle,
  updateVehicle,
  deleteVehicle,
  getDriverByVehicleId,
  unlinkDriverFromVehicle,
} from '../../services/VehicleService';
import { getAllDrivers } from '../../services/DriverService';
import LoadingPage from '../../components/loading/LoadingPage';
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
  const [address, setAddress] = useState('');
  const [driver, setDriver] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  const [errorDriver, setErrorDriver] = useState(null);
  const [listDrivers, setlistDrivers] = useState([]);
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
          headRegExpiry: formatDate(response.data.headRegExpiry),
          moocRegExpiry: formatDate(response.data.moocRegExpiry),
        });
      } catch (error) {
        setError('Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, form]);
  useEffect(() => {
    const fetchDriver = async () => {
      setErrorDriver(null);
      try {
        const result = await getDriverByVehicleId(id);
        setDriver(result.data);
      } catch (error) {
        setErrorDriver(error.message);
      } finally {
      }
    };
    if (vehicle && vehicle.hasDriver === 1) {
      fetchDriver();
    }
  }, [vehicle, id]);
  useEffect(() => {
    const fetchlistDrivers = async () => {
      try {
        const listDrivers = await getAllDrivers();
        const availablelistDrivers = listDrivers.filter(
          (d) => d.hasVehicle === 0,
        );
        setlistDrivers(availablelistDrivers);
      } catch (error) {
        console.error('Error fetching listdrivers:', error);
      }
    };
    if (vehicle && vehicle.hasDriver === 0) {
      fetchlistDrivers();
    }
  }, [vehicle]);

  const handleDeliver = async () => {
    if (!selectedDriverId) {
      message.warning('Vui lòng chọn một tài xế trước khi giao xe!');
      return;
    }

    try {
      const vehicleId = vehicle._id;
      const result = await linkDriverToVehicle(selectedDriverId, vehicleId);

      if (result.status !== 'ERR') {
        message.success('Giao xe thành công!');
        window.location.reload();
      } else {
        message.error(`Giao xe thất bại: ${result.message}`);
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi giao xe');
    }
  };
  const GeocodeAPI = async (lat, lng) => {
    try {
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/reverse',
        {
          params: {
            lat,
            lon: lng,
            format: 'json',
          },
        },
      );
      const address = response.data.address;
      const ward = address.suburb || address.neighbourhood || '';
      const district = address.city_district || address.district || '';
      const city =
        address.city || address.town || address.village || address.state || '';
      return [ward, district, city].filter(Boolean).join(', ');
    } catch (error) {
      console.error('Error fetching address:', error);
      return '';
    }
  };

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
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setLocation({ lat, lng });
        form.setFieldsValue({ lat, long: lng });

        const fetchedAddress = await GeocodeAPI(lat, lng);
        setAddress(fetchedAddress);
        form.setFieldsValue({ address: fetchedAddress });
      },
    });
    return null;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      setVehicle({
        ...updatedData,
        location: { lat: location.lat, long: location.lng },
      });
    } catch (error) {
      message.error(
        'Cập nhật thất bại: ' +
          (error.response?.data?.message || error.message),
      );
    }
  };
  const handleDriverSelect = (driverId) => {
    setSelectedDriverId(driverId);
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
      message.error(
        'Xóa xe thất bại: ' + (error.response?.data?.message || error.message),
      );
    }
  };
  const handleUnlink = async () => {
    try {
      const vehicleId = vehicle._id;
      const driverId = driver._id;

      const result = await unlinkDriverFromVehicle(driverId, vehicleId);

      if (result.status !== 'ERR') {
        message.success('Hủy giao xe thành công!');
        window.location.reload();
      } else {
        message.error(`Hủy giao xe thất bại: ${result.message}`);
      }
    } catch (error) {
      console.error('Error unlinking:', error);
      message.error('Đã xảy ra lỗi khi hủy giao xe');
    }
  };

  if (errorDriver) {
    return (
      <Alert message='Error' description={errorDriver} type='error' showIcon />
    );
  }

  if (loading) {
    return (
      <PageWrapper>
        <LoadingPage />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Alert message='Error' description={error} type='error' showIcon />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Row gutter={[16, 16]} justify='space-between' align='middle'>
        <Col>
          <Typography.Title level={2}>Thông tin xe</Typography.Title>
        </Col>
        <Col>
          {!isEditing ? (
            <Space>
              <Button type='primary' onClick={handleEdit} size='large'>
                Chỉnh sửa thông tin
              </Button>
              <Button
                type='primary'
                danger
                onClick={showDeleteModal}
                size='large'
              >
                Xóa xe
              </Button>
            </Space>
          ) : (
            <Space>
              <Button onClick={handleCancel} size='large'>
                Hủy
              </Button>
              <Button type='primary' onClick={form.submit} size='large'>
                Lưu thay đổi
              </Button>
            </Space>
          )}
        </Col>
      </Row>
      <Row gutter={[24, 24]}>
        <Col span={18}>
          <Form form={form} onFinish={handleSubmit} layout='vertical'>
            {/* Thông tin cơ bản */}
            <Card
              title={
                <div style={{ textAlign: 'center' }}>Thông tin cơ bản</div>
              }
              bordered={false}
              style={{ marginBottom: '20px' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card
                    title='Thông tin Đầu Kéo'
                    bordered={false}
                    style={{ marginBottom: '20px' }}
                  >
                    <Form.Item
                      label='Biển số đầu kéo'
                      name='headPlate'
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng nhập biển số đầu kéo',
                        },
                      ]}
                    >
                      <Input readOnly={!isEditing} size='large' />
                    </Form.Item>
                    <Form.Item
                      label='Mã đăng ký đầu kéo'
                      name='headRegCode'
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng nhập mã đăng ký đầu kéo',
                        },
                      ]}
                    >
                      <Input readOnly={!isEditing} size='large' />
                    </Form.Item>

                    <Form.Item
                      label='Ngày hết hạn đăng ký'
                      name='headRegExpiry'
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng chọn ngày hết hạn đăng ký',
                        },
                      ]}
                    >
                      <Input readOnly={!isEditing} type='date' size='large' />
                    </Form.Item>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    title='Thông tin Rơ Moóc'
                    bordered={false}
                    style={{ marginBottom: '20px' }}
                  >
                    <Form.Item
                      label='Biển số rơ moóc'
                      name='moocPlate'
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng nhập biển số rơ moóc',
                        },
                      ]}
                    >
                      <Input readOnly={!isEditing} size='large' />
                    </Form.Item>

                    <Form.Item
                      label='Mã đăng ký rơ moóc'
                      name='moocRegCode'
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng nhập mã đăng ký rơ moóc',
                        },
                      ]}
                    >
                      <Input readOnly={!isEditing} size='large' />
                    </Form.Item>

                    <Form.Item
                      label='Ngày hết hạn đăng ký'
                      name='moocRegExpiry'
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng chọn ngày hết hạn đăng ký',
                        },
                      ]}
                    >
                      <Input
                        readOnly={!isEditing}
                        type='date'
                        size='large'
                        value={formatDate(vehicle.moocRegExpiry)}
                      />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Thông tin kỹ thuật */}
            <Card
              title='Thông tin kỹ thuật'
              bordered={false}
              style={{ marginBottom: '20px' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Form.Item
                    label='Năm mua xe'
                    name='purchase_year'
                    rules={[
                      { required: true, message: 'Vui lòng nhập năm mua xe' },
                    ]}
                  >
                    <InputNumber
                      readOnly={!isEditing}
                      placeholder='Nhập năm mua xe'
                      min={0}
                      style={{ width: '100%' }}
                      size='large'
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    readOnly={!isEditing}
                    label='Trọng lượng (tấn)'
                    name='weight'
                    rules={[
                      { required: true, message: 'Vui lòng nhập trọng lượng' },
                    ]}
                  >
                    <InputNumber
                      readOnly={!isEditing}
                      placeholder='Nhập trọng lượng'
                      min={0}
                      style={{ width: '100%' }}
                      size='large'
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label='Loại rơ moóc'
                    name='moocType'
                    rules={[
                      { required: true, message: 'Vui lòng chọn loại rơ moóc' },
                    ]}
                  >
                    <Select placeholder='Chọn loại rơ moóc' size='large'>
                      <Option value={0}>20''</Option>
                      <Option value={1}>40''</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Ảnh */}
            <Card title='Ảnh' bordered={false} style={{ marginBottom: '20px' }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    label='URL Ảnh'
                    name='imageUrl'
                    rules={[
                      { type: 'url', message: 'Vui lòng nhập URL hợp lệ' },
                    ]}
                  >
                    <Input
                      readOnly={!isEditing}
                      size='large'
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </Form.Item>
                  {imageUrl && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '10px',
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt='Vehicle'
                        style={{
                          width: '100%',
                          maxWidth: '300px',
                          maxHeight: '300px',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}
                </Col>
              </Row>
            </Card>

            {/* Vị trí */}
            <Card title='Vị trí' bordered={false}>
              <Form.Item
                label='Địa chỉ'
                name='address'
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <Input
                  placeholder='Chọn địa chỉ từ bản đồ'
                  size='large'
                  value={address}
                  readOnly
                />
              </Form.Item>

              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div style={{ marginBottom: '16px' }}>
                    {isEditing && (
                      <Text>Click trên bản đồ để cập nhật vị trí</Text>
                    )}
                  </div>
                  <MapContainer
                    readOnly={!isEditing}
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
                  <Form.Item label='Latitude' name='lat'>
                    <Input
                      placeholder='Latitude'
                      value={location.lat}
                      readOnly
                      size='large'
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='Longitude' name='long'>
                    <Input
                      placeholder='Longitude'
                      value={location.lng}
                      readOnly
                      size='large'
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Form>
        </Col>
        <Col span={6}>
          {/*Xử lý lái xe*/}
          <Card
            title={
              vehicle.hasDriver === 1
                ? 'Thông tin tài xế của xe'
                : 'Danh sách các lái xe'
            }
            bordered={false}
          >
            {vehicle.hasDriver === 1 ? (
              driver && (
                <Card>
                  <Space align='center'>
                    <Avatar size={64} src={driver.avatar} />
                    <div>
                      <Typography.Text strong>{driver.name}</Typography.Text>
                      <br />
                      <Typography.Text type='secondary'>
                        {driver.phone}
                      </Typography.Text>
                      <br />
                    </div>
                  </Space>
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Button
                      type='primary'
                      danger
                      onClick={handleUnlink}
                      disabled={!vehicle || vehicle.hasDriver === 0}
                    >
                      Hủy giao xe
                    </Button>
                  </div>
                </Card>
              )
            ) : (
              <div>
                <List
                  itemLayout='horizontal'
                  dataSource={listDrivers}
                  renderItem={(listDrivers) => (
                    <List.Item
                      key={listDrivers._id}
                      onClick={() => handleDriverSelect(listDrivers._id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor:
                          selectedDriverId === listDrivers._id
                            ? '#f0f0f0'
                            : 'transparent',
                      }}
                    >
                      <List.Item.Meta
                        avatar={<Avatar size={64} src={listDrivers.avatar} />}
                        title={
                          <Typography.Text strong>
                            {listDrivers.name}
                          </Typography.Text>
                        }
                        description={
                          <Typography.Text type='secondary'>
                            {listDrivers.phone}
                          </Typography.Text>
                        }
                      />
                    </List.Item>
                  )}
                />
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <Button type='primary' onClick={handleDeliver}>
                    Giao xe
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
      <Modal
        title='Xác nhận xóa xe'
        visible={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={handleDeleteCancel}
        okText='Xóa'
        cancelText='Hủy'
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
