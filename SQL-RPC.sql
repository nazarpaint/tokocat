-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Fungsi untuk menambah stok produk secara atomik.
-- Dipakai saat membatalkan transaksi untuk mengembalikan stok.
CREATE OR REPLACE FUNCTION tambah_stok(id_produk uuid, jumlah_tambah numeric)
RETURNS void AS $$
BEGIN
  UPDATE public.produk
  SET stok_saat_ini = stok_saat_ini + jumlah_tambah
  WHERE id = id_produk;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;