import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nnjwnlkufvuxwvjbsgca.supabase.co'
const supabaseAnonKey = 'YOUR_PUBLISHABLE_KEY_HERE' // Paste your long sb_publishable key here!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)