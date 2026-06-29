"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// 빠른 선택용 예시 코드 (칩 라벨용 이름)
const SAMPLES = [
  ["1902301010", "라면"], ["1902191000", "국수"], ["1902192000", "당면"],
  ["1902193000", "냉면"], ["1902200000", "속을 채운 파스타"],
  ["1902111000", "스파게티"], ["1902112000", "마카로니"],
];

const C = {
  ink: "#14243B", paper: "#EDF0F5", card: "#FFFFFF", line: "#DCE2EC",
  muted: "#5E6E84", subtle: "#8A98AC",
  wgt: "#2E6F9E", unit: "#B5792E", trend: "#9AA7B8",
  up: "#1F8A5B", down: "#C0504D", flat: "#7A8699",
};

function regression(values) {
  const pts = values.map((v, i) => [i, v]).filter((p) => p[1] != null && isFinite(p[1]));
  const n = pts.length;
  if (n < 2) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (const [x, y] of pts) { sx += x; sy += y; sxy += x * y; sxx += x * x; }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  return { slope, intercept, n };
}

function diagnose(values, kind) {
  const reg = regression(values);
  if (!reg) return null;
  const last = values.length - 1;
  const start = reg.intercept;
  const end = reg.intercept + reg.slope * last;
  const pct = start !== 0 ? ((end - start) / Math.abs(start)) * 100 : 0;
  const dir = pct > 5 ? "up" : pct < -5 ? "down" : "flat";
  let label, color, note;
  if (kind === "wgt") {
    label = dir === "up" ? "물량 증가형" : dir === "down" ? "물량 감소형" : "물량 보합형";
    color = dir === "up" ? C.up : dir === "down" ? C.down : C.flat;
    note = dir === "up" ? "수출 물량이 3년간 확대되는 추세입니다."
      : dir === "down" ? "수출 물량이 3년간 축소되는 추세 — 수요·점유율 점검이 필요합니다."
      : "수출 물량이 큰 변동 없이 유지되고 있습니다.";
  } else {
    label = dir === "up" ? "단가 상승형" : dir === "down" ? "단가 하락형" : "단가 보합형";
    color = dir === "up" ? C.up : dir === "down" ? C.down : C.flat;
    note = dir === "up" ? "평균 단가가 우상향 — ‘제값받기’가 개선되는 신호입니다."
      : dir === "down" ? "평균 단가가 우하향 — 범용화·협상력 약화 위험 신호입니다."
      : "평균 단가가 안정적으로 유지되고 있습니다.";
  }
  return { dir, pct, label, color, note, reg };
}

function fmtInt(n) { return Math.round(n).toLocaleString("ko-KR"); }

