import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, DatePicker, InputNumber, Card, Row, Col, notification, Divider, Select, AutoComplete } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createTicket } from '../../services/TicketService';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import axios from 'axios';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

const { TextArea } = Input;
const { Option } = Select;

// Set up marker icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const provider = new OpenStreetMapProvider();

const AddressSearchInput = ({ form, field, mapRef }) => {
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState('');

  // Sync with form values
  useEffect(() => {
    const address = form.getFieldValue(['addresses', field.name, 'address']);
    setValue(address || '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.getFieldValue(['addresses', field.name, 'address'])]);

  const handleSearch = async (searchText) => {
    setValue(searchText);
    if (searchText.length > 2) {
      try {
        const results = await provider.search({ 
          query: `${searchText}, Vietnam`,
          countrycodes: 'vn'
        });
        setOptions(results.map(result => ({
          value: result.label,
          coordinates: [result.y, result.x]
        })));
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };

  const handleSelect = (selectedValue, option) => {
    setValue(selectedValue);
    const [lat, lng] = option.coordinates;

    // Update form values
    const addresses = form.getFieldValue('addresses') || [];
    addresses[field.name] = {
      ...addresses[field.name],
      address: selectedValue,
      latitude: lat,
      longitude: lng
    };
    form.setFieldsValue({ addresses });

    // Update map position and marker
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 15, {
        duration: 1.5
      });
      // Trigger map click event to update marker
      mapRef.current.fireEvent('click', { 
        latlng: { lat, lng }
      });
    }
  };

  return (
    <AutoComplete
      value={value}
      style={{ width: '100%' }}
      onSearch={handleSearch}
      onSelect={handleSelect}
      onChange={setValue}
      options={options.map(opt => ({
        label: opt.value,
        value: opt.value,
        coordinates: opt.coordinates
      }))}
      placeholder="Nhập địa chỉ để tìm kiếm..."
    />
  );
};

const LocationPoint = ({ form, field, mapRef }) => {
  const [position, setPosition] = useState(() => {
    const lat = form.getFieldValue(['addresses', field.name, 'latitude']);
    const lng = form.getFieldValue(['addresses', field.name, 'longitude']);
    return lat && lng ? [lat, lng] : null;
  });

  // Watch for form value changes
  useEffect(() => {
    const lat = form.getFieldValue(['addresses', field.name, 'latitude']);
    const lng = form.getFieldValue(['addresses', field.name, 'longitude']);
    if (lat && lng) {
      setPosition([lat, lng]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.getFieldValue(['addresses', field.name])]);

  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      try {
        const response = await axios.get(
          'https://nominatim.openstreetmap.org/reverse',
          {
            params: {
              lat,
              lon: lng,
              format: 'json',
              'accept-language': 'vi'
            },
          }
        );

        const address = response.data.address;
        const houseNumber = address.house_number || '';
        const road = address.road || '';
        const ward = address.suburb || address.neighbourhood || '';
        const district = address.city_district || address.district || '';
        const city = address.city || address.town || address.village || address.state || '';
        const formattedAddress = [houseNumber, road, ward, district, city].filter(Boolean).join(', ');

        // Update form values
        const addresses = form.getFieldValue('addresses') || [];
        addresses[field.name] = {
          ...addresses[field.name],
          address: formattedAddress,
          latitude: lat,
          longitude: lng
        };
        form.setFieldsValue({ addresses });
      } catch (error) {
        console.error('Error fetching address:', error);
        notification.error({
          message: 'Error',
          description: 'Không thể lấy địa chỉ cho vị trí này'
        });
      }
    }
  });

  useEffect(() => {
    if (map) {
      mapRef.current = map;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return position ? <Marker position={position} /> : null;
};

const TicketCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const mapRefs = useRef({});

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await createTicket(values);
      notification.success({
        message: 'Success',
        description: 'Tạo chuyến vận chuyển thành công'
      });
      form.resetFields();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to create ticket'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Tạo chuyến vận chuyển" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            containerType: 0,
            addresses: [{}, {}]
          }}
        >
          {/* Basic Information Fields */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Ngày vận chuyển"
                name="deliveryDate"
                rules={[{ required: true, message: 'Hãy nhập ngày vận chuyển' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Khách hàng"
                name="customer"
                rules={[{ required: true, message: 'Hãy nhập tên khách hàng' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Số cont"
                name="countCode"
                rules={[{ required: true, message: 'Hãy nhập số cont' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Loại vỏ"
                name="shellType"
                rules={[{ required: false, message: 'Hãy nhập loại vỏ' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Loại container"
                name="containerType"
                rules={[{ required: true, message: 'Hãy chọn loại container' }]}
              >
                <Select>
                  <Option value={0}>20ft</Option>
                  <Option value={1}>40ft</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Chủ container"
                name="containerOwner"
                rules={[{ required: false, message: 'Hãy nhập tên chủ container' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Loại chuyến"
                name="type"
                rules={[{ required: true, message: 'Hãy chọn loại' }]}
              >
                <Select>
                  <Option value={0}>Đóng hàng</Option>
                  <Option value={1}>Giao hàng nhập</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Tên tàu/chuyến"
                name="ship"
                rules={[{ required: false, message: 'Hãy nhập tên tàu/chuyến' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Ghi chú"
                name="note"
              >
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Địa chỉ các điểm đi</Divider>

          <Form.List name="addresses">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => {
                  if (!mapRefs.current[field.key]) {
                    mapRefs.current[field.key] = { current: null };
                  }
                  
                  return (
                    <Card
                      key={field.key}
                      title={`Điểm ${index + 1}`}
                      style={{ marginBottom: 16 }}
                      extra={
                        fields.length > 1 && (
                          <Button type="link" onClick={() => remove(field.name)}>
                            Remove
                          </Button>
                        )
                      }
                    >
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            {...field}
                            label="Địa chỉ"
                            name={[field.name, 'address']}
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ hoặc chọn trên bản đồ' }]}
                          >
                            <AddressSearchInput 
                              form={form} 
                              field={field} 
                              mapRef={mapRefs.current[field.key]} 
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...field}
                            label="Latitude"
                            name={[field.name, 'latitude']}
                            rules={[{ required: true, message: 'Vui lòng chọn địa điểm' }]}
                          >
                            <InputNumber style={{ width: '100%' }} readOnly />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...field}
                            label="Longitude"
                            name={[field.name, 'longitude']}
                            rules={[{ required: true, message: 'Vui lòng chọn địa điểm' }]}
                          >
                            <InputNumber style={{ width: '100%' }} readOnly />
                          </Form.Item>
                        </Col>
                      </Row>
                      <div style={{ height: '300px', marginBottom: '16px' }}>
                        <MapContainer 
                          center={[21.0067, 105.8455]} 
                          zoom={13} 
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <LocationPoint 
                            form={form} 
                            field={field} 
                            mapRef={mapRefs.current[field.key]} 
                          />
                        </MapContainer>
                      </div>
                    </Card>
                  );
                })}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm địa chỉ
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ marginTop: 16 }}>
              Tạo chuyến vận chuyển
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TicketCreatePage;