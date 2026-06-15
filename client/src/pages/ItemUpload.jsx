import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  function handleFileSelect(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(file));
    handleUpload(file);
  }

  async function handleUpload(file) {
    setUploading(true);
    setError(null);
    try {
      // 1. create a draft item to get an id
      const itemData = await api.createItem({});
      const itemId = itemData.item.id;

      // 2. upload the image to that item
      const formData = new FormData();
      formData.append('images', file);
      const imageData = await api.uploadImages(itemId, formData);

      if (!imageData.images?.length) {
        throw new Error('Image upload failed');
      }

      // 3. navigate to the edit form for this item
      navigate(`/items/${itemId}/edit`, { state: { justUploaded: true } });
    } catch (err) {
      setError(err.message);
      setUploading(false);
      setPreview(null);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  }

  function onDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave() {
    setDragging(false);
  }

  return (
    <main className="upload-page">
      <div className="upload-page__header">
        <Link to="/items" className="detail-back">← My items</Link>
        <h1 className="upload-page__title">Add a new item</h1>
        <p className="upload-page__sub">
          Take or upload a photo. We'll create the listing and you can fill in the details.
        </p>
      </div>

      <div
        ref={dropRef}
        className={`upload-drop ${dragging ? 'upload-drop--dragging' : ''} ${uploading ? 'upload-drop--busy' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="" className="upload-drop__preview" />
        ) : (
          <div className="upload-drop__placeholder">
            <span className="upload-drop__icon">◈</span>
            <p className="upload-drop__text">Drop a photo here, or click to browse</p>
            <p className="upload-drop__hint">JPG, PNG, WEBP, or HEIC — up to 10MB</p>
          </div>
        )}

        {uploading && (
          <div className="upload-drop__overlay">
            <div className="upload-spinner" />
            <p>Creating item...</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={e => handleFileSelect(e.target.files?.[0])}
        />
      </div>

      {error && <p className="upload-error">{error}</p>}

      <div className="upload-page__alt">
        <span className="upload-page__alt-text">or</span>
        <Link to="/items/blank" className="upload-page__alt-link">create a blank listing manually</Link>
      </div>
    </main>
  );
}
