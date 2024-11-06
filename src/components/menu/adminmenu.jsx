import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom
import {
  CarOutlined,
  UserOutlined,
  GlobalOutlined,
  CarryOutOutlined,
  SettingOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const { SubMenu } = Menu;

const AdminMenu = () => {
  return (
    <Menu
      mode='inline'
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['sub1']}
      style={{ height: '100%', borderRight: 0, fontSize: '18px' }}
    >
      <Menu.Item
        key='overview'
        icon={<DashboardOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Link to='/'>Tổng quan</Link>
      </Menu.Item>

      <SubMenu
        key='vehicle'
        title='Quản lý xe'
        icon={<CarOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Menu.Item key='vehicle-create' style={{ fontSize: '18px' }}>
          <Link to='/vehicle/create'>Thêm mới</Link>
        </Menu.Item>
        <Menu.Item key='vehicle-list' style={{ fontSize: '18px' }}>
          <Link to='/vehicle/list'>Danh sách</Link>
        </Menu.Item>
      </SubMenu>

      <SubMenu
        key='driver'
        title='Lái xe'
        icon={<UserOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Menu.Item key='driver-create' style={{ fontSize: '18px' }}>
          <Link to='/driver/list'>Danh sách</Link>
        </Menu.Item>
        <Menu.Item key='driver-list' style={{ fontSize: '18px' }}>
          <Link to='/driver/wage'>Lương thưởng</Link>
        </Menu.Item>
      </SubMenu>

      <SubMenu
        key='fixed-transport'
        title='Tuyến vận tải cố định'
        icon={<GlobalOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Menu.Item key='fixed-transport-create' style={{ fontSize: '18px' }}>
          <Link to='/fixed-transport'>Thêm mới</Link>
        </Menu.Item>
        <Menu.Item key='fixed-transport-list' style={{ fontSize: '18px' }}>
          <Link to='/fixed-transport'>Danh sách</Link>
        </Menu.Item>
      </SubMenu>

      <SubMenu
        key='transport-trip'
        title='Chuyến vận tải'
        icon={<CarryOutOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Menu.Item key='transport-trip-create' style={{ fontSize: '18px' }}>
          <Link to='/transport-trips'>Thêm mới</Link>
        </Menu.Item>
        <Menu.Item key='transport-trip-list' style={{ fontSize: '18px' }}>
          <Link to='/transport-trips'>Danh sách</Link>
        </Menu.Item>
      </SubMenu>
      <Menu.Item
        key='report'
        icon={<SettingOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Link to='/report'>Báo cáo</Link>
      </Menu.Item>
      <Menu.Item
        key='operation'
        icon={<SettingOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Link to='/operation'>Hoạt động</Link>
      </Menu.Item>
    </Menu>
  );
};

export default AdminMenu;
