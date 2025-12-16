// src/mockdata/makegoalprogress.ts

export interface DailyLog {
  date: string;
  tasksCompleted: number;
  hoursFocused: number;
  energyLevel: 'High' | 'Low';
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: 'complete' | 'incomplete';
  completedAt?: string;
}

export interface GoalProgressData {
  goalTitle: string;
  durationWeeks: number;
  startDate: string;
  endDate: string;
  priority: 'Low' | 'Medium' | 'High';
  intensity: string;
  tasksTotal: number;
  tasksCompleted: number;
  dailyLogs: DailyLog[];
  tasks: Task[];
}

// Helper to generate date strings
const generateDateStr = (daysAgo: number): string => {
  const date = new Date('2025-12-15');
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const mockGoalProgressData: GoalProgressData = {
  goalTitle: "Master React & TypeScript",
  durationWeeks: 2,
  startDate: "2025-12-15",
  endDate: "2025-12-28",
  priority: "Medium",
  intensity: "Normal - Steady Progress",
  tasksTotal: 20,
  tasksCompleted: 12,
  
  // Daily logs spanning 14 days with realistic, uneven progress
  dailyLogs: [
    { date: generateDateStr(13), tasksCompleted: 0, hoursFocused: 0, energyLevel: 'Low', timeOfDay: 'Evening' },
    { date: generateDateStr(12), tasksCompleted: 1, hoursFocused: 2.5, energyLevel: 'High', timeOfDay: 'Morning' },
    { date: generateDateStr(11), tasksCompleted: 2, hoursFocused: 4, energyLevel: 'High', timeOfDay: 'Morning' },
    { date: generateDateStr(10), tasksCompleted: 1, hoursFocused: 1.5, energyLevel: 'Low', timeOfDay: 'Evening' },
    { date: generateDateStr(9), tasksCompleted: 0, hoursFocused: 0, energyLevel: 'Low', timeOfDay: 'Afternoon' },
    { date: generateDateStr(8), tasksCompleted: 3, hoursFocused: 5, energyLevel: 'High', timeOfDay: 'Afternoon' },
    { date: generateDateStr(7), tasksCompleted: 2, hoursFocused: 3.5, energyLevel: 'High', timeOfDay: 'Morning' },
    { date: generateDateStr(6), tasksCompleted: 1, hoursFocused: 2, energyLevel: 'Low', timeOfDay: 'Evening' },
    { date: generateDateStr(5), tasksCompleted: 0, hoursFocused: 0.5, energyLevel: 'Low', timeOfDay: 'Evening' },
    { date: generateDateStr(4), tasksCompleted: 2, hoursFocused: 4.5, energyLevel: 'High', timeOfDay: 'Morning' },
    { date: generateDateStr(3), tasksCompleted: 1, hoursFocused: 3, energyLevel: 'High', timeOfDay: 'Afternoon' },
    { date: generateDateStr(2), tasksCompleted: 0, hoursFocused: 1, energyLevel: 'Low', timeOfDay: 'Evening' },
    { date: generateDateStr(1), tasksCompleted: 2, hoursFocused: 4, energyLevel: 'High', timeOfDay: 'Morning' },
    { date: generateDateStr(0), tasksCompleted: 1, hoursFocused: 2.5, energyLevel: 'High', timeOfDay: 'Afternoon' },
  ],
  
  // Today's focus tasks with some overdue items
  tasks: [
    { 
      id: 'task_1', 
      title: 'Complete TypeScript generics tutorial', 
      dueDate: generateDateStr(0), 
      status: 'incomplete' 
    },
    { 
      id: 'task_2', 
      title: 'Build custom React hooks', 
      dueDate: generateDateStr(0), 
      status: 'complete',
      completedAt: generateDateStr(0)
    },
    { 
      id: 'task_3', 
      title: 'Review useState and useEffect', 
      dueDate: generateDateStr(2), 
      status: 'incomplete' 
    },
    { 
      id: 'task_4', 
      title: 'Implement context API example', 
      dueDate: generateDateStr(1), 
      status: 'incomplete' 
    },
    { 
      id: 'task_5', 
      title: 'Practice type inference patterns', 
      dueDate: generateDateStr(0), 
      status: 'complete',
      completedAt: generateDateStr(0)
    },
    { 
      id: 'task_6', 
      title: 'Build todo app with TypeScript', 
      dueDate: generateDateStr(0), 
      status: 'incomplete' 
    },
  ]
};