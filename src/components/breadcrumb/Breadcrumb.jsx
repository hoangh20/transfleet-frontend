import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

const breadcrumbNameMap = {
  '/': 'Tổng quan',
  '/vehicle': 'Quản lý xe',
  '/vehicle/create': 'Thêm mới xe',
  '/vehicle/list': 'Danh sách xe',
  '/driver': 'Quản lý lái xe',
  '/driver/create': 'Thêm mới lái xe',
  '/driver/list': 'Danh sách lái xe',
  '/driver/wage': 'Lương thưởng',
  '/operation': 'Quản lý hoạt động',
  '/customer': 'Khách hàng',
  '/customer/list': 'Danh sách ',
  '/partner': 'Đội xe đối tác',
  '/partner/list': 'Danh sách',
  '/partner/cost': 'Chi phí vận tải',
  '/ticket/create': 'Thêm chuyến mới',
  '/ticket': 'Chuyến vận chuyển',
  '/ticket/list': 'Danh sách chuyến',
  '/ticket/detail/:id': 'Chi tiết chuyến',
};

const nonClickablePaths = [
  '/vehicle',
  '/driver',
  '/fixed-transport',
  '/transport-trip',
  '/operation',
  '/customer',
  '/ticket',
];

const AppBreadcrumb = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);

  const extraBreadcrumbItems = pathSnippets
    .map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const isCurrentPage = index === pathSnippets.length - 1;
      const isNonClickable = nonClickablePaths.includes(url);

      // Avoid displaying the vehicle ID twice (e.g., /vehicle/123/123)
      if (
        snippet === pathSnippets[pathSnippets.length - 1] &&
        pathSnippets.length > 1
      ) {
        const lastSegment = pathSnippets[pathSnippets.length - 1];
        // If the last segment is the same as the second last, skip it
        if (lastSegment === pathSnippets[pathSnippets.length - 2]) {
          return null;
        }
      }

      return (
        <Breadcrumb.Item key={url}>
          {isCurrentPage ? (
            <span
              style={{
                fontWeight: 'bold',
                fontSize: '18px',
                color: '#1677ff',
                lineHeight: '24px',
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
            >
              {breadcrumbNameMap[url] || snippet}
            </span>
          ) : isNonClickable ? (
            <span
              style={{
                lineHeight: '24px',
                display: 'inline-block',
                verticalAlign: 'middle',
                color: '#000',
              }}
            >
              {breadcrumbNameMap[url]}
            </span>
          ) : (
            <Link
              to={url}
              style={{
                lineHeight: '24px',
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
            >
              {breadcrumbNameMap[url] || snippet}
            </Link>
          )}
        </Breadcrumb.Item>
      );
    })
    .filter((item) => item !== null); // Filter out any null items

  const breadcrumbItems =
    location.pathname !== '/'
      ? [
          <Breadcrumb.Item key='home'>
            <Link
              to='/'
              style={{
                lineHeight: '24px',
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
            >
              Tổng quan
            </Link>
          </Breadcrumb.Item>,
        ].concat(extraBreadcrumbItems)
      : extraBreadcrumbItems;

  return (
    <Breadcrumb
      style={{
        margin: '16px 0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {breadcrumbItems}
    </Breadcrumb>
  );
};

export default AppBreadcrumb;
