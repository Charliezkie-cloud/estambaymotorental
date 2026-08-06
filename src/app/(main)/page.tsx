"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight, Dot, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";

import heroImage from "@/public/hero-image.jpg";
import heroImage2 from "@/public/hero-image-2.jpg";
import heroImage3 from "@/public/hero-image-3.jpg";
import heroImage4 from "@/public/hero-image-4.jpg";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Hero Slides ───────────────────────────────────────────────────────────
// To add more slides, push additional entries to this array.
// Each entry needs a `src` (static import or URL string) and an `alt` string.
const HERO_SLIDES = [
  { src: heroImage, alt: "Estambay Moto Rentals – Hero Image" },
  { src: heroImage2, alt: "Estambay Moto Rentals – Hero Image 2" },
  { src: heroImage3, alt: "Estambay Moto Rentals – Hero Image 3" },
  { src: heroImage4, alt: "Estambay Moto Rentals – Hero Image 4" },
];
const SLIDE_INTERVAL_MS = 5000;
import { PaymentMethodRow, VehicleRow } from "@/types/models.types";
import { toast } from "sonner";
import { getAllVehicles } from "@/lib/supabase/tables/vehicles-tables";
import { getAllPaymentMethods } from "@/lib/supabase/tables/payment-methods-table";

import { Skeleton } from "@/components/ui/skeleton";
import { CustomerBookingDialog } from "@/components/layouts/customer-booking-dialog";

import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import "filepond/dist/filepond.min.css";
import "yet-another-react-lightbox/styles.css";
import { registerPlugin } from "react-filepond";

// Register filepond plugins
registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize
);

