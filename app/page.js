"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* 미리보기용 샘플 (면류·꽃·소스류). 실제 사이트에서는 /hs_codes.json 전체를 불러옵니다. */
const SAMPLE = [["0601101000","튤립의 것"],["0601102000","백합의 것"],["0601104000","히아신스의 것"],["0601105000","글라디올러스의 것"],["0601106000","아이리스의 것"],["0601107000","프리지어의 것"],["0601108000","수선화의 것"],["0601109000","기타"],["0601201000","튤립의 것"],["0601202000","백합의 것"],["0601207000","아이리스의 것"],["0601208000","프리지어의 것"],["0601209010","수선화의 것"],["0601209090","기타"],["0602100000","뿌리가 없는 꺾꽂이용 가지와 접붙임용 가지"],["0602201000","사과나무"],["0602202000","배나무"],["0602203000","복숭아나무"],["0602204000","포도나무"],["0602206000","귤나무"],["0602209000","기타"],["0602300000","철쭉과 진달래속의 식물"],["0602400000","장미"],["0602901010","난초"],["0602901020","카네이션"],["0602901050","국화"],["0602901090","기타"],["0603110000","장미"],["0603120000","카네이션"],["0603131000","심비디움(Cymbidiums)"],["0603132000","팔레놉시스(Phalaenopsis)"],["0603139000","기타"],["0603140000","국화"],["0603150000","백합[릴리움(Lilium)속]"],["0603191000","튤립"],["0603199000","기타"],["0603900000","기타"],["1901101010","조제 분유"],["1901109090","기타"],["1901201000","쌀가루의 것"],["1901901000","맥아 추출물(extract)"],["1901909010","오트밀"],["1902111000","스파게티"],["1902112000","마카로니"],["1902119000","기타"],["1902191000","국수"],["1902192000","당면"],["1902193000","냉면"],["1902199000","기타"],["1902200000","속을 채운 파스타"],["1902301010","라면"],["1902301090","기타"],["1902309000","기타"],["1902400000","쿠스쿠스(couscous)"],["1903001000","타피오카"],["1904101000","콘 플레이크(corn flake)"],["1904102000","콘 칩"],["1904103000","튀긴 쌀"],["1905310000","스위트 비스킷"],["1905320000","와플과 웨이퍼"],["1905901010","빵"],["1905901040","비스킷, 쿠키와 크래커"],["1905901050","쌀과자"],["2101111000","인스턴트 커피"],["2103100000","간장"],["2103201000","토마토 케첩"],["2103901010","된장"],["2103901030","고추장"],["2103909010","마요네스"],["2103909020","인스턴트 카레"],["2104101000","육류로 만든 것"],["2106101000","두부"]];

const CH_NAMES = {
  "01": "산동물",
  "02": "육과 식용설육",
  "03": "어패류",
  "04": "낙농품·조란·천연꿀",
  "05": "기타동물성생산품",
  "06": "산수목·꽃",
  "07": "채소",
  "08": "과실·견과류",
  "09": "커피·차·향신료",
  "10": "곡물",
  "11": "곡물의 분과 조분 밀가루·전분",
  "12": "채유용종자·인삼",
  "13": "식물성엑스",
  "14": "기타식물성생산품",
  "15": "동식물성유지",
  "16": "육·어류조제품",
  "17": "당류·설탕과자",
  "18": "코코아·초코렛",
  "19": "곡물,곡분의 주제품과 빵류",
  "20": "채소·과실의조제품",
  "21": "기타의조제식료품",
  "22": "음료,주류,식초",
  "23": "조제사료",
  "24": "담배",
  "25": "토석류·소금",
  "26": "광,슬랙,회",
  "27": "광물성연료,에너지",
  "28": "무기화합물",
  "29": "유기화합물",
  "30": "의료용품",
  "31": "비료",
  "32": "염료,안료,페인트잉크",
  "33": "향료·화장품",
  "34": "비누,계면활성제·왁스",
  "35": "카세인·알부민·변성전분·효소",
  "36": "화약류·성냥",
  "37": "필름인화지,사진용재료",
  "38": "각종화학공업생산품",
  "39": "플라스틱과그제품",
  "40": "고무와그제품",
  "41": "원피·가죽",
  "42": "가죽제품",
  "43": "모피,모피제품",
  "44": "목재·목탄",
  "45": "코르크·짚",
  "46": "조물재료의제품",
  "47": "펄프",
  "48": "지와 판지",
  "49": "서적·신문인쇄물",
  "50": "견·견사견직물",
  "51": "양모·수모",
  "52": "면·면사면직물",
  "53": "마류의사와직물",
  "54": "인조필라멘트섬유",
  "55": "인조스테이플섬유",
  "56": "워딩·부직포",
  "57": "양탄자",
  "58": "특수직물",
  "59": "침투,도포한직물",
  "60": "편물",
  "61": "의류(편물제)",
  "62": "의류(편물제이외)",
  "63": "기타섬유제품·넝마",
  "64": "신발류",
  "65": "모자류",
  "66": "우산·지팡이",
  "67": "조제우모·인조제품",
  "68": "석,시멘트,석면제품",
  "69": "도자제품",
  "70": "유리",
  "71": "귀석,반귀석,귀금속",
  "72": "철강",
  "73": "철강제품",
  "74": "동과그제품",
  "75": "니켈과그제품",
  "76": "알루미늄과그제품",
  "77": "(유 보)",
  "78": "연과그제품",
  "79": "아연과그제품",
  "80": "주석과그제품",
  "81": "기타의비금속",
  "82": "비금속제공구,스푼·포크",
  "83": "각종비금속제품",
  "84": "보일러·기계류",
  "85": "전기기기·TV·VTR",
  "86": "철도차량",
  "87": "일반차량",
  "88": "항공기",
  "89": "선박",
  "90": "광학·의료·측정·검사·정밀기기",
  "91": "시계",
  "92": "악기",
  "93": "무기",
  "94": "가구류·조명기구",
  "95": "완구·운동용구",
  "96": "잡품",
  "97": "예술품·골동품"
};

