// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and Anon Key
const supabaseUrl = 'https://ohzehbgstamitwwfbxls.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oemVoYmdzdGFtaXR3d2ZieGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mjc4MTQsImV4cCI6MjA4OTUwMzgxNH0.sUxH5mPgrxdXMH7M-nswnDoyAHgYfcFAlzYh9-rzgu4';

export const supabase = createClient(supabaseUrl, supabaseKey);