import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import Loader from '../components/Loader';
import AiLoader from '../components/AiLoader';

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);

  // load image data from api for multi-upload
    useEffect(() => {
      console.log(images)
      if (!itemId) return;
      api.getItem(itemId) 
        .then(data => {
          setImages(data.item.images || []);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, [itemId]);

  function handleFileSelect(e) {
    if (!e) return;
    if (!e.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(e));
    handleImageUpload(e);
  }

  async function handleImageUpload(e) {
    //offload identification should take no more than 3 imgs
    if (images.length > 3) return;
    let files = Array.from(e.target.files);
    if (files.length + images.length > 3) files = files.slice(0, 3 - images.length );
    setLoading(true);
    setError(null);
    try {
      let newItemId = itemId;
      if (!itemId) {
        const itemData = await api.createItem({});
        newItemId = itemData.item.id;
      }

      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const imageData = await api.uploadImages(newItemId, formData);

      if (!imageData.images?.length) throw new Error('Image upload failed');

      if (!itemId) setItemId(newItemId);
      setImages(prev => [...prev, ...(imageData.images || [])]);
    } catch (err) {
      setError(err.message);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPrimary(imageId) {
    try { 
      await api.setPrimaryImage(itemId, imageId);
      setImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === imageId })));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteImage(imageId) {
    try {
      await api.deleteImage(itemId, imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));

      if (images.length === 1) {
        try {
          await api.deleteItem(itemId);
        } catch (err) {
          console.error(err);
        }

        setItemId(null);
        setPreview(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleOffload() {
    if (!itemId || !images) return;
    setIdentifying(true);
    setError(null);
    try {
      const imageUrls = images.map(img => img.url);
      const identified = await api.identifyItem(itemId, imageUrls);
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

  const ready = !!itemId && !loading;

  return (
    <>
      {identifying && (
        <div className="ai-overlay" role="status" aria-live="polite" aria-label="AI identifying item">
          <div className="ai-overlay__content">
            <AiLoader />
            <p className="ai-overlay__text">Identifying your item...</p>
          </div>
        </div>
      )}
      <main className="upload-page">
      <div className="upload-page__header">
        <Link to="/items" className="detail-back">← My items</Link>
        <h1 className="upload-page__title">Add a new item</h1>
        <p className="upload-page__sub">
          Upload a photo to get started. Offload can identify it for you, or fill in the details yourself.
        </p>
      </div>

      <div className="upload-field">
            <div className="form-section__title-row">
              <h2 className="form-section__title">Images</h2>
              <button
                type="button"
                className={`btn btn--primary btn--sm ${images.length < 3 ? '' : 'upload-action--disabled'}`}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                {loading ? 'Uploading...' : '+ Add'}
              </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </div>

          { loading ? (
            <Loader />
          ) : (
            <div className="images-grid">
              {images.map(img => (
                <div
                  key={img.id}
                  className={`image-thumb ${img.isPrimary ? 'image-thumb--primary' : ''}`}
                >
                  <img src={img.url} alt="" className="image-thumb__img" />
                  <div className="image-thumb__overlay">
                    {!img.isPrimary && (
                      <button
                        className="image-thumb__btn"
                        onClick={() => handleSetPrimary(img.id)}
                      >
                        Set primary
                      </button>
                    )}
                    {img.isPrimary && (
                      <span className="image-thumb__primary-label">Primary</span>
                    )}
                    <button
                      className="image-thumb__btn image-thumb__btn--danger"
                      onClick={() => handleDeleteImage(img.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <div className="image-thumb image-thumb--info">
                  <strong>Identification Tips:</strong>
                <ul>
                  <li>Upload up to 3 images.</li>
                  <li>Use a neutral background with clear lighting.</li>
                  <li>Make sure the item and tags are clearly visible.</li>
                </ul>
                
              </div>
            </div>
          )}
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
  </>
);
}