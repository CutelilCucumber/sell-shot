import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Loader from '../components/Loader';
import StatusModal from '../components/StatusModal';

const STATUS_LABEL = {
  DRAFT: 'Draft', PENDING: 'Pending', ACTIVE: 'Active',
  SOLD: 'Sold', EXPIRED: 'Expired', REMOVED: 'Removed'
};

const STATUS_OPTIONS = Object.keys(STATUS_LABEL);

const FILTERS = ['All', 'Active', 'Draft', 'Sold', 'Flagged'];

export default function Listings({ onFlaggedCountChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  // batch selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // status modal state
  const [statusModal, setStatusModal] = useState(null);

  useEffect(() => {
    api.getItems()
      .then(itemsData => {
        const withListings = itemsData.items.filter(i => i.listings?.length > 0);
        setItems(withListings);
        const flaggedCount = withListings.reduce((acc, item) =>
          acc + item.listings.filter(l => l.flagged).length, 0);
        onFlaggedCountChange?.(flaggedCount);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  function requestStatusChange(listing, item, newStatus) {
    if (selectedIds.size > 0) {
      const selectedListings = [];
      items.forEach(it => {
        (it.listings || []).forEach(l => {
          if (selectedIds.has(l.id)) selectedListings.push({ listing: l, item: it });
        });
      });
      setStatusModal({ listings: selectedListings, newStatus });
    } else {
      setStatusModal({ listings: [{ listing, item }], newStatus });
    }
  }

  async function confirmStatusChange() {
    if (!statusModal) return;
    const { listings: selectedListings, newStatus } = statusModal;
    setStatusModal(null);
    try {
      await Promise.all(selectedListings.map(({ listing, item }) =>
        api.updateListingStatus(item.id, listing.id, newStatus)
      ));
      setItems(prev => prev.map(item => ({
        ...item,
        listings: item.listings.map(l => {
          const updated = selectedListings.find(({ listing }) => listing.id === l.id);
          return updated ? { ...l, status: newStatus } : l;
        })
      })));
      clearSelection();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update status');
    }
  }

  const filteredItems = getFilteredItems();
  const totalFlagged = items.reduce((acc, item) =>
    acc + (item.listings || []).filter(l => l.flagged).length, 0);
  const hasSelection = selectedIds.size > 0;

  // Get all listing IDs currently visible (matching filter)
  const allFilteredListingIds = filteredItems.flatMap(item =>
    getFilteredListings(item.listings || []).map(l => l.id)
  );
  const filteredCount = allFilteredListingIds.length;
  const allFilteredSelected = filteredCount > 0 && allFilteredListingIds.every(id => selectedIds.has(id));

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered
      setSelectedIds(prev => {
        const next = new Set(prev);
        allFilteredListingIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      // Select all filtered
      setSelectedIds(prev => {
        const next = new Set(prev);
        allFilteredListingIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="page-status page-status--error">{error}</div>;

  return (
    <main className="listings-page">
      <div className="listings-header">
        <div>
          <h1 className="listings-header__title">eBay Listings</h1>
          <p className="listings-header__sub">
            {items.length} item{items.length !== 1 ? 's' : ''} with {totalFlagged} alert{totalFlagged !== 1 ? 's' : ''}.
          </p>
        </div>
        <div className="listings-header__actions">
          {hasSelection && (
            <div className="listings-header__bulk">
              <span className="listings-header__bulk-count">
                {selectedIds.size} listing{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
              <button className="btn btn--ghost btn--sm" onClick={clearSelection}>Clear</button>
            </div>
          )}
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

      {hasSelection && (
        <div className="listings-bulk-bar">
          <label className="bulk-select-all">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={handleSelectAll}
              aria-label="Select all filtered listings"
            />
            Select all ({filteredCount})
          </label>
          <span className="bulk-count">{selectedIds.size} selected</span>
          <div className="bulk-actions">
            <select
              className="bulk-status-select"
              defaultValue=""
              onChange={e => {
                const newStatus = e.target.value;
                if (!newStatus) return;
                // TODO: connect to API - bulk update status for selected listings
                // const selectedListings = Array.from(selectedIds).map(id => {
                //   const item = items.find(i => i.listings?.some(l => l.id === id));
                //   return item ? { listingId: id, itemId: item.id } : null;
                // }).filter(Boolean);
                // await Promise.all(selectedListings.map(({ listingId, itemId }) =>
                //   api.updateListingStatus(itemId, listingId, newStatus)
                // ));
                e.target.value = '';
              }}
            >
              <option value="" disabled>Change status...</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <button
              className="btn btn--danger btn--sm"
              onClick={() => {
                // TODO: remove from API - bulk delete selected listings
                // const selectedListings = Array.from(selectedIds).map(id => {
                //   const item = items.find(i => i.listings?.some(l => l.id === id));
                //   return item ? { listingId: id, itemId: item.id } : null;
                // }).filter(Boolean);
                // await Promise.all(selectedListings.map(({ listingId, itemId }) =>
                //   api.deleteListing(itemId, listingId)
                // ));
              }}
            >
              Delete ({selectedIds.size})
            </button>
            <button className="btn btn--ghost btn--sm" onClick={clearSelection}>Clear</button>
          </div>
        </div>
      )}

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
            const flaggedCount = visibleListings.filter(l => l.flagged).length;

            return (
              <div className="listing-group" key={item.id}>
                <div className="listing-group__header">
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
                    </div>
                  </div>
                  <div className="listing-group__right">
                    {flaggedCount > 0 && (
                      <span className="flag-badge">{flaggedCount} update needed</span>
                    )}
                    <Link
                      to={`/items/${item.id}`}
                      className="listing-group__add-btn listing-group__add-btn--manage"
                    >
                      Update Listing →
                    </Link>
                  </div>
                </div>

                <div className="listing-group__body">
                  {visibleListings.map(listing => {
                    const isApi = listing.marketplace?.type === 'API';
                    const isSelected = selectedIds.has(listing.id);
                    return (
                      <div
                        key={listing.id}
                        className={`listing-row ${listing.flagged ? 'listing-row--flagged' : ''} ${isSelected ? 'listing-row--selected' : ''}`}
                      >
                        <div className="listing-row__left">
                          <div className="listing-row__select">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => { e.stopPropagation(); toggleSelect(listing.id); }}
                              aria-label="Select listing"
                            />
                            
                          </div>

                          <select
                            className="listing-row__status-select"
                            value={listing.status}
                            onChange={e => { e.stopPropagation(); requestStatusChange(listing, item, e.target.value); }}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                            ))}
                          </select>
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
                            <span className="listing-row__flag">Alert</span>
                          )}
                        </div>

                        <div className="listing-row__right">
                          {listing.listingPrice && (
                            <span className="listing-row__price">
                              ${Number(listing.listingPrice).toFixed(2)}
                            </span>
                          )}
                          <span className={`listing-status listing-status--${listing.status.toLowerCase()}`}>
                            {STATUS_LABEL[listing.status]}
                          </span>
                          <span className="listing-row__mp">
                            {listing.marketplace?.name}
                            {isApi && <span className="listing-row__api-tag">Connected</span>}
                          </span>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {statusModal && (
        <StatusModal
          listings={statusModal.listings}
          newStatus={statusModal.newStatus}
          onConfirm={confirmStatusChange}
          onClose={() => setStatusModal(null)}
        />
      )}
    </main>
  );
}