// 국가 드롭다운 (ISO 2자리 코드 + 한글명) — 외교부 국가표준코드
const COUNTRIES = [["GH","가나"],["GA","가봉"],["GY","가이아나"],["GM","감비아"],["GG","건지"],["GP","과들루프"],["GT","과테말라"],["GU","괌"],["VA","교황청"],["GD","그레나다"],["GR","그리스"],["GL","그린란드"],["GN","기니"],["GW","기니비사우"],["NR","나우루"],["NG","나이지리아"],["SS","남수단"],["ZA","남아프리카공화국"],["NL","네덜란드"],["AN","네덜란드령 안틸레스"],["NP","네팔연방"],["NO","노르웨이"],["NF","노퍽섬"],["NC","뉴 칼레도니아"],["NZ","뉴질랜드"],["NU","니우에"],["NE","니제르"],["NI","니카라과"],["TW","대만"],["KR","대한민국"],["DK","덴마크"],["DO","도미니카공화국"],["DM","도미니카연방"],["DE","독일"],["TL","동티모르"],["LA","라오스"],["LR","라이베리아"],["LV","라트비아"],["RU","러시아"],["LB","레바논"],["LS","레소토"],["RE","레위니옹"],["RO","루마니아"],["LU","룩셈부르크"],["RW","르완다"],["LY","리비아"],["LT","리투아니아"],["LI","리히텐슈타인"],["MG","마다가스카르"],["MQ","마르티니크"],["MH","마셜제도"],["YT","마요트"],["FM","마이크로네시아연방"],["MO","마카오"],["MW","말라위"],["MY","말레이시아"],["ML","말리"],["IM","맨 섬"],["MX","멕시코"],["MC","모나코"],["MA","모로코"],["MU","모리셔스"],["MR","모리타니아"],["MZ","모잠비크"],["ME","몬테네그로"],["MS","몬트세랫"],["MD","몰도바"],["MV","몰디브"],["MT","몰타"],["MN","몽골"],["UM","미국령 군소 제도"],["VI","미국령 버진아일랜드"],["MM","미얀마"],["US","미합중국"],["VU","바누아투"],["BH","바레인"],["BB","바베이도스"],["BS","바하마"],["BD","방글라데시"],["BM","버뮤다"],["BJ","베냉"],["VE","베네수엘라볼리바르"],["VN","베트남"],["BE","벨기에"],["BY","벨라루스"],["BZ","벨리즈"],["BQ","보네르섬"],["BA","보스니아헤르체고비나"],["BW","보츠와나"],["BO","볼리비아"],["BI","부룬디"],["BF","부르키나파소"],["BT","부탄"],["MP","북마리아나 군도"],["MK","북마케도니아"],["BG","불가리아"],["BR","브라질"],["BN","브루나이"],["WS","사모아"],["SA","사우디아라비아"],["CY","사이프러스"],["EH","서부사하라"],["SM","산마리노"],["ST","상투메프린시페"],["BL","생바르텔레미"],["PM","생피에르·미클롱"],["SN","세네갈"],["RS","세르비아"],["SC","세이셸"],["SH","세인트 헬레나 섬"],["LC","세인트루시아"],["MF","세인트마틴 섬"],["VC","세인트빈센트그레나딘"],["KN","세인트키츠네비스"],["SO","소말리아"],["SB","솔로몬제도"],["SD","수단"],["SR","수리남"],["LK","스리랑카"],["SE","스웨덴"],["CH","스위스"],["ES","스페인"],["SK","슬로바키아"],["SI","슬로베니아"],["SY","시리아"],["SL","시에라리온"],["SX","신트마르턴"],["SG","싱가포르"],["AE","아랍에미리트"],["AW","아루바"],["AM","아르메니아"],["AR","아르헨티나"],["IS","아이슬란드"],["HT","아이티"],["IE","아일랜드"],["AZ","아제르바이잔"],["AF","아프가니스탄"],["AD","안도라"],["AL","알바니아"],["DZ","알제리"],["AO","앙골라"],["AG","앤티가바부다"],["AI","앵귈라"],["ER","에리트레아"],["SZ","에스와티니"],["EE","에스토니아"],["EC","에콰도르"],["ET","에티오피아"],["SV","엘살바도르"],["GB","영국"],["VG","영국령 버진 아일랜드"],["YE","예멘"],["OM","오만"],["AT","오스트리아"],["HN","온두라스"],["JO","요르단"],["UG","우간다"],["UY","우루과이"],["UZ","우즈베키스탄"],["UA","우크라이나"],["IQ","이라크"],["IR","이란"],["IL","이스라엘"],["EG","이집트"],["IT","이탈리아"],["IN","인도"],["ID","인도네시아"],["JP","일본"],["JM","자메이카"],["ZM","잠비아"],["JE","저지"],["GQ","적도기니"],["KP","조선민주주의인민공화국"],["GE","조지아"],["CN","중국"],["CF","중앙아프리카"],["DJ","지부티"],["GI","지브롤터"],["ZW","짐바브웨"],["TD","차드"],["CZ","체코"],["CL","칠레"],["CM","카메룬"],["CV","카보베르데"],["KZ","카자흐스탄"],["QA","카타르"],["KH","캄보디아"],["CA","캐나다"],["KE","케냐"],["KY","케이맨제도"],["KM","코모로"],["XK","코소보"],["CR","코스타리카"],["CC","코코스제도"],["CI","코트디부아르"],["CO","콜롬비아"],["CG","콩고"],["CD","콩고민주공화국"],["CU","쿠바"],["KW","쿠웨이트"],["CK","쿡제도"],["CW","퀴라소"],["HR","크로아티아"],["CX","크리스마스섬"],["KG","키르기즈공화국"],["KI","키리바시"],["TJ","타지키스탄"],["TZ","탄자니아"],["TH","태국"],["TC","터크스·케이커스 제도"],["TG","토고"],["TO","통가"],["TM","투르크메니스탄"],["TV","투발루"],["TN","튀니지"],["TR","튀르키예공화국"],["TT","트리니다드토바고"],["PA","파나마"],["PY","파라과이"],["PK","파키스탄"],["PG","파푸아뉴기니"],["PW","팔라우"],["PS","팔레스타인"],["FO","페로제도"],["PE","페루"],["PT","포르투갈"],["FK","포클랜드 제도"],["PL","폴란드"],["PR","푸에르토리코"],["FR","프랑스"],["GF","프랑스령 기아나"],["PF","프랑스령 폴리네시아"],["FJ","피지"],["FI","핀란드"],["PH","필리핀"],["HU","헝가리"],["AU","호주"],["HK","홍콩"]];

// 데모 시장 폴백 (HS 1902 7개 품목, 2023~2025). [ym, 수출중량, 수출금액] — API가 막혔을 때 미리보기용. 실서비스는 /api/trade 사용.
const MKT = {"1902111000":[["2023-01",603,2440],["2023-02",3093,12658],["2023-03",7858,8038],["2023-04",9358,8702],["2023-05",2875,12636],["2023-06",2966,12411],["2023-07",8219,15542],["2023-08",3861,20338],["2023-09",19484,73983],["2023-10",705,848],["2023-11",5127,10376],["2023-12",2277,4488],["2024-01",27980,59216],["2024-02",3824,21759],["2024-03",88,618],["2024-04",2828,10231],["2024-05",468,1633],["2024-06",3080,4175],["2024-07",841,3485],["2024-08",1611,5470],["2024-09",253,436],["2024-10",1160,3731],["2024-11",1952,6722],["2024-12",2432,3592],["2025-01",830,1927],["2025-02",2029,2048],["2025-03",4149,8256],["2025-04",2027,5358],["2025-05",1724,4660],["2025-06",3729,7933],["2025-08",2728,3166],["2025-09",3486,5287],["2025-10",22344,24042],["2025-11",37918,160423],["2025-12",236,570]],"1902191000":[["2023-01",972281,2042682],["2023-02",1418205,3028316],["2023-03",1441360,3153927],["2023-04",1578699,3250848],["2023-05",1317904,2953503],["2023-06",1308635,2868389],["2023-07",945480,2228643],["2023-08",1296235,2738254],["2023-09",1325641,2750491],["2023-10",1179593,2585964],["2023-11",1741797,3569391],["2023-12",1418432,3028071],["2024-01",1643380,3261468],["2024-02",1257103,2592353],["2024-03",1236675,2551895],["2024-04",1472529,2905768],["2024-05",1464549,3119418],["2024-06",1340631,2825905],["2024-07",1632932,3292648],["2024-08",1248067,2469391],["2024-09",1343584,2739878],["2024-10",1225253,2537020],["2024-11",1643955,3203261],["2024-12",1587342,3034935],["2025-01",1322564,2506163],["2025-02",1670252,3147788],["2025-03",1698070,3434064],["2025-04",1572846,2992212],["2025-05",1341761,2749633],["2025-06",1268995,2477753],["2025-07",1487713,2973610],["2025-08",1858342,3484287],["2025-09",1730571,3143488],["2025-10",1557646,2876329],["2025-11",1418634,2748484],["2025-12",1386307,2704435]],"1902192000":[["2023-01",124067,532000],["2023-02",144765,633883],["2023-03",148203,618292],["2023-04",130477,582436],["2023-05",134760,544060],["2023-06",191990,757130],["2023-07",132450,562028],["2023-08",124667,542411],["2023-09",136932,558380],["2023-10",103807,448317],["2023-11",151295,629967],["2023-12",109622,462299],["2024-01",158290,681204],["2024-02",149262,589700],["2024-03",155536,663607],["2024-04",136711,539073],["2024-05",140142,556342],["2024-06",152857,585628],["2024-07",141360,567456],["2024-08",108351,458090],["2024-09",112840,491077],["2024-10",131261,555422],["2024-11",124192,534236],["2024-12",153134,629796],["2025-01",115856,479746],["2025-02",138067,570409],["2025-03",170349,671579],["2025-04",193618,775379],["2025-05",153503,564986],["2025-06",172693,676191],["2025-07",133026,613880],["2025-08",88790,425806],["2025-09",140188,556199],["2025-10",85885,315216],["2025-11",112877,458305],["2025-12",142250,596224]],"1902193000":[["2023-01",127478,337304],["2023-02",338673,952820],["2023-03",450671,1115732],["2023-04",521804,1264863],["2023-05",481043,1216401],["2023-06",466516,1212291],["2023-07",259549,686051],["2023-08",283218,761045],["2023-09",221462,570535],["2023-10",196836,482595],["2023-11",72442,197822],["2023-12",82498,210183],["2024-01",156638,425276],["2024-02",372463,892588],["2024-03",551855,1484535],["2024-04",451182,1221612],["2024-05",415632,1092273],["2024-06",291433,701936],["2024-07",339782,782071],["2024-08",312605,749679],["2024-09",168420,418073],["2024-10",145797,405896],["2024-11",141842,331352],["2024-12",147188,431348],["2025-01",100329,199633],["2025-02",227237,542979],["2025-03",395687,998956],["2025-04",543967,1258864],["2025-05",455582,1219930],["2025-06",385203,1027001],["2025-07",340463,819851],["2025-08",305136,885360],["2025-09",263814,722033],["2025-10",144196,415133],["2025-11",181987,439273],["2025-12",171956,463357]],"1902200000":[["2023-01",1301291,4617582],["2023-02",1542662,5544371],["2023-03",1457505,5324077],["2023-04",1238373,4674720],["2023-05",1373142,5045040],["2023-06",1737328,6183390],["2023-07",1326948,4813758],["2023-08",1359380,4863748],["2023-09",1318222,4801730],["2023-10",1817175,6353555],["2023-11",2217879,7595785],["2023-12",1728766,6609678],["2024-01",1381371,5227935],["2024-02",1497612,5602173],["2024-03",1730043,6698360],["2024-04",1740242,6223970],["2024-05",1588115,5432885],["2024-06",1532718,5422358],["2024-07",1637436,5511056],["2024-08",1468045,4889246],["2024-09",1404161,4870929],["2024-10",1549530,5592672],["2024-11",1662063,5237180],["2024-12",1332109,4797264],["2025-01",1522605,4787797],["2025-02",1716578,5475844],["2025-03",1527110,5182964],["2025-04",1856955,6274550],["2025-05",1536690,5080842],["2025-06",1619746,5102731],["2025-07",2009860,6444285],["2025-08",1621904,5290857],["2025-09",1531975,5248802],["2025-10",1064878,3877425],["2025-11",1451831,5235252],["2025-12",1266129,4639337]],"1902301010":[["2023-01",16830586,61505999],["2023-02",18925369,70718110],["2023-03",19637411,75634199],["2023-04",18550467,73951045],["2023-05",18934965,75070951],["2023-06",22629768,89168269],["2023-07",19264384,75921065],["2023-08",21126924,85657529],["2023-09",22751201,89605626],["2023-10",22705376,87954115],["2023-11",23437174,90776919],["2023-12",19413391,76438881],["2024-01",21223142,85751012],["2024-02",22704618,92901948],["2024-03",23359058,91609313],["2024-04",26996002,108537461],["2024-05",26916994,107337924],["2024-06",25379198,104081666],["2024-07",26805870,109132838],["2024-08",24883874,100621511],["2024-09",25555843,103676255],["2024-10",28855286,116961176],["2024-11",30107999,117550316],["2024-12",27657079,110223665],["2025-01",26906799,107465043],["2025-02",30275628,121129032],["2025-03",28221476,115221568],["2025-04",32588321,134679235],["2025-05",30771353,126800362],["2025-06",29557482,126332098],["2025-07",32672883,131169561],["2025-08",28340604,114992928],["2025-09",36544364,147207178],["2025-10",32660120,130226014],["2025-11",31915113,125972236],["2025-12",33857987,139657524]]};

