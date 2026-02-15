import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Mail, Lock, Landmark, ArrowRight, AlertCircle, User as UserIcon } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const USERS_DB_KEY = 'citzeasy_users_db';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for email query param to pre-fill
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // Pre-configured users
    const defaultUsers = [
      {
        name: 'Matheus',
        email: 'matheusbr@gmail.com',
        password: 'mmcs23121980BR!@',
        seed: 'Matheus'
      },
      {
        name: 'Aline',
        email: 'aline.cos07@gmail.com',
        password: 'cris1980',
        seed: 'Aline'
      }
    ];

    const users = getStoredUsers();
    let updated = false;

    defaultUsers.forEach(defaultUser => {
      const userIndex = users.findIndex(u => u.email === defaultUser.email);
      
      if (userIndex !== -1) {
        if (users[userIndex].password !== defaultUser.password) {
          users[userIndex].password = defaultUser.password;
          updated = true;
        }
      } else {
        const newUser = {
          id: crypto.randomUUID(),
          name: defaultUser.name,
          email: defaultUser.email,
          password: defaultUser.password,
          photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${defaultUser.seed}`
        };
        users.push(newUser);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }
  }, []);

  const getStoredUsers = (): any[] => {
    const data = localStorage.getItem(USERS_DB_KEY);
    return data ? JSON.parse(data) : [];
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const users = getStoredUsers();

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (users.find(u => u.email === email)) {
        setError("Account already exists.");
        return;
      }

      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || email}`
      };

      localStorage.setItem(USERS_DB_KEY, JSON.stringify([...users, newUser]));
      const { password: _, ...userSafe } = newUser;
      onLogin(userSafe as User);
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        const { password: _, ...userSafe } = user;
        onLogin(userSafe as User);
      } else {
        setError("Invalid email or password.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-b-[40%] shadow-lg z-0 transform -translate-y-20"></div>

      <div className="bg-white/90 backdrop-blur-xl max-w-md w-full p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200 rotate-3 transition-transform hover:rotate-6">
            <Landmark className="text-white w-10 h-10" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">CitzEasy</h1>
          <p className="text-slate-500 font-medium mt-2">
            {isSignUp ? 'Start your journey to citizenship' : 'Welcome back, future citizen'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-600 text-sm animate-shake">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {isSignUp && (
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Legal Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  required
                  type="text"
                  placeholder="Jane Doe"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="group">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                required
                type="email"
                placeholder="hello@citzeasy.com"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl shadow-blue-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
          >
            {isSignUp ? 'Create Free Account' : 'Sign In'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-10 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;