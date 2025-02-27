import React from 'react';
import { Card } from 'antd';

const CombinedOrderWrapper = ({ children }) => {
  return (
    <Card style={{ border: '2px dashed #1890ff', marginBottom: '16px' }}>
      {children}
    </Card>
  );
};

export default CombinedOrderWrapper;