function App() {
  const [query, setQuery] = useState("1902301010");
  const [code, setCode] = useState("1902301010");
  const [series, setSeries] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(hs) {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/trade?hs=${hs}`);
      const json = await res.json();
      if (!json.series || json.series.length === 0) {
        setSeries(null); setName("");
        setError(json.error || "데이터를 찾지 못했습니다.");
      } else {
        setSeries(json.series); setName(json.name || ""); setCode(hs);
      }
    } catch (e) {
      setSeries(null);
      setError("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load("1902301010"); }, []);

  const submit = () => { const q = query.trim(); if (q.length >= 4) load(q); };

  const prepared = useMemo(() => {
    if (!series || series.length === 0) return null;
    const wgtVals = series.map((d) => d.wgt);
    const unitVals = series.map((d) => d.unit);
    const wgtReg = regression(wgtVals);
    const unitReg = regression(unitVals);
    const maxWgt = Math.max(...wgtVals);
    const useTon = maxWgt >= 100000;
    const wUnit = useTon ? "톤" : "kg";
    const wDiv = useTon ? 1000 : 1;

    const rows = series.map((d, i) => ({
      ym: d.ym,
      wgtDisp: d.wgt / wDiv,
      wgtTrend: wgtReg ? (wgtReg.intercept + wgtReg.slope * i) / wDiv : null,
      unit: d.unit,
      unitTrend: unitReg ? unitReg.intercept + unitReg.slope * i : null,
      rawWgt: d.wgt, rawDlr: d.dlr,
    }));

    return {
      rows, wUnit,
      period: `${series[0].ym} ~ ${series[series.length - 1].ym} (${series.length}개월)`,
      latest: series[series.length - 1],
      wgtDx: diagnose(wgtVals, "wgt"),
      unitDx: diagnose(unitVals, "unit"),
    };
  }, [series]);

  const tickFmt = (v) => (v.endsWith("-01") ? v.slice(0, 4) : "");
  const card = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 14 };

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
      background: C.paper, color: C.ink, minHeight: "100vh", padding: "28px 20px",
    }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: C.unit, fontWeight: 700, textTransform: "uppercase" }}>
            HS Code 단가 진단
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "6px 0 4px", letterSpacing: -0.5 }}>
            수출 단가·물량 3년 추세 진단
          </h1>
          <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.6 }}>
            HS 코드를 입력하면 관세청 월별 수출실적(전체 국가 합계) 기준 최근 3년 추세를 진단합니다.
          </p>
        </div>

        <div style={{ ...card, padding: 18, marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>HS 코드 입력 (10자리)</label>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="예: 1902301010"
              style={{
                flex: "1 1 220px", fontSize: 16, padding: "11px 14px", borderRadius: 10,
                border: `1px solid ${C.line}`, outline: "none", fontVariantNumeric: "tabular-nums",
                letterSpacing: 1, color: C.ink,
              }}
            />
            <button onClick={submit} disabled={loading} style={{
              background: loading ? C.subtle : C.ink, color: "#fff", border: "none", borderRadius: 10,
              padding: "11px 22px", fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer",
            }}>{loading ? "조회 중…" : "진단"}</button>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: C.subtle, marginBottom: 7 }}>예시 품목 (HS 1902 · 면류/파스타)</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {SAMPLES.map(([hs, label]) => {
                const on = hs === code;
                return (
                  <button key={hs} onClick={() => { setQuery(hs); load(hs); }}
                    style={{
                      border: `1px solid ${on ? C.ink : C.line}`,
                      background: on ? C.ink : "#fff", color: on ? "#fff" : C.muted,
                      borderRadius: 999, padding: "6px 13px", fontSize: 13, cursor: "pointer",
                      fontWeight: on ? 700 : 500,
                    }}>
                    {label} · {hs}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ ...card, padding: 40, textAlign: "center", color: C.muted, marginBottom: 18 }}>
            관세청 데이터를 불러오는 중입니다…
          </div>
        )}

        {!loading && error && (
          <div style={{ ...card, padding: 24, marginBottom: 18, borderColor: C.down + "55", background: C.down + "0D" }}>
            <div style={{ fontWeight: 700, color: C.down, marginBottom: 4 }}>조회 결과 없음</div>
            <div style={{ fontSize: 14, color: C.muted }}>{error}</div>
          </div>
        )}

        {!loading && prepared && (
          <>
            <div style={{ ...card, padding: "16px 18px", marginBottom: 18, display: "flex", flexWrap: "wrap", gap: 18, alignItems: "baseline" }}>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontSize: 12, color: C.subtle }}>품목 · HS</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{name || "—"}</div>
                <div style={{ fontSize: 13, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{code}</div>
              </div>
              <Stat label="데이터 구간" value={prepared.period} />
              <Stat label="최근월 수출중량" value={`${fmtInt(prepared.latest.wgt)} kg`} />
              <Stat label="최근월 단가" value={prepared.latest.unit != null ? `$ ${prepared.latest.unit.toFixed(2)} /kg` : "—"} />
            </div>

            <ChartCard index="01" title="수출 총중량 추세"
              sub={`월별 수출중량 합계 · 단위 ${prepared.wUnit}`} dx={prepared.wgtDx} color={C.wgt}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={prepared.rows} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke={C.line} vertical={false} />
                  <XAxis dataKey="ym" tickFormatter={tickFmt} tick={{ fontSize: 12, fill: C.muted }}
                    axisLine={{ stroke: C.line }} tickLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false}
                    width={56} tickFormatter={(v) => fmtInt(v)} />
                  <Tooltip content={<WgtTip wUnit={prepared.wUnit} />} />
                  <Line type="monotone" dataKey="wgtTrend" stroke={C.trend} strokeWidth={1.5}
                    strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="wgtDisp" stroke={C.wgt} strokeWidth={2.4}
                    dot={false} isAnimationActive={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard index="02" title="수출 단가 추세"
              sub="월별 (수출금액 합계 ÷ 수출중량 합계) · 단위 USD/kg" dx={prepared.unitDx} color={C.unit}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={prepared.rows} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke={C.line} vertical={false} />
                  <XAxis dataKey="ym" tickFormatter={tickFmt} tick={{ fontSize: 12, fill: C.muted }}
                    axisLine={{ stroke: C.line }} tickLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false}
                    width={44} tickFormatter={(v) => `$${v.toFixed(1)}`} domain={["auto", "auto"]} />
                  <Tooltip content={<UnitTip />} />
                  <Line type="monotone" dataKey="unitTrend" stroke={C.trend} strokeWidth={1.5}
                    strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="unit" stroke={C.unit} strokeWidth={2.4}
                    dot={false} isAnimationActive={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <div style={{ fontSize: 12, color: C.subtle, marginTop: 6, lineHeight: 1.6 }}>
              점선은 최소제곱 추세선입니다. 진단 신호는 추세선의 시작·끝 변화율(±5% 기준)로 분류됩니다.
              데이터 출처: 관세청 품목별 국가별 수출입실적.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: C.subtle }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

function ChartCard({ index, title, sub, dx, color, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color, paddingTop: 2, fontVariantNumeric: "tabular-nums" }}>{index}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{title}</div>
            <div style={{ fontSize: 12.5, color: C.muted }}>{sub}</div>
          </div>
        </div>
        {dx && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: dx.color + "14", border: `1px solid ${dx.color}40`,
            borderRadius: 999, padding: "6px 13px",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 8, background: dx.color }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: dx.color }}>{dx.label}</span>
            <span style={{ fontSize: 12.5, color: dx.color, fontVariantNumeric: "tabular-nums" }}>
              {dx.pct >= 0 ? "+" : ""}{dx.pct.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      {children}
      {dx && (
        <div style={{ fontSize: 13, color: C.muted, marginTop: 10, lineHeight: 1.55, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
          {dx.note}
        </div>
      )}
    </div>
  );
}

function box(children) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 11px", fontSize: 12.5, boxShadow: "0 2px 8px rgba(20,36,59,0.08)" }}>
      {children}
    </div>
  );
}

function WgtTip({ active, payload, wUnit }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return box(
    <>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.ym}</div>
      <div style={{ color: C.wgt }}>수출중량 {fmtInt(d.rawWgt)} kg</div>
      <div style={{ color: C.muted }}>≈ {fmtInt(d.wgtDisp)} {wUnit}</div>
    </>
  );
}

function UnitTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  if (d.unit == null) return null;
  return box(
    <>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.ym}</div>
      <div style={{ color: C.unit }}>단가 $ {d.unit.toFixed(3)} /kg</div>
      <div style={{ color: C.muted }}>금액 ${fmtInt(d.rawDlr)} · 중량 {fmtInt(d.rawWgt)}kg</div>
    </>
  );
}

export default App;
