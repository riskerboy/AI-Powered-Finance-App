import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, Users, CreditCard, Target, Edit2, Trash2, Check, X, Home, DollarSign, Plus as PlusIcon, Sparkles } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

// Enhanced interfaces
interface Transaction {
  id: number;
  amount: number;
  date: string;
  category: string;
  note: string;
  type: 'income' | 'expense';
  client?: string;
}

interface Goal {
  id: number;
  name: string;
  target: number;
  current: number;
  deadline?: string;
  color: string;
}

interface DataState {
  transactions: Transaction[];
  goals: Goal[];
}

// Move AddTransactionModal outside the main component
interface AddTransactionModalProps {
  newTransaction: {
    amount: string;
    category: string;
    note: string;
    type: 'income' | 'expense';
    client: string;
  };
  setNewTransaction: (updater: any) => void;
  onClose: () => void;
  onAdd: () => void;
  categories: any[];
  expenseCategories: any[];
}

const AddTransactionModal = ({ 
  newTransaction, 
  setNewTransaction, 
  onClose, 
  onAdd, 
  categories, 
  expenseCategories 
}: AddTransactionModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Add Transaction</h3>
          <button 
            onClick={onClose}
            className="text-white opacity-70 hover:opacity-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Transaction Type Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <span className="text-white">Expense</span>
            <div 
              className={`w-16 h-8 rounded-full transition-all duration-300 cursor-pointer ${
                newTransaction.type === 'income' ? 'bg-green-500' : 'bg-gray-400'
              }`}
              onClick={() => setNewTransaction(prev => ({ ...prev, type: prev.type === 'income' ? 'expense' : 'income' }))}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ${
                newTransaction.type === 'income' ? 'translate-x-8' : 'translate-x-1'
              }`}></div>
            </div>
            <span className="text-white">Income</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount</label>
            <input 
              type="number" 
              className="glass-input" 
              placeholder="Enter amount"
              value={newTransaction.amount}
              onChange={e => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
            />
          </div>
          
          {newTransaction.type === 'income' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Client</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Client name"
                value={newTransaction.client}
                onChange={e => setNewTransaction(prev => ({ ...prev, client: e.target.value }))}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Category</label>
            <select 
              className="glass-input"
              value={newTransaction.category}
              onChange={e => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Select category</option>
              {(newTransaction.type === 'income' ? categories : expenseCategories).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="What's this for?"
              value={newTransaction.note}
              onChange={e => setNewTransaction(prev => ({ ...prev, note: e.target.value }))}
            />
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button 
              className="flex-1 gradient-btn"
              onClick={onAdd}
            >
              Add {newTransaction.type === 'income' ? 'Income' : 'Expense'}
            </button>
            <button 
              className="flex-1 glass-btn"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FriendlyExpenseTracker = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DataState>({
    transactions: [],
    goals: []
  });

  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: '',
    note: '',
    type: 'expense' as 'income' | 'expense',
    client: ''
  });
  
  const [newGoal, setNewGoal] = useState({ 
    name: '', 
    target: '', 
    deadline: '' 
  });
  
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [aiAnalysis, setAIAnalysis] = useState<string | null>(null);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);

  // Enhanced categories
  const categories = [
    { id: 'design', name: 'Design', icon: '🎨', color: 'bg-purple-100 text-purple-700' },
    { id: 'development', name: 'Development', icon: '💻', color: 'bg-blue-100 text-blue-700' },
    { id: 'writing', name: 'Writing', icon: '✍️', color: 'bg-green-100 text-green-700' },
    { id: 'marketing', name: 'Marketing', icon: '📢', color: 'bg-orange-100 text-orange-700' },
    { id: 'consulting', name: 'Consulting', icon: '💼', color: 'bg-indigo-100 text-indigo-700' },
    { id: 'other', name: 'Other', icon: '💰', color: 'bg-gray-100 text-gray-700' }
  ];

  const expenseCategories = [
    { id: 'software', name: 'Software', icon: '🖥️', color: 'bg-red-100 text-red-700' },
    { id: 'equipment', name: 'Equipment', icon: '🖱️', color: 'bg-orange-100 text-orange-700' },
    { id: 'marketing', name: 'Marketing', icon: '📢', color: 'bg-blue-100 text-blue-700' },
    { id: 'office', name: 'Office', icon: '🏢', color: 'bg-green-100 text-green-700' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: 'bg-purple-100 text-purple-700' },
    { id: 'other', name: 'Other', icon: '💸', color: 'bg-gray-100 text-gray-700' }
  ];



  // Load data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, goalsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/income`),
        fetch(`${API_BASE_URL}/goals`)
      ]);

      const allTransactions: Transaction[] = await transactionsRes.json();
      const goals: Goal[] = await goalsRes.json();

      setData({ transactions: allTransactions, goals });
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to demo data if API is not available
      setData({
        transactions: [
          { id: 1, amount: 2500, date: '2024-01-15', category: 'design', note: 'Website Design - TechCorp', type: 'income', client: 'TechCorp' },
          { id: 2, amount: 52.99, date: '2024-01-14', category: 'software', note: 'Adobe Creative Suite', type: 'expense' },
          { id: 3, amount: 800, date: '2024-01-12', category: 'design', note: 'Logo Design - StartupXYZ', type: 'income', client: 'StartupXYZ' },
          { id: 4, amount: 459, date: '2024-01-10', category: 'equipment', note: 'New Monitor - Dell', type: 'expense' },
          { id: 5, amount: 1200, date: '2024-01-08', category: 'design', note: 'Brand Identity - RetailCo', type: 'income', client: 'RetailCo' }
        ],
        goals: [
          { id: 1, name: 'New MacBook Pro', target: 3000, current: 2500, color: '#4CAF50' },
          { id: 2, name: 'Vacation Fund', target: 5000, current: 3200, color: '#2196F3' },
          { id: 3, name: 'Emergency Fund', target: 10000, current: 8500, color: '#FF9800' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async () => {
    // Validate required fields
    if (!newTransaction.amount || !newTransaction.category) {
      alert('Please fill in all required fields (Amount and Category)');
      return;
    }
    
    if (parseFloat(newTransaction.amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }
    
    if (newTransaction.type === 'income' && !newTransaction.client) {
      alert('Please enter a client name for income transactions');
      return;
    }
      try {
        const transactionData = {
          amount: parseFloat(newTransaction.amount),
          date: new Date().toISOString().split('T')[0],
          category: newTransaction.category,
          note: newTransaction.note,
          type: newTransaction.type,
          client: newTransaction.type === 'income' ? newTransaction.client : undefined
        };

        // Send all transactions to the /income endpoint with type field
        const response = await fetch(`${API_BASE_URL}/income`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData),
        });

        if (response.ok) {
          // Reset form and close modal
          setNewTransaction({ amount: '', category: '', note: '', type: 'expense', client: '' });
          setShowAddTransaction(false);
          await loadData();
          alert('Transaction added successfully!');
        } else {
          console.error('Failed to add transaction:', response.statusText);
          alert('Failed to add transaction. Please try again.');
        }
      } catch (error) {
        console.error('Error adding transaction:', error);
        // Add to local state if API fails
        const newId = Math.max(...data.transactions.map(t => t.id), 0) + 1;
        const newTransactionData: Transaction = {
          id: newId,
          amount: parseFloat(newTransaction.amount),
          date: new Date().toISOString().split('T')[0],
          category: newTransaction.category,
          note: newTransaction.note,
          type: newTransaction.type,
          client: newTransaction.type === 'income' ? newTransaction.client : undefined
        };
        
        setData(prev => ({
          ...prev,
          transactions: [newTransactionData, ...prev.transactions]
        }));
        setNewTransaction({ amount: '', category: '', note: '', type: 'expense', client: '' });
        setShowAddTransaction(false);
      }
  };

  const addGoal = async () => {
    if (newGoal.name && newGoal.target) {
      try {
        const goalData = {
          name: newGoal.name,
          target: parseFloat(newGoal.target),
          current: 0,
          deadline: newGoal.deadline || null,
          color: '#4CAF50'
        };

        const response = await fetch(`${API_BASE_URL}/goals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goalData),
        });

        if (response.ok) {
          setNewGoal({ name: '', target: '', deadline: '' });
          setShowAddGoal(false);
          await loadData();
        } else {
          console.error('Failed to add goal:', response.statusText);
        }
      } catch (error) {
        console.error('Error adding goal:', error);
        // Add to local state if API fails
        const newId = Math.max(...data.goals.map(g => g.id), 0) + 1;
        const newGoalData: Goal = {
          id: newId,
          name: newGoal.name,
          target: parseFloat(newGoal.target),
          current: 0,
          deadline: newGoal.deadline || undefined,
          color: '#4CAF50'
        };
        
        setData(prev => ({
          ...prev,
          goals: [...prev.goals, newGoalData]
        }));
        setNewGoal({ name: '', target: '', deadline: '' });
        setShowAddGoal(false);
      }
    }
  };

  const updateGoalProgress = async (goalId: number, amount: number) => {
    try {
      const goal = data.goals.find(g => g.id === goalId);
      if (!goal) return;

      const updatedGoal = { ...goal, current: Math.min(goal.current + amount, goal.target) };
      
      const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGoal),
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      // Update local state if API fails
      setData(prev => ({
        ...prev,
        goals: prev.goals.map(g => 
          g.id === goalId 
            ? { ...g, current: Math.min(g.current + amount, g.target) }
            : g
        )
      }));
    }
  };

  const deleteGoal = async (goalId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      // Remove from local state if API fails
      setData(prev => ({
        ...prev,
        goals: prev.goals.filter(g => g.id !== goalId)
      }));
    }
  };

  // Calculate insights
  const income = data.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = income - expenses;

  const thisMonthIncome = data.transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const currentDate = new Date();
      return t.type === 'income' && 
             transactionDate.getMonth() === currentDate.getMonth() && 
             transactionDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthExpenses = data.transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const currentDate = new Date();
      return t.type === 'expense' && 
             transactionDate.getMonth() === currentDate.getMonth() && 
             transactionDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGoalsTarget = data.goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalGoalsCurrent = data.goals.reduce((sum, goal) => sum + goal.current, 0);

  // Helper: Get current month transactions
  const getCurrentMonthTransactions = () => {
    const now = new Date();
    return data.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  };

  // Helper: Get top categories for current month
  const getTopCategories = () => {
    const txns = getCurrentMonthTransactions();
    const catTotals: Record<string, number> = {};
    txns.forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });
    return Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, amt]) => `${cat} $${amt.toFixed(2)}`);
  };

  // Helper: Get goals summary
  const getGoalsSummary = () => {
    return data.goals.map(g => `${g.name}: $${g.current.toFixed(2)}/$${g.target.toFixed(2)}`);
  };

  // AI Analysis Handler
  const handleAIAnalysis = async () => {
    setAILoading(true);
    setAIError(null);
    setAIAnalysis(null);
    try {
      const txns = getCurrentMonthTransactions();
      const income = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const top_categories = getTopCategories();
      const goals = getGoalsSummary();
      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income, expenses, top_categories, goals })
      });
      if (!res.ok) throw new Error('AI analysis failed');
      const data = await res.json();
      setAIAnalysis(data.analysis);
    } catch (e: any) {
      setAIError(e.message || 'Something went wrong');
    } finally {
      setAILoading(false);
    }
  };

  // Header Component
  const Header = () => (
    <div className="glass-card p-8 mb-8">
      <h1 className="text-4xl font-bold mb-2 text-white">Freelancer Finance Tracker</h1>
      <p className="text-xl opacity-90">Track your income, expenses, and financial growth with style</p>
    </div>
  );

  // Stats Grid
  const StatsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="glass-card glass-card-hover p-6 text-center">
        <div className="text-3xl font-bold mb-2 text-white">${income.toFixed(0)}</div>
        <div className="text-lg opacity-90">Total Income</div>
        <div className="text-sm text-green-300 mt-2">+15.2% from last month</div>
      </div>
      
      <div className="glass-card glass-card-hover p-6 text-center">
        <div className="text-3xl font-bold mb-2 text-white">${expenses.toFixed(0)}</div>
        <div className="text-lg opacity-90">Total Expenses</div>
        <div className="text-sm text-red-300 mt-2">+8.1% from last month</div>
      </div>
      
      <div className="glass-card glass-card-hover p-6 text-center">
        <div className="text-3xl font-bold mb-2 text-white">${netProfit.toFixed(0)}</div>
        <div className="text-lg opacity-90">Net Profit</div>
        <div className="text-sm text-green-300 mt-2">+22.3% from last month</div>
      </div>
      
      <div className="glass-card glass-card-hover p-6 text-center">
        <div className="text-3xl font-bold mb-2 text-white">{data.goals.length}</div>
        <div className="text-lg opacity-90">Active Goals</div>
        <div className="text-sm text-blue-300 mt-2">+2 new goals</div>
      </div>
    </div>
  );

  // Add Goal Modal
  const AddGoalModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Add Goal</h3>
          <button 
            onClick={() => setShowAddGoal(false)}
            className="text-white opacity-70 hover:opacity-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Goal Name</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="e.g., New MacBook Pro"
              value={newGoal.name}
              onChange={e => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Target Amount</label>
            <input 
              type="number" 
              className="glass-input" 
              placeholder="0.00"
              value={newGoal.target}
              onChange={e => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Deadline (Optional)</label>
            <input 
              type="date" 
              className="glass-input" 
              value={newGoal.deadline}
              onChange={e => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
            />
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button 
              className="flex-1 gradient-btn"
              onClick={addGoal}
            >
              Add Goal
            </button>
            <button 
              className="flex-1 glass-btn"
              onClick={() => setShowAddGoal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // AI Insights Card
  const AIInsightsCard = () => (
    <div className="glass-card p-6 mb-8 flex flex-col items-start max-w-2xl mx-auto">
      <div className="flex items-center mb-2">
        <Sparkles className="w-6 h-6 text-yellow-300 mr-2" />
        <h2 className="text-xl font-bold text-white">AI Insights</h2>
      </div>
      <p className="text-white/80 mb-4">Let our friendly AI analyze your month and give you sweet, supportive feedback!</p>
      <button
        className="gradient-btn mb-4"
        onClick={handleAIAnalysis}
        disabled={aiLoading}
      >
        {aiLoading ? 'Analyzing...' : 'Get AI Analysis'}
      </button>
      {aiError && <div className="text-red-300 mb-2">{aiError}</div>}
      {aiAnalysis && (
        <div className="bg-white/10 rounded-lg p-4 mt-2 text-white/90 whitespace-pre-line" style={{minHeight: '80px'}}>
          {aiAnalysis}
        </div>
      )}
    </div>
  );

  // Main Content
  const MainContent = ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {children}
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="background-overlay"></div>
      
      <MainContent>
        <Header />
        <AIInsightsCard />
        <StatsGrid />
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white opacity-90">Loading your money story...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="glass-card p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
                  <button className="glass-btn">View All</button>
                </div>
                
                <div className="space-y-4">
                  {data.transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                      <div className={`transaction-icon ${transaction.type === 'income' ? 'income-icon' : 'expense-icon'}`}>
                        {transaction.type === 'income' 
                          ? categories.find(c => c.id === transaction.category)?.icon || '💰'
                          : expenseCategories.find(c => c.id === transaction.category)?.icon || '💸'
                        }
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {transaction.note}
                        </div>
                        <div className="text-sm opacity-70">
                          {new Date(transaction.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          {transaction.client && ` • ${transaction.client}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${transaction.type === 'income' ? 'text-green-300' : 'text-red-300'}`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </div>
                        <div className="text-sm opacity-70">
                          {transaction.type === 'income' 
                            ? categories.find(c => c.id === transaction.category)?.name
                            : expenseCategories.find(c => c.id === transaction.category)?.name
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10">
                  <div className="text-center opacity-60">📊 Income vs Expenses Chart</div>
                </div>
              </div>

              {/* Goals Section */}
              <div className="glass-card p-8 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Goals</h2>
                  <button 
                    className="glass-btn"
                    onClick={() => {
                      setNewGoal({ name: '', target: '', deadline: '' });
                      setShowAddGoal(true);
                    }}
                  >
                    Add Goal
                  </button>
                </div>
                
                <div className="space-y-4">
                  {data.goals.map((goal) => (
                    <div key={goal.id} className="glass-card p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{goal.name}</h3>
                          <p className="text-white opacity-70">Goal: ${goal.target.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-300">${goal.current.toFixed(2)}</p>
                          <p className="text-sm text-white opacity-70">Saved</p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-white bg-opacity-10 rounded-full h-3 mb-4">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-white opacity-70">
                          {goal.current >= goal.target 
                            ? "🎉 You've reached your goal!" 
                            : `${((goal.target - goal.current) / goal.target * 100).toFixed(0)}% remaining`
                          }
                        </p>
                        <button 
                          onClick={() => deleteGoal(goal.id)}
                          className="text-red-300 hover:text-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    className="w-full glass-btn text-left"
                    onClick={() => {
                      setNewTransaction({ amount: '', category: '', note: '', type: 'income', client: '' });
                      setShowAddTransaction(true);
                    }}
                  >
                    💰 Add Income
                  </button>
                  <button 
                    className="w-full glass-btn text-left"
                    onClick={() => {
                      setNewTransaction({ amount: '', category: '', note: '', type: 'expense', client: '' });
                      setShowAddTransaction(true);
                    }}
                  >
                    💸 Add Expense
                  </button>
                  <button className="w-full glass-btn text-left">📊 View Reports</button>
                  <button className="w-full glass-btn text-left">⚙️ Settings</button>
                </div>
              </div>

              {/* Monthly Summary */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">This Month</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white">Income</span>
                    <span className="text-green-300 font-bold">${thisMonthIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">Expenses</span>
                    <span className="text-red-300 font-bold">${thisMonthExpenses.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white border-opacity-20 pt-2">
                    <div className="flex justify-between">
                      <span className="text-white font-bold">Net</span>
                      <span className={`font-bold ${(thisMonthIncome - thisMonthExpenses) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        ${(thisMonthIncome - thisMonthExpenses).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals Progress */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Goals Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white">Total Saved</span>
                      <span className="text-white">${totalGoalsCurrent.toFixed(0)} / ${totalGoalsTarget.toFixed(0)}</span>
                    </div>
                    <div className="bg-white bg-opacity-10 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-300"
                        style={{ width: `${totalGoalsTarget > 0 ? Math.min((totalGoalsCurrent / totalGoalsTarget) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white">Progress</span>
                      <span className="text-white">
                        {totalGoalsTarget > 0 ? Math.round((totalGoalsCurrent / totalGoalsTarget) * 100) : 0}%
                      </span>
                    </div>
                    <div className="bg-white bg-opacity-10 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-pink-500 h-full transition-all duration-300"
                        style={{ width: `${totalGoalsTarget > 0 ? Math.min((totalGoalsCurrent / totalGoalsTarget) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </MainContent>

      {/* Floating Action Button */}
      <button 
        className="fab"
        onClick={() => {
          setNewTransaction({ amount: '', category: '', note: '', type: 'expense', client: '' });
          setShowAddTransaction(true);
        }}
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Modals */}
      {showAddTransaction && <AddTransactionModal 
        newTransaction={newTransaction} 
        setNewTransaction={setNewTransaction} 
        onClose={() => setShowAddTransaction(false)} 
        onAdd={addTransaction} 
        categories={categories} 
        expenseCategories={expenseCategories} 
      />}
      {showAddGoal && <AddGoalModal />}
    </div>
  );
};

export default FriendlyExpenseTracker;