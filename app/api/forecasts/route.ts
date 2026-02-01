import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const zoneId = request.nextUrl.searchParams.get('zoneId');

    if (!zoneId) {
      return NextResponse.json({ error: 'zoneId is required' }, { status: 400 });
    }

    // Fetch forecasts for the next 30 days
    const { data, error } = await supabase
      .from('forecasts')
      .select('forecast_timestamp, predicted_co2_level, confidence_score, risk_level')
      .eq('zone_id', zoneId)
      .gte('forecast_timestamp', new Date().toISOString())
      .lte('forecast_timestamp', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('forecast_timestamp', { ascending: true })
      .limit(30);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch forecasts' }, { status: 500 });
    }

    // Transform the data for frontend consumption
    const transformed = data.map((forecast) => ({
      date: new Date(forecast.forecast_timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      predicted_co2: Math.round(forecast.predicted_co2_level),
      confidence: forecast.confidence_score,
      risk_level: forecast.risk_level,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
