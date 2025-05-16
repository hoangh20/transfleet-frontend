import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const StatsCard = ({
  icon,
  value,
  label,
  change = null,
  suffix = '',
}) => {
  let changeNode = null;
  if (change !== null && change !== undefined) {
    let color = change > 0 ? 'green' : change < 0 ? 'red' : '#888';
    let sign = change > 0 ? '+' : '';
    let arrow = change > 0 ? '▲' : change < 0 ? '▼' : '';
    changeNode = (
      <div style={{ marginTop: 8 }}>
        <Text style={{ color, fontSize: 14 }}>
          {arrow} {sign}{change}{suffix} %
        </Text>
      </div>
    );
  }

  return (
    <Card
      bordered
      style={{
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        padding: 0,
        position: 'relative',
      }}
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ position: 'absolute', top: 16, right: 12, fontSize: 24 }}>
        {icon}
      </div>
      <div style={{ marginBottom: 8 }}>
        <Text strong>{label}</Text>
      </div>
      <Title level={3} style={{ margin: 0 }}>{value}{suffix && typeof value === 'number' ? suffix : ''}</Title>
      {changeNode}
    </Card>
  );
};

export default StatsCard;