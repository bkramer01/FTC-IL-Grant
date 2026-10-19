import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, ProgramBar, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { currentAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage() {
  if (await currentAdmin()) redirect("/");
  return (
    <>
      <SiteHeader />
      <ProgramBar>
        <span className="py-2.5 font-medium">FTC Illinois Matching Grants · Admin</span>
      </ProgramBar>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-8">
        <Card title="Admin sign in">
          <LoginForm />
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
