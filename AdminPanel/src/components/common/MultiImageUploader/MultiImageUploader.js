import React, { useRef, useState } from 'react';
import { UploadCloud, Trash2, ArrowLeft, ArrowRight, Tag, CheckCircle2, X } from 'lucide-react';
import { uploadFileToStorage, compressImageToDataUrl } from '../../../services/firebaseService';
import './MultiImageUploader.css';

const TAG_OPTIONS = ['Elevation', 'Living Room', 'Kitchen', 'Floor Plan', 'Bathroom', 'Interior', 'Before / After'];

export default function MultiImageUploader({ images = [], onChange }) {
  const fileInputRef = useRef(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const processAndUploadFiles = async (files) => {
    if (!files.length) return;
    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file, idx) => {
        try {
          const storageUrl = await uploadFileToStorage(file, 'project_gallery');
          const finalUrl = storageUrl || (await compressImageToDataUrl(file));
          return {
            id: `img-${Date.now()}-${idx}`,
            url: finalUrl,
            tag: 'Elevation'
          };
        } catch (e) {
          const fallbackDataUrl = await compressImageToDataUrl(file);
          return {
            id: `img-${Date.now()}-${idx}`,
            url: fallbackDataUrl,
            tag: 'Elevation'
          };
        }
      });
      const uploadedImages = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedImages]);
      triggerToast(`${files.length} image(s) processed and uploaded successfully!`);
    } catch (err) {
      console.warn("Gallery upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) processAndUploadFiles(files);
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
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) processAndUploadFiles(files);
  };

  const handleTagChange = (id, newTag) => {
    const updated = images.map(img => img.id === id ? { ...img, tag: newTag } : img);
    onChange(updated);
  };

  const handleDelete = (id) => {
    const updated = images.filter(img => img.id !== id);
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="image-uploader-wrapper">
      <div 
        className={`image-dropzone ${isDragActive ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <div className="image-dropzone-icon">
          <UploadCloud size={24} />
        </div>
        <div>
          <div className="image-dropzone-title">
            {isUploading ? "Uploading images to Firebase Storage..." : (isDragActive ? "Drop images here to upload!" : "Click to upload or drag & drop project images")}
          </div>
          <div className="image-dropzone-sub">Supports PNG, JPG, WEBP gallery photos, floor plans & elevations</div>
        </div>
      </div>

      {/* Success Toast Pop-up */}
      {toastMsg && (
        <div className="upload-success-toast">
          <div className="upload-success-toast-content">
            <CheckCircle2 size={18} />
            <span>{toastMsg}</span>
          </div>
          <button className="toast-close-btn" onClick={() => setToastMsg(null)} title="Dismiss notification">
            <X size={16} />
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((img, index) => (
            <div key={img.id || index} className="image-card">
              <img src={img.url} alt={img.tag} className="image-card-thumb" />
              <div className="image-card-controls">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                  <select
                    className="image-card-tag-select"
                    value={img.tag || 'Elevation'}
                    onChange={(e) => handleTagChange(img.id, e.target.value)}
                  >
                    {TAG_OPTIONS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="image-card-actions">
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                      type="button"
                      className="image-action-btn"
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                      title="Move Left"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      className="image-action-btn"
                      disabled={index === images.length - 1}
                      onClick={() => handleMove(index, 1)}
                      title="Move Right"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="image-action-btn delete"
                    onClick={() => handleDelete(img.id)}
                    title="Remove Image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
