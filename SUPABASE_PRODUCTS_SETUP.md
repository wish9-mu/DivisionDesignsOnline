# Supabase Products Table Setup

This guide will help you set up the products table in Supabase to store your lanyard products.

## Step 1: Create the Products Table

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (Division Designs)
3. Click on **SQL Editor** in the left sidebar
4. Copy and paste the following SQL query and click **Run**:

```
sql
-- Create the products table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Standard Lanyards',
    price NUMERIC NOT NULL,
    tag TEXT DEFAULT 'New',
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read products
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);

-- Create a policy that allows authenticated users to insert products
CREATE POLICY "Users can insert products"
ON products FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to update products
CREATE POLICY "Users can update products"
ON products FOR UPDATE
USING (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to delete products
CREATE POLICY "Users can delete products"
ON products FOR DELETE
USING (auth.role() = 'authenticated');
```

## Step 2: Insert Sample Products

Run this SQL to add your initial products:

```
sql
INSERT INTO products (name, type, price, tag, stock) VALUES
    ('Classic Black Lanyard', 'Standard Lanyards', 120, 'Bestseller', 84),
    ('Woven Red Lanyard', 'Standard Lanyards', 150, 'New', 56),
    ('Reversible Reds', 'Standard Lanyards', 210, 'Featured', 32),
    ('Full-Color Print Lanyard', 'Custom Lanyards', 280, 'Custom', 0),
    ('Embroidered Logo Lanyard', 'Custom Lanyards', 320, 'Custom', 0),
    ('Dye-Sublimation Lanyard', 'Custom Lanyards', 350, 'Premium', 18);
```

## Step 3: Verify the Setup

1. Go to **Table Editor** in the left sidebar
2. Click on **products** table
3. You should see your sample products listed

## Step 4: Update Your React App

After setting up the table, the React app will be updated to:
- Fetch products from Supabase on load
- Add/Edit/Delete products will be saved to Supabase

## Troubleshooting

### No products showing
- Check that the SQL queries ran successfully
- Verify your Supabase URL and anon key are correct in `.env.local`
- Restart your dev server after changing `.env.local`

### Permission errors
- Make sure RLS policies are created correctly
- For development, you can also disable RLS temporarily:
  
```
sql
  ALTER TABLE products DISABLE ROW LEVEL SECURITY;
