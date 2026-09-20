# MUNNOKKU Database

This folder contains the PostgreSQL/Supabase compatible database schema and seed data for the SIH 2026 Prototype.

## Files
- `schema.sql`: The database schema including tables, indexes, and constraints.
- `seed.py`: Python script to parse the `Dataset Mastitis.xlsx` file and generate SQL insert statements.
- `seed.sql`: (Generated) The SQL script containing dummy seed data.

## Setup Instructions

1. **Create the Schema**
   Run the `schema.sql` file in your PostgreSQL database (e.g. Supabase SQL editor or via `psql`).

2. **Generate Seed Data**
   ```bash
   cd database
   python seed.py
   ```
   This will generate a `seed.sql` file.

3. **Insert Seed Data**
   Run the generated `seed.sql` in your database.

*Note: The actual backend teammate is responsible for configuring the database connection strings and deploying this schema to the cloud.*
