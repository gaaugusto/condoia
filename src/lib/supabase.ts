import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zwtrpmnjshmraomxgtiv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dHJwbW5qc2htcmFvbXhndGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODQ1ODMsImV4cCI6MjA4ODE2MDU4M30.QxMIwWuoI-thG3vky1TwLDkuS_G2TbyuUig-7Yti7ks";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
