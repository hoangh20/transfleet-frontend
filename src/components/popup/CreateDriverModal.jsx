import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Upload,
  message,
} from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { createDriver } from '../../services/DriverService';

const CreateDriverModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (!file) {
        message.error('Vui lòng tải lên ảnh đại diện!');
        setLoading(false);
        return;
      }

      // Tạo FormData và thêm từng trường riêng biệt
      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('citizenID', values.citizenID.trim()); // Thêm dòng này
      formData.append('phone', values.phone.trim());
      formData.append('hometown', values.hometown.trim());
      formData.append('birthDate', values.birthDate.toISOString());
      formData.append('licenseType', values.licenseType);
      formData.append('yearsOfExperience', values.yearsOfExperience);
      formData.append('bankAccount', values.bankAccount.trim());
      formData.append('avatar', file);

      // Log để debug
      for (let pair of formData.entries()) {
        console.log('FormData entry:', pair[0], pair[1]);
      }

      try {
        const response = await createDriver(formData);
        console.log('Server response:', response);

        if (response && response.data) {
          message.success('Tạo mới lái xe thành công!');
          form.resetFields();
          setImageUrl('');
          setFile(null);
          onSuccess();
        }
      } catch (apiError) {
        console.error('API Error Response:', apiError.response);
        const errorMessage =
          apiError.response?.data?.error || 'Có lỗi xảy ra khi tạo mới lái xe!';
        message.error(errorMessage);
      }
    } catch (error) {
      console.error('Form validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      setFile(info.file.originFileObj);
      setImageUrl(URL.createObjectURL(info.file.originFileObj));
    } else if (info.file.status === 'error') {
      message.error('Tải ảnh lên thất bại!');
    }
    setLoading(false);
  };

  // Custom upload handler
  const customRequest = ({ file, onSuccess }) => {
    setFile(file);
    setTimeout(() => {
      onSuccess();
    }, 0);
  };

  return (
    <Modal
      title='Thêm mới lái xe'
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          yearsOfExperience: 0,
        }}
      >
        <Form.Item
          name='avatar'
          label='Ảnh đại diện'
          rules={[
            { required: true, message: 'Vui lòng tải lên ảnh đại diện!' },
          ]}
        >
          <Upload
            name='avatar'
            listType='picture-card'
            className='avatar-uploader'
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleImageChange}
            customRequest={customRequest}
          >
            {imageUrl ? (
              <img src={imageUrl} alt='avatar' style={{ width: '100%' }} />
            ) : (
              <div>
                {loading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item
          name='name'
          label='Họ và tên'
          rules={[
            { required: true, message: 'Vui lòng nhập họ tên!' },
            { whitespace: true, message: 'Không được chỉ nhập khoảng trắng!' },
          ]}
        >
          <Input placeholder='Nhập họ và tên' />
        </Form.Item>

        <Form.Item
          name='phone'
          label='Số điện thoại'
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' },
          ]}
        >
          <Input placeholder='Nhập số điện thoại' maxLength={10} />
        </Form.Item>
        <Form.Item
          name='hometown'
          label='Quê quán'
          rules={[
            { required: true, message: 'Vui lòng nhập quê quán lái xe' },
            { whitespace: true, message: 'Không được chỉ nhập khoảng trắng!' },
          ]}
        >
          <Input placeholder='Nhập quê quán lái xe' />
        </Form.Item>

        <Form.Item
          name='birthDate'
          label='Ngày sinh'
          rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format='DD/MM/YYYY'
            placeholder='Chọn ngày sinh'
          />
        </Form.Item>

        <Form.Item
          name='licenseType'
          label='Loại bằng lái'
          rules={[{ required: true, message: 'Vui lòng chọn loại bằng lái!' }]}
        >
          <Select placeholder='Chọn loại bằng lái'>
            <Select.Option value='FB2'>FB2</Select.Option>
            <Select.Option value='FC'>FC</Select.Option>
            <Select.Option value='FD'>FD</Select.Option>
            <Select.Option value='FE'>FE</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name='yearsOfExperience'
          label='Số năm kinh nghiệm'
          rules={[
            { required: true, message: 'Vui lòng nhập số năm kinh nghiệm!' },
          ]}
        >
          <InputNumber
            min={0}
            max={50}
            style={{ width: '100%' }}
            placeholder='Nhập số năm kinh nghiệm'
          />
        </Form.Item>

        <Form.Item
          name='bankAccount'
          label='Tài khoản ngân hàng'
          rules={[
            { required: true, message: 'Vui lòng nhập tài khoản ngân hàng!' },
            { whitespace: true, message: 'Không được chỉ nhập khoảng trắng!' },
          ]}
        >
          <Input placeholder='Nhập tài khoản ngân hàng (VD: MB - 20092222)' />
        </Form.Item>

        <Form.Item
          name='citizenID'
          label='CCCD/CMND'
          rules={[
            { required: true, message: 'Vui lòng nhập số CCCD/CMND!' },
            { pattern: /^[0-9]{9,12}$/, message: 'CCCD/CMND phải là 9-12 số!' },
            { whitespace: true, message: 'Không được chỉ nhập khoảng trắng!' },
          ]}
        >
          <Input placeholder='Nhập số CCCD/CMND' maxLength={12} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDriverModal;
