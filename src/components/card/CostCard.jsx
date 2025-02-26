import React, { useEffect, useState } from 'react';
import { Card, Spin, message, Button, Input } from 'antd';
import { getCostByOrderId, updateCostByOrderId } from '../../services/OrderService';

const CostCard = ({ orderId }) => {
  const [cost, setCost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCost, setEditedCost] = useState({});

  useEffect(() => {
    const fetchCost = async () => {
      try {
        const response = await getCostByOrderId(orderId);
        setCost(response);
        setEditedCost(response);
      } catch (error) {
        message.error('Lỗi khi tải chi phí');
      } finally {
        setLoading(false);
      }
    };

    fetchCost();
  }, [orderId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    try {
      await updateCostByOrderId(orderId, editedCost);
      setCost(editedCost);
      setIsEditing(false);
      message.success('Cập nhật chi phí thành công');
    } catch (error) {
      message.error('Lỗi khi cập nhật chi phí');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedCost({
      ...editedCost,
      [name]: value,
    });
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!cost) {
    return <p>Không tìm thấy chi phí</p>;
  }

  return (
    <Card
      title="Chi phí"
      bordered={false}
      extra={
        isEditing ? (
          <Button type="primary" onClick={handleUpdate}>
            Cập nhật
          </Button>
        ) : (
          <Button type="default" onClick={handleEdit}>
            Chỉnh sửa
          </Button>
        )
      }
    >
      {isEditing ? (
        <>
          <p>Phụ cấp tài xế: <Input name="driverAllowance" value={editedCost.driverAllowance} onChange={handleChange} /></p>
          <p>Lương tài xế: <Input name="driverSalary" value={editedCost.driverSalary} onChange={handleChange} /></p>
          <p>Chi phí nhiên liệu: <Input name="fuelCost" value={editedCost.fuelCost} onChange={handleChange} /></p>
          <p>Vé đơn: <Input name="singleTicket" value={editedCost.singleTicket} onChange={handleChange} /></p>
          <p>Vé tháng: <Input name="monthlyTicket" value={editedCost.monthlyTicket} onChange={handleChange} /></p>
          <p>Chi phí khác: <Input name="otherCosts" value={editedCost.otherCosts} onChange={handleChange} /></p>
          <p>Giá vé chuyến: <Input name="tripFare" value={editedCost.tripFare} onChange={handleChange} /></p>
          <p>Phí đăng ký: <Input name="registrationFee" value={editedCost.registrationFee} onChange={handleChange} /></p>
          <p>Bảo hiểm: <Input name="insurance" value={editedCost.insurance} onChange={handleChange} /></p>
          <p>Lương đội kỹ thuật: <Input name="technicalTeamSalary" value={editedCost.technicalTeamSalary} onChange={handleChange} /></p>
          <p>Lãi vay ngân hàng: <Input name="bankLoanInterest" value={editedCost.bankLoanInterest} onChange={handleChange} /></p>
          <p>Chi phí sửa chữa: <Input name="repairCost" value={editedCost.repairCost} onChange={handleChange} /></p>
        </>
      ) : (
        <>
          <p>Phụ cấp tài xế: {cost.driverAllowance}</p>
          <p>Lương tài xế: {cost.driverSalary}</p>
          <p>Chi phí nhiên liệu: {cost.fuelCost}</p>
          <p>Vé đơn: {cost.singleTicket}</p>
          <p>Vé tháng: {cost.monthlyTicket}</p>
          <p>Chi phí khác: {cost.otherCosts}</p>
          <p>Giá vé chuyến: {cost.tripFare}</p>
          <p>Phí đăng ký: {cost.registrationFee}</p>
          <p>Bảo hiểm: {cost.insurance}</p>
          <p>Lương đội kỹ thuật: {cost.technicalTeamSalary}</p>
          <p>Lãi vay ngân hàng: {cost.bankLoanInterest}</p>
          <p>Chi phí sửa chữa: {cost.repairCost}</p>
        </>
      )}
    </Card>
  );
};

export default CostCard;