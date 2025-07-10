// Demo script to show income allocation rules in action
// Run this in the browser console to see how allocation rules work

const API_BASE_URL = 'http://localhost:8000';

// Demo allocation rules
const demoRules = [
  { name: 'Loan', days: '1-15', percentage: 50, color: 'bg-red-500' },
  { name: 'Rent', days: '16-31', percentage: 30, color: 'bg-blue-500' },
  { name: 'Savings', days: '1-31', percentage: 20, color: 'bg-green-500' }
];

// Function to demonstrate allocation rules
function demonstrateAllocationRules() {
  console.log('🎯 Income Allocation Rules Demo');
  console.log('================================');
  
  demoRules.forEach(rule => {
    console.log(`📅 ${rule.name}: Days ${rule.days} (${rule.percentage}%) - ${rule.color}`);
  });
  
  console.log('\n📝 How it works:');
  console.log('- When you add income and leave category empty, the system checks the date');
  console.log('- If the day falls within a rule\'s range, it auto-categorizes the income');
  console.log('- Example: Income on January 10th → Loan (days 1-15)');
  console.log('- Example: Income on January 25th → Rent (days 16-31)');
  
  console.log('\n🧪 Test it:');
  console.log('1. Go to Income tab');
  console.log('2. Click "Add Income"');
  console.log('3. Enter amount and date');
  console.log('4. Leave category as "Auto-categorize"');
  console.log('5. Submit and see the magic! ✨');
}

// Function to test allocation with sample dates
function testAllocationWithDates() {
  console.log('\n📅 Testing Allocation with Sample Dates');
  console.log('=======================================');
  
  const testDates = [
    { date: '2025-01-05', expected: 'Loan' },
    { date: '2025-01-15', expected: 'Loan' },
    { date: '2025-01-20', expected: 'Rent' },
    { date: '2025-01-30', expected: 'Rent' }
  ];
  
  testDates.forEach(test => {
    const dayOfMonth = new Date(test.date).getDate();
    const applicableRule = demoRules.find(rule => {
      const [start, end] = rule.days.split('-').map(Number);
      return dayOfMonth >= start && dayOfMonth <= end;
    });
    
    const category = applicableRule ? applicableRule.name : 'General';
    const status = category === test.expected ? '✅' : '❌';
    
    console.log(`${status} ${test.date} (Day ${dayOfMonth}) → ${category}`);
  });
}

// Function to show income summary
function showIncomeSummary() {
  console.log('\n💰 Income Summary Demo');
  console.log('======================');
  
  const sampleIncome = [
    { amount: 2500, date: '2025-01-15', category: 'Loan' },
    { amount: 1800, date: '2025-01-10', category: 'Savings' },
    { amount: 3200, date: '2025-01-05', category: 'Loan' },
    { amount: 1500, date: '2025-01-20', category: 'Rent' },
    { amount: 900, date: '2025-01-25', category: 'Savings' },
    { amount: 2100, date: '2025-01-30', category: 'Rent' }
  ];
  
  const totalIncome = sampleIncome.reduce((sum, income) => sum + income.amount, 0);
  const currentMonthIncome = sampleIncome.reduce((sum, income) => {
    const incomeDate = new Date(income.date);
    const currentDate = new Date();
    if (incomeDate.getMonth() === currentDate.getMonth() && 
        incomeDate.getFullYear() === currentDate.getFullYear()) {
      return sum + income.amount;
    }
    return sum;
  }, 0);
  
  const categoryBreakdown = sampleIncome.reduce((acc, income) => {
    acc[income.category] = (acc[income.category] || 0) + income.amount;
    return acc;
  }, {});
  
  console.log(`📊 Total Income: $${totalIncome.toLocaleString()}`);
  console.log(`📅 This Month: $${currentMonthIncome.toLocaleString()}`);
  console.log(`📝 Total Entries: ${sampleIncome.length}`);
  console.log(`📈 Daily Average: $${(currentMonthIncome / Math.max(1, new Date().getDate())).toFixed(0)}`);
  
  console.log('\n🏷️ Category Breakdown:');
  Object.entries(categoryBreakdown).forEach(([category, amount]) => {
    const percentage = ((amount / totalIncome) * 100).toFixed(1);
    console.log(`  ${category}: $${amount.toLocaleString()} (${percentage}%)`);
  });
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
  window.demonstrateAllocationRules = demonstrateAllocationRules;
  window.testAllocationWithDates = testAllocationWithDates;
  window.showIncomeSummary = showIncomeSummary;
  
  console.log('🎯 Income Allocation Demo Functions Available:');
  console.log('- demonstrateAllocationRules() - Show how rules work');
  console.log('- testAllocationWithDates() - Test with sample dates');
  console.log('- showIncomeSummary() - Show income analytics');
  
  // Auto-run demo
  demonstrateAllocationRules();
  testAllocationWithDates();
  showIncomeSummary();
} 