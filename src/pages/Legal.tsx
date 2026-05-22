import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Legal() {
  const settings = useStore((s) => s.settings);
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <Card className="p-6">
          <Tabs defaultValue="terms">
            <TabsList>
              <TabsTrigger value="terms">بنود الاستخدام</TabsTrigger>
              <TabsTrigger value="privacy">سياسة الخصوصية</TabsTrigger>
            </TabsList>
            <TabsContent value="terms"><p className="whitespace-pre-wrap text-sm leading-7">{settings.termsText}</p></TabsContent>
            <TabsContent value="privacy"><p className="whitespace-pre-wrap text-sm leading-7">{settings.privacyText}</p></TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
}
