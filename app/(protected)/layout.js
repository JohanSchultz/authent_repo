import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const needsMfa =
    aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2";

  if (needsMfa) {
    redirect("/mfa/verify");
  }

  return <>{children}</>;
}
