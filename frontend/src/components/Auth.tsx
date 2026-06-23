import { useState } from 'react';

interface AuthProps {
  onLogin: (token: string, email: string) => void;
  apiBaseUrl: string;
}

export default function Auth({ onLogin, apiBaseUrl }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch(`${apiBaseUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'Registration failed');
        }

        setSuccess('Registration successful! Please log in.');
        setMode('login');
        setPassword('');
      } else {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const res = await fetch(`${apiBaseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'Incorrect email or password');
        }

        onLogin(data.access_token, email);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleModeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="paper-texture min-h-screen flex flex-col justify-between text-on-background selection:bg-secondary-fixed w-full">
      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-0 py-12">
        <div className="w-full max-w-[480px] bg-surface-container-lowest folio-border relative overflow-hidden flex flex-col items-center p-12 md:p-16">
          {/* Archival Accent Rail */}
          <div className="accent-rail"></div>

          {/* Header / Branding */}
          <header className="text-center mb-12">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full border-dashed border border-secondary text-secondary">
              <span className="material-symbols-outlined text-4xl">account_balance</span>
            </div>
            <h1 className="font-display-lg text-[48px] text-primary tracking-tight">Talikapatra</h1>
            <p className="font-label-caps text-label-caps text-secondary mt-2">
              {mode === 'login' ? 'Central Archival System' : 'Archival Registry'}
            </p>
          </header>

          {/* Alert messages */}
          {error && (
            <div className="w-full bg-red-50 border border-error/20 text-error p-4 mb-6 text-sm flex items-start gap-2 rounded-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span className="font-body-md">{error}</span>
            </div>
          )}

          {success && (
            <div className="w-full bg-green-50 border border-green-200 text-green-800 p-4 mb-6 text-sm flex items-start gap-2 rounded-sm">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="font-body-md">{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-10" id="access-form">
            <div className="space-y-6">
              {/* Credentials / Email */}
              <div className="relative">
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest" htmlFor="credentials">
                  {mode === 'login' ? 'Researcher Credentials' : 'New Registry Credentials'}
                </label>
                <div className="flex items-end">
                  <span className="material-symbols-outlined text-on-surface-variant mr-3 mb-2">fingerprint</span>
                  <input
                    type="email"
                    id="credentials"
                    name="credentials"
                    className="w-full notebook-input font-body-md text-body-md text-primary"
                    placeholder={mode === 'login' ? 'Username or Registry ID (Email)' : 'Enter Desired Email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Cipher / Password */}
              <div className="relative">
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest" htmlFor="cipher">
                  {mode === 'login' ? 'Access Cipher' : 'Select Access Cipher'}
                </label>
                <div className="flex items-end">
                  <span className="material-symbols-outlined text-on-surface-variant mr-3 mb-2">key</span>
                  <input
                    type="password"
                    id="cipher"
                    name="cipher"
                    className="w-full notebook-input font-body-md text-body-md text-primary"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Form Action & Toggle */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-primary text-surface-container-lowest font-label-caps text-label-caps py-4 transition-all duration-300 hover:bg-secondary active:scale-[0.98] flex items-center justify-center gap-2 group"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                    <span>Validating...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Grant Access' : 'Create Registry'}</span>
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                      {mode === 'login' ? 'lock_open' : 'how_to_reg'}
                    </span>
                  </>
                )}
              </button>

              <div className="mt-8 text-center">
                <a
                  href="#"
                  onClick={handleModeToggle}
                  className="font-body-md text-body-md text-secondary hover:text-primary transition-colors duration-200 border-b border-transparent hover:border-primary"
                >
                  {mode === 'login' ? 'Request Archival Access' : 'Already registered? Grant Access'}
                </a>
              </div>
            </div>
          </form>

          {/* Double Rule Divider */}
          <div className="w-full double-rule opacity-50"></div>

          {/* Institutional Context */}
          <div className="w-full flex items-center justify-between text-on-surface-variant opacity-60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">shield</span>
              <span className="font-caption text-caption">Encrypted Link</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">history_edu</span>
              <span className="font-caption text-caption">Session ID: 4192-A</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t-2 border-double border-surface-variant py-12 px-margin-desktop max-w-container-max mx-auto flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-6 mb-2">
          <a className="font-caption text-caption text-on-surface-variant hover:text-secondary transition-colors" href="#">Institutional Login</a>
          <span className="text-surface-dim">•</span>
          <a className="font-caption text-caption text-on-surface-variant hover:text-secondary transition-colors" href="#">Terms of Access</a>
          <span className="text-surface-dim">•</span>
          <a className="font-caption text-caption text-on-surface-variant hover:text-secondary transition-colors" href="#">Privacy Policy</a>
        </div>
        <div className="font-label-caps text-label-caps text-secondary opacity-50">
          © 1894-2024 Talikapatra Archival Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
