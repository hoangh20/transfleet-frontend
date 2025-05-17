import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Table, message, Popconfirm, Space, Input, Modal } from 'antd';
import { getAllEmptyDistancesWithFilter, updateEmptyDistance, deleteEmptyDistance } from '../../services/ExternalFleetCostService';
import { fetchProvinceName, fetchDistrictName, fetchWardName } from '../../services/LocationService';
import LocationFilter from '../../components/location/LocationFilter';

const EmptyDistancePage = () => {
  const [emptyDistances, setEmptyDistances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startProvinceCode: '',
    startDistrictCode: '',
    startWardCode: '',
    endProvinceCode: '',
    endDistrictCode: '',
    endWardCode: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    fetchEmptyDistances();
    // eslint-disable-next-line
  }, [filters, currentPage, pageSize]);

  const fetchEmptyDistances = async () => {
    setLoading(true);
    try {
      const response = await getAllEmptyDistancesWithFilter({
        deliveryProvinceCode: filters.startProvinceCode,
        deliveryDistrictCode: filters.startDistrictCode,
        deliveryWardCode: filters.startWardCode,
        packingProvinceCode: filters.endProvinceCode,
        packingDistrictCode: filters.endDistrictCode,
        packingWardCode: filters.endWardCode,
        page: currentPage,
        limit: pageSize,
      });

      if (response && response.data) {
        const updated = await Promise.all(
          response.data.map(async (item) => {
            const endPoint = item.deliveryRoute?.endPoint || {};
            const endProvince = endPoint.provinceCode ? await fetchProvinceName(endPoint.provinceCode) : '';
            const endDistrict = endPoint.districtCode ? await fetchDistrictName(endPoint.districtCode) : '';
            const endWard = endPoint.wardCode ? await fetchWardName(endPoint.wardCode) : '';
            const startPoint = item.packingRoute?.startPoint || {};
            const startProvince = startPoint.provinceCode ? await fetchProvinceName(startPoint.provinceCode) : '';
            const startDistrict = startPoint.districtCode ? await fetchDistrictName(startPoint.districtCode) : '';
            const startWard = startPoint.wardCode ? await fetchWardName(startPoint.wardCode) : '';
            return {
              ...item,
              deliveryFullName: `${endWard ? endWard + ', ' : ''}${endDistrict}${endDistrict ? ', ' : ''}${endProvince}`,
              packingFullName: `${startWard ? startWard + ', ' : ''}${startDistrict}${startDistrict ? ', ' : ''}${startProvince}`,
            };
          })
        );
        setEmptyDistances(updated);
        setTotalItems(response.total || updated.length);
      } else {
        setEmptyDistances([]);
        setTotalItems(0);
        message.error('Dữ liệu không hợp lệ');
      }
    } catch (error) {
      message.error('Không thể tải danh sách tuyến kết hợp');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setCurrentPage(1);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteEmptyDistance(id);
      message.success('Xóa tuyến kết hợp thành công');
      fetchEmptyDistances();
    } catch (error) {
      message.error('Không thể xóa tuyến kết hợp');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setEditValues({
      emptyDistance: record.emptyDistance,
      singleTicket: record.singleTicket,
      singleTicket40: record.singleTicket40,
    });
    setEditing(true);
  };

  const handleEditSave = async () => {
    try {
      await updateEmptyDistance(editingRecord._id, editValues);
      message.success('Cập nhật thành công');
      setEditing(false);
      setEditingRecord(null);
      fetchEmptyDistances();
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const columns = [
    {
      title: 'Điểm giao hàng',
      dataIndex: 'deliveryFullName',
      key: 'deliveryFullName',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Điểm đóng hàng',
      dataIndex: 'packingFullName',
      key: 'packingFullName',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Khoảng cách rỗng (km)',
      dataIndex: 'emptyDistance',
      key: 'emptyDistance',
    },
    {
      title: 'Vé kết hợp mooc 20',
      dataIndex: 'singleTicket',
      key: 'singleTicket',
    },
    {
      title: 'Vé kết hợp mooc 40',
      dataIndex: 'singleTicket40',
      key: 'singleTicket40',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tuyến kết hợp này?"
            onConfirm={(e) => handleDelete(record._id, e)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger onClick={(e) => e.stopPropagation()}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Form layout="vertical">
      <LocationFilter onFilterChange={handleFilterChange} />
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={emptyDistances}
            loading={loading}
            rowKey="_id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onShowSizeChange: (current, size) => {
                setPageSize(size);
                setCurrentPage(1);
              },
              onChange: (page) => {
                setCurrentPage(page);
              },
              showTotal: (total) => `Tổng ${total} tuyến kết hợp`,
            }}
          />
        </Col>
      </Row>
      <Modal
        title="Chỉnh sửa tuyến kết hợp"
        open={editing}
        onCancel={() => setEditing(false)}
        onOk={handleEditSave}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical">
          <Form.Item label="Khoảng cách rỗng (km)">
            <Input
              type="number"
              value={editValues.emptyDistance}
              onChange={(e) => setEditValues({ ...editValues, emptyDistance: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Vé kết hợp mooc 20">
            <Input
              type="number"
              value={editValues.singleTicket}
              onChange={(e) => setEditValues({ ...editValues, singleTicket: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Vé kết hợp mooc 40">
            <Input
              type="number"
              value={editValues.singleTicket40}
              onChange={(e) => setEditValues({ ...editValues, singleTicket40: e.target.value })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
};

export default EmptyDistancePage;
