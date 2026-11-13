import api from '@/utils/axios';
import {
  LandingPage,
  LandingPageSubmission,
  CheckoutPayload,
  CheckoutResponse,
  PublicLandingPageResponse,
  DbPackage,
  DbVoucher,
} from '@/types/landingPage';

// Ambil semua landing page (Admin)
export const getLandingPages = async (): Promise<LandingPage[]> => {
  const response = await api.get<{ data: LandingPage[] }>('/landing-pages');
  return response.data.data;
};

// Ambil detail landing page by ID (Admin Builder)
export const getLandingPage = async (
  id: number | string
): Promise<{ data: LandingPage; availablePackages: DbPackage[]; availableVouchers: DbVoucher[] }> => {
  const response = await api.get<{
    data: LandingPage;
    availablePackages: DbPackage[];
    availableVouchers: DbVoucher[];
  }>(`/landing-pages/${id}`);
  return response.data;
};

// Buat landing page baru
export const createLandingPage = async (payload: {
  title: string;
  slug?: string;
  templateType?: 'wetonkaya' | 'disc' | 'blank';
  description?: string;
}): Promise<LandingPage> => {
  const response = await api.post<{ message: string; data: LandingPage }>('/landing-pages', payload);
  return response.data.data;
};

// Simpan update dari builder
export const updateLandingPage = async (
  id: number | string,
  payload: Partial<LandingPage>
): Promise<LandingPage> => {
  const response = await api.put<{ message: string; data: LandingPage }>(`/landing-pages/${id}`, payload);
  return response.data.data;
};

// Hapus landing page
export const deleteLandingPage = async (id: number | string): Promise<void> => {
  await api.delete(`/landing-pages/${id}`);
};

// Duplikasi landing page
export const duplicateLandingPage = async (id: number | string): Promise<LandingPage> => {
  const response = await api.post<{ message: string; data: LandingPage }>(`/landing-pages/${id}/duplicate`);
  return response.data.data;
};

// Ambil public landing page (pengunjung iklan)
export const getPublicLandingPage = async (
  slug: string
): Promise<PublicLandingPageResponse> => {
  const response = await api.get<PublicLandingPageResponse>(
    `/landing-pages/public/${slug}`
  );
  return response.data;
};

// Checkout token dari form landing page
export const checkoutFromLandingPage = async (
  slug: string,
  payload: CheckoutPayload
): Promise<CheckoutResponse> => {
  const response = await api.post<CheckoutResponse>(
    `/landing-pages/public/${slug}/checkout`,
    payload
  );
  return response.data;
};

// Ambil submissions / leads
export const getLandingPageSubmissions = async (
  id: number | string
): Promise<LandingPageSubmission[]> => {
  const response = await api.get<{ data: LandingPageSubmission[] }>(
    `/landing-pages/${id}/submissions`
  );
  return response.data.data;
};

// Upload gambar atau video untuk Landing Page Builder
export const uploadLandingPageMedia = async (
  file: File
): Promise<{ url: string; relativeUrl: string; mimetype: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{
    message: string;
    url: string;
    relativeUrl: string;
    mimetype: string;
  }>('/landing-pages/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

