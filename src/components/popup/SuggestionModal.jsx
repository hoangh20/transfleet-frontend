import React from 'react';
import { Modal, Table, Spin, List, Button } from 'antd';

const SuggestionModal = ({
  visible,
  loading,
  suggestions,
  notFoundAddresses,
  onCancel,
  onSelectSuggestion,
}) => {
  const suggestionColumns = [
    {
      title: 'Đơn Giao Hàng',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
    },
    {
      title: 'Đơn Đóng Hàng',
      dataIndex: 'packingAddress',
      key: 'packingAddress',
    },
    {
      title: 'Khoảng Cách (km)',
      dataIndex: 'distance',
      key: 'distance',
      render: (distance) => distance.toFixed(2),
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => onSelectSuggestion(record)}>
          Chọn
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="Danh Sách Gợi Ý Ghép Đơn"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      {loading ? (
        <Spin tip="Đang tải gợi ý..." />
      ) : (
        <>
          <Table
            columns={suggestionColumns}
            dataSource={suggestions}
            rowKey={(record) => `${record.deliveryOrder?._id}-${record.packingOrder?._id}`}
            pagination={false}
          />
          {notFoundAddresses.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3>Các Điểm Không Tồn Tại:</h3>
              <List
                size="small"
                bordered
                dataSource={notFoundAddresses}
                renderItem={(item) => <List.Item>{item}</List.Item>}
              />
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default SuggestionModal;