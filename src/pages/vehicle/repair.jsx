import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Row, Col, Button, Tag, Typography, Space, Modal, Image, List } from 'antd';
import { SearchOutlined, EyeOutlined, CheckCircleOutlined, FileOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

const repairStatusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'quoted', label: 'Đã có báo giá' },
  { value: 'accepted', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'done', label: 'Hoàn thành' },
];

const statusColor = {
  pending: 'orange',
  quoted: 'purple',
  accepted: 'blue',
  rejected: 'red',
  done: 'green',
};

const repairListDemo = [
  {
    id: 1,
    time: '2025-06-10 14:32',
    plate: '29C48248',
    driverName: 'Vũ Văn Toàn',
    driverPhone: '0333804804',
    type: 'Bảo dưỡng',
    description: 'Thay dầu động cơ, kiểm tra phanh',
    images: [
      'https://via.placeholder.com/300x200?text=Ảnh+1',
      'https://via.placeholder.com/300x200?text=Ảnh+2',
    ],
    quote: 1500000,
    quoteFiles: [
      { name: 'Bao_gia_1.pdf', url: 'https://example.com/Bao_gia_1.pdf' },
      { name: 'Bao_gia_2.pdf', url: 'https://example.com/Bao_gia_2.pdf' },
    ],
    status: 'quoted',
  },
  {
    id: 2,
    time: '2025-06-09 09:23',
    plate: '29C48255',
    driverName: 'Nguyễn Văn Điển',
    driverPhone: '0868871223',
    type: 'Sửa chữa phụ kiện',
    description: 'Sửa hệ thống điện, thay bóng đèn',
    images: [],
    quote: 800000,
    quoteFiles: [
      { name: 'Bao_gia_1.pdf', url: 'https://example.com/Bao_gia_1.pdf' },
      { name: 'Bao_gia_2.pdf', url: 'https://example.com/Bao_gia_2.pdf' },
    ],
    status: 'accepted',
  },
];

const RepairPage = () => {
  // State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [repairs, setRepairs] = useState([]);
  const [viewImages, setViewImages] = useState({ visible: false, images: [] });
  const [rejectModal, setRejectModal] = useState({ visible: false, id: null, reason: '' });

  // Effect: fetch data
  useEffect(() => {
    // TODO: Replace with API call
    setRepairs(repairListDemo);
  }, []);

  // Filtered data
  const filteredRepairs = repairs.filter(r =>
    (status === 'all' || r.status === status) &&
    (!search || r.plate.toLowerCase().includes(search.toLowerCase()))
  );

  // Duyệt sửa chữa
  const handleAccept = (repairId) => {
    setRepairs(rs =>
      rs.map(r =>
        r.id === repairId ? { ...r, status: 'accepted', rejectReason: '' } : r
      )
    );
  };

  // Từ chối sửa chữa
  const handleReject = (repairId, reason) => {
    setRepairs(rs =>
      rs.map(r =>
        r.id === repairId ? { ...r, status: 'rejected', rejectReason: reason } : r
      )
    );
    setRejectModal({ visible: false, id: null, reason: '' });
  };

  // Render
  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm theo biển số xe"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            value={status}
            onChange={setStatus}
            style={{ width: '100%' }}
          >
            {repairStatusOptions.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {filteredRepairs.map(repair => (
          <Col xs={24} md={12} lg={8} key={repair.id}>
            <Card
              title={
                <Space>
                  <Tag color={statusColor[repair.status] || 'default'}>
                    {repairStatusOptions.find(opt => opt.value === repair.status)?.label || repair.status}
                  </Tag>
                  <Text strong>{repair.plate}</Text>
                </Space>
              }
              extra={
                repair.status === 'quoted' && (
                  <>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      size="small"
                      onClick={() => handleAccept(repair.id)}
                      style={{ marginRight: 8 }}
                    >
                      Duyệt
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      size="small"
                      onClick={() => setRejectModal({ visible: true, id: repair.id, reason: '' })}
                    >
                      Từ chối
                    </Button>
                  </>
                )
              }
              style={{ minHeight: 240 }}
            >
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text type="secondary">Thời gian: {repair.time}</Text>
                <Text>Tài xế: {repair.driverName} - {repair.driverPhone}</Text>
                <Text>Loại sửa chữa: <b>{repair.type}</b></Text>
                <Text>Mô tả: {repair.description}</Text>
                {repair.images.length > 0 && (
                  <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => setViewImages({ visible: true, images: repair.images })}
                  >
                    Xem ảnh
                  </Button>
                )}
                <Text>Báo giá kỹ thuật: <b>{repair.quote?.toLocaleString() || '--'} đ</b></Text>
                {repair.quoteFiles && repair.quoteFiles.length > 0 && (
                  <div>
                    <Text strong>File báo giá:</Text>
                    <List
                      size="small"
                      dataSource={repair.quoteFiles}
                      renderItem={file => (
                        <List.Item>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <FileOutlined /> {file.name}
                          </a>
                        </List.Item>
                      )}
                    />
                  </div>
                )}
                {repair.status === 'rejected' && repair.rejectReason && (
                  <Tag color="red">Lý do từ chối: {repair.rejectReason}</Tag>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

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