import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <main className="landing">
      <div className="landing__noise" />
      <section className="landing__hero">
        <div className="landing__eyebrow">AI-powered resale</div>
        <h1 className="landing__title">
          Snap it.<br />
          Price it.<br />
          <em>Sell it.</em>
        </h1>
        <p className="landing__sub">
          Photograph your clothing and items. Offload identifies them,
          suggests a price, and lists them across marketplaces — in seconds.
        </p>
        <div className="landing__actions">
          {user ? (
            <Link to="/items" className="landing__btn landing__btn--primary">Go to my items →</Link>
          ) : (
            <>
              <Link to="/register" className="landing__btn landing__btn--primary">Start selling free</Link>
              <Link to="/login" className="landing__btn landing__btn--ghost">Sign in</Link>
            </>
          )}
        </div>
      </section>

      <section className="landing__steps">
        {[
          { n: '01', title: 'Photograph', body: 'Take a photo of anything you want to sell. Multiple angles welcome.' },
          { n: '02', title: 'Identify', body: 'AI identifies the item, suggests a title, description, and price.' },
          { n: '03', title: 'List', body: 'Push to Facebook Marketplace, Depop, eBay — all at once.' },
        ].map(step => (
          <div className="landing__step" key={step.n}>
            <span className="landing__step-n">{step.n}</span>
            <h3 className="landing__step-title">{step.title}</h3>
            <p className="landing__step-body">{step.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
