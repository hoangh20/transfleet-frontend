import React, { useState } from 'react';
import { Input, DatePicker, Row, Col } from 'antd';
import OrderTripCard from '../../components/card/OrderTripCard';
import moment from 'moment';

const { Search } = Input;

const trips = [
  {
    _id: '1',
    customerName: 'Công ty A',
    tripCode: 'TRIP001',
    departureDate: '2025-01-15T00:00:00.000Z',
    startPoint: 'Hà Nội',
    endPoint: 'Hồ Chí Minh',
    transportType: 'Đường bộ',
    containerNumber: 'DRYU121324567',
    status: 2, // Đang vận chuyển
  },
  {
    _id: '2',
    customerName: 'Công ty B',
    tripCode: 'TRIP002',
    departureDate: '2025-01-16T00:00:00.000Z',
    startPoint: 'Đà Nẵng',
    endPoint: 'Hải Phòng',
    transportType: 'Đường sắt',
    containerNumber: 'DRYU121324568',
    status: 1, // Hoàn thành
  },
  // Add more static trips as needed
];

const OrderTripListPage = () => {
  const [filteredTrips, setFilteredTrips] = useState(trips);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const handleViewDetail = (tripId) => {
    // Logic to view trip details
    alert(`Viewing details for trip ${tripId}`);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterTrips(value, selectedDate);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    filterTrips(searchTerm, date);
  };

  const filterTrips = (searchTerm, selectedDate) => {
    const filtered = trips.filter((trip) => {
      const matchesSearchTerm = trip.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = selectedDate
        ? moment(trip.departureDate).isSame(selectedDate, 'day')
        : true;
      return matchesSearchTerm && matchesDate;
    });
    setFilteredTrips(filtered);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={12}>
          <Search
            placeholder="Tìm kiếm theo tên khách hàng"
            onSearch={handleSearch}
            enterButton
          />
        </Col>
        <Col span={12}>
          <DatePicker onChange={handleDateChange} />
        </Col>
      </Row>
      {filteredTrips.map((trip) => (
        <OrderTripCard key={trip._id} trip={trip} onViewDetail={handleViewDetail} />
      ))}
    </div>
  );
};

export default OrderTripListPage;