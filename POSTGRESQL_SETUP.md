# PostgreSQL Setup Guide

## Overview

This guide explains how to set up the application with PostgreSQL, which requires special handling due to PostgreSQL's strict transaction management and foreign key constraints.

## Why Standard Migrations Fail with PostgreSQL

When using PostgreSQL, you may encounter the following error during migrations:

```
SQLSTATE[25P02]: In failed sql transaction: 7 ERROR: current transaction is aborted, commands ignored until end of transaction block
```

This happens because:

1. **Transaction Handling**: PostgreSQL aborts the entire transaction when any statement fails
2. **Foreign Key Constraints**: The order of operations becomes critical with foreign keys
3. **Nested Transactions**: Laravel's migration system uses transactions that can conflict with PostgreSQL's handling

## Solution: Direct SQL Execution

We've created a custom approach that bypasses Laravel's transaction handling:

1. A SQL script (`database/sql/create_tables.sql`) that creates all tables in the correct order
2. A custom Artisan command (`db:execute-sql`) that executes SQL scripts directly

## Setup Instructions

### 1. Database Configuration

In your `.env` file, set up PostgreSQL connection:

```
DB_CONNECTION=pgsql
DB_HOST=your_postgres_host
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 2. Create Tables

Instead of using standard migrations, run:

```bash
php artisan db:execute-sql database/sql/create_tables.sql
```

This command:
- Creates all tables in the correct order
- Sets up foreign key constraints properly
- Avoids transaction issues
- Records migrations in the migrations table

### 3. Seed the Database

After creating tables, seed the database:

```bash
php artisan db:seed --force
```

The `--force` flag is required when running in production environments.

## Troubleshooting

### Transaction Aborted Errors

If you encounter transaction abort errors:

1. Run the transaction fix script:
   ```bash
   ./fix-transaction-issue.sh
   ```

2. Clear Laravel caches:
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

3. Try the SQL execution approach again.

### Table Already Exists

If you get "table already exists" errors:

1. Wipe the database:
   ```bash
   php artisan db:wipe --force
   ```

2. Run the SQL script again.

## Technical Details

The SQL script:
- Uses `CREATE TABLE IF NOT EXISTS` to avoid errors
- Creates tables in dependency order (users, regions, projects, pins)
- Adds foreign key constraints inline with table creation
- Adds unique constraints where needed
- Creates the migrations table and records migrations

## Custom Commands

### db:execute-sql

This command executes a SQL script file directly:

```bash
php artisan db:execute-sql path/to/script.sql
```

It splits the SQL by semicolons and executes each statement separately, avoiding transaction issues.

## Production Deployment

For production environments:

1. Always use the `--force` flag:
   ```bash
   php artisan db:execute-sql database/sql/create_tables.sql
   php artisan db:seed --force
   ```

2. Consider using a connection pooler like PgBouncer for better performance.

3. Set appropriate timeouts in your database configuration.
