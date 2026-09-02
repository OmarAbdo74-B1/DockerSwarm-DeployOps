-- Run this once against your database to create the schema:
--   psql "$DATABASE_URL" -f db/schema.sql

CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  fuel TEXT,
  transmission TEXT,
  mileage_km INTEGER DEFAULT 0,
  price NUMERIC(12, 2) NOT NULL,
  location TEXT,
  condition TEXT,
  category TEXT,
  image TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, car_id)
);

-- Seed data (matches the original in-memory demo cars)
INSERT INTO cars (name, title, subtitle, fuel, transmission, mileage_km, price, location, condition, category, image)
VALUES
  ('BMW X5', '2024 BMW X5 xDrive40i', 'M Sport Package · Automatic', 'Petrol', 'Automatic', 18000, 68900, 'Cairo', 'New', 'suvs',
   'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'),
  ('Mercedes C-Class', '2023 Mercedes-Benz C 200', 'Avantgarde · 1 Owner', 'Petrol', 'Automatic', 24000, 51500, 'Giza', 'Used', 'sedans',
   'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80'),
  ('Porsche 911', '2022 Porsche 911 Carrera', 'Sport Chrono · Low Mileage', 'Petrol', 'PDK', 9000, 129900, 'Cairo', 'Used', 'sports',
   'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80'),
  ('Tesla Model Y', '2024 Tesla Model Y Long Range', 'Dual Motor · AWD', 'Electric', 'Automatic', 0, 46990, 'Alexandria', 'New', 'electric',
   'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80')
ON CONFLICT DO NOTHING;
