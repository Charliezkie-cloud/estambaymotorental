"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, Phone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [offcanvas, setOffcanvas] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  function toggleOffcanvas() {
    setOffcanvas(prev => !prev);
  }

  // Handle scroll backdrop effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-[#010F1F]/90 backdrop-blur-md py-4 border-b border-[#A88C6F]/30 shadow-lg"
            : "bg-[#010F1F] py-5 border-b border-[#A88C6F]/20"
        }`}
      >
        <div className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="font-heading font-extrabold text-xl md:text-2xl text-white tracking-wide group">
            Estambay <span className="text-primary group-hover:underline transition-all">Moto Rentals</span>
          </Link>

          {/* Action & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Button
              className="font-semibold hidden md:inline-flex px-5"
              onClick={() => {
                const el = document.getElementById("vehicles");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Book Now
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden border-[#A88C6F]/30 bg-[#051424]/60 text-white"
              onClick={toggleOffcanvas}
              aria-label="Toggle Menu"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Offcanvas Navigation */}
      <AnimatePresence>
        {offcanvas && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0 }}
            onClick={toggleOffcanvas}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />
        )}

        {offcanvas && (
          <motion.aside
            key="mobile-nav"
            initial={{ x: "-100%" }}
            animate={{ x: "0%", transition: { duration: 0.3, ease: "easeOut" } }}
            exit={{ x: "-100%", transition: { duration: 0.25, ease: "easeIn" } }}
            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-[#051424] border-r border-[#A88C6F]/30 z-50 shadow-2xl flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#A88C6F]/20">
                <Link href="/" onClick={toggleOffcanvas} className="font-heading font-extrabold text-lg text-white">
                  Estambay <span className="text-primary">Moto</span>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#A88C6F]/30 text-white hover:bg-white/10"
                  onClick={toggleOffcanvas}
                  aria-label="Close Menu"
                >
                  <X className="size-5" />
                </Button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-[#A88C6F]/20 space-y-4 bg-[#010F1F]/60">
              <div className="space-y-2 text-xs text-[#94A3B8]">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <span>Cebu City, Philippines</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-primary shrink-0" />
                  <span>0910 957 2971</span>
                </div>
              </div>

              <Button
                className="w-full font-semibold"
                onClick={() => {
                  toggleOffcanvas();
                  const el = document.getElementById("vehicles");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Book Now
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}