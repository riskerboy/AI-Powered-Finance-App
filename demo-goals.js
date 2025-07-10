// Demo script to show goal bucket features in action
// Run this in the browser console to see how goal tracking works

const API_BASE_URL = 'http://localhost:8000';

// Demo goals with different progress levels
const demoGoals = [
  { name: 'Emergency Fund', target: 15000, current: 8500, deadline: '2025-12-31', color: 'bg-green-500' },
  { name: 'New Laptop', target: 2500, current: 1200, deadline: '2025-08-15', color: 'bg-blue-500' },
  { name: 'Vacation Fund', target: 5000, current: 2800, deadline: '2025-10-01', color: 'bg-purple-500' },
  { name: 'Home Down Payment', target: 50000, current: 15000, deadline: '2026-06-30', color: 'bg-pink-500' },
  { name: 'Car Maintenance', target: 2000, current: 2000, deadline: '2025-03-15', color: 'bg-yellow-500' }
];

// Function to demonstrate goal features
function demonstrateGoalFeatures() {
  console.log('🎯 Goal Bucket Features Demo');
  console.log('============================');
  
  demoGoals.forEach(goal => {
    const percentage = (goal.current / goal.target) * 100;
    const remaining = goal.target - goal.current;
    const daysUntilDeadline = goal.deadline ? 
      Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    console.log(`📊 ${goal.name}:`);
    console.log(`   Target: $${goal.target.toLocaleString()}`);
    console.log(`   Current: $${goal.current.toLocaleString()}`);
    console.log(`   Remaining: $${remaining.toLocaleString()}`);
    console.log(`   Progress: ${percentage.toFixed(1)}%`);
    if (daysUntilDeadline !== null) {
      console.log(`   Deadline: ${new Date(goal.deadline).toLocaleDateString()} (${daysUntilDeadline} days left)`);
    }
    console.log('');
  });
}

// Function to test goal status logic
function testGoalStatus() {
  console.log('🏷️ Goal Status Testing');
  console.log('======================');
  
  const testGoals = [
    { name: 'Completed Goal', current: 1000, target: 1000, deadline: '2025-12-31' },
    { name: 'On Track Goal', current: 800, target: 1000, deadline: '2025-12-31' },
    { name: 'Good Progress', current: 600, target: 1000, deadline: '2025-12-31' },
    { name: 'Getting Started', current: 200, target: 1000, deadline: '2025-12-31' },
    { name: 'Due Soon', current: 500, target: 1000, deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { name: 'Overdue', current: 300, target: 1000, deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
  ];
  
  testGoals.forEach(goal => {
    const percentage = (goal.current / goal.target) * 100;
    const daysUntilDeadline = goal.deadline ? 
      Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    let status, icon, color;
    if (percentage >= 100) {
      status = 'Completed';
      icon = '🎉';
      color = 'text-green-600';
    } else if (daysUntilDeadline !== null && daysUntilDeadline < 0) {
      status = 'Overdue';
      icon = '⚠️';
      color = 'text-red-600';
    } else if (daysUntilDeadline !== null && daysUntilDeadline <= 7) {
      status = 'Due Soon';
      icon = '⏰';
      color = 'text-orange-600';
    } else if (percentage >= 75) {
      status = 'On Track';
      icon = '🚀';
      color = 'text-blue-600';
    } else if (percentage >= 50) {
      status = 'Good Progress';
      icon = '📈';
      color = 'text-yellow-600';
    } else {
      status = 'Getting Started';
      icon = '🌱';
      color = 'text-gray-600';
    }
    
    console.log(`${icon} ${goal.name}: ${status} (${percentage.toFixed(1)}%)`);
  });
}

// Function to show progress bar colors
function showProgressBarColors() {
  console.log('🎨 Progress Bar Color Logic');
  console.log('===========================');
  
  const testPercentages = [0, 10, 25, 50, 75, 100];
  
  testPercentages.forEach(percentage => {
    let color;
    if (percentage >= 100) color = 'bg-green-500';
    else if (percentage >= 75) color = 'bg-blue-500';
    else if (percentage >= 50) color = 'bg-yellow-500';
    else if (percentage >= 25) color = 'bg-orange-500';
    else color = 'bg-red-500';
    
    console.log(`${percentage}% → ${color}`);
  });
}

// Function to calculate goal summary
function calculateGoalSummary() {
  console.log('📊 Goal Summary Calculation');
  console.log('===========================');
  
  const totalGoals = demoGoals.length;
  const totalTarget = demoGoals.reduce((sum, goal) => sum + goal.target, 0);
  const totalCurrent = demoGoals.reduce((sum, goal) => sum + goal.current, 0);
  const totalRemaining = totalTarget - totalCurrent;
  const completedGoals = demoGoals.filter(goal => (goal.current / goal.target) * 100 >= 100).length;
  
  console.log(`Total Goals: ${totalGoals}`);
  console.log(`Total Target: $${totalTarget.toLocaleString()}`);
  console.log(`Total Saved: $${totalCurrent.toLocaleString()}`);
  console.log(`Still Needed: $${totalRemaining.toLocaleString()}`);
  console.log(`Completed Goals: ${completedGoals}`);
  console.log(`Overall Progress: ${((totalCurrent / totalTarget) * 100).toFixed(1)}%`);
}

// Function to test money assignment
function testMoneyAssignment() {
  console.log('💰 Money Assignment Testing');
  console.log('===========================');
  
  const testAssignments = [
    { goalName: 'Emergency Fund', amount: 1000 },
    { goalName: 'New Laptop', amount: 500 },
    { goalName: 'Vacation Fund', amount: 200 }
  ];
  
  testAssignments.forEach(assignment => {
    const goal = demoGoals.find(g => g.name === assignment.goalName);
    if (goal) {
      const newCurrent = goal.current + assignment.amount;
      const newPercentage = (newCurrent / goal.target) * 100;
      const remaining = goal.target - newCurrent;
      
      console.log(`Adding $${assignment.amount} to ${goal.name}:`);
      console.log(`  Before: $${goal.current.toLocaleString()} (${(goal.current / goal.target * 100).toFixed(1)}%)`);
      console.log(`  After: $${newCurrent.toLocaleString()} (${newPercentage.toFixed(1)}%)`);
      console.log(`  Remaining: $${remaining.toLocaleString()}`);
      console.log('');
    }
  });
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
  window.demonstrateGoalFeatures = demonstrateGoalFeatures;
  window.testGoalStatus = testGoalStatus;
  window.showProgressBarColors = showProgressBarColors;
  window.calculateGoalSummary = calculateGoalSummary;
  window.testMoneyAssignment = testMoneyAssignment;
  
  console.log('🎯 Goal Bucket Demo Functions Available:');
  console.log('- demonstrateGoalFeatures() - Show goal examples');
  console.log('- testGoalStatus() - Test goal status logic');
  console.log('- showProgressBarColors() - Show progress bar colors');
  console.log('- calculateGoalSummary() - Calculate goal summary');
  console.log('- testMoneyAssignment() - Test money assignment');
  
  // Auto-run demo
  demonstrateGoalFeatures();
  testGoalStatus();
  showProgressBarColors();
  calculateGoalSummary();
  testMoneyAssignment();
} 