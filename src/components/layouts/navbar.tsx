"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function Navbar() {
  // States
  const [offcanvas, setOffcanvas] = useState(false);

  // Handlers
  function toggleOffcanvas() {
    setOffcanvas(prev => !prev);
  }

  return (
    <>
      <nav className="py-6 border-b border-b-[#A88C6F]/20">
        <div className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto flex items-center">
          <div>
            <Link href="/" className="font-heading font-bold text-xl md:text-2xl">Estambay Moto Rentals</Link>
          </div>

          <div className="ms-auto">
            <Button className="font-semibold hidden md:block px-4">Book Now</Button>
            <Button className="block md:hidden" onClick={toggleOffcanvas}>
              <Menu />
            </Button>
          </div>
        </div>
      </nav>

      {/*Mobile nav*/}
      <AnimatePresence>
        {offcanvas && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } }}
            exit={{ opacity: 0 }}
            className="fixed backdrop-blur-sm bg-black/25 top-0 left-0 right-0 bottom-0 z-40 pointer-events-none"
          />
        )}

        {offcanvas && (
          <motion.aside
            key="mobile-nav"
            initial={{ translateX: "-100%" }}
            animate={{ translateX: "0", transition: { duration: 0.3, ease: "easeInOut" } }}
            exit={{ translateX: "-100%" }}
            className="fixed top-0 left-0 right-0 bottom-0 z-50 pointer-events-none"
          >
            <div className="flex flex-col w-96 h-full bg-[#051424] border-e border-e-[#A88C6F]/20 pointer-events-auto">
              <div className="flex pt-4 pe-4">
                <Button variant="outline" className="ms-auto" onClick={toggleOffcanvas}>
                  <X />
                </Button>
              </div>
              <div className="px-6 pb-6 border-b border-b-[#A88C6F]/20">
                <Link href="/" className="font-heading font-bold text-xl">Estambay Moto Rentals</Link>
              </div>

              <div className="p-6">
                <Button className="w-full">Book Now</Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}