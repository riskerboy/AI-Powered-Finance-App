import sqlite3

try:
    conn = sqlite3.connect('freelancer.db')
    cursor = conn.cursor()
    
    # Add month column to bills table
    try:
        cursor.execute('ALTER TABLE bills ADD COLUMN month TEXT DEFAULT "2025-06"')
        print("Added month column to bills table")
    except Exception as e:
        if 'duplicate column name' in str(e):
            print("Month column already exists in bills table")
        else:
            print(f"Error with bills table: {e}")
    
    # Add goal_id column to pending_payments table
    try:
        cursor.execute('ALTER TABLE pending_payments ADD COLUMN goal_id INTEGER')
        print("Added goal_id column to pending_payments table")
    except Exception as e:
        if 'duplicate column name' in str(e):
            print("Goal_id column already exists in pending_payments table")
        else:
            print(f"Error with pending_payments table: {e}")
    
    # Add bill_id column to pending_payments table
    try:
        cursor.execute('ALTER TABLE pending_payments ADD COLUMN bill_id INTEGER')
        print("Added bill_id column to pending_payments table")
    except Exception as e:
        if 'duplicate column name' in str(e):
            print("Bill_id column already exists in pending_payments table")
        else:
            print(f"Error with pending_payments table: {e}")
    
    # Update existing bills to have the current month
    try:
        cursor.execute('UPDATE bills SET month = "2025-06" WHERE month IS NULL')
        print("Updated existing bills with current month")
    except Exception as e:
        print(f"Error updating bills: {e}")
    
    conn.commit()
    conn.close()
    print("Database update completed successfully")
    
except Exception as e:
    print(f"Error: {e}")
    if 'no such table' in str(e):
        print("Tables don't exist yet - they will be created when the app starts") 