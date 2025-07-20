import React from 'react';
import {
  Modal,
  Button,
  Row,
  Col,
  DatePicker,
  Alert,
  Typography,
} from 'antd';
import { SyncOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DateRangeModal = ({
  visible,
  onCancel,
  onConfirm,
  dateRange,
  onDateRangeChange,
  loading,
}) => {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SyncOutlined style={{ color: '#1890ff' }} />
          <span>Chọn Khoảng Ngày Lấy Dữ Liệu</span>
        </div>
      }
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button 
          key="confirm" 
          type="primary" 
          onClick={onConfirm}
          loading={loading}
        >
          Lấy Dữ Liệu
        </Button>
      ]}
      width={500}
    >
      <div style={{ padding: '20px 0' }}>
        <Alert
          message="Chọn khoảng ngày để lấy dữ liệu từ Điều hành vận tải"
          description="Nếu không chọn ngày, hệ thống sẽ lấy tất cả dữ liệu có sẵn."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Từ ngày:</Text>
            </div>
            <DatePicker
              placeholder="Chọn ngày bắt đầu"
              style={{ width: '100%' }}
              value={dateRange.startDate}
              onChange={(date) => onDateRangeChange('startDate', date)}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Đến ngày:</Text>
            </div>
            <DatePicker
              placeholder="Chọn ngày kết thúc"
              style={{ width: '100%' }}
              value={dateRange.endDate}
              onChange={(date) => onDateRangeChange('endDate', date)}
              format="DD/MM/YYYY"
              disabledDate={(current) => {
                return dateRange.startDate && current && current < dateRange.startDate;
              }}
            />
          </Col>
        </Row>
        
        {dateRange.startDate && dateRange.endDate && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
            <Text type="success">
              <CheckCircleOutlined /> Sẽ lấy dữ liệu từ {dateRange.startDate.format('DD/MM/YYYY')} đến {dateRange.endDate.format('DD/MM/YYYY')}
            </Text>
          </div>
        )}
        
        {(!dateRange.startDate && !dateRange.endDate) && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: 6 }}>
            <Text type="warning">
              <InfoCircleOutlined /> Sẽ lấy tất cả dữ liệu có sẵn
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DateRangeModal;