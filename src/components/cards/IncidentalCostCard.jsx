import React from 'react';
import { Card, Tag, Space, Button, Typography, Divider, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

const IncidentalCostCard = ({ data, onEdit, onDelete, typeOptions }) => {
  const getTypeInfo = (type) => {
    return typeOptions.find(option => option.value === type) || { label: 'N/A', color: 'default' };
  };

  const getOrderTypeLabel = (type) => {
    const typeMap = {
      'packing': 'Đóng hàng',
      'delivery': 'Giao hàng',
    };
    return typeMap[type] || type;
  };

  const typeInfo = getTypeInfo(data.type);

  return (
    <Card
      hoverable
      style={{ 
        height: '100%',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
      actions={[
        <Button 
          type="link" 
          icon={<EditOutlined />} 
          onClick={onEdit}
          style={{ color: '#1890ff' }}
        >
          Sửa
        </Button>,
        <Button 
          type="link" 
          icon={<DeleteOutlined />} 
          onClick={onDelete}
          danger
        >
          Xóa
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 12 }}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tag color={typeInfo.color} style={{ margin: 0 }}>
              {typeInfo.label}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {data.orderInfo?.orderType && (
                <Tag color={data.orderInfo.orderType === 'packing' ? 'blue' : 'green'} size="small">
                  {getOrderTypeLabel(data.orderInfo.orderType)}
                </Tag>
              )}
            </Text>
          </div>
          
          <Title level={4} style={{ margin: '8px 0', color: '#d4380d' }}>
            <DollarOutlined style={{ marginRight: 8 }} />
            {data.amount?.toLocaleString()} VNĐ
          </Title>
        </Space>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <div>
          <Text strong>Container: </Text>
          <Text>{data.orderInfo?.containerNumber || 'N/A'}</Text>
        </div>
        
        <div>
          <Text strong>Khách hàng: </Text>
          <Tooltip title={data.orderInfo?.customerName}>
            <Text ellipsis style={{ maxWidth: 180 }}>
              {data.orderInfo?.customerName || 'N/A'}
            </Text>
          </Tooltip>
        </div>

        {data.responsiblePerson && (
          <div>
            <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <Text>{data.responsiblePerson}</Text>
          </div>
        )}

        <div>
          <Text strong>Lý do: </Text>
          <Paragraph 
            ellipsis={{ 
              rows: 2, 
              tooltip: data.reason 
            }}
            style={{ margin: 0, color: '#666' }}
          >
            {data.reason}
          </Paragraph>
        </div>

        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {new Date(data.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default IncidentalCostCard;