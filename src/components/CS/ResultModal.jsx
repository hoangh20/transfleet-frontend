import React from 'react';
import {
  Modal,
  Button,
  Row,
  Col,
  Card,
  Statistic,
  Alert,
  List,
  Typography,
  Tag,
} from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const ResultModal = ({
  visible,
  onCancel,
  createResult,
}) => {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InfoCircleOutlined style={{ color: '#1890ff' }} />
          <span>Lấy dữ liệu Container từ Điều hành vận tải</span>
        </div>
      }
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" type="primary" onClick={onCancel}>
          Đóng
        </Button>
      ]}
      width={800}
    >
      {createResult && (
        <div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Tổng Đơn Xử Lý" 
                  value={createResult.data?.totalProcessed || 0}
                  prefix={<InfoCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Thành Công" 
                  value={createResult.data?.successCount || 0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Thất Bại" 
                  value={createResult.data?.failedCount || 0}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Alert
            message={createResult.message}
            type={createResult.data?.successCount > 0 ? 'success' : 'warning'}
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* Chi tiết kết quả */}
          {createResult.data?.results && createResult.data.results.length > 0 && (
            <Card title="Chi Tiết Kết Quả" size="small">
              <List
                size="small"
                dataSource={createResult.data.results}
                pagination={{ pageSize: 5, size: 'small' }}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <Row justify="space-between" align="middle">
                        <Col span={6}>
                          <Text strong>{item.containerNumber || 'N/A'}</Text>
                        </Col>
                        <Col span={4}>
                          <Tag color={item.success ? 'green' : 'red'}>
                            {item.success ? (
                              <><CheckCircleOutlined /> Thành công</>
                            ) : (
                              <><CloseCircleOutlined /> Thất bại</>
                            )}
                          </Tag>
                        </Col>
                        <Col span={14}>
                          <Text 
                            type={item.success ? 'success' : 'danger'}
                            style={{ fontSize: '12px' }}
                          >
                            {item.message}
                          </Text>
                          {item.closingPoint && (
                            <div>
                              <Text type="secondary" style={{ fontSize: '11px' }}>
                                Điểm đóng: {item.closingPoint}
                              </Text>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ResultModal;