// USD→KRW 월평균 환율 (매매기준율). 실질단가(기준월 대비 배율) 계산용.
const FX = {"2023-01":1247.25,"2023-02":1270.74,"2023-03":1305.73,"2023-04":1320.01,"2023-05":1328.21,"2023-06":1296.71,"2023-07":1286.3,"2023-08":1318.47,"2023-09":1329.47,"2023-10":1350.69,"2023-11":1310.39,"2023-12":1303.98,"2024-01":1323.57,"2024-02":1331.74,"2024-03":1330.69,"2024-04":1367.83,"2024-05":1365.39,"2024-06":1380.13,"2024-07":1383.38,"2024-08":1354.15,"2024-09":1334.82,"2024-10":1361.0,"2024-11":1393.38,"2024-12":1434.42,"2025-01":1455.79,"2025-02":1445.56,"2025-03":1456.95,"2025-04":1444.31,"2025-05":1394.49,"2025-06":1366.95,"2025-07":1375.22,"2025-08":1389.66,"2025-09":1391.83,"2025-10":1423.36,"2025-11":1457.77,"2025-12":1467.4};
const CPI_BASE_YM = "2023-01"; // 현재 26년1월 가정 → 그전 36개월의 시작(기준월)

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
// [x,y] 쌍으로 회귀 (x = 달력상 월 인덱스). 결측 달의 실제 시간 간격을 반영.
function regIdx(pts) {
  const p = pts.filter((q) => q[1] != null && isFinite(q[1]));
  const n = p.length; if (n < 2) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (const [x, y] of p) { sx += x; sy += y; sxy += x * y; sxx += x * x; }
  const denom = n * sxx - sx * sx; if (denom === 0) return null;
  const slope = (n * sxy - sx * sy) / denom;
  return { slope, intercept: (sy - slope * sx) / n };
}
function diagnose(values, kind) {
  const reg = regression(values); if (!reg) return null;
  const last = values.length - 1, start = reg.intercept, end = reg.intercept + reg.slope * last;
  const pct = start !== 0 ? ((end - start) / Math.abs(start)) * 100 : 0;
  const dir = pct >= 0 ? "up" : "down";
  const color = dir === "up" ? C.up : C.down;
  let label, note;
  if (kind === "wgt") {
    label = dir === "up" ? "상승" : "하락";
    note = dir === "up" ? "수출 물량이 3년간 확대되는 추세입니다." : "수출 물량이 3년간 축소되는 추세입니다.";
  } else {
    label = dir === "up" ? "상승" : "하락";
    note = dir === "up" ? "단가가 우상향 — ‘제값받기’가 개선되는 신호입니다." : "단가가 우하향 — 범용화·협상력 약화 위험 신호입니다.";
  }
  return { dir, pct, label, color, note };
}
const fmtInt = (n) => Math.round(n).toLocaleString("ko-KR");

/* ============ 진단 변수 엔진 (검증 단계: 변수·라벨만 계산) ============ */
const ALL_YMS = [2023, 2024, 2025].flatMap((y) => Array.from({ length: 12 }, (_, i) => `${y}-${String(i + 1).padStart(2, "0")}`));

// 회귀 + 기울기 t값 + 표준화기울기
function regT(vals) {
  const v24 = vals.slice(-24); // 최근 24개월만 회귀 대상
  const pts = v24.map((v, i) => [i, v]).filter((p) => p[1] != null && isFinite(p[1]));
  const n = pts.length; if (n < 3) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (const [x, y] of pts) { sx += x; sy += y; sxy += x * y; sxx += x * x; }
  const denom = n * sxx - sx * sx; if (denom === 0) return null;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  let sse = 0; for (const [x, y] of pts) { const e = y - (intercept + slope * x); sse += e * e; }
  const se = Math.sqrt((sse / (n - 2)) / (sxx - (sx * sx) / n));
  const t = se > 0 ? slope / se : 0;
  const mean = sy / n; let vv = 0; for (const [, y] of pts) vv += (y - mean) ** 2;
  const std = Math.sqrt(vv / n);
  const stdSlope = std > 0 ? (slope * n) / std : 0;
  return { slope, t, stdSlope, n };
}
// 5단계 추세 (t + 표준화기울기)
function trend5(vals) {
  const r = regT(vals);
  if (!r) return { label: "데이터부족", dir: "→", t: 0 };
  const { t, stdSlope } = r;
  let label;
  if (Math.abs(t) < 2) label = "유지";
  else if (t >= 2) label = stdSlope > 1.5 ? "급상승" : "완상승";
  else label = stdSlope < -1.5 ? "급하락" : "완하락";
  const dir = label === "급상승" || label === "완상승" ? "↑" : label === "급하락" || label === "완하락" ? "↓" : "→";
  return { label, dir, t };
}
const confOf = (t) => { const a = Math.abs(t); return a >= 3 ? "뚜렷" : a >= 2 ? "보통" : "약함"; };

// rows([{ym,wgt,dlr}]) → ym으로 정렬된 map
function toMap(rows) { const m = {}; for (const r of (rows || [])) m[r.ym] = r; return m; }
const unitVals = (map) => ALL_YMS.map((ym) => { const r = map[ym]; return r && r.wgt > 0 ? r.dlr / r.wgt : null; });
const wgtVals = (map) => ALL_YMS.map((ym) => { const r = map[ym]; return r ? r.wgt : null; });
// 최근 12개월 가중평균 단가
function last12Unit(map) {
  const last = ALL_YMS.slice(-12); let w = 0, d = 0;
  for (const ym of last) { const r = map[ym]; if (r && r.wgt > 0) { w += r.wgt; d += r.dlr; } }
  return w > 0 ? d / w : null;
}
const median = (a) => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };

function posLabel(z) {
  return z > 1.5 ? "매우높음" : z > 0.5 ? "다소높음" : z >= -0.5 ? "평균" : z >= -1.5 ? "다소낮음" : "매우낮음";
}

