import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spin, Descriptions, message, Form, Input, Button, Modal, Table } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { getExternalFleetCostById, getInternalCostsByExternalFleetCostId, updateInternalCosts, getHistoryByTypeAndExternalFleetCostId } from '../../services/ExternalFleetCostService';
import PartnerTransportCostList from '../../components/list/PartnerTransportCostList';
import { fetchProvinceName, fetchDistrictName, fetchWardName } from '../../services/LocationService';

const DetailCostPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [costDetails, setCostDetails] = useState(null);
  const [internalCosts, setInternalCosts] = useState({});
  const [partnerTransportCosts, setPartnerTransportCosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyType, setHistoryType] = useState('');

  useEffect(() => {
    fetchCostDetails();
    fetchInternalCosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
          setPartnerTransportCosts(response.partnerTransportCosts);
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

  const fetchInternalCosts = async () => {
    try {
      const response = await getInternalCostsByExternalFleetCostId(id);
      if (response.length > 0) {
        setInternalCosts(response[0]);
        form.setFieldsValue(response[0]);
      }
    } catch (error) {
      message.error('Lỗi khi tải chi phí nội bộ');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user')); 
      const userId = user?.id;
      const updatedFields = Object.keys(values).reduce((acc, key) => {
        if (values[key] !== internalCosts[key]) {
          acc[key] = values[key];
        }
        return acc;
      }, {});
      if (Object.keys(updatedFields).length > 0) {
        await updateInternalCosts(internalCosts._id, updatedFields, userId);
        message.success('Cập nhật chi phí nội bộ thành công');
        setIsEditing(false);
        fetchInternalCosts();
      } else {
        message.info('Không có thay đổi nào để cập nhật');
        setIsEditing(false);
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật chi phí nội bộ');
    } finally {
      setLoading(false);
    }
  };

  const showHistoryModal = async (type) => {
    setHistoryType(type);
    setHistoryModalVisible(true);
    setLoading(true);
    try {
      const response = await getHistoryByTypeAndExternalFleetCostId(type, id);
      setHistoryData(response);
    } catch (error) {
      message.error('Lỗi khi tải lịch sử chi phí nội bộ');
    } finally {
      setLoading(false);
    }
  };

  const historyColumns = [
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Người thay đổi',
      dataIndex: ['userId', 'name'],
      key: 'userId.name',
    },
  ];

  const historyTypeLabels = {
    driverAllowance: 'Công tác phí lái xe',
    driverSalary: 'Lương lái xe',
    fuelCost: 'Chi phí xăng dầu',
    singleTicket: 'Vé lượt',
    monthlyTicket: 'Vé tháng',
    otherCosts: 'Chi phí khác',
    tripFare: 'Cước phí',
  };

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
          <Descriptions.Item label="Loại mooc">{costDetails.moocType === 0 ? '20\'' : '40\''}</Descriptions.Item>
          <Descriptions.Item label="Số đối tác hoạt động">{partnerTransportCosts.length}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card
        title='Chi phí đội xe nội bộ'
        bordered={false}
        style={{ marginTop: 24 }}
        extra={
          !isEditing && (
            <Button type="primary" onClick={() => setIsEditing(true)}>
              Chỉnh sửa
            </Button>
          )
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={internalCosts}>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Cước phí">
              {isEditing ? (
                <Input.Group compact>
                  <Form.Item name="tripFare" noStyle>
                    <Input style={{ width: 'calc(100% - 32px)' }} />
                  </Form.Item>
                </Input.Group>
              ) : (
                internalCosts.tripFare
              )}
              <Button type="link" icon={<HistoryOutlined />} onClick={() => showHistoryModal('tripFare')} style={{ float: 'right' }} />
            </Descriptions.Item>
            <Descriptions.Item label="Công tác phí lái xe">
              {isEditing ? (
                <Input.Group compact>
                  <Form.Item name="driverAllowance" noStyle>
                    <Input style={{ width: 'calc(100% - 32px)' }} />
                  </Form.Item>
                </Input.Group>
              ) : (
                internalCosts.driverAllowance
              )}
              <Button type="link" icon={<HistoryOutlined />} onClick={() => showHistoryModal('driverAllowance')} style={{ float: 'right' }} />
            </Descriptions.Item>
            <Descriptions.Item label="Lương lái xe">
              {isEditing ? (
                <Input.Group compact>
                  <Form.Item name="driverSalary" noStyle>
                    <Input style={{ width: 'calc(100% - 32px)' }} />
                  </Form.Item>
                </Input.Group>
              ) : (
                internalCosts.driverSalary
              )}
              <Button type="link" icon={<HistoryOutlined />} onClick={() => showHistoryModal('driverSalary')} style={{ float: 'right' }} />
            </Descriptions.Item>
            <Descriptions.Item label="Chi phí xăng dầu">
              {isEditing ? (
                <Input.Group compact>
                  <Form.Item name="fuelCost" noStyle>
                    <Input style={{ width: 'calc(100% - 32px)' }} />
                  </Form.Item>
                </Input.Group>
              ) : (
                internalCosts.fuelCost
              )}
              <Button type="link" icon={<HistoryOutlined />} onClick={() => showHistoryModal('fuelCost')} style={{ float: 'right' }} />
            </Descriptions.Item>
            <Descriptions.Item label="Vé lượt">
              {isEditing ? (
                <Input.Group compact>
                  <Form.Item name="singleTicket" noStyle>
                    <Input style={{ width: 'calc(100% - 32px)' }} />
                  </Form.Item>
                </Input.Group>
              ) : (
                internalCosts.singleTicket
              )}
              <Button type="link" icon={<HistoryOutlined />} onClick={() => showHistoryModal('singleTicket')} style={{ float: 'right' }} />
            </Descriptions.Item>
            <Descriptions.Item label="Chi phí khác">
              {isEditing ? (
                <Input.Group compact>
                  <Form.Item name="otherCosts" noStyle>
                    <Input style={{ width: 'calc(100% - 32px)' }} />
                  </Form.Item>
                </Input.Group>
              ) : (
                internalCosts.otherCosts
              )}
              <Button type="link" icon={<HistoryOutlined />} onClick={() => showHistoryModal('otherCosts')} style={{ float: 'right' }} />
            </Descriptions.Item>
          </Descriptions>
          {isEditing && (
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style = {{marginTop: 16}}>
                Cập nhật
              </Button>
            </Form.Item>
          )}
        </Form>
      </Card>
      <PartnerTransportCostList
        transportTripId={id}
        partnerTransportCosts={partnerTransportCosts}
        fetchCostDetails={fetchCostDetails}
      />
      <Modal
        title={`Lịch sử ${historyTypeLabels[historyType]}`}
        visible={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
      >
        <Table
          columns={historyColumns}
          dataSource={historyData}
          rowKey='_id'
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default DetailCostPage;