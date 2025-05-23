import React from 'react';
import { Card, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const InternalFareChart = ({ summaryData, type }) => {
  const chartData = summaryData.map(item => {
    const trips = (item.data || []).filter(t => t.hasVehicle === 1);
    const totalFare = trips.reduce((sum, t) => sum + (Number(t.cost?.tripFare) || 0), 0);
    return {
      label: item.label,
      totalFare,
    };
  });

  return (
    <div style={{ marginBottom: 12 }}>
      <Title level={5} style={{ margin: '25px 0 8px 0' }}>
        Biểu đồ tổng cước thu đội xe nội bộ ({type === 'daily' ? '6 ngày' : type === 'weekly' ? '6 tuần' : '6 tháng'} gần nhất)
      </Title>
      <Card>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ left: 20}}>
            <XAxis dataKey="label" />
            <YAxis tickFormatter={v => v.toLocaleString('vi-VN')} />
            <Tooltip formatter={v => v.toLocaleString('vi-VN')} />
            <Legend />
            <Bar dataKey="totalFare" name="Tổng cước thu" fill="#52c41a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default InternalFareChart;