// 전체 변수 계산 (market_data 품목 + 자사 데이터 전제)
function computeDiag({ code, selfRows, mktRows, ctryMktRows, country, marketDB, cpiDB }) {
  const db = marketDB && marketDB[code];
  if (!db || !selfRows || selfRows.length < 3) return null;
  const self = toMap(selfRows), mkt = toMap(mktRows || []);

  const fw = trend5(wgtVals(self));
  let fp = trend5(unitVals(self));
  const conf = confOf(fp.t);
  if (conf === "약함") fp = { ...fp, label: "유지", dir: "→" }; // 신뢰도 약함 → 추세 유지 강등
  const mp = trend5(unitVals(mkt));

  // 위치 Z (Robust): 자사 최근12개월 vs 국가별 최근12개월 분포
  const firmAvg = last12Unit(self);
  const dist = [];
  for (const cc of Object.keys(db.byCountry || {})) {
    const v = last12Unit(toMap((db.byCountry[cc] || []).map(([ym, w, d]) => ({ ym, wgt: w, dlr: d }))));
    if (v != null) dist.push(v);
  }
  let position = null;
  if (firmAvg != null && dist.length >= 4) {
    const med = median(dist);
    const madv = median(dist.map((x) => Math.abs(x - med))) * 1.4826;
    const z = madv > 0 ? (firmAvg - med) / madv : 0;
    position = { z, label: posLabel(z), n: dist.length, firmAvg, med };
  } else if (firmAvg != null) {
    position = { z: null, label: "데이터부족", n: dist.length, firmAvg };
  }

  // 상대단가 (자사 ÷ 시장 전체)
  const rel = ALL_YMS.map((ym) => {
    const s = self[ym], m = mkt[ym];
    const su = s && s.wgt > 0 ? s.dlr / s.wgt : null;
    const mu = m && m.wgt > 0 ? m.dlr / m.wgt : null;
    return su != null && mu != null && mu !== 0 ? su / mu : null;
  });
  const relT = trend5(rel);
  const relLast = [...rel].reverse().find((v) => v != null) ?? null;

  // 환율 경보 (자사 원화단가 방향)
  const krw = ALL_YMS.map((ym) => { const s = self[ym]; const u = s && s.wgt > 0 ? s.dlr / s.wgt : null; return u != null && FX[ym] ? u * FX[ym] : null; });
  const krwDir = trend5(krw).dir;
  let fx = "없음";
  if (krwDir === "↓") fx = "경보"; else if (fp.dir === "↑" && krwDir === "→") fx = "주의";

  // 현지물가 신호 (선택 국가 CPI 추세 대비 자사 단가) — 선택 국가 필요
  let power = null;
  if (country && cpiDB && cpiDB[country.code]) {
    const cpiArr = ALL_YMS.map((ym) => cpiDB[country.code][ym] ?? null);
    const cpiDir = trend5(cpiArr).dir;
    if (cpiDir === "↑" && (fp.dir === "→" || fp.dir === "↓")) power = "기회";
    else if (fp.dir === "↑" && (cpiDir === "→" || cpiDir === "↓")) power = "주의";
    else power = "중립";
  }

  // 국가 티어 P/S/C (선택 국가 단가 수준 vs 시장, ±10%)
  let tier = null;
  if (country && ctryMktRows) {
    const cAvg = last12Unit(toMap(ctryMktRows)); const mAvg = last12Unit(mkt);
    if (cAvg != null && mAvg) {
      const ratio = cAvg / mAvg;
      tier = ratio > 1.1 ? "P(프리미엄)" : ratio < 0.9 ? "C(범용)" : "S(표준)";
    }
  }

  return { fw, fp, mp, conf, position, rel: relT, relLast, fx, power, tier, country };
}

const YEARS = [2023, 2024, 2025];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const keyOf = (y, m) => `${y}-${String(m).padStart(2, "0")}`;

