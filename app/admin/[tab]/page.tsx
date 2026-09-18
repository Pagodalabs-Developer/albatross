import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/dashboard";
import { isAuthed } from "@/lib/auth";
import { ADMIN_TABS, type AdminTab } from "@/lib/types";
import {
  getCrew,
  getEvents,
  getGalleryImages,
  getMembers,
  getNewsItems,
  getCatalogs,
  getSiteSettings,
} from "@/lib/db";

export const metadata: Metadata = { title: "Admin — Albatross" };

type Props = { params: Promise<{ tab: string }> };

function isAdminTab(value: string): value is AdminTab {
  return (ADMIN_TABS as readonly string[]).includes(value);
}

export default async function AdminTabPage({ params }: Props) {
  if (!(await isAuthed())) redirect("/admin/login");

  const { tab } = await params;
  if (!isAdminTab(tab)) notFound();

  const [events, catalogs, news, members, crew, gallery, settings] = await Promise.all([
    getEvents(),
    getCatalogs(),
    getNewsItems(),
    getMembers(),
    getCrew(),
    getGalleryImages(),
    getSiteSettings(),
  ]);

  return (
    <AdminDashboard
      data={{ events, catalogs, news, members, crew, gallery }}
      settings={settings}
      activeTab={tab}
    />
  );
}
