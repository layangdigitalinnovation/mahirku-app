import { Button } from "@/components/ui/button";
import dots from "@/assets/Dots.png";

import heroImg from "@/assets/Online Learning 5.png";
import googlePlayBadge from "@/assets/google-play-badge.svg";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section
      id="beranda"
      key="beranda"
      className={`pb-20 bg-center pt-6 relative rounded-b-sm border-b border-b-neutral-200`}
      style={{
        backgroundImage: `url(${dots})`,
      }}
    >
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 flex flex-col md:flex-row justify-between">
        <div className="bg-white pt-40 pb-20 px-8 space-y-6 rounded-2xs border border-neutral-200">
          <h1 className="text-heading1 max-w-xl text-primary-900 font-bold font-heading">
            Temukan Potensi Diri Anda Sekarang
          </h1>
          <p className="text-body1 text-neutral-900 max-w-2xl mx-auto font-body">
            temukan semua potensi diri anda dari kemampuan daya pikir, psikologi, dan mental untuk menuju kesuksesan
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link to="/register">Mulai Tes Sekarang</Link>
            </Button>
            <a href="https://play.google.com/store/apps/details?id=com.mahirku.app" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src={googlePlayBadge} alt="Get it on Google Play" className="h-11 w-auto" />
            </a>
          </div>
        </div>
        <div className="bg-white pt-40 pb-20 px-8 border border-neutral-200 rounded-2xs">
          <img src={heroImg} alt="" />
        </div>
      </div>
    </section>
  );
};
