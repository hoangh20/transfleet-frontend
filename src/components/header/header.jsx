// AdminHeader.jsx
import React from 'react';
import { Layout } from 'antd';
import { BellOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UserDrop from '../drop/userDrop';

const { Header } = Layout;

const AdminHeader = () => {
  const user = useSelector((state) => state.user);

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
