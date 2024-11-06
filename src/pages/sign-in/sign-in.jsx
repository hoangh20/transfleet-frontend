import React, { useState } from 'react';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, Image, Typography } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as UserService from '../../services/UserService';
import { jwtDecode } from 'jwt-decode';
import {updateUser} from '../../redux/slice/userSlice'
import { useDispatch } from 'react-redux';

const { Title } = Typography;

const SigninPage = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: data => UserService.SigninUser(data),
    onSuccess: (data) => {
      // Kiểm tra nếu có access_token trong response
      const accessToken = data?.access_token;
      
      if (accessToken) {
        localStorage.setItem('access_token', JSON.stringify(accessToken));
        

        const decoded = jwtDecode(accessToken);
        localStorage.setItem('user', JSON.stringify(decoded));
        if (decoded?.id) {
          handleGetDetailsUser(decoded?.id, data?.access_token )
        }
      }

      navigate('/');
    },
    onError: (error) => {
      console.error("Đăng nhập thất bại:", error);
    },
  });
  const handleGetDetailsUser = async (id, token) => {
    const res = await UserService.getDetailsUser(id, token)
    dispatch(updateUser({...res?.data, access_token: token}))
  }
  const onFinish = (values) => {
    const { email, password } = values;
    mutation.mutate({ email, password });
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
        {/* Left side - Login Form */}
        <div
          style={{
            padding: '48px 24px',
            width: '400px',
          }}
        >
          <Flex vertical align='center' style={{ marginBottom: '32px' }}>
            <Image
              src='/logo.png'
              alt='TransFleet Logo'
              preview={false}
              height={40}
              style={{
                objectFit: 'contain',
                marginBottom: '16px',
              }}
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
                margin: 0,
                color: '#003082',
                marginBottom: '24px',
              }}
            >
              SIGN IN
            </Title>
          </Flex>

          <Form
            form={form}
            name='login'
            initialValues={{ remember: true }}
            size='large'
            onFinish={onFinish}
          >
            <Form.Item
              name='email'
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                {
                  pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                  message: 'Email không đúng định dạng!',
                },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder='Email' />
            </Form.Item>
            <Form.Item
              name='password'
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input
                prefix={<LockOutlined />}
                type={showPassword ? 'text' : 'password'}
                placeholder='Mật khẩu'
                suffix={
                  showPassword ? (
                    <EyeTwoTone onClick={() => setShowPassword(false)} />
                  ) : (
                    <EyeInvisibleOutlined onClick={() => setShowPassword(true)} />
                  )
                }
              />
            </Form.Item>
            <Form.Item>
              <Flex justify='space-between' align='center'>
                <Form.Item name='remember' valuePropName='checked' noStyle>
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <a href='/forgot-password'>Quên mật khẩu?</a>
              </Flex>
            </Form.Item>

            <Form.Item>
              <Button
                block
                type='primary'
                htmlType='submit'
                size='large'
                style={{
                  backgroundColor: '#003082',
                }}
              >
                Đăng nhập
              </Button>
              <Flex justify='center' style={{ marginTop: 16 }}>
                hoặc{' '}
                <a href='/sign-up' style={{ marginLeft: 4 }}>
                  Đăng ký ngay!
                </a>
              </Flex>
            </Form.Item>
          </Form>
        </div>

        {/* Right side - Image */}
        <div style={{ width: '500px' }}>
          <Image
            src='/sign-in.jpg'
            alt='Decorative statue'
            preview={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </Flex>
    </Flex>
  );
};

export default SigninPage;
