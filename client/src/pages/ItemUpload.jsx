import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import Loader from '../components/Loader';

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
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
    setItemId(null);
    setImageUrl(null);
    try {
      const itemData = await api.createItem({});
      const newItemId = itemData.item.id;

      const formData = new FormData();
      formData.append('images', file);
      const imageData = await api.uploadImages(newItemId, formData);

      if (!imageData.images?.length) throw new Error('Image upload failed');

      setItemId(newItemId);
      setImageUrl(imageData.images[0].url);
    } catch (err) {
      setError(err.message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    // item was created as a draft — delete it to avoid orphans
    if (itemId) {
      api.deleteItem(itemId).catch(console.error);
    }
    setPreview(null);
    setItemId(null);
    setImageUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleOffload() {
    if (!itemId || !imageUrl) return;
    setIdentifying(true);
    setError(null);
    try {
      const identified = await api.identifyItem(itemId, imageUrl);
      navigate(`/items/${itemId}/edit`, {
        state: { identified }
      });
    } catch (err) {
      setError(err.message);
      setIdentifying(false);
    }
  }

  function handleManual() {
    if (!itemId) return;
    navigate(`/items/${itemId}/edit`, {
      state: { justUploaded: true }
    });
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  }

  const ready = !!itemId && !uploading;

  return (
    <main className="upload-page">
      <div className="upload-page__header">
        <Link to="/items" className="detail-back">← My items</Link>
        <h1 className="upload-page__title">Add a new item</h1>
        <p className="upload-page__sub">
          Upload a photo to get started. Offload can identify it for you, or fill in the details yourself.
        </p>
      </div>

      <div
        className={`upload-drop ${dragging ? 'upload-drop--dragging' : ''} ${uploading ? 'upload-drop--busy' : ''} ${preview ? 'upload-drop--filled' : ''}`}
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !preview && !uploading && fileInputRef.current?.click()}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="upload-drop__preview" />
            {!uploading && (
              <button
                className="upload-drop__remove"
                onClick={e => { e.stopPropagation(); handleRemove(); }}
                title="Remove photo"
              >
                ✕
              </button>
            )}
          </>
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
          </div>
        )}

        {identifying && (
          <div className="upload-drop__overlay">
            <Loader />
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

      <div className="upload-actions">
        <button
          className={`upload-action upload-action--offload ${ready ? '' : 'upload-action--disabled'}`}
          onClick={handleOffload}
          disabled={!ready || identifying}
        >
          <span className="upload-action__icon">◈</span>
          <span className="upload-action__label">Offload</span>
          <span className="upload-action__sub">AI identifies & prices</span>
        </button>

        <button
          className={`upload-action upload-action--manual ${ready ? '' : 'upload-action--disabled'}`}
          onClick={handleManual}
          disabled={!ready || identifying}
        >
          <span className="upload-action__icon">✎</span>
          <span className="upload-action__label">List manually</span>
          <span className="upload-action__sub">Fill in details yourself</span>
        </button>
      </div>

      {!preview && (
        <div className="upload-page__alt">
          <span className="upload-page__alt-text">no photo?</span>
          <Link to="/items/blank" className="upload-page__alt-link">create a blank listing</Link>
        </div>
      )}
    </main>
  );
}