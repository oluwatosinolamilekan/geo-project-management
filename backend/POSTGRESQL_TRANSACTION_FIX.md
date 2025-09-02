# PostgreSQL Transaction Abort Fix

## Issue Description

The error `SQLSTATE[25P02]: In failed sql transaction: 7 ERROR: current transaction is aborted, commands ignored until end of transaction block` occurs when:

1. **Persistent Connections**: PostgreSQL persistent connections (`PDO::ATTR_PERSISTENT => true`) can retain transaction state between requests
2. **Transaction Abort**: When a SQL statement fails within a transaction, PostgreSQL aborts the entire transaction
3. **Connection Reuse**: Subsequent requests reuse the same connection with the aborted transaction state
4. **Query Failure**: Any new queries fail because the transaction is still in an aborted state

## Root Cause Analysis

The specific error in your case:
```sql
select exists(select * from "regions" where "name" = LEKAN) as "exists"
```

Shows that the value `LEKAN` is not properly quoted, which suggests:
- A previous query in the transaction failed due to a syntax error
- The transaction was aborted
- The connection was reused with the aborted transaction state
- The new query failed because PostgreSQL ignores commands in aborted transactions

## Fixes Implemented

### 1. Database Configuration Fix
**File**: `config/database.php`
- **Removed**: `PDO::ATTR_PERSISTENT => true` from PostgreSQL options
- **Reason**: Persistent connections can retain transaction state and cause this issue

### 2. Enhanced Transaction Handling
**File**: `app/Http/Controllers/Api/BaseApiController.php`
- **Added**: Automatic connection reset on transaction abort errors
- **Added**: Retry logic without transactions when abort is detected
- **Added**: Connection reset on any database query exception

### 3. Global Error Handling Middleware
**File**: `app/Http/Middleware/HandleDatabaseErrors.php`
- **Added**: Global middleware to catch PostgreSQL transaction abort errors
- **Added**: Automatic connection reset and proper error response
- **Registered**: In `bootstrap/app.php`

### 4. Improved Model Validation
**File**: `app/Models/Region.php`
- **Enhanced**: Duplicate name checking with better error handling
- **Added**: Try-catch blocks around database queries in model events
- **Improved**: Graceful fallback to database constraints when queries fail

### 5. Diagnostic Commands
**Files**: 
- `app/Console/Commands/TestDatabaseConnection.php`
- `app/Console/Commands/ResetDatabaseConnection.php`
- `fix-transaction-issue.sh`

## How to Test the Fix

### Option 1: Run the Fix Script
```bash
cd backend
./fix-transaction-issue.sh
```

### Option 2: Manual Testing
```bash
cd backend

# Test database connection
php artisan db:test --count=3

# Reset connection if needed
php artisan db:reset-connection

# Test region operations
php artisan tinker --execute="
\$region = new App\Models\Region();
\$region->name = 'test_region_' . time();
\$region->save();
echo 'Created: ' . \$region->name . PHP_EOL;
"
```

### Option 3: API Testing
```bash
# Test region creation via API
curl -X POST http://localhost:8000/api/regions \
  -H "Content-Type: application/json" \
  -d '{"name": "test_region"}'

# Test duplicate name check
curl -X POST http://localhost:8000/api/regions \
  -H "Content-Type: application/json" \
  -d '{"name": "test_region"}'
```

## Prevention Measures

### 1. Connection Management
- Avoid persistent connections in production with high concurrency
- Implement connection pooling at the application level if needed
- Use connection timeouts to prevent stale connections

### 2. Transaction Best Practices
- Keep transactions as short as possible
- Handle exceptions properly within transactions
- Use database constraints instead of application-level checks when possible

### 3. Error Handling
- Always catch and handle database exceptions
- Implement retry logic for transient failures
- Log database errors for debugging

### 4. Monitoring
- Monitor for transaction abort errors in logs
- Set up alerts for database connection issues
- Track query performance and failures

## Troubleshooting

### If the issue persists:

1. **Check Database Logs**
   ```bash
   # For PostgreSQL
   tail -f /var/log/postgresql/postgresql-*.log
   ```

2. **Clear Laravel Cache**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   ```

3. **Restart Application**
   ```bash
   # If using Laravel Sail
   ./vendor/bin/sail restart
   
   # If using Artisan serve
   # Stop and restart the server
   ```

4. **Check Connection Pool**
   ```bash
   # Test connection limits
   php artisan db:test --count=10
   ```

5. **Database Server Restart**
   ```bash
   # If you have access to the database server
   sudo systemctl restart postgresql
   ```

## Additional Resources

- [PostgreSQL Transaction Management](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [Laravel Database Transactions](https://laravel.com/docs/10.x/database#database-transactions)
- [PDO Persistent Connections](https://www.php.net/manual/en/pdo.connections.php)

## Support

If you continue to experience issues after implementing these fixes:

1. Check the Laravel logs: `storage/logs/laravel.log`
2. Enable query logging in your `.env` file: `DB_QUERY_LOG=true`
3. Monitor database performance and connection counts
4. Consider implementing a more robust connection management strategy
