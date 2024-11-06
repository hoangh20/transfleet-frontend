// UserDrop.jsx
import React from 'react';
import { Dropdown, Menu, Avatar, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined,
} from '@ant-design/icons';
import { signoutUser } from '../../services/UserService'; 
import { useDispatch } from 'react-redux';
import { resetUser } from '../../redux/slice/userSlice';

const UserDrop = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signoutUser(); // Gọi hàm đăng xuất từ API
      // Xóa cả access token và refresh token
      localStorage.removeItem('access_token'); // Đảm bảo tên này chính xác với token của bạn
      localStorage.removeItem('refresh_token'); // Xóa refresh token
      localStorage.removeItem('user'); // Xóa thông tin người dùng
      
      message.success('Đăng xuất thành công');
      navigate('/sign-in'); // Chuyển hướng về trang đăng nhập
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Đã có lỗi xảy ra khi đăng xuất');
    }
    dispatch(resetUser()); // Reset state user trong Redux
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Tài khoản</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/settings">Cài đặt</Link>
      </Menu.Item>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        style={{ color: '#ff4d4f' }}
        onClick={handleLogout}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Avatar
        size='large'
        src='https://free.clipartof.com/855-Free-Clipart-Of-A-Male-Avatar.jpg'
        style={{
          border: '2px solid #38b6ff',
          padding: '2px',
          borderRadius: '50%',
        }}
      />
    </Dropdown>
  );
};

export default UserDrop;
