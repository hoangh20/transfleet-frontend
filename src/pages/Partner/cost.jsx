import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Table, message, Popconfirm, Modal, Input, Select } from 'antd';
import CreateExternalFleetCost from '../../components/location/CreateExternalFleetCost';
import { getAllExternalFleetCosts, deleteExternalFleetCost, updateExternalFleetCost } from '../../services/ExternalFleetCostService';
import { getAllPartnersforcost } from '../../services/PartnerService';

const { Option } = Select;

const fetchProvinceName = async (provinceCode) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}`);
    const data = await response.json();
    return data.name || 'N/A';
  } catch {
    return 'N/A';
  }
};

const fetchDistrictName = async (districtCode) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}`);
    const data = await response.json();
    return data.name || 'N/A';
  } catch {
    return 'N/A';
  }
};

const fetchWardName = async (wardCode) => {
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/w/${wardCode}`);
    const data = await response.json();
    return data.name || 'N/A';
  } catch {
    return 'N/A';
  }
};

const PartnerCostPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [externalFleetCosts, setExternalFleetCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [currentCost, setCurrentCost] = useState(null);
  const [updatedCost, setUpdatedCost] = useState('');

  useEffect(() => {
    fetchExternalFleetCosts();
    fetchPartners();
  }, []);

  const fetchExternalFleetCosts = async (partnerId = null) => {
    setLoading(true);
    try {
      const response = await getAllExternalFleetCosts();
      if (response && response.externalFleetCosts) {
        const filteredCosts = partnerId
          ? response.externalFleetCosts.filter(cost => cost.partnerId === partnerId)
          : response.externalFleetCosts;

        const updatedCosts = await Promise.all(
          filteredCosts.map(async (cost) => {
            const startProvince = await fetchProvinceName(cost.startPoint.provinceCode);
            const startDistrict = await fetchDistrictName(cost.startPoint.districtCode);
            const startWard = cost.startPoint.wardCode
              ? await fetchWardName(cost.startPoint.wardCode)
              : null;

            const endProvince = await fetchProvinceName(cost.endPoint.provinceCode);
            const endDistrict = await fetchDistrictName(cost.endPoint.districtCode);
            const endWard = cost.endPoint.wardCode
              ? await fetchWardName(cost.endPoint.wardCode)
              : null;

            return {
              ...cost,
              startPoint: {
                ...cost.startPoint,
                fullName: `${startWard ? startWard + ', ' : ''}${startDistrict}, ${startProvince}`,
              },
              endPoint: {
                ...cost.endPoint,
                fullName: `${endWard ? endWard + ', ' : ''}${endDistrict}, ${endProvince}`,
              },
            };
          })
        );
        setExternalFleetCosts(updatedCosts);
      } else {
        setExternalFleetCosts([]);
        message.error('Dữ liệu không hợp lệ');
      }
    } catch (error) {
      message.error('Không thể tải danh sách chi phí vận chuyển');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await getAllPartnersforcost();
      setPartners(response.partners);
    } catch (error) {
      message.error('Không thể tải danh sách đối tác');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExternalFleetCost(id);
      message.success('Xóa chi phí vận chuyển thành công');
      fetchExternalFleetCosts(selectedPartner); // Refresh the table data after deletion
    } catch (error) {
      message.error('Không thể xóa chi phí vận chuyển');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateExternalFleetCost(currentCost._id, { cost: updatedCost });
      message.success('Cập nhật chi phí vận chuyển thành công');
      setIsUpdateModalVisible(false);
      fetchExternalFleetCosts(selectedPartner); // Refresh the table data after update
    } catch (error) {
      message.error('Không thể cập nhật chi phí vận chuyển');
    }
  };

  const handleSubmit = (data) => {
    console.log('Submitted data:', data);
    setIsModalVisible(false);
    fetchExternalFleetCosts(selectedPartner); // Refresh the table data after submission
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const handlePartnerChange = (value) => {
    setSelectedPartner(value);
    fetchExternalFleetCosts(value === 'all' ? null : value);
  };

  const columns = [
    {
      title: 'Đối tác',
      dataIndex: 'partner_shortName',
      key: 'partner_shortName',
    },
    {
      title: 'Điểm đi',
      dataIndex: 'startPoint',
      key: 'startPoint',
      render: (startPoint) => startPoint.fullName || 'N/A',
    },
    {
      title: 'Điểm đến',
      dataIndex: 'endPoint',
      key: 'endPoint',
      render: (endPoint) => endPoint.fullName || 'N/A',
    },
    {
      title: 'Giá vận chuyển',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => `${cost.toLocaleString()} VNĐ`,
    },
    {
      title: 'Loại vận chuyển',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (type === 0 ? 'Đóng hàng' : 'Giao hàng nhập'),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt) => formatDate(updatedAt),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => {
            setCurrentCost(record);
            setUpdatedCost(record.cost);
            setIsUpdateModalVisible(true);
          }}>
            Cập nhật
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa chi phí vận chuyển này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col span={24}>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Tạo mới chi phí vận chuyển
          </Button>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Select
            showSearch
            placeholder="Chọn đối tác"
            style={{ width: '100%' }}
            onChange={handlePartnerChange}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            <Option value="all">Tất cả</Option>
            {partners.map((partner) => (
              <Option key={partner._id} value={partner._id}>
                {partner.shortName}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={externalFleetCosts}
        loading={loading}
        rowKey="_id"
        style={{ marginTop: 16 }}
      />
      <CreateExternalFleetCost
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleSubmit}
      />
      <Modal
        title="Cập nhật chi phí vận chuyển"
        visible={isUpdateModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsUpdateModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Giá vận chuyển">
            <Input
              value={updatedCost}
              onChange={(e) => setUpdatedCost(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
};

export default PartnerCostPage;