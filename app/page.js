"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* 미리보기용 샘플 (면류·꽃·소스류). 실제 사이트에서는 /hs_codes.json 전체를 불러옵니다. */
const SAMPLE = [["0601101000","튤립의 것"],["0601102000","백합의 것"],["0601104000","히아신스의 것"],["0601105000","글라디올러스의 것"],["0601106000","아이리스의 것"],["0601107000","프리지어의 것"],["0601108000","수선화의 것"],["0601109000","기타"],["0601201000","튤립의 것"],["0601202000","백합의 것"],["0601207000","아이리스의 것"],["0601208000","프리지어의 것"],["0601209010","수선화의 것"],["0601209090","기타"],["0602100000","뿌리가 없는 꺾꽂이용 가지와 접붙임용 가지"],["0602201000","사과나무"],["0602202000","배나무"],["0602203000","복숭아나무"],["0602204000","포도나무"],["0602206000","귤나무"],["0602209000","기타"],["0602300000","철쭉과 진달래속의 식물"],["0602400000","장미"],["0602901010","난초"],["0602901020","카네이션"],["0602901050","국화"],["0602901090","기타"],["0603110000","장미"],["0603120000","카네이션"],["0603131000","심비디움(Cymbidiums)"],["0603132000","팔레놉시스(Phalaenopsis)"],["0603139000","기타"],["0603140000","국화"],["0603150000","백합[릴리움(Lilium)속]"],["0603191000","튤립"],["0603199000","기타"],["0603900000","기타"],["1901101010","조제 분유"],["1901109090","기타"],["1901201000","쌀가루의 것"],["1901901000","맥아 추출물(extract)"],["1901909010","오트밀"],["1902111000","스파게티"],["1902112000","마카로니"],["1902119000","기타"],["1902191000","국수"],["1902192000","당면"],["1902193000","냉면"],["1902199000","기타"],["1902200000","속을 채운 파스타"],["1902301010","라면"],["1902301090","기타"],["1902309000","기타"],["1902400000","쿠스쿠스(couscous)"],["1903001000","타피오카"],["1904101000","콘 플레이크(corn flake)"],["1904102000","콘 칩"],["1904103000","튀긴 쌀"],["1905310000","스위트 비스킷"],["1905320000","와플과 웨이퍼"],["1905901010","빵"],["1905901040","비스킷, 쿠키와 크래커"],["1905901050","쌀과자"],["2101111000","인스턴트 커피"],["2103100000","간장"],["2103201000","토마토 케첩"],["2103901010","된장"],["2103901030","고추장"],["2103909010","마요네스"],["2103909020","인스턴트 카레"],["2104101000","육류로 만든 것"],["2106101000","두부"]];

const C = {
  ink: "#14243B", paper: "#EDF0F5", card: "#FFFFFF", line: "#DCE2EC",
  muted: "#5E6E84", subtle: "#8A98AC", soft: "#F3F5F9",
  wgt: "#2E6F9E", unit: "#B5792E", trend: "#9AA7B8",
  up: "#1F8A5B", down: "#C0504D", flat: "#7A8699",
};
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

function regression(values) {
  const pts = values.map((v, i) => [i, v]).filter((p) => p[1] != null && isFinite(p[1]));
  const n = pts.length; if (n < 2) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (const [x, y] of pts) { sx += x; sy += y; sxy += x * y; sxx += x * x; }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return { slope, intercept: (sy - slope * sx) / n };
}
function diagnose(values, kind) {
  const reg = regression(values); if (!reg) return null;
  const last = values.length - 1, start = reg.intercept, end = reg.intercept + reg.slope * last;
  const pct = start !== 0 ? ((end - start) / Math.abs(start)) * 100 : 0;
  const dir = pct > 5 ? "up" : pct < -5 ? "down" : "flat";
  const color = dir === "up" ? C.up : dir === "down" ? C.down : C.flat;
  let label, note;
  if (kind === "wgt") {
    label = dir === "up" ? "물량 증가형" : dir === "down" ? "물량 감소형" : "물량 보합형";
    note = dir === "up" ? "수출 물량이 3년간 확대되는 추세입니다." : dir === "down" ? "수출 물량이 3년간 축소되는 추세입니다." : "수출 물량이 대체로 유지되고 있습니다.";
  } else {
    label = dir === "up" ? "단가 상승형" : dir === "down" ? "단가 하락형" : "단가 보합형";
    note = dir === "up" ? "단가가 우상향 — ‘제값받기’가 개선되는 신호입니다." : dir === "down" ? "단가가 우하향 — 범용화·협상력 약화 위험 신호입니다." : "단가가 안정적으로 유지되고 있습니다.";
  }
  return { dir, pct, label, color, note };
}
const fmtInt = (n) => Math.round(n).toLocaleString("ko-KR");

