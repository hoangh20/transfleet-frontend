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
    page: CreateCarPage,
  },
  {
    path: '/vehicle/list',
    page: VehicleListPage,
  },
  {
    path: '/vehicle/detail/:id',
    page: VehicleDetailPage,
  },
  {
    path: '/driver/list',
    page: DriverListPage,
  },
  {
    path: '/driver/wage',
    page: DriverWagePage,
  },
  {
    path: '/customer/list',
    page: CustommerPage,
  },
  {
    path: '/partner/list',
    page: PartnerPage,
  },
  {
    path: '/transport-route',
    page: PartnerCostPage,
  },
  {
    path: '/transport-route/empty-distance',
    page: EmptyDistance,
  },
  {
    path: '/transport-route/packing/:id',
    page: PackingDetailCostPage,
  },
  {
    path: '/transport-route/delivery/:id',
    page: DeliveryDetailCostPage,
  },
  {
    path: '/order/create',
    page: CreateOrderPage,
  },
  {
    path : '/order/list',
    page : OrderPage,
  },
  {
    path : '/order/delivery-orders/:orderId',
    page : DeliveryOrderDetailPage
  },
  {
    path : '/order/packing-orders/:orderId',
    page : PackingOrderDetailPage
  },
  {
    path : '/order/list-trip',
    page : OrderTripListPage
  },
  {
    path : '/system',
    page : SystemDefaultsPage
  },
  {
    path : '/system/account-management',
    page : AccountManagementPage
  },
  {
    path : '/order/cont-status',
    page : ContStatus
  }
];
