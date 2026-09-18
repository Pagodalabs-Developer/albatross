import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";

export default async function AdminPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  redirect("/admin/events");
}