const NOW = new Date();
const YEARS = [NOW.getFullYear() - 2, NOW.getFullYear() - 1, NOW.getFullYear()];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const keyOf = (y, m) => `${y}-${String(m).padStart(2, "0")}`;

export default function App() {
  const [data, setData] = useState(SAMPLE);
  const [dataNote, setDataNote] = useState("미리보기 샘플 데이터");
  const [step, setStep] = useState("select");
  const [picked, setPicked] = useState(null);
  const [entries, setEntries] = useState({});
  const [series, setSeries] = useState(null);

  // 실제 사이트(/public/hs_codes.json)에서는 전체 데이터를 불러오고, 없으면 샘플 사용
  useEffect(() => {
    fetch("/hs_codes.json")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((arr) => { if (Array.isArray(arr) && arr.length > 200) { setData(arr); setDataNote(`전체 ${arr.length.toLocaleString("ko-KR")}개 품목`); } })
      .catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: FONT, background: C.paper, color: C.ink, minHeight: "100vh", padding: "26px 20px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <Header step={step} dataNote={dataNote} />
        {step === "select" && <Selector data={data} onApply={(p) => { setPicked(p); setStep("input"); }} />}
        {step === "input" && (
          <InputGrid picked={picked} entries={entries} setEntries={setEntries}
            onBack={() => setStep("select")} onDiagnose={(s) => { setSeries(s); setStep("result"); }} />
        )}
        {step === "result" && <Result picked={picked} series={series} onBack={() => setStep("input")} onRestart={() => setStep("select")} />}
      </div>
    </div>
  );
}

function Header({ step, dataNote }) {
  const steps = [["select", "HS 코드 선택"], ["input", "자사 실적 입력"], ["result", "추세 진단"]];
  const idx = steps.findIndex((s) => s[0] === step);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: C.unit, fontWeight: 700, textTransform: "uppercase" }}>수출 단가 진단 서비스</div>
        <div style={{ fontSize: 11.5, color: C.subtle }}>HS 부호: {dataNote}</div>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "6px 0 14px", letterSpacing: -0.5 }}>제값받기 진단 — HS 코드로 시작하기</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {steps.map(([k, label], i) => {
          const on = i === idx, done = i < idx;
          return (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 999, background: on ? C.ink : done ? C.up + "18" : C.soft, color: on ? "#fff" : done ? C.up : C.subtle, border: `1px solid ${on ? C.ink : done ? C.up + "55" : C.line}`, fontSize: 13, fontWeight: 700 }}>
              <span style={{ width: 18, height: 18, borderRadius: 999, fontSize: 11, lineHeight: "18px", textAlign: "center", background: on ? "#fff" : done ? C.up : C.line, color: on ? C.ink : done ? "#fff" : C.subtle }}>{done ? "✓" : i + 1}</span>
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── STEP 1. HS 코드 선택 (검색 / 단계별) ───────── */
function Selector({ data, onApply }) {
  const [tab, setTab] = useState("search");
  const [picked, setPicked] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[["search", "이름·코드로 검색"], ["tree", "단계별 선택"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            background: tab === k ? C.card : "transparent", color: tab === k ? C.ink : C.subtle,
            border: `1px solid ${tab === k ? C.line : "transparent"}`, borderBottom: tab === k ? `1px solid ${C.card}` : `1px solid ${C.line}`,
            borderRadius: "10px 10px 0 0", padding: "9px 16px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: "0 12px 12px 12px", padding: 16 }}>
        {tab === "search" ? <SearchTab data={data} picked={picked} setPicked={setPicked} />
          : <TreeTab data={data} picked={picked} setPicked={setPicked} />}

        <div style={{ marginTop: 16, borderTop: `1px solid ${C.line}`, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 13.5 }}>
            {picked ? (
              <span><span style={{ color: C.subtle }}>선택됨 · </span><b style={{ fontVariantNumeric: "tabular-nums" }}>{picked.code}</b> <span style={{ color: C.muted }}>{picked.name}</span></span>
            ) : <span style={{ color: C.subtle }}>아직 선택된 코드가 없습니다.</span>}
          </div>
          <button disabled={!picked} onClick={() => picked && onApply(picked)} style={{ background: picked ? C.ink : C.line, color: picked ? "#fff" : C.subtle, border: "none", borderRadius: 9, padding: "10px 22px", fontSize: 14, fontWeight: 800, cursor: picked ? "pointer" : "default" }}>선택 적용 →</button>
        </div>
      </div>
    </div>
  );
}

function SearchTab({ data, picked, setPicked }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim();
    if (s.length < 1) return [];
    const isNum = /^\d+$/.test(s);
    const out = [];
    for (const [code, name] of data) {
      if (isNum ? code.startsWith(s) : name.includes(s)) {
        out.push([code, name]);
        if (out.length >= 80) break;
      }
    }
    return out;
  }, [q, data]);

  return (
    <div>
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="품목명(예: 라면, 카네이션) 또는 HS 코드 숫자 입력"
        style={{ width: "100%", boxSizing: "border-box", fontSize: 15, padding: "12px 14px", border: `1px solid ${C.line}`, borderRadius: 10, outline: "none", color: C.ink }} />
      <div style={{ marginTop: 12, maxHeight: 340, overflowY: "auto", border: q.trim() ? `1px solid ${C.line}` : "none", borderRadius: 10 }}>
        {q.trim() && results.length === 0 && <div style={{ padding: 16, fontSize: 13, color: C.subtle }}>검색 결과가 없습니다.</div>}
        {results.map(([code, name]) => {
          const on = picked && picked.code === code;
          return (
            <div key={code} onClick={() => setPicked({ code, name })} style={{ display: "flex", gap: 12, padding: "10px 14px", cursor: "pointer", background: on ? C.ink : "#fff", color: on ? "#fff" : C.ink, borderBottom: `1px solid ${C.soft}` }}>
              <span style={{ fontVariantNumeric: "tabular-nums", color: on ? "#cdd8e6" : C.subtle, minWidth: 96 }}>{code}</span>
              <span style={{ fontSize: 14 }}>{name}</span>
            </div>
          );
        })}
      </div>
      {!q.trim() && <div style={{ marginTop: 10, fontSize: 12.5, color: C.subtle }}>예: “라면”, “카네이션”, “당면”, 또는 “1902” 처럼 숫자로도 찾을 수 있습니다.</div>}
    </div>
  );
}

function TreeTab({ data, picked, setPicked }) {
  const [c2, setC2] = useState(null), [c4, setC4] = useState(null), [c6, setC6] = useState(null);

  const groups = useMemo(() => {
    const ch = new Map();
    for (const [code] of data) {
      const k = code.slice(0, 2);
      ch.set(k, (ch.get(k) || 0) + 1);
    }
    return [...ch.keys()].sort();
  }, [data]);

  const level = (start, len, prefix) => {
    const m = new Map();
    for (const [code] of data) {
      if (prefix && !code.startsWith(prefix)) continue;
      const k = code.slice(0, len);
      m.set(k, (m.get(k) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  };
  const headings = useMemo(() => (c2 ? level(0, 4, c2) : []), [c2, data]);
  const subs = useMemo(() => (c4 ? level(0, 6, c4) : []), [c4, data]);
  const leaves = useMemo(() => (c6 ? data.filter(([code]) => code.startsWith(c6)) : []), [c6, data]);

  const col = { flex: "1 1 150px", minWidth: 130, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", alignSelf: "flex-start" };
  const head = { background: C.soft, padding: "8px 12px", fontSize: 12.5, fontWeight: 800, borderBottom: `1px solid ${C.line}` };
  const list = { maxHeight: 300, overflowY: "auto" };
  const row = (active) => ({ display: "flex", justifyContent: "space-between", gap: 6, padding: "8px 12px", fontSize: 13, cursor: "pointer", background: active ? C.ink : "transparent", color: active ? "#fff" : C.ink, borderBottom: `1px solid ${C.soft}` });
  const cnt = (active) => ({ fontSize: 11, color: active ? "#aebfd2" : C.subtle });

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <div style={col}>
        <div style={head}>2자리</div>
        <div style={list}>
          {groups.map((c) => (
            <div key={c} style={row(c === c2)} onClick={() => { setC2(c); setC4(null); setC6(null); }}>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{c}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={col}>
        <div style={head}>4자리</div>
        <div style={list}>
          {c2 ? headings.map(([c, n]) => (
            <div key={c} style={row(c === c4)} onClick={() => { setC4(c); setC6(null); }}>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{c}</span><span style={cnt(c === c4)}>{n}</span>
            </div>
          )) : <Hint text="2자리 선택" />}
        </div>
      </div>
      <div style={col}>
        <div style={head}>6자리</div>
        <div style={list}>
          {c4 ? subs.map(([c, n]) => (
            <div key={c} style={row(c === c6)} onClick={() => setC6(c)}>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{c}</span><span style={cnt(c === c6)}>{n}</span>
            </div>
          )) : <Hint text="4자리 선택" />}
        </div>
      </div>
      <div style={{ ...col, flex: "1 1 260px", minWidth: 220 }}>
        <div style={head}>10자리 (품목명)</div>
        <div style={list}>
          {c6 ? leaves.map(([code, name]) => {
            const on = picked && picked.code === code;
            return (
              <div key={code} style={row(on)} onClick={() => setPicked({ code, name })}>
                <span style={{ fontVariantNumeric: "tabular-nums", color: on ? "#cdd8e6" : C.subtle, minWidth: 92 }}>{code}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{name}</span>
              </div>
            );
          }) : <Hint text="6자리 선택" />}
        </div>
      </div>
    </div>
  );
}
const Hint = ({ text }) => <div style={{ padding: 14, fontSize: 12.5, color: C.subtle }}>{text}</div>;

/* ───────── STEP 2. 자사 월별 실적 입력 ───────── */
function InputGrid({ picked, entries, setEntries, onBack, onDiagnose }) {
  const [warn, setWarn] = useState("");
  const set = (k, field, val) => setEntries((p) => ({ ...p, [k]: { ...p[k], [field]: val.replace(/[^\d.]/g, "") } }));
  const fillSample = () => {
    const next = {};
    YEARS.forEach((y, yi) => MONTHS.forEach((m) => {
      const k = keyOf(y, m);
      const season = 1 + 0.18 * Math.sin((m / 12) * Math.PI * 2);
      const w = Math.round(80000 * season * (1 + yi * 0.12) * (0.9 + Math.random() * 0.2));
      const unit = 4.0 - yi * 0.18 + (Math.random() - 0.5) * 0.3;
      next[k] = { wgt: String(w), dlr: String(Math.round(w * unit)) };
    }));
    setEntries(next);
  };
  const filledCount = Object.values(entries).filter((e) => e && e.wgt && parseFloat(e.wgt) > 0).length;
  const run = () => {
    const s = [];
    YEARS.forEach((y) => MONTHS.forEach((m) => {
      const k = keyOf(y, m), e = entries[k]; if (!e) return;
      const w = parseFloat(e.wgt), d = parseFloat(e.dlr);
      if (!(w > 0) || !(d >= 0)) return;
      s.push({ ym: k, wgt: w, dlr: d, unit: d / w });
    }));
    if (s.length < 2) { setWarn("추세를 그리려면 최소 2개월 이상의 수출중량·수출금액을 입력해 주세요."); return; }
    setWarn(""); onDiagnose(s);
  };
  const cellInput = { width: "100%", boxSizing: "border-box", fontSize: 13, padding: "7px 9px", border: `1px solid ${C.line}`, borderRadius: 7, outline: "none", textAlign: "right", fontVariantNumeric: "tabular-nums", color: C.ink, background: "#fff" };

  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 12, color: C.subtle }}>선택한 품목</div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{picked?.name} <span style={{ color: C.muted, fontWeight: 600, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>· {picked?.code}</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.muted, borderRadius: 9, padding: "9px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>← 코드 다시 선택</button>
          <button onClick={fillSample} style={{ background: C.soft, border: `1px solid ${C.line}`, color: C.ink, borderRadius: 9, padding: "9px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>샘플 채우기</button>
        </div>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>자사 최근 3년 월별 수출 실적 입력</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>각 달의 수출중량(kg)과 수출금액(USD)을 입력하세요. 수출이 없는 달은 비워 두면 됩니다. 단가는 자동 계산됩니다.</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {YEARS.map((y) => (
            <div key={y} style={{ flex: "1 1 300px", minWidth: 280 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>{y}년</div>
              <div style={{ display: "grid", gridTemplateColumns: "34px 1fr 1fr", gap: 6, alignItems: "center" }}>
                <div style={{ fontSize: 11, color: C.subtle }}>월</div>
                <div style={{ fontSize: 11, color: C.subtle, textAlign: "right" }}>수출중량(kg)</div>
                <div style={{ fontSize: 11, color: C.subtle, textAlign: "right" }}>수출금액(USD)</div>
                {MONTHS.map((m) => {
                  const k = keyOf(y, m), e = entries[k] || {};
                  return (
                    <React.Fragment key={k}>
                      <div style={{ fontSize: 12.5, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{m}월</div>
                      <input style={cellInput} inputMode="decimal" value={e.wgt || ""} placeholder="—" onChange={(ev) => set(k, "wgt", ev.target.value)} />
                      <input style={cellInput} inputMode="decimal" value={e.dlr || ""} placeholder="—" onChange={(ev) => set(k, "dlr", ev.target.value)} />
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {warn && <div style={{ marginTop: 14, color: C.down, fontSize: 13 }}>{warn}</div>}
        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: C.muted }}>입력된 개월 수: <b style={{ color: C.ink }}>{filledCount}</b> / 36</div>
          <button onClick={run} style={{ background: C.ink, color: "#fff", border: "none", borderRadius: 9, padding: "11px 24px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>추세 진단하기 →</button>
        </div>
      </div>
    </div>
  );
}

/* ───────── STEP 3. 진단 결과 ───────── */
function Result({ picked, series, onBack, onRestart }) {
  const prepared = useMemo(() => {
    if (!series || series.length === 0) return null;
    const sorted = [...series].sort((a, b) => a.ym.localeCompare(b.ym));
    const wgtVals = sorted.map((d) => d.wgt), unitVals = sorted.map((d) => d.unit);
    const wgtReg = regression(wgtVals), unitReg = regression(unitVals);
    const maxWgt = Math.max(...wgtVals), useTon = maxWgt >= 100000, wUnit = useTon ? "톤" : "kg", wDiv = useTon ? 1000 : 1;
    const rows = sorted.map((d, i) => ({ ym: d.ym, wgtDisp: d.wgt / wDiv, wgtTrend: wgtReg ? (wgtReg.intercept + wgtReg.slope * i) / wDiv : null, unit: d.unit, unitTrend: unitReg ? unitReg.intercept + unitReg.slope * i : null, rawWgt: d.wgt, rawDlr: d.dlr }));
    return { rows, wUnit, latest: sorted[sorted.length - 1], period: `${sorted[0].ym} ~ ${sorted[sorted.length - 1].ym} (${sorted.length}개월)`, wgtDx: diagnose(wgtVals, "wgt"), unitDx: diagnose(unitVals, "unit") };
  }, [series]);
  const tickFmt = (v) => (v.endsWith("-01") ? v.slice(0, 4) : "");
  if (!prepared) return null;

  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "baseline" }}>
          <div>
            <div style={{ fontSize: 12, color: C.subtle }}>품목 · HS</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{picked?.name} <span style={{ color: C.muted, fontWeight: 600, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>· {picked?.code}</span></div>
          </div>
          <Stat label="데이터 구간" value={prepared.period} />
          <Stat label="최근월 수출중량" value={`${fmtInt(prepared.latest.wgt)} kg`} />
          <Stat label="최근월 단가" value={`$ ${prepared.latest.unit.toFixed(2)} /kg`} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.muted, borderRadius: 9, padding: "9px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>← 입력 수정</button>
          <button onClick={onRestart} style={{ background: C.soft, border: `1px solid ${C.line}`, color: C.ink, borderRadius: 9, padding: "9px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>새 진단</button>
        </div>
      </div>

      <ChartCard index="01" title="자사 수출 총중량 추세" sub={`월별 수출중량 · 단위 ${prepared.wUnit}`} dx={prepared.wgtDx} color={C.wgt}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={prepared.rows} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="ym" tickFormatter={tickFmt} tick={{ fontSize: 12, fill: C.muted }} axisLine={{ stroke: C.line }} tickLine={false} interval={0} />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} width={56} tickFormatter={fmtInt} />
            <Tooltip content={<WgtTip wUnit={prepared.wUnit} />} />
            <Line type="monotone" dataKey="wgtTrend" stroke={C.trend} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="wgtDisp" stroke={C.wgt} strokeWidth={2.4} dot={false} isAnimationActive={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard index="02" title="자사 수출 단가 추세" sub="월별 (수출금액 ÷ 수출중량) · 단위 USD/kg" dx={prepared.unitDx} color={C.unit}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={prepared.rows} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="ym" tickFormatter={tickFmt} tick={{ fontSize: 12, fill: C.muted }} axisLine={{ stroke: C.line }} tickLine={false} interval={0} />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `$${v.toFixed(1)}`} domain={["auto", "auto"]} />
            <Tooltip content={<UnitTip />} />
            <Line type="monotone" dataKey="unitTrend" stroke={C.trend} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="unit" stroke={C.unit} strokeWidth={2.4} dot={false} isAnimationActive={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ background: C.unit + "0D", border: `1px solid ${C.unit}33`, borderRadius: 12, padding: "14px 16px", fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
        지금 결과는 <b style={{ color: C.ink }}>입력하신 자사 데이터</b>의 추세입니다. 다음 단계에서 관세청 시장 데이터를 연결하면, 이 자사 단가가 같은 품목의 <b style={{ color: C.ink }}>시장 평균·국가별 단가 대비 어디에 위치하는지</b>까지 함께 진단할 수 있습니다.
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (<div><div style={{ fontSize: 12, color: C.subtle }}>{label}</div><div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{value}</div></div>);
}
function ChartCard({ index, title, sub, dx, color, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color, paddingTop: 2, fontVariantNumeric: "tabular-nums" }}>{index}</div>
          <div><div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div><div style={{ fontSize: 12.5, color: C.muted }}>{sub}</div></div>
        </div>
        {dx && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: dx.color + "14", border: `1px solid ${dx.color}40`, borderRadius: 999, padding: "6px 13px" }}>
            <span style={{ width: 8, height: 8, borderRadius: 8, background: dx.color }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: dx.color }}>{dx.label}</span>
            <span style={{ fontSize: 12.5, color: dx.color, fontVariantNumeric: "tabular-nums" }}>{dx.pct >= 0 ? "+" : ""}{dx.pct.toFixed(1)}%</span>
          </div>
        )}
      </div>
      {children}
      {dx && <div style={{ fontSize: 13, color: C.muted, marginTop: 10, lineHeight: 1.55, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>{dx.note}</div>}
    </div>
  );
}
function tipBox(children) { return <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 11px", fontSize: 12.5, boxShadow: "0 2px 8px rgba(20,36,59,0.08)" }}>{children}</div>; }
function WgtTip({ active, payload, wUnit }) { if (!active || !payload || !payload.length) return null; const d = payload[0].payload; return tipBox(<><div style={{ fontWeight: 700, marginBottom: 4 }}>{d.ym}</div><div style={{ color: C.wgt }}>수출중량 {fmtInt(d.rawWgt)} kg</div><div style={{ color: C.muted }}>≈ {fmtInt(d.wgtDisp)} {wUnit}</div></>); }
function UnitTip({ active, payload }) { if (!active || !payload || !payload.length) return null; const d = payload[0].payload; return tipBox(<><div style={{ fontWeight: 700, marginBottom: 4 }}>{d.ym}</div><div style={{ color: C.unit }}>단가 $ {d.unit.toFixed(3)} /kg</div><div style={{ color: C.muted }}>금액 ${fmtInt(d.rawDlr)} · 중량 {fmtInt(d.rawWgt)}kg</div></>); }
