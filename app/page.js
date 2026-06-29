"use client";
import React, { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ── 데모 데이터: 관세청 품목별 국가별 수출입실적(월별)에서 HS코드별로 월별 합계 집계 ──
// 각 시리즈: ym(연-월), wgt(수출중량 합계 kg), dlr(수출금액 합계 USD), unit(=dlr/wgt)
const DATA = {"1902111000":{"name":"스파게티","series":[{"ym":"2023-01","wgt":603,"dlr":2440,"unit":4.0464},{"ym":"2023-02","wgt":3093,"dlr":12658,"unit":4.0925},{"ym":"2023-03","wgt":7858,"dlr":8038,"unit":1.0229},{"ym":"2023-04","wgt":9358,"dlr":8702,"unit":0.9299},{"ym":"2023-05","wgt":2875,"dlr":12636,"unit":4.3951},{"ym":"2023-06","wgt":2966,"dlr":12411,"unit":4.1844},{"ym":"2023-07","wgt":8219,"dlr":15542,"unit":1.891},{"ym":"2023-08","wgt":3861,"dlr":20338,"unit":5.2675},{"ym":"2023-09","wgt":19484,"dlr":73983,"unit":3.7971},{"ym":"2023-10","wgt":705,"dlr":848,"unit":1.2028},{"ym":"2023-11","wgt":5127,"dlr":10376,"unit":2.0238},{"ym":"2023-12","wgt":2277,"dlr":4488,"unit":1.971},{"ym":"2024-01","wgt":27980,"dlr":59216,"unit":2.1164},{"ym":"2024-02","wgt":3824,"dlr":21759,"unit":5.6901},{"ym":"2024-03","wgt":88,"dlr":618,"unit":7.0227},{"ym":"2024-04","wgt":2828,"dlr":10231,"unit":3.6178},{"ym":"2024-05","wgt":468,"dlr":1633,"unit":3.4893},{"ym":"2024-06","wgt":3080,"dlr":4175,"unit":1.3555},{"ym":"2024-07","wgt":841,"dlr":3485,"unit":4.1439},{"ym":"2024-08","wgt":1611,"dlr":5470,"unit":3.3954},{"ym":"2024-09","wgt":253,"dlr":436,"unit":1.7233},{"ym":"2024-10","wgt":1160,"dlr":3731,"unit":3.2164},{"ym":"2024-11","wgt":1952,"dlr":6722,"unit":3.4436},{"ym":"2024-12","wgt":2432,"dlr":3592,"unit":1.477},{"ym":"2025-01","wgt":830,"dlr":1927,"unit":2.3217},{"ym":"2025-02","wgt":2029,"dlr":2048,"unit":1.0094},{"ym":"2025-03","wgt":4149,"dlr":8256,"unit":1.9899},{"ym":"2025-04","wgt":2027,"dlr":5358,"unit":2.6433},{"ym":"2025-05","wgt":1724,"dlr":4660,"unit":2.703},{"ym":"2025-06","wgt":3729,"dlr":7933,"unit":2.1274},{"ym":"2025-08","wgt":2728,"dlr":3166,"unit":1.1606},{"ym":"2025-09","wgt":3486,"dlr":5287,"unit":1.5166},{"ym":"2025-10","wgt":22344,"dlr":24042,"unit":1.076},{"ym":"2025-11","wgt":37918,"dlr":160423,"unit":4.2308},{"ym":"2025-12","wgt":236,"dlr":570,"unit":2.4153}]},"1902112000":{"name":"마카로니","series":[{"ym":"2023-05","wgt":240,"dlr":745,"unit":3.1042},{"ym":"2023-07","wgt":16537,"dlr":41091,"unit":2.4848},{"ym":"2023-09","wgt":900,"dlr":1953,"unit":2.17},{"ym":"2024-01","wgt":240,"dlr":462,"unit":1.925},{"ym":"2024-02","wgt":25518,"dlr":42557,"unit":1.6677},{"ym":"2024-08","wgt":348,"dlr":1057,"unit":3.0374},{"ym":"2024-09","wgt":3220,"dlr":6504,"unit":2.0199},{"ym":"2024-10","wgt":360,"dlr":806,"unit":2.2389},{"ym":"2024-11","wgt":2300,"dlr":3788,"unit":1.647},{"ym":"2025-01","wgt":2,"dlr":31,"unit":15.5},{"ym":"2025-02","wgt":154,"dlr":295,"unit":1.9156},{"ym":"2025-03","wgt":460,"dlr":932,"unit":2.0261},{"ym":"2025-04","wgt":1,"dlr":2,"unit":2},{"ym":"2025-05","wgt":391,"dlr":1589,"unit":4.0639},{"ym":"2025-06","wgt":19,"dlr":28,"unit":1.4737},{"ym":"2025-08","wgt":360,"dlr":1438,"unit":3.9944},{"ym":"2025-09","wgt":240,"dlr":409,"unit":1.7042},{"ym":"2025-11","wgt":120,"dlr":195,"unit":1.625},{"ym":"2025-12","wgt":360,"dlr":561,"unit":1.5583}]},"1902191000":{"name":"국수","series":[{"ym":"2023-01","wgt":972281,"dlr":2042682,"unit":2.1009},{"ym":"2023-02","wgt":1418205,"dlr":3028316,"unit":2.1353},{"ym":"2023-03","wgt":1441360,"dlr":3153927,"unit":2.1882},{"ym":"2023-04","wgt":1578699,"dlr":3250848,"unit":2.0592},{"ym":"2023-05","wgt":1317904,"dlr":2953503,"unit":2.2411},{"ym":"2023-06","wgt":1308635,"dlr":2868389,"unit":2.1919},{"ym":"2023-07","wgt":945480,"dlr":2228643,"unit":2.3572},{"ym":"2023-08","wgt":1296235,"dlr":2738254,"unit":2.1125},{"ym":"2023-09","wgt":1325641,"dlr":2750491,"unit":2.0748},{"ym":"2023-10","wgt":1179593,"dlr":2585964,"unit":2.1923},{"ym":"2023-11","wgt":1741797,"dlr":3569391,"unit":2.0493},{"ym":"2023-12","wgt":1418432,"dlr":3028071,"unit":2.1348},{"ym":"2024-01","wgt":1643380,"dlr":3261468,"unit":1.9846},{"ym":"2024-02","wgt":1257103,"dlr":2592353,"unit":2.0622},{"ym":"2024-03","wgt":1236675,"dlr":2551895,"unit":2.0635},{"ym":"2024-04","wgt":1472529,"dlr":2905768,"unit":1.9733},{"ym":"2024-05","wgt":1464549,"dlr":3119418,"unit":2.13},{"ym":"2024-06","wgt":1340631,"dlr":2825905,"unit":2.1079},{"ym":"2024-07","wgt":1632932,"dlr":3292648,"unit":2.0164},{"ym":"2024-08","wgt":1248067,"dlr":2469391,"unit":1.9786},{"ym":"2024-09","wgt":1343584,"dlr":2739878,"unit":2.0392},{"ym":"2024-10","wgt":1225253,"dlr":2537020,"unit":2.0706},{"ym":"2024-11","wgt":1643955,"dlr":3203261,"unit":1.9485},{"ym":"2024-12","wgt":1587342,"dlr":3034935,"unit":1.912},{"ym":"2025-01","wgt":1322564,"dlr":2506163,"unit":1.8949},{"ym":"2025-02","wgt":1670252,"dlr":3147788,"unit":1.8846},{"ym":"2025-03","wgt":1698070,"dlr":3434064,"unit":2.0223},{"ym":"2025-04","wgt":1572846,"dlr":2992212,"unit":1.9024},{"ym":"2025-05","wgt":1341761,"dlr":2749633,"unit":2.0493},{"ym":"2025-06","wgt":1268995,"dlr":2477753,"unit":1.9525},{"ym":"2025-07","wgt":1487713,"dlr":2973610,"unit":1.9988},{"ym":"2025-08","wgt":1858342,"dlr":3484287,"unit":1.8749},{"ym":"2025-09","wgt":1730571,"dlr":3143488,"unit":1.8164},{"ym":"2025-10","wgt":1557646,"dlr":2876329,"unit":1.8466},{"ym":"2025-11","wgt":1418634,"dlr":2748484,"unit":1.9374},{"ym":"2025-12","wgt":1386307,"dlr":2704435,"unit":1.9508}]},"1902192000":{"name":"당면","series":[{"ym":"2023-01","wgt":124067,"dlr":532000,"unit":4.288},{"ym":"2023-02","wgt":144765,"dlr":633883,"unit":4.3787},{"ym":"2023-03","wgt":148203,"dlr":618292,"unit":4.1719},{"ym":"2023-04","wgt":130477,"dlr":582436,"unit":4.4639},{"ym":"2023-05","wgt":134760,"dlr":544060,"unit":4.0373},{"ym":"2023-06","wgt":191990,"dlr":757130,"unit":3.9436},{"ym":"2023-07","wgt":132450,"dlr":562028,"unit":4.2433},{"ym":"2023-08","wgt":124667,"dlr":542411,"unit":4.3509},{"ym":"2023-09","wgt":136932,"dlr":558380,"unit":4.0778},{"ym":"2023-10","wgt":103807,"dlr":448317,"unit":4.3188},{"ym":"2023-11","wgt":151295,"dlr":629967,"unit":4.1638},{"ym":"2023-12","wgt":109622,"dlr":462299,"unit":4.2172},{"ym":"2024-01","wgt":158290,"dlr":681204,"unit":4.3035},{"ym":"2024-02","wgt":149262,"dlr":589700,"unit":3.9508},{"ym":"2024-03","wgt":155536,"dlr":663607,"unit":4.2666},{"ym":"2024-04","wgt":136711,"dlr":539073,"unit":3.9432},{"ym":"2024-05","wgt":140142,"dlr":556342,"unit":3.9698},{"ym":"2024-06","wgt":152857,"dlr":585628,"unit":3.8312},{"ym":"2024-07","wgt":141360,"dlr":567456,"unit":4.0143},{"ym":"2024-08","wgt":108351,"dlr":458090,"unit":4.2278},{"ym":"2024-09","wgt":112840,"dlr":491077,"unit":4.352},{"ym":"2024-10","wgt":131261,"dlr":555422,"unit":4.2314},{"ym":"2024-11","wgt":124192,"dlr":534236,"unit":4.3017},{"ym":"2024-12","wgt":153134,"dlr":629796,"unit":4.1127},{"ym":"2025-01","wgt":115856,"dlr":479746,"unit":4.1409},{"ym":"2025-02","wgt":138067,"dlr":570409,"unit":4.1314},{"ym":"2025-03","wgt":170349,"dlr":671579,"unit":3.9424},{"ym":"2025-04","wgt":193618,"dlr":775379,"unit":4.0047},{"ym":"2025-05","wgt":153503,"dlr":564986,"unit":3.6806},{"ym":"2025-06","wgt":172693,"dlr":676191,"unit":3.9156},{"ym":"2025-07","wgt":133026,"dlr":613880,"unit":4.6147},{"ym":"2025-08","wgt":88790,"dlr":425806,"unit":4.7957},{"ym":"2025-09","wgt":140188,"dlr":556199,"unit":3.9675},{"ym":"2025-10","wgt":85885,"dlr":315216,"unit":3.6702},{"ym":"2025-11","wgt":112877,"dlr":458305,"unit":4.0602},{"ym":"2025-12","wgt":142250,"dlr":596224,"unit":4.1914}]},"1902193000":{"name":"냉면","series":[{"ym":"2023-01","wgt":127478,"dlr":337304,"unit":2.646},{"ym":"2023-02","wgt":338673,"dlr":952820,"unit":2.8134},{"ym":"2023-03","wgt":450671,"dlr":1115732,"unit":2.4757},{"ym":"2023-04","wgt":521804,"dlr":1264863,"unit":2.424},{"ym":"2023-05","wgt":481043,"dlr":1216401,"unit":2.5287},{"ym":"2023-06","wgt":466516,"dlr":1212291,"unit":2.5986},{"ym":"2023-07","wgt":259549,"dlr":686051,"unit":2.6432},{"ym":"2023-08","wgt":283218,"dlr":761045,"unit":2.6871},{"ym":"2023-09","wgt":221462,"dlr":570535,"unit":2.5762},{"ym":"2023-10","wgt":196836,"dlr":482595,"unit":2.4518},{"ym":"2023-11","wgt":72442,"dlr":197822,"unit":2.7308},{"ym":"2023-12","wgt":82498,"dlr":210183,"unit":2.5477},{"ym":"2024-01","wgt":156638,"dlr":425276,"unit":2.715},{"ym":"2024-02","wgt":372463,"dlr":892588,"unit":2.3964},{"ym":"2024-03","wgt":551855,"dlr":1484535,"unit":2.6901},{"ym":"2024-04","wgt":451182,"dlr":1221612,"unit":2.7076},{"ym":"2024-05","wgt":415632,"dlr":1092273,"unit":2.628},{"ym":"2024-06","wgt":291433,"dlr":701936,"unit":2.4086},{"ym":"2024-07","wgt":339782,"dlr":782071,"unit":2.3017},{"ym":"2024-08","wgt":312605,"dlr":749679,"unit":2.3982},{"ym":"2024-09","wgt":168420,"dlr":418073,"unit":2.4823},{"ym":"2024-10","wgt":145797,"dlr":405896,"unit":2.784},{"ym":"2024-11","wgt":141842,"dlr":331352,"unit":2.3361},{"ym":"2024-12","wgt":147188,"dlr":431348,"unit":2.9306},{"ym":"2025-01","wgt":100329,"dlr":199633,"unit":1.9898},{"ym":"2025-02","wgt":227237,"dlr":542979,"unit":2.3895},{"ym":"2025-03","wgt":395687,"dlr":998956,"unit":2.5246},{"ym":"2025-04","wgt":543967,"dlr":1258864,"unit":2.3142},{"ym":"2025-05","wgt":455582,"dlr":1219930,"unit":2.6777},{"ym":"2025-06","wgt":385203,"dlr":1027001,"unit":2.6661},{"ym":"2025-07","wgt":340463,"dlr":819851,"unit":2.408},{"ym":"2025-08","wgt":305136,"dlr":885360,"unit":2.9015},{"ym":"2025-09","wgt":263814,"dlr":722033,"unit":2.7369},{"ym":"2025-10","wgt":144196,"dlr":415133,"unit":2.8789},{"ym":"2025-11","wgt":181987,"dlr":439273,"unit":2.4138},{"ym":"2025-12","wgt":171956,"dlr":463357,"unit":2.6946}]},"1902200000":{"name":"속을 채운 파스타","series":[{"ym":"2023-01","wgt":1301291,"dlr":4617582,"unit":3.5485},{"ym":"2023-02","wgt":1542662,"dlr":5544371,"unit":3.594},{"ym":"2023-03","wgt":1457505,"dlr":5324077,"unit":3.6529},{"ym":"2023-04","wgt":1238373,"dlr":4674720,"unit":3.7749},{"ym":"2023-05","wgt":1373142,"dlr":5045040,"unit":3.6741},{"ym":"2023-06","wgt":1737328,"dlr":6183390,"unit":3.5591},{"ym":"2023-07","wgt":1326948,"dlr":4813758,"unit":3.6277},{"ym":"2023-08","wgt":1359380,"dlr":4863748,"unit":3.5779},{"ym":"2023-09","wgt":1318222,"dlr":4801730,"unit":3.6426},{"ym":"2023-10","wgt":1817175,"dlr":6353555,"unit":3.4964},{"ym":"2023-11","wgt":2217879,"dlr":7595785,"unit":3.4248},{"ym":"2023-12","wgt":1728766,"dlr":6609678,"unit":3.8234},{"ym":"2024-01","wgt":1381371,"dlr":5227935,"unit":3.7846},{"ym":"2024-02","wgt":1497612,"dlr":5602173,"unit":3.7407},{"ym":"2024-03","wgt":1730043,"dlr":6698360,"unit":3.8718},{"ym":"2024-04","wgt":1740242,"dlr":6223970,"unit":3.5765},{"ym":"2024-05","wgt":1588115,"dlr":5432885,"unit":3.421},{"ym":"2024-06","wgt":1532718,"dlr":5422358,"unit":3.5377},{"ym":"2024-07","wgt":1637436,"dlr":5511056,"unit":3.3657},{"ym":"2024-08","wgt":1468045,"dlr":4889246,"unit":3.3304},{"ym":"2024-09","wgt":1404161,"dlr":4870929,"unit":3.4689},{"ym":"2024-10","wgt":1549530,"dlr":5592672,"unit":3.6093},{"ym":"2024-11","wgt":1662063,"dlr":5237180,"unit":3.151},{"ym":"2024-12","wgt":1332109,"dlr":4797264,"unit":3.6013},{"ym":"2025-01","wgt":1522605,"dlr":4787797,"unit":3.1445},{"ym":"2025-02","wgt":1716578,"dlr":5475844,"unit":3.19},{"ym":"2025-03","wgt":1527110,"dlr":5182964,"unit":3.394},{"ym":"2025-04","wgt":1856955,"dlr":6274550,"unit":3.3789},{"ym":"2025-05","wgt":1536690,"dlr":5080842,"unit":3.3064},{"ym":"2025-06","wgt":1619746,"dlr":5102731,"unit":3.1503},{"ym":"2025-07","wgt":2009860,"dlr":6444285,"unit":3.2063},{"ym":"2025-08","wgt":1621904,"dlr":5290857,"unit":3.2621},{"ym":"2025-09","wgt":1531975,"dlr":5248802,"unit":3.4262},{"ym":"2025-10","wgt":1064878,"dlr":3877425,"unit":3.6412},{"ym":"2025-11","wgt":1451831,"dlr":5235252,"unit":3.606},{"ym":"2025-12","wgt":1266129,"dlr":4639337,"unit":3.6642}]},"1902301010":{"name":"라면","series":[{"ym":"2023-01","wgt":16830586,"dlr":61505999,"unit":3.6544},{"ym":"2023-02","wgt":18925369,"dlr":70718110,"unit":3.7367},{"ym":"2023-03","wgt":19637411,"dlr":75634199,"unit":3.8515},{"ym":"2023-04","wgt":18550467,"dlr":73951045,"unit":3.9865},{"ym":"2023-05","wgt":18934965,"dlr":75070951,"unit":3.9647},{"ym":"2023-06","wgt":22629768,"dlr":89168269,"unit":3.9403},{"ym":"2023-07","wgt":19264384,"dlr":75921065,"unit":3.941},{"ym":"2023-08","wgt":21126924,"dlr":85657529,"unit":4.0544},{"ym":"2023-09","wgt":22751201,"dlr":89605626,"unit":3.9385},{"ym":"2023-10","wgt":22705376,"dlr":87954115,"unit":3.8737},{"ym":"2023-11","wgt":23437174,"dlr":90776919,"unit":3.8732},{"ym":"2023-12","wgt":19413391,"dlr":76438881,"unit":3.9374},{"ym":"2024-01","wgt":21223142,"dlr":85751012,"unit":4.0404},{"ym":"2024-02","wgt":22704618,"dlr":92901948,"unit":4.0918},{"ym":"2024-03","wgt":23359058,"dlr":91609313,"unit":3.9218},{"ym":"2024-04","wgt":26996002,"dlr":108537461,"unit":4.0205},{"ym":"2024-05","wgt":26916994,"dlr":107337924,"unit":3.9877},{"ym":"2024-06","wgt":25379198,"dlr":104081666,"unit":4.1011},{"ym":"2024-07","wgt":26805870,"dlr":109132838,"unit":4.0712},{"ym":"2024-08","wgt":24883874,"dlr":100621511,"unit":4.0436},{"ym":"2024-09","wgt":25555843,"dlr":103676255,"unit":4.0569},{"ym":"2024-10","wgt":28855286,"dlr":116961176,"unit":4.0534},{"ym":"2024-11","wgt":30107999,"dlr":117550316,"unit":3.9043},{"ym":"2024-12","wgt":27657079,"dlr":110223665,"unit":3.9854},{"ym":"2025-01","wgt":26906799,"dlr":107465043,"unit":3.994},{"ym":"2025-02","wgt":30275628,"dlr":121129032,"unit":4.0009},{"ym":"2025-03","wgt":28221476,"dlr":115221568,"unit":4.0828},{"ym":"2025-04","wgt":32588321,"dlr":134679235,"unit":4.1327},{"ym":"2025-05","wgt":30771353,"dlr":126800362,"unit":4.1207},{"ym":"2025-06","wgt":29557482,"dlr":126332098,"unit":4.2741},{"ym":"2025-07","wgt":32672883,"dlr":131169561,"unit":4.0146},{"ym":"2025-08","wgt":28340604,"dlr":114992928,"unit":4.0575},{"ym":"2025-09","wgt":36544364,"dlr":147207178,"unit":4.0282},{"ym":"2025-10","wgt":32660120,"dlr":130226014,"unit":3.9873},{"ym":"2025-11","wgt":31915113,"dlr":125972236,"unit":3.9471},{"ym":"2025-12","wgt":33857987,"dlr":139657524,"unit":4.1248}]}};

const HS_LIST = Object.keys(DATA);

// ── 색상 토큰 ──
const C = {
  ink: "#14243B", paper: "#EDF0F5", card: "#FFFFFF", line: "#DCE2EC",
  muted: "#5E6E84", subtle: "#8A98AC",
  wgt: "#2E6F9E", unit: "#B5792E",
  trend: "#9AA7B8",
  up: "#1F8A5B", down: "#C0504D", flat: "#7A8699",
};

// 최소제곱 추세선
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

// 추세 진단: 추세선의 시작→끝 변화율로 분류
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
  const [code, setCode] = useState("1902301010");
  const [query, setQuery] = useState("1902301010");

  const entry = DATA[code];

  const prepared = useMemo(() => {
    if (!entry) return null;
    const s = entry.series;
    const wgtVals = s.map((d) => d.wgt);
    const unitVals = s.map((d) => d.unit);
    const wgtReg = regression(wgtVals);
    const unitReg = regression(unitVals);
    const maxWgt = Math.max(...wgtVals);
    const useTon = maxWgt >= 100000;            // 큰 물량은 톤 단위로 표시
    const wUnit = useTon ? "톤" : "kg";
    const wDiv = useTon ? 1000 : 1;

    const rows = s.map((d, i) => ({
      ym: d.ym,
      wgtDisp: d.wgt / wDiv,
      wgtTrend: wgtReg ? (wgtReg.intercept + wgtReg.slope * i) / wDiv : null,
      unit: d.unit,
      unitTrend: unitReg ? unitReg.intercept + unitReg.slope * i : null,
      rawWgt: d.wgt, rawDlr: d.dlr,
    }));

    return {
      rows, wUnit,
      period: `${s[0].ym} ~ ${s[s.length - 1].ym} (${s.length}개월)`,
      latest: s[s.length - 1],
      totalWgt: s.reduce((a, d) => a + d.wgt, 0),
      totalDlr: s.reduce((a, d) => a + d.dlr, 0),
      wgtDx: diagnose(wgtVals, "wgt"),
      unitDx: diagnose(unitVals, "unit"),
    };
  }, [entry, code]);

  const submit = () => {
    const q = query.trim();
    if (DATA[q]) setCode(q);
  };

  const tick = (rows) => {
    // x축 라벨: 1월만 표시
    return (v) => (v.endsWith("-01") ? v.slice(0, 4) : "");
  };

  const card = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 14 };

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
      background: C.paper, color: C.ink, minHeight: "100%", padding: "28px 20px",
    }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: C.unit, fontWeight: 700, textTransform: "uppercase" }}>
            HS Code 단가 진단
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "6px 0 4px", letterSpacing: -0.5 }}>
            수출 단가·물량 3년 추세 진단
          </h1>
          <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.6 }}>
            HS 코드를 입력하면 관세청 월별 수출실적 기준 최근 3년 추세를 진단합니다.
          </p>
        </div>

        {/* 입력 */}
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
            <button onClick={submit} style={{
              background: C.ink, color: "#fff", border: "none", borderRadius: 10,
              padding: "11px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}>진단</button>
          </div>

          {!DATA[query.trim()] && query.trim().length > 0 && (
            <div style={{ fontSize: 13, color: C.down, marginTop: 8 }}>
              해당 코드의 데이터가 없습니다. 아래 데모 품목 중에서 선택해 주세요.
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: C.subtle, marginBottom: 7 }}>데모 데이터 (HS 1902 · 면류/파스타)</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {HS_LIST.map((hs) => {
                const on = hs === code;
                return (
                  <button key={hs} onClick={() => { setCode(hs); setQuery(hs); }}
                    style={{
                      border: `1px solid ${on ? C.ink : C.line}`,
                      background: on ? C.ink : "#fff", color: on ? "#fff" : C.muted,
                      borderRadius: 999, padding: "6px 13px", fontSize: 13, cursor: "pointer",
                      fontWeight: on ? 700 : 500,
                    }}>
                    {DATA[hs].name} · {hs}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {prepared && (
          <>
            {/* 요약 바 */}
            <div style={{ ...card, padding: "16px 18px", marginBottom: 18, display: "flex", flexWrap: "wrap", gap: 18, alignItems: "baseline" }}>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontSize: 12, color: C.subtle }}>품목 · HS</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{entry.name}</div>
                <div style={{ fontSize: 13, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{code}</div>
              </div>
              <Stat label="데이터 구간" value={prepared.period} />
              <Stat label="최근월 수출중량" value={`${fmtInt(prepared.latest.wgt)} kg`} />
              <Stat label="최근월 단가" value={`$ ${prepared.latest.unit.toFixed(2)} /kg`} />
            </div>

            {/* 1. 수출 총중량 추세 */}
            <ChartCard
              index="01"
              title="수출 총중량 추세"
              sub={`월별 수출중량 합계 · 단위 ${prepared.wUnit}`}
              dx={prepared.wgtDx}
              color={C.wgt}
            >
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={prepared.rows} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke={C.line} vertical={false} />
                  <XAxis dataKey="ym" tickFormatter={tick(prepared.rows)} tick={{ fontSize: 12, fill: C.muted }}
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

            {/* 2. 단가 추세 */}
            <ChartCard
              index="02"
              title="수출 단가 추세"
              sub="월별 (수출금액 합계 ÷ 수출중량 합계) · 단위 USD/kg"
              dx={prepared.unitDx}
              color={C.unit}
            >
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={prepared.rows} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke={C.line} vertical={false} />
                  <XAxis dataKey="ym" tickFormatter={tick(prepared.rows)} tick={{ fontSize: 12, fill: C.muted }}
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
              실제 서비스에서는 이상치·소량거래 필터와 국가별 비교가 추가됩니다.
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
  return box(
    <>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.ym}</div>
      <div style={{ color: C.unit }}>단가 $ {d.unit.toFixed(3)} /kg</div>
      <div style={{ color: C.muted }}>금액 ${fmtInt(d.rawDlr)} · 중량 {fmtInt(d.rawWgt)}kg</div>
    </>
  );
}

export default App;
