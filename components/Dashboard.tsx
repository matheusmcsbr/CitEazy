import React, { useMemo, useState } from 'react';
import { QuizResult, User } from '../types';
import { ResponsiveContainer, CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Play, History, Trophy, BrainCircuit, Zap, BookOpen, Flag, Scale, Share2, Check, Copy, Mail } from 'lucide-react';

interface DashboardProps {
  user: User;
  results: QuizResult[];
  onStartQuiz: () => void;
  onViewHistory: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, results, onStartQuiz, onViewHistory }) => {
  const [showCopied, setShowCopied] = useState(false);
  
  const stats = useMemo(() => {
    if (results.length === 0) return { totalQuizzes: 0, averageScore: 0, highestScore: 0, recentTrend: [], lifetimeCorrect: 0 };
    
    const totalQuizzes = results.length;
    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    const averageScore = Math.round(totalScore / totalQuizzes);
    const highestScore = Math.max(...results.map(r => r.score));
    const lifetimeCorrect = results.reduce((acc, curr) => acc + curr.correctCount, 0);
    
    const trendLimit = 10;
    const recentTrend = results.slice(-trendLimit).map((r, i) => ({
      name: `Test ${Math.max(1, results.length - (results.slice(-trendLimit).length - 1) + i)}`,
      score: r.score,
      date: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));

    return { totalQuizzes, averageScore, highestScore, recentTrend, lifetimeCorrect };
  }, [results]);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${appUrl}?email=aline.cos07@gmail.com`;

  const handleShareToAline = () => {
    const subject = encodeURIComponent("Access CitzEasy App");
    const body = encodeURIComponent(`Hi Aline,\n\nHere is the link to access the CitzEasy app: ${shareUrl}\n\nGood luck with your interview preparation!`);
    window.location.href = `mailto:aline.cos07@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hello, {user.name}</h1>
          <p className="text-slate-500 mt-2 font-medium">You've mastered <span className="text-blue-600 font-bold">{stats.lifetimeCorrect}</span> questions on your path to citizenship.</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={onStartQuiz}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-blue-100 transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            <Play size={20} fill="currentColor" />
            Start Full Exam
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-16 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Share2 size={24} />
             </div>
             <div>
               <h3 className="font-bold text-lg">Invite Aline to Study</h3>
               <p className="text-blue-100 text-sm">Send a direct access link to aline.cos07@gmail.com</p>
             </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <button 
                onClick={handleCopyLink}
                className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
             >
                {showCopied ? <Check size={16} /> : <Copy size={16} />}
                {showCopied ? 'Link Copied' : 'Copy Link'}
             </button>
             <button 
                onClick={handleShareToAline}
                className="flex-1 md:flex-none bg-white text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
             >
                <Mail size={16} />
                Send Email
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:border-blue-100 transition-colors">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Trophy size={28} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Pass Rate</p>
            <p className="text-3xl font-extrabold text-slate-800">{stats.averageScore}%</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:border-violet-100 transition-colors">
          <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl">
            <BrainCircuit size={28} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Exam Readiness</p>
            <p className="text-3xl font-extrabold text-slate-800">{stats.highestScore}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 cursor-pointer hover:bg-slate-50 transition-colors group" onClick={onViewHistory}>
          <div className="p-4 bg-slate-100 text-slate-500 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <History size={28} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Tests Completed</p>
            <p className="text-3xl font-extrabold text-slate-800">{stats.totalQuizzes}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <Scale size={24} className="text-blue-500" />
                Civics Mastery Progress
            </h3>
            <span className="text-xs font-bold text-slate-400 px-3 py-1.5 bg-slate-50 rounded-lg">Last {stats.recentTrend.length} Exams</span>
          </div>
          
          {stats.totalQuizzes > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.recentTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={15} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} dx={-15} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={4} dot={{ fill: '#2563eb', stroke: '#fff', strokeWidth: 3, r: 6 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
              <Zap size={48} className="mb-3 opacity-20" />
              <p className="font-semibold text-slate-500">No study data available.</p>
              <button onClick={onStartQuiz} className="text-blue-600 text-sm font-bold hover:underline mt-2">Take your first practice test</button>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Exam Tips</h3>
          <div className="space-y-4 flex-1">
            <div className="p-5 bg-blue-50/80 rounded-2xl border border-blue-100 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Flag size={18} className="text-blue-600" />
                <h4 className="font-bold text-blue-900 text-sm">Dynamic Answers</h4>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed font-medium">
                Questions about the President, Governor, or Speaker of the House change. CitzEasy keeps this data up-to-date daily.
              </p>
            </div>
            <div className="p-5 bg-rose-50/80 rounded-2xl border border-rose-100 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={18} className="text-rose-600" />
                <h4 className="font-bold text-rose-900 text-sm">The "Why" Matters</h4>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed font-medium">
                Don't just memorize. Read the explanations to understand the history. It helps during the actual interview.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;