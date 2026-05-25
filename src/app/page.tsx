import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_SESSION_COOKIE, AUTH_USER_COOKIE } from "@/lib/api/client";

export default async function Home() {
  const cookieStore = await cookies();
  const hasUser = !!cookieStore.get(AUTH_USER_COOKIE)?.value;
  const hasSession = cookieStore.get(AUTH_SESSION_COOKIE)?.value === "1";

  redirect(hasUser && hasSession ? "/dashboard" : "/login");
}

