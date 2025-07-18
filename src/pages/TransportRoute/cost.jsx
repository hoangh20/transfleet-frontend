import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Table, message, Popconfirm, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import CreateExternalFleetCost from '../../components/location/CreateExternalFleetCost';
import LocationFilter from '../../components/location/LocationFilter';
import { getAllExternalFleetCosts, deleteExternalFleetCost } from '../../services/ExternalFleetCostService';
import { fetchProvinceName, fetchDistrictName, fetchWardName } from '../../services/LocationService';

const PartnerCostPage = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [externalFleetCosts, setExternalFleetCosts] = useState([]);
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

  useEffect(() => {
    fetchExternalFleetCosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage, pageSize]);

  const fetchExternalFleetCosts = async () => {
    setLoading(true);
    try {
      const response = await getAllExternalFleetCosts({
        ...filters,
        page: currentPage,
        limit: pageSize,
      });

      if (response && response.data) {
        const updatedCosts = await Promise.all(
          response.data.map(async (cost) => {
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
        setTotalItems(response.total);
      } else {
        setExternalFleetCosts([]);
        setTotalItems(0);
        message.error('Dữ liệu không hợp lệ');
      }
    } catch (error) {
      message.error('Không thể tải danh sách tuyến vận chuyển');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
    setCurrentPage(1); 
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); 
    try {
      await deleteExternalFleetCost(id);
      message.success('Xóa tuyến vận chuyển thành công');
      fetchExternalFleetCosts(); 
    } catch (error) {
      message.error('Không thể xóa tuyến vận chuyển');
    }
  };

  const handleSubmit = (data) => {
    console.log('Submitted data:', data);
    setIsModalVisible(false);
    fetchExternalFleetCosts(); 
  };

  const columns = [
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
      title: 'Loại vận chuyển',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (type === 0 ? 'Giao hàng nhập' : 'Đóng hàng'),
    },
    {
      title: 'Số lượng đối tác',
      dataIndex: 'partnerTransportCostCount',
      key: 'partnerTransportCostCount',
      render: (count) => count || '0',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tuyến vận chuyển này?"
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
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Tạo mới tuyến vận tải
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={externalFleetCosts}
            loading={loading}
            rowKey="_id"
            onRow={(record) => ({
              onClick: () => {
                if (record.type === 0) {
                  navigate(`/transport-route/delivery/${record._id}`);
                } else if (record.type === 1) {
                  navigate(`/transport-route/packing/${record._id}`);
                }
              },
            })}
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
              showTotal: (total) => `Tổng ${total} tuyến vận tải`,
            }}
          />
        </Col>
      </Row>
      <CreateExternalFleetCost
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </Form>
  );
};

export default PartnerCostPage;