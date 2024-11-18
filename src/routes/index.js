import HomePage from '../pages/homepage/homepage';
import CreateCarPage from '../pages/vehicle/create';
import LandingPage from '../pages/LandingPage/landingpage';
import VehicleListPage from '../pages/vehicle/index';
import SigninPage from '../pages/sign-in/sign-in';
import SignupPage from '../pages/sign-up/sign-up';
import DriverListPage from '../pages/driver/index';
import DriverWagePage from '../pages/driver/wage'
import VehicleDetailPage from '../pages/vehicle/VehicleDetailPage'
import CustommerPage from '../pages/customer/index'
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
  }
];
