import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ayvrexendzfimyraquyj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_z1CNoyuJf44tYGjghl5mHQ_YIF9aubE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
