// js/supabase.js
// PASTE URL & API KEY SUPABASE ANDA DI SINI
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Ganti dengan URL Supabase Anda
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Ganti dengan Anon Key Anda

let supabase;

// Inisialisasi Supabase
function initSupabase() {
    if (typeof supabaseClient !== 'undefined') {
        supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialized');
        return supabase;
    } else {
        console.error('❌ Supabase JS Client not loaded!');
        return null;
    }
}

// Cek koneksi & autentikasi
async function checkConnection() {
    if (!supabase) {
        console.error('Supabase not initialized');
        return false;
    }
    
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Auth error:', error);
        return false;
    }
    
    return true;
}

// Sign In (untuk demo gunakan anon, untuk production tambahkan auth)
async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) throw error;
    return data;
}

// Sign Up
async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });
    
    if (error) throw error;
    return data;
}

// Sign Out
async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// Dapatkan user saat ini
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}