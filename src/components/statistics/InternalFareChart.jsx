import React, { useEffect, useState } from 'react';
import { Card, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import SummaryService from '../../services/SummaryService';

const { Title } = Typography;

const InternalFareChart = ({ type, selectedDate }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      let fetchFunc, formatStr, getLabel;
      if (type === 'daily') {
        fetchFunc = SummaryService.getDailyTripsSummary;
        formatStr = 'YYYY-MM-DD';
        getLabel = (date) => dayjs(date).format('DD/MM');
      } else if (type === 'weekly') {
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
        if (type === 'daily') date = selectedDate.subtract(i, 'day');
        else if (type === 'weekly') date = selectedDate.subtract(i, 'week').startOf('week');
        else date = selectedDate.subtract(i, 'month').startOf('month');
        promises.push(fetchFunc(date.format(formatStr)));
      }
      const results = await Promise.all(promises);

      const data = results.map((res, idx) => {
        const trips = (res.data || []).filter(t => t.hasVehicle === 1);
        const totalFare = trips.reduce((sum, t) => sum + (Number(t.cost?.tripFare) || 0), 0);
        return {
          label: getLabel(
            type === 'daily'
              ? selectedDate.subtract(5 - idx, 'day')
              : type === 'weekly'
              ? selectedDate.subtract(5 - idx, 'week').startOf('week')
              : selectedDate.subtract(5 - idx, 'month').startOf('month')
          ),
          totalFare,
        };
      });
      setChartData(data);
    };

    if (selectedDate) fetchChartData();
  }, [type, selectedDate]);

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