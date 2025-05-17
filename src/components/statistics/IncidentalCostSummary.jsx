import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, List, Statistic } from 'antd';
import dayjs from 'dayjs';
import SummaryService from '../../services/SummaryService';

const TYPE_LABELS = {
  0: 'Đội xe đối tác',
  1: 'Khách hàng',
  2: 'Công ty',
};

const IncidentalCostSummary = ({ type, selectedDate }) => {
  const [costs, setCosts] = useState([]);
  const [totals, setTotals] = useState({ 0: 0, 1: 0, 2: 0 });
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let apiFunc, param;
      if (type === 'daily') {
        apiFunc = SummaryService.getIncidentalCostsByDay;
        param = selectedDate.format('YYYY-MM-DD');
      } else if (type === 'weekly') {
        apiFunc = SummaryService.getIncidentalCostsByWeek;
        param = selectedDate.startOf('week').format('YYYY-MM-DD');
      } else {
        apiFunc = SummaryService.getIncidentalCostsByMonth;
        param = selectedDate.startOf('month').format('YYYY-MM-DD');
      }
      const res = await apiFunc(param);
      const data = res.data || [];
      setCosts(data);

      // Tính tổng từng loại
      const sums = { 0: 0, 1: 0, 2: 0 };
      data.forEach(item => {
        sums[item.type] = (sums[item.type] || 0) + (item.amount || 0);
      });
      setTotals(sums);
    };
    if (selectedDate) fetchData();
  }, [type, selectedDate]);

  return (
    <Card title="Chi phí phát sinh" >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[0, 1, 2].map((t) => (
          <div key={t} style={{ marginBottom: 8 }}>
            <Statistic
              title={TYPE_LABELS[t]}
              value={totals[t]}
              valueStyle={{ color: '#cf1322', fontWeight: 600 }}
              suffix="₫"
            />
            <Button type="link" onClick={() => setModalType(t)} style={{ padding: 0 }}>
              Xem chi tiết
            </Button>
            <Modal
              title={`Chi tiết chi phí phát sinh: ${TYPE_LABELS[t]}`}
              open={modalType === t}
              onCancel={() => setModalType(null)}
              footer={null}
              width={600}
            >
              <List
                dataSource={costs.filter(item => item.type === t)}
                renderItem={item => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <b>{item.info}</b> - {item.reason}
                      <span style={{ float: 'right', color: '#1890ff' }}>
                        {item.amount.toLocaleString('vi-VN')} ₫
                      </span>
                      <div style={{ fontSize: 12, color: '#888' }}>
                        {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Modal>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default IncidentalCostSummary;