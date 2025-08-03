# 💰 Freelancer Money Tracker

<img width="1129" height="658" alt="image" src="https://github.com/user-attachments/assets/a10a0980-459a-404c-abe1-2590f1cc6ef6" />
A beautiful, modern web application for freelancers to track their income, manage financial goals, and stay on top of their finances. Built with React, FastAPI, and Tailwind CSS.

## ✨ Features

<img width="2527" height="1302" alt="image" src="https://github.com/user-attachments/assets/1fcdbc1a-68e7-4686-902f-c98b63c90d3f" />

### 🎨 Beautiful Design
- **Peek-inspired UI**: Clean, modern interface with soft gradients and orange accents
- **Dark mode support**: Toggle between light and dark themes
- **Responsive design**: Works perfectly on desktop and mobile
- **Motivational messaging**: Encouraging financial mindset

### 💼 Core Functionality
- **Income Tracking**: Log and categorize your earnings
- **Financial Goals**: Set targets and track progress with visual progress bars
- **Client Payments**: Manage pending payments and mark them as received
- **Bills Tracker**: Keep track of monthly recurring bills
- **Dashboard**: Overview of your financial health with key metrics

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Backend Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the FastAPI backend**:
   ```bash
   python main.py
   ```
   
   The backend will run on `http://localhost:8000`

### Frontend Setup

1. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

