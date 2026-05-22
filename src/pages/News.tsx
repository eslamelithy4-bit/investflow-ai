import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pin } from "lucide-react";

export default function News() {
  const articles = useStore((s) => s.articles);
  const sorted = [...articles].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-3">
        <h1 className="text-2xl font-black">الأخبار والإعلانات</h1>
        {sorted.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex items-center gap-2 mb-2">
              {a.pinned && <Badge className="bg-warning text-warning-foreground"><Pin className="w-3 h-3 ml-1" />مثبّت</Badge>}
              <h2 className="font-bold text-lg">{a.title}</h2>
            </div>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">{a.body}</p>
            <div className="text-xs text-muted-foreground mt-2">{new Date(a.createdAt).toLocaleString("ar-EG")}</div>
          </Card>
        ))}
        {sorted.length === 0 && <p className="text-muted-foreground">لا يوجد محتوى بعد</p>}
      </div>
    </AppLayout>
  );
}
