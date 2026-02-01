-- Seed demo data for CO₂ Digital Twin application

-- Insert sample cities
INSERT INTO cities (name, latitude, longitude, area_sq_km, population, created_at)
VALUES 
  ('Berlin', 52.5200, 13.4050, 891, 3645000, NOW()),
  ('Paris', 48.8566, 2.3522, 105, 2161000, NOW()),
  ('London', 51.5074, -0.1278, 1572, 9002000, NOW()),
  ('Amsterdam', 52.3676, 4.9041, 219, 873000, NOW());

-- Insert zones for Berlin
INSERT INTO zones (city_id, name, latitude, longitude, radius_km, zone_type, created_at)
SELECT 
  (SELECT id FROM cities WHERE name = 'Berlin'),
  zone_name,
  lat,
  lng,
  3.5,
  zone_type,
  NOW()
FROM (VALUES
  ('Downtown', 52.52, 13.41, 'commercial'),
  ('Industrial', 52.50, 13.42, 'industrial'),
  ('Residential North', 52.55, 13.40, 'residential'),
  ('Residential South', 52.48, 13.43, 'residential'),
  ('Transportation Hub', 52.52, 13.38, 'transportation')
) AS zones(zone_name, lat, lng, zone_type);

-- Insert zones for Paris
INSERT INTO zones (city_id, name, latitude, longitude, radius_km, zone_type, created_at)
SELECT 
  (SELECT id FROM cities WHERE name = 'Paris'),
  zone_name,
  lat,
  lng,
  2.8,
  zone_type,
  NOW()
FROM (VALUES
  ('Central', 48.86, 2.35, 'commercial'),
  ('Industrial', 48.85, 2.40, 'industrial'),
  ('Marais', 48.86, 2.36, 'residential'),
  ('Banlieue', 48.80, 2.35, 'residential')
) AS zones(zone_name, lat, lng, zone_type);

-- Insert sample emission sources
INSERT INTO emission_sources (zone_id, source_type, co2_emissions_kg_hr, latitude, longitude, description, created_at)
SELECT 
  z.id,
  source_type,
  magnitude,
  z.latitude,
  z.longitude,
  'Auto-generated emission source',
  NOW()
FROM zones z
CROSS JOIN (VALUES
  ('traffic', 150),
  ('industrial', 250),
  ('heating', 100),
  ('power_plant', 300)
) AS sources(source_type, magnitude)
WHERE z.city_id IN (SELECT id FROM cities WHERE name IN ('Berlin', 'Paris'));

-- Insert sample strategies for Berlin
INSERT INTO strategies (city_id, name, description, strategy_type, estimated_co2_reduction_pct, implementation_cost_millions, implementation_timeline_months, priority, created_at)
SELECT 
  c.id,
  s.name,
  s.description,
  s.strategy_type,
  s.reduction,
  s.cost,
  s.time,
  s.priority,
  NOW()
FROM cities c, (VALUES
  ('Expand Public Transport', 'Increase bus and train routes to reduce car dependency', 'public_transport', 25, 50, 24, 1),
  ('Electric Bus Fleet', 'Replace diesel buses with electric alternatives', 'renewable_energy', 15, 100, 36, 1),
  ('Green Building Initiative', 'Retrofit old buildings with energy-efficient technology', 'building_efficiency', 20, 200, 48, 2),
  ('Carbon Pricing', 'Implement congestion charges in city center', 'traffic_management', 18, 5, 6, 2),
  ('Tree Planting Program', 'Plant 1 million trees across the city', 'tree_planting', 12, 50, 60, 3)
) AS s(name, description, strategy_type, reduction, cost, time, priority)
WHERE c.name = 'Berlin';

-- Insert sample forecasts for zones
INSERT INTO forecasts (zone_id, forecast_timestamp, predicted_co2_level, confidence_score, risk_level, recommended_actions, created_at)
SELECT 
  z.id,
  (NOW() + (interval '1 day' * n)),
  400 + RANDOM() * 200,
  0.85 + RANDOM() * 0.14,
  CASE WHEN (400 + RANDOM() * 200) > 500 THEN 'high' ELSE 'medium' END,
  'Consider implementing emission reduction strategies',
  NOW()
FROM zones z, GENERATE_SERIES(0, 30) n
WHERE z.city_id IN (SELECT id FROM cities WHERE name IN ('Berlin', 'Paris'));

-- Insert sample measurements
INSERT INTO co2_measurements (zone_id, co2_level, temperature, humidity, air_quality_index, measurement_timestamp, created_at)
SELECT 
  z.id,
  400 + RANDOM() * 300,
  15 + RANDOM() * 10,
  50 + RANDOM() * 30,
  FLOOR(50 + RANDOM() * 150)::INTEGER,
  NOW() - (interval '1 hour' * (i % 24)),
  NOW()
FROM zones z, GENERATE_SERIES(0, 100) i
WHERE z.city_id IN (SELECT id FROM cities WHERE name IN ('Berlin', 'Paris'));

-- Insert daily aggregates
INSERT INTO daily_aggregates (zone_id, date, avg_co2_level, max_co2_level, min_co2_level, avg_aqi, total_emissions_kg, created_at)
SELECT 
  z.id,
  CURRENT_DATE,
  400 + RANDOM() * 300,
  500 + RANDOM() * 200,
  300 + RANDOM() * 100,
  FLOOR(50 + RANDOM() * 150)::INTEGER,
  FLOOR(1000 + RANDOM() * 5000)::INTEGER,
  NOW()
FROM zones z
WHERE z.city_id IN (SELECT id FROM cities WHERE name IN ('Berlin', 'Paris'));
