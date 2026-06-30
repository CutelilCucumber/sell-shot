import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import StatusModal from '../components/StatusModal';

const STATUS_LABEL = {
  DRAFT: 'Draft', PENDING: 'Pending', ACTIVE: 'Active',
  SOLD: 'Sold', EXPIRED: 'Expired', REMOVED: 'Removed'
};

const STATUS_OPTIONS = Object.keys(STATUS_LABEL);

const FILTERS = ['All', 'Active', 'Draft', 'Sold', 'Flagged'];

export default function Listings({ onFlaggedCountChange }) {
  const [items, setItems] = useState([]);
  const [marketplaces, setMarketplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState({});

  // status modal state
  const [statusModal, setStatusModal] = useState(null); // { listing, item, newStatus }

  useEffect(() => {
    Promise.all([api.getItems(), api.getMarketplaces()])
      .then(([itemsData, mpData]) => {
        const withListings = itemsData.items.filter(i => i.listings?.length > 0);
        setItems(withListings);
        setMarketplaces(mpData.marketplaces);
        // notify parent of flagged count
        const flaggedCount = withListings.reduce((acc, item) =>
          acc + item.listings.filter(l => l.flagged).length, 0);
        onFlaggedCountChange?.(flaggedCount);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleExpanded(itemId) {
    setExpanded(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  }

  function getFilteredListings(listings) {
    if (filter === 'All') return listings;
    if (filter === 'Flagged') return listings.filter(l => l.flagged);
    return listings.filter(l => l.status === filter.toUpperCase());
  }

  function getFilteredItems() {
    return items.filter(item => {
      const filtered = getFilteredListings(item.listings || []);
      return filtered.length > 0;
    });
  }

  function handleListingCreated(itemId, newListing) {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const hasItem = item.listings.some(l => l.id === newListing.id);
      return {
        ...item,
        listings: hasItem
          ? item.listings.map(l => l.id === newListing.id ? newListing : l)
          : [...item.listings, newListing]
      };
    }));
  }

  function requestStatusChange(listing, item, newStatus) {
    setStatusModal({ listing, item, newStatus });
  }

  async function confirmStatusChange() {
    const { listing, item, newStatus } = statusModal;
    setStatusModal(null);
    try {
      const data = await api.updateListingStatus(item.id, listing.id, newStatus);
      setItems(prev => prev.map(i => {
        if (i.id !== item.id) return i;
        return {
          ...i,
          listings: i.listings.map(l => l.id === listing.id ? data.listing : l)
        };
      }));
    } catch (err) {
      console.error(err);
    }
  }

  const filteredItems = getFilteredItems();
  const totalFlagged = items.reduce((acc, item) =>
    acc + (item.listings || []).filter(l => l.flagged).length, 0);

  if (loading) return <div className="page-status">Loading listings...</div>;
  if (error) return <div className="page-status page-status--error">{error}</div>;

  return (
    <main className="listings-page">
      <div className="listings-header">
        <div>
          <h1 className="listings-header__title">Listings</h1>
          <p className="listings-header__sub">
            {items.length} item{items.length !== 1 ? 's' : ''} across{' '}
            {marketplaces.length} marketplace{marketplaces.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="listings-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`listings-filter ${filter === f ? 'listings-filter--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
            {f === 'Flagged' && totalFlagged > 0 && (
              <span className="listings-filter__badge">{totalFlagged}</span>
            )}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="listings-empty">
          <p>No listings match this filter.</p>
          <Link to="/items" className="btn btn--ghost">Go to items</Link>
        </div>
      ) : (
        <div className="listings-list">
          {filteredItems.map(item => {
            const visibleListings = getFilteredListings(item.listings || []);
            const primaryImage = item.images?.find(i => i.isPrimary) || item.images?.[0];
            const isExpanded = expanded[item.id] !== false; // default open
            const flaggedCount = visibleListings.filter(l => l.flagged).length;

            return (
              <div className="listing-group" key={item.id}>
                <button
                  className="listing-group__header"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="listing-group__left">
                    <div className="listing-group__thumb">
                      {primaryImage
                        ? <img src={primaryImage.url} alt="" />
                        : <span className="listing-group__thumb-placeholder">◈</span>
                      }
                    </div>
                    <div className="listing-group__info">
                      <span className="listing-group__title">
                        {item.title || 'Untitled item'}
                      </span>
                      <span className="listing-group__meta">
                        {visibleListings.length} listing{visibleListings.length !== 1 ? 's' : ''}
                        {item.estimatedPrice && ` · $${Number(item.estimatedPrice).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                  <div className="listing-group__right">
                    {flaggedCount > 0 && (
                      <span className="flag-badge">{flaggedCount} update needed</span>
                    )}
                    <span className="listing-group__chevron">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="listing-group__body">
                    {visibleListings.map(listing => {
                      const isApi = listing.marketplace?.type === 'API';
                      return (
                        <div
                          key={listing.id}
                          className={`listing-row ${listing.flagged ? 'listing-row--flagged' : ''}`}
                        >
                          <div className="listing-row__left">
                            <span className={`listing-status listing-status--${listing.status.toLowerCase()}`}>
                              {STATUS_LABEL[listing.status]}
                            </span>
                            <span className="listing-row__mp">
                              {listing.marketplace?.name}
                              {isApi && <span className="listing-row__api-tag">API</span>}
                            </span>
                            {listing.externalUrl && (
                              <a
                                href={listing.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="listing-row__link"
                              >
                                View ↗
                              </a>
                            )}
                            {listing.flagged && (
                              <span className="listing-row__flag">Update needed</span>
                            )}
                          </div>

                          <div className="listing-row__right">
                            {listing.listingPrice && (
                              <span className="listing-row__price">
                                ${Number(listing.listingPrice).toFixed(2)}
                              </span>
                            )}

                            <select
                              className="listing-row__status-select"
                              value={listing.status}
                              onChange={e => requestStatusChange(listing, item, e.target.value)}
                            >
                              {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}

                    <div className="listing-group__add">
                      <span className="listing-group__add-label">Add listing:</span>
                      {marketplaces.map(mp => {
                        const alreadyListed = item.listings.some(
                          l => l.marketplaceId === mp.id && l.status !== 'REMOVED'
                        );
                        if (alreadyListed) return null;
                        return (
                          <button
                            key={mp.id}
                            className="listing-group__add-btn"
                            // onClick={() => setTemplateModal({ item, marketplace: mp })}
                          >
                            + {mp.name}
                          </button>
                        );
                      })}
                      <Link
                        to={`/items/${item.id}`}
                        className="listing-group__add-btn listing-group__add-btn--manage"
                      >
                        Manage item →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {statusModal && (
        <StatusModal
          listing={statusModal.listing}
          item={statusModal.item}
          newStatus={statusModal.newStatus}
          onConfirm={confirmStatusChange}
          onClose={() => setStatusModal(null)}
        />
      )}
    </main>
  );
}
