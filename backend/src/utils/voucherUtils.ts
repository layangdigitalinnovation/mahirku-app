import models from '../models';

export const validateVoucher = async (voucherCode: string) => {
  const voucher = await models.Voucher.findOne({
    where: { code: voucherCode, isActive: true },
  });

  if (!voucher) {
    throw new Error('Voucher tidak ditemukan atau tidak aktif');
  }

  // validasi bisa ditambahkan di sini jika perlu
  return voucher;
};

export const calculateDiscount = (price: number, voucher: any) => {
  if (voucher.type === 'percentage') {
    return (price * voucher.value) / 100;
  } else if (voucher.type === 'fixed') {
    return Math.min(voucher.value, price); // Jangan sampai diskon lebih dari harga
  } else {
    return 0;
  }
};
