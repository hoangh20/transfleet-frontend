import React, { useState, useEffect } from 'react';
import { 
  Card, Input, Select, Row, Col, Button, Tag, Typography, Space, Modal, 
  Image, message, Form, Upload, InputNumber,  List, Popconfirm 
} from 'antd';
import { 
  SearchOutlined, EyeOutlined, CheckCircleOutlined, FileOutlined, 
  CloseCircleOutlined, PlusOutlined, UploadOutlined, LoadingOutlined, 
  DeleteOutlined, CheckOutlined 
} from '@ant-design/icons';
import RepairService from '../../services/RepairService';
import { uploadMultipleToCloudinary, uploadFileToCloudinary } from '../../services/CloudinaryService';
import { getAllVehicles } from '../../services/VehicleService';


const { Option } = Select;
const { Text } = Typography;
const { Dragger } = Upload;

const repairStatusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: '0', label: 'Chờ xác nhận' },
  { value: '1', label: 'Đã có báo giá' },
  { value: '2', label: 'Chấp nhận' },
  { value: '3', label: 'Hoàn thành' },
  { value: '4', label: 'Hủy' },
];

const repairTypeOptions = [
  { value: 'all', label: 'Tất cả loại' },
  { value: '0', label: 'Bảo dưỡng' },
  { value: '1', label: 'Sửa chữa' },
  { value: '2', label: 'Thay thế' },
  { value: '3', label: 'Nâng cấp' },
];

const repairTypeColor = {
  0: 'green',     // Bảo dưỡng
  1: 'blue',      // Sửa chữa
  2: 'orange',    // Thay thế
  3: 'purple',    // Nâng cấp
};

const statusColor = {
  0: 'orange',    // Chờ xác nhận
  1: 'purple',    // Đã có báo giá
  2: 'blue',      // Chấp nhận
  3: 'green',     // Hoàn thành
  4: 'red',       // Hủy
};

