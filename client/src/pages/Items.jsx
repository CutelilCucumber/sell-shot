import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Loader from '../components/Loader';

const STATUS_COLORS = {
  DRAFT: 'status--draft',
  PENDING: 'status--pending',
  ACTIVE: 'status--active',
  SOLD: 'status--sold',
  EXPIRED: 'status--expired',
  REMOVED: 'status--removed',
};

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getItems()
      .then(data => setItems(data.items))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
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

  if (loading) return <Loader/>;
  if (error) return <div className="page-status page-status--error">{error}</div>;

  return (
    <main className="items-page">
      <div className="items-header">
        <div>
          <h1 className="items-header__title">My Items</h1>
          <p className="items-header__sub">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/items/new" className="btn btn--primary">+ New item</Link>
      </div>

      {items.length === 0 ? (
        <div className="items-empty">
          <p className="items-empty__text">No items yet.</p>
          <Link to="/items/new" className="btn btn--primary">Add your first item</Link>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item, i) => (
            <ItemCard key={item.id} item={item} onDelete={handleDelete} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}

function ItemCard({ item, onDelete, index }) {
  const primary = item.images?.find(img => img.isPrimary) || item.images?.[0];
  const activeListings = item.listings?.filter(l => l.status === 'ACTIVE').length || 0;

  return (
    <article
      className="item-card"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link to={`/items/${item.id}`} className="item-card__image-wrap">
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
          <Link to={`/items/${item.id}`} className="item-card__title">
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
            <Link to={`/items/${item.id}/edit`} className="item-card__btn">Edit</Link>
            <button className="item-card__btn item-card__btn--danger" onClick={() => onDelete(item.id)}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
