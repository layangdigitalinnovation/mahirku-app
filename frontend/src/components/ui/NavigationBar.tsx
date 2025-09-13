import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Home, Shield, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import mahirkuLogo from "@/assets/Logo (1).png";
import React from "react";
import { useActiveSection } from "@/context/ActiveSectionContext";
import type { SectionName } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

// Navigation configurations for different landing pages
const navigationConfigs = {
  customer: {
    sections: [
      { id: "beranda", label: "Beranda" },
      { id: "layanan", label: "Layanan" },
      { id: "paket", label: "Paket" },
      { id: "kontak", label: "Kontak" },
    ],
    authButtons: {
      login: { text: "Masuk", path: "/login" },
      register: { text: "Daftar", path: "/register" },
    },
  },
  affiliator: {
    sections: [
      { id: "beranda", label: "Beranda" },
      { id: "keuntungan", label: "Keuntungan" },
      { id: "cara-kerja", label: "Cara Kerja" },
      { id: "komisi", label: "Komisi" },
      { id: "daftar", label: "Daftar" },
    ],
    authButtons: {
      login: { text: "Login Affiliator", path: "/login" },
      register: { text: "Daftar Affiliator", path: "/affiliator/register" },
    },
  },
};

interface NavigationBarProps {
  variant?: "customer" | "affiliator";
  showBackToCustomer?: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  variant = "customer",
  showBackToCustomer = false,
}) => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { active, setActive } = useActiveSection();

  const config = navigationConfigs[variant];
  const sections = config.sections as { id: SectionName; label: string }[];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "super_admin":
        return "/admin/dashboard";
      case "affiliator":
        return "/affiliator/dashboard";
      default:
        return "/user/dashboard";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800";
      case "affiliator":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return Shield;
      case "affiliator":
        return DollarSign;
      default:
        return User;
    }
  };

  const getLogoLink = () => {
    return variant === "affiliator" ? "/affiliator" : "/";
  };

  const handleSectionClick = (sectionId: SectionName) => {
    setActive(sectionId);
    // For affiliator pages, we need different navigation logic
    if (variant === "affiliator" && sectionId === ("daftar" as SectionName)) {
      navigate("/affiliator/register");
      return;
    }

    if (sectionId === "kontak") {
      if (variant === "affiliator") {
        navigate("/affiliator/contact");
      } else {
        navigate("/kontak");
      }
      return;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[9rem] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isOnHero = active === "beranda";

  // Tentukan wrapper nav: motion.nav untuk scrolled, nav biasa untuk hero
  const Wrapper: React.ElementType = isOnHero ? "nav" : motion.nav;
  const wrapperProps = isOnHero
    ? {
        key: "hero",
        className: "w-full z-50 absolute top-0 left-0 bg-transparent",
      }
    : {
        key: "scrolled",
        initial: { y: -100, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -100, opacity: 0 },
        transition: { duration: 0.4, ease: "easeOut" },
        className: "w-full z-50 fixed top-0 left-0",
      };

  return (
    <AnimatePresence mode="wait">
      <Wrapper {...wrapperProps}>
        <div className="max-w-7xl mx-auto">
          <div
            className={`flex h-30 items-center px-8 transition-all duration-300 ${
              isOnHero ? "text-primary-900" : "text-gray-900"
            }`}
          >
            <div
              className={`flex justify-between w-full items-center space-x-3 px-8 py-4 rounded-lg ${
                isOnHero
                  ? "bg-transparent"
                  : "bg-neutral-100/80 backdrop-blur-lg border border-neutral-200"
              }`}
            >
              {/* Logo with variant-specific styling */}
              <Link to={getLogoLink()} className="flex items-center space-x-3">
                <img src={mahirkuLogo} alt="Mahirku Logo" />
                <div className="flex flex-col">
                  <span className="text-lg font-heading font-bold">
                    Mahirku
                  </span>
                  {variant === "affiliator" && (
                    <span className="text-xs text-secondary-600 font-medium">
                      Partner Program
                    </span>
                  )}
                </div>
              </Link>

              {/* Back to Customer Site Link (for affiliator variant) */}
              {showBackToCustomer && variant === "affiliator" && (
                <div className="flex items-center">
                  <Link
                    to="/"
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    ← Kembali ke Situs Utama
                  </Link>
                </div>
              )}

              {/* Navigation Menu */}
              <div className="flex items-center gap-4 mr-23 text-body1 font-body relative">
                {sections.map((section) => {
                  const isActive = active === section.id;

                  // Special handling for specific sections
                  if (
                    section.id === ("kontak" as SectionName) ||
                    section.id === ("daftar" as SectionName)
                  ) {
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(section.id)}
                        className="relative px-2 py-1"
                      >
                        <span
                          className={`relative z-10 ${
                            variant === "affiliator"
                              ? "text-white"
                              : "text-primary-900"
                          }  ${
                            isOnHero
                              ? "hover:text-primary-200"
                              : "text-primary-900! hover:text-primary-600"
                          }`}
                        >
                          {section.label}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-blue-600"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                      </button>
                    );
                  }

                  return (
                    <a
                      key={section.id}
                      href={
                        variant === "affiliator"
                          ? `/affiliator/#${section.id}`
                          : `/#${section.id}`
                      }
                      onClick={() => setActive(section.id)}
                      className="relative px-2 py-1"
                    >
                      <span
                        className={`relative z-10 ${
                          variant === "affiliator"
                            ? "text-white"
                            : "text-primary-900"
                        } ${
                          isOnHero
                            ? "hover:text-primary-200"
                            : "text-primary-900! hover:text-primary-600"
                        }`}
                      >
                        {section.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-blue-600"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                    </a>
                  );
                })}
              </div>

              {/* Auth / User Section */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <Link to={getDashboardLink()}>
                      <Button variant="ghost" size="sm">
                        <Home className="w-5 h-5 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <div className="flex items-center space-x-2 text-sm">
                      {React.createElement(getRoleIcon(user.role), {
                        size: 16,
                      })}
                      <span className="max-w-32 truncate">{user.email}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role === "super_admin"
                          ? "Super Admin"
                          : user.role === "affiliator"
                          ? "Affiliator"
                          : "User"}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="w-5 h-5 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="space-x-2 flex items-center">
                    {/* Show different auth buttons based on variant */}
                    <Link to={config.authButtons.login.path}>
                      <Button
                        variant={
                          variant === "affiliator" ? "outline" : "secondary"
                        }
                        size="sm"
                      >
                        {config.authButtons.login.text}
                      </Button>
                    </Link>
                    <Link to={config.authButtons.register.path}>
                      <Button
                        variant={
                          variant === "affiliator" ? "secondary" : "default"
                        }
                        size="sm"
                      >
                        {config.authButtons.register.text}
                      </Button>
                    </Link>

                    {/* Cross-link for switching between customer and affiliator */}
                    {variant === "customer" && (
                      <Link to="/affiliator">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Jadi Partner
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    </AnimatePresence>
  );
};
