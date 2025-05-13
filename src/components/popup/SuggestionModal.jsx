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
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h${minutes}'`;
  };

  const suggestionColumns = [
    {
      title: 'Thông Tin Đơn Giao Hàng',
      key: 'deliveryInfo',
      render: (_, record) => (
        <>
          <div> {record.deliveryOrder.customer.shortName}</div>
          <div> {record.deliveryOrder.containerNumber}</div>
          <div> {record.deliveryOrder.owner}</div>
        </>
      ),
    },
    {
      title: 'Đơn Giao Hàng',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
    },
    {
      title: 'Thông Tin Đơn Đóng Hàng',
      key: 'packingInfo',
      render: (_, record) => (
        <>
          <div>{record.packingOrder.customer.shortName}</div>
        </>
      ),
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
      render: (distance, record) => {
        if (typeof distance === 'number') {
          return (
            <span style={{ color: record.hasEmptyDistance === 1 ? 'green' : 'inherit' }}>
              {distance.toFixed(2)}
            </span>
          );
        }
        return (
          <span style={{ color: 'red' }}>
            {distance}
          </span>
        );
      },
    },
    {
      title: 'Thời Gian Dự Kiến',
      dataIndex: 'time',
      key: 'time',
      render: (time, record) => {
        if (typeof time === 'number') {
          return (
            <span style={{ color: record.hasEmptyDistance === 1 ? 'green' : 'inherit' }}>
              {formatTime(time)}
            </span>
          );
        }
        return (
          <span style={{ color: 'red' }}>
            {time}
          </span>
        );
      },
    },
    {
      title: 'Lợi Nhuận Dự Kiến (VND)',
      dataIndex: 'expectedProfit',
      key: 'expectedProfit',
      render: (profit, record) => {
        if (typeof profit === 'number') {
          return (
            <span style={{ color: record.hasEmptyDistance === 1 ? 'green' : 'inherit' }}>
              {Math.round(profit).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </span>
          );
        }
        return (
          <span style={{ color: 'red' }}>
            {profit}
          </span>
        );
      },
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
      width={1200}
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