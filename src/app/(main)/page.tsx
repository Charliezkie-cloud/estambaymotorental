"use client";

import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Dot } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { registerPlugin } from "react-filepond";

import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";
import "yet-another-react-lightbox/styles.css";

import heroImage from "@/public/hero-image.jpg";
import heroImage2 from "@/public/hero-image-2.jpg";
import heroImage3 from "@/public/hero-image-3.jpg";
import heroImage4 from "@/public/hero-image-4.jpg";

import { Button } from "@/components/ui/button";
import { CustomerBookingDialog } from "@/components/layouts/customer-booking-dialog";
import { VehiclesSection } from "@/components/layouts/homepage/vehicles-section";
import { LocationSection } from "@/components/layouts/homepage/location-section";
import { ReviewsSection } from "@/components/layouts/homepage/reviews-section";
import { businessInformation } from "@/lib/data/business-informations";
import { getAllPaymentMethods } from "@/lib/supabase/tables/payment-methods-table";
import { getPublishedReviews } from "@/lib/supabase/tables/reviews-table";
import { getAllVehicles } from "@/lib/supabase/tables/vehicles-tables";
import { PaymentMethodRow, ReviewsRow, VehicleRow } from "@/types/models.types";

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
  const [reviews, setReviews] = useState<ReviewsRow[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRow[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

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

  useEffect(() => {
    if (reviews.length > 0) return;

    async function fetchReviews() {
      try {
        setIsLoadingReviews(true);
        const data = await getPublishedReviews();
        setReviews(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Reviews", {
          description: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setIsLoadingReviews(false);
      }
    }

    fetchReviews();
  }, []);

  const { name, city, businessHours } = businessInformation;

  return (
    <main className="pt-4 md:pt-6">

      {/*Hero section*/}
      <section className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto py-12">
        <div className="flex flex-col-reverse md:grid md:grid-rows-none md:grid-cols-2 gap-6">
          <div className="flex">
            <div className="my-auto space-y-6">
              <Badge className="uppercase font-heading bg-[#3B5E43]/20 text-[#A9D0AE] p-3" variant="secondary">
                <span className="tracking-widest flex items-center">
                  Open Now <Dot /> {businessHours.shortLabel}
                </span>
              </Badge>

              <h1 className="font-heading font-extrabold text-2xl md:text-6xl">
                Your Ride, <span className="text-primary">Ready.</span>
              </h1>
              <p className="text-[#94A3B8]">Skip the last-minute headache of finding a ride. Reserve your vehicle ahead of time with {name} and just focus on the trip.
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

      <VehiclesSection
        vehicles={vehicles}
        isLoadingVehicles={isLoadingVehicles}
        onBookVehicle={(vehicleId) => handleOpenBooking(vehicleId)}
      />

      <LocationSection onBookRide={() => handleOpenBooking()} />

      <ReviewsSection reviews={reviews} isLoadingReviews={isLoadingReviews} />

      <section className="py-16 mt-12">
        <div className="max-w-4xl mx-4 sm:mx-6 md:mx-8 lg:mx-auto text-center space-y-6">
          <Badge className="uppercase font-heading bg-[#3B5E43]/20 text-[#A9D0AE] px-4 py-2" variant="secondary">
            <span className="tracking-widest">Ready to Explore?</span>
          </Badge>
          <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white">
            Ready to Hit the Road? <span className="text-primary">Book Your Ride Today!</span>
          </h2>
          <p className="text-[#94A3B8] text-base md:text-lg max-w-2xl mx-auto">
            Experience the freedom of {city} on two wheels with seamless online booking, flexible rates, and {businessHours.shortLabel.toLowerCase()}.
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
