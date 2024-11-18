import React from 'react';
import { Layout } from 'antd';
import AdminHeader from '../header/header';
import AdminMenu from '../menu/adminmenu';
import AppBreadcrumb from '../breadcrumb/Breadcrumb';

const { Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Fixed Header */}
      <div
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}
      >
        <AdminHeader />
      </div>

      {/* Layout with Fixed Sidebar and Scrollable Content */}
      <Layout style={{ marginTop: 64 }}>
        <Sider
          width={300}
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            bottom: 0,
            overflow: 'auto',
            zIndex: 1000,
            backgroundColor: '#001529',
          }}
        >
          <AdminMenu />
        </Sider>

        {/* Main Content Area */}
        <Layout
          style={{
            marginLeft: 300,
            padding: '0 24px 24px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              marginTop: 20,
            }}
          >
            <AppBreadcrumb />
          </div>

          <Content
          //
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
