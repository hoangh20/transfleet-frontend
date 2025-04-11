import React, { useState, useEffect } from 'react';
import { Layout, Modal, Input, message, Grid } from 'antd';
import {
  BellOutlined,
  QuestionCircleOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UserDrop from '../drop/userDrop';
import SystemService from '../../services/SystemService';

const { Header } = Layout;
const { useBreakpoint } = Grid;

const AdminHeader = () => {
  const user = useSelector((state) => state.user);
  const [fuelPrice, setFuelPrice] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFuelPrice, setNewFuelPrice] = useState('');

  const screens = useBreakpoint();

  useEffect(() => {
    const fetchFuelPrice = async () => {
      try {
        const response = await SystemService.getFuelPrice();
        if (response.data?.region1) {
          const price = response.data.region1;
          setFuelPrice(price);
          localStorage.setItem('fuelPrice', price);
        }
      } catch (error) {
        console.error('Error fetching fuel price:', error);
      }
    };

    fetchFuelPrice();
  }, []);

  const handleEditFuelPrice = () => {
    setNewFuelPrice(fuelPrice);
    setIsModalVisible(true);
  };

  const handleSaveFuelPrice = async () => {
    try {
      if (!newFuelPrice || isNaN(newFuelPrice)) {
        message.error('Vui lòng nhập một giá trị hợp lệ');
        return;
      }
      const updatedPrice = newFuelPrice.trim();
      await SystemService.updateFuelRegion1({ region1: updatedPrice });
      setFuelPrice(updatedPrice);
      localStorage.setItem('fuelPrice', updatedPrice);
      message.success('Cập nhật giá dầu thành công');
      setIsModalVisible(false);
    } catch (error) {
      message.error('Lỗi khi cập nhật giá dầu');
    }
  };

  return (
    <Header
      className="header"
      style={{
        backgroundColor: '#fff',
        padding: screens.xs ? '0 10px' : '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: screens.xs ? '60px' : '80px',
      }}
    >
      {/* Phần bên trái: Logo và tên thương hiệu */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt="Logo"
            style={{
              height: screens.xs ? '35px' : '45px',
              marginRight: '10px',
            }}
          />
          <span
            style={{
              fontSize: screens.xs ? '20px' : '28px',
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

      {/* Phần giữa: Liên kết tới trang Sheet */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FileExcelOutlined
          style={{
            fontSize: '24px',
            color: '#003082',
            marginRight: screens.xl ? '15px' : '0',
          }}
        />
        {screens.xl && (
          <a
            href="https://docs.google.com/spreadsheets/d/1guTkaEbCAXWMdNfjMSdMZA9b17r6CCv0nqBqirzds58/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#003082',
              fontWeight: '500',
              fontSize: '16px',
            }}
          >
            Truy cập trang Sheet
          </a>
        )}
      </div>

      {/* Phần bên phải: Thông báo, trợ giúp, giá dầu và thông tin user */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: screens.xs ? '5px' : '15px',
        }}
      >
        {screens.xl && fuelPrice && (
          <span
            style={{
              fontSize: screens.xs ? '14px' : '16px',
              color: '#003082',
              fontWeight: '500',
              marginRight: screens.xs ? '5px' : '20px',
              cursor: 'pointer',
            }}
            onClick={handleEditFuelPrice}
          >
            Giá Dầu Hôm Nay: {fuelPrice} VNĐ
          </span>
        )}
        <BellOutlined style={{ fontSize: screens.xs ? '20px' : '24px' }} />
        <QuestionCircleOutlined style={{ fontSize: screens.xs ? '20px' : '24px' }} />
        <span
          style={{
            fontSize: screens.xs ? '14px' : '18px',
            marginRight: screens.xs ? '5px' : '10px',
          }}
        >
          {user.name || 'User'}
        </span>
        <UserDrop />
      </div>

      {/* Modal chỉnh sửa giá dầu */}
      <Modal
        title="Chỉnh sửa giá dầu hôm nay"
        visible={isModalVisible}
        onOk={handleSaveFuelPrice}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Input
          value={newFuelPrice}
          onChange={(e) => setNewFuelPrice(e.target.value)}
          placeholder="Nhập giá dầu mới"
          type="number"
        />
      </Modal>
    </Header>
  );
};

export default AdminHeader;
