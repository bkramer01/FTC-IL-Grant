import { Card, ProgramBar, SiteFooter, SiteHeader } from "@/components/SiteChrome";

// Placeholder home page until the grant pages are built.
export default function Home() {
  return (
    <>
      <SiteHeader />
      <ProgramBar>
        <span className="py-2.5 font-medium">FIRST Tech Challenge · Illinois Team Grants</span>
      </ProgramBar>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-5">
        <Card title="FTC Illinois Grants">
          <p>This site is under construction.</p>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
