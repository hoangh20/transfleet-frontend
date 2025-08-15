import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import {
  CarOutlined,
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  AppstoreAddOutlined,
  ProfileOutlined,
  ContainerOutlined,
  AppstoreOutlined,
  MacCommandOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  AccountBookOutlined,
  DockerOutlined,
} from '@ant-design/icons';

const { SubMenu } = Menu;

const ROLE_MENU = {
  dev: [
    'overview', 'order', 'order/list', 'order/list-trip', 'order/cont-status',
    'partner-cost', 'vehicle', 'driver', 'partner', 'customer', 'system','trip-route','/pending-orders','/incidental-cost',
    '/cs','cs', 'cs/ship-schedules','/cs/container-costs','/cs/until-dates', '/cs/lines',
    '/cs/dovs', 
  ],
  admin: [
    'overview', 'order', 'order/list', 'order/list-trip', 'order/cont-status',
    'partner-cost', 'vehicle', 'driver', 'partner', 'customer', 'system','trip-route','/incidental-cost','/cs','cs', 'cs/ship-schedules','/cs/until-dates'
  ],
  CS: ['overview', 'order/cont-status','trip-route','customer','/cs','cs', 'cs/ship-schedules','/cs/container-costs','/cs/until-dates', '/cs/lines','customer','/cs/dovs', // Thêm quyền cho CS
  ],
  DHVT: [
    'overview', 'order/create', 'order/list', 'order/list-trip',
    'partner-cost', 'vehicle', 'driver', 'partner', 'customer','trip-route','/pending-orders','/incidental-cost', '/cs/lines',
  ],
  driver: ['overview'],
};

const AdminMenu = () => {
  const user = useSelector((state) => state.user);  
  const role = user?.role;

  const canView = (key) => {
    const allow = ROLE_MENU[role] || [];
    return allow.some((k) => key === k || key.startsWith(k));
  };

  return (
    <Menu
      mode='inline'
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['sub1']}
      style={{ height: '100%', borderRight: 0, fontSize: '18px' }}
    >
      {canView('overview') && (
        <Menu.Item
          key='overview'
          icon={<DashboardOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Link to='/'>Tổng quan</Link>
        </Menu.Item>
      )}

      {canView('order/create') && (
        <Menu.Item
          key='order/create'
          icon={<AppstoreAddOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Link to='/order/create'>Tạo đơn vận chuyển</Link>
        </Menu.Item>
      )}
       {canView('/pending-orders') && (
        <Menu.Item
          key='/pending-orders'
          icon={<ClockCircleOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Link to='/pending-orders'>Danh sách đơn chờ</Link>
        </Menu.Item>
      )}

      {canView('order/list') && (
        <Menu.Item
          key='order/list'
          icon={<ProfileOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Link to='/order/list'>Danh sách đơn hàng</Link>
        </Menu.Item>
      )}
      {canView('order/list-trip') && (
        <Menu.Item
          key='order/list-trip'
          icon={<ProfileOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Link to='/order/list-trip'>Danh sách các chuyến </Link>
        </Menu.Item>
      )}
      {canView('/incidental-cost') && (
        <Menu.Item
          key='/incidental-cost'
          icon={<AccountBookOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Link to='/incidental-cost'>Chi phí phát sinh</Link>
        </Menu.Item>
      )}
      {canView('order/cont-status') && (
        <Menu.Item
          key='order/cont-status'
          icon={<ContainerOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Link to='/order/cont-status'>Quản lý cont </Link>
        </Menu.Item>
      )}
      {canView('cs') && (
        <SubMenu
          key='cs'
          title='Container'
          icon={<ContainerOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Menu.Item key='cs' style={{ fontSize: '18px' }}>
            <Link to='/cs'>Tổng hợp</Link>
          </Menu.Item>
          <Menu.Item key='/cs/container-costs' style={{ fontSize: '18px' }}>
            <Link to='/cs/container-costs'>Quản lý chi phí</Link>
          </Menu.Item>
          <Menu.Item key='/cs/dovs' style={{ fontSize: '18px' }}>
            <Link to='/cs/dovs'>Cước biển & Phí DOVS</Link>
          </Menu.Item>
          <Menu.Item key='/cs/container-incidental-costs' style={{ fontSize: '18px' }}>
            <Link to='/cs/container-incidental-costs'>Chi phí phát sinh</Link>
          </Menu.Item>
          <Menu.Item key='cs/ship-schedules' style={{ fontSize: '18px' }}>
            <Link to='/cs/ship-schedules'>Quản lý chuyến tàu</Link>
          </Menu.Item>
          <Menu.Item key='/cs/until-dates' style={{ fontSize: '18px' }}>
            <Link to='/cs/until-dates'>Quản lý ngày lưu</Link>
          </Menu.Item>
          
        </SubMenu>
      )}
      {canView('/cs/lines') && (
            <Menu.Item key='/cs/lines' style={{ fontSize: '18px' }} icon ={<DockerOutlined />}>
              <Link to='/cs/lines'>Quản lý Line</Link>
            </Menu.Item>
      )}
      {canView('trip-route') && (
        <Menu.Item
          key='/trip-route'
          icon={<EnvironmentOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Link to='/trip-route'>Quản lý hành trình </Link>
        </Menu.Item>
      )}
      {canView('partner-cost') && (
        <SubMenu
          key='partner-cost'
          title='Tuyến vận tải'
          icon={<MacCommandOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Menu.Item key='transport-route-list' style={{ fontSize: '18px' }}>
            <Link to='/transport-route'>Danh sách tuyến</Link>
          </Menu.Item>
          <Menu.Item key='transport-route-empty-distance' style={{ fontSize: '18px' }}>
            <Link to='/transport-route/empty-distance'>Tuyến kết hợp</Link>
          </Menu.Item>
        </SubMenu>
      )}
      {canView('vehicle') && (
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
          <Menu.Item key='/vehicle/repair' style={{ fontSize: '18px' }}>
            <Link to='/vehicle/repair'>Sửa chữa</Link>
          </Menu.Item>
        </SubMenu>
      )}
      {canView('driver') && (
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
      )}
      {canView('partner') && (
        <Menu.Item
          key='partner'
          icon={<TeamOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Link to='/partner/list'>Đội xe đối tác</Link>
        </Menu.Item>
      )}
      {canView('customer') && (
        <Menu.Item
          key='customer'
          icon={<TeamOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Link to='/customer/list'>Khách hàng</Link>
        </Menu.Item>
      )}
      {canView('system') && (
        <SubMenu
          key='system'
          title='Hệ thống'
          icon={<AppstoreOutlined />}
          style={{ fontSize: '18px' }}
        >
          <Menu.Item key='report' style={{ fontSize: '18px' }}>
            <Link to='/system'>Tài nguyên hệ thống</Link>
          </Menu.Item>
          <Menu.Item key='account-management' style={{ fontSize: '18px' }}>
            <Link to='/system/account-management'>Quản lý tài khoản</Link>
          </Menu.Item>
        </SubMenu>
      )}
    </Menu>
  );
};

export default AdminMenu;
