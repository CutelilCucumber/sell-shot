import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Loader from '../components/Loader';

const STATUS_LABEL = {
  DRAFT: 'Draft', PENDING: 'Pending', ACTIVE: 'Active',
  SOLD: 'Sold', EXPIRED: 'Expired', REMOVED: 'Removed'
};

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [marketplaces, setMarketplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  // new listing form - shown by default
  const [listForm, setListForm] = useState({ marketplaceId: '', title: '', description: '', listingPrice: '' });
  const [listing, setListing] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState(null);

  useEffect(() => {
    Promise.all([api.getItem(id), api.getMarketplaces()])
      .then(([itemData, mpData]) => {
        setItem(itemData.item);
        setMarketplaces(mpData.marketplaces);
        const primary = itemData.item.images?.find(i => i.isPrimary) || itemData.item.images?.[0];
        setActiveImage(primary || null);
        setListForm(f => ({
          ...f,
          title: itemData.item.title || '',
          description: itemData.item.description || ''
        }));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleMarketplaceChange(e) {
    const mpId = e.target.value;
    const mp = marketplaces.find(m => m.id === mpId) || null;
    setSelectedMarketplace(mp);
    setListForm(f => ({ ...f, marketplaceId: mpId }));
  }

  async function handleCreateListing(e) {
    e.preventDefault();
    if (!selectedMarketplace) return;

    if (selectedMarketplace.type === 'TEMPLATE') {
      window.open(selectedMarketplace.listingUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setListing(true);
    try {
      const data = await api.createListing(id, {
        ...listForm,
        listingPrice: listForm.listingPrice ? parseFloat(listForm.listingPrice) : null
      });
      setItem(prev => ({ ...prev, listings: [...(prev.listings || []), data.listing] }));
      setListForm({ marketplaceId: '', title: '', description: '', listingPrice: '' });
      setSelectedMarketplace(null);
      navigate('/listings');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create listing');
    } finally {
      setListing(false);
    }
  }

  async function handleStatusChange(listingId, status) {
    try {
      const data = await api.updateListingStatus(id, listingId, status);
      setItem(prev => ({
        ...prev,
        listings: prev.listings.map(l => l.id === listingId ? data.listing : l)
      }));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteListing(listingId) {
    if (!confirm('Remove this listing?')) return;
    try {
      await api.deleteListing(id, listingId);
      setItem(prev => ({ ...prev, listings: prev.listings.filter(l => l.id !== listingId) }));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <Loader />;
  if (error) return <div className="page-status page-status--error">{error}</div>;
  if (!item) return <div className="page-status">Item not found.</div>;

  return (
    <main className="general-page">
      <div className="detail-nav">
        <Link to="/items" className="detail-back">← My items</Link>
        <Link to={`/items/${id}/edit`} className="btn btn--ghost btn--sm">Edit item</Link>
      </div>

      <div className="detail-layout">
        <div className="detail-images">
          <div className="detail-image-main">
            {activeImage ? (
              <img src={activeImage.url} alt={item.title || 'Item'} className="detail-image-main__img" />
            ) : (
              <div className="detail-image-placeholder">
                <span>◈</span>
                <p>No images yet</p>
                <Link to={`/items/${id}/edit`} className="btn btn--ghost btn--sm">Add images</Link>
              </div>
            )}
          </div>
          {item.images?.length > 1 && (
            <div className="detail-image-thumbs">
              {item.images.map(img => (
                <button
                  key={img.id}
                  className={`detail-thumb ${activeImage?.id === img.id ? 'detail-thumb--active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <div className="detail-info__header">
            <h1 className="detail-info__title">{item.title || 'Untitled item'}</h1>
            {item.estimatedPrice && (
              <span className="detail-info__price">${Number(item.estimatedPrice).toFixed(2)}</span>
            )}
          </div>

          <div className="detail-tags">
            {item.brand && <span className="detail-tag">{item.brand}</span>}
            {item.category && <span className="detail-tag">{item.category}</span>}
            {item.size && <span className="detail-tag">Size {item.size}</span>}
            {item.color && <span className="detail-tag">{item.color}</span>}
            {item.condition && <span className="detail-tag">{item.condition}</span>}
            {item.aiIdentified && <span className="detail-tag detail-tag--ai">AI identified</span>}
          </div>

          {item.description && (
            <p className="detail-description">{item.description}</p>
          )}

          {item.tags?.length > 0 && (
            <div className="detail-item-tags">
              {item.tags.map(t => (
                <span key={t.tagId} className="detail-item-tag">#{t.tag.name}</span>
              ))}
            </div>
          )}

          <div className="detail-listings">
            <h2 className="detail-listings__title">Create New Listing</h2>

            <form className="list-form" onSubmit={handleCreateListing}>
              <div className="list-form__group">
                <label className="list-form__label">Marketplace</label>
                <select
                  className="list-form__input"
                  value={listForm.marketplaceId}
                  onChange={handleMarketplaceChange}
                  required
                >
                  <option value="">Select marketplace...</option>
                  {marketplaces.map(mp => (
                    <option key={mp.id} value={mp.id}>
                      {mp.name} {mp.type === 'TEMPLATE' ? '(Template)' : '(API)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="list-form__group">
                <label className="list-form__label">Title</label>
                <input
                  className="list-form__input"
                  value={listForm.title}
                  onChange={e => setListForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="list-form__group">
                <label className="list-form__label">Description</label>
                <textarea
                  className="list-form__input"
                  rows={3}
                  value={listForm.description}
                  onChange={e => setListForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <div className="list-form__group">
                <label className="list-form__label">Price (USD)</label>
                <input
                  className="list-form__input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={listForm.listingPrice}
                  onChange={e => setListForm(f => ({ ...f, listingPrice: e.target.value }))}
                />
              </div>

              {selectedMarketplace && (
                <p className="list-form__hint">
                  {selectedMarketplace.type === 'TEMPLATE'
                    ? `Opens ${selectedMarketplace.name} in a new tab — you'll need to re-upload photos and complete the listing there.`
                    : 'Creates the listing on eBay via API.'}
                </p>
              )}

              <button className="btn btn--primary" type="submit" disabled={listing || !listForm.marketplaceId}>
                {listing
                  ? 'Creating...'
                  : selectedMarketplace?.type === 'TEMPLATE'
                    ? `Open ${selectedMarketplace.name} Listing Page`
                    : 'Create eBay Listing'}
              </button>
            </form>

            {item.listings?.length > 0 && (
              <div className="detail-listings__existing">
                <h3 className="detail-listings__existing-title">Existing Listings</h3>
                <div className="listing-list">
                  {item.listings.map(l => (
                    <div className="listing-row" key={l.id}>
                      <div className="listing-row__left">
                        <span className={`listing-status listing-status--${l.status.toLowerCase()}`}>
                          {STATUS_LABEL[l.status]}
                        </span>
                        <span className="listing-row__mp">{l.marketplace?.name}</span>
                        <span className="listing-row__title">{l.title}</span>
                      </div>
                      <div className="listing-row__right">
                        {l.listingPrice && (
                          <span className="listing-row__price">${Number(l.listingPrice).toFixed(2)}</span>
                        )}
                        <select
                          className="listing-row__status-select"
                          value={l.status}
                          onChange={e => handleStatusChange(l.id, e.target.value)}
                        >
                          {Object.keys(STATUS_LABEL).map(s => (
                            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                          ))}
                        </select>
                        <button
                          className="listing-row__delete"
                          onClick={() => handleDeleteListing(l.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}