2. **Start the React development server**:
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:3000`

## 🛠 Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **Vite**: Fast build tool and dev server

### Backend
- **FastAPI**: Modern, fast web framework
- **SQLAlchemy**: Database ORM
- **SQLite**: Lightweight database
- **Pydantic**: Data validation

## 📊 API Endpoints

### Income
- `GET /income` - Get all income entries
- `POST /income` - Create new income entry
- `DELETE /income/{id}` - Delete income entry

### Goals
- `GET /goals` - Get all financial goals
- `POST /goals` - Create new goal
- `PUT /goals/{id}` - Update goal progress
- `DELETE /goals/{id}` - Delete goal

### Pending Payments
- `GET /pending-payments` - Get all pending payments
- `POST /pending-payments` - Create new pending payment
- `PUT /pending-payments/{id}/mark-received` - Mark payment as received
- `DELETE /pending-payments/{id}` - Delete pending payment

### Bills
- `GET /bills` - Get all bills
- `POST /bills` - Create new bill
- `PUT /bills/{id}/toggle` - Toggle bill paid status
- `DELETE /bills/{id}` - Delete bill

### Dashboard
- `GET /dashboard-stats` - Get aggregated statistics

## 🎯 Key Features Explained

### Dashboard
- **Total Income This Month**: Shows only income earned in the current month
- **Pending Payments**: Money owed to you from clients
- **Daily Target**: Calculated based on unpaid bills and goal progress, divided by days left in month
- **Progress Bars**: Visual representation of goal completion with percentage
- **Days Left**: Shows remaining days in the current month

### Income Tracking
- **Client Management**: Track income by client
- **Categories**: Organize income (Loan, Rent, Savings, etc.)
- **Date Tracking**: Record when payments were received
- **Monthly Filtering**: Dashboard only shows current month's income
- **Allocation Rules**: Automatic categorization based on day of month
- **Editable Entries**: Full CRUD operations (Create, Read, Update, Delete)
- **Income Summary**: Statistics and analytics for income tracking
- **Auto-categorization**: Smart rules for automatic income categorization

### Goals Management
- **Target Setting**: Define financial goals with deadlines
- **Progress Tracking**: Update current progress
- **Visual Feedback**: Color-coded progress bars with percentages
- **Daily Target Calculation**: Goals contribute to daily income targets
- **Money Assignment**: Add money directly to specific goals
- **Goal Status**: Real-time status tracking (Completed, On Track, Due Soon, etc.)
- **Deadline Tracking**: Countdown to goal deadlines with overdue alerts
- **Goal Summary**: Overview of all goals with completion statistics

### Bills Tracker
- **Recurring Bills**: Monthly bill management
- **Payment Status**: Mark bills as paid/unpaid
- **Due Date Tracking**: Never miss a payment
- **Daily Target Impact**: Unpaid bills affect daily income targets

## 🧪 Testing Your Dashboard Features

### Quick Test Setup
1. **Start your backend**: `python main.py`
2. **Start your frontend**: `npm run dev`
3. **Open browser console** at http://localhost:3000
4. **Run test script**: Copy and paste the contents of `test-data.js` into the console
5. **Populate test data**: Run `populateTestData()` in the console
6. **Refresh the page** to see all features working

### Verify Dashboard Features
✅ **Total Income This Month**: Should show $7,500 (sum of current month income)  
✅ **Pending Payments**: Should show $6,000 (sum of pending client payments)  
✅ **Progress Bars**: Each goal should show visual progress with percentage  
✅ **Daily Target**: Should calculate based on goals + unpaid bills ÷ days left  

### Test Data Included
- **3 Income entries** for current month
- **3 Financial goals** with different targets and deadlines
- **2 Pending payments** from clients
- **4 Monthly bills** (some paid, some unpaid)

## 💰 Income Tracking Features

### Manual Entry
- **Amount**: Enter the income amount
- **Date**: Select the date when income was received
- **Client Name**: Optional field for tracking income source
- **Category/Tag**: Choose from predefined categories or use auto-categorization

### Allocation Rules System
- **Day-based Rules**: Set rules like "Days 1-15 → Loan, Days 16-31 → Rent"
- **Custom Categories**: Create your own categories with custom colors
- **Percentage Tracking**: Set target percentages for each category
- **Auto-categorization**: Leave category empty to use allocation rules automatically

### Example Allocation Rules
- **Days 1-15**: 50% → Loan (Red)
- **Days 16-31**: 30% → Rent (Blue)  
- **All Month**: 20% → Savings (Green)

### Income Management
- **Edit Entries**: Click the edit button to modify any income entry
- **Delete Entries**: Remove unwanted entries with confirmation
- **Income Summary**: View statistics including:
  - Total income this month
  - All-time total income
  - Number of income entries
  - Daily average income

### Categories Available
- **Predefined**: General, Freelance, Investment, Bonus
- **Custom**: Create unlimited custom categories
- **Auto-assigned**: Based on allocation rules

## 🎯 Goal Bucket Features

### Multiple Financial Goals
- **Goal Name**: Descriptive name for your financial target
- **Amount Needed**: Total amount required to reach the goal
- **Deadline**: Optional target date for completion
- **Progress Tracking**: Real-time tracking of money assigned to each goal

### Money Assignment System
- **Direct Assignment**: Add money directly to specific goals
- **Progress Updates**: Real-time progress calculation
- **Visual Feedback**: See exactly how much is saved vs. needed
- **Remaining Amount**: Clear display of how much more is needed

### Progress Visualization
- **Colored Progress Bars**: Dynamic colors based on completion percentage
  - 🟢 Green (100%): Completed
  - 🔵 Blue (75%+): On Track
  - 🟡 Yellow (50%+): Good Progress
  - 🟠 Orange (25%+): Getting Started
  - 🔴 Red (<25%): Needs Attention
- **Percentage Display**: Exact completion percentage shown
- **Progress Text**: Current amount / Target amount display

### Goal Status Tracking
- **🎉 Completed**: Goal is 100% funded
- **🚀 On Track**: 75%+ complete and on schedule
- **📈 Good Progress**: 50%+ complete
- **🌱 Getting Started**: Less than 50% complete
- **⏰ Due Soon**: Deadline within 7 days
- **⚠️ Overdue**: Past the deadline

### Goal Management
- **Edit Goals**: Modify name, target amount, or deadline
- **Delete Goals**: Remove completed or unwanted goals
- **Goal Summary**: Overview statistics including:
  - Total number of goals
  - Total amount saved across all goals
  - Total amount still needed
  - Number of completed goals

### Example Goals
- **Emergency Fund**: $15,000 target, $8,500 saved (56.7%)
- **New Laptop**: $2,500 target, $1,200 saved (48%)
- **Vacation Fund**: $5,000 target, $2,800 saved (56%)
- **Home Down Payment**: $50,000 target, $15,000 saved (30%)

## 🔧 Development

### Project Structure
# 💰 Freelancer Money Tracker

A beautiful, modern web application for freelancers to track their income, manage financial goals, and stay on top of their finances. Built with React, FastAPI, and Tailwind CSS.

## ✨ Features

### 🎨 Beautiful Design
- **Peek-inspired UI**: Clean, modern interface with soft gradients and orange accents
- **Dark mode support**: Toggle between light and dark themes
- **Responsive design**: Works perfectly on desktop and mobile
- **Motivational messaging**: Encouraging financial mindset

### 💼 Core Functionality
- **Income Tracking**: Log and categorize your earnings
- **Financial Goals**: Set targets and track progress with visual progress bars
- **Client Payments**: Manage pending payments and mark them as received
- **Bills Tracker**: Keep track of monthly recurring bills
- **Dashboard**: Overview of your financial health with key metrics

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Backend Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the FastAPI backend**:
   ```bash
   python main.py
   ```
   
   The backend will run on `http://localhost:8000`

### Frontend Setup

1. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

