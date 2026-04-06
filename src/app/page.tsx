import Header from "@/components/landing/header";
import Hero from "@/components/landing/hero";
import ProblemPromise from "@/components/landing/problem-promise";
import HowItWorks from "@/components/landing/how-it-works";
import Credibility from "@/components/landing/credibility";
import DashboardTeaser from "@/components/landing/dashboard-teaser";
import Calculator from "@/components/landing/calculator";
import Plans from "@/components/landing/plans";
import Footer from "@/components/landing/footer";
import Contact from "@/components/landing/contact";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ProblemPromise />
        <HowItWorks />
        <Credibility />
        <DashboardTeaser />
        <Calculator />
        <Plans />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
