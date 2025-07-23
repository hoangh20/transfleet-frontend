import React from 'react';
import {
  Modal,
  Button,
  Alert,
  Typography,
  Row,
  Col,
  Card,
  message,
} from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import containerTemplate from '../../assets/1truong.xlsx';
import deliveryTemplate from '../../assets/kehoachgiaohang.xlsx';

const { Text } = Typography;

const TemplateDownloadModal = ({ visible, onCancel }) => {
  const handleDownloadTemplate = (templateType) => {
    const templateFiles = {
      container: containerTemplate,
      delivery: deliveryTemplate
    };

    const link = document.createElement('a');
    link.href = templateFiles[templateType];
    link.download = templateType === 'container' ? '1truong.xlsx' : 'kehoachgiaohang.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success(`Đã tải xuống file mẫu ${templateType === 'container' ? 'Container' : 'Kế hoạch giao hàng'}`);
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DownloadOutlined style={{ color: '#52c41a' }} />
          <span>Tải File Mẫu Excel</span>
        </div>
      }
      visible={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>
      ]}
    >
      <Alert
        message="Chọn file mẫu để tải xuống"
        description="Sử dụng các file mẫu dưới đây để đảm bảo định dạng dữ liệu chính xác"
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 16 }}
      />
      
      <Row gutter={16}>
        <Col span={12}>
          <Card 
            size="small" 
            hoverable
            onClick={() => handleDownloadTemplate('container')}
            style={{ cursor: 'pointer', textAlign: 'center', height: 140 }}
          >
            <FileExcelOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <div>
              <Text strong>File up load 1 trường</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>1truong.xlsx</Text>
            </div>
            <Button 
              type="primary" 
              size="small" 
              icon={<DownloadOutlined />}
              style={{ marginTop: 8 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadTemplate('container');
              }}
            >
              Tải xuống
            </Button>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card 
            size="small" 
            hoverable
            onClick={() => handleDownloadTemplate('delivery')}
            style={{ cursor: 'pointer', textAlign: 'center', height: 140 }}
          >
            <FileExcelOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <div>
              <Text strong>File mẫu Kế hoạch giao hàng</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>kehoachgiaohang.xlsx</Text>
            </div>
            <Button 
              type="primary" 
              size="small" 
              icon={<DownloadOutlined />}
              style={{ marginTop: 8 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadTemplate('delivery');
              }}
            >
              Tải xuống
            </Button>
          </Card>
        </Col>
      </Row>

      <Card size="small" title="Hướng dẫn sử dụng file mẫu" style={{ marginTop: 16 }}>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <Text strong>Lưu ý quan trọng:</Text>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            <li>Không thay đổi tên các cột trong file mẫu</li>
            <li>Đảm bảo dữ liệu ngày tháng có định dạng DD/MM/YYYY</li>
            <li>Dữ liệu số không được chứa ký tự đặc biệt</li>
            <li>Điền dữ liệu từ dòng thứ 2 trở đi (dòng 1 là tiêu đề)</li>
          </ul>
        </div>
      </Card>
    </Modal>
  );
};

export default TemplateDownloadModal;