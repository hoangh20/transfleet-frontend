import axios from 'axios';

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.error('Missing Cloudinary environment variables:', {
    CLOUD_NAME,
    UPLOAD_PRESET
  });
}

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

export const uploadToCloudinary = async (file) => {
  try {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration missing');
    }

    // Tạo tên file duy nhất nhưng giữ nguyên tên gốc
    const timestamp = Date.now();
    const originalName = file.name.split('.')[0]; // Lấy tên không có extension
    const uniqueFileName = `${originalName}_${timestamp}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'repairs/images');
    formData.append('resource_type', 'image');
    formData.append('public_id', `repairs/images/${uniqueFileName}`);

    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

// Upload multiple images
export const uploadMultipleToCloudinary = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

// Upload file (PDF, DOC, XLS, etc.)
export const uploadFileToCloudinary = async (file) => {
  try {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration missing');
    }

    // Tạo tên file với timestamp để tránh trùng lặp nhưng giữ tên gốc
    const timestamp = Date.now();
    const originalName = file.name.split('.')[0]; // Tên file không có extension
    const extension = file.name.split('.').pop(); // Extension
    const uniqueFileName = `${originalName}_${timestamp}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'repairs/quotations');
    formData.append('resource_type', 'auto');
    formData.append('public_id', `repairs/quotations/${uniqueFileName}`);

    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
      originalName: file.name, // Giữ nguyên tên file gốc
      displayName: `${originalName}.${extension}`, // Tên hiển thị
      fileType: response.data.resource_type,
      format: response.data.format
    };
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw error;
  }
};