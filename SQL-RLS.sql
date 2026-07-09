-- ============================================
-- FIX RLS: sesuaikan dengan cara aplikasi konek
-- ============================================
-- Masalah: aplikasi login pakai sistem custom (password + RPC bcrypt),
-- BUKAN Supabase Auth (auth.signInWithPassword). Jadi supabaseClient selalu
-- terhubung sebagai role 'anon', bukan 'authenticated'.
-- Policy lama mensyaratkan auth.role() = 'authenticated' -> SELALU GAGAL
-- untuk insert/update/delete, makanya kategori (dan berpotensi tabel lain)
-- tidak pernah benar-benar tersimpan.

-- Drop semua policy lama
DROP POLICY IF EXISTS "Allow all for authenticated users" ON kategori;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON supplier;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON produk;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON stok_log;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON transaksi;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON transaksi_detail;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON laba_rugi;

-- Policy baru: izinkan anon + authenticated, dengan WITH CHECK eksplisit
-- (WITH CHECK wajib untuk INSERT; kalau tidak ada, insert akan selalu ditolak)
CREATE POLICY "Allow anon and authenticated" ON kategori
    FOR ALL
    USING (auth.role() IN ('anon', 'authenticated'))
    WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Allow anon and authenticated" ON supplier
    FOR ALL
    USING (auth.role() IN ('anon', 'authenticated'))
    WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Allow anon and authenticated" ON produk
    FOR ALL
    USING (auth.role() IN ('anon', 'authenticated'))
    WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Allow anon and authenticated" ON stok_log
    FOR ALL
    USING (auth.role() IN ('anon', 'authenticated'))
    WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Allow anon and authenticated" ON transaksi
    FOR ALL
    USING (auth.role() IN ('anon', 'authenticated'))
    WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Allow anon and authenticated" ON transaksi_detail
    FOR ALL
    USING (auth.role() IN ('anon', 'authenticated'))
    WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Allow anon and authenticated" ON laba_rugi
    FOR ALL
    USING (auth.role() IN ('anon', 'authenticated'))
    WITH CHECK (auth.role() IN ('anon', 'authenticated'));
