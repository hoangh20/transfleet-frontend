import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';
import { Card, DatePicker, Select, message, Row, Col, Typography, Button, List, Modal } from 'antd';
import SummaryService from '../../services/SummaryService';
import StatsCard from './StatsCard';
import TripChart from './TripChart';
import InternalFareChart from './InternalFareChart';
import IncidentalCostSummary from './IncidentalCostSummary';

const { Option } = Select;
// eslint-disable-next-line no-unused-vars
const { Title, Text } = Typography;

dayjs.extend(isLeapYear);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.locale('vi');

const Statistics = () => {
  const [, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [prevData, setPrevData] = useState([]);
  const [type, setType] = useState('daily');
  const [summaryData, setSummaryData] = useState([]);

  const getDefaultDate = (statType) => {
    const now = dayjs();
    if (statType === 'weekly') return now.startOf('week');
    if (statType === 'monthly') return now.startOf('month');
    return now;
  };

  const [selectedDate, setSelectedDate] = useState(getDefaultDate('daily'));

  useEffect(() => {
    const newDate = getDefaultDate(type);
    setSelectedDate(newDate);
    fetchBothPeriods(type, newDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const fetchBothPeriods = React.useCallback(
    async (customType = type, customDate = selectedDate) => {
      setLoading(true);
      try {
        let currentStr, prevStr;
        if (customType === 'daily') {
          currentStr = customDate.format('YYYY-MM-DD');
          prevStr = customDate.subtract(1, 'day').format('YYYY-MM-DD');
        } else if (customType === 'weekly') {
          currentStr = customDate.startOf('week').format('YYYY-MM-DD');
          prevStr = customDate.subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
        } else {
          currentStr = customDate.startOf('month').format('YYYY-MM-DD');
          prevStr = customDate.subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
        }

        let currentRes, prevRes;
        if (customType === 'daily') {
          currentRes = await SummaryService.getDailyTripsSummary(currentStr);
          prevRes = await SummaryService.getDailyTripsSummary(prevStr);
        } else if (customType === 'weekly') {
          currentRes = await SummaryService.getWeeklyTripsSummary(currentStr);
          prevRes = await SummaryService.getWeeklyTripsSummary(prevStr);
        } else {
          currentRes = await SummaryService.getMonthlyTripsSummary(currentStr);
          prevRes = await SummaryService.getMonthlyTripsSummary(prevStr);
        }

        setCurrentData(currentRes.data || []);
        setPrevData(prevRes.data || []);
      } catch (error) {
        message.error(`Lỗi khi tải dữ liệu: ${error}`);
      } finally {
        setLoading(false);
      }
    },
    [type, selectedDate]
  );

  useEffect(() => {
    if (selectedDate) fetchBothPeriods();
  }, [type, selectedDate, fetchBothPeriods]);

  const fetchSummaryData = React.useCallback(
    async (customType = type, customDate = selectedDate) => {
      setLoading(true);
      try {
        let fetchFunc, formatStr, getLabel;
        if (customType === 'daily') {
          fetchFunc = SummaryService.getDailyTripsSummary;
          formatStr = 'YYYY-MM-DD';
          getLabel = (date) => dayjs(date).format('DD/MM');
        } else if (customType === 'weekly') {
          fetchFunc = SummaryService.getWeeklyTripsSummary;
          formatStr = 'YYYY-MM-DD';
          getLabel = (date) => 'Tuần ' + dayjs(date).week();
        } else {
          fetchFunc = SummaryService.getMonthlyTripsSummary;
          formatStr = 'YYYY-MM-DD';
          getLabel = (date) => dayjs(date).format('MM/YYYY');
        }

        const promises = [];
        for (let i = 5; i >= 0; i--) {
          let date;
          if (customType === 'daily') date = customDate.subtract(i, 'day');
          else if (customType === 'weekly') date = customDate.subtract(i, 'week').startOf('week');
          else date = customDate.subtract(i, 'month').startOf('month');
          promises.push(fetchFunc(date.format(formatStr)));
        }
        const results = await Promise.all(promises);

        setSummaryData(results.map((res, idx) => ({
          label: getLabel(
            customType === 'daily'
              ? customDate.subtract(5 - idx, 'day')
              : customType === 'weekly'
              ? customDate.subtract(5 - idx, 'week').startOf('week')
              : customDate.subtract(5 - idx, 'month').startOf('month')
          ),
          data: res.data || [],
        })));
      } catch (error) {
        message.error(`Lỗi khi tải dữ liệu: ${error}`);
      } finally {
        setLoading(false);
      }
    },
    [type, selectedDate]
  );

  useEffect(() => {
    if (selectedDate) fetchSummaryData();
  }, [type, selectedDate, fetchSummaryData]);

  const handleTypeChange = (value) => {
    setType(value);
  };

  const handleDateChange = (date) => {
    if (!date) {
      setSelectedDate(null);
      return;
    }
    if (type === 'weekly') {
      setSelectedDate(date.startOf('week'));
    } else if (type === 'monthly') {
      setSelectedDate(date.startOf('month'));
    } else {
      setSelectedDate(date);
    }
  };

  const calcStats = (data) => {
    const total = data.length;
    const combined = Math.floor(
      data.filter(
      (t) => t.isCombinedTrip === 1 && (t.orderType === 'Delivery' || t.orderType === 'Packing')
      ).length / 2
    );
    return {
      totalTrips: total - combined,
      combinedTrips: combined,
      combinedTripRatio: total > 0 ? ((combined / (total - combined)) * 100).toFixed(2) : 0,
    };
  };

  const calcTotalFare = (data) =>
    data.reduce((sum, t) => sum + (Number(t.cost.tripFare) || 0), 0);
  const calcTotalpartnerFee  = (data) =>
    data.reduce((sum, t) => sum + (Number(t.partnerConnection.partnerFee) || 0), 0);
  const currentStats = calcStats(currentData);
  const prevStats = calcStats(prevData);

  const filterByVehicle = (data, type) => data.filter(t => t.hasVehicle === type);

  const currentStatsInternal = calcStats(filterByVehicle(currentData, 1));
  const prevStatsInternal = calcStats(filterByVehicle(prevData, 1));
  const currentStatsPartner = calcStats(filterByVehicle(currentData, 2));
  const prevStatsPartner = calcStats(filterByVehicle(prevData, 2));

  const totalFare = calcTotalFare(currentData);
  const prevTotalFare = calcTotalFare(prevData);

  const totalPartnerFee = calcTotalpartnerFee(filterByVehicle(currentData, 2));
  const prevTotalPartnerFee = calcTotalpartnerFee(filterByVehicle(prevData, 2));

  const totalFareInternal = calcTotalFare(filterByVehicle(currentData, 1));
  const prevTotalFareInternal = calcTotalFare(filterByVehicle(prevData, 1));

  const totalFarePartner = calcTotalFare(filterByVehicle(currentData, 2));
  const prevTotalFarePartner = calcTotalFare(filterByVehicle(prevData, 2));

  const getChange = (current, prev) => {
    if (prev === 0 && current === 0) return null;
    if (prev === 0) return 100;
    const diff = current - prev;
    return Number(((diff / prev) * 100).toFixed(2));
  };

  const calcInternalCosts = (data) => {
    let driverAllowance = 0;
    let driverSalary = 0;
    data.forEach(t => {
      driverAllowance += Number(t.cost.driverAllowance) || 0;
      driverSalary += Number(t.cost.driverSalary) || 0;
    });
    return {
      driverAllowance,
      driverSalary,
      total: driverAllowance + driverSalary,
    };
  };

  const internalCosts = calcInternalCosts(filterByVehicle(currentData, 1));
  const customerTripCount = {};
  currentData.forEach(trip => {
    const customer = trip.customer || 'Không xác định';
    customerTripCount[customer] = (customerTripCount[customer] || 0) + 1;
  });
  const sortedCustomers = Object.entries(customerTripCount)
    .sort((a, b) => b[1] - a[1]);
  const top5Customers = sortedCustomers.slice(0, 5);

  const [showAllCustomers, setShowAllCustomers] = useState(false);

  const partnerTripCount = {};
  filterByVehicle(currentData, 2).forEach(trip => {
    const partnerName = trip.partnerConnection?.partnerId?.name || 'Không xác định';
    partnerTripCount[partnerName] = (partnerTripCount[partnerName] || 0) + 1;
  });
  const sortedPartners = Object.entries(partnerTripCount).sort((a, b) => b[1] - a[1]);
  const top5Partners = sortedPartners.slice(0, 5);
  const [showAllPartners, setShowAllPartners] = useState(false);

  const driverVehicleStats = {};
  filterByVehicle(currentData, 1).forEach(trip => {
    const driverName = trip.driver?.name || 'Không xác định';
    const vehiclePlate = trip.vehicle?.headPlate || 'Không xác định';
    const key = `${driverName} - ${vehiclePlate}`;
    if (!driverVehicleStats[key]) {
      driverVehicleStats[key] = {
        driverName,
        vehiclePlate,
        trips: [],
        workDates: new Set(),
        avatar: trip.driver?.avatar,
      };
    }
    driverVehicleStats[key].trips.push(trip);
    if (trip.date) {
      driverVehicleStats[key].workDates.add(trip.date.slice(0, 10));
    }
  });
  const driverVehicleList = Object.values(driverVehicleStats)
    .map(item => {
      const total = item.trips.length;
      const combined = Math.floor(
        item.trips.filter(
          t => t.isCombinedTrip === 1 && (t.orderType === 'Delivery' || t.orderType === 'Packing')
        ).length / 2
      );
      return {
        ...item,
        tripCount: total - combined,
        workDayCount: item.workDates.size,
      };
    })
    .sort((a, b) => b.tripCount - a.tripCount)
    .slice(0, 6);

  const [showAllDrivers, setShowAllDrivers] = useState(false);
  const allDriverVehicleList = Object.values(driverVehicleStats)
    .map(item => {
      const total = item.trips.length;
      const combined = Math.floor(
        item.trips.filter(
          t => t.isCombinedTrip === 1 && (t.orderType === 'Delivery' || t.orderType === 'Packing')
        ).length / 2
      );
      return {
        ...item,
        tripCount: total - combined,
        workDayCount: item.workDates.size,
      };
    })
    .sort((a, b) => b.tripCount - a.tripCount);

  return (
    <div style={{ margin: '0' }}>
      <Title level={3}>📊 Số liệu thống kế</Title>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col>
            <Select
              value={type}
              onChange={handleTypeChange}
              style={{ width: 160 }}
            >
              <Option value="daily">Theo ngày</Option>
              <Option value="weekly">Theo tuần</Option>
              <Option value="monthly">Theo tháng</Option>
            </Select>
          </Col>
          <Col>
            <DatePicker
              key={type}
              value={selectedDate}
              onChange={handleDateChange}
              picker={type === 'daily' ? 'date' : type === 'weekly' ? 'week' : 'month'}
              {...(type === 'daily' ? { format: 'YYYY-MM-DD' } : {})}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]} align="stretch">
        <Col xs={24} md={8}>
          <Card style={{ height: '100%' }} bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
            <StatsCard
              icon={'🚚'}
              value={currentStats.totalTrips}
              label="Tổng số chuyến"
              change={getChange(currentStats.totalTrips, prevStats.totalTrips)}
            />
            <StatsCard
              icon={'🔄'}
              value={
                <span>
                  {currentStats.combinedTrips} - {currentStats.combinedTripRatio}%
                </span>
              }
              label="Chuyến ghép"
              change={getChange(currentStats.combinedTrips, prevStats.combinedTrips)}
            />
            <StatsCard
              icon={'💰'}
              value={totalFare.toLocaleString('vi-VN')}
              label="Tổng cước thu"
              change={getChange(totalFare, prevTotalFare)}
            />
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card style={{ height: '100%' }}>
            <TripChart summaryData={summaryData} type={type} selectedDate={selectedDate} />
          </Card>
        </Col>
      </Row>
      <Row gutter={24} style={{ marginTop: 32 }}>
        <Col span={24}>
          <Title level={4}>Đội xe nội bộ</Title>
        </Col>
        <Col xs={24} md={15}>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Card 
              style={{ width: '100%' }} 
              bodyStyle={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: 12, 
                width: '100%'
              }}
            >
              <div style={{ flex: 1 }}>
                <StatsCard
                  icon="🚚"
                  value={currentStatsInternal.totalTrips}
                  label="Tổng số chuyến"
                  change={getChange(currentStatsInternal.totalTrips, prevStatsInternal.totalTrips)}
                  style={{ textAlign: 'center', height: '100%' }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <StatsCard
                  icon="🔄"
                  value={
                    <div style={{ display: 'flex', justifyContent: 'left', gap: 4 }}>
                      <span>{currentStatsInternal.combinedTrips}</span>
                      <span>-</span>
                      <span>{currentStatsInternal.combinedTripRatio}%</span>
                    </div>
                  }
                  label="Chuyến ghép"
                  change={getChange(currentStatsInternal.combinedTrips, prevStatsInternal.combinedTrips)}
                  style={{ textAlign: 'center', height: '100%' }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <StatsCard
                  icon="💰"
                  value={totalFareInternal.toLocaleString('vi-VN')}
                  label="Tổng cước thu"
                  change={getChange(totalFareInternal, prevTotalFareInternal)}
                  style={{ textAlign: 'center', height: '100%' }}
                />
              </div>
            </Card>
          </Row>
            <Card style={{ widh: '100%' }}> 
            <InternalFareChart summaryData={summaryData} type={type} selectedDate={selectedDate} />
          </Card>
        </Col>
        <Col xs={24} md={9} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StatsCard
            icon="💸"
            value={
              <div>
                <div>Công tác phí: {internalCosts.driverAllowance.toLocaleString('vi-VN')}</div>
                <div>Lương lái xe: {internalCosts.driverSalary.toLocaleString('vi-VN')}</div>
                <div><b>Tổng: {internalCosts.total.toLocaleString('vi-VN')}</b></div>
              </div>
            }
            label="Chi phí tài xế"
          />
          <StatsCard
            icon="🧑‍✈️"
            label="Lái xe"
            value={
              <div>
                <List
                  size="small"
                  dataSource={driverVehicleList}
                  renderItem={(item, idx) => (
                    <List.Item>
                      <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        {idx + 1}.&nbsp;
                        {item.avatar && (
                          <img
                            src={item.avatar}
                            alt={item.driverName}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              marginRight: 8,
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        {item.driverName} - {item.vehiclePlate}
                      </span>
                      <span style={{ float: 'right' }}>
                        {item.tripCount} chuyến / {item.workDayCount} ngày
                      </span>
                    </List.Item>
                  )}
                />
                {allDriverVehicleList.length > 6 && (
                  <Button
                    size="small"
                    type="link"
                    onClick={() => setShowAllDrivers(true)}
                    style={{ padding: 0, marginTop: 8 }}
                  >
                    Xem tất cả
                  </Button>
                )}
                <Modal
                  title="Danh sách lái xe"
                  open={showAllDrivers}
                  onCancel={() => setShowAllDrivers(false)}
                  footer={null}
                  width={600}
                >
                  <List
                    size="small"
                    dataSource={allDriverVehicleList}
                    renderItem={(item) => (
                      <List.Item>
                        <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                          {item.avatar && (
                            <img
                              src={item.avatar}
                              alt={item.driverName}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                marginRight: 8,
                                objectFit: 'cover'
                              }}
                            />
                          )}
                          {item.driverName} - {item.vehiclePlate}
                        </span>
                        <span style={{ float: 'right' }}>
                          {item.tripCount} chuyến / {item.workDayCount} ngày
                        </span>
                      </List.Item>
                    )}
                  />
                </Modal>
              </div>
            }
          />
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        <Col span={24}>
          <Title level={4} style={{ marginBottom: 16 }}>
            Đội xe đối tác
          </Title>
        </Col>
      </Row>
      <Row gutter={[24, 24]}>        
        <Col xs={24} md={8}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}>
              <StatsCard
                icon={'🚚'}
                value={currentStatsPartner.totalTrips}
                label="Tổng số chuyến"
                change={getChange(currentStatsPartner.totalTrips, prevStatsPartner.totalTrips)}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StatsCard
                icon={'🔄'}
                value={
                  <span>
                    {currentStatsPartner.combinedTrips} - {currentStatsPartner.combinedTripRatio}%
                  </span>
                }
                label="Chuyến ghép"
                change={getChange(currentStatsPartner.combinedTrips, prevStatsPartner.combinedTrips)}
              />
            </Col>
            <Col span={24}>
              <StatsCard
                icon={'👥'}
                label="Khách hàng hàng đầu"
                value={
                  <div>
                    <List
                      size="small"
                      dataSource={top5Customers}
                      renderItem={([customer, count], idx) => (
                        <List.Item>
                          <span style={{ fontWeight: 500 }}>{idx + 1}. {customer}</span>
                          <span style={{ float: 'right' }}>{count} chuyến</span>
                        </List.Item>
                      )}
                    />
                    {sortedCustomers.length > 5 && (
                      <Button
                        size="small"
                        type="link"
                        onClick={() => setShowAllCustomers(true)}
                        style={{ padding: 0, marginTop: 8 }}
                      >
                        Xem tất cả
                      </Button>
                    )}
                    <Modal
                      title="Danh sách tất cả khách hàng theo số chuyến"
                      open={showAllCustomers}
                      onCancel={() => setShowAllCustomers(false)}
                      footer={null}
                      width={600}
                    >
                      <List
                        size="small"
                        dataSource={sortedCustomers}
                        renderItem={([customer, count], idx) => (
                          <List.Item>
                            <span style={{ fontWeight: 500 }}>{idx + 1}. {customer}</span>
                            <span style={{ float: 'right' }}>{count} chuyến</span>
                          </List.Item>
                        )}
                      />
                    </Modal>
                  </div>
                }
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} md={8}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}>
              <StatsCard
                icon={'💰'}
                value={totalFarePartner.toLocaleString('vi-VN')}
                label="Tổng cước thu"
                change={getChange(totalFarePartner, prevTotalFarePartner)}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StatsCard
                icon={'💸'}
                value={totalPartnerFee.toLocaleString('vi-VN')}
                label="Tổng cước trả"
                change={getChange(totalPartnerFee, prevTotalPartnerFee)}
              />
            </Col>
            <Col span={24}>
              <StatsCard
                icon={'🤝'}
                label="Đối tác hàng đầu"
                value={
                  <div>
                    <List
                      size="small"
                      dataSource={top5Partners}
                      renderItem={([partner, count], idx) => (
                        <List.Item>
                          <span style={{ fontWeight: 500 }}>{idx + 1}. {partner}</span>
                          <span style={{ float: 'right' }}>{count} chuyến</span>
                        </List.Item>
                      )}
                    />
                    {sortedPartners.length > 5 && (
                      <Button
                        size="small"
                        type="link"
                        onClick={() => setShowAllPartners(true)}
                        style={{ padding: 0, marginTop: 8 }}
                      >
                        Xem tất cả
                      </Button>
                    )}
                    <Modal
                      title="Danh sách tất cả đối tác theo số chuyến (chỉ xe đối tác)"
                      open={showAllPartners}
                      onCancel={() => setShowAllPartners(false)}
                      footer={null}
                      width={600}
                    >
                      <List
                        size="small"
                        dataSource={sortedPartners}
                        renderItem={([partner, count], idx) => (
                          <List.Item>
                            <span style={{ fontWeight: 500 }}>{idx + 1}. {partner}</span>
                            <span style={{ float: 'right' }}>{count} chuyến</span>
                          </List.Item>
                        )}
                      />
                    </Modal>
                  </div>
                }
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} md={8}>
          <IncidentalCostSummary type={type} selectedDate={selectedDate} />
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;