export default function HomePage() {
  // ── Vehicle & booking states ──────────────────────────────────────────────
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState<boolean>(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRow[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "available" | "maintenance">("all");

  const filteredVehicles = vehicles.filter(v => {
    if (selectedFilter === "available") return v.status === 1;
    if (selectedFilter === "maintenance") return v.status === 2;
    return true;
  });

  const handleOpenBooking = (vehicleId?: number) => {
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
    } else {
      setSelectedVehicleId(null);
    }
    setIsBookingOpen(true);
  };

  // ── Hero slider states ────────────────────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalSlides = HERO_SLIDES.length;

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning, currentSlide]);

  const goToPrev = useCallback(() => {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
  }, [currentSlide, totalSlides, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide((currentSlide + 1) % totalSlides);
  }, [currentSlide, totalSlides, goToSlide]);

  // Auto-play: only active when there are multiple slides
  useEffect(() => {
    if (totalSlides <= 1) return;
    autoPlayRef.current = setTimeout(goToNext, SLIDE_INTERVAL_MS);
    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    };
  }, [currentSlide, totalSlides, goToNext]);

  // Use effects
  useEffect(() => {
    if (vehicles.length > 0) return;

    async function fetchVehicles() {
      try {
        setIsLoadingVehicles(true);
        const data = await getAllVehicles();
        setVehicles(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Vehicles", {
          description: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setIsLoadingVehicles(false);
      }
    }

    fetchVehicles();
  }, []);

  useEffect(() => {
    if (paymentMethods.length > 0) return;

    async function fetchPaymentMethods() {
      try {
        const data = await getAllPaymentMethods();
        setPaymentMethods(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Payment Methods", {
          description: error instanceof Error ? error.message : String(error)
        });
      }
    }

    fetchPaymentMethods();
  }, []);

  return (
    <main className="pt-4 md:pt-6">

      {/*Hero section*/}
      <section className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto py-12">
        <div className="flex flex-col-reverse md:grid md:grid-rows-none md:grid-cols-2 gap-6">
          <div className="flex">
            <div className="my-auto space-y-6">
              <Badge className="uppercase font-heading bg-[#3B5E43]/20 text-[#A9D0AE] p-3" variant="secondary">
                <span className="tracking-widest flex items-center">
                  Open Now <Dot /> 24/7 Service
                </span>
              </Badge>

              <h1 className="font-heading font-extrabold text-2xl md:text-6xl">
                Your Ride, <span className="text-primary">Ready.</span>
              </h1>
              <p className="text-[#94A3B8]">Skip the last-minute headache of finding a ride. Reserve your vehicle ahead of time with Estambay Auto Moto Rentals and just focus on the trip.
              </p>
              <Button className="px-6" onClick={() => handleOpenBooking()}>Book a Motorcycle Now</Button>
            </div>
          </div>

          {/* ── Hero Image Slider ─────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-xl h-[600px] w-full shadow-2xl group">

            {/* Slides */}
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={idx === 0}
                  className="object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#051424]/80 group-hover:to-[#051424]/40 transition-colors duration-300" />
              </div>
            ))}

            {/* Arrow navigation – only shown when there are multiple slides */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  aria-label="Previous slide"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-[#051424]/60 border border-[#A88C6F]/30 text-white hover:bg-[#051424]/90 hover:border-[#A88C6F]/60 active:scale-95 transition-all duration-200 backdrop-blur-sm"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={goToNext}
                  aria-label="Next slide"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-[#051424]/60 border border-[#A88C6F]/30 text-white hover:bg-[#051424]/90 hover:border-[#A88C6F]/60 active:scale-95 transition-all duration-200 backdrop-blur-sm"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            {/* Dot indicators – only shown when there are multiple slides */}
            {totalSlides > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      idx === currentSlide
                        ? "w-6 h-2.5 bg-primary"
                        : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="vehicles" className="bg-[#010F1F] py-12 scroll-mt-20">
        <div className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-white">Vehicles</h2>
              <p className="text-[#94A3B8]">Check out our available fleet. Browse cars and bikes built for your trip.</p>
            </div>
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={selectedFilter === "all" ? "default" : "outline"}
                className={selectedFilter !== "all" ? "border-[#A88C6F]/30 text-[#94A3B8] hover:text-white" : ""}
                onClick={() => setSelectedFilter("all")}
              >
                All Fleet ({vehicles.length})
              </Button>
              <Button
                size="sm"
                variant={selectedFilter === "available" ? "default" : "outline"}
                className={selectedFilter !== "available" ? "border-[#A88C6F]/30 text-[#94A3B8] hover:text-white" : ""}
                onClick={() => setSelectedFilter("available")}
              >
                Available ({vehicles.filter(v => v.status === 1).length})
              </Button>
              <Button
                size="sm"
                variant={selectedFilter === "maintenance" ? "default" : "outline"}
                className={selectedFilter !== "maintenance" ? "border-[#A88C6F]/30 text-[#94A3B8] hover:text-white" : ""}
                onClick={() => setSelectedFilter("maintenance")}
              >
                Maintenance ({vehicles.filter(v => v.status === 2).length})
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingVehicles ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`vehicle-skeleton-${index}`}
                  className="relative h-[540px] w-full overflow-hidden rounded-xl bg-[#051424]/40 border border-[#A88C6F]/10 flex flex-col justify-between p-6"
                >
                  <Skeleton className="w-full h-64 rounded-lg bg-[#051424]" />
                  <div className="space-y-4 mt-auto">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/3 bg-[#051424]" />
                      <Skeleton className="h-6 w-2/3 bg-[#051424]" />
                    </div>
                    <div className="flex justify-between gap-2">
                      <Skeleton className="h-10 w-1/4 bg-[#051424]" />
                      <Skeleton className="h-10 w-1/4 bg-[#051424]" />
                      <Skeleton className="h-10 w-1/4 bg-[#051424]" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-md bg-[#051424]" />
                  </div>
                </div>
              ))
            ) : filteredVehicles.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-3 bg-[#051424]/30 rounded-xl border border-[#A88C6F]/10">
                <p className="text-white font-semibold text-lg">No vehicles found</p>
                <p className="text-[#94A3B8]">Try selecting a different filter category.</p>
              </div>
            ) : (
              filteredVehicles.map(e => {
                const isAvailable = e.status === 1;
                return (
                  <div
                    key={`vehicles-item-${e.id}`}
                    className="group relative flex flex-col justify-between rounded-xl overflow-hidden bg-[#051424]/60 border border-[#A88C6F]/20 hover:border-[#A88C6F]/50 transition-all duration-300 shadow-xl"
                  >
                    {/* Top Header / Image Container */}
                    <div className="relative h-64 w-full bg-white/95 overflow-hidden">
                      <Image
                        src={e.imageUrl ?? ""}
                        alt={`${e.model} ${e.vehicle_colors?.name} Image`}
                        loading="lazy"
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Status & Year Badges Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <Badge
                          className={`font-semibold px-2.5 py-1 text-xs border ${
                            isAvailable
                              ? "bg-[#3B5E43]/90 text-[#A9D0AE] border-[#3B5E43]"
                              : "bg-amber-950/90 text-amber-300 border-amber-800"
                          }`}
                        >
                          {isAvailable ? "Available" : "Maintenance"}
                        </Badge>

                        {e.year_model && (
                          <Badge variant="secondary" className="bg-[#051424]/80 text-[#94A3B8] border border-[#A88C6F]/20 text-xs">
                            {e.year_model}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                      {/* Model & Color */}
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="text-white font-heading font-extrabold text-lg uppercase tracking-wide">
                            {e.model}
                          </h3>
                        </div>
                        <p className="text-[#94A3B8] text-sm font-medium">
                          Color: <span className="text-white">{e.vehicle_colors?.name ?? "Standard"}</span>
                        </p>
                      </div>

                      {/* Pricing Breakdown Grid */}
                      <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-lg bg-[#010F1F]/60 border border-[#A88C6F]/15">
                        <div className="text-center">
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Daily</span>
                          <span className="text-xs sm:text-sm font-semibold text-white">
                            {e.daily_price.toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="text-center border-x border-[#A88C6F]/15 px-1">
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Half Day</span>
                          <span className="text-xs sm:text-sm font-semibold text-white">
                            {e.half_day_price.toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Hourly</span>
                          <span className="text-xs sm:text-sm font-semibold text-white">
                            {e.hourly_price.toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        className="w-full font-semibold"
                        disabled={!isAvailable}
                        onClick={() => handleOpenBooking(e.id)}
                      >
                        {isAvailable ? "Book Now" : "Unavailable"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section id="location" className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto py-12 scroll-mt-20">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold">
              Our Location & <span className="text-primary">Information</span>
            </h2>
            <p className="text-[#94A3B8]">
              Visit us at our main hub in Cebu City or reach out directly for inquiries and bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Business Info Details */}
            <div className="flex flex-col justify-between space-y-6 bg-[#051424]/40 border border-[#A88C6F]/20 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Badge className="uppercase font-heading bg-[#3B5E43]/20 text-[#A9D0AE] p-3" variant="secondary">
                    <span className="tracking-widest flex items-center">
                      Open Now <Dot /> 24/7 Service
                    </span>
                  </Badge>
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
                    Estambay Moto Rentals
                  </h3>
                </div>

                <div className="space-y-4 text-[#94A3B8]">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-white">Address</p>
                      <p>416 Candido Padilla Street, Cebu City, Philippines, 6000</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="size-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-white">Business Hours</p>
                      <p>24 Hours a day / 7 Days a week</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="size-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-white">Phone</p>
                      <p>0910 957 2971</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="size-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-white">Email</p>
                      <a href="mailto:aj.dano.32@gmail.com" className="hover:text-primary transition-colors">
                        aj.dano.32@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#A88C6F]/20 flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2 border-[#A88C6F]/40 hover:bg-primary/10" onClick={() => window.open("https://www.google.com/maps/place/Estambay+Moto+Rental/@10.292249,123.883894,1344m/data=!3m2!1e3!4b1!4m6!3m5!1s0x33a99d005578dcad:0xe6670b6ca249f304!8m2!3d10.292249!4d123.883894!16s%2Fg%2F11m_38jy_y?entry=ttu&g_ep=EgoyMDI2MDgwMy4wIKXMDSoASAFQAw%3D%3D", "_blank", "noopener,noreferrer")}>
                  <MapPin className="size-4" /> Open in Google Maps
                </Button>
                <Button className="px-6" onClick={() => handleOpenBooking()}>
                  Book a Ride
                </Button>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="relative overflow-hidden rounded-xl min-h-[350px] lg:min-h-[450px] w-full border border-[#A88C6F]/20 shadow-xl">
              <iframe
                title="Estambay Moto Rental Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3925.3941427189196!2d123.883894!3d10.292249!2m3!1f0!0!f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a99d005578dcad%3A0xe6670b6ca249f304!2sEstambay%20Moto%20Rental!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[350px] lg:min-h-[450px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#010F1F] py-16 mt-12">
        <div className="max-w-4xl mx-4 sm:mx-6 md:mx-8 lg:mx-auto text-center space-y-6">
          <Badge className="uppercase font-heading bg-[#3B5E43]/20 text-[#A9D0AE] px-4 py-2" variant="secondary">
            <span className="tracking-widest">Ready to Explore?</span>
          </Badge>
          <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white">
            Ready to Hit the Road? <span className="text-primary">Book Your Ride Today!</span>
          </h2>
          <p className="text-[#94A3B8] text-base md:text-lg max-w-2xl mx-auto">
            Experience the freedom of Cebu on two wheels with seamless online booking, flexible rates, and 24/7 service.
          </p>
          <div className="pt-2">
            <Button size="lg" className="px-8 text-base font-semibold" onClick={() => handleOpenBooking()}>
              Book Your Ride Now
            </Button>
          </div>
        </div>
      </section>

      <CustomerBookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        vehicles={vehicles}
        paymentMethods={paymentMethods}
        selectedVehicleId={selectedVehicleId}
      />
    </main>
  );
}