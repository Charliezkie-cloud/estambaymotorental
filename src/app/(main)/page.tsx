"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, Dot, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import heroImage from "@/public/hero-image.jpg";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
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
  // States
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState<boolean>(true);
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
              <Badge className="uppercase font-heading bg-[#3B5E43]/20 text-[#A9D0AE] p-4" variant="secondary">
              <span className="tracking-widest flex items-center">
                Open Now{" "}<Dot/>{" "}24/7
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

          <div>
            <div className="relative overflow-hidden rounded-xl h-[600px] w-full group shadow-2xl">
              <Image src={heroImage} alt="Hero Image" className="absolute object-cover" fill />
              <div className="absolute h-full w-full bg-linear-to-b from-transparent to-[#051424]/80 group-active:to-[#051424]/40 group-hover:to-[#051424]/40 transition-colors duration-300" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#010F1F] py-12">
        <div className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto space-y-6">
          <div className="space-y-4">
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold">Vehicles</h2>
            <p className="text-[#94A3B8]">Check out what we’re driving. Browse cars and bikes.</p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`}>
            {isLoadingVehicles ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`vehicle-skeleton-${index}`}
                  className="relative h-[600px] w-full overflow-hidden rounded-xl bg-[#051424]/40 border border-[#A88C6F]/10 flex flex-col justify-between p-6"
                >
                  <Skeleton className="w-full h-72 rounded-lg bg-[#051424]" />
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
            ) : (
              vehicles.map(e => (
                <div key={`vehicles-item-${e.id}`} className="relative h-[600px] w-full overflow-hidden rounded-xl group">
                  <div className="absolute h-full w-full bg-white">
                    <Image src={e.imageUrl ?? ""} alt={`${e.model} ${e.vehicle_colors?.name} Image`} loading="lazy" fill className="object-contain object-top md:object-center transition-all scale-100 group-hover:scale-110 group-active:scale-110 duration-300" />
                    <div className="absolute h-full w-full bg-linear-to-b from-transparent to-[#051424]/80 group-hover:to-transparent group-active:to-transparent transition-colors duration-300" />
                  </div>

                  <div className="hidden md:flex absolute h-full w-full transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                    <div className="mt-auto w-full px-6 py-4 space-y-4 bg-[#051424]/80 backdrop-blur-sm border-t border-t-[#A88C6F]/30">
                      <div className="space-y-2">
                        <h3 className="text-white duration-300 font-heading font-extrabold uppercase tracking-wider md:text-lg">Model & Color</h3>
                        <p className="text-[#94A3B8] duration-300 font-semibold">{e.model} - {e.vehicle_colors?.name}</p>
                      </div>

                      <div className="flex">
                        <div className="space-y-2">
                          <h3 className="text-white duration-300 font-heading font-extrabold uppercase tracking-wider md:text-lg">Daily</h3>
                          <p className="text-[#94A3B8] duration-300 font-semibold">{e.daily_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p>
                        </div>
                        <div className="space-y-2 mx-auto">
                          <h3 className="text-white duration-300 font-heading font-extrabold uppercase tracking-wider md:text-lg">Half Day</h3>
                          <p className="text-[#94A3B8] duration-300 font-semibold">{e.half_day_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-white duration-300 font-heading font-extrabold uppercase tracking-wider md:text-lg">Hourly</h3>
                          <p className="text-[#94A3B8] duration-300 font-semibold">{e.hourly_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p>
                        </div>
                      </div>

                      <div>
                        <Button className="w-full" onClick={() => handleOpenBooking(e.id)}>Book Now</Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:hidden absolute h-full w-full">
                    <div className="mt-auto w-full px-6 py-4 space-y-4 bg-[#051424]/80 backdrop-blur-2xl border-t border-t-[#A88C6F]/30">
                      <div className="space-y-2">
                        <h3 className="text-white duration-300 font-heading font-extrabold uppercase tracking-wider md:text-lg">Model & Color</h3>
                        <p className="text-[#94A3B8] duration-300 font-semibold">{e.model} - {e.vehicle_colors?.name}</p>
                      </div>

                      <div className="flex">
                        <div className="space-y-2">
                          <h3 className="text-white duration-300 font-heading font-extrabold uppercase tracking-wider md:text-lg">Daily</h3>
                          <p className="text-[#94A3B8] duration-300 font-semibold">{e.daily_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p>
                        </div>
                        <div className="space-y-2 mx-auto">
                          <h3 className="text-white duration-300 font-heading font-extrabold uppercase tracking-wider md:text-lg">Half Day</h3>
                          <p className="text-[#94A3B8] duration-300 font-semibold">{e.half_day_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-white duration-300 font-heading font-extrabold uppercase tracking-wider md:text-lg">Hourly</h3>
                          <p className="text-[#94A3B8] duration-300 font-semibold">{e.hourly_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p>
                        </div>
                      </div>

                      <div>
                        <Button className="w-full" onClick={() => handleOpenBooking(e.id)}>Book Now</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto py-12">
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
                    Estambay Moto Rentals Hub
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