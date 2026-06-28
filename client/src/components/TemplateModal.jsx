import { useState, useEffect } from 'react';
import { api } from '../api';
import { generateTemplate } from '../utils/generateTemplate';

export default function TemplateModal({ item, marketplace, onClose, onListingCreated }) {
  const [listingUrl, setListingUrl] = useState('');
  const [price, setPrice] = useState(item?.estimatedPrice ? String(item.estimatedPrice) : '');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('template'); // 'template' | 'confirm'

  const template = generateTemplate(item, marketplace, price);

  async function handleCopy() {
    await navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenPlatform() {
    if (marketplace.listingUrl) {
      window.open(marketplace.listingUrl, '_blank');
    }
    setStep('confirm');
  }

  async function handleSaveListing() {
    if (!listingUrl.trim()) {
      setError('Please paste the URL of your new listing');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const data = await api.createListing(item.id, {
        marketplaceId: marketplace.id,
        title: item.title,
        description: item.description,
        listingPrice: price ? parseFloat(price) : null,
        externalUrl: listingUrl.trim(),
        status: 'ACTIVE',
      });
      onListingCreated?.(data.listing);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!item || !marketplace) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__header-left">
            <h2 className="modal__title">List on {marketplace.name}</h2>
            <span className="modal__sub">{item.title || 'Untitled item'}</span>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        {step === 'template' && (
          <>
            <div className="modal__body">
              <div className="template-price">
                <label className="form-label">Listing price (USD)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="template-box">
                <div className="template-box__header">
                  <span className="template-box__label">Listing template</span>
                  <button
                    className={`template-box__copy ${copied ? 'template-box__copy--done' : ''}`}
                    onClick={handleCopy}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="template-box__content">{template}</pre>
              </div>

              {error && <p className="modal__error">{error}</p>}
            </div>

            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn--primary" onClick={handleOpenPlatform}>
                Open {marketplace.name} →
              </button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="modal__body">
              <p className="modal__confirm-text">
                Paste the URL of your new {marketplace.name} listing to track it here.
              </p>
              <div className="form-group">
                <label className="form-label">Listing URL</label>
                <input
                  className="form-input"
                  type="url"
                  value={listingUrl}
                  onChange={e => setListingUrl(e.target.value)}
                  placeholder={`https://www.${marketplace.slug}.com/...`}
                  autoFocus
                />
              </div>
              {error && <p className="modal__error">{error}</p>}
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={() => setStep('template')}>← Back</button>
              <button className="btn btn--ghost" onClick={onClose}>Skip for now</button>
              <button className="btn btn--primary" onClick={handleSaveListing} disabled={saving}>
                {saving ? 'Saving...' : 'Save listing'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
