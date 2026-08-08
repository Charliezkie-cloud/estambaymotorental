"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { ReactNode } from "react";

import { FaTiktok } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { businessInformation } from "@/lib/data/business-informations";

type ContactItem = {
  icon: ReactNode;
  label: string;
  href?: string;
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { name, address, city, phone, phoneTel, email, businessHours, social } = businessInformation;

  const socialLinks: ContactItem[] = [
    { icon: <FaFacebook className="size-5" />, label: "Facebook", href: social.facebook },
    { icon: <FaTiktok className="size-5" />, label: "TikTok", href: social.tiktok },
    { icon: <Mail className="size-5" />, label: email, href: `mailto:${email}` },
    { icon: <Phone className="size-5" />, label: phone, href: `tel:${phoneTel}` },
  ];

  function openToNewTab(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <footer className="bg-[#010F1F] border-t border-[#A88C6F]/30 text-[#94A3B8]">
      <div className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="font-heading font-extrabold text-2xl text-white inline-block hover:text-primary transition-colors">
              Estambay <span className="text-primary">Moto Rentals</span>
            </Link>
            <p className="text-sm max-w-sm leading-relaxed text-[#94A3B8]">
              Your trusted {businessHours.shortLabel} motorcycle and vehicle rental service in {city}. Skip the hassle and explore the city on your own terms.
            </p>
            <div className="flex items-start gap-2.5 text-sm pt-2">
              <MapPin className="size-4 text-primary shrink-0 mt-1" />
              <span>{address}</span>
            </div>
          </div>

          {/* Column 3: Contact & Social */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-white text-base uppercase tracking-wider">Connect With Us</h4>
            <p className="text-sm">Reach out directly for custom bookings or inquiries.</p>
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((item, index) => (
                <Tooltip key={`footer-social-${index}`}>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full border-[#A88C6F]/30 bg-[#051424]/40 hover:bg-primary/20 hover:border-primary/50 text-white transition-all"
                        onClick={() => item.href && openToNewTab(item.href)}
                      >
                        {item.icon}
                      </Button>
                    }
                  />
                  <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar / Copyright */}
        <div className="mt-12 pt-6 border-t border-[#A88C6F]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {currentYear} {name}. All rights reserved.</p>
          <p className="text-[#94A3B8]/70">Reliable & Affordable Ride Rentals in {city}</p>
        </div>
      </div>
    </footer>
  );
}
