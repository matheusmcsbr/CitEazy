import React from 'react';
import { QuizResult } from '../types';
import { Calendar, Clock, Target, ArrowLeft } from 'lucide-react';

interface HistoryProps {
  results: QuizResult[];
  onBack: () => void;
}

const History: React.FC<HistoryProps> = ({ results, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <ArrowLeft className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Quiz History</h1>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-slate-400 w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No History Yet</h3>
          <p className="text-slate-500">Take your first quiz to see your progress here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...results].reverse().map((result) => (
            <div key={result.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    result.score >= 80 ? 'bg-green-100 text-green-700' :
                    result.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {result.score >= 60 ? 'PASSED' : 'FAILED'}
                  </span>
                  <span className="text-slate-400 text-sm flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(result.date).toLocaleDateString()} at {new Date(result.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="flex gap-6 text-sm text-slate-600">
                   <div className="flex items-center gap-1.5">
                      <Target size={16} className="text-blue-500" />
                      Score: <span className="font-semibold text-slate-900">{result.score}%</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-orange-500" />
                      Time: <span className="font-semibold text-slate-900">{result.timeSpentSeconds}s</span>
                   </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
                <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase font-semibold">Correct</div>
                    <div className="text-lg font-bold text-slate-800">{result.correctCount} <span className="text-slate-400 text-sm font-normal">/ {result.totalQuestions}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
