import React from 'react';
import { Card, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const TripChart = ({ summaryData, type }) => {
  const chartData = summaryData.map(item => {
    const trips = item.data || [];
    const total = trips.length;
    const combined = Math.floor(
      trips.filter(
        t => t.isCombinedTrip === 1 && (t.orderType === 'Delivery' || t.orderType === 'Packing')
      ).length / 2
    );
    return {
      label: item.label,
      totalTrips: total - combined,
      combinedTrips: combined,
    };
  });

  return (
    <div style={{ marginBottom: 24  }}>
      <Title level={5} style={{ margin: '25px 0 8px 0' }}>
        Biểu đồ số chuyến & chuyến ghép ({type === 'daily' ? '6 ngày' : type === 'weekly' ? '6 tuần' : '6 tháng'} gần nhất)
      </Title>
      <Card>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalTrips" name="Tổng chuyến" fill="#1890ff" />
            <Bar dataKey="combinedTrips" name="Chuyến ghép" fill="#faad15" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default TripChart;