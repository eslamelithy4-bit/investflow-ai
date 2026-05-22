import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";

const PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"];
const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];

function genData(seed = 50000) {
  const out: { t: string; price: number }[] = [];
  let p = seed;
  for (let i = 60; i >= 0; i--) {
    p += (Math.random() - 0.48) * seed * 0.01;
    out.push({ t: `${i}m`, price: +p.toFixed(2) });
  }
  return out;
}

export default function Trade() {
  const [pair, setPair] = useState(PAIRS[0]);
  const [tf, setTf] = useState("15m");
  const [data, setData] = useState(() => genData());

  useEffect(() => {
    const seed = pair.startsWith("BTC") ? 65000 : pair.startsWith("ETH") ? 3500 : pair.startsWith("SOL") ? 180 : 600;
    setData(genData(seed));
  }, [pair, tf]);

  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => {
        const last = d[d.length - 1].price;
        const next = +(last + (Math.random() - 0.5) * last * 0.005).toFixed(2);
        return [...d.slice(1), { t: "now", price: next }];
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const last = data[data.length - 1].price;
  const first = data[0].price;
  const change = ((last - first) / first) * 100;
  const up = change >= 0;

  const recommendations = useMemo(() => [
    { pair: "BTC/USDT", action: "شراء", confidence: 87, color: "success" as const },
    { pair: "ETH/USDT", action: "احتفاظ", confidence: 65, color: "warning" as const },
    { pair: "SOL/USDT", action: "بيع", confidence: 72, color: "destructive" as const },
  ], []);

  return (
    <AppLayout>
      <div className="space-y-4 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {PAIRS.map((p) => (
              <Button key={p} variant={pair === p ? "default" : "outline"} size="sm" onClick={() => setPair(p)}>{p}</Button>
            ))}
          </div>
          <div className="flex gap-1">
            {TIMEFRAMES.map((t) => (
              <Button key={t} variant={tf === t ? "secondary" : "ghost"} size="sm" onClick={() => setTf(t)}>{t}</Button>
            ))}
          </div>
        </div>

        <Card className="p-5 shadow-elegant">
          <div className="flex flex-wrap justify-between items-end mb-4 gap-3">
            <div>
              <div className="text-sm text-muted-foreground">{pair}</div>
              <div className="text-3xl font-black" dir="ltr">${last.toLocaleString()}</div>
            </div>
            <Badge variant={up ? "default" : "destructive"} className={`text-base px-3 py-1 ${up ? "bg-success" : ""}`}>
              {up ? <TrendingUp className="w-4 h-4 ml-1" /> : <TrendingDown className="w-4 h-4 ml-1" />}
              {change.toFixed(2)}%
            </Badge>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="t" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-bold">توصيات الذكاء الاصطناعي</h3>
            <Badge variant="outline" className="mr-auto">تجريبي</Badge>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {recommendations.map((r) => (
              <div key={r.pair} className="border rounded-xl p-4 hover:shadow-card transition-smooth">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">{r.pair}</span>
                  <Badge className={r.color === "success" ? "bg-success" : r.color === "warning" ? "bg-warning" : ""} variant={r.color === "destructive" ? "destructive" : "default"}>
                    {r.action}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">الثقة: {r.confidence}%</div>
                <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div className="h-full gradient-primary" style={{ width: `${r.confidence}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
