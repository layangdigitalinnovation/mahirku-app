import React from "react";
import { Link, Outlet } from "react-router-dom";
import { NavigationBar } from "@/components/ui/NavigationBar";
import { ActiveSectionProvider } from "@/context/ActiveSectionContext";

export const LandingLayout: React.FC = () => {
  return (
    <div className="min-h-screen">
      <ActiveSectionProvider>
        
      <NavigationBar />
      <main>
        <Outlet />
      </main>
          {/* Footer */}
      <footer className="bg-primary-200 pt-16 pb-8">
        <div className="max-w-7xl container mx-auto px-10 sm:px-10 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Logo & Intro */}
            <div>
              <h3 className="text-2xl font-bold font-heading text-white mb-4">Mahirku</h3>
              <p className="text-body2 font-body text-white">
                Platform tes minat bakat dan gaya berpikir berbasis biometrik untuk individu, keluarga, dan perusahaan.
              </p>
            </div>

            {/* Navigasi */}
            <div>
              <h4 className="font-heading text-heading6 font-semibold text-white mb-3">Menu</h4>
              <ul className="space-y-2 font-body text-white text-body2">
                <li>
                  <Link to="/" className="hover:underline">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:underline">
                    Daftar
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:underline">
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>

            {/* Bantuan */}
            <div>
              <h4 className="text-heading6 font-heading font-semibold text-white mb-3">Bantuan</h4>
              <ul className="space-y-2 text-body2 font-body text-white">
                <li>
                  <Link to="/faq" className="hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:underline">
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:underline">
                    Syarat & Ketentuan
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kontak */}
            <div>
              <h4 className="text-heading6 font-heading font-semibold text-white mb-3">

                Hubungi Kami
              </h4>
              <p className="text-body2 font-body text-white">
                Alamat: Jl. Siliwangi No.54, Kota Tasikmalaya
              </p>
              <p className="text-body2 font-body text-white">
                Email: layanggroup@gmail.com
              </p>
              <p className="text-body2 font-body text-white">
                WhatsApp: 0851-8232-2580
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-100 mt-10 pt-6 text-center text-sm text-white font-body">
            © {new Date().getFullYear()} Mahirku. All rights reserved.
          </div>
        </div>
      </footer>
      </ActiveSectionProvider>
    </div>
  );
};
