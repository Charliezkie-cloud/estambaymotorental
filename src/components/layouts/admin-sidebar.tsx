import { useRouter } from "next/navigation";
import { Book, Car, Home, Loader2, MotorbikeIcon } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import {
  Sidebar, SidebarContent,
  SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SupabaseClient } from "@supabase/supabase-js";

type LinkItem = {
  title: string;
  href: string;
  icon: string | React.ReactNode;
};

type Props = {
  supabaseClient: SupabaseClient;
};

export default function AdminSidebar({ supabaseClient }: Props) {
  // Hooks
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { setOpenMobile, isMobile } = useSidebar();

  // Links
  const link: LinkItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <Home />
    },
    {
      title: "Vehicles",
      href: "/admin/vehicles",
      icon: <MotorbikeIcon />
    },
    {
      title: "Bookings",
      href: "/admin/bookings",
      icon: <Book />
    },
  ];

  // Handlers
  async function logoutUser() {
    setLogoutLoading(true);

    try {
      await supabaseClient.auth.signOut();
    } finally {
      setLogoutLoading(false);
    }
  }

  function onLinkClick(link: LinkItem) {
    router.push(link.href);
    if (isMobile) setOpenMobile(false);
  }

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Link href="/admin" className="font-heading font-semibold inline-flex justify-center gap-2">
                <Car />
                <span>Estambay Moto Rentals Co.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Body */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tables</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {link.map((item, index) => (
                <SidebarMenuItem key={`sidebar-menu-item-${index}`}>
                  <SidebarMenuButton onClick={() => onLinkClick(item)}>
                    {item.icon} {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <Button onClick={logoutUser} variant="destructive" disabled={logoutLoading}>
          Log out{" "}{logoutLoading && (<Loader2 className="animate-spin" />)}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}