export default function App() {
  const [data, setData] = useState(SAMPLE);
  const [dataNote, setDataNote] = useState("미리보기 샘플 데이터");
  const [step, setStep] = useState("select");
  const [picked, setPicked] = useState(null);
  const [entries, setEntries] = useState({});
  const [series, setSeries] = useState(null);
  const [cEntries, setCEntries] = useState({});
  const [country, setCountry] = useState(null);
  const [countryOn, setCountryOn] = useState(false);
  const [cSeries, setCSeries] = useState(null);
  const [marketDB, setMarketDB] = useState(null);
  const [cpiDB, setCpiDB] = useState(null);

  // 실제 사이트(/public/hs_codes.json)에서는 전체 데이터를 불러오고, 없으면 샘플 사용
  useEffect(() => {
    fetch("/hs_codes.json")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((arr) => { if (Array.isArray(arr) && arr.length > 200) { setData(arr); setDataNote(`전체 ${arr.length.toLocaleString("ko-KR")}개 품목`); } })
      .catch(() => {});
    // 중요 품목 시장 데이터(미리 집계). 있으면 API 없이 시장 분석을 바로 제공.
    fetch("/market_data.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j) setMarketDB(j); })
      .catch(() => {});
    fetch("/cpi.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j) setCpiDB(j); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: FONT, background: C.paper, color: C.ink, minHeight: "100vh", padding: "26px 20px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <Header step={step} dataNote={dataNote} />
        {step === "select" && <Selector data={data} onApply={(p) => { setPicked(p); setStep("input"); }} />}
        {step === "input" && (
          <InputGrid picked={picked} entries={entries} setEntries={setEntries}
            cEntries={cEntries} setCEntries={setCEntries} country={country} setCountry={setCountry}
            countryOn={countryOn} setCountryOn={setCountryOn}
            onBack={() => setStep("select")}
            onDiagnose={({ series, cSeries }) => { setSeries(series); setCSeries(cSeries); setStep("result"); }} />
        )}
        {step === "result" && <Result picked={picked} series={series} cSeries={cSeries} country={countryOn ? country : null} marketDB={marketDB} cpiDB={cpiDB} onBack={() => setStep("input")} onRestart={() => setStep("select")} />}
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
              <span style={{ fontVariantNumeric: "tabular-nums", minWidth: 28 }}>{c}</span>
              <span style={{ fontSize: 12.5, textAlign: "left", flex: 1 }}>{CH_NAMES[c] || ""}</span>
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
const CELL = { width: "100%", boxSizing: "border-box", fontSize: 13, padding: "7px 9px", border: `1px solid ${C.line}`, borderRadius: 7, outline: "none", textAlign: "right", fontVariantNumeric: "tabular-nums", color: C.ink, background: "#fff" };

function MonthGrids({ entries, onSet }) {
  return (
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
                  <input style={CELL} inputMode="decimal" value={e.wgt || ""} placeholder="—" onChange={(ev) => onSet(k, "wgt", ev.target.value)} />
                  <input style={CELL} inputMode="decimal" value={e.dlr || ""} placeholder="—" onChange={(ev) => onSet(k, "dlr", ev.target.value)} />
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function buildSeries(entries) {
  const s = [];
  YEARS.forEach((y) => MONTHS.forEach((m) => {
    const k = keyOf(y, m), e = entries[k]; if (!e) return;
    const w = parseFloat(e.wgt), d = parseFloat(e.dlr);
    if (!(w > 0) || !(d >= 0)) return;
    s.push({ ym: k, wgt: w, dlr: d, unit: d / w });
  }));
  return s;
}

function InputGrid({ picked, entries, setEntries, cEntries, setCEntries, country, setCountry, countryOn, setCountryOn, onBack, onDiagnose }) {
  const [warn, setWarn] = useState("");
  const setE = (k, field, val) => setEntries((p) => ({ ...p, [k]: { ...p[k], [field]: val.replace(/[^\d.]/g, "") } }));
  const setC = (k, field, val) => setCEntries((p) => ({ ...p, [k]: { ...p[k], [field]: val.replace(/[^\d.]/g, "") } }));

  const fillSample = () => {
    const next = {}, cnext = {};
    YEARS.forEach((y, yi) => MONTHS.forEach((m) => {
      const k = keyOf(y, m);
      const season = 1 + 0.18 * Math.sin((m / 12) * Math.PI * 2);
      const w = Math.round(80000 * season * (1 + yi * 0.12) * (0.9 + Math.random() * 0.2));
      const unit = 4.0 - yi * 0.18 + (Math.random() - 0.5) * 0.3;
      next[k] = { wgt: String(w), dlr: String(Math.round(w * unit)) };
      const cw = Math.round(w * (0.3 + Math.random() * 0.1));
      const cu = unit * (0.9 + Math.random() * 0.06);
      cnext[k] = { wgt: String(cw), dlr: String(Math.round(cw * cu)) };
    }));
    setEntries(next);
    if (countryOn) setCEntries(cnext);
  };

  const filledCount = Object.values(entries).filter((e) => e && e.wgt && parseFloat(e.wgt) > 0).length;
  const cFilled = Object.values(cEntries).filter((e) => e && e.wgt && parseFloat(e.wgt) > 0).length;

  const run = () => {
    const s = buildSeries(entries);
    if (s.length < 2) { setWarn("전체 실적은 최소 2개월 이상의 수출중량·수출금액이 필요합니다."); return; }
    if (countryOn && !country) { setWarn("특정 국가 분석을 켜셨다면 국가를 선택해 주세요. (시장·자사 국가 데이터 조회에 필요합니다)"); return; }
    let cs = null;
    if (countryOn && country) {
      const built = buildSeries(cEntries);
      if (built.length >= 2) cs = built; // 자사 국가 그래프는 입력이 2개월 이상일 때만
    }
    setWarn(""); onDiagnose({ series: s, cSeries: cs });
  };

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

      {/* 전체 수출 실적 (모든 국가 합계) */}
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>① 전체 수출 실적 (2023~2025, 모든 국가 합계)</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>각 달의 수출중량(kg)과 수출금액(USD)을 입력하세요. 수출이 없는 달은 비워 둡니다. 단가(=수출금액÷수출중량)는 자동 계산됩니다.</div>
        <MonthGrids entries={entries} onSet={setE} />
        <div style={{ marginTop: 12, fontSize: 13, color: C.muted }}>입력된 개월 수: <b style={{ color: C.ink }}>{filledCount}</b> / 36</div>
      </div>

      {/* 특정 국가 수출 실적 (선택) */}
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>② 특정 국가 (선택)</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>국가를 고르면 진단 결과에 <b>해당 국가 시장 추세</b>가 추가됩니다. 자사 국가 실적까지 입력하면 자사 국가 추세도 함께 분석합니다.</div>
          </div>
          <button onClick={() => setCountryOn((v) => !v)} style={{ background: countryOn ? C.ink : "#fff", color: countryOn ? "#fff" : C.muted, border: `1px solid ${countryOn ? C.ink : C.line}`, borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {countryOn ? "사용 중 ✓" : "+ 국가 추가"}
          </button>
        </div>
        {countryOn && (
          <div style={{ marginTop: 14 }}>
            <select value={country ? country.code : ""} onChange={(e) => { const f = COUNTRIES.find((x) => x[0] === e.target.value); setCountry(f ? { code: f[0], name: f[1] } : null); }}
              style={{ width: "100%", maxWidth: 360, boxSizing: "border-box", fontSize: 15, padding: "10px 13px", border: `1px solid ${C.line}`, borderRadius: 9, outline: "none", color: C.ink, marginBottom: 14, background: "#fff" }}>
              <option value="">국가 선택…</option>
              {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}
            </select>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10 }}>아래는 <b>자사</b>의 해당 국가향 월별 실적입니다 (입력하지 않아도 시장 분석은 됩니다).</div>
            <MonthGrids entries={cEntries} onSet={setC} />
            <div style={{ marginTop: 12, fontSize: 13, color: C.muted }}>입력된 개월 수: <b style={{ color: C.ink }}>{cFilled}</b> / 36</div>
          </div>
        )}
      </div>

      {warn && <div style={{ marginBottom: 12, color: C.down, fontSize: 13 }}>{warn}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={run} style={{ background: C.ink, color: "#fff", border: "none", borderRadius: 9, padding: "12px 26px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>추세 진단하기 →</button>
      </div>
    </div>
  );
}

/* ───────── STEP 3. 진단 결과 ───────── */
function prep(series) {
  if (!series || series.length === 0) return null;
  const map = {};
  for (const d of series) map[d.ym] = d;
  const present = ALL_YMS.filter((ym) => map[ym]);
  if (present.length === 0) return null;
  const idx = (ym) => ALL_YMS.indexOf(ym);
  const wgtReg = regIdx(present.map((ym) => [idx(ym), map[ym].wgt]));
  const unitReg = regIdx(present.map((ym) => [idx(ym), map[ym].unit]));
  const wgtValsP = present.map((ym) => map[ym].wgt);
  const maxWgt = Math.max(...wgtValsP), useTon = maxWgt >= 100000, wUnit = useTon ? "톤" : "kg", wDiv = useTon ? 1000 : 1;
  const iMin = idx(present[0]), iMax = idx(present[present.length - 1]);
  const rows = ALL_YMS.map((ym, i) => {
    const d = map[ym];
    const inRange = i >= iMin && i <= iMax;
    return {
      ym,
      wgtDisp: d ? d.wgt / wDiv : null,
      wgtTrend: wgtReg && inRange ? (wgtReg.intercept + wgtReg.slope * i) / wDiv : null,
      unit: d ? d.unit : null,
      unitTrend: unitReg && inRange ? unitReg.intercept + unitReg.slope * i : null,
      rawWgt: d ? d.wgt : null,
      rawDlr: d ? d.dlr : null,
    };
  });
  const lastYm = present[present.length - 1];
  return { rows, wUnit, latest: map[lastYm], period: `${present[0]} ~ ${lastYm} (${present.length}개월)`, wgtDx: diagnose(wgtValsP, "wgt"), unitDx: diagnose(present.map((ym) => map[ym].unit), "unit") };
}

const tickFmt = (v) => (v.endsWith("-01") ? v.slice(0, 4) : "");
const REAL = "#7A5AF0"; // 실질단가 선 색

// 실질단가(기준월 대비 배율) = 명목단가 × [환율(월)/환율(base)] × [CPI(base)/CPI(월)]
// 기준월엔 배율=1 이라 실질=명목. 결과가 명목과 같은 USD/kg 스케일이라 같은 축에 겹칩니다.
function withReal(prepared, code, cpiDB) {
  if (!prepared || !cpiDB || !code || !cpiDB[code]) return prepared;
  const cpi = cpiDB[code];
  const cpiBase = cpi[CPI_BASE_YM], fxBase = FX[CPI_BASE_YM];
  if (!cpiBase || !fxBase) return prepared;
  let has = false;
  let rows = prepared.rows.map((r) => {
    const fx = FX[r.ym], cm = cpi[r.ym];
    let realUnit = null;
    if (r.unit != null && fx && cm) { realUnit = r.unit * (fx / fxBase) * (cpiBase / cm); has = true; }
    return { ...r, realUnit };
  });
  if (!has) return { ...prepared, rows, hasReal: false };

  // 실질 회귀선 + 명목·실질 비교 통계
  const idx = (ym) => ALL_YMS.indexOf(ym);
  const realP = rows.filter((r) => r.realUnit != null);
  const nomP = rows.filter((r) => r.unit != null);
  const realReg = regIdx(realP.map((r) => [idx(r.ym), r.realUnit]));
  const nomReg = regIdx(nomP.map((r) => [idx(r.ym), r.unit]));
  const iMin = realP.length ? idx(realP[0].ym) : 0, iMax = realP.length ? idx(realP[realP.length - 1].ym) : 0;
  rows = rows.map((r) => {
    const i = idx(r.ym), inR = i >= iMin && i <= iMax;
    return { ...r, realTrend: realReg && inR ? realReg.intercept + realReg.slope * i : null };
  });
  const meanR = realP.length ? realP.reduce((s, r) => s + r.realUnit, 0) / realP.length : 0;
  const meanN = nomP.length ? nomP.reduce((s, r) => s + r.unit, 0) / nomP.length : 0;
  const realAnn = realReg && meanR ? (realReg.slope * 12 / meanR) * 100 : 0;
  const nomAnn = nomReg && meanN ? (nomReg.slope * 12 / meanN) * 100 : 0;
  const lastReal = realP.length ? realP[realP.length - 1].realUnit : null;
  const lastNom = nomP.length ? nomP[nomP.length - 1].unit : null;
  const diffPct = lastNom ? Math.abs(lastNom - lastReal) / lastNom * 100 : null;
  const realStats = { nomAnn, realAnn, lastNom, lastReal, diffPct };
  return { ...prepared, rows, hasReal: true, realStats };
}

// 명목 vs 실질 설명 (자사-국가 기준): 방향 상반(한쪽이라도 연 3%↑) 또는 최근 격차 ≥15%
function buildRealExplain(stats) {
  if (!stats || stats.lastNom == null || stats.lastReal == null) return null;
  const dirDiff = Math.sign(stats.nomAnn) !== Math.sign(stats.realAnn) && (Math.abs(stats.nomAnn) >= 3 || Math.abs(stats.realAnn) >= 3);
  const bigGap = stats.diffPct != null && stats.diffPct >= 15;
  if (!dirDiff && !bigGap) return null;
  const msgs = [];
  if (dirDiff) {
    const nomUp = stats.nomAnn >= 0;
    msgs.push(`명목 단가는 ${nomUp ? "상승" : "하락"}하지만, 환율·현지물가를 반영한 실질 기준으로는 ${nomUp ? "하락" : "상승"}하고 있습니다. 명목 수치만으로는 실제 수익 방향을 반대로 읽을 수 있습니다.`);
  }
  if (bigGap) {
    msgs.push(`명목과 실질 단가의 최근 격차가 약 ${Math.round(stats.diffPct)}%로 큽니다. 해당 국가의 환율·물가 변동이 그만큼 크다는 뜻이라, 명목 단가만 보면 실제 수익성을 놓칠 수 있습니다.`);
  }
  return { text: msgs.join(" "), tone: dirDiff ? "W" : "N" };
}

function TwoCharts({ prepared, idx, scope }) {
  const hasReal = prepared.hasReal;
  return (
    <>
      <ChartCard index={idx[0]} title={`${scope} 수출 총중량 추세`} sub={`월별 수출중량 · 단위 ${prepared.wUnit}`} dx={prepared.wgtDx} color={C.wgt}>
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
      <ChartCard index={idx[1]} title={`${scope} 수출 단가 추세`} sub={hasReal ? `명목 vs 실질단가 (실질 = 기준월 ${CPI_BASE_YM} 대비 환율·물가 보정) · USD/kg` : "월별 (수출금액 ÷ 수출중량) · 단위 USD/kg"} dx={prepared.unitDx} color={C.unit}>
        <ResponsiveContainer width="100%" height={hasReal ? 270 : 250}>
          <LineChart data={prepared.rows} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="ym" tickFormatter={tickFmt} tick={{ fontSize: 12, fill: C.muted }} axisLine={{ stroke: C.line }} tickLine={false} interval={0} />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `$${v.toFixed(1)}`} domain={["auto", "auto"]} />
            <Tooltip content={<UnitTip hasReal={hasReal} />} />
            {hasReal && <Legend verticalAlign="top" height={24} iconType="plainline" wrapperStyle={{ fontSize: 12 }} />}
            <Line type="monotone" dataKey="unitTrend" stroke={C.trend} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} legendType="none" />
            <Line type="monotone" dataKey="unit" name="명목단가" stroke={C.unit} strokeWidth={2.4} dot={false} isAnimationActive={false} connectNulls />
            {hasReal && <Line type="monotone" dataKey="realTrend" stroke={REAL} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} legendType="none" connectNulls />}
            {hasReal && <Line type="monotone" dataKey="realUnit" name="실질단가" stroke={REAL} strokeWidth={2.4} dot={false} isAnimationActive={false} connectNulls />}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}

function SectionBand({ label, prepared }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14, display: "flex", gap: 22, flexWrap: "wrap", alignItems: "baseline" }}>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{label}</div>
      <Stat label="데이터 구간" value={prepared.period} />
      <Stat label="최근월 수출중량" value={`${fmtInt(prepared.latest.wgt)} kg`} />
      <Stat label="최근월 단가" value={prepared.latest.unit != null ? `$ ${prepared.latest.unit.toFixed(2)} /kg` : "—"} />
    </div>
  );
}

function Result({ picked, series, cSeries, country, marketDB, cpiDB, onBack, onRestart }) {
  const allowReal = !!(marketDB && marketDB[picked.code] && country);
  const realCode = allowReal && country ? country.code : null;
  const selfOverall = useMemo(() => prep(series), [series]);
  const selfCtry = useMemo(() => withReal(prep(cSeries), realCode, cpiDB), [cSeries, realCode, cpiDB]);

  const [mkt, setMkt] = useState({ loading: true, overall: null, country: null, demo: false, err: "" });

  useEffect(() => {
    let alive = true;
    const toSeries = ([ym, w, d]) => ({ ym, wgt: w, dlr: d, unit: w > 0 ? d / w : null });
    (async () => {
      setMkt({ loading: true, overall: null, country: null, demo: false, err: "" });
      const res = { loading: false, overall: null, country: null, demo: false, err: "" };

      // 1순위: 미리 집계된 시장 데이터 파일 (중요 품목)
      const db = marketDB && marketDB[picked.code];
      if (db) {
        res.overall = db.all.map(toSeries);
        if (country && db.byCountry && db.byCountry[country.code]) res.country = db.byCountry[country.code].map(toSeries);
      }

      // 2순위: 관세청 API (파일에 없는 품목)
      if (!res.overall) {
        try { const r = await fetch(`/api/trade?hs=${picked.code}`); const j = await r.json(); if (j.series && j.series.length) res.overall = j.series; } catch (e) {}
      }
      // 3순위: 데모 폴백
      if (!res.overall && MKT[picked.code]) { res.overall = MKT[picked.code].map(toSeries); res.demo = true; }
      if (!res.overall) res.err = "시장 데이터를 불러오지 못했습니다. (API 한도 또는 연결 상태를 확인하세요)";

      // 국가 시장: 파일에 없으면 API
      if (country && !res.country) {
        try { const r2 = await fetch(`/api/trade?hs=${picked.code}&cnty=${country.code}`); const j2 = await r2.json(); if (j2.series && j2.series.length) res.country = j2.series; } catch (e) {}
      }
      if (alive) setMkt(res);
    })();
    return () => { alive = false; };
  }, [picked, country, marketDB]);

  const mktOverall = useMemo(() => prep(mkt.overall), [mkt.overall]);
  const mktCtry = useMemo(() => withReal(prep(mkt.country), realCode, cpiDB), [mkt.country, realCode, cpiDB]);
  const diag = useMemo(() => computeDiag({ code: picked.code, selfRows: series, mktRows: mkt.overall, ctryMktRows: mkt.country, country, marketDB, cpiDB }), [picked, series, mkt.overall, mkt.country, country, marketDB, cpiDB]);
  const card = useMemo(() => pickCard(diag), [diag]);
  const realCmp = useMemo(() => {
    const ex = buildRealExplain(selfCtry && selfCtry.realStats);
    return ex && country ? { ...ex, scope: country.name } : null;
  }, [selfCtry, country]);
  if (!selfOverall) return null;

  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 12, color: C.subtle }}>품목 · HS</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{picked?.name} <span style={{ color: C.muted, fontWeight: 600, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>· {picked?.code}</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.muted, borderRadius: 9, padding: "9px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>← 입력 수정</button>
          <button onClick={onRestart} style={{ background: C.soft, border: `1px solid ${C.line}`, color: C.ink, borderRadius: 9, padding: "9px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>새 진단</button>
        </div>
      </div>

      {/* 시장 분석 (관세청) */}
      {diag && <DiagCard card={card} fx={diag.fx} power={diag.power} realCmp={realCmp} />}
      {diag && <DiagPanel diag={diag} />}
      <GroupTitle text={`시장 전체 분석 (관세청)${mkt.demo ? " · 데모 데이터" : ""}`} />
      {mkt.loading ? (
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 36, textAlign: "center", color: C.muted, marginBottom: 16 }}>관세청 시장 데이터를 불러오는 중입니다…</div>
      ) : mktOverall ? (
        <>
          <SectionBand label="시장 — 전체(모든 국가)" prepared={mktOverall} />
          <TwoCharts prepared={mktOverall} idx={["01", "02"]} scope="시장 전체" />
        </>
      ) : (
        <div style={{ background: C.down + "0D", border: `1px solid ${C.down}44`, borderRadius: 12, padding: 20, marginBottom: 16, color: C.muted, fontSize: 14 }}>
          <b style={{ color: C.down }}>시장 데이터 없음</b><div style={{ marginTop: 4 }}>{mkt.err}</div>
        </div>
      )}

      {country && !mkt.loading && (
        <>
          <GroupTitle text={`시장 — ${country.name} 분석 (관세청)`} />
          {mktCtry ? (
            <>
              <SectionBand label={`시장 — ${country.name}`} prepared={mktCtry} />
              <TwoCharts prepared={mktCtry} idx={["03", "04"]} scope={`시장 ${country.name}`} />
            </>
          ) : (
            <div style={{ background: C.soft, border: `1px solid ${C.line}`, borderRadius: 12, padding: 20, marginBottom: 16, color: C.muted, fontSize: 14 }}>
              {country.name}({country.code}) 시장 데이터를 가져오지 못했습니다. API 연결 후 표시됩니다.
            </div>
          )}
        </>
      )}

      {/* 자사 분석 */}
      <GroupTitle text="자사 실적 분석" />
      <SectionBand label="자사 — 전체 수출" prepared={selfOverall} />
      <TwoCharts prepared={selfOverall} idx={["05", "06"]} scope="자사 전체" />
      {selfCtry && (
        <>
          <SectionBand label={`자사 — ${country.name} 수출`} prepared={selfCtry} />
          <TwoCharts prepared={selfCtry} idx={["07", "08"]} scope={`자사 ${country.name}`} />
        </>
      )}
    </div>
  );
}

function GroupTitle({ text }) {
  return <div style={{ fontSize: 13, fontWeight: 800, color: C.unit, letterSpacing: 1, textTransform: "uppercase", margin: "8px 0 10px", paddingLeft: 2 }}>{text}</div>;
}

/* ============ 레이어1: 39개 진단 카드 매핑 ============ */
const FIRM_STATE = { "↑↑": "이상적성장", "↑→": "물량확대", "↑↓": "박리다매", "→↑": "단가인상", "→→": "안정", "→↓": "단가침식", "↓↑": "프리미엄전환", "↓→": "물량축소", "↓↓": "동반위축" };

const CARDS = {
  F01: { name: "전방위 성장", tone: "G", text: "물량·단가 동반 상승 중입니다({fw},{fp}). 이상적 성장이 관찰됩니다. 현재 단가 {pos}, 시장 {mp}." },
  F02: { name: "범용시장 돌파 성장", tone: "G", text: "저단가 범용 시장에서 물량·단가를 함께 끌어올리고 있습니다({fw},{fp}). 범용 시장 내 차별화 성장이 관찰됩니다." },
  F03: { name: "차별화 상승 — 시장 역행", tone: "G", text: "시장 단가 하락({mp}) 속 귀사는 단가 인상 중입니다({fp}). 시장 역행 차별화가 관찰됩니다. 현재 {pos}." },
  F04: { name: "차별화 상승 — 시장 상회", tone: "G", text: "물량 유지 속 단가 인상 중입니다({fp}). 시장 평균 상회 개선이 관찰됩니다. 현재 {pos}." },
  F05: { name: "범용시장 단가 인상", tone: "G", text: "저단가 범용 시장에서 단가 인상 중입니다({fp}). 범용 시장 내 가격 개선이 관찰됩니다." },
  F06: { name: "프리미엄 전환", tone: "G", text: "물량 축소·단가 인상 중입니다({fw},{fp}). 프리미엄 전환이 관찰됩니다. 현재 {pos}." },
  F07: { name: "범용시장 프리미엄 전환", tone: "G", text: "저단가 시장에서 물량 축소·단가 인상 중입니다({fw},{fp}). 범용 시장 내 고가 전환이 관찰됩니다." },
  F08: { name: "물량확대 — 최저위 프리미엄시장", tone: "W", text: "단가 유지·물량 확대 중입니다({fw}). 고단가 시장인데 귀사 단가가 최저위권이어서 프리미엄 시장 내 저가 물량 확대가 관찰됩니다. 단가 여건 점검을 권장합니다." },
  F09: { name: "물량확대 — 저위 프리미엄시장", tone: "W", text: "단가 유지·물량 확대 중입니다({fw}). 고단가 시장에서 귀사 단가 하위권이어서 재협상 여지 점검을 권장합니다." },
  F10: { name: "물량확대 — 저위 표준·범용", tone: "N", text: "단가 유지·물량 확대 중입니다({fw}). 시장이 저단가대이며 현재 단가 하위입니다." },
  F11: { name: "물량확대 — 평균권", tone: "N", text: "단가 유지·물량 확대 중이며 현재 단가 평균입니다. 안정적 물량 성장이 관찰됩니다." },
  F12: { name: "물량확대 — 상위", tone: "N", text: "단가 유지·물량 확대 중이며 현재 단가 상위입니다. 우위 유지 물량 성장이 관찰됩니다." },
  F13: { name: "안정 — 최저위 프리미엄시장 고착", tone: "W", text: "물량·단가 변화 없음. 고단가 시장인데 귀사 단가가 최저위권에 고착되어 재협상 여지 점검을 권장합니다." },
  F14: { name: "안정 — 저위 고착", tone: "W", text: "물량·단가 변화 없으며 현재 단가 저위입니다. 개선 흐름이 관찰되지 않아 점검을 권장합니다." },
  F15: { name: "안정 — 저위 범용시장", tone: "N", text: "물량·단가 변화 없으며 현재 단가 하위이나 시장이 저단가대입니다. 시장 재검토 관점의 점검을 권장합니다." },
  F16: { name: "안정 — 평균 유지", tone: "N", text: "물량·단가 안정 유지, 현재 단가 평균입니다." },
  F17: { name: "안정 — 우위 유지", tone: "N", text: "안정 유지, 현재 단가 시장 평균을 다소 상회합니다." },
  F18: { name: "안정 — 프리미엄 정착", tone: "N", text: "안정 유지, 현재 단가 상위입니다. 프리미엄 포지션 정착이 관찰됩니다." },
  F19: { name: "물량축소 — 선택과 집중", tone: "N", text: "단가 유지·물량 축소 중입니다({fw}). 단가 상위여서 고가 중심 선택과 집중이 관찰됩니다." },
  F20: { name: "물량축소 — 평균권", tone: "N", text: "단가 유지·물량 축소 중이며 현재 단가 평균입니다. 물량 축소 배경 점검을 권장합니다." },
  F21: { name: "물량축소 — 저위 프리미엄시장", tone: "W", text: "단가 유지·물량 축소 중입니다({fw}). 고단가 시장에서 귀사 단가 하위여서 재협상 여지 점검을 권장합니다." },
  F22: { name: "물량축소 — 저위 표준·범용", tone: "W", text: "단가 유지·물량 축소 중이며 현재 단가 하위입니다. 물량 축소 배경 점검을 권장합니다." },
  F23: { name: "박리다매 — 시장 역행", tone: "W", text: "시장 단가 상승({mp}) 속 단가 인하·물량 확대 중입니다({fp},{fw}). 시장 역행 가격 전략이 관찰됩니다. 물량·단가 균형 점검을 권장합니다." },
  F24: { name: "박리다매 — 프리미엄시장 동조", tone: "W", text: "단가 인하·물량 확대 중입니다({fp},{fw}). 고단가 가능 시장이어서 물량 위한 단가 인하 적절성 점검을 권장합니다." },
  F25: { name: "박리다매 — 범용시장 동조", tone: "N", text: "단가 인하·물량 확대 중입니다({fp},{fw}). 시장도 저단가·하락 국면이어서 물량 중심 전략이 관찰됩니다." },
  F26: { name: "침식 — 최저위 나 홀로 하락", tone: "D", text: "시장 단가 상승({mp}) 속 귀사만 하락 중입니다({fp}). 최저위권이어서 시장 단절·저위가 동시 확인됩니다. 우선 점검 대상으로 판정됩니다." },
  F27: { name: "침식 — 저위 나 홀로 하락", tone: "W", text: "시장 상승 속 귀사만 하락 중입니다({fp}). 하위 이탈이 관찰되어 점검을 권장합니다." },
  F28: { name: "침식 — 평균권 이탈", tone: "W", text: "시장 상승 속 귀사만 하락 중입니다({fp}). 평균권 이탈이 관찰되어 점검을 권장합니다." },
  F29: { name: "침식 — 우위 약화", tone: "W", text: "시장 상승 속 귀사 단가 하락 중입니다({fp}). 우위 약화가 관찰되어 점검을 권장합니다." },
  F30: { name: "침식 — 프리미엄 약화", tone: "W", text: "시장 상승 속 귀사 단가 하락 중입니다({fp}). 프리미엄 약화가 관찰되어 점검을 권장합니다." },
  F31: { name: "침식 — 저위 시장동조", tone: "W", text: "귀사 단가 하락 중이며 시장도 같은 방향이나 현재 단가 하위여서 저위 추가 하락 점검을 권장합니다." },
  F32: { name: "침식 — 평균·상위 시장동조", tone: "N", text: "귀사 단가 하락 중이나 시장도 같은 방향이어서 시장 영향으로 관찰됩니다. 현재 {pos}." },
  F33: { name: "동반위축 — 최저위 역행 프리미엄시장", tone: "D", text: "시장 단가 상승({mp}) 속 물량·단가 동반 하락 중입니다({fw},{fp}). 고단가 시장인데 최저위권이어서 시장 단절·저위·물량 감소가 동시 확인됩니다. 우선 점검 대상으로 판정됩니다." },
  F34: { name: "동반위축 — 최저위 역행 표준·범용", tone: "W", text: "시장 상승 속 물량·단가 동반 하락 중입니다({fw},{fp}). 최저위이나 시장이 저단가대여서 시장 재검토 관점 점검을 권장합니다." },
  F35: { name: "동반위축 — 저위 역행", tone: "W", text: "시장 상승 속 물량·단가 동반 하락 중입니다({fw},{fp}). 하위 이탈이 관찰되어 점검을 권장합니다." },
  F36: { name: "동반위축 — 평균권 역행", tone: "W", text: "시장 상승 속 물량·단가 동반 하락 중입니다({fw},{fp}). 평균권 이탈이 관찰되어 점검을 권장합니다." },
  F37: { name: "동반위축 — 상위 역행", tone: "W", text: "시장 상승 속 물량·단가 동반 하락 중입니다({fw},{fp}). 상위 약화가 관찰되어 점검을 권장합니다." },
  F38: { name: "동반위축 — 저위 시장동조", tone: "W", text: "물량·단가 동반 하락 중이며 시장도 하락이나 현재 단가 하위여서 저위 추가 위축 점검을 권장합니다." },
  F39: { name: "동반위축 — 평균·상위 시장동조", tone: "N", text: "물량·단가 동반 하락 중이나 시장 전체도 하락입니다({mp}). 시장 영향으로 관찰됩니다. 현재 {pos}." },
};

function resolveCardId(state, pos, tier, align) {
  const low2 = pos === "매우낮음" || pos === "다소낮음";
  const high2 = pos === "다소높음" || pos === "매우높음";
  switch (state) {
    case "이상적성장": return tier === "C" ? "F02" : "F01";
    case "프리미엄전환": return tier === "C" ? "F07" : "F06";
    case "물량확대":
      if (pos === "매우낮음" && tier === "P") return "F08";
      if (pos === "다소낮음" && tier === "P") return "F09";
      if (low2 && (tier === "S" || tier === "C")) return "F10";
      if (pos === "평균") return "F11";
      return "F12";
    case "안정":
      if (pos === "매우낮음" && tier === "P") return "F13";
      if ((pos === "다소낮음" && tier === "P") || (pos === "매우낮음" && tier !== "P")) return "F14";
      if (pos === "다소낮음" && tier !== "P") return "F15";
      if (pos === "평균") return "F16";
      if (pos === "다소높음") return "F17";
      return "F18";
    case "물량축소":
      if (high2) return "F19";
      if (pos === "평균") return "F20";
      if (low2 && tier === "P") return "F21";
      return "F22";
    case "박리다매":
      if (align === "거스름") return "F23";
      return tier === "C" ? "F25" : "F24";
    case "단가침식":
      if (align === "거스름") return { "매우낮음": "F26", "다소낮음": "F27", "평균": "F28", "다소높음": "F29", "매우높음": "F30" }[pos];
      return low2 ? "F31" : "F32";
    case "동반위축":
      if (align === "거스름") {
        if (pos === "매우낮음") return tier === "P" ? "F33" : "F34";
        if (pos === "다소낮음") return "F35";
        if (pos === "평균") return "F36";
        return "F37";
      }
      return low2 ? "F38" : "F39";
    default: return null;
  }
}

function pickCard(diag) {
  if (!diag) return null;
  const fw = diag.fw.dir, fp = diag.fp.dir, mp = diag.mp.dir;
  const state = FIRM_STATE[fw + fp];
  const pos = diag.position && diag.position.z != null ? diag.position.label : null;
  if (!state || !pos) return { insufficient: true };
  const tier = diag.tier ? diag.tier[0] : "S";
  let align = "중립";
  if (fp === "↓" && mp === "↑") align = "거스름"; else if (fp === "↓" && mp === "↓") align = "따름";

  const id = state === "단가인상" ? (mp === "↓" ? "F03" : tier === "C" ? "F05" : "F04") : resolveCardId(state, pos, tier, align);
  const card = id && CARDS[id];
  if (!card) return { insufficient: true };
  const text = card.text.replace(/{fw}/g, diag.fw.label).replace(/{fp}/g, diag.fp.label).replace(/{mp}/g, diag.mp.label).replace(/{pos}/g, pos);
  return { id, name: card.name, tone: card.tone, text, conf: diag.conf, state, pos, tier: diag.tier || "미선택" };
}
const TONE = { G: { c: "#1F8A5B", t: "강점" }, N: { c: "#2E6F9E", t: "정상" }, W: { c: "#B5792E", t: "점검 권장" }, D: { c: "#C0504D", t: "우선 점검" } };

function DiagCard({ card, fx, power, realCmp }) {
  if (!card) return null;
  if (card.insufficient) {
    return (
      <div style={{ background: C.soft, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 18, color: C.muted, fontSize: 14 }}>
        진단 카드 판정 보류 — 자사 데이터와 국가별 분포(표본 4개국 이상)가 있어야 카드가 확정됩니다.
      </div>
    );
  }
  const tn = TONE[card.tone] || TONE.N;
  const badge = (label, val, col) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: col + "14", border: `1px solid ${col}44`, color: col, borderRadius: 999, padding: "4px 11px", fontSize: 12.5, fontWeight: 700 }}>{label} {val}</span>
  );
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderLeft: `5px solid ${tn.c}`, borderRadius: 14, padding: 20, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: tn.c, fontVariantNumeric: "tabular-nums" }}>{card.id}</span>
          <span style={{ fontSize: 18, fontWeight: 800 }}>{card.name}</span>
        </div>
        <span style={{ background: tn.c, color: "#fff", borderRadius: 999, padding: "4px 12px", fontSize: 12.5, fontWeight: 800 }}>{tn.t}</span>
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.65, color: C.ink }}>{card.text}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {fx && fx !== "없음" && badge("환율", fx, fx === "경보" ? C.down : C.unit)}
        {power && power !== "중립" && power !== "데이터없음" && badge("현지물가", power, power === "주의" ? C.down : C.up)}
        <span style={{ fontSize: 12, color: C.subtle, alignSelf: "center" }}>신뢰도 {card.conf} · 자사상태 {card.state} · 위치 {card.pos} · 티어 {card.tier}</span>
      </div>
      {realCmp && (
        <div style={{ marginTop: 12, background: REAL + "0D", border: `1px solid ${REAL}40`, borderRadius: 10, padding: "11px 13px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: REAL, marginBottom: 3 }}>명목 vs 실질단가 (자사·{realCmp.scope})</div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{realCmp.text}</div>
        </div>
      )}
      <div style={{ fontSize: 11.5, color: C.subtle, marginTop: 12, borderTop: `1px solid ${C.soft}`, paddingTop: 10 }}>
        본 분석은 공공데이터 기반 통계 신호이며, 최종 판단은 사용자의 몫입니다.
      </div>
    </div>
  );
}

