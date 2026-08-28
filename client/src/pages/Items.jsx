import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Loader from '../components/Loader';

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    api.getItems()
      .then(data => setItems(data.items))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this item and all its listings?')) return;
    try {
      await api.deleteItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBulkDelete() {
    const count = selectedIds.size;
    if (!confirm(`Delete ${count} item${count !== 1 ? 's' : ''} and all their listings?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.deleteItem(id)));
      setItems(prev => prev.filter(i => !selectedIds.has(i.id)));
      clearSelection();
    } catch (err) {
      console.error(err);
    }
  }

  function handleBulkList() {
    // placeholder for eBay-only flow
    clearSelection();
  }

  if (loading) return <Loader/>;
  if (error) return <div className="page-status page-status--error">{error}</div>;

  const hasSelection = selectedIds.size > 0;

  return (
    <main className="items-page">
      <div className="items-header">
        <div>
          <h1 className="items-header__title">My Items</h1>
          <p className="items-header__sub">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="items-header__actions">
          {hasSelection && (
            <div className="items-header__bulk">
              <button className="btn btn--ghost btn--sm" onClick={handleBulkList}>List Selected</button>
              <button className="btn btn--danger btn--sm" onClick={handleBulkDelete}>
                Delete Selected ({selectedIds.size})
              </button>
              <button className="btn btn--ghost btn--sm" onClick={clearSelection}>Clear</button>
            </div>
          )}
          <Link to="/items/new" className="btn btn--primary">+ New item</Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="items-empty">
          <p className="items-empty__text">No items yet.</p>
          <Link to="/items/new" className="btn btn--primary">Add your first item</Link>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item, i) => (
            <ItemCard
              key={item.id}
              item={item}
              index={i}
              selected={selectedIds.has(item.id)}
              onToggle={toggleSelect}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function ItemCard({ item, index, selected, onToggle, onDelete }) {
  const primary = item.images?.find(img => img.isPrimary) || item.images?.[0];
  const activeListings = item.listings?.filter(l => l.status === 'ACTIVE').length || 0;

  function handleCardClick(e) {
    if (e.target.closest('a, button')) return;
    onToggle(item.id);
  }

  return (
    <article
      className={`item-card ${selected ? 'item-card--selected' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={handleCardClick}
    >
      <div className={`item-card__select ${selected ? 'item-card__select--checked' : ''}`} onClick={e => { e.stopPropagation(); onToggle(item.id); }} />
      <Link to={`/items/${item.id}`} className="item-card__image-wrap" onClick={e => e.stopPropagation()}>
        {primary ? (
          <img className="item-card__image" src={primary.url} alt={item.title || 'Item'} />
        ) : (
          <div className="item-card__placeholder">
            <span className="item-card__placeholder-icon">◈</span>
          </div>
        )}
        {item.aiIdentified && (
          <span className="item-card__ai-badge">AI</span>
        )}
      </Link>

      <div className="item-card__body">
        <div className="item-card__top">
          <Link to={`/items/${item.id}`} className="item-card__title" onClick={e => e.stopPropagation()}>
            {item.title || <span className="item-card__untitled">Untitled item</span>}
          </Link>
          {item.estimatedPrice && (
            <span className="item-card__price">${Number(item.estimatedPrice).toFixed(2)}</span>
          )}
        </div>

        <div className="item-card__meta">
          {item.brand && <span className="item-card__tag">{item.brand}</span>}
          {item.category && <span className="item-card__tag">{item.category}</span>}
          {item.condition && <span className="item-card__tag">{item.condition}</span>}
        </div>

        <div className="item-card__footer">
          <span className="item-card__listings">
            {activeListings > 0
              ? `${activeListings} active listing${activeListings !== 1 ? 's' : ''}`
              : 'Not listed'}
          </span>
          <div className="item-card__actions">
            <Link to={`/items/${item.id}/edit`} className="item-card__btn" onClick={e => e.stopPropagation()}>Edit</Link>
            <button className="item-card__btn item-card__btn--danger" onClick={e => { e.stopPropagation(); onDelete(item.id); }}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
