import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Upload,
  Alert,
  Typography,
  Card,
  Divider,
  message,
  Tag,
  Radio,
  Table,
  Space,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  CloseOutlined,
  ReloadOutlined,
  SettingOutlined,
  EyeOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import TemplateDownloadModal from './TemplateDownloadModal';
import { validateBulkCostUpdate, executeBulkCostUpdate, validateBulkDeliveryUpdate, executeBulkDeliveryUpdate } from '../../services/CSSevice';

const { Text } = Typography;
const { Dragger } = Upload;

const ExcelUploadModal = ({ visible, onCancel, onSuccess }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loading] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [selectedUpdateField, setSelectedUpdateField] = useState(null);
  const [processedJsonData, setProcessedJsonData] = useState(null);
  const [bulkValidationResult, setBulkValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Định nghĩa các trường bắt buộc cho từng template
  const templateFields = {
    container: [
        'Ngày',
        'Số Cont',
        'Tiền'
    ],
    delivery: [
        'Ngày',
        'Số Cont',
        'Điểm trả',
        'Số xe',
        'Đội xe trả',
        'Cước bộ HCM',
        'Bốc xếp HCM',
        'Hạ hàng/vỏ Nam'
    ]
  };

  // Định nghĩa các trường có thể cập nhật cho template 1truong (container)
  const updateFieldOptions = [
    { value: 'nangBac', label: 'Nâng Bắc' },
    { value: 'haBac', label: 'Hạ Bắc' },
    { value: 'nangNam', label: 'Nâng Nam' },
    { value: 'com', label: 'COM' },
  ];

  const parseNumberWithDots = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    
    if (typeof value === 'number') {
      const stringValue = value.toString();
      const cleanValue = stringValue.replace(/\./g, '');
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? 0 : parsed;
    }
        if (typeof value === 'string') {
      let cleanValue = value.replace(/\s/g, '');
            if (cleanValue.includes('.')) {
        const dotCount = (cleanValue.match(/\./g) || []).length;
                if (dotCount >= 1) {
          const parts = cleanValue.split('.');
          const lastPart = parts[parts.length - 1];

          if (lastPart.length === 3 || dotCount > 1) {
            cleanValue = cleanValue.replace(/\./g, '');
          }
          else if (lastPart.length <= 2 && dotCount === 1) {
            cleanValue = cleanValue.replace(/\./g, '');
          }
        }
      }
      
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  };

  // Hàm chuyển đổi dữ liệu Excel sang JSON cho cả 2 template
  const convertExcelToJson = (rawData, updateField, templateType) => {
    if (!rawData || rawData.length < 2) {
      return null;
    }

    try {
      // Lấy headers (dòng đầu tiên)
      const headers = rawData[0];

      // Lấy dữ liệu (từ dòng thứ 2 trở đi)
      const dataRows = rawData.slice(1);

      let jsonData;

      if (templateType === 'container') {
        // Xử lý template 1truong (container)
        jsonData = dataRows.map((row) => {
          const rowObject = {};
          
          headers.forEach((header, columnIndex) => {
            const cellValue = row[columnIndex];
            
            if (header === 'Ngày') {
              // Xử lý định dạng ngày
              if (typeof cellValue === 'number') {
                const utc_days = Math.floor(cellValue - 25569);
                const utc_value = utc_days * 86400;
                const date_info = new Date(utc_value * 1000);
                
                const day = String(date_info.getUTCDate()).padStart(2, '0');
                const month = String(date_info.getUTCMonth() + 1).padStart(2, '0');
                const year = date_info.getUTCFullYear();
                
                rowObject.date = `${day}/${month}/${year}`;
              } else if (cellValue instanceof Date) {
                const day = String(cellValue.getDate()).padStart(2, '0');
                const month = String(cellValue.getMonth() + 1).padStart(2, '0');
                const year = cellValue.getFullYear();
                
                rowObject.date = `${day}/${month}/${year}`;
              } else if (typeof cellValue === 'string' && cellValue.trim() !== '') {
                try {
                  const parsedDate = new Date(cellValue);
                  if (!isNaN(parsedDate.getTime())) {
                    const day = String(parsedDate.getDate()).padStart(2, '0');
                    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                    const year = parsedDate.getFullYear();
                    
                    rowObject.date = `${day}/${month}/${year}`;
                  } else {
                    rowObject.date = cellValue;
                  }
                } catch (error) {
                  rowObject.date = cellValue;
                }
              } else {
                rowObject.date = '';
              }
            } else if (header === 'Số Cont' || header.trim() === 'Số Cont') {
              rowObject.containerNumber = cellValue ? cellValue.toString().trim() : '';
            } else if (header === 'Tiền') {
              // Sử dụng hàm parseNumberWithDots để xử lý số có dấu chấm
              rowObject[updateField] = parseNumberWithDots(cellValue);
            }
          });

          return rowObject;
        });
      } else if (templateType === 'delivery') {
        // Xử lý template kehoachgiaohang (delivery)
        jsonData = dataRows.map((row) => {
          const rowObject = {};
          
          headers.forEach((header, columnIndex) => {
            const cellValue = row[columnIndex];
            
            // Xử lý ngày tháng
            if (header === 'Ngày') {
              if (typeof cellValue === 'number') {
                const utc_days = Math.floor(cellValue - 25569);
                const utc_value = utc_days * 86400;
                const date_info = new Date(utc_value * 1000);
                
                const day = String(date_info.getUTCDate()).padStart(2, '0');
                const month = String(date_info.getUTCMonth() + 1).padStart(2, '0');
                const year = date_info.getUTCFullYear();
                
                rowObject.date = `${day}/${month}/${year}`;
              } else if (cellValue instanceof Date) {
                const day = String(cellValue.getDate()).padStart(2, '0');
                const month = String(cellValue.getMonth() + 1).padStart(2, '0');
                const year = cellValue.getFullYear();
                
                rowObject.date = `${day}/${month}/${year}`;
              } else if (typeof cellValue === 'string' && cellValue.trim() !== '') {
                try {
                  const parsedDate = new Date(cellValue);
                  if (!isNaN(parsedDate.getTime())) {
                    const day = String(parsedDate.getDate()).padStart(2, '0');
                    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                    const year = parsedDate.getFullYear();
                    
                    rowObject.date = `${day}/${month}/${year}`;
                  } else {
                    rowObject.date = cellValue;
                  }
                } catch (error) {
                  rowObject.date = cellValue;
                }
              } else {
                rowObject.date = '';
              }
            }
            // Số container
            else if (header === 'Số Cont' || header.trim() === 'Số Cont') {
              rowObject.containerNumber = cellValue ? cellValue.toString().trim() : '';
            }
            // Điểm trả
            else if (header === 'Điểm trả' || header.trim() === 'Điểm trả') {
              rowObject.returnPoint = cellValue ? cellValue.toString().trim() : '';
            }
            // Số xe
            else if (header === 'Số xe' || header.trim() === 'Số xe') {
              rowObject.soXeTra = cellValue ? cellValue.toString().trim() : '';
            }
            // Đội xe trả
            else if (header === 'Đội xe trả' || header.trim() === 'Đội xe trả') {
              rowObject.fleetReturned = cellValue ? cellValue.toString().trim() : '';
            }
            // Cước bộ HCM - sử dụng parseNumberWithDots
            else if (header === 'Cước bộ HCM' || header.trim() === 'Cước bộ HCM') {
              rowObject.cuocBoHCM = parseNumberWithDots(cellValue);
            }
            // Bốc xếp HCM - sử dụng parseNumberWithDots
            else if (header === 'Bốc xếp HCM' || header.trim() === 'Bốc xếp HCM') {
              rowObject.bocXepHCM = parseNumberWithDots(cellValue);
            }
            // Hạ hàng/vỏ Nam - sử dụng parseNumberWithDots
            else if (header === 'Hạ hàng/vỏ Nam' || header.trim() === 'Hạ hàng/vỏ Nam') {
              rowObject.haNam = parseNumberWithDots(cellValue);
            }
          });

          return rowObject;
        });
      }

      // Tạo object kết quả cuối cùng
      const result = {
        metadata: {
          fileName: uploadedFile?.name || 'unknown',
          totalRows: jsonData.length,
          template: templateType,
          templateLabel: templateType === 'container' ? '1 trường' : 'Kế hoạch giao hàng'
        },
        data: jsonData
      };

      // Thêm updateField cho template container
      if (templateType === 'container' && updateField) {
        result.metadata.updateField = updateField;
        result.metadata.updateFieldLabel = updateFieldOptions.find(opt => opt.value === updateField)?.label;
      }

      return result;
    } catch (error) {
      message.error('Lỗi khi chuyển đổi dữ liệu sang JSON');
      return null;
    }
  };

  // Hàm validate dữ liệu với API (hỗ trợ cả 2 template)
  const handleValidateData = async () => {
    if (!processedJsonData) {
      message.error('Không có dữ liệu để validate');
      return;
    }

    setIsValidating(true);
    try {
      const templateType = validationResult?.matchedTemplate;
      let result;

      if (templateType === 'container') {
        result = await validateBulkCostUpdate(processedJsonData);
      } else if (templateType === 'delivery') {
        result = await validateBulkDeliveryUpdate(processedJsonData);
      } else {
        throw new Error('Template không được hỗ trợ');
      }

      setBulkValidationResult(result);
      message.success('Kiểm tra dữ liệu thành công');
    } catch (error) {
      message.error(`Lỗi khi kiểm tra: ${error.message}`);
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Hàm execute update với API (hỗ trợ cả 2 template)
  const handleExecuteUpdate = async (forceUpdate = false) => {
    if (!processedJsonData) {
      message.error('Không có dữ liệu để cập nhật');
      return;
    }

    setIsExecuting(true);
    try {
      const templateType = validationResult?.matchedTemplate;
      let result;

      if (templateType === 'container') {
        result = await executeBulkCostUpdate(processedJsonData, forceUpdate);
      } else if (templateType === 'delivery') {
        result = await executeBulkDeliveryUpdate(processedJsonData, forceUpdate);
      } else {
        throw new Error('Template không được hỗ trợ');
      }

      message.success(result.message);
      
      // Refresh validation result to show updated status
      await handleValidateData();
      
      // Call onSuccess callback if provided
      onSuccess?.();
    } catch (error) {
      message.error(`Lỗi khi cập nhật: ${error.message}`);
      console.error('Execute error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!bulkValidationResult) {
      message.error('Vui lòng kiểm tra dữ liệu trước khi cập nhật');
      return;
    }

    const templateType = validationResult?.matchedTemplate;
    const { summary } = bulkValidationResult.metadata;
    
    if (templateType === 'container') {
      if (summary.readyForUpdate === 0) {
        message.error('Không có bản ghi nào sẵn sàng để cập nhật');
        return;
      }
    } else if (templateType === 'delivery') {
      if (summary.readyForUpdate === 0) {
        message.error('Không có bản ghi nào sẵn sàng để cập nhật');
        return;
      }
    }

    // Chỉ cập nhật các record có check = 0 (sẵn sàng)
    await handleExecuteUpdate(false);
  };

  // Thêm hàm xử lý force update
  const handleForceUpdate = async () => {
    if (!bulkValidationResult) {
      message.error('Vui lòng kiểm tra dữ liệu trước khi cập nhật');
      return;
    }

    const templateType = validationResult?.matchedTemplate;
    const { summary } = bulkValidationResult.metadata;
    
    let totalUpdatable = 0;
    if (templateType === 'container') {
      totalUpdatable = summary.readyForUpdate + (summary.fieldAlreadyHasValue || 0);
    } else if (templateType === 'delivery') {
      totalUpdatable = summary.readyForUpdate + (summary.hasConflicts || 0);
    }
    
    if (totalUpdatable === 0) {
      message.error('Không có bản ghi nào có thể cập nhật');
      return;
    }

    // Hiển thị confirm dialog
    Modal.confirm({
      title: 'Xác nhận ghi đè dữ liệu',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn ghi đè dữ liệu?</p>
          <p><strong>Sẽ cập nhật:</strong></p>
          <ul>
            <li>{summary.readyForUpdate} bản ghi sẵn sàng</li>
            <li>
              {templateType === 'container' 
                ? `${summary.fieldAlreadyHasValue || 0} bản ghi đã có giá trị (sẽ bị ghi đè)`
                : `${summary.hasConflicts || 0} bản ghi có xung đột (sẽ bị ghi đè)`
              }
            </li>
          </ul>
          <p style={{ color: '#ff4d4f' }}>
            <strong>Cảnh báo:</strong> Các giá trị hiện tại sẽ bị thay thế và không thể khôi phục!
          </p>
        </div>
      ),
      okText: 'Xác nhận ghi đè',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => handleExecuteUpdate(true),
    });
  };

  // Effect để tự động chuyển đổi khi có đủ điều kiện
  useEffect(() => {
    if (validationResult?.isValid && fileData && uploadedFile) {
      const templateType = validationResult.matchedTemplate;
      
      // Đối với template container, cần chọn updateField
      if (templateType === 'container') {
        if (selectedUpdateField) {
          const jsonResult = convertExcelToJson(fileData, selectedUpdateField, templateType);
          setProcessedJsonData(jsonResult);
          setBulkValidationResult(null);
        } else {
          setProcessedJsonData(null);
          setBulkValidationResult(null);
        }
      }
      // Đối với template delivery, không cần chọn updateField
      else if (templateType === 'delivery') {
        const jsonResult = convertExcelToJson(fileData, null, templateType);
        setProcessedJsonData(jsonResult);
        setBulkValidationResult(null);
      }
    } else {
      setProcessedJsonData(null);
      setBulkValidationResult(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationResult, selectedUpdateField, fileData, uploadedFile]);

  // Hàm chuẩn hóa tên cột (loại bỏ khoảng trắng, chuyển thành lowercase)
  const normalizeColumnName = (columnName) => {
    if (!columnName) return '';
    return columnName.toString().toLowerCase().trim().replace(/\s+/g, '');
  };

  // Hàm kiểm tra file có khớp với template nào không
  const validateFileStructure = (headers) => {
    if (!headers || headers.length === 0) {
      return {
        isValid: false,
        matchedTemplate: null,
        missingFields: [],
        extraFields: [],
        message: 'Không tìm thấy header trong file'
      };
    }

    const normalizedHeaders = headers.map(header => normalizeColumnName(header));
    
    let bestMatch = {
      template: null,
      matchScore: 0,
      missingFields: [],
      extraFields: []
    };

    // Kiểm tra từng template
    Object.keys(templateFields).forEach(templateName => {
      const requiredFields = templateFields[templateName];
      const normalizedRequired = requiredFields.map(field => normalizeColumnName(field));
      
      // Tính số trường khớp
      const matchedFields = normalizedRequired.filter(field => 
        normalizedHeaders.includes(field)
      );
      
      const matchScore = matchedFields.length / normalizedRequired.length;
      
      if (matchScore > bestMatch.matchScore) {
        bestMatch = {
          template: templateName,
          matchScore,
          missingFields: normalizedRequired.filter(field => 
            !normalizedHeaders.includes(field)
          ),
          extraFields: normalizedHeaders.filter(field => 
            !normalizedRequired.includes(field) && field !== ''
          )
        };
      }
    });

    // Xác định kết quả validation
    const isValid = bestMatch.matchScore >= 0.8; // 80% trường khớp
    const isPartialMatch = bestMatch.matchScore >= 0.5 && bestMatch.matchScore < 0.8;

    return {
      isValid,
      isPartialMatch,
      matchedTemplate: bestMatch.template,
      matchScore: bestMatch.matchScore,
      missingFields: bestMatch.missingFields,
      extraFields: bestMatch.extraFields,
      originalHeaders: headers,
      normalizedHeaders,
      message: isValid 
        ? `File khớp với template ${bestMatch.template === 'container' ? '1 trường' : 'Kế hoạch giao hàng'}`
        : isPartialMatch
        ? `File có thể khớp với template ${bestMatch.template === 'container' ? '1 trường' : 'Kế hoạch giao hàng'} nhưng thiếu một số trường`
        : 'File không khớp với bất kỳ template nào'
    };
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          message.error('File Excel trống hoặc không hợp lệ');
          return;
        }

        // Lấy header (dòng đầu tiên)
        const headers = jsonData[0] || [];
        
        // Kiểm tra cấu trúc file
        const validation = validateFileStructure(headers);
        setValidationResult(validation);

        // Reset trường cập nhật khi upload file mới
        setSelectedUpdateField(null);
        setProcessedJsonData(null);
        setBulkValidationResult(null);

        setFileData(jsonData);
        setUploadedFile(file);
        
        // Hiển thị message tương ứng với kết quả validation
        if (validation.isValid) {
          message.success('Đọc file Excel thành công và cấu trúc file hợp lệ');
        } else if (validation.isPartialMatch) {
          message.warning('Đọc file Excel thành công nhưng cấu trúc file chưa hoàn chỉnh');
        } else {
          message.error('Đọc file Excel thành công nhưng cấu trúc file không khớp với template');
        }
      } catch (error) {
        message.error('Lỗi khi đọc file Excel');
        console.error('Excel read error:', error);
      }
    };

    reader.readAsArrayBuffer(file);
    return false; // Prevent default upload
  };

  const handleCancel = () => {
    setUploadedFile(null);
    setFileData(null);
    setValidationResult(null);
    setSelectedUpdateField(null);
    setProcessedJsonData(null);
    setBulkValidationResult(null);
    onCancel?.();
  };

  // Hàm reset file để quay lại trạng thái upload
  const handleResetFile = () => {
    setUploadedFile(null);
    setFileData(null);
    setValidationResult(null);
    setSelectedUpdateField(null);
    setProcessedJsonData(null);
    setBulkValidationResult(null);
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: handleFileUpload,
    showUploadList: false,
  };

  // Render validation results table
  const renderValidationTable = () => {
    if (!bulkValidationResult || !bulkValidationResult.data) return null;

    const templateType = validationResult?.matchedTemplate;
    
    // Columns cho template container
    const containerColumns = [
      {
        title: 'Ngày',
        dataIndex: 'date',
        key: 'date',
        width: 100,
      },
      {
        title: 'Số Container',
        dataIndex: 'containerNumber',
        key: 'containerNumber',
        width: 120,
      },
      {
        title: 'Line',
        dataIndex: 'line',
        key: 'line',
        width: 80,
        render: (text) => text || '-',
      },
      {
        title: 'Khách hàng',
        dataIndex: 'customerShortName',
        key: 'customerShortName',
        width: 100,
        render: (text) => text || '-',
      },
      {
        title: 'Giá trị cập nhật',
        dataIndex: selectedUpdateField,
        key: 'updateValue',
        width: 100,
        render: (value) => value ? value.toLocaleString() : 0,
      },
      {
        title: 'Giá trị hiện tại',
        dataIndex: 'existingValue',
        key: 'existingValue',
        width: 100,
        render: (value) => value ? value.toLocaleString() : 0,
      },
      {
        title: 'Trạng thái',
        dataIndex: 'check',
        key: 'status',
        width: 120,
        render: (check) => {
          if (check === 0) {
            return <Tag color="green">Sẵn sàng</Tag>;
          } else if (check === 1) {
            return <Tag color="red">Không tìm thấy</Tag>;
          } else if (check === 2) {
            return <Tag color="orange">Đã có giá trị</Tag>;
          }
          return <Tag color="gray">Không xác định</Tag>;
        },
      },
      {
        title: 'Ghi chú',
        dataIndex: 'message',
        key: 'message',
        ellipsis: true,
      },
    ];

    // Columns cho template delivery
    const deliveryColumns = [
      {
        title: 'Ngày',
        dataIndex: 'date',
        key: 'date',
        width: 100,
      },
      {
        title: 'Số Container',
        dataIndex: 'containerNumber',
        key: 'containerNumber',
        width: 120,
      },
      {
        title: 'Line',
        dataIndex: 'line',
        key: 'line',
        width: 80,
        render: (text) => text || '-',
      },
      {
        title: 'Khách hàng',
        dataIndex: 'customerShortName',
        key: 'customerShortName',
        width: 100,
        render: (text) => text || '-',
      },
      {
        title: 'Điểm trả',
        dataIndex: 'returnPoint',
        key: 'returnPoint',
        width: 120,
        render: (text, record) => {
          const updateValue = record.updateData?.returnPoint;
          return updateValue || text || '-';
        },
      },
      {
        title: 'Số xe',
        dataIndex: 'soXeTra',
        key: 'soXeTra',
        width: 100,
        render: (text, record) => {
          const updateValue = record.updateData?.soXeTra;
          return updateValue || text || '-';
        },
      },
      {
        title: 'Đội xe',
        dataIndex: 'fleetReturned',
        key: 'fleetReturned',
        width: 100,
        render: (text, record) => {
          const updateValue = record.updateData?.fleetReturned;
          return updateValue || text || '-';
        },
      },
      {
        title: 'Cước bộ HCM',
        dataIndex: 'cuocBoHCM',
        key: 'cuocBoHCM',
        width: 110,
        render: (value, record) => {
          const updateValue = record.updateData?.cuocBoHCM;
          const displayValue = updateValue !== undefined ? updateValue : value;
          return displayValue ? displayValue.toLocaleString() : 0;
        },
      },
      {
        title: 'Bốc xếp HCM',
        dataIndex: 'bocXepHCM',
        key: 'bocXepHCM',
        width: 110,
        render: (value, record) => {
          const updateValue = record.updateData?.bocXepHCM;
          const displayValue = updateValue !== undefined ? updateValue : value;
          return displayValue ? displayValue.toLocaleString() : 0;
        },
      },
      {
        title: 'Hạ Nam',
        dataIndex: 'haNam',
        key: 'haNam',
        width: 100,
        render: (value, record) => {
          const updateValue = record.updateData?.haNam;
          const displayValue = updateValue !== undefined ? updateValue : value;
          return displayValue ? displayValue.toLocaleString() : 0;
        },
      },
      {
        title: 'Trạng thái',
        dataIndex: 'check',
        key: 'status',
        width: 120,
        render: (check) => {
          if (check === 0) {
            return <Tag color="green">Sẵn sàng</Tag>;
          } else if (check === 1) {
            return <Tag color="red">Không tìm thấy</Tag>;
          } else if (check === 2) {
            return <Tag color="orange">Có xung đột</Tag>;
          }
          return <Tag color="gray">Không xác định</Tag>;
        },
      },
      {
        title: 'Ghi chú',
        dataIndex: 'message',
        key: 'message',
        ellipsis: true,
      },
    ];

    const columns = templateType === 'container' ? containerColumns : deliveryColumns;
    const { summary } = bulkValidationResult.metadata;

    return (
      <Card size="small" title="Kết quả kiểm tra dữ liệu" style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16 }}>
          {summary && (
            <Space wrap>
              <Tag color="blue">Tổng: {summary.total}</Tag>
              <Tag color="green">Sẵn sàng: {summary.readyForUpdate}</Tag>
              {templateType === 'container' ? (
                <>
                  <Tag color="orange">Đã có giá trị: {summary.fieldAlreadyHasValue || 0}</Tag>
                  <Tag color="red">Không tìm thấy: {summary.containerNotFound}</Tag>
                </>
              ) : (
                <>
                  <Tag color="orange">Có xung đột: {summary.hasConflicts || 0}</Tag>
                  <Tag color="red">Không tìm thấy: {summary.containerNotFound}</Tag>
                </>
              )}
            </Space>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button 
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={isExecuting}
              disabled={!summary?.readyForUpdate}
            >
              Cập nhật an toàn ({summary?.readyForUpdate || 0} bản ghi)
            </Button>
            
            {((templateType === 'container' && summary?.fieldAlreadyHasValue > 0) ||
              (templateType === 'delivery' && summary?.hasConflicts > 0)) && (
              <Button 
                type="primary"
                danger
                icon={<SaveOutlined />}
                onClick={handleForceUpdate}
                loading={isExecuting}
              >
                Ghi đè tất cả ({(summary?.readyForUpdate || 0) + 
                  (templateType === 'container' ? (summary?.fieldAlreadyHasValue || 0) : (summary?.hasConflicts || 0))} bản ghi)
              </Button>
            )}
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={bulkValidationResult.data}
          rowKey={(record, index) => `${record.containerNumber}-${index}`}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} bản ghi`,
          }}
          scroll={{ x: templateType === 'delivery' ? 1200 : 800 }}
          size="small"
        />
      </Card>
    );
  };

  // Render field selection for container template
  const renderFieldSelection = () => {
    if (!validationResult?.isValid) return null;

    // Chỉ hiển thị field selection cho template container
    if (validationResult.matchedTemplate === 'container') {
      return (
        <Card 
          size="small" 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SettingOutlined style={{ color: '#1890ff' }} />
              <span>Chọn trường cần cập nhật</span>
            </div>
          }
          style={{ marginTop: 16 }}
        >
          <Alert
            message="Vui lòng chọn trường dữ liệu cần cập nhật"
            description="File template 1truong yêu cầu chỉ định trường cụ thể để cập nhật dữ liệu"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Radio.Group 
            value={selectedUpdateField} 
            onChange={(e) => setSelectedUpdateField(e.target.value)}
            style={{ width: '100%' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {updateFieldOptions.map((option) => (
                <Radio 
                  key={option.value} 
                  value={option.value}
                  style={{ 
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: selectedUpdateField === option.value ? '#f6ffed' : '#fff',
                    borderColor: selectedUpdateField === option.value ? '#b7eb8f' : '#d9d9d9'
                  }}
                >
                  <span style={{ marginLeft: 8, fontWeight: selectedUpdateField === option.value ? 500 : 'normal' }}>
                    {option.label}
                  </span>
                </Radio>
              ))}
            </div>
          </Radio.Group>

          {selectedUpdateField && processedJsonData && (
            <div style={{ marginTop: 16 }}>
              <Alert
                message={`Đã chọn: ${updateFieldOptions.find(opt => opt.value === selectedUpdateField)?.label}`}
                type="success"
                showIcon
                style={{ backgroundColor: '#f6ffed', marginBottom: 16 }}
              />
              
              <Button 
                type="primary"
                icon={<EyeOutlined />}
                onClick={handleValidateData}
                loading={isValidating}
              >
                Kiểm tra dữ liệu
              </Button>
            </div>
          )}
        </Card>
      );
    }
    // Hiển thị cho template delivery
    else if (validationResult.matchedTemplate === 'delivery') {
      return (
        <Card 
          size="small" 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SettingOutlined style={{ color: '#1890ff' }} />
              <span>Dữ liệu kế hoạch giao hàng</span>
            </div>
          }
          style={{ marginTop: 16 }}
        >
          <Alert
            message="Template kế hoạch giao hàng đã được xử lý"
            type="success"
            showIcon
            style={{ backgroundColor: '#f6ffed', marginBottom: 16 }}
          />
          
          <Button 
            type="primary"
            icon={<EyeOutlined />}
            onClick={handleValidateData}
            loading={isValidating}
          >
            Kiểm tra dữ liệu
          </Button>
        </Card>
      );
    }

    return null;
  };

  // Render validation details
  const renderValidationDetails = () => {
    if (!validationResult) return null;

    const { isValid, isPartialMatch, matchedTemplate, missingFields, extraFields } = validationResult;

    const getAlertType = () => {
      if (isValid) return 'success';
      if (isPartialMatch) return 'warning';
      return 'error';
    };

    const getIcon = () => {
      if (isValid) return <CheckCircleOutlined />;
      if (isPartialMatch) return <WarningOutlined />;
      return <CloseCircleOutlined />;
    };

    return (
      <Card size="small" title="Kết quả kiểm tra cấu trúc file" style={{ marginTop: 16 }}>
        <Alert
          message={validationResult.message}
          type={getAlertType()}
          icon={getIcon()}
          showIcon
          style={{ marginBottom: 16 }}
        />

        {matchedTemplate && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Template khớp: </Text>
            <Tag color="blue">
              {matchedTemplate === 'container' ? '1 trường (1truong.xlsx)' : 'Kế hoạch giao hàng (kehoachgiaohang.xlsx)'}
            </Tag>
            <br />
            <Text strong>Độ khớp: </Text>
            <Tag color={isValid ? 'green' : isPartialMatch ? 'orange' : 'red'}>
              {Math.round(validationResult.matchScore * 100)}%
            </Tag>
          </div>
        )}
        {/* Hiển thị trường thiếu */}
        {missingFields.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: '#ff4d4f' }}>Các trường bắt buộc bị thiếu:</Text>
            <div style={{ marginTop: 8 }}>
              {missingFields.map((field, index) => (
                <Tag key={index} color="red" style={{ margin: '2px' }}>
                  {field}
                </Tag>
              ))}
            </div>
          </div>
        )}
        {/* Hiển thị trường thừa */}
        {extraFields.length > 0 && (
          <div>
            <Text strong style={{ color: '#fa8c16' }}>Các trường không có trong template:</Text>
            <div style={{ marginTop: 8 }}>
              {extraFields.map((field, index) => (
                <Tag key={index} color="orange" style={{ margin: '2px' }}>
                  {field}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Kiểm tra xem có thể submit không
  const canSubmit = () => {
    if (!processedJsonData) return false;
    
    const templateType = validationResult?.matchedTemplate;
    
    // Template container cần chọn updateField
    if (templateType === 'container') {
      return selectedUpdateField && bulkValidationResult && bulkValidationResult.metadata.summary?.readyForUpdate > 0;
    }
    // Template delivery không cần chọn updateField
    else if (templateType === 'delivery') {
      return bulkValidationResult && bulkValidationResult.metadata.summary?.readyForUpdate > 0;
    }
    
    return false;
  };

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileExcelOutlined style={{ color: '#52c41a' }} />
            <span>Tải Dữ Liệu Excel</span>
          </div>
        }
        visible={visible}
        onCancel={handleCancel}
        width={1200}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading || isExecuting}
            onClick={handleSubmit}
            disabled={!canSubmit()}
          >
            Cập nhật dữ liệu
          </Button>,
        ]}
      >
        <div style={{ padding: '0 0 16px 0' }}>
          {/* Nút tải file mẫu - chỉ hiện khi chưa có file */}
          {!uploadedFile && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <Button 
                  type="dashed" 
                  icon={<DownloadOutlined />}
                  size="large"
                  onClick={() => setTemplateModalVisible(true)}
                  style={{ marginBottom: 8 }}
                >
                  Tải File Mẫu Excel
                </Button>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tải xuống file mẫu trước khi upload dữ liệu
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {!uploadedFile && <Divider />}

          {/* File Upload Section - chỉ hiện khi chưa có file */}
          {!uploadedFile && (
            <Card size="small" title="Tải File Excel Lên">
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">
                  Kéo thả file Excel vào đây hoặc click để chọn file
                </p>
                <p className="ant-upload-hint">
                  Hỗ trợ file .xlsx và .xls. Vui lòng sử dụng file mẫu để đảm bảo định dạng chính xác.
                </p>
              </Dragger>
            </Card>
          )}

          {/* File đã được chọn - hiện khi đã có file */}
          {uploadedFile && (
            <Card 
              size="small" 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>File đã được chọn</span>
                  <div>
                    <Button 
                      type="text" 
                      icon={<ReloadOutlined />}
                      size="small"
                      onClick={handleResetFile}
                      style={{ marginRight: 8 }}
                      title="Chọn file khác"
                    >
                      Chọn file khác
                    </Button>
                    <Button 
                      type="text" 
                      icon={<CloseOutlined />}
                      size="small"
                      onClick={handleResetFile}
                      danger
                      title="Xóa file"
                    />
                  </div>
                </div>
              }
            >
              <Alert
                message="Thông tin file"
                description={
                  <div>
                    <span>
                      <Text strong>Tên file:</Text> {uploadedFile.name}
                      <Text strong> Kích thước:</Text> {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      <Text strong> Số dòng dữ liệu:</Text> {fileData ? fileData.length - 1 : 0}
                    </span>
                  </div>
                }
                type="success"
                showIcon
              />
            </Card>
          )}

          {/* Validation Results */}
          {renderValidationDetails()}

          {/* Field Selection for Container Template */}
          {renderFieldSelection()}

          {/* Validation Table */}
          {renderValidationTable()}

          {/* Instructions */}
          <Card size="small" title="Lưu ý" style={{ marginTop: 16 }}>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <ul style={{ marginTop: 0, marginBottom: 0 }}>
                <li>Sử dụng file mẫu để đảm bảo định dạng dữ liệu chính xác</li>
                <li>File tối đa 10MB</li>
                <li>Kiểm tra kỹ dữ liệu trước khi tải lên</li>
                <li><strong>Đối với template 1truong: Bắt buộc phải chọn trường cần cập nhật</strong></li>
                <li><strong>Đối với template kehoachgiaohang: Tự động cập nhật tất cả thông tin giao hàng</strong></li>
                <li><strong>Kiểm tra dữ liệu trước khi thực hiện cập nhật</strong></li>
                <li><strong>Cập nhật an toàn: Chỉ cập nhật records chưa có giá trị</strong></li>
                <li><strong>Ghi đè tất cả: Cần xác nhận, sẽ thay thế giá trị hiện tại</strong></li>
              </ul>
            </div>
          </Card>
        </div>
      </Modal>

      {/* Modal tải file mẫu */}
      <TemplateDownloadModal 
        visible={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
      />
    </>
  );
};

export default ExcelUploadModal;