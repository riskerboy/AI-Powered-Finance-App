import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, Users, CreditCard, Target, Moon, Sun, Edit2, Trash2, Check, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

// Type definitions
interface Income {
  id: number;
  amount: number;
  date: string;
  client: string;
  category: string;
  status: string;
}

interface Goal {
  id: number;
  name: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
}

interface PendingPayment {
  id: number;
  client: string;
  amount: number;
  status: string;
  dueDate: string;
  goalId?: number; // Optional goal assignment
  billId?: number; // Optional bill assignment
}

interface Bill {
  id: number;
  name: string;
  amount: number;
  due_date: number;
  paid: boolean;
  month: string;
}

// API Response types (matching backend field names)
interface PendingPaymentAPI {
  id: number;
  client: string;
  amount: number;
  status: string;
  due_date: string;
}

interface DataState {
  income: Income[];
  goals: Goal[];
  pendingPayments: PendingPayment[];
  bills: Bill[];
}

interface EditingIncome {
  id: number;
  amount: string;
  date: string;
  client: string;
  category: string;
}

interface EditingGoal {
  id: number;
  name: string;
  target: string;
  deadline: string;
}

interface EditingPayment {
  id: number;
  amount: string;
  date: string;
  client: string;
  status: string;
}

interface AllocationRule {
  id: number;
  name: string;
  days: string;
  percentage: number;
  color: string;
}

interface BillEdit {
  id?: number;
  name: string;
  amount: string;
  dueDate: string;
}

