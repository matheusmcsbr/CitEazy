
import React, { useState, useEffect, useRef } from 'react';
import { User, AppView, QuizResult } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import History from './components/History';
import { LogOut, LayoutDashboard, History as HistoryIcon, Landmark } from 'lucide-react';

const STORAGE_KEY = 'citzeasy_data_v1';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const initialLoadDone = useRef<string | null>(null);

  useEffect(() => {
    if (user) {
      const storageKey = `${STORAGE_KEY}_${user.id}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setResults(parsed);
        } catch (e) {
          setResults([]);
        }
      } else {
        setResults([]);
      }
      
      initialLoadDone.current = user.id;
      setIsInitialized(true);
      setCurrentView(AppView.DASHBOARD);
    } else {
      setIsInitialized(false);
      initialLoadDone.current = null;
    }
  }, [user]);

  useEffect(() => {
    if (user && isInitialized && initialLoadDone.current === user.id) {
      const storageKey = `${STORAGE_KEY}_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(results));
    }
  }, [results, user, isInitialized]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(AppView.LOGIN);
    setResults([]);
    setIsInitialized(false);
  };

  const handleQuizComplete = (result: QuizResult) => {
    setResults(prev => [...prev, result]);
    setCurrentView(AppView.DASHBOARD);
  };

  if (!user || currentView === AppView.LOGIN) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentView(AppView.DASHBOARD)}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
              <Landmark size={20} strokeWidth={2} />
            </div>
            <span className="font-extrabold text-2xl text-slate-800 tracking-tight">CitzEasy</span>
          </div>
          
          <nav className="flex items-center gap-2 sm:gap-6">
             <button 
              onClick={() => setCurrentView(AppView.DASHBOARD)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all ${currentView === AppView.DASHBOARD ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <LayoutDashboard size={18} />
              <span className="hidden sm:inline">Study Center</span>
            </button>
            <button 
              onClick={() => setCurrentView(AppView.HISTORY)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all ${currentView === AppView.HISTORY ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <HistoryIcon size={18} />
              <span className="hidden sm:inline">Progress</span>
            </button>
            <div className="w-px h-8 bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-sm font-bold text-slate-800 leading-none mb-1">{user.name}</span>
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">Pro Member</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        {currentView === AppView.DASHBOARD && (
          <Dashboard 
            user={user} 
            results={results} 
            onStartQuiz={() => setCurrentView(AppView.QUIZ)}
            onViewHistory={() => setCurrentView(AppView.HISTORY)}
          />
        )}
        
        {currentView === AppView.QUIZ && (
          <Quiz 
            onComplete={handleQuizComplete} 
            onExit={() => setCurrentView(AppView.DASHBOARD)} 
          />
        )}

        {currentView === AppView.HISTORY && (
          <History 
            results={results} 
            onBack={() => setCurrentView(AppView.DASHBOARD)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
