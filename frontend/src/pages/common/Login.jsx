import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, BookOpen, ClipboardCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@lms.local');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.userMessage || 'Connexion impossible. Vérifiez vos identifiants et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__shell">
        <aside className="login-page__visual" aria-hidden="true">
          <div className="login-page__visual-inner">
            <div>
              <div className="login-page__brand">
                <div className="login-page__brand-mark">
                  <GraduationCap size={22} />
                </div>
                <div className="login-page__brand-text">
                  <strong>MASTERCLASS LMS</strong>
                  <span>Plateforme de formation en ligne</span>
                </div>
              </div>

              <h2>Votre formation, au même endroit.</h2>
              <p className="login-page__visual-lead">
                Retrouvez vos cours, passez vos évaluations et consultez vos notes
                depuis votre espace personnel.
              </p>

              <ul className="login-page__features">
                <li>
                  <span className="login-page__feature-icon">
                    <BookOpen size={16} />
                  </span>
                  Cours et ressources pédagogiques
                </li>
                <li>
                  <span className="login-page__feature-icon">
                    <ClipboardCheck size={16} />
                  </span>
                  Quiz et évaluations en ligne
                </li>
                <li>
                  <span className="login-page__feature-icon">
                    <TrendingUp size={16} />
                  </span>
                  Notes et progression
                </li>
              </ul>
            </div>
            <p className="login-page__visual-footer">© 2026 MASTERCLASS LMS. Tous droits réservés.</p>
          </div>
        </aside>

        <div className="login-page__panel">
          <div className="login-page__card-wrap">
            <div className="login-page__mobile-brand">
              <div className="login-page__logo">
                <GraduationCap size={32} />
              </div>
              <h1>MASTERCLASS LMS</h1>
              <p>Plateforme de formation en ligne</p>
            </div>

            <div className="login-page__card">
              <h2>Connexion</h2>
              <p className="login-page__card-lead">
                Saisissez vos identifiants pour accéder à votre espace.
              </p>

              {error && (
                <div className="mb-4">
                  <Alert type="error" message={error} onClose={() => setError('')} />
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <Input
                  label="Adresse e-mail"
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  required
                />

                <Input
                  label="Mot de passe"
                  type="password"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <Button type="submit" loading={loading} className="w-full" size="lg">
                  Se connecter
                </Button>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}