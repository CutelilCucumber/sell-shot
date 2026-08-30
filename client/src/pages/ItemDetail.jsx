import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Loader from '../components/Loader';

function CopyButton({ value, label, copied, onCopied }) {
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    onCopied?.(label);
  };
  return (
    <button
      type="button"
      className={`btn btn--ghost btn--sm copy-btn ${copied ? 'copy-btn--copied' : ''}`}
      onClick={handleCopy}
      disabled={!value}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copied ? '✓ Copied' : '📋 Copy'}
    </button>
  );
}

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
  const [copiedField, setCopiedField] = useState(null);
  const [existingEbayListing, setExistingEbayListing] = useState(null);
  const [ebayConnected, setEbayConnected] = useState(false);
  const [ebayLoading, setEbayLoading] = useState(true);
  const [connectingEbay, setConnectingEbay] = useState(false);

  useEffect(() => {
    Promise.all([api.getItem(id), api.getMarketplaces(), api.getEbayStatus()])
      .then(([itemData, mpData, ebayStatus]) => {
        setItem(itemData.item);
        setMarketplaces(mpData.marketplaces);
        setEbayConnected(ebayStatus.connected);
        const primary = itemData.item.images?.find(i => i.isPrimary) || itemData.item.images?.[0];
        setActiveImage(primary || null);

        // Find existing eBay listing (marketplace type === 'API')
        const ebayListing = itemData.item.listings?.find(l => l.marketplace?.type === 'API') || null;
        setExistingEbayListing(ebayListing);

        // Pre-fill form with existing eBay listing data or item data
        const title = ebayListing?.title || itemData.item.title || '';
        const description = ebayListing?.description || itemData.item.description || '';
        const listingPrice = ebayListing?.listingPrice
          ? String(ebayListing.listingPrice)
          : (itemData.item.estimatedPrice ? String(itemData.item.estimatedPrice) : '');

        setListForm(f => ({
          ...f,
          title,
          description,
          listingPrice
        }));

        // If eBay listing exists, pre-select eBay marketplace
        if (ebayListing) {
          const ebayMarketplace = mpData.marketplaces.find(mp => mp.type === 'API');
          if (ebayMarketplace) {
            setSelectedMarketplace(ebayMarketplace);
            setListForm(f => ({ ...f, marketplaceId: ebayMarketplace.id }));
          }
        }
      })
      .catch(err => setError(err.message))
      .finally(() => {
        setLoading(false);
        setEbayLoading(false);
      });
  }, [id]);

  function handleMarketplaceChange(e) {
    const mpId = e.target.value;
    const mp = marketplaces.find(m => m.id === mpId) || null;
    setSelectedMarketplace(mp);
    setListForm(f => ({ ...f, marketplaceId: mpId }));
  }

  async function handleConnectEbay() {
    setConnectingEbay(true);
    try {
      const { authUrl } = await api.getEbayAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to connect eBay');
    } finally {
      setConnectingEbay(false);
    }
  }

  async function handleCreateListing(e) {
    e.preventDefault();
    if (!selectedMarketplace) return;

    if (selectedMarketplace.type === 'TEMPLATE') {
      window.open(selectedMarketplace.listingUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!ebayConnected) {
      await handleConnectEbay();
      return;
    }

    setListing(true);
    try {
      const payload = {
        ...listForm,
        listingPrice: listForm.listingPrice ? parseFloat(listForm.listingPrice) : null
      };

      let data;
      if (existingEbayListing) {
        // Update existing eBay listing
        data = await api.updateListing(id, existingEbayListing.id, payload);
      } else {
        // Create new eBay listing
        data = await api.createListing(id, payload);
      }

      setItem(prev => {
        const newListings = existingEbayListing
          ? prev.listings.map(l => l.id === existingEbayListing.id ? data.listing : l)
          : [...(prev.listings || []), data.listing];
        return { ...prev, listings: newListings };
      });

      setListForm({ marketplaceId: '', title: '', description: '', listingPrice: '' });
      setSelectedMarketplace(null);
      setExistingEbayListing(null);
      navigate('/listings');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to save listing');
    } finally {
      setListing(false);
    }
  }

  if (loading) return <Loader />;
  if (error) return <div className="page-status page-status--error">{error}</div>;
  if (!item) return <div className="page-status">Item not found.</div>;

  // Find eBay marketplace for display
  const ebayMarketplace = marketplaces.find(mp => mp.type === 'API');

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
            <form className="list-form" onSubmit={handleCreateListing}>

            <h2 className="detail-listings__title">Create New Listing</h2>
              <div className="list-form__group">
                <label className="list-form__label">Marketplace</label>
                <select
                  className="list-form__input"
                  value={listForm.marketplaceId}
                  onChange={handleMarketplaceChange}
                  required
                >
                  <option value="">Select marketplace...</option>
                  {marketplaces
                    .slice()
                    .sort((a, b) => {
                      // eBay (API) first, then template marketplaces alphabetically
                      if (a.type === 'API' && b.type !== 'API') return -1;
                      if (b.type === 'API' && a.type !== 'API') return 1;
                      return a.name.localeCompare(b.name);
                    })
                    .map(mp => (
                      <option key={mp.id} value={mp.id}>
                        {mp.name} {mp.type === 'TEMPLATE' ? '(Template)' : '(API)'}
                      </option>
                    ))}
                </select>
              </div>

              {ebayMarketplace && !ebayConnected && (
                <div className="ebay-connect-notice">
                  <p className="ebay-connect-notice__text">
                    <strong>eBay not connected.</strong> Connect your eBay account to create listings via API.
                  </p>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={handleConnectEbay}
                    disabled={connectingEbay || ebayLoading}
                  >
                    {connectingEbay ? 'Connecting...' : 'Connect eBay Account'}
                  </button>
                </div>
              )}

              <div className="list-form__group">
                <div className="list-form__label-row">
                  <label className="list-form__label">Title</label>
                  <CopyButton
                    value={listForm.title}
                    label="title"
                    copied={copiedField === 'title'}
                    onCopied={setCopiedField}
                  />
                </div>
                <input
                  className="list-form__input"
                  value={listForm.title}
                  onChange={e => setListForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="list-form__group">
                <div className="list-form__label-row">
                  <label className="list-form__label">Description</label>
                  <CopyButton
                    value={listForm.description}
                    label="description"
                    copied={copiedField === 'description'}
                    onCopied={setCopiedField}
                  />
                </div>
                <textarea
                  className="list-form__input"
                  rows={3}
                  value={listForm.description}
                  onChange={e => setListForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <div className="list-form__group">
                <div className="list-form__label-row">
                  <label className="list-form__label">Price (USD)</label>
                  <CopyButton
                    value={listForm.listingPrice}
                    label="price"
                    copied={copiedField === 'price'}
                    onCopied={setCopiedField}
                  />
                </div>
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
                    : existingEbayListing
                      ? 'Updates the existing eBay listing.'
                      : ebayConnected
                        ? 'Creates the listing on eBay via API.'
                        : 'Connect eBay first to create listings via API.'}
                </p>
              )}

              <button className="btn btn--primary" type="submit" disabled={listing || !listForm.marketplaceId || (selectedMarketplace?.type === 'API' && !ebayConnected)}>
                {listing
                  ? 'Saving...'
                  : !listForm.marketplaceId
                    ? 'Select a marketplace'
                    : selectedMarketplace?.type === 'TEMPLATE'
                      ? `Open ${selectedMarketplace.name} Listing Page`
                      : existingEbayListing
                        ? 'Update eBay Listing'
                        : ebayConnected
                          ? 'Create eBay Listing'
                          : 'Connect eBay First'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}