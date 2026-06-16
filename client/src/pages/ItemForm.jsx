import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import Loader from '../components/Loader';

const CONDITIONS = ['new_with_tags', 'like_new', 'good', 'fair', 'poor'];
const CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other'];

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '', description: '', brand: '', category: '',
    size: '', color: '', condition: '', estimatedPrice: '', tags: []
  });
  const [images, setImages] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getItem(id)
      .then(data => {
        const item = data.item;
        setForm({
          title: item.title || '',
          description: item.description || '',
          brand: item.brand || '',
          category: item.category || '',
          size: item.size || '',
          color: item.color || '',
          condition: item.condition || '',
          estimatedPrice: item.estimatedPrice ? String(item.estimatedPrice) : '',
          tags: item.tags?.map(t => t.tag.name) || []
        });
        setImages(item.images || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function addTag(e) {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  }

  function removeTag(tag) {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    let itemId = id;


    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const data = await api.uploadImages(itemId, formData);
      setImages(prev => [...prev, ...(data.images || [])]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSetPrimary(imageId) {
    try {
      await api.setPrimaryImage(id, imageId);
      setImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === imageId })));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteImage(imageId) {
    try {
      await api.deleteImage(id, imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        estimatedPrice: form.estimatedPrice ? parseFloat(form.estimatedPrice) : null
      };

      await api.updateItem(id, payload);
      navigate(`/items/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader/>;

  return (
  <main className="general-page">
    <div className="form-nav">
      <Link to="/items" className="detail-back">
        ← Back
      </Link>
      <h1 className="form-page__title">Item Details</h1>
    </div>

    <div className="form-layout">
      <form className="item-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <div className="form-section">
          <h2 className="form-section__title">Details</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input 
                className="form-input" 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                placeholder="e.g. Vintage Levi's 501 Jeans" 
              />
            </div>
          </div>

          <div className="form-row form-row--2">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input 
                className="form-input" 
                name="brand" 
                value={form.brand} 
                onChange={handleChange} 
                placeholder="e.g. Levi's" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row form-row--3">
            <div className="form-group">
              <label className="form-label">Size</label>
              <input 
                className="form-input" 
                name="size" 
                value={form.size} 
                onChange={handleChange} 
                placeholder="M, 32, etc." 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <input 
                className="form-input" 
                name="color" 
                value={form.color} 
                onChange={handleChange} 
                placeholder="e.g. indigo" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-input" name="condition" value={form.condition} onChange={handleChange}>
                <option value="">Select...</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row form-row--2">
            <div className="form-group">
              <label className="form-label">Estimated price (USD)</label>
              <input 
                className="form-input" 
                name="estimatedPrice" 
                type="number" 
                step="0.01" 
                min="0" 
                value={form.estimatedPrice} 
                onChange={handleChange} 
                placeholder="0.00" 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input form-input--textarea" 
              name="description" 
              rows={4} 
              value={form.description} 
              onChange={handleChange} 
              placeholder="Describe the item for your listing..." 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="tag-input-row">
              <input
                className="form-input"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag(e)}
                placeholder="Add a tag and press Enter"
              />
              <button className="btn btn--ghost btn--sm" onClick={addTag} type="button">Add</button>
            </div>
            {form.tags.length > 0 && (
              <div className="tag-chips">
                {form.tags.map(tag => (
                  <span key={tag} className="tag-chip">
                    #{tag}
                    <button type="button" className="tag-chip__remove" onClick={() => removeTag(tag)}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <Link to="/items" className="btn btn--ghost">Cancel</Link>
        </div>
      </form>

      <div className="form-images">
        <div className="form-section__title-row">
          <h2 className="form-section__title">Images</h2>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : '+ Add images'}
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

        {images.length === 0 ? (
          <div className="images-empty">
            <p>No images yet</p>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileInputRef.current?.click()}>
              Upload images
            </button>
          </div>
        ) : (
          <div className="images-grid">
            {images.map(img => (
              <div key={img.id} className={`image-thumb ${img.isPrimary ? 'image-thumb--primary' : ''}`}>
                <img src={img.url} alt="" className="image-thumb__img" />
                <div className="image-thumb__overlay">
                  {!img.isPrimary && (
                    <button className="image-thumb__btn" onClick={() => handleSetPrimary(img.id)}>
                      Set primary
                    </button>
                  )}
                  {img.isPrimary && <span className="image-thumb__primary-label">Primary</span>}
                  <button className="image-thumb__btn image-thumb__btn--danger" onClick={() => handleDeleteImage(img.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </main>
);
}
