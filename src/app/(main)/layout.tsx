

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Megaphone,
  Boxes,
  Lightbulb,
  Bot,
  SlidersHorizontal,
  Building,
  ShoppingCart,
  Wallet,
  ShieldAlert,
  Users,
  FileText,
  Telescope,
  Cog,
  BookCopy,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
       <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-primary"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
      <span className="font-bold text-lg text-foreground group-data-[collapsible=icon]:hidden">TradeSmart</span>
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const mainNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/promotions", icon: Megaphone, label: "Promotions" },
    { href: "/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/products", icon: Boxes, label: "Products" },
    { href: "/hierarchy", icon: Building, label: "Organization Hierarchy" },
    { href: "/rules", icon: SlidersHorizontal, label: "Promotion Simulator" },
  ];

  const aiToolsNavItems = [
    { href: "/insights", icon: Lightbulb, label: "Insights" },
    { href: "/ai-schemes", icon: Bot, label: "AI Schemes" },
    { href: "/budget-allocator", icon: Wallet, label: "Budget Allocator" },
    { href: "/anomaly-detector", icon: ShieldAlert, label: "Anomaly Detector" },
    { href: "/competitor-analysis", icon: Telescope, label: "Competitor Analysis" },
    { href: "/rule-builder", icon: Cog, label: "Dynamic Rule Builder"},
    { href: "/dynamic-rule-simulator", icon: BookCopy, label: "Dynamic Rule Simulator"},
  ];

  const reportsNavItems = [
    { href: "/participation-report", icon: Users, label: "Retailer Participation Report"},
    { href: "/retailer-profiling", icon: FileText, label: "Retailer Profiling"},
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
            <SidebarMenu>
              {aiToolsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
           <SidebarGroup>
            <SidebarGroupLabel>Reports</SidebarGroupLabel>
            <SidebarMenu>
              {reportsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="group-data-[collapsible=icon]:hidden">
             <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex-1">
             {/* Search bar can go here */}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://picsum.photos/100/100" alt="User" data-ai-hint="person face" />
                    <AvatarFallback>SH</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Sales Head</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      sales.head@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
