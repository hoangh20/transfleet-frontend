import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { BellOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UserDrop from '../drop/userDrop';
import SystemService from '../../services/SystemService';

const { Header } = Layout;

const AdminHeader = () => {
  const user = useSelector((state) => state.user);
  const [fuelPrice, setFuelPrice] = useState(null);

  useEffect(() => {
    const fetchFuelPrice = async () => {
      try {
        const response = await SystemService.getFuelPrice();
        if (response.data?.region1) {
          const fuelPrice = response.data.region1; 
          setFuelPrice(fuelPrice); 
          localStorage.setItem('fuelPrice', fuelPrice);
        }
      } catch (error) {
        console.error('Error fetching fuel price:', error);
      }
    };

    fetchFuelPrice();
  }, []);

  return (
    <Header
      className='header'
      style={{
        backgroundColor: '#fff',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '80px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link
          to='/'
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt='Logo'
            style={{ height: '45px', marginRight: '10px' }}
          />

          <span
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #003082, #38b6ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TransFleet
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Thêm giá dầu vào đây */}
        {fuelPrice && (
          <span style={{ 
            fontSize: '16px',
            color: '#003082',
            fontWeight: '500',
            marginRight: '20px'
          }}>
            Giá Dầu: {fuelPrice} VNĐ
          </span>
        )}

        <BellOutlined style={{ fontSize: '24px' }} />
        <QuestionCircleOutlined style={{ fontSize: '24px' }} />
        <span style={{ fontSize: '18px', marginRight: '10px' }}>
          {user.name || 'User'}
        </span>
        <UserDrop />
      </div>
    </Header>
  );
};

export default AdminHeader;