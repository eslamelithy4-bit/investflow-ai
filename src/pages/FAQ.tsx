import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export default function FAQPage() {
  const faqs = useStore((s) => s.faqs);
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-black mb-4">الأسئلة الشائعة</h1>
          <Accordion type="single" collapsible>
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-right">{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </AppLayout>
  );
}
