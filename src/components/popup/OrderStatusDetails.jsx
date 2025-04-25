import React, { useEffect, useState } from 'react';
import { Modal, Spin, Descriptions, Image, Typography, Empty } from 'antd';
import { getOrderStatusUpdateByOrderIdAndStatus } from '../../services/OrderService';

const { Text, Title } = Typography;

const OrderStatusDetails = ({ orderId, status, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [statusDetails, setStatusDetails] = useState(null);

  useEffect(() => {
    if (visible) {
      const fetchStatusDetails = async () => {
        setLoading(true);
        try {
          const response = await getOrderStatusUpdateByOrderIdAndStatus(orderId, status);
          setStatusDetails(response?.data); 
        } catch (error) {
          setStatusDetails(null);
        } finally {
          setLoading(false);
        }
      };

      fetchStatusDetails();
    }
  }, [orderId, status, visible]);

  return (
    <Modal
      title="Chi tiết trạng thái đơn hàng"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="Đang tải..." />
        </div>
      ) : statusDetails ? (
        <>
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Người cập nhật">
              {statusDetails.userId?.name || 'Không xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">
              {new Date(statusDetails.updatedAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {statusDetails.note || 'Không có ghi chú'}
            </Descriptions.Item>
          </Descriptions>

          {statusDetails.imgUrl ? (
            <div style={{ marginTop: 24 }}>
              <Title level={5}>Hình ảnh liên quan</Title>
              <Image.PreviewGroup>
                {statusDetails.imgUrl
                  .split('|')
                  .filter((url) => url.trim() !== '')
                  .map((url, index) => (
                    <Image
                      key={index}
                      src={url.trim()}
                      alt={`Hình ${index + 1}`}
                      width={120}
                      style={{ marginRight: 8, marginBottom: 8, borderRadius: 4 }}
                    />
                  ))}
              </Image.PreviewGroup>
            </div>
          ) : (
            <div style={{ marginTop: 24 }}>
              <Empty description="Không có hình ảnh" />
            </div>
          )}
        </>
      ) : (
        <Text>Không có thông tin chi tiết cho trạng thái này.</Text>
      )}
    </Modal>
  );
};

export default OrderStatusDetails;
