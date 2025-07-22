// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  InputNumber,
  Row,
  Col,
  Button,
  Typography,
  Card,
  Descriptions,
} from 'antd';
import dayjs from 'dayjs';

// eslint-disable-next-line no-unused-vars
const { Title, Text } = Typography;

const ContainerCostFormModal = ({
  visible,
  onCancel,
  onSubmit,
  editingRecord,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && editingRecord) {
      // Set form values với chi phí có VAT từ containerCost
      const costData = editingRecord.containerCost || {};
      
      // Reset form trước khi set giá trị mới
      form.resetFields();
      
      // Set values với timeout để đảm bảo form đã reset xong
      setTimeout(() => {
        form.setFieldsValue({
          cuocBan: costData.cuocBan || 0,
          nangBac: costData.nangBac || 0,
          haBac: costData.haBac || 0,
          nangNam: costData.nangNam || 0,
          haNam: costData.haNam || 0,
          cuocBien: costData.cuocBien || 0,
          phiDOVS: costData.phiDOVS || 0,
          cuocBoHP: costData.cuocBoHP || 0,
          com: costData.com || 0,
          cuocBoHCM: costData.cuocBoHCM || 0,
          bocXepHCM: costData.bocXepHCM || 0,
          phatSinh: costData.phatSinh || 0,
        });
      }, 100);
    }
  }, [visible, editingRecord, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Chỉ gửi các field có giá trị khác 0
      const submitData = {};
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined) {
          submitData[key] = values[key];
        }
      });
      onSubmit(submitData);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <Modal
      title="Cập nhật Chi phí Container"
      visible={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={handleSubmit}
        >
          Cập nhật
        </Button>,
      ]}
      destroyOnClose={true} // Thêm prop này để destroy modal khi đóng
    >
      {/* Container Info */}
      {editingRecord && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Descriptions column={3} size="small">
            <Descriptions.Item label="Số Container">
              <Text strong>{editingRecord.containerNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đóng">
              {editingRecord.date ? dayjs(editingRecord.date).format('DD/MM/YYYY') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {editingRecord.customer?.shortName || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Line">
              {editingRecord.line || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="PTVC">
              {editingRecord.PTVC || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Chuyến tàu">
              {editingRecord.trainTrip || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Form 
        form={form} 
        layout="vertical"
        preserve={false} // Thêm prop này để không preserve values khi unmount
      >
        {/* Doanh thu */}
        <Card size="small" title="Doanh thu" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Cước bán (có VAT)"
                name="cuocBan"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập cước bán"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Chi phí có VAT */}
        <Card size="small" title="Chi phí có VAT" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nâng vỏ/hàng Bắc"
                name="nangBac"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập chi phí nâng Bắc"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Hạ vỏ/hàng Bắc"
                name="haBac"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập chi phí hạ Bắc"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nâng hàng/vỏ Nam"
                name="nangNam"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập chi phí nâng Nam"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Hạ hàng/vỏ Nam"
                name="haNam"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập chi phí hạ Nam"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Cước biển"
                name="cuocBien"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập cước biển"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phí DOVS"
                name="phiDOVS"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập phí DOVS"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row> 
        </Card>

        {/* Chi phí không VAT */}
        <Card size="small" title="Chi phí không VAT" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Cước bộ HP"
                name="cuocBoHP"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập cước bộ HP"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Cước bộ HCM"
                name="cuocBoHCM"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập cước bộ HCM"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Bốc xếp HCM"
                name="bocXepHCM"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập bốc xếp HCM"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Chi phí phát sinh"
                name="phatSinh"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập chi phí phát sinh"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Com"
                name="com"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập com"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <div style={{ 
          background: '#f5f5f5', 
          padding: 12, 
          borderRadius: 6, 
          marginTop: 16 
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <strong>Lưu ý:</strong> 
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>Các chi phí có VAT sẽ được tự động tính toán chi phí không VAT</li>
              <li>Tổng chi phí và lợi nhuận sẽ được tự động cập nhật</li>
              <li>Định dạng tiền tệ: VNĐ</li>
            </ul>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default ContainerCostFormModal;