"use client";

import { PanelLeft } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminResponsiveSidebarTrigger() {
  const { toggleSidebar, openMobile } = useSidebar();

  return (
    <div className="flex items-center gap-2 px-4 py-3 md:hidden border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <Button
        id="admin-mobile-sidebar-trigger"
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        aria-label={openMobile ? "Close navigation" : "Open navigation"}
        aria-expanded={openMobile}
        className={cn(
          "h-8 w-8 p-0 rounded-lg transition-colors duration-150",
          openMobile && "bg-accent text-accent-foreground"
        )}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
      <span className="font-heading font-semibold text-sm tracking-tight">
        Estambay Moto Rentals
      </span>
    </div>
  );
}