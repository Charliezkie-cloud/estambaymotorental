"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { ReactNode } from "react";

import { FaTiktok } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ContactItem = {
  icon: ReactNode;
  label: string;
  href?: string;
};

export default function Footer() {
  // Constants
  const contactInfoItems: ContactItem[] = [
    { icon: <FaTiktok className="size-6" />, label: "@estambay02", href: "https://www.tiktok.com/@estambay02" },
    { icon: <Phone className="size-6"/>, label: "0910 957 2971" },
    { icon: <Mail className="size-6"/>, label: "aj.dano.32@gmail.com", href: "mailto:aj.dano.32@gmail.com" },
    { icon: <FaFacebook className="size-6"/>, label: "Estambay Moto Rental", href: "https://www.facebook.com/Estambaymotorentals" },
  ];

  // Helpers
  function openToNewTab(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <footer className="bg-[#010F1F] border-t border-t-[#A88C6F]/30">
      <div className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto py-12">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="space-y-4">
            <Link href="/" className="font-heading font-bold text-xl md:text-2xl inline-block">Estambay Moto Rentals</Link>

            <div className="space-y-2">
              <p className="flex items-center gap-2 text-[#94A3B8]">
                <MapPin /> 416 Candido Padilla Street, Cebu City, Philippines, 6000
              </p>
            </div>
          </div>

          <div className="mx-auto md:mx-0 md:ms-auto">
            <div className="flex gap-4">
              {contactInfoItems.map((item, index) =>
                item.href ? (
                  <Button variant="ghost" className="rounded-full" key={`footer-social-links-item-${index}`} onClick={() => openToNewTab(item.href ?? "")}>
                    {item.icon}
                  </Button>
                ) : (
                  <Tooltip key={`footer-social-links-no-href-item-${index}`}>
                    <TooltipTrigger
                      render={
                        <Button variant="ghost" className="rounded-full" key={`footer-social-links-${index}`}>
                          {item.icon}
                        </Button>
                      }
                    />
                    <TooltipContent>{item.label}</TooltipContent>
                  </Tooltip>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}