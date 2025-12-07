// Local integrations (standalone mode - no Base44 dependency)
// These provide browser-based alternatives to cloud services

// File storage using localStorage with base64 encoding
const FILE_STORAGE_KEY = 'fpm_files';

const loadFiles = () => {
  try {
    const data = localStorage.getItem(FILE_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveFiles = (files) => {
  try {
    localStorage.setItem(FILE_STORAGE_KEY, JSON.stringify(files));
  } catch (error) {
    console.error('Error saving files to storage:', error);
  }
};

// Convert File to base64 data URL
const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Upload a file and return a local URL reference
export const UploadFile = async (file) => {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const dataUrl = await fileToDataUrl(file);

  const files = loadFiles();
  files[fileId] = {
    id: fileId,
    name: file.name,
    type: file.type,
    size: file.size,
    data: dataUrl,
    uploadedAt: new Date().toISOString()
  };
  saveFiles(files);

  return {
    file_url: `local://${fileId}`,
    file_name: file.name
  };
};

// Upload private file (same as regular upload in standalone mode)
export const UploadPrivateFile = async (file) => {
  return UploadFile(file);
};

// Get a signed URL for a file (returns the actual data URL for local files)
export const CreateFileSignedUrl = async (fileUrl) => {
  if (!fileUrl) return { url: null };

  // If it's already a regular URL, return it as-is
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return { url: fileUrl };
  }

  // Handle local file references
  if (fileUrl.startsWith('local://')) {
    const fileId = fileUrl.replace('local://', '');
    const files = loadFiles();
    const file = files[fileId];
    if (file) {
      return { url: file.data };
    }
  }

  return { url: fileUrl };
};

// Stub for LLM invocation (not available in standalone mode)
export const InvokeLLM = async () => {
  console.warn('InvokeLLM is not available in standalone mode');
  return { error: 'LLM integration not available in standalone mode' };
};

// Stub for email sending (not available in standalone mode)
export const SendEmail = async () => {
  console.warn('SendEmail is not available in standalone mode');
  return { error: 'Email integration not available in standalone mode' };
};

// Stub for image generation (not available in standalone mode)
export const GenerateImage = async () => {
  console.warn('GenerateImage is not available in standalone mode');
  return { error: 'Image generation not available in standalone mode' };
};

// Stub for data extraction (not available in standalone mode)
export const ExtractDataFromUploadedFile = async () => {
  console.warn('ExtractDataFromUploadedFile is not available in standalone mode');
  return { error: 'Data extraction not available in standalone mode' };
};

// Core namespace for backwards compatibility
export const Core = {
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile,
  CreateFileSignedUrl,
  UploadPrivateFile
};
