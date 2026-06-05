import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate('/items'); }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(email, password);
      login(data.token, data.user);
      navigate('/items');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">◈</div>
        <h1 className="auth-card__title">Welcome back</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__group">
            <label className="auth-form__label">Email</label>
            <input className="auth-form__input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="auth-form__group">
            <label className="auth-form__label">Password</label>
            <input className="auth-form__input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="auth-form__error">{error}</p>}
          <button className="auth-form__btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="auth-card__switch">No account? <Link to="/register">Register</Link></p>
      </div>
    </main>
  );
}

export function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setError(null);
    setLoading(true);
    try {
      const data = await api.register(form.username, form.email, form.password);
      login(data.token, data.user);
      navigate('/items');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">◈</div>
        <h1 className="auth-card__title">Create account</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          {['username', 'email'].map(field => (
            <div className="auth-form__group" key={field}>
              <label className="auth-form__label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input className="auth-form__input" name={field} type={field === 'email' ? 'email' : 'text'} value={form[field]} onChange={handleChange} required />
            </div>
          ))}
          <div className="auth-form__group">
            <label className="auth-form__label">Password</label>
            <input className="auth-form__input" type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
          </div>
          <div className="auth-form__group">
            <label className="auth-form__label">Confirm password</label>
            <input className="auth-form__input" type="password" name="confirm" value={form.confirm} onChange={handleChange} required />
          </div>
          {error && <p className="auth-form__error">{error}</p>}
          <button className="auth-form__btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-card__switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </main>
  );
}
