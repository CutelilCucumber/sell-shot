const STATUS_ICON = {
  DRAFT: '📝',
  PENDING: '⏳',
  ACTIVE: '🟢',
  SOLD: '💰',
  EXPIRED: '⏰',
  REMOVED: '🗑'
};

const STATUS_COLOR = {
  DRAFT: 'var(--amber)',
  PENDING: 'var(--amber)',
  ACTIVE: 'var(--green)',
  SOLD: 'var(--accent)',
  EXPIRED: 'var(--red)',
  REMOVED: 'var(--red)'
};

const STATUS_LABELS = {
  DRAFT: 'Draft', PENDING: 'Pending', ACTIVE: 'Active',
  SOLD: 'Sold', EXPIRED: 'Expired', REMOVED: 'Removed'
};

export default function StatusModal({ listings, newStatus, onConfirm, onClose }) {
  if (!listings?.length) return null;

  const count = listings.length;
  const isSingle = count === 1;
  const firstListing = listings[0].listing;

  const isSold = newStatus === 'SOLD';
  const isRemoved = newStatus === 'REMOVED';
  const needsAction = isSold || isRemoved;

  const statusColor = STATUS_COLOR[newStatus] || 'var(--accent)';
  const statusIcon = STATUS_ICON[newStatus] || '📋';
  const statusLabel = STATUS_LABELS[newStatus] || newStatus;

  // Use variables in JSX to satisfy ESLint
  const marketplaceName = firstListing.marketplace?.name;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()} style={{ '--modal-accent': statusColor }}>
        <div className="modal__header">
          <div className="modal__title-row">
            <span className="modal__status-icon" style={{ color: statusColor }}>{statusIcon}</span>
            <h2 className="modal__title">
              {isSingle ? 'Update listing status' : `Update ${count} listings`}
            </h2>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          <div className="status-modal__confirm">
            <p className="status-modal__confirm-text">
              {isSingle
                ? (
                  <>
                    Mark this <strong>{marketplaceName}</strong> listing as{' '}
                    <strong style={{ color: statusColor }}>{statusLabel}</strong>?
                  </>
                )
                : (
                  <>
                    Change status to{' '}
                    <strong style={{ color: statusColor }}>{statusLabel}</strong>{' '}
                    for <strong>{count} selected listings</strong>?
                  </>
                )}
            </p>

            {count > 5 && (
              <p className="status-modal__preview">
                <strong>Selected:</strong> {listings.slice(0, 3).map(({ listing, item }) => (
                  <span key={listing.id} className="status-modal__item-name">{item.title || listing.title}</span>
                )).join(', ')}{listings.length > 3 ? ` and ${listings.length - 3} more...` : ''}
              </p>
            )}

            {needsAction && (
              <div className="status-modal__notice">
                <span className="status-modal__notice-icon" style={{ color: statusColor }}>
                  {isSold ? '🎉' : '⚠'}
                </span>
                <p>
                  {isSold
                    ? 'Nice one! This listing will be marked as sold. If you want to delete the item entirely, you can do that from the item page.'
                    : 'This removes the listing from eBay. Make sure you also remove it on the platform if needed.'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn--primary"
            onClick={onConfirm}
            style={{ background: statusColor, borderColor: statusColor }}
          >
            Confirm {isSingle ? '' : `(${count})`}
          </button>
        </div>
      </div>
    </div>
  );
}