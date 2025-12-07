

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
    LayoutDashboard, 
    Users, 
    TrendingUp, 
    Receipt, 
    FileText,
    Building2,
    Home,
    FileArchive // Added FileArchive import for the new Documents page
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Members",
    url: createPageUrl("Members"),
    icon: Users,
  },
  {
    title: "Contributions",
    url: createPageUrl("Contributions"),
    icon: TrendingUp,
  },
  {
    title: "Transactions",
    url: createPageUrl("Transactions"),
    icon: Receipt,
  },
  {
    title: "Mortgage",
    url: createPageUrl("Mortgage"),
    icon: Home,
  },
  {
    title: "Documents", // New navigation item for Documents
    url: createPageUrl("Documents"),
    icon: FileArchive,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: FileText,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary: 220 70% 50%;
            --primary-foreground: 220 70% 98%;
            --secondary: 220 30% 95%;
            --secondary-foreground: 220 30% 20%;
            --accent: 168 76% 42%;
            --accent-foreground: 168 76% 98%;
            --background: 0 0% 100%;
            --foreground: 220 30% 10%;
            --muted: 220 30% 96%;
            --muted-foreground: 220 30% 40%;
            --border: 220 30% 88%;
            --ring: 220 70% 50%;
          }
        `}
      </style>
      <div className="min-h-screen flex w-full bg-slate-50">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">F Street Property Tracker</h2>
                <p className="text-sm text-slate-500">Family LLC Management</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mb-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg group ${
                          location.pathname === item.url 
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">F Street Property Tracker</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

