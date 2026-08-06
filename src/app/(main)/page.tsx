"use client";

import { Badge } from "@/components/ui/badge";
import { Dot } from "lucide-react";
import Image from "next/image";
import heroImage from "@/public/hero-image.jpg";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { PaymentMethodRow, VehicleRow } from "@/types/models.types";
import { toast } from "sonner";
import { getAllVehicles } from "@/lib/supabase/tables/vehicles-tables";
import { getAllPaymentMethods } from "@/lib/supabase/tables/payment-methods-table";

export default function HomePage() {
  // States
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRow[]>([]);

  // Use effects
  useEffect(() => {
    if (vehicles.length > 0) return;

    async function fetchVehicles() {
      try {
        const data = await getAllVehicles();
        setVehicles(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Vehicles", {
          description: error instanceof Error ? error.message : String(error)
        });
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
                Your Ride, <span className="text-primary">Ready.</span>
              </h1>
              <p className="text-[#94A3B8]">Skip the last-minute headache of finding a ride. Reserve your vehicle ahead of time with Estambay Auto Moto Rentals and just focus on the trip.
              </p>
              <Button className="px-6">Book a Motorcycle Now</Button>
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
            {vehicles.map(e => (
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
                      <Button className="w-full">Book Now</Button>
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
                      <Button className="w-full">Book Now</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}