import StageWidget from "@/components/StageWidget";

/**
 * Standalone embed page — designed to be loaded inside a CRM
 * custom-page iframe. No app chrome, no navigation, transparent-friendly.
 */
export default function StageWidgetEmbed() {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-6">
      <StageWidget />
    </main>
  );
}
