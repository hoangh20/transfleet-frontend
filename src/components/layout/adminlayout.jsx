import React, { useState } from 'react';
import { Layout } from 'antd';
import AdminHeader from '../header/header';
import AdminMenu from '../menu/adminmenu';
import AppBreadcrumb from '../breadcrumb/Breadcrumb';

const { Sider, Content } = Layout;

// Các hằng số định nghĩa chiều rộng cho Sider khi mở rộng và thu gọn
const SIDER_WIDTH = 300;
const COLLAPSED_WIDTH = 80;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const toggleMenu = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header cố định chứa 1 nút toggle được định vị chồng lên Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <AdminHeader />
        {/* Nút toggle duy nhất, định vị tại giao nhau giữa Header và Sider */}
      </div>

      {/* Layout chứa Sider và phần Content bên dưới Header */}
      <Layout style={{ marginTop: 64 }}>
        <Sider
          width={SIDER_WIDTH}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            bottom: 0,
            overflow: 'auto',
            zIndex: 1000,
            backgroundColor: '#001529',
            transition: 'all 0.2s'
          }}
        >
          <AdminMenu />
        </Sider>

        <Layout
          style={{
            marginLeft: collapsed ? COLLAPSED_WIDTH : SIDER_WIDTH,
            padding: '24px',
            transition: 'margin-left 0.2s'
          }}
        >
          <AppBreadcrumb />
          <Content>{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
