import React, { useState } from 'react';
import { LockOutlined, UserOutlined, PhoneOutlined, MailOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Flex, Image, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { SignupUser } from '../../services/UserService'; // Import hàm SignupUser

const { Title } = Typography;

const SignupPage = () => {
  const navigate = useNavigate(); // Khởi tạo navigate để điều hướng
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const onFinish = async (values) => {
    try {
      const response = await SignupUser(values); // Gọi API đăng ký với dữ liệu từ form
      if (response.status === 'OK') {
        message.success('Tạo tài khoản thành công!'); // Hiển thị thông báo thành công
        navigate('/sign-in'); // Chuyển hướng đến trang đăng nhập
      } else {
        message.error(response.message); // Hiển thị thông báo lỗi nếu có
      }
    } catch (error) {
      console.error('Signup error:', error);
      message.error('Đã xảy ra lỗi khi tạo tài khoản.');
    }
  };

  return (
    <Flex
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
      }}
      justify='center'
      align='center'
    >
      <Flex
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Right side - Image */}
        <div style={{ width: '500px' }}>
          <Image
            src='/sign-up.jpg'
            alt='Decorative statue'
            preview={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Left side - Signup Form */}
        <div
          style={{
            padding: '24px',
            width: '400px',
          }}
        >
          <Flex justify='center' style={{ marginBottom: '24px', flexDirection: 'column', alignItems: 'center' }}>
            <Image
              src='/logo.png'
              alt='TransFleet Logo'
              preview={false}
              height={40}
              style={{ objectFit: 'contain' }}
            />
            <span
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #003082, #38b6ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '80px', 
              }}
            >
              TransFleet
            </span>
            <Title
              level={2}
              style={{
                margin: '24px 0 0 0', 
                color: '#003082',
                textAlign: 'center',
              }}
            >
              Đăng Ký
            </Title>
          </Flex>

          <Form
            name='signup'
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name='name'
              rules={[{ required: true, message: 'Please input your Name!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder='Name' />
            </Form.Item>

            <Form.Item
              name='email'
              rules={[
                { required: true, message: 'Please input your Email!' },
                { type: 'email', message: 'The input is not valid E-mail!' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder='Email' />
            </Form.Item>

            <Form.Item
              name='phone'
              rules={[{ required: true, message: 'Please input your Phone!' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder='Phone' />
            </Form.Item>

            <Form.Item
              name='password'
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input
                prefix={<LockOutlined />}
                type={passwordVisible ? 'text' : 'password'}
                placeholder='Password'
                suffix={
                  passwordVisible ? (
                    <EyeOutlined onClick={() => setPasswordVisible(false)} />
                  ) : (
                    <EyeInvisibleOutlined onClick={() => setPasswordVisible(true)} />
                  )
                }
              />
            </Form.Item>

            {/* Confirm Password Field */}
            <Form.Item
              name='confirmPassword'
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your Password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                  },
                }),
              ]}
            >
              <Input
                prefix={<LockOutlined />}
                type={confirmPasswordVisible ? 'text' : 'password'}
                placeholder='Confirm Password'
                suffix={
                  confirmPasswordVisible ? (
                    <EyeOutlined onClick={() => setConfirmPasswordVisible(false)} />
                  ) : (
                    <EyeInvisibleOutlined onClick={() => setConfirmPasswordVisible(true)} />
                  )
                }
              />
            </Form.Item>

            <Form.Item>
              <Button block type='primary' htmlType='submit'>
                Sign Up
              </Button>
              <Flex justify='center' style={{ marginTop: 16 }}>
                or{' '}
                <a href='/sign-in' style={{ marginLeft: 4 }}>
                  Log in now!
                </a>
              </Flex>
            </Form.Item>
          </Form>
        </div>
      </Flex>
    </Flex>
  );
};

export default SignupPage;
