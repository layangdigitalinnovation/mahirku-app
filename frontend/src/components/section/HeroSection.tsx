import { Button } from "@/components/ui/Button";
import dots from "@/assets/Dots.png"


import heroImg from "@/assets/Online Learning 5.png";

export const HeroSection = () => {
  return (
    <section
      id="beranda"
      key="beranda"
      className={`pb-20 bg-center pt-6 relative rounded-b-sm border-b border-b-neutral-200`}

      style={{
        backgroundImage: `url(${dots})`
      }}
    >
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between">
        <div className="bg-white pt-40 pb-20 px-8 space-y-6 rounded-2xs border border-neutral-200">
          <h1 className="text-heading1 max-w-xl text-primary-900 font-bold font-heading">
            Temukan Gaya Berpikir Anda Sekarang
          </h1>
          <p className="text-body1 text-neutral-900 max-w-2xl mx-auto font-body">
            Ungkap rahasia pola pikir Anda melalui tes numerologi dan sistem
            verifikasi biometrik kami yang canggih.
          </p>
          <Button size="lg" variant="secondary">
            Mulai Tes Sekarang
          </Button>
        </div>
        <div className="bg-white pt-40 pb-20 px-8 border border-neutral-200 rounded-2xs">
          <img src={heroImg} alt="" />
        </div>
      </div>
    </section>
  );
};