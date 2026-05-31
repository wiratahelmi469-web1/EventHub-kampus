import { auth } from "../auth";
import { redirect } from "next/navigation";

export default async function IndexPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role || "mahasiswa";
  // Normalize key staf/staff role name
  const mappedRole = role === "staf" ? "staff" : role.toLowerCase();
  
  redirect(`/dashboard/${mappedRole}`);
}