2. **Start the React development server**:
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:3000`

## 🛠 Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **Vite**: Fast build tool and dev server

### Backend
- **FastAPI**: Modern, fast web framework
- **SQLAlchemy**: Database ORM
- **SQLite**: Lightweight database
- **Pydantic**: Data validation

## 📊 API Endpoints

### Income
- `GET /income` - Get all income entries
- `POST /income` - Create new income entry
- `DELETE /income/{id}` - Delete income entry

### Goals
- `GET /goals` - Get all financial goals
- `POST /goals` - Create new goal
- `PUT /goals/{id}` - Update goal progress
- `DELETE /goals/{id}` - Delete goal

### Pending Payments
- `GET /pending-payments` - Get all pending payments
- `POST /pending-payments` - Create new pending payment
- `PUT /pending-payments/{id}/mark-received` - Mark payment as received
- `DELETE /pending-payments/{id}` - Delete pending payment

### Bills
- `GET /bills` - Get all bills
- `POST /bills` - Create new bill
- `PUT /bills/{id}/toggle` - Toggle bill paid status
- `DELETE /bills/{id}` - Delete bill

### Dashboard
- `GET /dashboard-stats` - Get aggregated statistics

## 🎯 Key Features Explained

### Dashboard
- **Total Income This Month**: Shows only income earned in the current month
- **Pending Payments**: Money owed to you from clients
- **Daily Target**: Calculated based on unpaid bills and goal progress, divided by days left in month
- **Progress Bars**: Visual representation of goal completion with percentage
- **Days Left**: Shows remaining days in the current month

### Income Tracking
- **Client Management**: Track income by client
- **Categories**: Organize income (Loan, Rent, Savings, etc.)
- **Date Tracking**: Record when payments were received
- **Monthly Filtering**: Dashboard only shows current month's income
- **Allocation Rules**: Automatic categorization based on day of month
- **Editable Entries**: Full CRUD operations (Create, Read, Update, Delete)
- **Income Summary**: Statistics and analytics for income tracking
- **Auto-categorization**: Smart rules for automatic income categorization

### Goals Management
- **Target Setting**: Define financial goals with deadlines
- **Progress Tracking**: Update current progress
- **Visual Feedback**: Color-coded progress bars with percentages
- **Daily Target Calculation**: Goals contribute to daily income targets
- **Money Assignment**: Add money directly to specific goals
- **Goal Status**: Real-time status tracking (Completed, On Track, Due Soon, etc.)
- **Deadline Tracking**: Countdown to goal deadlines with overdue alerts
- **Goal Summary**: Overview of all goals with completion statistics

### Bills Tracker
- **Recurring Bills**: Monthly bill management
- **Payment Status**: Mark bills as paid/unpaid
- **Due Date Tracking**: Never miss a payment
- **Daily Target Impact**: Unpaid bills affect daily income targets

## 🧪 Testing Your Dashboard Features

### Quick Test Setup
1. **Start your backend**: `python main.py`
2. **Start your frontend**: `npm run dev`
3. **Open browser console** at http://localhost:3000
4. **Run test script**: Copy and paste the contents of `test-data.js` into the console
5. **Populate test data**: Run `populateTestData()` in the console
6. **Refresh the page** to see all features working

### Verify Dashboard Features
✅ **Total Income This Month**: Should show $7,500 (sum of current month income)  
✅ **Pending Payments**: Should show $6,000 (sum of pending client payments)  
✅ **Progress Bars**: Each goal should show visual progress with percentage  
✅ **Daily Target**: Should calculate based on goals + unpaid bills ÷ days left  

### Test Data Included
- **3 Income entries** for current month
- **3 Financial goals** with different targets and deadlines
- **2 Pending payments** from clients
- **4 Monthly bills** (some paid, some unpaid)

## 💰 Income Tracking Features

### Manual Entry
- **Amount**: Enter the income amount
- **Date**: Select the date when income was received
- **Client Name**: Optional field for tracking income source
- **Category/Tag**: Choose from predefined categories or use auto-categorization

### Allocation Rules System
- **Day-based Rules**: Set rules like "Days 1-15 → Loan, Days 16-31 → Rent"
- **Custom Categories**: Create your own categories with custom colors
- **Percentage Tracking**: Set target percentages for each category
- **Auto-categorization**: Leave category empty to use allocation rules automatically

### Example Allocation Rules
- **Days 1-15**: 50% → Loan (Red)
- **Days 16-31**: 30% → Rent (Blue)  
- **All Month**: 20% → Savings (Green)

### Income Management
- **Edit Entries**: Click the edit button to modify any income entry
- **Delete Entries**: Remove unwanted entries with confirmation
- **Income Summary**: View statistics including:
  - Total income this month
  - All-time total income
  - Number of income entries
  - Daily average income

### Categories Available
- **Predefined**: General, Freelance, Investment, Bonus
- **Custom**: Create unlimited custom categories
- **Auto-assigned**: Based on allocation rules

## 🔧 Development

### Project Structure
```
