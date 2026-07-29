import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import Problem from "@/components/site/Problem";
import Solution from "@/components/site/Solution";
import Architecture from "@/components/site/Architecture";
import GemmaIntegration from "@/components/site/GemmaIntegration";
import StackUsers from "@/components/site/StackUsers";
import CtaFooter from "@/components/site/CtaFooter";

export default function Home() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
      <Header />
      <Hero />
      <Problem />
      <Solution />
      <Architecture />
      <GemmaIntegration />
      <StackUsers />
      <CtaFooter />
    </div>
  );
}
