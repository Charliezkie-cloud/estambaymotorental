"use client";

import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleRow } from "@/types/models.types";

interface VehiclesSectionProps {
  vehicles: VehicleRow[];
  isLoadingVehicles: boolean;
  onBookVehicle: (vehicleId: number) => void;
}

type VehicleFilter = "all" | "available" | "maintenance";

export const VehiclesSection = ({
  vehicles,
  isLoadingVehicles,
  onBookVehicle,
}: VehiclesSectionProps) => {
  const [selectedFilter, setSelectedFilter] = useState<VehicleFilter>("all");

  const filteredVehicles = vehicles.filter((v) => {
    if (selectedFilter === "available") return v.status === 1;
    if (selectedFilter === "maintenance") return v.status === 2;
    return true;
  });

  return (
    <section id="vehicles" className="bg-[#010F1F] py-12 scroll-mt-20">
      <div className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-white">Vehicles</h2>
            <p className="text-[#94A3B8]">Check out our available fleet. Browse cars and bikes built for your trip.</p>
          </div>
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
              Available ({vehicles.filter((v) => v.status === 1).length})
            </Button>
            <Button
              size="sm"
              variant={selectedFilter === "maintenance" ? "default" : "outline"}
              className={selectedFilter !== "maintenance" ? "border-[#A88C6F]/30 text-[#94A3B8] hover:text-white" : ""}
              onClick={() => setSelectedFilter("maintenance")}
            >
              Maintenance ({vehicles.filter((v) => v.status === 2).length})
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
            filteredVehicles.map((e) => {
              const isAvailable = e.status === 1;
              return (
                <div
                  key={`vehicles-item-${e.id}`}
                  className="group relative flex flex-col justify-between rounded-xl overflow-hidden bg-[#051424]/60 border border-[#A88C6F]/20 hover:border-[#A88C6F]/50 transition-all duration-300 shadow-xl"
                >
                  <div className="relative h-64 w-full bg-white/95 overflow-hidden">
                    <Image
                      src={e.imageUrl ?? ""}
                      alt={`${e.model} ${e.vehicle_colors?.name} Image`}
                      loading="lazy"
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />

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

                  <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
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

                    <Button
                      className="w-full font-semibold"
                      disabled={!isAvailable}
                      onClick={() => onBookVehicle(e.id)}
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
  );
};
