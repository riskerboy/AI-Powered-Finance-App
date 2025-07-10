// Test script to populate the database with sample data
// Run this in the browser console or create a simple HTML file to test

const API_BASE_URL = 'http://localhost:8000';

// Sample data to test all dashboard features
const sampleData = {
  income: [
    { amount: 2500, date: '2025-01-15', client: 'WebCorp', category: 'Loan' },
    { amount: 1800, date: '2025-01-10', client: 'StartupXYZ', category: 'Savings' },
    { amount: 3200, date: '2025-01-05', client: 'TechFlow', category: 'Loan' },
    { amount: 1500, date: '2025-01-20', client: 'DesignStudio', category: 'Rent' },
    { amount: 900, date: '2025-01-25', client: 'MarketingAgency', category: 'Savings' },
    { amount: 2100, date: '2025-01-30', client: 'ConsultingFirm', category: 'Rent' }
  ],
  goals: [
    { name: 'Emergency Fund', target: 15000, current: 8500, deadline: '2025-12-31', color: 'bg-green-500' },
    { name: 'New Laptop', target: 2500, current: 1200, deadline: '2025-08-15', color: 'bg-blue-500' },
    { name: 'Vacation Fund', target: 5000, current: 2800, deadline: '2025-10-01', color: 'bg-purple-500' },
    { name: 'Home Down Payment', target: 50000, current: 15000, deadline: '2026-06-30', color: 'bg-pink-500' },
    { name: 'Car Maintenance', target: 2000, current: 2000, deadline: '2025-03-15', color: 'bg-yellow-500' }
  ],
  pendingPayments: [
    { client: 'DesignCo', amount: 4200, due_date: '2025-01-25' },
    { client: 'MediaHub', amount: 1800, due_date: '2025-01-30' }
  ],
  bills: [
    { name: 'Rent', amount: 1200, due_date: 15 },
    { name: 'Utilities', amount: 300, due_date: 20 },
    { name: 'Phone', amount: 80, due_date: 5 },
    { name: 'Internet', amount: 60, due_date: 10 }
  ]
};

// Function to populate the database
async function populateTestData() {
  console.log('Starting to populate test data...');
  
  try {
    // Add income entries
    for (const income of sampleData.income) {
      const response = await fetch(`${API_BASE_URL}/income`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(income)
      });
      if (response.ok) {
        console.log('✅ Added income:', income);
      }
    }

    // Add goals
    for (const goal of sampleData.goals) {
      const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      if (response.ok) {
        console.log('✅ Added goal:', goal);
      }
    }

    // Add pending payments
    for (const payment of sampleData.pendingPayments) {
      const response = await fetch(`${API_BASE_URL}/pending-payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment)
      });
      if (response.ok) {
        console.log('✅ Added pending payment:', payment);
      }
    }

    // Add bills
    for (const bill of sampleData.bills) {
      const response = await fetch(`${API_BASE_URL}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bill)
      });
      if (response.ok) {
        console.log('✅ Added bill:', bill);
      }
    }

    console.log('🎉 Test data populated successfully!');
    console.log('Refresh your app to see the data.');
    
  } catch (error) {
    console.error('❌ Error populating test data:', error);
  }
}

// Function to clear all data
async function clearAllData() {
  console.log('Clearing all data...');
  
  try {
    const endpoints = ['income', 'goals', 'pending-payments', 'bills'];
    
    for (const endpoint of endpoints) {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`);
      if (response.ok) {
        const items = await response.json();
        for (const item of items) {
          await fetch(`${API_BASE_URL}/${endpoint}/${item.id}`, {
            method: 'DELETE'
          });
        }
      }
    }
    
    console.log('✅ All data cleared!');
    console.log('Refresh your app to see the changes.');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
  window.populateTestData = populateTestData;
  window.clearAllData = clearAllData;
  console.log('Test functions available:');
  console.log('- populateTestData() - Add sample data');
  console.log('- clearAllData() - Clear all data');
} 