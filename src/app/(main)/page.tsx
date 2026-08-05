"use client";

import { Badge } from "@/components/ui/badge";
import { Dot } from "lucide-react";
import Image from "next/image";
import heroImage from "@/public/hero-image.jpg";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="py-4 md:py-6">

      {/*Hero section*/}
      <section className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto py-12">
        <div className="flex flex-col-reverse md:grid md:grid-rows-none md:grid-cols-2 gap-6">
          <div className="flex">
            <div className="my-auto space-y-6">
              <Badge className="uppercase font-heading bg-[#3B5E43]/20 text-[#A9D0AE] p-4" variant="secondary">
              <span className="tracking-widest flex items-center">
                Open Now{" "}<Dot/>{" "}24/7
              </span>
              </Badge>

              <h1 className="font-heading font-extrabold text-2xl md:text-6xl">
                Athletic Elegance on the <span className="text-primary">Rooftop.</span>
              </h1>

              <p className="text-[#94A3B8]">Experience Cebu&#39;s premier rooftop pickleball venue. Professional courts, city skyline views, and the elite sports culture of Skyline Pickle Club.</p>

              <Button className="px-6">Book a Motorcycle Now</Button>
            </div>

          </div>

          <div>
            <div className="relative overflow-hidden rounded-xl h-[600px] w-full group">
              <Image src={heroImage} alt="Hero Image" className="absolute object-cover" fill />
              <div className="absolute h-full w-full bg-linear-to-b from-transparent to-[#051424]/80 group-active:to-[#051424]/40 group-hover:to-[#051424]/40 transition-colors duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/*Vehicles*/}
      {/*<section className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto py-12">*/}
      {/*  <div>*/}
      {/*    <h2>Vehicles</h2>*/}
      {/*    <p>Our facility features two championship-standard courts designed with high-performance acrylic surfacing and professional LED lighting for night play.</p>*/}
      {/*  </div>*/}
      {/*</section>*/}

    </main>
  )
}