const FreelancerMoneyTracker = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DataState>({
    income: [],
    goals: [],
    pendingPayments: [],
    bills: []
  });

  const [newIncome, setNewIncome] = useState({ amount: '', date: '', client: '', category: '', goalId: '' });
  const [newGoal, setNewGoal] = useState({ name: '', target: '', deadline: '' });
  const [newPending, setNewPending] = useState({ client: '', amount: '', dueDate: '', goalId: '', billId: '' });
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddPending, setShowAddPending] = useState(false);
  const [editingIncome, setEditingIncome] = useState<EditingIncome | null>(null);
  const [editingGoal, setEditingGoal] = useState<EditingGoal | null>(null);
  const [editingPayment, setEditingPayment] = useState<EditingPayment | null>(null);
  const [showGoalAssignment, setShowGoalAssignment] = useState<number | null>(null);
  const [goalAssignment, setGoalAssignment] = useState({ amount: '', goalId: '' });
  const [showPaymentReceived, setShowPaymentReceived] = useState<number | null>(null);
  const [paymentReceivedAmount, setPaymentReceivedAmount] = useState({ amount: '' });
  const [allocationRules, setAllocationRules] = useState<AllocationRule[]>([
    { id: 1, name: 'Loan', days: '1-15', percentage: 50, color: 'bg-red-500' },
    { id: 2, name: 'Rent', days: '16-31', percentage: 30, color: 'bg-blue-500' },
    { id: 3, name: 'Savings', days: '1-31', percentage: 20, color: 'bg-green-500' }
  ]);
  const [showAllocationRules, setShowAllocationRules] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [editingBill, setEditingBill] = useState<BillEdit | null>(null);
  const [newBill, setNewBill] = useState<BillEdit>({ name: '', amount: '', dueDate: '' });
  const [showAddBill, setShowAddBill] = useState(false);

  // Load data from backend on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [incomeRes, goalsRes, paymentsRes, billsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/income`),
        fetch(`${API_BASE_URL}/goals`),
        fetch(`${API_BASE_URL}/pending-payments`),
        fetch(`${API_BASE_URL}/bills?month=${selectedMonth}`)
      ]);

      const income: Income[] = await incomeRes.json();
      const goals: Goal[] = await goalsRes.json();
      const pendingPayments: PendingPaymentAPI[] = await paymentsRes.json();
      const bills: Bill[] = await billsRes.json();

      setData({
        income,
        goals,
        pendingPayments: pendingPayments.map(item => ({ 
          ...item, 
          dueDate: item.due_date 
        })),
        bills
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedMonth]);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(2025, 5, 0).getDate(); // June 2025
  const currentDay = new Date().getDate();
  const daysLeft = daysInMonth - currentDay;

  // Calculate total income for current month only
  const currentMonthIncome = data.income.filter(income => {
    const incomeDate = new Date(income.date);
    const currentDate = new Date();
    return incomeDate.getMonth() === currentDate.getMonth() && 
           incomeDate.getFullYear() === currentDate.getFullYear();
  }).reduce((sum, income) => sum + income.amount, 0);

  const totalPending = data.pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalBills = data.bills.reduce((sum, bill) => sum + bill.amount, 0);
  const unpaidBills = data.bills.filter(bill => !bill.paid).reduce((sum, bill) => sum + bill.amount, 0);
  
  const totalGoalsTarget = data.goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalGoalsCurrent = data.goals.reduce((sum, goal) => sum + goal.current, 0);
  const remainingForGoals = totalGoalsTarget - totalGoalsCurrent;
  
  // Calculate daily target based on remaining goals and unpaid bills
  const dailyTarget = Math.max(0, (unpaidBills + remainingForGoals) / Math.max(1, daysLeft));

  const addIncome = async () => {
    if (newIncome.amount && newIncome.date) {
      try {
        // Apply allocation rules if no category is selected
        let category = newIncome.category;
        if (!category) {
          const dayOfMonth = new Date(newIncome.date).getDate();
          const applicableRule = allocationRules.find(rule => {
            const [start, end] = rule.days.split('-').map(Number);
            return dayOfMonth >= start && dayOfMonth <= end;
          });
          category = applicableRule ? applicableRule.name : 'General';
        }

        const response = await fetch(`${API_BASE_URL}/income`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(newIncome.amount),
            date: newIncome.date,
            client: newIncome.client || 'Unknown',
            category: category
          }),
        });

        if (response.ok) {
          // If a goal is selected, assign the money to that goal
          if (newIncome.goalId) {
            const goal = data.goals.find(g => g.id === parseInt(newIncome.goalId));
            if (goal) {
              const newCurrent = goal.current + parseFloat(newIncome.amount);
              await fetch(`${API_BASE_URL}/goals/${newIncome.goalId}/progress?current=${newCurrent}`, {
                method: 'PUT',
              });
            }
          }
          
          await loadAllData();
          setNewIncome({ amount: '', date: '', client: '', category: '', goalId: '' });
          setShowAddIncome(false);
        }
      } catch (error) {
        console.error('Error adding income:', error);
      }
    }
  };

  const updateIncome = async () => {
    if (editingIncome && editingIncome.amount && editingIncome.date) {
      try {
        const response = await fetch(`${API_BASE_URL}/income/${editingIncome.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(editingIncome.amount),
            date: editingIncome.date,
            client: editingIncome.client || 'Unknown',
            category: editingIncome.category || 'General'
          }),
        });

        if (response.ok) {
          await loadAllData();
          setEditingIncome(null);
        }
      } catch (error) {
        console.error('Error updating income:', error);
      }
    }
  };

  const startEditingIncome = (income) => {
    setEditingIncome({
      id: income.id,
      amount: income.amount.toString(),
      date: income.date,
      client: income.client,
      category: income.category
    });
  };

  const cancelEditingIncome = () => {
    setEditingIncome(null);
  };

  const addAllocationRule = () => {
    const newRule = {
      id: Date.now(),
      name: '',
      days: '',
      percentage: 0,
      color: 'bg-gray-500'
    };
    setAllocationRules([...allocationRules, newRule]);
  };

  const updateAllocationRule = (id, field, value) => {
    setAllocationRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const deleteAllocationRule = (id) => {
    setAllocationRules(prev => prev.filter(rule => rule.id !== id));
  };

  const getCategoryColor = (category) => {
    const rule = allocationRules.find(r => r.name === category);
    return rule ? rule.color : 'bg-gray-500';
  };

  const addGoal = async () => {
    if (newGoal.name && newGoal.target) {
      try {
        const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500'];
        const response = await fetch(`${API_BASE_URL}/goals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newGoal.name,
            target: parseFloat(newGoal.target),
            deadline: newGoal.deadline,
            color: colors[data.goals.length % colors.length]
          }),
        });

        if (response.ok) {
          await loadAllData();
          setNewGoal({ name: '', target: '', deadline: '' });
          setShowAddGoal(false);
        }
      } catch (error) {
        console.error('Error adding goal:', error);
      }
    }
  };

  const updateGoal = async () => {
    if (editingGoal && editingGoal.name && editingGoal.target) {
      try {
        const response = await fetch(`${API_BASE_URL}/goals/${editingGoal.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editingGoal.name,
            target: parseFloat(editingGoal.target),
            deadline: editingGoal.deadline
          }),
        });

        if (response.ok) {
          await loadAllData();
          setEditingGoal(null);
        }
      } catch (error) {
        console.error('Error updating goal:', error);
      }
    }
  };

  const startEditingGoal = (goal) => {
    setEditingGoal({
      id: goal.id,
      name: goal.name,
      target: goal.target.toString(),
      deadline: goal.deadline || ''
    });
  };

  const cancelEditingGoal = () => {
    setEditingGoal(null);
  };

  const assignMoneyToGoal = async (goalId) => {
    if (goalAssignment.amount && parseFloat(goalAssignment.amount) > 0) {
      try {
        const goal = data.goals.find(g => g.id === goalId);
        if (goal) {
          const newCurrent = goal.current + parseFloat(goalAssignment.amount);
          const response = await fetch(`${API_BASE_URL}/goals/${goalId}/progress?current=${newCurrent}`, {
            method: 'PUT',
          });

          if (response.ok) {
            await loadAllData();
            setGoalAssignment({ amount: '', goalId: '' });
            setShowGoalAssignment(null);
          }
        }
      } catch (error) {
        console.error('Error assigning money to goal:', error);
      }
    }
  };

  const getGoalProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getGoalStatus = (goal) => {
    const percentage = (goal.current / goal.target) * 100;
    const daysUntilDeadline = goal.deadline ? 
      Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    if (percentage >= 100) return { status: 'Completed', color: 'text-green-600', icon: '🎉' };
    if (daysUntilDeadline !== null && daysUntilDeadline < 0) return { status: 'Overdue', color: 'text-red-600', icon: '⚠️' };
    if (daysUntilDeadline !== null && daysUntilDeadline <= 7) return { status: 'Due Soon', color: 'text-orange-600', icon: '⏰' };
    if (percentage >= 75) return { status: 'On Track', color: 'text-blue-600', icon: '🚀' };
    if (percentage >= 50) return { status: 'Good Progress', color: 'text-yellow-600', icon: '📈' };
    return { status: 'Getting Started', color: 'text-gray-600', icon: '🌱' };
  };

  const addPendingPayment = async () => {
    if (newPending.client && newPending.amount && newPending.dueDate) {
      try {
        const response = await fetch(`${API_BASE_URL}/pending-payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client: newPending.client,
            amount: parseFloat(newPending.amount),
            due_date: newPending.dueDate,
            goal_id: newPending.goalId || null,
            bill_id: newPending.billId || null
          }),
        });

        if (response.ok) {
          await loadAllData();
          setNewPending({ client: '', amount: '', dueDate: '', goalId: '', billId: '' });
          setShowAddPending(false);
        }
      } catch (error) {
        console.error('Error adding pending payment:', error);
      }
    }
  };

  const markPaymentReceived = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pending-payments/${id}/mark-received`, {
        method: 'PUT',
      });

      if (response.ok) {
        await loadAllData();
      }
    } catch (error) {
      console.error('Error marking payment received:', error);
    }
  };

  const deleteItem = async (type, id) => {
    try {
      const endpoint = type === 'income' ? 'income' : 
                      type === 'goals' ? 'goals' : 
                      type === 'pendingPayments' ? 'pending-payments' : 'bills';
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadAllData();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const toggleBillPaid = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bills/${id}/toggle`, {
        method: 'PUT',
      });

      if (response.ok) {
        await loadAllData();
      }
    } catch (error) {
      console.error('Error toggling bill:', error);
    }
  };

  const addBill = async () => {
    if (newBill.name && newBill.amount && newBill.dueDate) {
      await fetch(`${API_BASE_URL}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBill.name,
          amount: parseFloat(newBill.amount),
          due_date: parseInt(newBill.dueDate),
          month: selectedMonth
        })
      });
      setShowAddBill(false);
      setNewBill({ name: '', amount: '', dueDate: '' });
      await loadAllData();
    }
  };

  const startEditingBill = (bill: Bill) => {
    setEditingBill({ id: bill.id, name: bill.name, amount: bill.amount.toString(), dueDate: bill.due_date.toString() });
  };

  const updateBill = async () => {
    if (editingBill && editingBill.name && editingBill.amount && editingBill.dueDate) {
      await fetch(`${API_BASE_URL}/bills/${editingBill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingBill.name,
          amount: parseFloat(editingBill.amount),
          due_date: parseInt(editingBill.dueDate),
          month: selectedMonth
        })
      });
      setEditingBill(null);
      await loadAllData();
    }
  };

  const cancelEditingBill = () => setEditingBill(null);

  const deleteBill = async (id) => {
    await fetch(`${API_BASE_URL}/bills/${id}`, { method: 'DELETE' });
    await loadAllData();
  };

  const toggleBillPaidUI = async (id) => {
    await fetch(`${API_BASE_URL}/bills/${id}/toggle`, { method: 'PUT' });
    await loadAllData();
  };

  const StatCard = ({ title, value, icon: Icon, color = "bg-white", textColor = "text-gray-900" }) => (
    <div className={`${color} ${darkMode ? 'bg-gray-800 text-white' : ''} rounded-2xl p-6 shadow-sm border border-gray-100 ${darkMode ? 'border-gray-700' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-2xl font-bold mt-2 ${textColor} ${darkMode ? 'text-white' : ''}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <Icon className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ current, target, color, label }) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ${current.toLocaleString()} / ${target.toLocaleString()}
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className={`h-3 rounded-full ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="text-right mt-1">
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{percentage.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'income', label: 'Income', icon: Plus },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'bills', label: 'Bills', icon: CreditCard }
  ];

  // Add Daily Goal Calculator calculations
  const calculateDailyGoal = () => {
    // Calculate total needed for current month
    const totalGoalsNeeded = data.goals.reduce((sum, goal) => {
      const remaining = goal.target - goal.current;
      return sum + Math.max(0, remaining);
    }, 0);
    
    const unpaidBillsThisMonth = data.bills.filter(bill => !bill.paid).reduce((sum, bill) => sum + bill.amount, 0);
    
    const totalNeeded = totalGoalsNeeded + unpaidBillsThisMonth;
    
    // Subtract already earned income for current month
    const currentMonthIncome = data.income.filter(income => {
      const incomeDate = new Date(income.date);
      const currentDate = new Date();
      return incomeDate.getMonth() === currentDate.getMonth() && 
             incomeDate.getFullYear() === currentDate.getFullYear();
    }).reduce((sum, income) => sum + income.amount, 0);
    
    const remainingNeeded = Math.max(0, totalNeeded - currentMonthIncome);
    
    // Calculate days left in current month
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(1, daysInMonth - now.getDate());
    
    const dailyGoal = remainingNeeded / daysLeft;
    
    return {
      totalNeeded,
      currentMonthIncome,
      remainingNeeded,
      daysLeft,
      dailyGoal,
      totalGoalsNeeded,
      unpaidBillsThisMonth
    };
  };

  const DailyGoalCalculator = () => {
    const {
      totalNeeded,
      currentMonthIncome,
      remainingNeeded,
      daysLeft,
      dailyGoal,
      totalGoalsNeeded,
      unpaidBillsThisMonth
    } = calculateDailyGoal();
    
    const progressPercentage = totalNeeded > 0 ? Math.min(100, (currentMonthIncome / totalNeeded) * 100) : 100;
    const isOnTrack = dailyGoal <= 0;
    const isClose = dailyGoal > 0 && dailyGoal <= 100;
    const needsAttention = dailyGoal > 100;
    
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Daily Goal Calculator</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isOnTrack ? 'bg-green-100 text-green-700' :
            isClose ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {isOnTrack ? 'On Track! 🎉' : isClose ? 'Close! 💪' : 'Needs Attention ⚠️'}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Monthly Progress</span>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ${currentMonthIncome.toLocaleString()} / ${totalNeeded.toLocaleString()}
            </span>
          </div>
          <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                progressPercentage >= 100 ? 'bg-green-500' :
                progressPercentage >= 75 ? 'bg-blue-500' :
                progressPercentage >= 50 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            ></div>
          </div>
          <div className="text-right mt-1">
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{progressPercentage.toFixed(1)}%</span>
          </div>
        </div>
        
        {/* Daily Goal Display */}
        <div className="text-center mb-6">
          <div className={`text-3xl font-bold mb-2 ${
            isOnTrack ? 'text-green-600' :
            isClose ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            ${dailyGoal.toFixed(0)}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Required daily income
          </div>
        </div>
        
        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Goals Remaining</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              ${totalGoalsNeeded.toLocaleString()}
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Unpaid Bills</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              ${unpaidBillsThisMonth.toLocaleString()}
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Days Left</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              {daysLeft}
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Still Needed</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              ${remainingNeeded.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Motivational Message */}
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <p className={`text-sm font-medium ${darkMode ? 'text-orange-200' : 'text-orange-800'}`}>
            {isOnTrack ? 
              "You're crushing it! Keep up the momentum! 🚀" :
              isClose ? 
              `Just $${dailyGoal.toFixed(0)} per day to stay on track. You've got this! 💪` :
              `You need $${dailyGoal.toFixed(0)} daily to reach your goals. Time to hustle! 🔥`
            }
          </p>
        </div>
      </div>
    );
  };

  // Add function to calculate goal progress including pending payments
  const calculateGoalProgressWithPending = (goal) => {
    const pendingForGoal = data.pendingPayments
      .filter(payment => payment.goalId === goal.id && payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalProgress = goal.current + pendingForGoal;
    const receivedPercentage = (goal.current / goal.target) * 100;
    const pendingPercentage = (pendingForGoal / goal.target) * 100;
    const totalPercentage = Math.min(100, (totalProgress / goal.target) * 100);
    
    return {
      current: goal.current,
      pending: pendingForGoal,
      total: totalProgress,
      receivedPercentage,
      pendingPercentage,
      totalPercentage
    };
  };

  // Enhanced ProgressBar component for goals with pending payments
  const GoalProgressBar = ({ goal }) => {
    const progress = calculateGoalProgressWithPending(goal);
    const status = getGoalStatus(goal);
    
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {goal.name}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color.replace('text-', 'bg-').replace('-600', '-100')} ${status.color}`}>
              {status.status} {status.icon}
            </span>
          </div>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ${progress.total.toLocaleString()} / ${goal.target.toLocaleString()}
          </span>
        </div>
        
        {/* Progress Bar with Received (Green) and Pending (Yellow) */}
        <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} relative overflow-hidden`}>
          {/* Received amount (Green) */}
          <div 
            className="h-3 bg-green-500 transition-all duration-500"
            style={{ width: `${progress.receivedPercentage}%` }}
          ></div>
          
          {/* Pending amount (Yellow) */}
          <div 
            className="h-3 bg-yellow-500 transition-all duration-500 absolute top-0"
            style={{ 
              left: `${progress.receivedPercentage}%`,
              width: `${progress.pendingPercentage}%`
            }}
          ></div>
        </div>
        
        {/* Progress Details */}
        <div className="flex justify-between items-center mt-2 text-xs">
          <div className="flex space-x-4">
            <span className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              Received: ${progress.current.toLocaleString()}
            </span>
            {progress.pending > 0 && (
              <span className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                Pending: ${progress.pending.toLocaleString()}
              </span>
            )}
          </div>
          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {progress.totalPercentage.toFixed(1)}%
          </span>
        </div>
        
        {/* Pending Payments for this Goal */}
        {progress.pending > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Pending Payments for this Goal:
            </div>
            {data.pendingPayments
              .filter(payment => payment.goalId === goal.id && payment.status === 'pending')
              .map(payment => (
                <div key={payment.id} className="flex justify-between items-center text-xs text-yellow-700 dark:text-yellow-300">
                  <span>{payment.client} - Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                  <span>${payment.amount.toLocaleString()}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  // Add function to calculate bill progress including pending payments
  const calculateBillProgressWithPending = (bill) => {
    const pendingForBill = data.pendingPayments
      .filter(payment => payment.billId === bill.id && payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalProgress = bill.amount + pendingForBill;
    const paidPercentage = bill.paid ? 100 : 0;
    const pendingPercentage = (pendingForBill / bill.amount) * 100;
    const totalPercentage = Math.min(100, (totalProgress / bill.amount) * 100);
    
    return {
      paid: bill.paid,
      pending: pendingForBill,
      total: totalProgress,
      paidPercentage,
      pendingPercentage,
      totalPercentage
    };
  };

  // Enhanced ProgressBar component for bills with pending payments
  const BillProgressBar = ({ bill }) => {
    const progress = calculateBillProgressWithPending(bill);
    
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {bill.name} - ${bill.amount.toLocaleString()}
          </span>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ${progress.total.toLocaleString()} / ${bill.amount.toLocaleString()}
          </span>
        </div>
        
        {/* Progress Bar with Paid (Green) and Pending (Yellow) */}
        <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} relative overflow-hidden`}>
          {/* Paid amount (Green) */}
          {bill.paid && (
            <div 
              className="h-3 bg-green-500 transition-all duration-500"
              style={{ width: '100%' }}
            ></div>
          )}
          
          {/* Pending amount (Yellow) - only show if not paid */}
          {!bill.paid && progress.pending > 0 && (
            <div 
              className="h-3 bg-yellow-500 transition-all duration-500 absolute top-0"
              style={{ 
                left: '0%',
                width: `${progress.pendingPercentage}%`
              }}
            ></div>
          )}
        </div>
        
        {/* Progress Details */}
        <div className="flex justify-between items-center mt-2 text-xs">
          <div className="flex space-x-4">
            {bill.paid ? (
              <span className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                Paid: ${bill.amount.toLocaleString()}
              </span>
            ) : (
              <>
                <span className={`${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  Unpaid: ${bill.amount.toLocaleString()}
                </span>
                {progress.pending > 0 && (
                  <span className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    Pending: ${progress.pending.toLocaleString()}
                  </span>
                )}
              </>
            )}
          </div>
          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {progress.totalPercentage.toFixed(1)}%
          </span>
        </div>
        
        {/* Pending Payments for this Bill */}
        {!bill.paid && progress.pending > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Pending Payments for this Bill:
            </div>
            {data.pendingPayments
              .filter(payment => payment.billId === bill.id && payment.status === 'pending')
              .map(payment => (
                <div key={payment.id} className="flex justify-between items-center text-xs text-yellow-700 dark:text-yellow-300">
                  <span>{payment.client} - Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                  <span>${payment.amount.toLocaleString()}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  // Calculate comprehensive overview when all pending payments are received
  const calculateOverview = () => {
    const totalPending = data.pendingPayments
      .filter(payment => payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalIncome = data.income.reduce((sum, income) => sum + income.amount, 0);
    const totalIncomeWithPending = totalIncome + totalPending;
    
    // Calculate goals with pending payments
    const goalsWithPending = data.goals.map(goal => {
      const pendingForGoal = data.pendingPayments
        .filter(payment => payment.goalId === goal.id && payment.status === 'pending')
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      const totalProgress = goal.current + pendingForGoal;
      const remaining = Math.max(0, goal.target - totalProgress);
      const surplus = Math.max(0, totalProgress - goal.target);
      
      return {
        ...goal,
        pending: pendingForGoal,
        totalProgress,
        remaining,
        surplus,
        isComplete: totalProgress >= goal.target
      };
    });
    
    // Calculate bills with pending payments
    const billsWithPending = data.bills.map(bill => {
      const pendingForBill = data.pendingPayments
        .filter(payment => payment.billId === bill.id && payment.status === 'pending')
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      const totalCovered = (bill.paid ? bill.amount : 0) + pendingForBill;
      const remaining = Math.max(0, bill.amount - totalCovered);
      const surplus = Math.max(0, totalCovered - bill.amount);
      
      return {
        ...bill,
        pending: pendingForBill,
        totalCovered,
        remaining,
        surplus,
        isFullyCovered: totalCovered >= bill.amount
      };
    });
    
    // Calculate unassigned pending payments
    const unassignedPending = data.pendingPayments
      .filter(payment => !payment.goalId && !payment.billId && payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate total remaining needs
    const totalGoalsRemaining = goalsWithPending.reduce((sum, goal) => sum + goal.remaining, 0);
    const totalBillsRemaining = billsWithPending.reduce((sum, bill) => sum + bill.remaining, 0);
    const totalRemainingNeeds = totalGoalsRemaining + totalBillsRemaining;
    
    // Calculate total surplus
    const totalGoalsSurplus = goalsWithPending.reduce((sum, goal) => sum + goal.surplus, 0);
    const totalBillsSurplus = billsWithPending.reduce((sum, bill) => sum + bill.surplus, 0);
    const totalSurplus = totalGoalsSurplus + totalBillsSurplus + unassignedPending;
    
    // Calculate net position
    const netPosition = totalIncomeWithPending - totalRemainingNeeds;
    
    return {
      totalIncome,
      totalPending,
      totalIncomeWithPending,
      goalsWithPending,
      billsWithPending,
      unassignedPending,
      totalGoalsRemaining,
      totalBillsRemaining,
      totalRemainingNeeds,
      totalGoalsSurplus,
      totalBillsSurplus,
      totalSurplus,
      netPosition
    };
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 border-gray-200'} backdrop-blur-sm border-b sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">💰</span>
              </div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Freelancer Tracker
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex space-x-1 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? darkMode 
                      ? 'bg-orange-500 text-white shadow-lg' 
                      : 'bg-orange-500 text-white shadow-lg'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading your financial data...</p>
            </div>
          </div>
        )}

        {!loading && activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                The vibes are immaculate
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Finally, a money app that doesn't give you the ick
              </p>
            </div>

            {/* Daily Goal Calculator - Prominently Displayed */}
            <DailyGoalCalculator />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Income This Month"
                value={`$${currentMonthIncome.toLocaleString()}`}
                icon={TrendingUp}
              />
              <StatCard
                title="Pending Payments"
                value={`$${totalPending.toLocaleString()}`}
                icon={Calendar}
              />
              <StatCard
                title="Daily Target"
                value={`$${dailyTarget.toFixed(0)}`}
                icon={Target}
              />
              <StatCard
                title="Days Left"
                value={`${daysLeft} days`}
                icon={Calendar}
              />
            </div>

            {/* Goal Progress */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Goal Progress</h3>
              {data.goals.map((goal) => (
                <ProgressBar
                  key={goal.id}
                  current={goal.current}
                  target={goal.target}
                  color={goal.color}
                  label={goal.name}
                />
              ))}
            </div>

            {/* Motivational Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      You're {((currentMonthIncome / (totalBills + remainingForGoals)) * 100).toFixed(0)}% towards your monthly targets!
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Keep up the momentum 🚀
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">💡</span>
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {totalPending > 0 ? `$${totalPending.toLocaleString()} incoming from clients` : 'All payments up to date!'}
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {totalPending > 0 ? 'Money on the way 💰' : 'Time to hustle for more 💪'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'income' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Income Tracking</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAllocationRules(true)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Allocation Rules</span>
                </button>
                <button
                  onClick={() => setShowAddIncome(true)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Income</span>
                </button>
              </div>
            </div>

            {/* Allocation Rules Modal */}
            {showAllocationRules && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Income Allocation Rules</h3>
                  <button
                    onClick={() => setShowAllocationRules(false)}
                    className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Set rules to automatically categorize income based on the day of the month. Leave category empty when adding income to use these rules.
                </p>
                
                <div className="space-y-4">
                  {allocationRules.map((rule) => (
                    <div key={rule.id} className="grid grid-cols-5 gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Category Name"
                        value={rule.name}
                        onChange={(e) => updateAllocationRule(rule.id, 'name', e.target.value)}
                        className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <input
                        type="text"
                        placeholder="Days (e.g., 1-15)"
                        value={rule.days}
                        onChange={(e) => updateAllocationRule(rule.id, 'days', e.target.value)}
                        className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <input
                        type="number"
                        placeholder="%"
                        value={rule.percentage}
                        onChange={(e) => updateAllocationRule(rule.id, 'percentage', parseInt(e.target.value) || 0)}
                        className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <select
                        value={rule.color}
                        onChange={(e) => updateAllocationRule(rule.id, 'color', e.target.value)}
                        className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="bg-red-500">Red</option>
                        <option value="bg-blue-500">Blue</option>
                        <option value="bg-green-500">Green</option>
                        <option value="bg-purple-500">Purple</option>
                        <option value="bg-yellow-500">Yellow</option>
                        <option value="bg-pink-500">Pink</option>
                        <option value="bg-indigo-500">Indigo</option>
                        <option value="bg-gray-500">Gray</option>
                      </select>
                      <button
                        onClick={() => deleteAllocationRule(rule.id)}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={addAllocationRule}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Rule
                  </button>
                  <button
                    onClick={() => setShowAllocationRules(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {showAddIncome && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add Income</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="date"
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({...newIncome, date: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="text"
                    placeholder="Client Name (optional)"
                    value={newIncome.client}
                    onChange={(e) => setNewIncome({...newIncome, client: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <select
                    value={newIncome.category}
                    onChange={(e) => setNewIncome({...newIncome, category: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">Auto-categorize (use allocation rules)</option>
                    {allocationRules.map(rule => (
                      <option key={rule.id} value={rule.name}>{rule.name}</option>
                    ))}
                    <option value="General">General</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Investment">Investment</option>
                    <option value="Bonus">Bonus</option>
                  </select>
                  <select
                    value={newIncome.goalId}
                    onChange={(e) => setNewIncome({...newIncome, goalId: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">Don't assign to goal</option>
                    {data.goals.map(goal => (
                      <option key={goal.id} value={goal.id}>
                        {goal.name} (${goal.current.toLocaleString()}/${goal.target.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={addIncome}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add Income
                  </button>
                  <button
                    onClick={() => setShowAddIncome(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {data.income.map((income) => (
                <div key={income.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
                  {editingIncome && editingIncome.id === income.id ? (
                    // Edit mode
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="number"
                        placeholder="Amount"
                        value={editingIncome.amount}
                        onChange={(e) => setEditingIncome({...editingIncome, amount: e.target.value})}
                        className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <input
                        type="date"
                        value={editingIncome.date}
                        onChange={(e) => setEditingIncome({...editingIncome, date: e.target.value})}
                        className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <input
                        type="text"
                        placeholder="Client"
                        value={editingIncome.client}
                        onChange={(e) => setEditingIncome({...editingIncome, client: e.target.value})}
                        className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <select
                        value={editingIncome.category}
                        onChange={(e) => setEditingIncome({...editingIncome, category: e.target.value})}
                        className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        {allocationRules.map(rule => (
                          <option key={rule.id} value={rule.name}>{rule.name}</option>
                        ))}
                        <option value="General">General</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Investment">Investment</option>
                        <option value="Bonus">Bonus</option>
                      </select>
                    </div>
                  ) : (
                    // Display mode
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${income.amount.toLocaleString()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(income.category)} text-white`}>
                          {income.category}
                        </span>
                      </div>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {income.client} • {new Date(income.date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    {editingIncome && editingIncome.id === income.id ? (
                      <>
                        <button
                          onClick={updateIncome}
                          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditingIncome}
                          className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditingIncome(income)}
                          className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem('income', income.id)}
                          className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Income Summary */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Income Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ${currentMonthIncome.toLocaleString()}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    ${data.income.reduce((sum, income) => sum + income.amount, 0).toLocaleString()}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total All Time</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {data.income.length}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Entries</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    ${(currentMonthIncome / Math.max(1, new Date().getDate())).toFixed(0)}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Daily Average</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Financial Goals</h2>
              <button
                onClick={() => setShowAddGoal(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Goal</span>
              </button>
            </div>

            {showAddGoal && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add New Goal</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Goal Name"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="number"
                    placeholder="Amount Needed"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="date"
                    placeholder="Deadline (optional)"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={addGoal}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add Goal
                  </button>
                  <button
                    onClick={() => setShowAddGoal(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {data.goals.map((goal) => (
                <div key={goal.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <GoalProgressBar goal={goal} />
                  
                  {editingGoal && editingGoal.id === goal.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          placeholder="Goal Name"
                          value={editingGoal.name}
                          onChange={(e) => setEditingGoal({...editingGoal, name: e.target.value})}
                          className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                        <input
                          type="number"
                          placeholder="Amount Needed"
                          value={editingGoal.target}
                          onChange={(e) => setEditingGoal({...editingGoal, target: e.target.value})}
                          className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                        <input
                          type="date"
                          placeholder="Deadline"
                          value={editingGoal.deadline}
                          onChange={(e) => setEditingGoal({...editingGoal, deadline: e.target.value})}
                          className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={updateGoal}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4 inline mr-2" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditingGoal}
                          className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          <X className="w-4 h-4 inline mr-2" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display mode - show goal actions
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditingGoal(goal)}
                          className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowGoalAssignment(goal.id)}
                          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Assign Money
                        </button>
                      </div>
                      <button
                        onClick={() => deleteItem('goals', goal.id)}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Goal Assignment Modal */}
                  {showGoalAssignment === goal.id && (
                    <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Add money to goal"
                          value={goalAssignment.amount}
                          onChange={(e) => setGoalAssignment({ amount: e.target.value, goalId: goalAssignment.goalId })}
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                        <button
                          onClick={() => assignMoneyToGoal(goal.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => setShowGoalAssignment(null)}
                          className={`px-4 py-2 rounded-lg transition-colors text-sm ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Goals Summary */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Goals Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {data.goals.length}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Goals</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ${totalGoalsCurrent.toLocaleString()}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Saved</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    ${remainingForGoals.toLocaleString()}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Still Needed</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {data.goals.filter(g => (g.current / g.target) * 100 >= 100).length}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pending Payments</h2>
              <button
                onClick={() => setShowAddPending(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Payment</span>
              </button>
            </div>

            {showAddPending && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add Pending Payment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={newPending.client}
                    onChange={(e) => setNewPending({...newPending, client: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newPending.amount}
                    onChange={(e) => setNewPending({...newPending, amount: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="date"
                    placeholder="Due Date"
                    value={newPending.dueDate}
                    onChange={(e) => setNewPending({...newPending, dueDate: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <select
                    value={newPending.goalId}
                    onChange={(e) => setNewPending({...newPending, goalId: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">Don't assign to goal</option>
                    {data.goals.map(goal => (
                      <option key={goal.id} value={goal.id}>
                        {goal.name} (${goal.current.toLocaleString()}/${goal.target.toLocaleString()})
                      </option>
                    ))}
                  </select>
                  <select
                    value={newPending.billId}
                    onChange={(e) => setNewPending({...newPending, billId: e.target.value})}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">Don't assign to bill</option>
                    {data.bills.map(bill => (
                      <option key={bill.id} value={bill.id}>
                        {bill.name} - ${bill.amount.toLocaleString()} ({bill.paid ? 'Paid' : 'Unpaid'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={addPendingPayment}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add Payment
                  </button>
                  <button
                    onClick={() => setShowAddPending(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Assign Modal for Received Payment */}
            {showPaymentReceived !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-8 shadow-lg w-full max-w-md`}>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Assign Received Payment</h3>
                  <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>How do you want to assign this money?</p>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={paymentReceivedAmount.amount}
                    onChange={e => setPaymentReceivedAmount({ amount: e.target.value })}
                    className={`mb-4 px-4 py-2 rounded-lg border w-full ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <div className="mb-4">
                    <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Assign to Goal (optional):</label>
                    <select
                      value={goalAssignment.goalId || ''}
                      onChange={e => setGoalAssignment({ ...goalAssignment, goalId: e.target.value })}
                      className={`px-4 py-2 rounded-lg border w-full ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">-- Just add to income --</option>
                      {data.goals.map(goal => (
                        <option key={goal.id} value={goal.id}>{goal.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={async () => {
                        // Assign to goal if selected, else add to income
                        const payment = data.pendingPayments.find(p => p.id === showPaymentReceived);
                        if (!payment) return;
                        const amount = parseFloat(paymentReceivedAmount.amount) || payment.amount;
                        if (goalAssignment.goalId) {
                          // Assign to goal
                          const goal = data.goals.find(g => g.id === parseInt(goalAssignment.goalId));
                          if (goal) {
                            await fetch(`${API_BASE_URL}/goals/${goal.id}/progress?current=${goal.current + amount}`, { method: 'PUT' });
                          }
                        } else {
                          // Add to income
                          await fetch(`${API_BASE_URL}/income`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              amount,
                              date: new Date().toISOString().slice(0, 10),
                              client: payment.client,
                              category: 'Client Payment'
                            })
                          });
                        }
                        // Mark payment as received
                        await markPaymentReceived(payment.id);
                        setShowPaymentReceived(null);
                        setPaymentReceivedAmount({ amount: '' });
                        setGoalAssignment({ amount: '', goalId: '' });
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Assign & Mark Received
                    </button>
                    <button
                      onClick={() => { setShowPaymentReceived(null); setPaymentReceivedAmount({ amount: '' }); setGoalAssignment({ amount: '', goalId: '' }); }}
                      className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {data.pendingPayments.map((payment) => (
                <div key={payment.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${payment.amount.toLocaleString()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {payment.status}
                      </span>
                      {payment.goalId && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                          {data.goals.find(g => g.id === payment.goalId)?.name || 'Goal'}
                        </span>
                      )}
                      {payment.billId && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                          {data.bills.find(b => b.id === payment.billId)?.name || 'Bill'}
                        </span>
                      )}
                    </div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {payment.client} • Due: {new Date(payment.dueDate).toLocaleDateString()}
                      {payment.goalId && (
                        <span className="ml-2 text-blue-600">
                          → {data.goals.find(g => g.id === payment.goalId)?.name}
                        </span>
                      )}
                      {payment.billId && (
                        <span className="ml-2 text-purple-600">
                          → {data.bills.find(b => b.id === payment.billId)?.name}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => { setShowPaymentReceived(payment.id); setPaymentReceivedAmount({ amount: payment.amount.toString() }); }}
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteItem('pendingPayments', payment.id)}
                      className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bills' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Monthly Bills</h2>
              <div className="flex items-center space-x-2">
                <button onClick={() => setShowAddBill(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Bill</span>
                </button>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            {showAddBill && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}> 
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add Bill</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Name" value={newBill.name} onChange={e => setNewBill({ ...newBill, name: e.target.value })} className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}/>
                  <input type="number" placeholder="Amount" value={newBill.amount} onChange={e => setNewBill({ ...newBill, amount: e.target.value })} className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}/>
                  <input type="number" placeholder="Due Day (1-31)" value={newBill.dueDate} onChange={e => setNewBill({ ...newBill, dueDate: e.target.value })} className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}/>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button onClick={addBill} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">Add Bill</button>
                  <button onClick={() => setShowAddBill(false)} className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Cancel</button>
                </div>
              </div>
            )}
            {editingBill && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}> 
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Edit Bill</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Name" value={editingBill.name} onChange={e => setEditingBill({ ...editingBill, name: e.target.value })} className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}/>
                  <input type="number" placeholder="Amount" value={editingBill.amount} onChange={e => setEditingBill({ ...editingBill, amount: e.target.value })} className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}/>
                  <input type="number" placeholder="Due Day (1-31)" value={editingBill.dueDate} onChange={e => setEditingBill({ ...editingBill, dueDate: e.target.value })} className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}/>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button onClick={updateBill} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">Save</button>
                  <button onClick={cancelEditingBill} className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Cancel</button>
                </div>
              </div>
            )}
            <div className="grid gap-4">
              {data.bills.map((bill: Bill) => (
                <div key={bill.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
                  <div className="flex items-center space-x-4">
                    <button onClick={() => toggleBillPaidUI(bill.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${bill.paid ? 'bg-green-500 border-green-500 text-white' : darkMode ? 'border-gray-600 hover:border-green-500' : 'border-gray-300 hover:border-green-500'}`}>{bill.paid && <Check className="w-3 h-3" />}</button>
                    <div>
                      <h3 className={`text-lg font-semibold ${bill.paid ? (darkMode ? 'text-gray-400 line-through' : 'text-gray-500 line-through') : (darkMode ? 'text-white' : 'text-gray-900')}`}>{bill.name}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Due: {bill.due_date}{bill.due_date === 1 ? 'st' : bill.due_date === 2 ? 'nd' : bill.due_date === 3 ? 'rd' : 'th'} of month</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xl font-bold ${bill.paid ? (darkMode ? 'text-gray-400' : 'text-gray-500') : (darkMode ? 'text-white' : 'text-gray-900')}`}>${bill.amount.toLocaleString()}</span>
                    <button onClick={() => startEditingBill(bill)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteBill(bill.id)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bills Summary with Progress Bars */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bills Overview</h3>
              <div className="space-y-4">
                {data.bills.map((bill: Bill) => (
                  <BillProgressBar key={bill.id} bill={bill} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Financial Overview
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Projected financial position when all pending payments are received
              </p>
            </div>

            {(() => {
              const overview = calculateOverview();
              const isPositive = overview.netPosition >= 0;
              
              return (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Total Income (Current)"
                      value={`$${overview.totalIncome.toLocaleString()}`}
                      icon={TrendingUp}
                      color={darkMode ? "bg-gray-800" : "bg-white"}
                      textColor={darkMode ? "text-white" : "text-gray-900"}
                    />
                    <StatCard
                      title="Pending Payments"
                      value={`$${overview.totalPending.toLocaleString()}`}
                      icon={Calendar}
                      color={darkMode ? "bg-gray-800" : "bg-white"}
                      textColor={darkMode ? "text-white" : "text-gray-900"}
                    />
                    <StatCard
                      title="Total Income (With Pending)"
                      value={`$${overview.totalIncomeWithPending.toLocaleString()}`}
                      icon={TrendingUp}
                      color={darkMode ? "bg-gray-800" : "bg-white"}
                      textColor={darkMode ? "text-white" : "text-gray-900"}
                    />
                    <StatCard
                      title="Net Position"
                      value={`$${overview.netPosition.toLocaleString()}`}
                      icon={Target}
                      color={isPositive ? "bg-green-100" : "bg-red-100"}
                      textColor={isPositive ? "text-green-700" : "text-red-700"}
                    />
                  </div>

                  {/* Net Position Analysis */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Net Position Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className={`font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Income Sources</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Income:</span>
                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>${overview.totalIncome.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Payments:</span>
                            <span className={`font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>${overview.totalPending.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Available:</span>
                            <span className={`font-bold text-lg ${darkMode ? 'text-green-400' : 'text-green-600'}`}>${overview.totalIncomeWithPending.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className={`font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Financial Obligations</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Goals Remaining:</span>
                            <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>${overview.totalGoalsRemaining.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bills Remaining:</span>
                            <span className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>${overview.totalBillsRemaining.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Needed:</span>
                            <span className={`font-bold text-lg ${darkMode ? 'text-red-400' : 'text-red-600'}`}>${overview.totalRemainingNeeds.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Net Position Result */}
                    <div className={`mt-6 p-4 rounded-lg ${isPositive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} border ${isPositive ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold ${isPositive ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                            {isPositive ? 'Surplus Available' : 'Deficit to Address'}
                          </h4>
                          <p className={`text-sm ${isPositive ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                            {isPositive 
                              ? `You'll have $${overview.netPosition.toLocaleString()} available after meeting all goals and bills`
                              : `You'll need $${Math.abs(overview.netPosition).toLocaleString()} more to meet all goals and bills`
                            }
                          </p>
                        </div>
                        <div className={`text-2xl font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          ${overview.netPosition.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Goals Projection */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Goals Projection</h3>
                    <div className="space-y-4">
                      {overview.goalsWithPending.map((goal) => (
                        <div key={goal.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{goal.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              goal.isComplete 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {goal.isComplete ? 'Complete' : 'In Progress'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current:</span>
                              <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>${goal.current.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending:</span>
                              <span className={`ml-2 font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>${goal.pending.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Target:</span>
                              <span className={`ml-2 font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>${goal.target.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {goal.remaining > 0 ? 'Still Needed:' : 'Surplus:'}
                              </span>
                              <span className={`ml-2 font-medium ${goal.remaining > 0 ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-green-400' : 'text-green-600')}`}>
                                ${goal.remaining > 0 ? goal.remaining.toLocaleString() : goal.surplus.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bills Projection */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bills Projection</h3>
                    <div className="space-y-4">
                      {overview.billsWithPending.map((bill) => (
                        <div key={bill.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{bill.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              bill.isFullyCovered 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {bill.isFullyCovered ? 'Fully Covered' : 'Partially Covered'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount:</span>
                              <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>${bill.amount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending:</span>
                              <span className={`ml-2 font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>${bill.pending.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Covered:</span>
                              <span className={`ml-2 font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>${bill.totalCovered.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {bill.remaining > 0 ? 'Still Needed:' : 'Surplus:'}
                              </span>
                              <span className={`ml-2 font-medium ${bill.remaining > 0 ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-green-400' : 'text-green-600')}`}>
                                ${bill.remaining > 0 ? bill.remaining.toLocaleString() : bill.surplus.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Unassigned Pending Payments */}
                  {overview.unassignedPending > 0 && (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Unassigned Pending Payments</h3>
                      <div className={`p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-semibold text-yellow-800 dark:text-yellow-200`}>
                              Available for Assignment
                            </h4>
                            <p className={`text-sm text-yellow-600 dark:text-yellow-300`}>
                              You have ${overview.unassignedPending.toLocaleString()} in pending payments that aren't assigned to any goals or bills
                            </p>
                          </div>
                          <div className={`text-2xl font-bold text-yellow-600 dark:text-yellow-400`}>
                            ${overview.unassignedPending.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recommendations</h3>
                    <div className="space-y-3">
                      {overview.netPosition < 0 && (
                        <div className={`p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800`}>
                          <p className={`text-sm font-medium text-red-800 dark:text-red-200`}>
                            ⚠️ You'll need ${Math.abs(overview.netPosition).toLocaleString()} more to meet all your financial obligations. Consider:
                          </p>
                          <ul className={`text-sm text-red-700 dark:text-red-300 mt-2 ml-4 list-disc`}>
                            <li>Seeking additional income sources</li>
                            <li>Prioritizing which goals or bills are most important</li>
                            <li>Negotiating payment terms with clients</li>
                          </ul>
                        </div>
                      )}
                      {overview.unassignedPending > 0 && (
                        <div className={`p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`}>
                          <p className={`text-sm font-medium text-blue-800 dark:text-blue-200`}>
                            💡 Consider assigning your ${overview.unassignedPending.toLocaleString()} in unassigned pending payments to specific goals or bills
                          </p>
                        </div>
                      )}
                      {overview.netPosition > 0 && (
                        <div className={`p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800`}>
                          <p className={`text-sm font-medium text-green-800 dark:text-green-200`}>
                            🎉 Great job! You'll have ${overview.netPosition.toLocaleString()} surplus after meeting all obligations
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className={`${
          darkMode 
            ? 'bg-gradient-to-r from-orange-600 to-orange-500' 
            : 'bg-gradient-to-r from-orange-500 to-orange-400'
        } rounded-2xl p-8 text-center text-white`}>
          <h3 className="text-2xl font-bold mb-2">Feel in control of your money</h3>
          <p className="text-orange-100 mb-4">without spreadsheets or shame</p>
          <p className="text-sm text-orange-100">
            Finally, a money app that doesn't make you want to throw your phone 📱
          </p>
        </div>
      </div>
    </div>
  );
};

export default FreelancerMoneyTracker;