function DiagPanel({ diag }) {
  if (!diag) return null;
  const colorOf = (dir) => (dir === "↑" ? C.up : dir === "↓" ? C.down : C.flat);
  const Row = ({ label, value, color, sub }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "9px 0", borderBottom: `1px solid ${C.soft}`, gap: 10 }}>
      <span style={{ fontSize: 13, color: C.muted }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: color || C.ink, textAlign: "right" }}>{value}{sub && <span style={{ fontSize: 12, color: C.subtle, fontWeight: 500 }}> {sub}</span>}</span>
    </div>
  );
  const d = diag;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 18 }}>
      <div style={{ fontSize: 12, letterSpacing: 1, color: C.unit, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>진단 변수 (검증용 · 카드 매핑 전)</div>
      <div style={{ fontSize: 12.5, color: C.subtle, marginBottom: 12 }}>market_data 품목 기준. 아래 변수들이 이후 진단 카드의 입력이 됩니다.</div>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px", minWidth: 260 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink, marginBottom: 4 }}>추세</div>
          <Row label="자사 중량" value={d.fw.label} color={colorOf(d.fw.dir)} />
          <Row label="자사 단가" value={d.fp.label} color={colorOf(d.fp.dir)} sub={`신뢰도 ${d.conf}`} />
          <Row label="시장 단가" value={d.mp.label} color={colorOf(d.mp.dir)} />
          <Row label="상대단가(자사÷시장)" value={d.rel.label} color={colorOf(d.rel.dir)} sub={d.relLast != null ? `현재 ${(d.relLast).toFixed(2)}배` : ""} />
        </div>
        <div style={{ flex: "1 1 300px", minWidth: 260 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink, marginBottom: 4 }}>위치 · 국가 · 경보</div>
          <Row label="위치(자사 vs 국가분포)" value={d.position ? d.position.label : "데이터 부족"} sub={d.position && d.position.z != null ? `Z=${d.position.z.toFixed(2)} · n=${d.position.n}` : (d.position ? `n=${d.position.n}` : "")} />
          <Row label="국가 티어" value={d.tier || "국가 미선택"} color={d.tier ? C.ink : C.subtle} />
          <Row label="환율 경보" value={d.fx} color={d.fx === "경보" ? C.down : d.fx === "주의" ? C.unit : C.flat} />
          <Row label="현지물가 신호" value={d.power || "CPI/국가 없음"} color={d.power === "주의" ? C.down : d.power === "기회" ? C.up : C.flat} />
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: C.subtle, marginTop: 10, lineHeight: 1.5 }}>
        추세=24개월 회귀 t값·표준화기울기 / 위치=최근 12개월 가중평균의 Robust Z(중앙값·MAD) / 상대단가=자사÷시장 추세. 라벨 기준은 임시값이며 조정 예정입니다.
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
function WgtTip({ active, payload, wUnit }) { if (!active || !payload || !payload.length) return null; const d = payload[0].payload; if (d.rawWgt == null) return null; return tipBox(<><div style={{ fontWeight: 700, marginBottom: 4 }}>{d.ym}</div><div style={{ color: C.wgt }}>수출중량 {fmtInt(d.rawWgt)} kg</div><div style={{ color: C.muted }}>≈ {fmtInt(d.wgtDisp)} {wUnit}</div></>); }
function UnitTip({ active, payload, hasReal }) { if (!active || !payload || !payload.length) return null; const d = payload[0].payload; if (d.unit == null) return null; return tipBox(<><div style={{ fontWeight: 700, marginBottom: 4 }}>{d.ym}</div><div style={{ color: C.unit }}>명목단가 $ {d.unit.toFixed(3)} /kg</div>{hasReal && d.realUnit != null && <div style={{ color: REAL }}>실질단가 $ {d.realUnit.toFixed(3)} /kg</div>}<div style={{ color: C.muted }}>금액 ${fmtInt(d.rawDlr)} · 중량 {fmtInt(d.rawWgt)}kg</div></>); }
