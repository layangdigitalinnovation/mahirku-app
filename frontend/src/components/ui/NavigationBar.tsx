import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Home, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import mahirkuLogo from "@/assets/Logo (1).png";
import React from "react";
import { useActiveSection } from "@/context/ActiveSectionContext";
import type { SectionName } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const sections: { id: SectionName; label: string }[] = [
  { id: "beranda", label: "Beranda" },
  { id: "layanan", label: "Layanan" },
  { id: "paket", label: "Paket" },
  { id: "kontak", label: "Kontak" },
];

export const NavigationBar: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { active, setActive } = useActiveSection();

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
        return User;
      default:
        return User;
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
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3">
                <img src={mahirkuLogo} alt="Mahirku Logo" />
                <span className="text-lg font-heading font-bold">Mahirku</span>
              </Link>

              {/* Menu */}
              <div className="flex items-center gap-4 mr-23 text-body1 font-body relative">
                {sections.map((section) => {
                  const isActive = active === section.id;
                  if (section.id === "kontak"){
                    return (
                                          <Link
                      key={section.id}
                      to={`/${section.id}`}
                      onClick={() => setActive(section.id)}
                      className="relative px-2 py-1"
                    >
                      <span
                        className={`relative z-10 ${
                          isOnHero
                            ? "hover:text-primary-200"
                            : "hover:text-primary-600"
                        }`}
                      >
                        {section.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-blue-600"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                    )
                  }
                  return (
                    <a
                      key={section.id}
                      href={`/#${section.id}`}
                      onClick={() => setActive(section.id)}
                      className="relative px-2 py-1"
                    >
                      <span
                        className={`relative z-10 ${
                          isOnHero
                            ? "hover:text-primary-200"
                            : "hover:text-primary-600"
                        }`}
                      >
                        {section.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-blue-600"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </a>
                  );
                })}
              </div>

              {/* Auth / User */}
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
                      <span>{user.email}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role === "super_admin"
                          ? "Super Admin"
                          : user.role}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5 mr-2" />

                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="space-x-2">
                    <Link to="/login">
                      <Button variant="secondary">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button>
                        Register
                      </Button>
                    </Link>
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
