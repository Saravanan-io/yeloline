import React, { useRef, useState } from 'react';
import { UploadCloud, Image, Trash2, CheckCircle2, X } from 'lucide-react';
import { uploadFileToStorage, compressImageToDataUrl } from '../../../services/firebaseService';
import './CoverImageUploader.css';

export default function CoverImageUploader({ value, onChange }) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const processAndUploadFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const storageUrl = await uploadFileToStorage(file, 'project_covers');
      const finalUrl = storageUrl || (await compressImageToDataUrl(file));
      if (finalUrl) {
        onChange(finalUrl);
        triggerToast("Primary cover image set successfully!");
      }
    } catch (err) {
      console.warn("Storage upload error, falling back to Data URL:", err);
      const dataUrl = await compressImageToDataUrl(file);
      if (dataUrl) {
        onChange(dataUrl);
        triggerToast("Cover image set successfully!");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processAndUploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processAndUploadFile(file);
  };

  return (
    <div className="cover-uploader-wrapper">
      {value ? (
        <div className="cover-preview-card">
          <img src={value} alt="Cover Preview" className="cover-preview-img" />
          <div className="cover-preview-actions">
            <button
              type="button"
              className="cover-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={14} /> Change Image
            </button>
            <button
              type="button"
              className="cover-btn"
              onClick={() => onChange('')}
              style={{ color: 'var(--danger-red)' }}
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`cover-dropzone ${isDragActive ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="cover-dropzone-icon">
            <Image size={22} />
          </div>
          <div>
            <div className="image-dropzone-title">
              {isDragActive ? "Drop cover image file now!" : "Click to upload or drag & drop primary cover image"}
            </div>
            <div className="image-dropzone-sub">Supports JPG, PNG, WEBP high-res main banner photos</div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Success Toast */}
      {toastMsg && (
        <div className="upload-success-toast">
          <div className="upload-success-toast-content">
            <CheckCircle2 size={18} />
            <span>{toastMsg}</span>
          </div>
          <button className="toast-close-btn" onClick={() => setToastMsg(null)} title="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Fallback URL Input */}
      <div className="cover-url-input-row">
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
          Or Image URL:
        </span>
        <input
          type="text"
          className="cover-url-input"
          placeholder="https://images.unsplash.com/..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
