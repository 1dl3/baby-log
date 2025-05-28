# Database Migrations

This directory contains custom database migrations that need to be run manually.

## QR Code Table Migration

The `001_convert_qr_code_ids_to_uuid.sql` file contains a migration to convert the `user_id` and `baby_id` columns in the `qr_code` table from their current type to UUID. This is necessary because the automatic type conversion fails with the error:

```
error: column "user_id" cannot be cast automatically to type uuid
```

### Running the Migration

To run this migration, use the following command:

```bash
npm run db:fix-qr-code
```

or

```bash
yarn db:fix-qr-code
```

This will execute the SQL file using the database connection specified in the `DATABASE_URL` environment variable.

### What the Migration Does

The migration performs the following operations:

1. Alters the `user_id` column in the `qr_code` table to be of type UUID, using the `USING` clause to explicitly cast the values.
2. Sets the `user_id` column to be NOT NULL.
3. Alters the `baby_id` column in the `qr_code` table to be of type UUID, using the `USING` clause to explicitly cast the values.
4. Sets the `baby_id` column to be NOT NULL.
5. Adds foreign key constraints to link the `user_id` and `baby_id` columns to the `user` and `baby` tables, respectively.

### After Running the Migration

After running this migration, you should be able to run the regular drizzle-kit push command without errors:

```bash
npm run db:push
```

or

```bash
yarn db:push
```