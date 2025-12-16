import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { mockGoalProgressData } from '../../mockdata/makegoalprogress';

const GoalDashboard: React.FC = () => {
  const data = mockGoalProgressData;

  // Calculate burndown chart data
  const burndownData = useMemo(() => {
    const totalDays = data.dailyLogs.length;
    const dailyIdealBurn = data.tasksTotal / totalDays;
    
    let actualRemaining = data.tasksTotal;
    
    return data.dailyLogs.map((log, index) => {
      const idealRemaining = data.tasksTotal - (dailyIdealBurn * (index + 1));
      actualRemaining -= log.tasksCompleted;
      
      return {
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ideal: Math.max(0, idealRemaining),
        actual: Math.max(0, actualRemaining),
        isAhead: actualRemaining <= idealRemaining
      };
    });
  }, [data]);

  // Calculate heatmap data
  const heatmapData = useMemo(() => {
    return data.dailyLogs.map(log => ({
      date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hoursFocused: log.hoursFocused,
      tasksCompleted: log.tasksCompleted,
      energyLevel: log.energyLevel
    }));
  }, [data]);

  // Calculate energy analytics
  const energyAnalytics = useMemo(() => {
    const timeBlocks: { [key: string]: { tasks: number; count: number } } = {
      Morning: { tasks: 0, count: 0 },
      Afternoon: { tasks: 0, count: 0 },
      Evening: { tasks: 0, count: 0 }
    };

    data.dailyLogs.forEach(log => {
      if (log.tasksCompleted > 0) {
        timeBlocks[log.timeOfDay].tasks += log.tasksCompleted;
        timeBlocks[log.timeOfDay].count += 1;
      }
    });

    const analytics = Object.entries(timeBlocks).map(([timeOfDay, stats]) => ({
      timeOfDay,
      avgProductivity: stats.count > 0 ? stats.tasks / stats.count : 0
    }));

    // Find peak productivity
    const peak = analytics.reduce((max, curr) => 
      curr.avgProductivity > max.avgProductivity ? curr : max
    );

    const total = analytics.reduce((sum, curr) => sum + curr.avgProductivity, 0);
    const peakPercentage = total > 0 ? Math.round((peak.avgProductivity / total) * 100) : 0;

    return { analytics, peak, peakPercentage };
  }, [data]);

  // Get today's date for comparison
  const today = new Date('2025-12-15');

  // Filter tasks for today's focus
  const todaysTasks = useMemo(() => {
    return data.tasks.map(task => ({
      ...task,
      isOverdue: new Date(task.dueDate) < today && task.status === 'incomplete'
    }));
  }, [data.tasks, today]);

  // Custom tooltip for burndown chart
  const BurndownTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-xl">
          <p className="text-slate-300 text-sm font-semibold mb-2">{payload[0].payload.date}</p>
          <p className="text-gray-400 text-xs">
            Ideal: <span className="font-semibold text-gray-300">{Math.round(payload[0].value)} tasks</span>
          </p>
          <p className="text-xs" style={{ color: payload[1].payload.isAhead ? '#10B981' : '#F97316' }}>
            Actual: <span className="font-semibold">{Math.round(payload[1].value)} tasks</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for heatmap hover
  const HeatmapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-xl">
          <p className="text-slate-300 text-sm font-semibold mb-2">{payload[0].payload.date}</p>
          <p className="text-emerald-400 text-xs">
            Hours: <span className="font-semibold">{payload[0].value}h</span>
          </p>
          <p className="text-blue-400 text-xs">
            Tasks: <span className="font-semibold">{payload[0].payload.tasksCompleted}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{data.goalTitle}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span>📅 {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}</span>
            <span>⚡ {data.intensity}</span>
            <span>🎯 Priority: {data.priority}</span>
            <span className="font-semibold text-emerald-400">{data.tasksCompleted}/{data.tasksTotal} tasks completed</span>
          </div>
        </div>

        {/* Compassionate Burndown Chart */}
        <div className="bg-[#1e293b] rounded-xl p-6 mb-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">📊 Progress Tracking</h2>
          <p className="text-slate-400 text-sm mb-6">Your journey is unique - here's how you're moving forward</p>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={burndownData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                label={{ value: 'Remaining Tasks', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip content={<BurndownTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="ideal" 
                stroke="#64748b" 
                strokeDasharray="5 5" 
                name="Ideal Pace"
                dot={false}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#10B981"
                name="Your Progress"
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-300 text-sm">
              {burndownData[burndownData.length - 1].isAhead ? (
                <span className="text-emerald-400 font-semibold">✨ You're ahead of schedule! Keep up the great momentum.</span>
              ) : (
                <span className="text-orange-400 font-semibold">💪 Progress takes time - every step counts toward your goal.</span>
              )}
            </p>
          </div>
        </div>

        {/* Grid for Heatmap and Energy Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Productivity Heatmap */}
          <div className="bg-[#1e293b] rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">🔥 Consistency Heatmap</h2>
            <p className="text-slate-400 text-sm mb-6">Focus hours over the past 14 days</p>
            
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={heatmapData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8"
                  style={{ fontSize: '10px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <Tooltip content={<HeatmapTooltip />} />
                <Bar 
                  dataKey="hoursFocused" 
                  fill="#10B981"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Energy Analytics */}
          <div className="bg-[#1e293b] rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">⚡ Peak Productivity Windows</h2>
            <p className="text-slate-400 text-sm mb-6">Average tasks completed by time of day</p>
            
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={energyAnalytics.analytics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="timeOfDay" 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Avg Tasks', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px' 
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar 
                  dataKey="avgProductivity" 
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
              <p className="text-slate-300 text-sm">
                <span className="text-blue-400 font-semibold">💡 Insight:</span> You are {energyAnalytics.peakPercentage}% more productive during{' '}
                <span className="text-blue-400 font-semibold">{energyAnalytics.peak.timeOfDay}</span> hours.
              </p>
            </div>
          </div>
        </div>

        {/* Today's Focus - Recovery First Task List */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">🎯 Today's Focus</h2>
          <p className="text-slate-400 text-sm mb-6">Your learning path for today</p>
          
          <div className="space-y-3">
            {todaysTasks.map(task => (
              <div 
                key={task.id} 
                className={`p-4 rounded-lg border transition-all ${
                  task.status === 'complete'
                    ? 'bg-slate-800/30 border-slate-700/50 opacity-60'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      task.status === 'complete'
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-600'
                    }`}>
                      {task.status === 'complete' && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-medium ${
                        task.status === 'complete' 
                          ? 'text-slate-500 line-through' 
                          : 'text-slate-200'
                      }`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {task.isOverdue && task.status === 'incomplete' && (
                    <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-medium transition-colors border border-orange-500/30">
                      Recover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {todaysTasks.filter(t => t.status === 'incomplete').length === 0 && (
            <div className="text-center py-8">
              <p className="text-emerald-400 font-semibold text-lg">🎉 All tasks complete!</p>
              <p className="text-slate-400 text-sm mt-2">Great work today!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalDashboard;
