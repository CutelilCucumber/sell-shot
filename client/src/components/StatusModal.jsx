import { Link } from 'react-router-dom';

const STATUS_LABEL = {
  DRAFT: 'Draft', PENDING: 'Pending', ACTIVE: 'Active',
  SOLD: 'Sold', EXPIRED: 'Expired', REMOVED: 'Removed'
};

export default function StatusModal({ listing, item, newStatus, onConfirm, onClose }) {
  if (!listing || !item) return null;

  const isSold = newStatus === 'SOLD';
  const isRemoved = newStatus === 'REMOVED';
  const needsAction = isRemoved || isSold;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Update listing status</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          <p className="modal__confirm-text">
            Mark this <strong>{listing.marketplace?.name}</strong> listing as{' '}
            <strong>{STATUS_LABEL[newStatus]}</strong>?
          </p>

          {needsAction && (
            <div className="status-modal__notice">
              <span className="status-modal__notice-icon">
                {isSold ? '🎉' : '⚠'}
              </span>
              <p>
                {isSold
                  ? 'Nice one! If you want to delete this item entirely, you can do that from the item page.'
                  : 'This is a manual listing — make sure you also remove it on the platform.'}
              </p>
              <Link
                to={`/items/${item.id}`}
                className="btn btn--ghost btn--sm"
                onClick={onClose}
              >
                Go to item page →
              </Link>
            </div>
          )}
        </div>

        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
