import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import HomePage from '../pages/homepage/homepage';
import CreateCarPage from '../pages/vehicle/create';
import LandingPage from '../pages/LandingPage/landingpage';
import VehicleListPage from '../pages/vehicle/index';
import SigninPage from '../pages/sign-in/sign-in';
import SignupPage from '../pages/sign-up/sign-up';
import DriverListPage from '../pages/driver/index';
import DriverWagePage from '../pages/driver/wage';
import VehicleDetailPage from '../pages/vehicle/VehicleDetailPage';
import CustommerPage from '../pages/customer/index';
import PartnerPage from '../pages/Partner/index';
import PartnerCostPage from '../pages/TransportRoute/cost';
import PackingDetailCostPage from '../pages/TransportRoute/packingDetailCost';
import DeliveryDetailCostPage from '../pages/TransportRoute/deliveryDetailCost';
import CreateOrderPage from '../pages/Order/create';
import OrderPage from '../pages/Order/index';
import SystemDefaultsPage from '../pages/System/SystemDefaultsPage';
import DeliveryOrderDetailPage from '../pages/Order/DeliveryOrderDetailPage';
import PackingOrderDetailPage from '../pages/Order/PackingOrderDetailPage';
import OrderTripListPage from '../pages/Order/OrderTripListPage';
import AccountManagementPage from '../pages/System/AccountManagementPage';
import EmptyDistance from '../pages/TransportRoute/Emptydistance';
import ContStatus from '../pages/Order/ContStatus';

const ROLE_MENU = {
  dev: [
    '/', '/order/create', '/order/list', '/order/list-trip', '/order/cont-status', '/order/delivery-orders/:orderId', '/order/packing-orders/:orderId',
    '/partner/list', '/customer/list', '/vehicle/create', '/vehicle/list', '/vehicle/detail/:id',
    '/driver/list', '/driver/wage', '/transport-route', '/transport-route/empty-distance',
    '/transport-route/packing/:id', '/transport-route/delivery/:id',
    '/system', '/system/account-management', '/sign-in', '/sign-up', '/landingpage'
  ],
  admin: [
    '/', '/order/create', '/order/list', '/order/list-trip', '/order/cont-status',
    '/partner/list', '/customer/list', '/vehicle/create', '/vehicle/list', '/vehicle/detail/:id',
    '/driver/list', '/driver/wage', '/transport-route', '/transport-route/empty-distance',
    '/transport-route/packing/:id', '/transport-route/delivery/:id',
    '/system', '/system/account-management', '/sign-in', '/sign-up', '/landingpage'
  ],
  CS: ['/', '/order/cont-status', '/sign-in', '/sign-up', '/landingpage'],
  DHVT: [
    '/', '/order/create', '/order/list', '/order/list-trip','/order', '/order/delivery-orders/:orderId', '/order/packing-orders/:orderId',
    '/partner/list', '/customer/list', '/vehicle/create', '/vehicle/list', '/vehicle/detail/:id',
    '/driver/list', '/driver/wage', '/transport-route', '/transport-route/empty-distance',
    '/transport-route/packing/:id', '/transport-route/delivery/:id',
    '/sign-in', '/sign-up', '/landingpage'
  ],
  driver: ['/', '/sign-in', '/sign-up', '/landingpage'],
};

function canAccess(role, path) {
  const allow = ROLE_MENU[role] || [];
  return allow.some((p) => {
    if (p === path) return true;
    if (p.includes(':')) {
      const base = p.split('/:')[0];
      return path.startsWith(base);
    }
    return false;
  });
}

function withRoleGuard(PageComponent, path) {
  return (props) => {
    const user = useSelector((state) => state.user);
    const role = user?.role;
    if (!role || !canAccess(role, path)) {
      return <Navigate to="/" replace />;
    }
    return <PageComponent {...props} />;
  };
}

export const routes = [
  {
    path: '/',
    page: HomePage,
  },
  {
    path: '/sign-in',
    page: SigninPage,
  },
  {
    path: '/sign-up',
    page: SignupPage,
  },
  {
    path: '/landingpage',
    page: LandingPage,
  },
  {
    path: '/vehicle/create',
    page: withRoleGuard(CreateCarPage, '/vehicle/create'),
  },
  {
    path: '/vehicle/list',
    page: withRoleGuard(VehicleListPage, '/vehicle/list'),
  },
  {
    path: '/vehicle/detail/:id',
    page: withRoleGuard(VehicleDetailPage, '/vehicle/detail/:id'),
  },
  {
    path: '/driver/list',
    page: withRoleGuard(DriverListPage, '/driver/list'),
  },
  {
    path: '/driver/wage',
    page: withRoleGuard(DriverWagePage, '/driver/wage'),
  },
  {
    path: '/customer/list',
    page: withRoleGuard(CustommerPage, '/customer/list'),
  },
  {
    path: '/partner/list',
    page: withRoleGuard(PartnerPage, '/partner/list'),
  },
  {
    path: '/transport-route',
    page: withRoleGuard(PartnerCostPage, '/transport-route'),
  },
  {
    path: '/transport-route/empty-distance',
    page: withRoleGuard(EmptyDistance, '/transport-route/empty-distance'),
  },
  {
    path: '/transport-route/packing/:id',
    page: withRoleGuard(PackingDetailCostPage, '/transport-route/packing/:id'),
  },
  {
    path: '/transport-route/delivery/:id',
    page: withRoleGuard(DeliveryDetailCostPage, '/transport-route/delivery/:id'),
  },
  {
    path: '/order/create',
    page: withRoleGuard(CreateOrderPage, '/order/create'),
  },
  {
    path : '/order/list',
    page : withRoleGuard(OrderPage, '/order/list'),
  },
  {
    path : '/order/delivery-orders/:orderId',
    page : withRoleGuard(DeliveryOrderDetailPage, '/order/delivery-orders/:orderId'),
  },
  {
    path : '/order/packing-orders/:orderId',
    page : withRoleGuard(PackingOrderDetailPage, '/order/packing-orders/:orderId'),
  },
  {
    path : '/order/list-trip',
    page : withRoleGuard(OrderTripListPage, '/order/list-trip'),
  },
  {
    path : '/system',
    page : withRoleGuard(SystemDefaultsPage, '/system'),
  },
  {
    path : '/system/account-management',
    page : withRoleGuard(AccountManagementPage, '/system/account-management'),
  },
  {
    path : '/order/cont-status',
    page : withRoleGuard(ContStatus, '/order/cont-status'),
  }
];
