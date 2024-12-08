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
import TicketCreatePage from '../pages/ticket/create';
import TicketListPage from '../pages/ticket/index';
import TicketDetailPage from '../pages/ticket/ticketDetailPage';
import PartnerPage from '../pages/Partner/index';
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
    path: '/ticket/create',
    page: TicketCreatePage,
  },
  {
    path: '/ticket/list',
    page: TicketListPage,
  },
  {
    path: '/ticket/detail/:id',
    page: TicketDetailPage,
  },
  {
    path: '/partner/list',
    page: PartnerPage,
  },
];
