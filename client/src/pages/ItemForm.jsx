import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import AiField from '../components/AiField';

const CONDITIONS = ['new_with_tags', 'like_new', 'good', 'fair', 'poor'];
const CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other'];

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isBlank = !id;

  const [item, setItem] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', brand: '', category: '',
    size: '', color: '', material: '', condition: '',
    estimatedPrice: '', tags: []
  });
  const [aiData, setAiData] = useState(null);
  const [images, setImages] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(!isBlank);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isBlank) return;
    api.getItem(id)
      .then(data => {
        const i = data.item;
        setItem(i);
        setAiData(i.aiData || null);
        setForm({
          title:          i.title || '',
          description:    i.description || '',
          brand:          i.brand || '',
          category:       i.category || '',
          size:           i.size || '',
          color:          i.color || '',
          material:       i.material || '',
          condition:      i.condition || '',
          estimatedPrice: i.estimatedPrice ? String(i.estimatedPrice) : '',
          tags:           i.tags?.map(t => t.tag.name) || [],
        });
        setImages(i.images || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // helper to get confidence + reasoning for a field from aiData
  function ai(field) {
    if (!aiData?.[field]) return {};
    return {
      confidence: aiData[field].confidence_score,
      reasoning:  aiData[field].reasoning,
    };
  }

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
    if (!files.length || !id) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const data = await api.uploadImages(id, formData);
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
        estimatedPrice: form.estimatedPrice ? parseFloat(form.estimatedPrice) : null,
      };

      if (isBlank) {
        const data = await api.createItem(payload);
        navigate(`/items/${data.item.id}`);
      } else {
        await api.updateItem(id, payload);
        navigate(`/items/${id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page-status">Loading...</div>;

  return (
    <main className="form-page">
      <div className="form-nav">
        <Link to={id ? `/items/${id}` : '/items'} className="detail-back">
          ← {id ? 'Back to item' : 'My items'}
        </Link>
        <div className="form-nav__right">
          {aiData && <span className="form-ai-badge">◈ AI identified</span>}
          <h1 className="form-page__title">{isBlank ? 'New item' : 'Edit item'}</h1>
        </div>
      </div>

      <div className="form-layout">
        <form className="item-form" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

          {aiData && (
            <div className="form-ai-notice">
              <span className="form-ai-notice__icon">◈</span>
              <p>Fields are pre-filled by AI. Border colour shows confidence — green is high, red is low. Click any field to see the reasoning.</p>
            </div>
          )}

          <div className="form-section">
            <h2 className="form-section__title">Details</h2>

            <div className="form-row">
              <AiField
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Vintage Levi's 501 Jeans"
                {...ai('title')}
              />
            </div>

            <div className="form-row form-row--2">
              <AiField
                label="Brand"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g. Levi's"
                {...ai('brand')}
              />
              <AiField
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                {...ai('category')}
              >
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </AiField>
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
              <AiField
                label="Color"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="e.g. indigo"
                {...ai('color')}
              />
              <AiField
                label="Condition"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                {...ai('condition')}
              >
                <option value="">Select...</option>
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </AiField>
            </div>

            <div className="form-row form-row--2">
              <AiField
                label="Estimated price (USD)"
                name="estimatedPrice"
                type="number"
                value={form.estimatedPrice}
                onChange={handleChange}
                placeholder="0.00"
                {...ai('estimatedPrice')}
              />
              <AiField
                label="Material"
                name="material"
                value={form.material}
                onChange={handleChange}
                placeholder="e.g. cotton, leather"
                {...ai('material')}
              />
            </div>

            <AiField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the item for your listing..."
              textarea
              rows={4}
              {...ai('description')}
            />

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
              {saving ? 'Saving...' : 'Save item'}
            </button>
            <Link to={id ? `/items/${id}` : '/items'} className="btn btn--ghost">Cancel</Link>
          </div>
        </form>

        <div className="form-images">
          <div className="form-section__title-row">
            <h2 className="form-section__title">Images</h2>
            {id && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : '+ Add'}
              </button>
            )}
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
              {id && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload images
                </button>
              )}
            </div>
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
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
