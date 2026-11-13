import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Plus,
  Eye,
  Edit3,
  Copy,
  Trash2,
  ExternalLink,
  Users,
  TrendingUp,
  MessageCircle,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  getLandingPages,
  createLandingPage,
  deleteLandingPage,
  duplicateLandingPage,
  updateLandingPage,
  getLandingPageSubmissions,
} from '@/services/api/landingPage';
import { LandingPage, LandingPageSubmission } from '@/types/landingPage';

export default function ManageLandingPages() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Buat LP Baru
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'wetonkaya' | 'disc' | 'blank'>('wetonkaya');

  // Modal Submissions / Leads
  const [isLeadsOpen, setIsLeadsOpen] = useState(false);
  const [selectedPageForLeads, setSelectedPageForLeads] = useState<LandingPage | null>(null);
  const [leads, setLeads] = useState<LandingPageSubmission[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await getLandingPages();
      setPages(data);
    } catch (err: any) {
      console.error('Fetch landing pages error:', err);
      const detailMsg = err.response?.data?.message || err.message || '';
      toast.error(`Gagal mengambil daftar landing page. ${detailMsg ? `(${detailMsg})` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Handler Buat LP
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Judul landing page wajib diisi.');
      return;
    }

    try {
      setCreating(true);
      const created = await createLandingPage({
        title: newTitle,
        slug: newSlug || undefined,
        templateType: selectedTemplate,
      });

      toast.success('Landing page berhasil dibuat! Mengarahkan ke Web Builder...');
      setIsCreateOpen(false);
      setNewTitle('');
      setNewSlug('');
      navigate(`/admin/dashboard/landing-pages/builder/${created.id}`);
    } catch (err: any) {
      console.error('Create landing page error:', err);
      const detailMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Pastikan server backend sudah berjalan di port 5000.';
      toast.error(`Gagal membuat landing page: ${detailMsg}`);
    } finally {
      setCreating(false);
    }
  };

  // Handler Hapus LP
  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus landing page "${title}"?`)) return;

    try {
      await deleteLandingPage(id);
      toast.success('Landing page berhasil dihapus.');
      fetchPages();
    } catch (err: any) {
      toast.error('Gagal menghapus landing page.');
    }
  };

  // Handler Duplikasi LP
  const handleDuplicate = async (id: number) => {
    try {
      await duplicateLandingPage(id);
      toast.success('Landing page berhasil diduplikasi!');
      fetchPages();
    } catch (err: any) {
      toast.error('Gagal menduplikasi landing page.');
    }
  };

  // Handler Toggle Publish
  const handleTogglePublish = async (page: LandingPage) => {
    try {
      const nextStatus = !page.isPublished;
      await updateLandingPage(page.id, { isPublished: nextStatus });
      toast.success(
        nextStatus
          ? 'Landing page telah dipublikasikan!'
          : 'Landing page dinonaktifkan (Draft).'
      );
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, isPublished: nextStatus } : p))
      );
    } catch (err: any) {
      toast.error('Gagal memperbarui status publikasi.');
    }
  };

  // Handler Salin Link Publik
  const handleCopyLink = (slug: string) => {
    const origin = window.location.origin;
    const url = `${origin}/lp/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Tautan landing page berhasil disalin ke clipboard!', {
      description: url,
    });
  };

  // Handler Buka Leads Drawer
  const handleOpenLeads = async (page: LandingPage) => {
    setSelectedPageForLeads(page);
    setIsLeadsOpen(true);
    try {
      setLoadingLeads(true);
      const data = await getLandingPageSubmissions(page.id);
      setLeads(data);
    } catch (err) {
      toast.error('Gagal memuat data leads.');
    } finally {
      setLoadingLeads(false);
    }
  };

  // Stats agregat
  const totalViews = pages.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const totalLeads = pages.reduce((sum, p) => sum + (p.totalLeads || 0), 0);
  const totalRevenue = pages.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Globe className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900">
              Landing Page & Funnel Builder
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Buat landing page iklan responsif mobile tinggi konversi (seperti Buat.id & WetonKaya) lengkap dengan formulir pesanan dan checkout token instan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchPages}
            className="flex items-center gap-2 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 rounded-xl shadow-md shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            Buat Landing Page Baru
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Halaman</CardTitle>
            <Layers className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pages.length}</div>
            <p className="text-xs text-gray-400 mt-1">Halaman aktif dan draft</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Kunjungan (Views)</CardTitle>
            <Eye className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-blue-500 mt-1">Dari iklan Facebook/TikTok & referral</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Leads & Formulir Masuk</CardTitle>
            <Users className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalLeads.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">Data kontak pengunjung terkumpul</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Omzet Konversi</CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-400 mt-1">Pembelian token terverifikasi</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari berdasarkan judul atau slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-lg"
          />
        </div>
      </div>

      {/* List of Landing Pages */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
          <p className="text-gray-500">Memuat landing page...</p>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-800">Belum Ada Landing Page</h3>
            <p className="text-gray-500 text-sm mt-1">
              Mulai buat landing page pertama Anda untuk keperluan iklan berbayar (TikTok/Facebook Ads) dengan template WetonKaya atau DISC.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Landing Page Sekarang
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <Card
              key={page.id}
              className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Header card with status pill */}
                <div className="p-5 pb-3 border-b border-gray-50 bg-gradient-to-br from-gray-50/50 to-white">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                        page.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          page.isPublished ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {page.isPublished ? 'Published (Live)' : 'Draft'}
                    </span>

                    <button
                      onClick={() => handleTogglePublish(page)}
                      className="text-xs text-gray-500 hover:text-indigo-600 underline font-medium"
                    >
                      {page.isPublished ? 'Jadikan Draft' : 'Publikasikan'}
                    </button>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-indigo-600 transition">
                    {page.title}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      /lp/{page.slug}
                    </span>
                    <button
                      onClick={() => handleCopyLink(page.slug)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700"
                      title="Salin Link Publik"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="p-5 py-4 grid grid-cols-3 gap-2 text-center bg-white border-b border-gray-50">
                  <div className="p-2 rounded-xl bg-gray-50/80">
                    <div className="text-xs text-gray-500 font-medium">Views</div>
                    <div className="text-sm font-bold text-gray-900 mt-0.5">
                      {page.viewsCount || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-50/80">
                    <div className="text-xs text-gray-500 font-medium">Leads</div>
                    <div className="text-sm font-bold text-amber-600 mt-0.5">
                      {page.totalLeads || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-50/80">
                    <div className="text-xs text-gray-500 font-medium">Konversi</div>
                    <div className="text-sm font-bold text-emerald-600 mt-0.5">
                      {page.totalPaid || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-gray-50/50 flex flex-col gap-2">
                <Button
                  onClick={() => navigate(`/admin/dashboard/landing-pages/builder/${page.id}`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-sm font-medium"
                >
                  <Edit3 className="w-4 h-4" />
                  Buka Web Builder
                </Button>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/lp/${page.slug}`, '_blank')}
                    className="rounded-lg text-xs flex items-center justify-center p-2"
                    title="Lihat Pratinjau Live"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Live
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenLeads(page)}
                    className="rounded-lg text-xs flex items-center justify-center p-2"
                    title="Lihat Leads & Pesanan"
                  >
                    <Users className="w-3.5 h-3.5 mr-1" />
                    Leads
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(page.id)}
                    className="rounded-lg text-xs flex items-center justify-center p-2"
                    title="Duplikasi Halaman"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Klon
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(page.id, page.title)}
                    className="rounded-lg text-xs text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center p-2"
                    title="Hapus Halaman"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Buat Landing Page Baru */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Buat Landing Page Iklan Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            {/* Pilihan Template */}
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                PILIH TEMPLATE AWAL:
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setSelectedTemplate('wetonkaya')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition relative ${
                    selectedTemplate === 'wetonkaya'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="absolute -top-2.5 right-2 text-[10px] bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold px-2 py-0.5 rounded-full shadow-sm">
                    IKLAN HOT 🔥
                  </span>
                  <div className="font-bold text-sm text-gray-900">WetonKaya Style</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    Tes 8 Karakter & Jalur Rezeki. Dilengkapi teaser arketipe & checkout token.
                  </div>
                </div>

                <div
                  onClick={() => setSelectedTemplate('disc')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                    selectedTemplate === 'disc'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">DISC Personality</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    Pemetaan kepribadian kerja untuk karier & korporasi.
                  </div>
                </div>

                <div
                  onClick={() => setSelectedTemplate('blank')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                    selectedTemplate === 'blank'
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">Kanvas Kosong</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    Mulai dari nol dengan bagian minimalis.
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label className="text-xs font-semibold text-gray-700">Judul Landing Page</Label>
              <Input
                placeholder="Contoh: Tes 8 Karakter & Potensi Sukses Anda"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 rounded-xl"
                required
              />
            </div>

            {/* Custom Slug */}
            <div>
              <Label className="text-xs font-semibold text-gray-700">
                Custom URL Slug (Opsional)
              </Label>
              <div className="flex items-center mt-1">
                <span className="bg-gray-100 text-gray-500 text-xs px-3 py-2.5 rounded-l-xl border border-r-0 border-gray-200">
                  /lp/
                </span>
                <Input
                  placeholder="karakter-kaya"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="rounded-l-none rounded-r-xl"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Jika dikosongkan, slug akan otomatis dibuat dari judul.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
              >
                {creating ? 'Membuat...' : 'Buat & Lanjut ke Builder'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Leads & Submissions */}
      <Dialog open={isLeadsOpen} onOpenChange={setIsLeadsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Leads Masuk: {selectedPageForLeads?.title}</span>
              </div>
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {leads.length} Leads Terkumpul
              </span>
            </DialogTitle>
          </DialogHeader>

          {loadingLeads ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
              <p className="text-xs text-gray-500 mt-2">Memuat daftar leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Belum ada leads atau pesanan masuk dari landing page ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                    <th className="py-2.5 px-3 font-semibold">Nama Lengkap</th>
                    <th className="py-2.5 px-3 font-semibold">WhatsApp</th>
                    <th className="py-2.5 px-3 font-semibold">Email</th>
                    <th className="py-2.5 px-3 font-semibold">Paket / Nominal</th>
                    <th className="py-2.5 px-3 font-semibold">Metode</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => {
                    const cleanPhone = lead.whatsapp.replace(/[^0-9]/g, '');
                    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Halo Kak ${lead.fullName}, terima kasih telah mendaftar di Mahirku. Apakah ada yang bisa kami bantu mengenai tes token Anda?`
                    )}`;

                    return (
                      <tr key={lead.id} className="hover:bg-gray-50/80">
                        <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-gray-900">
                          {lead.fullName}
                          {lead.additionalData &&
                            Object.entries(lead.additionalData)
                              .filter(
                                ([, val]) =>
                                  val !== undefined &&
                                  val !== null &&
                                  String(val).trim() !== ''
                              )
                              .map(([key, val]) => {
                                const label =
                                  key === 'goal'
                                    ? 'Target'
                                    : key === 'birthDate'
                                      ? 'Tanggal Lahir'
                                      : key;
                                return (
                                  <span key={key} className="block text-[10px] text-gray-500">
                                    {label}: {Array.isArray(val) ? val.join(', ') : String(val)}
                                  </span>
                                );
                              })}
                        </td>
                        <td className="py-2.5 px-3">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded"
                          >
                            <MessageCircle className="w-3 h-3" />
                            {lead.whatsapp}
                          </a>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">{lead.email}</td>
                        <td className="py-2.5 px-3 font-medium text-gray-900">
                          Rp {lead.amount.toLocaleString('id-ID')}
                          {lead.package && (
                            <span className="block text-[10px] text-gray-400">
                              {lead.package.name}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              lead.paymentMethod === 'gateway'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {lead.paymentMethod === 'gateway' ? 'Xendit Gateway' : 'WhatsApp'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              lead.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {lead.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

