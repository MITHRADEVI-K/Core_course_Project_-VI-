-- Create tables for CO2 Digital Twin City System

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  area_sq_km FLOAT NOT NULL,
  population INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zones table (districts/neighborhoods within a city)
CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  radius_km FLOAT NOT NULL,
  zone_type VARCHAR(50) NOT NULL, -- residential, industrial, commercial, transportation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time CO2 measurements
CREATE TABLE IF NOT EXISTS co2_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  co2_level FLOAT NOT NULL, -- ppm
  temperature FLOAT, -- celsius
  humidity FLOAT, -- percentage
  air_quality_index INT, -- AQI
  particulate_matter_25 FLOAT, -- PM2.5 in ug/m3
  particulate_matter_10 FLOAT, -- PM10 in ug/m3
  wind_speed FLOAT, -- m/s
  wind_direction VARCHAR(50), -- N, NE, E, etc
  measurement_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CO2 sources (emissions sources)
CREATE TABLE IF NOT EXISTS emission_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  source_type VARCHAR(100) NOT NULL, -- traffic, factory, power_plant, heating, agriculture
  co2_emissions_kg_hr FLOAT NOT NULL,
  description TEXT,
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mitigation strategies
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  strategy_type VARCHAR(100) NOT NULL, -- tree_planting, public_transport, renewable_energy, building_efficiency, traffic_management
  estimated_co2_reduction_pct FLOAT, -- percentage reduction
  implementation_cost_millions FLOAT,
  implementation_timeline_months INT,
  priority INT, -- 1-5, higher = more urgent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forecasting data (AI predictions)
CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  forecast_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  predicted_co2_level FLOAT NOT NULL,
  confidence_score FLOAT, -- 0-1
  risk_level VARCHAR(50), -- low, medium, high, critical
  recommended_actions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategy implementation tracking
CREATE TABLE IF NOT EXISTS strategy_implementations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL, -- planned, in_progress, completed, paused
  start_date DATE,
  end_date DATE,
  actual_co2_reduction_kg FLOAT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical data aggregation for reports
CREATE TABLE IF NOT EXISTS daily_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avg_co2_level FLOAT,
  max_co2_level FLOAT,
  min_co2_level FLOAT,
  avg_aqi INT,
  total_emissions_kg FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_zones_city_id ON zones(city_id);
CREATE INDEX IF NOT EXISTS idx_measurements_zone_id ON co2_measurements(zone_id);
CREATE INDEX IF NOT EXISTS idx_measurements_timestamp ON co2_measurements(measurement_timestamp);
CREATE INDEX IF NOT EXISTS idx_emission_sources_zone_id ON emission_sources(zone_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_zone_id ON forecasts(zone_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_timestamp ON forecasts(forecast_timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_aggregates_zone_date ON daily_aggregates(zone_id, date);
CREATE INDEX IF NOT EXISTS idx_strategy_impl_status ON strategy_implementations(status);

-- Enable realtime for measurements and forecasts
ALTER PUBLICATION supabase_realtime ADD TABLE co2_measurements;
ALTER PUBLICATION supabase_realtime ADD TABLE forecasts;
