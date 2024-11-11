import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  Row,
  Col,
  Card,
  Typography,
  Space,
  Slider,
  Image,
  message,
} from 'antd';
import { IoMdCar } from 'react-icons/io';
import { MdEmojiTransportation } from 'react-icons/md';
import { BsFillCalendarFill, BsCashStack } from 'react-icons/bs';
import styled from '@emotion/styled';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { createVehicle } from '../../services/VehicleService';
import axios from 'axios';

const { Option } = Select;

const CreateCarPage = () => {
  const [form] = Form.useForm();
  const [location, setLocation] = useState({ lat: 21.0067, lng: 105.8455 });
  const [cardepreciationRate, setCardepreciationRate] = useState(50);
  const [imageUrl, setImageUrl] = useState('');
  const [address, setAddress] = useState('');

  const onFinish = async (values) => {
    try {
      const { licensePlate, brand, type, status, purchasePrice,depreciationRate,address, technicalSpecs } = values;
  
      if (!location || !location.lat || !location.lng) {
        message.error('Vui lòng chọn vị trí trên bản đồ');
        return;
      }
  
      const vehicleData = {
        licensePlate,
        brand,
        technicalSpecifications: technicalSpecs, 
        type,
        status,
        purchasePrice,
        address,
        depreciationRate,
        location: {
          lat: location.lat,
          long: location.lng,
        },
        imageUrl,
      };
  
      const response = await createVehicle(vehicleData); // Call the API function
      console.log('Vehicle created successfully:', response);
      form.resetFields();
      message.success('Tạo xe mới thành công!');
    } catch (error) {
      message.error('Tạo xe thất bại: ' + (error.response?.data?.message || error.message));
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

  const GeocodeAPI = async (lat, lng) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'json',
        },
      });
  
      const address = response.data.address;
      const ward = address.suburb || address.neighbourhood || '';
      const district = address.city_district || address.district || '';
      const city = address.city || address.town || address.village || address.state || '';
  
      const formattedAddress = [ward, district, city].filter(Boolean).join(', ');
  
      return formattedAddress;
    } catch (error) {
      console.error('Error fetching address:', error);
      return '';
    }
  };
  
  

  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setLocation({ lat, lng });
        form.setFieldsValue({ lat, long: lng });
        
        // Gọi API Geocoding và cập nhật địa chỉ
        const fetchedAddress = await GeocodeAPI(lat, lng);
        setAddress(fetchedAddress);
        form.setFieldsValue({ address: fetchedAddress });
      },
    });
    return null;
  };
  const handleReset = () => {
    form.resetFields();
    setLocation({ lat: 21.0067, lng: 105.8455 });
    setCardepreciationRate(50);
    setImageUrl('');
    setAddress('');
    message.info('Đã xóa tất cả thông tin');
  };

  return (
    <PageWrapper>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Typography.Title level={2}>Thêm thông tin xe</Typography.Title>
        </Col>
      </Row>

      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        initialValues={{ type: 0, status: 0 }}
      >
        {/* Thông tin cơ bản */}
        <Card
          title='Thông tin cơ bản'
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
                name='licensePlate'
                rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
              >
                <Input placeholder='Nhập biển số xe' size='large' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    <MdEmojiTransportation size={20} /> Hãng xe
                  </Space>
                }
                name='brand'
                rules={[{ required: true, message: 'Vui lòng nhập hãng xe' }]}
              >
                <Input placeholder='Nhập hãng xe' size='large' />
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
                name='type'
                rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
              >
                <Select placeholder='Chọn loại xe' size='large'>
                  <Option value={0}>Xe đầu kéo</Option>
                  <Option value={1}>Rơ moóc</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    <BsFillCalendarFill size={20} /> Trạng thái xe
                  </Space>
                }
                name='status'
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái xe' }]}
              >
                <Select placeholder='Chọn trạng thái xe' size='large'>
                  <Option value={0}>Đang rảnh</Option>
                  <Option value={1}>Đang thực hiện chuyến</Option>
                  <Option value={2}>Bảo dưỡng</Option>
                  <Option value={3}>Không còn sử dụng</Option>
                </Select>
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
                name='purchasePrice'
                rules={[{ required: true, message: 'Vui lòng nhập giá mua' }]}
              >
                <InputNumber
                  placeholder='Nhập giá mua'
                  min={0}
                  style={{ width: '100%' }}
                  size='large'
                  formatter={(value) =>
                    `${value} VND`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value.replace(/VND\s?|(,*)/g, '')}
                />
              </Form.Item>
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
            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    <BsCashStack size={20} /> Thông số kỹ thuật
                  </Space>
                }
                name='technicalSpecs'
                rules={[{ required: true, message: 'Vui lòng nhập thông số kỹ thuật' }]}
              >
                <Input placeholder='Nhập thông số kỹ thuật' size='large' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label='Độ mới của xe'
                name='depreciationRate'
                rules={[{ required: true, message: 'Vui lòng chọn độ mới của xe' }]}
              >
                <Slider
                  min={0}
                  max={100}
                  tooltipVisible
                  value={cardepreciationRate}
                  onChange={(value) => setCardepreciationRate(value)}
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
          <Form.Item
            label="URL Ảnh"
            name="imageUrl"
            rules={[{ type: 'url', message: 'Vui lòng nhập URL hợp lệ' }]}
          >
            <Input
              placeholder="Nhập URL của ảnh"
              size="large"
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </Form.Item>
          
          {imageUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <Image
                src={imageUrl}
                alt="Preview"
                style={{ width: '100%', maxWidth: '300px', maxHeight: '300px', objectFit: 'cover' }}
              />
            </div>
          )}
        </Card>

        {/* Vị trí */}
        <Card title="Vị trí" bordered={false}>
          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input placeholder="Chọn địa chỉ từ bản đồ" size="large" value={address} readOnly />
          </Form.Item>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label="Vị trí trên bản đồ">
                <MapContainer
                  center={location}
                  zoom={13}
                  style={{ height: '350px', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                  <MapClickHandler />
                  <Marker position={location} icon={markerIcon} />
                </MapContainer>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Latitude" name="lat">
                <Input placeholder="Latitude" value={location.lat} readOnly size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Longitude" name="long">
                <Input placeholder="Longitude" value={location.lng} readOnly size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Card>


        <Form.Item>
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col span={12}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: '100%', height: '48px', fontSize: '16px' }}
              >
                Thêm xe
              </Button>
            </Col>
            <Col span={12}>
            <Button
              type="default"
              onClick={handleReset}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                transition: 'background-color 0.3s ease',
              }}
            >
              Xóa thông tin
            </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

export default CreateCarPage;
