import { getAuthenticatedProfile } from "@/lib/supabase/queries";
import NavbarClient from "./navbar-client";

export default async function Navbar() {
  const profile = await getAuthenticatedProfile();
  return <NavbarClient profile={profile} />;
}
