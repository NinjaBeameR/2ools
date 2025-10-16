import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, Download, Trash2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ExpenseTracker() {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

  useEffect(() => {
    const saved = localStorage.getItem('mura-expenses');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mura-expenses', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    if (!amount || !category) {
      alert('Please fill in all fields');
      return;
    }

    const transaction = {
      id: Date.now(),
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
    };

    setTransactions([transaction, ...transactions]);
    setAmount('');
    setCategory('');
    setDescription('');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = {
    labels: Object.keys(expenseByCategory),
    datasets: [{
      data: Object.values(expenseByCategory),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384'
      ],
    }]
  };

  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.substring(0, 7);
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      acc[month].income += t.amount;
    } else {
      acc[month].expense += t.amount;
    }
    return acc;
  }, {});

  const barData = {
    labels: Object.keys(monthlyData).sort().slice(-6),
    datasets: [
      {
        label: 'Income',
        data: Object.keys(monthlyData).sort().slice(-6).map(m => monthlyData[m].income),
        backgroundColor: '#10B981',
      },
      {
        label: 'Expense',
        data: Object.keys(monthlyData).sort().slice(-6).map(m => monthlyData[m].expense),
        backgroundColor: '#EF4444',
      }
    ]
  };

  const exportData = () => {
    const csv = [
      ['Date', 'Type', 'Category', 'Amount', 'Description'],
      ...transactions.map(t => [t.date, t.type, t.category, t.amount, t.description])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-tracker-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50 overflow-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Expense Tracker</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          icon={<TrendingUp />}
          label="Total Income"
          value={totalIncome}
          color="green"
        />
        <SummaryCard
          icon={<TrendingDown />}
          label="Total Expense"
          value={totalExpense}
          color="red"
        />
        <SummaryCard
          icon={<DollarSign />}
          label="Balance"
          value={balance}
          color={balance >= 0 ? 'blue' : 'red'}
        />
      </div>

      {/* Add Transaction */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCategory('');
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              {(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addTransaction}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List - NOW AT TOP */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <div className="flex gap-2">
            {transactions.length > 0 && (
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Download size={16} />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 mb-2">No transactions yet</p>
            <p className="text-gray-500 text-sm">Add your first transaction above to get started!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-auto">
            <p className="text-sm text-gray-600 mb-4">
              Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </p>
            {transactions.map(transaction => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition-all hover:shadow-md ${
                  transaction.type === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                    <span className="font-medium text-gray-700">{transaction.category}</span>
                    {transaction.description && (
                      <span className="text-gray-500 text-sm">• {transaction.description}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{transaction.date}</span>
                </div>
                <button
                  onClick={() => deleteTransaction(transaction.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Delete transaction"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts - NOW BELOW, COLLAPSIBLE */}
      {transactions.length > 0 && (
        <details className="bg-white rounded-lg shadow-lg mb-6" open>
          <summary className="p-6 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <PieChart size={24} />
              Visual Analytics
            </h2>
            <span className="text-sm text-gray-500">Click to expand/collapse</span>
          </summary>
          
          <div className="p-6 pt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
              {Object.keys(expenseByCategory).length > 0 ? (
                <Pie data={pieData} />
              ) : (
                <p className="text-gray-400 text-center py-12">No expenses yet</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Monthly Overview</h3>
              {Object.keys(monthlyData).length > 0 ? (
                <Bar data={barData} options={{ responsive: true }} />
              ) : (
                <p className="text-gray-400 text-center py-12">No data yet</p>
              )}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, color }) {
  const colors = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className={`${colors[color]} rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold">${value.toFixed(2)}</div>
    </div>
  );
}

export default ExpenseTracker;
