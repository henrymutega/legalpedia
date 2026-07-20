import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
//import WhyChooseSection from "@/components/WhyChooseSection";
import SeoHead from "@/components/cms/SeoHead";
import FaqSection from "@/components/cms/FaqSection";
import HeroFloatingCards from "@/components/home/HeroFloatingCards";
import PracticeAreasGrid from "@/components/home/PracticeAreasGrid";
import ClientPortalShowcase from "@/components/home/ClientPortalShowcase";
import LegalJourneySection from "@/components/home/LegalJourneySection";

import { Sparkles } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const heroImages = [hero1, hero2, hero3];

const HomePage = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 9000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <Layout>
      <SeoHead pageKey="home" fallbackTitle={t("hero.slide1")} fallbackDescription={t("hero.subtitle")} canonical="/" />

      {/* CINEMATIC HERO — background only, cards are the focus */}
      <section className="relative overflow-hidden bg-hero-mesh pt-20 lg:pt-24">
        {/* slow cross-fading background images */}
        <div className="absolute inset-0">
          {heroImages.map((img, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: i === currentSlide ? 1 : 0,
                scale: i === currentSlide ? 1 : 1.06,
              }}
              transition={{
                opacity: { duration: 2.8, ease: "easeInOut" },
                scale: { duration: 9, ease: "easeOut" },
              }}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                width={1920}
                height={1080}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </motion.div>
          ))}
          {/* layered cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/65 via-primary/55 to-primary" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/70 via-transparent to-gold/10" />
        </div>

        {/* ambient floating particles (reduced on mobile) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
          {[...Array(10)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute block w-1 h-1 rounded-full bg-gold/40"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            />
          ))}
        </div>

        {/* glow halos */}
        <div className="absolute top-1/4 left-10 w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-gold/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 lg:w-[28rem] lg:h-[28rem] rounded-full bg-navy-light/40 blur-[140px] pointer-events-none" />

        {/* slide indicators */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? "w-10 bg-gold" : "w-4 bg-cream/30 hover:bg-cream/50"}`}
              aria-label={`Background ${i + 1}`}
            />
          ))}
        </div>

        {/* Floating premium cards — the hero focus */}
        <div className="relative z-10 pt-10 sm:pt-14 lg:pt-16 pb-10 lg:pb-14">
          <HeroFloatingCards />

          {/* Badge below cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center mt-10 lg:mt-14"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-primary/40 backdrop-blur-md text-gold text-[11px] font-medium tracking-[0.18em] uppercase">
              <Sparkles size={12} />
              {t("hero.badge", "Modern Legal-Tech Platform")}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Client Portal showcase */}
      <ClientPortalShowcase />

      {/* Practice areas */}
      <PracticeAreasGrid />

      {/* Why Choose */}
      {/* <WhyChooseSection /> */}

      {/* Cinematic, human-led Legal Journey */}
      <LegalJourneySection />



      <FaqSection category="general" title={t("home.faq_title", "Frequently Asked Questions")} limit={6} />
    </Layout>
  );
};

export default HomePage;
