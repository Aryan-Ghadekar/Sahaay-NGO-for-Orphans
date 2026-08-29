import { supabaseAdmin } from '../config/supabase.js';

// The handful of site-wide landing-page images an admin can replace
// (Hero, Volunteer CTA) that aren't tied to any single program/event.
export async function listSiteImages() {
  const { data, error } = await supabaseAdmin.from('site_content').select('key, image_data_url, updated_at');
  if (error) throw error;
  return data;
}

export async function setSiteImage(key, imageDataUrl) {
  const { data, error } = await supabaseAdmin
    .from('site_content')
    .upsert({ key, image_data_url: imageDataUrl, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}
