// 관세청 "품목별 국가별 수출입실적(GW)" API를 호출해서
// 최근 3년치 월별 (전체국가 합계) 수출중량·수출금액·단가를 돌려주는 백엔드 함수입니다.
// 인증키는 코드에 직접 쓰지 않고 Vercel 환경변수(CUSTOMS_API_KEY)에서 읽습니다.

const BASE = "http://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList";

// 같은 HS 코드를 잠깐 사이에 또 부르면 캐시로 빠르게 응답 (관세청 데이터는 월 1회 갱신)
const cache = new Map(); // hs -> { ts, data }
const TTL = 1000 * 60 * 60 * 6; // 6시간

function tag(chunk, name) {
  const m = chunk.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? m[1].trim() : "";
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const hs = (searchParams.get("hs") || "").replace(/\D/g, "");
  const cnty = (searchParams.get("cnty") || "").replace(/[^A-Za-z]/g, "").toUpperCase();

  if (hs.length < 4) {
    return Response.json({ error: "HS 코드를 4자리 이상 입력해 주세요." }, { status: 400 });
  }

  const KEY = process.env.CUSTOMS_API_KEY;
  if (!KEY) {
    return Response.json(
      { error: "서버에 인증키가 설정되지 않았습니다. (Vercel 환경변수 CUSTOMS_API_KEY 확인)" },
      { status: 500 }
    );
  }

  // 캐시 확인 (HS + 국가 조합별로 저장)
  const cacheKey = `${hs}|${cnty}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < TTL) {
    return Response.json(hit.data);
  }

  const years = [2023, 2024, 2025]; // 자사 입력과 동일하게 2023~2025 고정

  const monthly = {}; // "YYYY-MM" -> { wgt, dlr }
  let productName = "";

  try {
    const ROWS = 2000;      // 한 페이지당 행 수
    const MAX_PAGES = 40;    // 안전 상한 (무한 루프 방지)
    for (const y of years) {
      const start = `${y}01`;
      const end = `${y}12`;

      for (let page = 1; page <= MAX_PAGES; page++) {
        const params = new URLSearchParams({
          strtYymm: start,
          endYymm: end,
          hsSgn: hs,
          cntyCd: cnty,        // 비어 있으면 전체 국가, 값이 있으면 해당 국가
          numOfRows: String(ROWS),
          pageNo: String(page),
        });

        // serviceKey는 (브라우저에서 작동한) 인코딩 키를 그대로 붙입니다 (추가 인코딩 안 함)
        const url = `${BASE}?serviceKey=${KEY}&${params.toString()}`;

        const res = await fetch(url, { cache: "no-store" });
        const xml = await res.text();

        const items = xml.split("<item>").slice(1);
        if (items.length === 0) break; // 더 받을 데이터 없음
        for (const chunk of items) {
          const yearTag = tag(chunk, "year");
          const hsTag = tag(chunk, "hsCd");
          // "총계" 행과 합계용 더미행(hsCd="-")은 건너뛰고, 실제 월별 국가 행만 합산
          if (yearTag === "총계" || hsTag === "-" || !yearTag.includes(".")) continue;

          const [yy, mmRaw] = yearTag.split(".");
          const ym = `${yy}-${String(mmRaw).padStart(2, "0")}`;
          const wgt = parseFloat(tag(chunk, "expWgt")) || 0;
          const dlr = parseFloat(tag(chunk, "expDlr")) || 0;

          if (!productName) {
            const k = tag(chunk, "statKor");
            if (k && k !== "-") productName = k;
          }
          if (!monthly[ym]) monthly[ym] = { wgt: 0, dlr: 0 };
          monthly[ym].wgt += wgt;
          monthly[ym].dlr += dlr;
        }
        if (items.length < ROWS) break; // 마지막 페이지
      }
    }
  } catch (e) {
    return Response.json({ error: "관세청 API 호출 중 오류가 발생했습니다." }, { status: 502 });
  }

  const series = Object.keys(monthly)
    .sort()
    .map((ym) => {
      const { wgt, dlr } = monthly[ym];
      return {
        ym,
        wgt: Math.round(wgt * 10) / 10,
        dlr: Math.round(dlr * 10) / 10,
        unit: wgt > 0 ? Math.round((dlr / wgt) * 10000) / 10000 : null,
      };
    });

  if (series.length === 0) {
    return Response.json({ error: "해당 조건의 최근 3년 수출 데이터가 없습니다.", hs, cnty, series: [] });
  }

  const data = { hs, cnty, name: productName, series };
  cache.set(cacheKey, { ts: Date.now(), data });
  return Response.json(data);
}