const RepairPage = () => {
  // State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [repairType, setRepairType] = useState('all');
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewImages, setViewImages] = useState({ visible: false, images: [] });
  const [rejectModal, setRejectModal] = useState({ visible: false, id: null, reason: '' });
  
  // Create repair modal state
  const [createModal, setCreateModal] = useState({ visible: false });
  const [vehicles, setVehicles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  // Quotation modal state
  const [quotationModal, setQuotationModal] = useState({ visible: false, repairId: null });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [quotedCost, setQuotedCost] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Complete repair modal state
  const [completeModal, setCompleteModal] = useState({ visible: false, repairId: null });
  const [actualCost, setActualCost] = useState('');

  useEffect(() => {
    fetchRepairs();
    fetchVehicles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, repairType, search]);

  const fetchVehicles = async () => {
    try {
      const response = await getAllVehicles();
      setVehicles(response.data || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách xe');
    }
  };

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const params = {
        status: status !== 'all' ? status : undefined,
        repairType: repairType !== 'all' ? repairType : undefined,
        headPlate: search || undefined,
        page: 1,
        limit: 50
      };
      const response = await RepairService.getAllRepairs(params);
      setRepairs(response.data || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách sửa chữa');
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (repairId) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        message.error('Không thể xác định người dùng');
        return;
      }
      
      await RepairService.approveRepair(repairId, userId);
      message.success('Duyệt sửa chữa thành công');
      fetchRepairs();
    } catch (error) {
      message.error('Lỗi khi duyệt sửa chữa');
    }
  };

  const handleReject = async (repairId, reason) => {
    if (!reason.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }
    
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        message.error('Không thể xác định người dùng');
        return;
      }

      await RepairService.rejectRepair(repairId, userId, reason);
      message.success('Từ chối sửa chữa thành công');
      setRejectModal({ visible: false, id: null, reason: '' });
      fetchRepairs();
    } catch (error) {
      message.error('Lỗi khi từ chối sửa chữa');
    }
  };

  const handleCreateRepair = async (values) => {
    try {
      setLoading(true);
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        message.error('Không thể xác định người dùng');
        return;
      }

      const repairData = {
        ...values,
        userId,
        VehicleId: values.vehicleId,
        Date: values.Date ? values.Date.toISOString() : new Date().toISOString(),
        images: uploadedImages,
      };

      await RepairService.createRepair(repairData);
      message.success('Tạo yêu cầu sửa chữa thành công');
      setCreateModal({ visible: false });
      form.resetFields();
      setUploadedImages([]);
      fetchRepairs();
    } catch (error) {
      message.error('Lỗi khi tạo yêu cầu sửa chữa');
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh minh họa cho yêu cầu sửa chữa
  const handleImageUpload = async ({ fileList }) => {
    if (fileList.length === 0) {
      setUploadedImages([]);
      return;
    }

    setUploading(true);
    try {
      const files = fileList.map(file => file.originFileObj).filter(Boolean);
      if (files.length > 0) {
        const imageUrls = await uploadMultipleToCloudinary(files);
        setUploadedImages(imageUrls);
        message.success(`Upload ${imageUrls.length} ảnh thành công`);
      }
    } catch (error) {
      message.error('Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  // Upload file báo giá
  const handleQuotationFileUpload = async ({ file }) => {
    setUploadingFile(true);
    try {
      const fileData = await uploadFileToCloudinary(file);
      
      // Gọi API thêm file báo giá
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      await RepairService.addQuotationFile(quotationModal.repairId, fileData.url, userId);
      
      // Thêm file vào danh sách đã upload với tên gốc
      const newFile = {
        name: fileData.originalName, // Sử dụng tên file gốc
        url: fileData.url,
        uid: Date.now().toString()
      };
      setUploadedFiles(prev => [...prev, newFile]);
      
      message.success('Upload file báo giá thành công');
      fetchRepairs();
    } catch (error) {
      message.error('Lỗi khi upload file báo giá');
    } finally {
      setUploadingFile(false);
    }
  };

  // Lấy tên file từ URL - cải thiện để hiển thị tên file gốc
  const getFileNameFromUrl = (url) => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Nếu file được upload với public_id có timestamp, loại bỏ timestamp
      const cleanName = fileName.replace(/_\d{13}/, ''); // Loại bỏ timestamp 13 chữ số
      
      return cleanName.length > 30 ? cleanName.substring(0, 30) + '...' : cleanName;
    } catch (error) {
      return 'File báo giá';
    }
  };



  const getRepairTypeName = (type) => {
    const typeMap = { 0: 'Bảo dưỡng', 1: 'Sửa chữa', 2: 'Thay thế', 3: 'Nâng cấp' };
    return typeMap[type] || 'Không xác định';
  };

  const getStatusName = (status) => {
    const statusMap = { 
      0: 'Chờ xác nhận', 
      1: 'Đã có báo giá', 
      2: 'Chấp nhận', 
      3: 'Hoàn thành', 
      4: 'Hủy' 
    };
    return statusMap[status] || 'Không xác định';
  };

  // Props cho upload ảnh minh họa
  const imageUploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*',
    beforeUpload: () => false,
    onChange: handleImageUpload,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
  };

  // Props cho upload file báo giá
  const fileUploadProps = {
    name: 'file',
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt',
    beforeUpload: () => false,
    onChange: handleQuotationFileUpload,
    showUploadList: false,
  };

  // Thêm hàm xóa repair
  const handleDeleteRepair = async (repairId) => {
    try {
      await RepairService.deleteRepair(repairId);
      message.success('Xóa yêu cầu sửa chữa thành công');
      fetchRepairs();
    } catch (error) {
      message.error('Lỗi khi xóa yêu cầu sửa chữa');
    }
  };

  // Thêm hàm xử lý cập nhật báo giá
  const handleUpdateQuotation = async () => {
    if (!quotedCost || quotedCost <= 0) {
      message.error('Vui lòng nhập chi phí báo giá hợp lệ');
      return;
    }

    try {
      setLoading(true);
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        message.error('Không thể xác định người dùng');
        return;
      }

      await RepairService.updateQuotedCost(quotationModal.repairId, quotedCost, userId);
      message.success('Cập nhật báo giá thành công');

      setQuotationModal({ visible: false, repairId: null });
      setQuotedCost('');
      setUploadedFiles([]);

      fetchRepairs();
    } catch (error) {
      message.error('Lỗi khi cập nhật báo giá');
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm xử lý hoàn thành repair
  const handleCompleteRepair = async () => {
    try {
      setLoading(true);
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        message.error('Không thể xác định người dùng');
        return;
      }

      const actualCostValue = actualCost && actualCost > 0 ? actualCost : null;
      await RepairService.completeRepair(completeModal.repairId, userId, actualCostValue);
      message.success('Hoàn thành sửa chữa thành công');
      
      // Đóng modal và reset state
      setCompleteModal({ visible: false, repairId: null });
      setActualCost('');
      
      // Refresh danh sách
      fetchRepairs();
    } catch (error) {
      message.error('Lỗi khi hoàn thành sửa chữa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={6}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm theo biển số xe"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            value={status}
            onChange={setStatus}
            style={{ width: '100%' }}
            placeholder="Chọn trạng thái"
          >
            {repairStatusOptions.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={6}>
          <Select
            value={repairType}
            onChange={setRepairType}
            style={{ width: '100%' }}
            placeholder="Chọn loại sửa chữa"
          >
            {repairTypeOptions.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={6}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModal({ visible: true })}
            style={{ width: '100%' }}
          >
            Tạo yêu cầu sửa chữa
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {repairs.map(repair => (
          <Col xs={24} md={12} lg={8} key={repair._id}>
            <Card
              loading={loading}
              title={
                <Space>
                  <Tag color={statusColor[repair.status] || 'default'}>
                    {getStatusName(repair.status)}
                  </Tag>
                  <Text strong>{repair.VehicleId?.headPlate || 'Không xác định'}</Text>
                </Space>
              }
              extra={
                <Space>
                  {repair.status === 0 && (
                    <>
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        size="small"
                        onClick={() => {
                          setQuotationModal({ visible: true, repairId: repair._id });
                          setUploadedFiles([]);
                          setQuotedCost('');
                        }}
                      >
                        Tạo báo giá
                      </Button>
                      <Popconfirm
                        title="Xóa yêu cầu sửa chữa"
                        description="Bạn có chắc chắn muốn xóa yêu cầu sửa chữa này?"
                        onConfirm={() => handleDeleteRepair(repair._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          title="Xóa yêu cầu sửa chữa"
                        />
                      </Popconfirm>
                    </>
                  )}
                  {repair.status === 1 && (
                    <>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        size="small"
                        onClick={() => handleAccept(repair._id)}
                        style={{ marginRight: 8 }}
                      >
                        Duyệt
                      </Button>
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        size="small"
                        onClick={() => setRejectModal({ visible: true, id: repair._id, reason: '' })}
                      >
                        Từ chối
                      </Button>
                    </>
                  )}
                  {repair.status === 2 && (
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      size="small"
                      onClick={() => {
                        setCompleteModal({ visible: true, repairId: repair._id });
                        setActualCost('');
                      }}
                      style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                      Hoàn thành
                    </Button>
                  )}
                </Space>
              }
              style={{ minHeight: 380 }}
            >
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text type="secondary">
                  Thời gian: {new Date(repair.Date).toLocaleString('vi-VN')}
                </Text>
                <Text>
                  Người tạo: {repair.userId?.name || 'Không xác định'}
                </Text>
                <Text>
                  Tài xế: {repair.driver?.name || 'Không xác định'} - {repair.driver?.phone || 'Không có SĐT'}
                </Text>
                <div>
                  <Text>Loại sửa chữa: </Text>
                  <Tag color={repairTypeColor[repair.repairType] || 'default'}>
                    {getRepairTypeName(repair.repairType)}
                  </Tag>
                </div>
                <Text>Mô tả: {repair.description}</Text>
                
                {repair.images && repair.images.length > 0 && (
                  <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => setViewImages({ visible: true, images: repair.images })}
                  >
                    Xem ảnh ({repair.images.length})
                  </Button>
                )}
                
                
                {repair.quotedCost && (
                  <Text>
                    Báo giá: <b>{repair.quotedCost.toLocaleString()} đ</b>
                  </Text>
                )}
                
                {/* Hiển thị thông tin người báo giá */}
                {repair.userQuote && (
                  <Text type="secondary">
                    Người báo giá: <b>{repair.userQuote.name || repair.userQuote}</b>
                  </Text>
                )}
                
                {/* Hiển thị file báo giá */}
                {repair.quotationFile && repair.quotationFile.length > 0 && (
                  <div>
                    <Text strong>File báo giá ({repair.quotationFile.length}):</Text>
                    <div style={{ marginTop: 4 }}>
                      {repair.quotationFile.map((fileUrl, index) => {
                        const fileName = getFileNameFromUrl(fileUrl);
                        return (
                          <div key={index} style={{ marginBottom: 4 }}>
                            <Button
                              type="link"
                              icon={<FileOutlined />}
                              size="small"
                              onClick={() => window.open(fileUrl, '_blank')}
                              style={{ padding: 0, height: 'auto' }}
                              title={fileName}
                            >
                              {fileName}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Hiển thị chi phí thực tế và người hoàn thành */}
                {repair.status === 3 && (
                  <div>
                    {repair.cost && (
                      <Text>
                        Chi phí thực tế: <b style={{ color: '#52c41a' }}>{repair.cost.toLocaleString()} đ</b>
                      </Text>
                    )}
                    {repair.completedBy && (
                      <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                        Người hoàn thành: <b>{repair.completedBy.name || 'Không xác định'}</b>
                      </Text>
                    )}
                    {repair.completedAt && (
                      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                        Hoàn thành lúc: {new Date(repair.completedAt).toLocaleString('vi-VN')}
                      </Text>
                    )}
                  </div>
                )}
                
                {/* Hiển thị lý do hủy */}
                {repair.status === 4 && repair.cancelReason && (
                  <div>
                    <Tag color="red">Lý do hủy: {repair.cancelReason}</Tag>
                    {repair.userConfirm && (
                      <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                        Người từ chối: <b>{repair.userConfirm.name}</b>
                      </Text>
                    )}
                  </div>
                )}
                { repair.userConfirm && repair.status !== 4 && (
                  <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                    Người xác nhận: <b>{repair.userConfirm.name}</b>
                  </Text>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal tạo yêu cầu sửa chữa */}
      <Modal
        open={createModal.visible}
        title="Tạo yêu cầu sửa chữa mới"
        okText="Tạo yêu cầu"
        cancelText="Hủy"
        onOk={() => form.submit()}
        onCancel={() => {
          setCreateModal({ visible: false });
          form.resetFields();
          setUploadedImages([]);
        }}
        width={700}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRepair}
        >
          <Form.Item
            name="vehicleId"
            label="Chọn xe"
            rules={[{ required: true, message: 'Vui lòng chọn xe' }]}
          >
            <Select placeholder="Chọn xe cần sửa chữa">
              {vehicles.map(vehicle => (
                <Option key={vehicle._id} value={vehicle._id}>
                  {vehicle.headPlate} - {vehicle.moocPlate}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="repairType"
            label="Loại sửa chữa"
            rules={[{ required: true, message: 'Vui lòng chọn loại sửa chữa' }]}
          >
            <Select placeholder="Chọn loại sửa chữa">
              {repairTypeOptions.filter(opt => opt.value !== 'all').map(opt => (
                <Option key={opt.value} value={parseInt(opt.value)}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea rows={4} placeholder="Mô tả chi tiết về vấn đề cần sửa chữa" />
          </Form.Item>

          <Form.Item
            name="cost"
            label="Chi phí ước tính (VND)"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập chi phí ước tính"
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item label="Ảnh minh họa">
            <Dragger {...imageUploadProps}>
              <p className="ant-upload-drag-icon">
                {uploading ? <LoadingOutlined /> : <UploadOutlined />}
              </p>
              <p className="ant-upload-text">
                {uploading ? 'Đang upload...' : 'Kéo thả hoặc click để chọn ảnh'}
              </p>
              <p className="ant-upload-hint">
                Hỗ trợ upload nhiều ảnh cùng lúc. Chỉ chấp nhận file ảnh.
              </p>
            </Dragger>
            {uploadedImages.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Đã upload {uploadedImages.length} ảnh thành công</Text>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal tạo báo giá */}
      <Modal
        open={quotationModal.visible}
        title="Tạo báo giá sửa chữa"
        footer={[
          <Button key="cancel" onClick={() => {
            setQuotationModal({ visible: false, repairId: null });
            setQuotedCost('');
            setUploadedFiles([]);
          }}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary"
            disabled={!quotedCost || quotedCost <= 0}
            loading={loading}
            onClick={handleUpdateQuotation}
          >
            Cập nhật báo giá
          </Button>
        ]}
        width={500}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Text strong>Chi phí báo giá (VND): <Text type="danger">*</Text></Text>
            <InputNumber
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Nhập chi phí báo giá"
              value={quotedCost}
              onChange={setQuotedCost}
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chi phí báo giá là bắt buộc để hoàn thành quy trình
            </Text>
          </div>
          
          <div>
            <Text strong>Upload file báo giá (tùy chọn):</Text>
            <Upload {...fileUploadProps} style={{ marginTop: 8 }}>
              <Button 
                icon={uploadingFile ? <LoadingOutlined /> : <UploadOutlined />}
                loading={uploadingFile}
                style={{ width: '100%' }}
              >
                {uploadingFile ? 'Đang upload...' : 'Chọn file báo giá'}
              </Button>
            </Upload>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hỗ trợ: PDF, Word, Excel, Text (tối đa 10MB)
            </Text>
            
            {/* Hiển thị danh sách file đã upload */}
            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <Text strong>File đã upload ({uploadedFiles.length}):</Text>
                <List
                  size="small"
                  dataSource={uploadedFiles}
                  renderItem={(file) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          size="small"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          Xem
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<FileOutlined />}
                        title={file.name}
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
          
          <div style={{ 
            padding: '8px 12px', 
            backgroundColor: '#f6f6f6', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <Text type="secondary">
              Người báo giá: <b>{JSON.parse(localStorage.getItem('user'))?.name || 'Không xác định'}</b>
            </Text>
          </div>
        </Space>
      </Modal>

      {/* Modal hoàn thành sửa chữa */}
      <Modal
        open={completeModal.visible}
        title="Hoàn thành sửa chữa"
        footer={[
          <Button key="cancel" onClick={() => {
            setCompleteModal({ visible: false, repairId: null });
            setActualCost('');
          }}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary"
            loading={loading}
            onClick={handleCompleteRepair}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Hoàn thành
          </Button>
        ]}
        width={400}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Text strong>Chi phí thực tế (VND) - Tùy chọn:</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Nhập chi phí thực tế"
              value={actualCost}
              onChange={setActualCost}
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Để trống nếu không có thông tin chi phí thực tế
            </Text>
          </div>
          
        </Space>
      </Modal>

      <Modal
        open={viewImages.visible}
        title="Ảnh sửa chữa"
        footer={null}
        onCancel={() => setViewImages({ visible: false, images: [] })}
        width={600}
      >
        <Image.PreviewGroup>
          {viewImages.images.map((img, idx) => (
            <Image key={idx} src={img} style={{ maxHeight: 300, marginBottom: 8 }} />
          ))}
        </Image.PreviewGroup>
      </Modal>

      <Modal
        open={rejectModal.visible}
        title="Nhập lý do từ chối"
        okText="Từ chối"
        cancelText="Hủy"
        onOk={() => handleReject(rejectModal.id, rejectModal.reason)}
        onCancel={() => setRejectModal({ visible: false, id: null, reason: '' })}
      >
        <Input.TextArea
          rows={3}
          placeholder="Nhập lý do từ chối"
          value={rejectModal.reason}
          onChange={e => setRejectModal(r => ({ ...r, reason: e.target.value }))}
        />
      </Modal>
    </div>
  );
};

export default RepairPage;