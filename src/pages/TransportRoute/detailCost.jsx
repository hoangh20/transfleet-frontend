import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spin, Descriptions, message } from 'antd';
import { getExternalFleetCostById, getInternalCostsByExternalFleetCostId } from '../../services/ExternalFleetCostService';
import PartnerTransportCostList from '../../components/list/PartnerTransportCostList';
import { fetchProvinceName, fetchDistrictName, fetchWardName } from '../../services/LocationService';

const DetailCostPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [costDetails, setCostDetails] = useState(null);
  const [internalCosts, setInternalCosts] = useState({});
  const [partnerTransportCosts, setPartnerTransportCosts] = useState([]);

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
      }
    } catch (error) {
      message.error('Lỗi khi tải chi phí nội bộ');
    }
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
      <Card title="Chi phí đội xe nội bộ" bordered={false} style={{ marginTop: 24 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Công tác phí lái xe">{internalCosts.driverAllowance}</Descriptions.Item>
          <Descriptions.Item label="Lương lái xe">{internalCosts.driverSalary}</Descriptions.Item>
          <Descriptions.Item label="Chi phí xăng dầu">{internalCosts.fuelCost}</Descriptions.Item>
          <Descriptions.Item label="Vé lượt">{internalCosts.singleTicket}</Descriptions.Item>
          <Descriptions.Item label="Vé tháng">{internalCosts.monthlyTicket}</Descriptions.Item>
          <Descriptions.Item label="Chi phí khác">{internalCosts.otherCosts}</Descriptions.Item>
          <Descriptions.Item label="Cước phí">{internalCosts.tripFare}</Descriptions.Item>
        </Descriptions>
      </Card>
      <PartnerTransportCostList
        transportTripId={id}
        partnerTransportCosts={partnerTransportCosts}
        fetchCostDetails={fetchCostDetails}
      />
    </div>
  );
};

export default DetailCostPage;