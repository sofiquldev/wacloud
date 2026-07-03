import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ThreeColumnLayout } from "@/components/site/ThreeColumnLayout";
import { homepageWidgets } from "@/data/homepageWidgets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pabna Pourashava — Official Municipal Portal" },
      {
        name: "description",
        content:
          "Pabna Pourashava official portal: citizen services, notices, tenders, member directory and digital municipal management.",
      },
      { property: "og:title", content: "Pabna Pourashava — Official Municipal Portal" },
      {
        property: "og:description",
        content:
          "Citizen services, notices, tenders and council leadership for Pabna Pourashava.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout active="/">
      <ThreeColumnLayout widgets={homepageWidgets} />
    </SiteLayout>
  );
}
