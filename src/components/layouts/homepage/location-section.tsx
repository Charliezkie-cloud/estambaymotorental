"use client";

import { Clock, Dot, Mail, MapPin, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { businessInformation } from "@/lib/data/business-informations";

interface LocationSectionProps {
  onBookRide: () => void;
}

export const LocationSection = ({ onBookRide }: LocationSectionProps) => {
  const { name, city, address, phone, email, businessHours, maps } = businessInformation;

  return (
    <section id="location" className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto py-12 scroll-mt-20">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold">
            Our Location & <span className="text-primary">Information</span>
          </h2>
          <p className="text-[#94A3B8]">
            Visit us at our main hub in {city} or reach out directly for inquiries and bookings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="flex flex-col justify-between space-y-6 bg-[#051424]/40 border border-[#A88C6F]/20 rounded-xl p-6 md:p-8 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="space-y-3">
                <Badge className="uppercase font-heading bg-[#3B5E43]/20 text-[#A9D0AE] p-3" variant="secondary">
                  <span className="tracking-widest flex items-center">
                    Open Now <Dot /> {businessHours.shortLabel}
                  </span>
                </Badge>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
                  {name}
                </h3>
              </div>

              <div className="space-y-4 text-[#94A3B8]">
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white">Address</p>
                    <p>{address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="size-5 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white">Business Hours</p>
                    <p>{businessHours.label}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="size-5 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white">Phone</p>
                    <p>{phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="size-5 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <a href={`mailto:${email}`} className="hover:text-primary transition-colors">
                      {email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#A88C6F]/20 flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2 border-[#A88C6F]/40 hover:bg-primary/10"
                onClick={() => window.open(maps.placeUrl, "_blank", "noopener,noreferrer")}
              >
                <MapPin className="size-4" /> Open in Google Maps
              </Button>
              <Button className="px-6" onClick={onBookRide}>
                Book a Ride
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl min-h-[350px] lg:min-h-[450px] w-full border border-[#A88C6F]/20 shadow-xl">
            <iframe
              title={`${name} Location`}
              src={maps.embedUrl}
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
  );
};
