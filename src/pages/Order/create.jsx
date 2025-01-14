import React, { useState } from 'react';
import { Menu} from 'antd';
import PackingOrderForm from '../../components/forms/PackingOrderForm';
import DeliveryOrderForm from '../../components/forms/DeliveryOrderForm';

const CreateOrderPage = () => {
  const [selectedOption, setSelectedOption] = useState('delivery');

  const handleMenuClick = (e) => {
    setSelectedOption(e.key);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Menu
        onClick={handleMenuClick}
        selectedKeys={[selectedOption]}
        mode="horizontal"
        style={{ marginBottom: '24px' }}
      >
        <Menu.Item key="delivery">
          Giao hàng nhập
        </Menu.Item>
        <Menu.Item key="packing">
          Đóng hàng
        </Menu.Item>
        
      </Menu>

      {selectedOption === 'packing' && (
          <PackingOrderForm />
      )}
      {selectedOption === 'delivery' && (
          <DeliveryOrderForm />
      )}
    </div>
  );
};

export default CreateOrderPage;