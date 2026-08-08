"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bike,
  BookOpen,
  CreditCard,
  Mail,
  MessageSquare,
  LogOut,
  Loader2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { logoutAdmin } from "@/lib/supabase/auth-actions";
import Image from "next/image";
import Logo from "@/public/favicon.jpg";

interface LinkItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  tooltip: string;
}

const NAV_ITEMS: LinkItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard />,
    tooltip: "Dashboard overview",
  },
  {
    title: "Vehicles",
    href: "/admin/vehicles",
    icon: <Bike />,
    tooltip: "Manage fleet vehicles",
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: <BookOpen />,
    tooltip: "View and manage bookings",
  },
  {
    title: "Payment Methods",
    href: "/admin/payment-methods",
    icon: <CreditCard />,
    tooltip: "Manage payment options",
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: <MessageSquare />,
    tooltip: "Manage customer reviews",
  },
  {
    title: "Email Templates",
    href: "/admin/email-template",
    icon: <Mail />,
    tooltip: "Preview notification emails",
  },
];

export const AdminSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { setOpenMobile, isMobile } = useSidebar();

  /**
   * Determines the active nav item.
   * Exact match for /admin (dashboard), prefix match for all others.
   */
  function isActiveLink(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  async function logoutUser() {
    setLogoutLoading(true);
    try {
      await logoutAdmin();
    } finally {
      setLogoutLoading(false);
    }
  }

  function onLinkClick(item: LinkItem) {
    router.push(item.href);
    if (isMobile) setOpenMobile(false);
  }

  return (
    <Sidebar collapsible="icon">
      {/* ── Header / Branding ─────────────────────────────── */}
      <SidebarHeader className="py-4 px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/admin" />}
              className="gap-3 px-2"
              tooltip="Estambay Moto Rentals"
            >
              {/* Logo mark */}
              <Image src={Logo} alt={"Estambay Moto Rentals Logo"} height={32} width={32} loading="lazy" className="rounded-full" />
              {/* Brand name */}
              <div className="flex flex-col leading-none">
                <span className="font-heading font-bold text-sm tracking-tight">
                  Estambay Moto
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                  Rentals Co.
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <Separator className="mb-2 opacity-50" />

      {/* ── Navigation ────────────────────────────────────── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 px-3 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {NAV_ITEMS.map((item) => {
                const active = isActiveLink(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      onClick={() => onLinkClick(item)}
                      isActive={active}
                      size="default"
                      tooltip={item.tooltip}
                      className="group/nav-item relative h-9 px-3 rounded-lg transition-all duration-150"
                    >
                      <span
                        className={
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover/nav-item:text-foreground"
                        }
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 font-medium">{item.title}</span>
                      {active && (
                        <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-primary opacity-70" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ────────────────────────────────────────── */}
      <Separator className="mt-2 opacity-50" />
      <SidebarFooter className="py-3 px-3 gap-2">
        {/* Admin badge */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/40 group-data-[collapsible=icon]:justify-center">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
          <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-semibold">Administrator</span>
            <span className="text-[10px] text-muted-foreground">Full access</span>
          </div>
        </div>

        {/* Logout */}
        <Button
          onClick={logoutUser}
          variant="outline"
          size="sm"
          disabled={logoutLoading}
          className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors duration-150 group-data-[collapsible=icon]:px-0"
        >
          {logoutLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span className="group-data-[collapsible=icon]:hidden">
            {logoutLoading ? "Signing out…" : "Sign out"}
          </span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
