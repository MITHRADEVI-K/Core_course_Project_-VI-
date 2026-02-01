import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const zoneId = request.nextUrl.searchParams.get('zoneId');
    const limit = request.nextUrl.searchParams.get('limit') || '100';
    
    let query = supabase
      .from('co2_measurements')
      .select('*');
    
    if (zoneId) query = query.eq('zone_id', zoneId);
    
    const { data, error } = await query
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch measurements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('co2_measurements')
      .insert([body])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create measurement' }, { status: 500 });
  }
}
