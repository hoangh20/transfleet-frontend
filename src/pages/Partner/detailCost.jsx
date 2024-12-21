import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spin, Descriptions, message, Button, Table, Row, Col, Popconfirm, Space, Modal, Form, Input, AutoComplete } from 'antd';
import { getExternalFleetCostById, updatePartnerTransportCost, deletePartnerTransportCost } from '../../services/ExternalFleetCostService';
import { getPartnerById, getAllPartnersforcost } from '../../services/PartnerService';
import CreatePartnerTransportCost from '../../components/popup/CreatePartnerTransportCost';

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

const DetailCostPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [costDetails, setCostDetails] = useState(null);
  const [partnerTransportCosts, setPartnerTransportCosts] = useState([]);
  const [filteredPartnerTransportCosts, setFilteredPartnerTransportCosts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    fetchCostDetails();
    fetchPartners();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (searchTerm) {
      const filteredCosts = partnerTransportCosts.filter((cost) =>
        cost.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPartnerTransportCosts(filteredCosts);
    } else {
      setFilteredPartnerTransportCosts(partnerTransportCosts);
    }
  }, [searchTerm, partnerTransportCosts]);

  const fetchCostDetails = async () => {
    setLoading(true);
    try {
      const response = await getExternalFleetCostById(id);
      if (response && response.externalFleetCost) {
        const { startPoint, endPoint } = response.externalFleetCost;

        if (startPoint && endPoint) {
          const startProvince = await fetchProvinceName(startPoint.provinceCode);
          const startDistrict = await fetchDistrictName(startPoint.districtCode);
          const startWard = startPoint.wardCode ? await fetchWardName(startPoint.wardCode) : null;

          const endProvince = await fetchProvinceName(endPoint.provinceCode);
          const endDistrict = await fetchDistrictName(endPoint.districtCode);
          const endWard = endPoint.wardCode ? await fetchWardName(endPoint.wardCode) : null;

          const updatedDetails = {
            ...response.externalFleetCost,
            startPoint: {
              ...startPoint,
              fullName: `${startWard ? startWard + ', ' : ''}${startDistrict}, ${startProvince}`,
            },
            endPoint: {
              ...endPoint,
              fullName: `${endWard ? endWard + ', ' : ''}${endDistrict}, ${endProvince}`,
            },
          };

          setCostDetails(updatedDetails);
          fetchPartnerTransportCosts(response.partnerTransportCosts);
        } else {
          message.error('Không tìm thấy tuyến vận tải');
        }
      } else {
        message.error('Không tìm thấy tuyến vận tải');
      }
    } catch (error) {
      message.error('Không thể tải chi tiết tuyến vận tải');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await getAllPartnersforcost();
      setPartners(response.partners);
    } catch (error) {
      message.error('Lỗi khi tải danh sách đối tác');
    }
  };

  const fetchPartnerTransportCosts = async (costs) => {
    const updatedCosts = await Promise.all(
      costs.map(async (cost) => {
        const partner = await getPartnerById(cost.partner);
        return {
          ...cost,
          partnerName: partner.name,
        };
      })
    );
    setPartnerTransportCosts(updatedCosts);
    setFilteredPartnerTransportCosts(updatedCosts);
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    fetchCostDetails();
  };

  const handleEdit = (cost) => {
    setEditingCost(cost);
    form.setFieldsValue({ cost: cost.cost });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await updatePartnerTransportCost(editingCost._id, { cost: values.cost });
      message.success('Cập nhật tuyến vận tải đối tác thành công');
      setIsEditModalVisible(false);
      fetchCostDetails();
    } catch (error) {
      message.error('Lỗi khi cập nhật tuyến vận tải đối tác');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePartnerTransportCost(id);
      message.success('Xóa tuyến vận tải đối tác thành công');
      fetchCostDetails();
    } catch (error) {
      message.error('Lỗi khi xóa tuyến vận tải đối tác');
    }
  };

  const columns = [
    {
      title: 'Đối tác',
      dataIndex: 'partnerName',
      key: 'partnerName',
    },
    {
      title: 'Chi phí',
      dataIndex: 'cost',
      key: 'cost',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tuyến vận tải này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const partnerOptions = partners.map((partner) => ({
    value: partner.name,
  }));

  if (loading) {
    return <Spin size="large" />;
  }

  if (!costDetails) {
    return null;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Chi tiết chuyến vận tải" bordered={false}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Điểm đi">{costDetails.startPoint.fullName}</Descriptions.Item>
          <Descriptions.Item label="Điểm đến">{costDetails.endPoint.fullName}</Descriptions.Item>
          <Descriptions.Item label="Loại vận chuyển">{costDetails.type === 0 ? 'Đóng hàng' : 'Giao hàng nhập'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{new Date(costDetails.createdAt).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Số đối tác hoạt động">{partnerTransportCosts.length}</Descriptions.Item>
        </Descriptions>
        
        <Row justify="center" style={{ marginTop: 16 }}>
          <Col>
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
              Thêm tuyến vận tải đối tác
            </Button>
          </Col>
        </Row>
      </Card>
      <Card title="Danh sách tuyến vận tải đối tác" bordered={false} style={{ marginTop: 24 }}>
        <AutoComplete
          options={partnerOptions}
          style={{ width: '100%', marginBottom: 16 }}
          onSelect={(value) => setSearchTerm(value)}
          onSearch={(value) => setSearchTerm(value)}
          placeholder="Tìm kiếm đối tác"
        />
        <Table
          columns={columns}
          dataSource={filteredPartnerTransportCosts}
          rowKey="_id"
          pagination={false}
        />
      </Card>
      <CreatePartnerTransportCost
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleModalSuccess}
        transportTripId={id}
      />
      <Modal
        title="Cập nhật tuyến vận tải đối tác"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdate}>
            Lưu
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Chi phí"
            name="cost"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <Input type="number" placeholder="Nhập giá" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DetailCostPage;