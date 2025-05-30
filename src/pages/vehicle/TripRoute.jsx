import React, { useEffect, useState } from 'react';
import { Card, List, Spin, Input, Checkbox, Tag, DatePicker, Button, message } from 'antd';
import { getVehicleLocations, getAllVehicles, getTripInfoFromBK } from '../../services/VehicleService';
import { MapContainer, TileLayer, Marker, Tooltip, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const vehicleIcon = new L.Icon({
  iconUrl: '/icons8-semi-truck-side-view-100.png',
  iconSize: [40, 40],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const stopIcon = new L.Icon({
  iconUrl: '/icons8-marker-p-50.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});
const startEndIcon = new L.Icon({
  iconUrl: '/location-pin.png', 
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const TripRoute = () => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleList, setVehicleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedPlate, setSelectedPlate] = useState(null);
  const [tripInfo, setTripInfo] = useState(null);
  const [dateRange, setDateRange] = useState([dayjs().startOf('day'), dayjs().endOf('day')]);
  const [tripLoading, setTripLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const locationsRes = await getVehicleLocations();
        const allVehiclesRes = await getAllVehicles(1, 100);
        setVehicles(locationsRes.data?.data || []);
        setVehicleList(allVehiclesRes.data || []);
      } catch (error) {
        setVehicles([]);
        setVehicleList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredVehicles = vehicleList.filter(
    (item) =>
      !filter ||
      (item.headPlate && item.headPlate.toLowerCase().includes(filter.toLowerCase()))
  );
  const filteredNumberPlates = filteredVehicles.map((v) => v.headPlate);

  const visibleVehicles = vehicles.filter(
    (vehicle) =>
      (!filter ||
        (vehicle.NumberPlate &&
          filteredNumberPlates.some(
            (plate) =>
              plate &&
              vehicle.NumberPlate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ===
                plate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
          ))) &&
      (!selectedPlate ||
        (vehicle.NumberPlate &&
          vehicle.NumberPlate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ===
            selectedPlate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()))
  );

  const selectedVehicleObj = vehicleList.find(
    (v) =>
      selectedPlate &&
      v.headPlate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ===
        selectedPlate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  );
  const selectedVehicleLocation = vehicles.find(
    (v) =>
      selectedPlate &&
      v.NumberPlate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ===
        selectedPlate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  );

  const handleFetchTripInfo = async () => {
    if (!selectedVehicleObj) return;
    setTripLoading(true);
    try {
      const datefrom = dateRange[0].format('HH-mm_DD-MM-YYYY');
      const dateto = dateRange[1].format('HH-mm_DD-MM-YYYY');
      const data = await getTripInfoFromBK({
        vehicleId: selectedVehicleObj._id,
        datefrom,
        dateto,
      });
      setTripInfo(data);
    } catch (error) {
      message.error('Không thể lấy thông tin chuyến xe');
      setTripInfo(null);
    } finally {
      setTripLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedPlate(null);
    setTripInfo(null);
    setDateRange([dayjs().startOf('day'), dayjs().endOf('day')]);
  };

  const tripPoints = Array.isArray(tripInfo?.data)
    ? tripInfo.data.filter(p => p.Lt && p.Ln)
    : [];


  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <div style={{ flex: 2, minWidth: 0 }}>
        <Card title="Bản đồ phương tiện" style={{ height: '100%' }}>
          {loading ? (
            <Spin />
          ) : (
            <MapContainer
              center={
                selectedPlate && tripPoints.length
                  ? [tripPoints[0].Lt, tripPoints[0].Ln]
                  : selectedVehicleLocation
                  ? [selectedVehicleLocation.Lt, selectedVehicleLocation.Ln]
                  : [21.028511, 105.804817]
              }
              zoom={selectedPlate ? 13 : 10}
              style={{ height: '70vh', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {selectedPlate && tripPoints.length > 1 && (
                <Polyline
                  positions={tripPoints.map(p => [p.Lt, p.Ln])}
                  color="blue"
                  weight={4}
                />
              )}
              {selectedPlate && tripPoints.length > 0 && (
                <Marker
                  position={[tripPoints[0].Lt, tripPoints[0].Ln]}
                  icon={startEndIcon}
                >
                  <Popup>
                    <div>
                      <strong>Thời gian:</strong> {tripPoints[0].Date || '--'} <br />
                      <strong>Địa chỉ:</strong> {tripPoints[0].Address || '--'}
                    </div>
                  </Popup>
                </Marker>
              )}
              {selectedPlate && tripPoints.length > 1 && (
                <Marker
                  position={[tripPoints[tripPoints.length - 1].Lt, tripPoints[tripPoints.length - 1].Ln]}
                  icon={startEndIcon}
                >
                  <Popup>
                    <div>
                      <strong>Thời gian:</strong> {tripPoints[tripPoints.length - 1].Date || '--'} <br />
                      <strong>Địa chỉ:</strong> {tripPoints[tripPoints.length - 1].Address || '--'}
                    </div>
                  </Popup>
                </Marker>
              )}
              {selectedPlate && (() => {
                const grouped = [];
                let current = null;
                tripPoints.forEach((p, idx) => {
                    if (p.CarStatus === 'Đỗ') {
                    const key = `${p.Lt?.toFixed(5)}_${p.Ln?.toFixed(5)}`;
                    if (
                        current &&
                        current.key === key
                    ) {
                        current.end = p;
                        current.count++;
                    } else {
                        if (current) grouped.push(current);
                        current = {
                        key,
                        start: p,
                        end: p,
                        count: 1,
                        };
                    }
                    } else if (current) {
                    grouped.push(current);
                    current = null;
                    }
                });
                if (current) grouped.push(current);

                return grouped.map((g, idx) => {
                    const t1 = dayjs(g.start.Date, 'HH:mm:ss DD-MM-YYYY');
                    const t2 = dayjs(g.end.Date, 'HH:mm:ss DD-MM-YYYY');
                    const stopDuration = t2.diff(t1, 'minute');
                    return (
                    <Marker
                        key={`stop-${idx}`}
                        position={[g.start.Lt, g.start.Ln]}
                        icon={stopIcon}
                    >
                        <Popup>
                        <div>
                            <strong>Biển số:</strong> {g.start.NumberPlate || 'Không xác định'} <br />
                            <strong>Tài xế:</strong> {g.start.DriverName || 'Không xác định'} <br />
                            <strong>Thời gian bắt đầu dừng:</strong> {g.start.Date || '--'} <br />
                            <strong>Địa chỉ:</strong> {g.start.Address || '--'} <br />
                            <strong>Số lần dừng liên tiếp:</strong> {g.count} <br />
                            <strong>Thời gian dừng:</strong> {stopDuration} phút
                        </div>
                        </Popup>
                    </Marker>
                    );
                });
                })()}
              {!selectedPlate &&
                visibleVehicles.map((vehicle, idx) => (
                  <Marker
                    key={idx}
                    position={[vehicle.Lt, vehicle.Ln]}
                    icon={vehicleIcon}
                  >
                    <Tooltip direction="bottom" offset={[0, -5]} opacity={1} permanent>
                      <span>{vehicle.NumberPlate || 'Không xác định'}</span>
                    </Tooltip>
                    <Popup>
                      <div>
                        <strong>Biển số:</strong> {vehicle.NumberPlate || 'Không xác định'} <br />
                        <strong>Tài xế:</strong> {vehicle.DriverName || 'Không xác định'} <br />
                        <strong>Tốc độ:</strong> {vehicle.Speed} km/h <br />
                        <strong>Thời gian lái trong ngày:</strong> {vehicle.DriverTimeInDay || 'Không xác định'} <br />
                        <strong>Thời gian lái trong tuần:</strong> {vehicle.DriverTimeInWeek || 'Không xác định'} <br />
                        <strong>Địa chỉ:</strong> {vehicle.Address || 'Không xác định'}{' '}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${vehicle.Lt},${vehicle.Ln}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: '8px' }}
                        >
                          <EnvironmentOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                        </a>
                        <br />
                        {vehicle.ImageLink && (
                          <img
                            src={vehicle.ImageLink}
                            alt="Hình ảnh xe"
                            style={{ width: '100px', height: 'auto', marginTop: '8px' }}
                          />
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          )}
        </Card>
      </div>
      <div style={{ flex: 1, minWidth: 320, maxWidth: 400, overflowY: 'auto', borderLeft: '1px solid #eee' }}>
        <Card
          title={selectedPlate ? "Thông tin xe" : "Danh sách xe"}
          style={{ height: '100%' }}
          extra={
            !selectedPlate && (
              <Input
                placeholder="Lọc theo biển số xe"
                allowClear
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{ width: 200 }}
              />
            )
          }
        >
          {!selectedPlate ? (
            <List
              loading={loading}
              dataSource={filteredVehicles}
              renderItem={(item) => {
                const cleanedPlate = item.headPlate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const checked =
                  selectedPlate &&
                  cleanedPlate === selectedPlate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

                const moocTypeTag =
                  item.moocType === 0 ? (
                    <Tag color="blue">20</Tag>
                  ) : (
                    <Tag color="geekblue">40</Tag>
                  );

                let statusTag;
                switch (item.status) {
                  case 0:
                    statusTag = <Tag color="success">Rảnh</Tag>;
                    break;
                  case 1:
                    statusTag = <Tag color="processing">Đang chạy</Tag>;
                    break;
                  case 2:
                    statusTag = <Tag color="warning">Bảo dưỡng</Tag>;
                    break;
                  default:
                    statusTag = <Tag color="default">Không sử dụng</Tag>;
                }

                return (
                  <List.Item>
                    <Checkbox
                      checked={checked}
                      onChange={() => setSelectedPlate(checked ? null : item.headPlate)}
                      style={{ marginRight: 8 }}
                    />
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong>{item.headPlate}</strong>
                          {moocTypeTag}
                          {statusTag}
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          ) : (
            <div>
              <Button onClick={handleBack} style={{ marginBottom: 16 }}>
                Quay lại danh sách xe
              </Button>
              <div style={{ marginBottom: 16 }}>
                <strong>Chọn khoảng thời gian:</strong>
                <RangePicker
                  showTime
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  style={{ marginLeft: 8 }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
                <Button
                  type="primary"
                  onClick={handleFetchTripInfo}
                  loading={tripLoading}
                  style={{ marginLeft: 8 }}
                  disabled={!dateRange[0] || !dateRange[1]}
                >
                  Xem lịch sử chuyến
                </Button>
              </div>
              {tripLoading ? (
                <Spin />
              ) : tripInfo && tripPoints.length > 0 ? (
                <div>
                  <strong>Thông tin chuyến xe:</strong>
                  <div style={{ margin: '8px 0' }}>
                    <b>Quãng đường đã đi:</b>{' '}
                    {(() => {
                      let distance = 0;
                      for (let i = 1; i < tripPoints.length; i++) {
                        const toRad = (v) => (v * Math.PI) / 180;
                        const R = 6371; // km
                        const dLat = toRad(tripPoints[i].Lt - tripPoints[i - 1].Lt);
                        const dLon = toRad(tripPoints[i].Ln - tripPoints[i - 1].Ln);
                        const lat1 = toRad(tripPoints[i - 1].Lt);
                        const lat2 = toRad(tripPoints[i].Lt);
                        const a =
                          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                          Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        distance += R * c;
                      }
                      return distance.toFixed(2) + ' km';
                    })()}
                  </div>
                  <div style={{ margin: '8px 0' }}>
                    <b>Thời gian di chuyển:</b>{' '}
                    {(() => {
                      let totalMove = 0;
                      for (let i = 1; i < tripPoints.length; i++) {
                        if (tripPoints[i - 1].CarStatus !== 'Đỗ' && tripPoints[i].CarStatus !== 'Đỗ') {
                          const t1 = dayjs(tripPoints[i - 1].Date, 'HH:mm:ss DD-MM-YYYY');
                          const t2 = dayjs(tripPoints[i].Date, 'HH:mm:ss DD-MM-YYYY');
                          totalMove += t2.diff(t1, 'second');
                        }
                      }
                      const hours = Math.floor(totalMove / 3600);
                      const minutes = Math.floor((totalMove % 3600) / 60);
                      const seconds = totalMove % 60;
                      return `${hours} giờ ${minutes} phút ${seconds} giây`;
                    })()}
                  </div>
                  
                </div>
              ) : (
                <div>Chọn khoảng thời gian và nhấn "Xem lịch sử chuyến" để xem thông tin chuyến xe.</div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TripRoute;