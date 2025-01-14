import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom
import {
  CarOutlined,
  UserOutlined,
  SettingOutlined,
  DashboardOutlined,
  TeamOutlined,
  AppstoreAddOutlined,
  ProfileOutlined,
  ContainerOutlined,
  AppstoreOutlined,
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
      
      <Menu.Item
        key='ticket'
        icon={<AppstoreAddOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Link to='/order/create'>Tạo chuyến vận chuyển</Link>
      </Menu.Item>

      <Menu.Item
        key='ticket/list'
        icon={<ProfileOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Link to='/order/list'>Danh sách chuyến</Link>
      </Menu.Item>
      <Menu.Item
        key='partner-cost'
        icon={<ContainerOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Link to='/transport-route'>Tuyến vận tải</Link>
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
      <Menu.Item
        key='partner'
        icon={<TeamOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Link to='/partner/list'>Đội xe đối tác</Link>
      </Menu.Item> 
      <Menu.Item
        key='customer'
        icon={<TeamOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Link to='/customer/list'>Khách hàng</Link>
      </Menu.Item> 
      <Menu.Item
        key='report'
        icon={<AppstoreOutlined />}
        style={{ fontSize: '18px' }}
      >
        <Link to='/system'>Tài nguyên hệ thống</Link>
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
