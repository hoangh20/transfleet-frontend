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
  Image,
  message,
} from 'antd';

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
  const [imageUrl, setImageUrl] = useState('');
  const [address, setAddress] = useState('');

  const onFinish = async (values) => {
    try {
      const {
        headPlate,
        headRegCode,
        headRegExpiry,
        moocPlate,
        moocRegCode,
        moocRegExpiry,
        moocType,
        depreciationRate,
        weight,
        hasDriver,
        address,
      } = values;

      if (!location || !location.lat || !location.lng) {
        message.error('Vui lòng chọn vị trí trên bản đồ');
        return;
      }

      const vehicleData = {
        headPlate,
        headRegCode,
        headRegExpiry,
        moocPlate,
        moocRegCode,
        moocRegExpiry,
        moocType,
        depreciationRate,
        weight,
        hasDriver,
        address,
        location: {
          lat: location.lat,
          long: location.lng,
        },
        imageUrl,
      };

      const response = await createVehicle(vehicleData);
      console.log('Vehicle created successfully:', response);
      form.resetFields();
      message.success('Tạo xe mới thành công!');
    } catch (error) {
      message.error(
        'Tạo xe thất bại: ' + (error.response?.data?.message || error.message),
      );
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

      const formattedAddress = [ward, district, city]
        .filter(Boolean)
        .join(', ');

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
          title={<div style={{ textAlign: 'center' }}>Thông tin cơ bản</div>}
          bordered={false}
          style={{ marginBottom: '20px' }}
        >
          <Row gutter={[16, 16]}>
            {/* Đầu Kéo Section */}
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
                  <Input placeholder='Nhập biển số đầu kéo' size='large' />
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
                  <Input placeholder='Nhập mã đăng ký đầu kéo' size='large' />
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
                  <Input
                    placeholder='Chọn ngày hết hạn'
                    type='date'
                    size='large'
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* Rơ Moóc Section */}
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
                  <Input placeholder='Nhập biển số rơ moóc' size='large' />
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
                  <Input placeholder='Nhập mã đăng ký rơ moóc' size='large' />
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
                    placeholder='Chọn ngày hết hạn'
                    type='date'
                    size='large'
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
                  { required: true, message: 'Vui lòng nhập năm mua' },
                ]}
              >
                <InputNumber
                  placeholder='Nhập năm mua'
                  min={0}
                  style={{ width: '100%' }}
                  size='large'
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label='Trọng lượng (tấn)'
                name='weight'
                rules={[
                  { required: true, message: 'Vui lòng nhập trọng lượng' },
                ]}
              >
                <InputNumber
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
          <Form.Item
            label='URL Ảnh'
            name='imageUrl'
            rules={[{ type: 'url', message: 'Vui lòng nhập URL hợp lệ' }]}
          >
            <Input
              placeholder='Nhập URL của ảnh'
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
                alt='Preview'
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  maxHeight: '300px',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
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
              <Form.Item label='Vị trí trên bản đồ'>
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
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
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

        <Form.Item>
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col span={12}>
              <Button
                type='primary'
                htmlType='submit'
                style={{ width: '100%', height: '48px', fontSize: '16px' }}
              >
                Thêm xe
              </Button>
            </Col>
            <Col span={12}>
              <Button
                type='default'
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
