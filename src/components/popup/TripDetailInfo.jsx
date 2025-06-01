import React from 'react';
import { Modal, Table, Descriptions, Alert } from 'antd';
import moment from 'moment';

const transformTripData = (data) => {
  const result = [];
  let i = 0;

  while (i < data.length) {
    const current = data[i];

    if (current.CarStatus === 'Đỗ' || current.CarStatus === 'Dừng') {
      const startIdx = i;
      const status = current.CarStatus;
      const startTime = moment(current.Date, 'HH:mm:ss - DD/MM/YYYY');
      let endTime = startTime;
      let j = i + 1;

      while (j < data.length && data[j].CarStatus === status) {
        endTime = moment(data[j].Date, 'HH:mm:ss - DD/MM/YYYY');
        j++;
      }

      const duration = moment.duration(endTime.diff(startTime));
      const durationStr = `${duration.hours() > 0 ? `${duration.hours()} giờ ` : ''}${duration.minutes()} phút ${duration.seconds()} giây`;

      result.push({
        ...current,
        Date: `${status === 'Đỗ' ? 'Đỗ: ' : 'Dừng: '}${durationStr}`,
        CarStatus: '',
        Speed: '',
        Address: data[startIdx].Address || data[j - 1].Address || 'Không có địa chỉ',
      });

      i = j;
    } else {
      result.push(current);
      i++;
    }
  }

  return result;
};

const TripDetailInfo = ({ data, onClose, visible, noDataMessage, distance, moveTime }) => {
  if (noDataMessage) {
    return (
      <Modal
        title="Chi tiết chuyến xe"
        open={visible}
        onCancel={onClose}
        onOk={onClose}
        footer={null}
      >
        <Alert message={noDataMessage} type="info" showIcon />
      </Modal>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) return null;

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'Date',
      key: 'Date',
      render: (text) => {
        if (text.startsWith('Đỗ:'))
          return <span style={{ color: 'red', fontWeight: 'bold' }}>{text}</span>;
        if (text.startsWith('Dừng:'))
          return <span style={{ color: 'orange', fontWeight: 'bold' }}>{text}</span>;
        return text;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'CarStatus',
      key: 'CarStatus',
    },
    {
      title: 'Tốc độ',
      dataIndex: 'Speed',
      key: 'Speed',
      render: (v) => (v !== '' && v !== undefined ? `${v} km/h` : ''),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'Address',
      key: 'Address',
    },
  ];

  return (
    <Modal
      title="Chi tiết chuyến xe"
      open={visible}
      onCancel={onClose}
      onOk={onClose}
      width={900}
      footer={null}
    >
      <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Biển số">{data[0].NumberPlate}</Descriptions.Item>
        <Descriptions.Item label="Tài xế">{data[0].DriverName}</Descriptions.Item>
        <Descriptions.Item label="Quãng đường đã đi" span={2}>{distance}</Descriptions.Item>
        <Descriptions.Item label="Thời gian di chuyển" span={2}>{moveTime}</Descriptions.Item>
      </Descriptions>
      <Table
        columns={columns}
        dataSource={transformTripData(data)}
        rowKey={(r, idx) => idx}
        size="small"
        pagination={{ pageSize: 10 }}
        scroll={{ y: 400 }}
      />
    </Modal>
  );
};

export default TripDetailInfo;
