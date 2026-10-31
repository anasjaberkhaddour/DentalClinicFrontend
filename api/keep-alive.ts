export default async function handler(req: any, res: any) {
  const supabaseUrl = 'https://xdvyukcqlnehcfgfbrwn.supabase.co/rest/v1/Currencies?select=id&limit=1';
  const supabaseKey = 'sb_publishable_Gj3AakIIZi6s_-TCy2JuxQ_ToNPgCWv';

  try {
    const response = await fetch(supabaseUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (response.ok) {
      return res.status(200).json({ status: 'Supabase is active' });
    }
    
    return res.status(500).json({ status: 'Error reaching Supabase' });
  } catch (error) {
    return res.status(500).json({ status: 'Catch error' });
  }
}