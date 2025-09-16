import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Home, Shield, DollarSign, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import mahirkuLogo from "@/assets/Logo (1).png";
import React, { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const config = navigationConfigs[variant];
  const sections = config.sections as { id: SectionName; label: string }[];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
    
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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-[4rem] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isOnHero = active === "beranda";

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <AnimatePresence mode="wait">
          {isOnHero ? (
            <nav
              key="hero"
              className="w-full z-50 absolute top-0 left-0 bg-transparent"
            >
              <div className="max-w-7xl mx-auto">
                <div className="flex h-30 items-center px-8 text-primary-900">
                  <div className="flex justify-between w-full items-center space-x-3 px-8 py-4 rounded-lg bg-transparent">
                    {/* Logo */}
                    <Link to={getLogoLink()} className="flex items-center space-x-3">
                      <img src={mahirkuLogo} alt="Mahirku Logo" />
                      <div className="flex flex-col">
                        <span className="text-lg font-heading font-bold">Mahirku</span>
                        {variant === "affiliator" && (
                          <span className="text-xs text-secondary-600 font-medium">
                            Partner Program
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Back to Customer Site Link */}
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
                              <span className={`relative z-10 ${
                                variant === "affiliator" ? "text-white" : "text-primary-900"
                              } hover:text-primary-200`}>
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
                            <span className={`relative z-10 ${
                              variant === "affiliator" ? "text-white" : "text-primary-900"
                            } hover:text-primary-200`}>
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
                            {React.createElement(getRoleIcon(user.role), { size: 16 })}
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
                          <Link to={config.authButtons.login.path}>
                            <Button
                              variant={variant === "affiliator" ? "outline" : "secondary"}
                              size="sm"
                            >
                              {config.authButtons.login.text}
                            </Button>
                          </Link>
                          <Link to={config.authButtons.register.path}>
                            <Button
                              variant={variant === "affiliator" ? "secondary" : "default"}
                              size="sm"
                            >
                              {config.authButtons.register.text}
                            </Button>
                          </Link>
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
            </nav>
          ) : (
            <motion.nav
              key="scrolled"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full z-50 fixed top-0 left-0"
            >
              <div className="max-w-7xl mx-auto">
                <div className="flex h-30 items-center px-8 text-gray-900">
                  <div className="flex justify-between w-full items-center space-x-3 px-8 py-4 rounded-lg bg-neutral-100/80 backdrop-blur-lg border border-neutral-200">
                    {/* Logo */}
                    <Link to={getLogoLink()} className="flex items-center space-x-3">
                      <img src={mahirkuLogo} alt="Mahirku Logo" />
                      <div className="flex flex-col">
                        <span className="text-lg font-heading font-bold">Mahirku</span>
                        {variant === "affiliator" && (
                          <span className="text-xs text-secondary-600 font-medium">
                            Partner Program
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Navigation Menu */}
                    <div className="flex items-center gap-4 mr-23 text-body1 font-body relative">
                      {sections.map((section) => {
                        const isActive = active === section.id;

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
                              <span className="relative z-10 text-primary-900 hover:text-primary-600">
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
                            <span className="relative z-10 text-primary-900 hover:text-primary-600">
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
                            {React.createElement(getRoleIcon(user.role), { size: 16 })}
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
                          <Link to={config.authButtons.login.path}>
                            <Button
                              variant={variant === "affiliator" ? "outline" : "secondary"}
                              size="sm"
                            >
                              {config.authButtons.login.text}
                            </Button>
                          </Link>
                          <Link to={config.authButtons.register.path}>
                            <Button
                              variant={variant === "affiliator" ? "secondary" : "default"}
                              size="sm"
                            >
                              {config.authButtons.register.text}
                            </Button>
                          </Link>
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
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navbar */}
      <div className="lg:hidden">
        <nav className={`w-full z-50 fixed top-0 left-0`}>
          <div className={`px-4 py-3  bg-neutral-100/95 backdrop-blur-lg border-b border-neutral-200`}>
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to={getLogoLink()} className="flex items-center space-x-2">
                <img src={mahirkuLogo} alt="Mahirku Logo" className="h-8" />
                <div className="flex flex-col">
                  <span className={`text-base font-heading font-bold ${
                variant === "affiliator" ? "text-primary-900" : "text-primary-900"
                  }`}>
                    Mahirku
                  </span>
                  {variant === "affiliator" && (
                    <span className="text-xs text-secondary-500 font-medium">
                      Partner Program
                    </span>
                  )}
                </div>
              </Link>

              {/* User info for logged in users (mobile) */}
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm">
                    {React.createElement(getRoleIcon(user.role), { 
                      size: 14,
                      className: isOnHero 
                        ? variant === "affiliator" ? "text-white" : "text-primary-900"
                        : "text-gray-900"
                    })}
                    <span className={`max-w-20 truncate text-xs ${
                      isOnHero 
                        ? variant === "affiliator" ? "text-white" : "text-primary-900"
                        : "text-gray-900"
                    }`}>
                      {user.email}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${
                    variant === "affiliator" 
                      ? "text-gray-900 hover:bg-primary-100/10" 
                      : "text-primary-900 hover:bg-primary-100/20"
                }`}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={closeMobileMenu}
              />

              {/* Mobile Menu */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 lg:hidden"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Menu</span>
                    <button
                      onClick={closeMobileMenu}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Back to Customer Site Link (mobile) */}
                  {showBackToCustomer && variant === "affiliator" && (
                    <div className="p-4 border-b border-gray-200">
                      <Link
                        to="/"
                        onClick={closeMobileMenu}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-2"
                      >
                        ← Kembali ke Situs Utama
                      </Link>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <div className="flex-1 py-4">
                    {sections.map((section) => {
                      const isActive = active === section.id;

                      if (
                        section.id === ("kontak" as SectionName) ||
                        section.id === ("daftar" as SectionName)
                      ) {
                        return (
                          <button
                            key={section.id}
                            onClick={() => handleSectionClick(section.id)}
                            className={`w-full text-left px-4 py-3 text-base font-medium transition-colors ${
                              isActive
                                ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600"
                                : "text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            {section.label}
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
                          onClick={() => {
                            setActive(section.id);
                            closeMobileMenu();
                          }}
                          className={`block px-4 py-3 text-base font-medium transition-colors ${
                            isActive
                              ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600"
                              : "text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {section.label}
                        </a>
                      );
                    })}
                  </div>

                  {/* Auth Section (mobile) */}
                  <div className="border-t border-gray-200 p-4">
                    {user ? (
                      <div className="space-y-3">
                        {/* User info */}
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          {React.createElement(getRoleIcon(user.role), { 
                            size: 20, 
                            className: "text-gray-600"
                          })}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.email}
                            </p>
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getRoleColor(
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
                        </div>

                        {/* Dashboard button */}
                        <Link to={getDashboardLink()} onClick={closeMobileMenu}>
                          <Button className="w-full justify-start" variant="outline">
                            <Home className="w-5 h-5 mr-2" />
                            Dashboard
                          </Button>
                        </Link>

                        {/* Logout button */}
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-5 h-5 mr-2" />
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Auth buttons */}
                        <Link to={config.authButtons.login.path} onClick={closeMobileMenu}>
                          <Button 
                            className="w-full" 
                            variant={variant === "affiliator" ? "outline" : "secondary"}
                          >
                            {config.authButtons.login.text}
                          </Button>
                        </Link>
                        
                        <Link to={config.authButtons.register.path} onClick={closeMobileMenu}>
                          <Button 
                            className="w-full" 
                            variant={variant === "affiliator" ? "default" : "default"}
                          >
                            {config.authButtons.register.text}
                          </Button>
                        </Link>

                        {/* Cross-link for switching between customer and affiliator */}
                        {variant === "customer" && (
                          <Link to="/affiliator" onClick={closeMobileMenu}>
                            <Button variant="ghost" className="w-full justify-start">
                              <DollarSign className="w-4 h-4 mr-2" />
                              Jadi Partner
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};