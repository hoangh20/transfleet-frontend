import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Spin } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons'; 

const vehicleIcon = new L.Icon({
  iconUrl: '/icons8-semi-truck-side-view-100.png',
  iconSize: [40, 40],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const VehicleMap = ({ vehicles, loading, onPreview }) => {
  return (
    <div style={{ height: '500px', width: '100%' }}>
      {loading ? (
        <Spin tip="Đang tải bản đồ..." />
      ) : (
        <MapContainer center={[21.028511, 105.804817]} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {vehicles.map((vehicle, index) => (
            <Marker
              key={index}
              position={[vehicle.Lt, vehicle.Ln]}
              icon={vehicleIcon}
            >
              {/* Tooltip hiển thị biển số xe */}
              <Tooltip direction="bottom" offset={[0, -5]} opacity={1} permanent>
                <span>{vehicle.NumberPlate || 'Không xác định'}</span>
              </Tooltip>
              <Popup>
                <div>
                  <strong>Biển số:</strong> {vehicle.NumberPlate || 'Không xác định'} <br />
                  <strong>Tài xế:</strong> {vehicle.DriverName || 'Không xác định'} <br />
                  <strong>Tốc độ:</strong> {vehicle.Speed} km/h <br />
                  <strong>Địa chỉ:</strong> {vehicle.Address || 'Không xác định'}{' '}
                  <a
                    href={`https://www.openstreetmap.org/search?lat=${vehicle.Lt}&lon=${vehicle.Ln}&zoom=14#map=11/${vehicle.Lt}/${vehicle.Ln}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: '8px' }}
                  >
                    <EnvironmentOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                  </a>
                  <br />
                  <img
                    src={vehicle.ImageLink}
                    alt="Hình ảnh xe"
                    style={{ width: '100px', height: 'auto', marginTop: '8px' }}
                    onClick={() => onPreview(vehicle.ImageLink)}
                  />
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default VehicleMap;