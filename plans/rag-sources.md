# RAG 참고 문헌 — 사주·별자리 (조사 2026-10-22)

운세 생성에 RAG 를 붙일 때 코퍼스로 쓸 문헌 목록이에요. 상업 서비스(광고 수익, 한국 사용자)라서 아래 둘을 다 통과해야 '넣을 것'으로 분류했어요.
1. 작품(원문·번역·주석)의 저작권이 끝났다.
2. 텍스트를 받는 곳의 이용 조건이 상업 이용을 막지 않는다.

저작권 판단은 조사 기준이고 법률 자문은 아니에요.

- **한국 보호기간**
  - 1962년까지 사망한 저자 → 만료. 1963년 이후 사망 → 사후 70년.
  - 근거: 저작권법 제39조·제44조, 부칙 제10807호(https://ko.wikisource.org/wiki/저작권법_(대한민국,_제16933호)), 찾기쉬운 생활법령(https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?popMenu=ov&csmSeq=705&ccfNo=2&cciNo=3&cnpClsNo=2).
  - 번역·주석은 별도 저작물이에요(제5조①).
  - 제3조④: 외국에서 보호기간이 끝난 외국인 저작물은 한국에서도 보호하지 않아요.
- **미국(2026-01-01 기준)**
  - 1931년 이전 출판 → 퍼블릭 도메인.
  - 1931~1963년 미국 출판물은 갱신하지 않았으면 퍼블릭 도메인(https://guides.library.cornell.edu/copyright/publicdomain).

## 0. 받는 곳별 이용 조건

| 곳 | 조건(원문 확인) | 판단 |
|----|-----------------|------|
| Kanripo 漢籍リポジトリ (https://github.com/kanripo) | 조직 설명 "Licensed as CC BY SA 4.0". 四庫全書(文淵閣) 저본, 무표점 정자, `<pb:…>`·¶·협주 표기 | **사용**. 출처 표시·동일 조건 |
| 維基文庫 (https://zh.wikisource.org) | 본문 CC BY-SA 4.0, 고전은 PD-old 틀. 표점본은 저본 표기가 없는 경우가 많음 | **사용** |
| ctext.org | "Web scraping of this site is in violation of our terms of service" 확인 페이지. 본문 API(gettext)는 키 필요. 재게시는 서면 동의(FAQ, 검색 요약으로만 확인) | **제외** |
| 國學大師 | 캡차에 막혀 확인 불가 | 제외 |
| 규장각 원문검색서비스 | "출처를 명기하면 누구나 자유롭게 이용"(https://kyu.snu.ac.kr/about/guide1/) | 사용. 이미지라 OCR 필요 |
| 국립중앙도서관 | 공공누리 제1유형 표시 자료만 개방(https://www.nl.go.kr/NL/contents/N70600000000.do) | 건별 확인 |
| 장서각 | 신청·허가, 목적 외 사용 금지 | 제외 |
| Project Gutenberg | 라이선스 문구와 이름을 지우면 자유 이용(https://www.gutenberg.org/policy/license.html) | **사용**(1순위) |
| TCP (https://github.com/textcreationpartnership) | Phase I·II 전사본 CC0 1.0 | **사용** |
| archive.org | 약관상 컬렉션 접근은 "scholarship and research purposes only"(https://archive.org/about/terms). 구글 스캔본은 비상업 이용을 '요청' | 원문이 퍼블릭 도메인이면 쓸 수 있지만, 다른 출처가 있으면 그쪽을 먼저 |
| sacred-texts | 사이트가 만든 텍스트는 비상업만(§5), 상업 이용은 서면 라이선스(§6). Wayback 2026-06-02 스냅샷으로 확인 | **제외** |
| LacusCurtius (penelope.uchicago.edu) | URL 별표 1개 = 퍼블릭 도메인, 2개 = 타인 저작권 | Robbins 판은 아래 2-2 참고 |

## 1. 사주(명리)

### 넣을 것 — 우선순위 상

1. **窮通寶鑑(궁통보감)** — 餘春台 편(ctext 는 명대로 표기, 欄江網과의 관계는 미확인)
   - **구성**: 五行總論 → 十干分論 → 甲~癸 일간별 → 正月~十二月. 일간 10 × 월 12 키로 바로 찾을 수 있어요.
   - **판본 주의**: 이 판은 일부 달이 합쳐져 있어요(「正二月甲木」「五六月甲木」). 乙·丁·戊·己는 소제목이 일부 빠져 있어 색인 전에 정리해야 해요.
   - **텍스트**: 위키문헌 https://zh.wikisource.org/wiki/穷通宝鉴 — 간체, 표점. 저본 표기와 라이선스 틀은 없어요.
   - **스캔**: Commons 의 NLC 「窮通寶鑑評註.pdf」(https://commons.wikimedia.org/wiki/File:NLC416-12jh004238-48608_窮通寶鑑評註.pdf).
2. **三命通會(삼명통회)** — 明 萬民英
   - **구성(Kanripo 로 확인)**
     - 卷1: 오행·간지·납음
     - 卷2: 절기·대운·태세·합형충
     - 卷3: 신살
     - 卷4: 십간 좌지·월지 득일간
     - 卷5~6: 격국
     - 卷7: 성정·질병·여명·육친
     - **卷8~9: 「六X日Y時斷」(일간 × 시지)**. 그 안이 다시 60갑자 일주별 단락(「甲子日甲子時」…)으로 나뉘어요.
     - 卷10: 玉井奧訣
   - **텍스트**
     - Kanripo KR3g0042(12권 전부, 무표점): https://github.com/kanripo/KR3g0042
     - 위키문헌 四庫本: https://zh.wikisource.org/wiki/三命通會_(四庫全書本)
     - 위키문헌 표점본(卷1~9, 간체): https://zh.wikisource.org/wiki/三命通會
   - **글자 오류**: 卷9 를 직접 확인했더니 「六己日甲子時斷」이 원문에 「六已日」「六巳日」로 들어가 있어요. 己·已·巳 정규화가 필요해요.
3. **滴天髓闡微(적천수천미)** — 淸 任鐵樵(1773–1840) 注
   - **구성**: 通神論 34절 + 六親論 29절. 절마다 원문 → 原注 → 任氏曰 → 명조 예시 순서예요.
   - **텍스트**: 위키문헌 https://zh.wikisource.org/wiki/滴天髓闡微 — 간체, 표점, 淸朝作品(PD-old).
   - **권리**: 다른 판을 쓴다면 袁樹珊 서문·편집 부분은 빼야 해요(1-3 참고).
4. **淵海子平(연해자평)** — 宋 徐子平 계열, 明 楊淙 증보
   - **구성**: 십신 정의, 지장간, 論日為主·論月令·論大運, 正官論~傷官, 六親, 女命, 喜忌篇, 賦 등 소제목 73개. 기초 용어집으로 써요.
   - **텍스트**: 위키문헌 https://zh.wikisource.org/wiki/淵海子平 — 간체.
   - **주의**: {{No source}}(출처 불명) 틀이 붙어 있어 교정이 필요해요.
5. **子平眞詮(자평진전)** — 淸 沈孝瞻
   - **구성**: 격국론의 핵심이에요(48장, zh.wikipedia 기준. 실제 목차는 미확인).
   - **텍스트 확보가 문제예요**: 위키문헌·Kanripo 에는 없고, ctext 의 徐樂吾 評注本(wb631975)은 약관 때문에 쓸 수 없어요.
   - **대안**: Commons 의 NLC 스캔(https://commons.wikimedia.org/wiki/File:NLC416-11jh010455-35296_子平真詮.pdf)을 OCR 해요.

### 넣을 것 — 중

6. **滴天髓 / 滴天髓輯要** — 劉基 注로 전해짐, 淸 陳素庵 輯
   - 通天論~貞元論 42론.
   - 텍스트: https://zh.wikisource.org/wiki/滴天髓
7. **神峰通考(신봉통고) = 命理正宗** — 明 張楠
   - 病藥說, 動靜說, 六親說, 격국, 대운·태세.
   - 텍스트: https://zh.wikisource.org/wiki/神峰通考
   - 주의: 현대 교주가 괄호로 섞여 있고, 五星 부분과 함께 걸러야 해요. 위키문헌 「命理正宗」 문서는 전체본이 아니라 賦 한 편이에요.
8. **欽定協紀辨方書(협기변방서)** — 淸 칙찬(乾隆 6년)
   - 신살 정의(卷3~8 義例), 宜忌, 年·月·日表. 신살·택일 근거로 써요.
   - 텍스트: Kanripo KR3g0051(https://github.com/kanripo/KR3g0051)
   - 주의: Kanripo 판에는 **卷14 파일이 없어요**. 위키문헌 四庫本(https://zh.wikisource.org/wiki/欽定協紀辨方書_(四庫全書本))으로 채워요.
9. **五行大義(오행대의)** — 隋 蕭吉
   - 오행·간지의 기초 개념.
   - 텍스트: https://zh.wikisource.org/wiki/五行大義 — 교정률 25%, 고식 구두점.
10. **玉井奧訣(옥정오결)** — 三命通會 卷10 에 들어 있어요(Kanripo KR3g0042_010). 古今圖書集成 第621~622卷에도 있어요.

### 넣을 것 — 하

11. **李虛中命書** — 년주 중심의 고법이라 현대 자평과 달라요.
    - 텍스트: Kanripo KR3g0033, 위키문헌 四庫本
12. **珞琭子 계열**
    - 珞琭子賦註: Kanripo KR3g0036
    - 珞琭子三命消息賦註(徐子平 주): Kanripo KR3g0037, https://zh.wikisource.org/wiki/珞琭子三命消息賦注
13. **古今圖書集成 藝術典 星命部** — 天元秀氣巫咸經(일간별), 蘭臺妙選, 張果星宗 등. 第579·614·617卷은 빠져 있어요.
    - 텍스트: https://zh.wikisource.org/wiki/欽定古今圖書集成/博物彙編/藝術典/星命部
14. **기타 四庫 術數類**(Kanripo)
    - 三命指迷賦 KR3g0038, 星命總括 KR3g0039, 玉照定眞經 KR3g0034, 星命溯源 KR3g0035, 御定星歷考原 KR3g0050
    - 전체 목록: https://github.com/kanripo/KR-Catalog (KR3g)
15. **조선 관상감 명과학 교재** — 원문 이미지뿐이고 텍스트가 없어 OCR·전사가 필요해요. '조선 관상감 교재'라는 한국적 의미는 있어요.
    - **시험 과목(경국대전, 국사편찬위)**: 袁天綱·徐子平·應天歌·範圍數·剋擇通書 등(https://db.history.go.kr/joseon/item/level.do?levelId=jlawa_103_0020_0010).
    - **袁天綱五星三命指南**: 규장각 古133.7-W49w(https://kyudb.snu.ac.kr/book/view.do?book_cd=GR35059_00), 국립중앙도서관 CNTS-00082399714.
    - **子平三命通變淵源(서자평)**: 규장각 想白古133.3-Se61j(https://kyudb.snu.ac.kr/book/view.do?book_cd=GS42059_00), 국립중앙도서관 CNTS-00047981971.
    - **應天歌**: 규장각 奎中2062(https://kyudb.snu.ac.kr/book/view.do?book_cd=GC02062_00).
    - **新刊範圍數**: 국립중앙도서관 CNTS-00047981885·CNTS-00047994159.
    - **協吉通義(1795)**: 국립중앙도서관 CNTS-00047993068 등.
16. **增補星平會海** — ctext 의 교정 전 OCR 만 있어요(제외 사이트). Commons 에 CADAL 스캔이 있어요.

### 넣으면 안 되는 것

- **현대 국내 해설서**
  - 이석영 『四柱捷徑』(1975–78): 사망 연도는 미확인이지만 1963년 이후 사망이 분명해 보호 중.
  - 박재완 『命理要綱』(1974): 1992년 사망 → 2062년까지.
- **한국어 번역본 전부** — 역자 권리가 따로 있어요.
  - 『적천수천미』: 예광해·홍보환·김정혜 외·김기승 외·이동헌 역
  - 『자평진전평주』: 박영창·정승우·오청식 외·신정원 역
  - 『궁통보감』: 예광해·김기승·김성애 역
  - 『원천강오성삼명지남』·『자평삼명통변연원』: 孤鳳거사·이명재 역
- **韋千里** (1911–1988, 2058년까지): 『千里命稿』, 『精選命理約言』(편저).
  - 그래서 Commons 의 「精選命理約言.pdf」도 쓰면 안 돼요.
- **袁樹珊**: 『命理探原』·『命譜』, 滴天髓闡微의 袁 서문·편집 부분.
  - 사망 연도가 1962년설(LC 전거 "1881-1962 (68?)", 書格)과 1968년설(바이두·즈후)로 갈려, 보수적으로 제외해요.
- **徐樂吾** (1886–1948/49): 한국 기준 만료예요. 다만 滴天髓徵義·滴天髓補註·造化元鑰의 타이핑된 텍스트를 찾지 못했어요.
  - 근거: LC http://id.loc.gov/authorities/names/n81114036, 국립중앙도서관 "서락오[1886-1948]".

## 2. 별자리(서양 점성술)

이 앱(태양 별자리 + 달의 집 + 원소 궁합)에 바로 쓰이는 정도로 순위를 매겼어요.

### 넣을 것 — 우선순위 상

1. **Alan Leo, 『Astrology for All』(1899)** — Leo 1860–1917
   - **구성**
     - IV~XV장: 12궁별 성격. 날짜, 건강·직업·결혼 궁합이 들어 있어요.
     - XVII장: 달과 황도대. XVIII장: 해·달 조합.
     - 원소 궁합 근거로 쓸 문장: "The fiery and airy triplicities being in sympathy"(불·공기 삼분성은 서로 잘 맞는다).
   - **텍스트**: https://archive.org/details/astrologyforall00leogoog (구글 OCR), 1910년판 https://archive.org/details/dli.ernet.19807
2. **Alan Leo, 『How to Judge a Nativity』(1903 초판, archive.org 는 1928 4판)**
   - **구성**: 12집, 12궁(4원소 삼분성·3성질), 행성, 애스펙트, 해·달·상승점, 1~12집과 집 속의 행성.
   - **텍스트**: https://archive.org/details/howtojudgenativi00leoa
3. **Alan Leo, 『The Progressed Horoscope』(1906)**
   - **구성**: XI장이 진행 달을 1~12집별·궁별로 다뤄요. '달이 몇 번째 집'에 가장 직접적인 소재예요. XIII장은 외행성의 12집 트랜짓이에요.
   - **주의**: D부(H. Däath 의 프라이머리 디렉션)는 공저자 사망 연도를 몰라서 빼야 해요. OCR 품질도 낮아요.
   - **텍스트**: https://archive.org/details/bub_gb_OY7ZLx4jQmcC
   - **확인(2026-10-23, djvu.txt 7648행~)**: 99쪽 'THE PASSAGE OF THE MOON THROUGH THE HOUSES' — "달이 2집을 지나면 돈 문제가 전면에…", "7집을 지나면 동업·결합의 기회…" 꼴이라 앱의 '달이 N번째 집' 문장과 형식이 가장 가까워요. 다만 진행 달(한 집에 2년 남짓) 해설이지 하루 단위는 아니고, OCR 이 많이 깨져 있어요(Stcond, pasang 등).
4. **Max Heindel, 『The Message of the Stars』(1918)** — Heindel 1865–1919, Augusta Foss Heindel 1865–1949
   - **구성**: 12궁의 영향, 12궁의 아이들, 태양 12집·12궁, **달 12집(p.220)·달 12궁(p.225)**, 결혼, 진행 달, 트랜짓.
   - **텍스트**: https://archive.org/details/messageofstarses00heiniala
   - **확인(2026-10-23, djvu.txt 7813행~)**: 달 12집은 **출생 성격·운명 풀이**예요. "결혼 후 재정이 나빠진다", "자녀 중 일부가 죽을 수 있다", "소송 손실" 같은 문장이 그대로 있어요. 집 주제의 근거로만 쓰고, 생성 단계에서 반드시 걸러요.
5. **Evangeline Adams, 『Astrology: Your Place in the Sun』(1927)** — Adams 1868–1932(대필설 있는 Crowley 도 1947년 사망이라 결론은 같아요)
   - **구성**: 12궁(출생일 기준), 12집.
   - **텍스트**: https://archive.org/details/astrologyyourpl00adam
6. **Evangeline Adams, 『Astrology: Your Place Among the Stars』(1930)**
   - **구성**: 태양 12궁, **달 12궁**, 행성 시기.
   - **텍스트**: https://archive.org/details/astrologyyourpla0000adam
7. **Sepharial, 『Astrology: How to Make and Read Your Own Horoscope』(1920판)** — Sepharial 1864–1929
   - **구성**: 행성, 12궁, 집, 애스펙트, 트랜짓, 집 속의 행성, 결혼.
   - **텍스트**: 구텐베르크 #46963, DP 교정본이라 가장 깨끗해요(https://www.gutenberg.org/ebooks/46963).
   - **재평가(2026-10-23)**: 목차를 보니 '집 속의 행성' 3쪽, '트랜짓 효과' 4쪽뿐이에요. 텍스트는 깨끗하지만 내용은 얕아서 **실질 우선순위는 '중'**이에요. 용어 정리용으로 써요.
8. **Hiram E. Butler, 『Solar Biology』(1887)** — Butler 1841–1916
   - **구성**: 해 × 달 144 극성, 부부 궁합.
   - **텍스트**: https://archive.org/details/solarbiologyscie00butliala (1921 인쇄본)
9. **Eleanor Kirk, 『The Influence of the Zodiac upon Human Life』(1894)** — Kirk 1831–1908
   - **구성**: 원소(불·공기·흙·물)별 12궁, 결혼, 경계일 출생.
   - **텍스트**: https://archive.org/details/influencezodiac01kirkgoog
10. **Isabelle Pagan, 『From Pioneer to Poet』(1911)** — Pagan 1867–1960
    - **구성**: 양자리~물고기자리 12장.
    - **주의**: archive.org 본은 1969년 5판이라 출판사 서문은 빼야 해요.
    - **텍스트**: https://archive.org/details/frompioneertopoe0000isab

### 넣을 것 — 중

11. **Ptolemy, 『Tetrabiblos』** — 원전 근거로 써요(I권 삼분성·궁 관계, IV권 결혼).
    - **J. M. Ashmand 영역(1822)**
      - 구텐베르크 #70850(Foulsham 1900 재판, DP 교정): https://www.gutenberg.org/ebooks/70850
      - 프로클로스 의역본에서 옮긴 거예요. Ashmand 의 사망 연도는 미확인이지만, 1822년 출판이라 만료로 봤어요.
    - **F. E. Robbins 영역(Loeb 1940)** — 번역 품질은 가장 좋아요.
      - 미국: 갱신하지 않아 퍼블릭 도메인이에요(LacusCurtius 명시: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Ptolemy/Tetrabiblos/home.html).
      - 한국: 역자가 1963년에 사망해서(GND https://d-nb.info/gnd/116575662) 원칙상 2033년까지 보호예요. 제3조④ 적용은 런던 동시 출판 여부에 따라 갈려요(미확인).
      - **법률 확인 전에는 Ashmand 를 써요.**
12. **Manilius, 『Astronomica』, Thomas Creech 영역(1700판)**
    - **구성**: 4권 궁별 기질, 2권 트라인·스퀘어·궁 사이 관계·열두 천궁.
    - **텍스트**: TCP A51767, CC0(https://github.com/textcreationpartnership/A51767). 초기 근대 철자(ſ)라 정규화가 필요해요.
13. **Zadkiel 편, 『An Introduction to Astrology』(1852, Lilly 개작)** — Zadkiel 1795–1874
    - **구성**: 원소별 궁, 12집 의미, 행성, 12궁 묘사.
    - **텍스트**: https://archive.org/details/anintroductiont00zadkgoog
14. **Raphael(R. T. Cross 1850–1923), 『The Guide to Astrology』 1권(1877)**
    - **구성**: 집의 의미, 궁별 인물, 12궁 속 행성.
    - **텍스트**: https://archive.org/details/guidetoastrolog00unkngoog
15. **Alan Leo, 『The Art of Synthesis』** — https://archive.org/details/artofsynthesis00leoa
16. **Max Heindel, 『Simplified Scientific Astrology』(1919)** — 위키문헌 교정 완료(V): https://en.wikisource.org/wiki/Simplified_Scientific_Astrology
17. **Vivian Robson, 『A Students' Text-Book of Astrology』(1922)** — Robson 1890–1942
    - **구성**: 천궁도 비교, 사랑과 결혼.
    - **텍스트**: https://archive.org/details/bwb_S0-DTL-301
18. **Rosa Baughan, 『The Influence of the Stars』(1904 4판)**
    - **구성**: 행성별 12집 효과.
    - **텍스트**: 구텐베르크 #42889.
    - **주의**: 저자 사망 연도가 미확인이라, 확인한 뒤에 넣어요.
19. **Llewellyn George, 『A to Z Horoscope Maker and Delineator』** — George 1876–1954
    - 내용은 좋지만 퍼블릭 도메인 판(1910~1930)의 디지털본이 없어요. archive.org 본은 1970년대 이후 개정판이라 저작권이 있어요.
20. **Sepharial, 『The Manual of Astrology』**
    - archive.org 본은 1979 Foulsham 재발행판이라 보유(補遺)에 저작권이 있어요. 보유를 빼고 써야 해요.

### 넣을 것 — 하

21. **William Lilly, 『Christian Astrology』(1647)**
    - 호라리 중심이에요. TCP 전사본은 없어요.
    - 스캔: Wellcome 1647판 https://archive.org/details/b30338724
22. **Firmicus Maternus, 『Mathesis』** — 라틴어(Kroll–Skutsch, Teubner)라 번역이 필요해요. II권에 12궁·12집 장이 있어요.
    - 텍스트: https://archive.org/details/matheseoslibrivi01firmuoft
23. **Vettius Valens 그리스어판**(Kroll 1908): https://archive.org/details/bub_gb_OQ_gAAAAMAAJ
    - Mark Riley 영역은 라이선스 표기가 없어서, 상업적으로 쓰려면 허락이 필요해요.
24. **al-Biruni, 『Book of Instruction』, R. R. Wright 영역(1934)**
    - 역자가 1933년에 사망해 한국에서는 만료예요. 미국은 2029년까지 보호일 가능성이 있어요(추론).
    - 텍스트: https://archive.org/details/albirunibookofinstruction

### 넣으면 안 되는 것

- **Charles E. O. Carter** (1887–1968, 한국 2038년까지): 『Encyclopaedia of Psychological Astrology』.
- **Dane Rudhyar** (1895–1985, 2055년까지): 『The Astrology of Personality』.
- **Linda Goodman** (1925–1995, 2065년까지): 『Sun Signs』, 『Love Signs』.
- **Liz Greene** (생존).
- **현대 번역·편집본**
  - Dorotheus: Pingree 1976, Dykes 2017
  - Firmicus: Bram 1975, Holden 2011
  - Valens: Riley, Schmidt
  - Abu Ma'shar: 현대 판 전부
  - 1970년대 이후 『A to Z』 개정판
- **sacred-texts 판 텍스트** — 비상업 조건이에요. 같은 책은 구텐베르크·archive.org 본을 써요.

## 3. 계산용 데이터 (RAG 가 아니라 코드)

- **한국천문연구원 음양력 정보 API**(공공데이터포털 15012679)
  - getLunCalInfo 등이 lunSecha(세차)·lunWolgeon(월건)·**lunIljin(일진)** 을 돌려줘요.
  - 무료이고 이용허락범위 제한이 없어요.
  - **주의**: 세차·월건이 입춘·절입 기준인지는 가이드에 없어요. 년주·월주는 절기 시각으로 직접 계산하는 게 안전해요.
- **한국천문연구원 특일 정보 API**(15012690)
  - get24DivisionsInfo 가 절기 시각(kst, 분 단위)과 태양 황경을 돌려줘요.
  - 이미 쓰는 astronomy-engine 의 `SearchSunLongitude`(15°마다)로도 계산할 수 있어요. 그러니 KASI 값은 대조용으로 써요.
- **astronomy-engine**(MIT, ±1각분): 지금 쓰는 것 그대로 써요.
- **Swiss Ephemeris**: AGPL(프로젝트 전체 공개) 아니면 상용 CHF 700 이에요. 필요 없어요.
- **JPL Horizons**: 전용 약관은 없고, 인용 형식만 권고해요.

## 4. 코퍼스 만들 때 주의

1. **라이선스 의무는 '공개(Share)'할 때만 생겨요** (CC BY-SA 4.0 법률 문서, 2026-10-22 확인: https://creativecommons.org/licenses/by-sa/4.0/legalcode.en)
   - **조건이 걸리는 때**: 출처 표시(3a)와 같은 라이선스(3b) 모두 "If You Share …"로 시작해요. Share 는 "to provide material to the public …"으로 정의돼 있어요.
   - **RAG 에 넣기만 할 때**: 서버 DB 에 넣고 검색만 하면 할 일이 없어요.
   - **AI 가 새로 쓴 문장**: Adapted Material 은 "라이선스 제공자의 권리상 허락이 필요한 변형"으로 정의돼 있어요. 원문이 퍼블릭 도메인이라 실제로 걸리는 건 디지털화 기여분(표점·교감)뿐이에요. 그래서 원문을 참고해 새로 쓰거나 풀어 쓴 운세 문장에는 의무가 없어요.
   - **원문 구절을 화면에 그대로 보여 줄 때**: 출처 표시만 하면 돼요. 예: 설정 '참고 문헌'에 "窮通寶鑑 — 維基文庫, CC BY-SA 4.0".
   - **정리한 코퍼스 파일을 공개할 때**: 그 파일에 CC BY-SA 4.0 과 출처를 적어요. **zodiac-today 저장소는 Pages 때문에 공개 예정이에요.** 코퍼스는 서버 쪽에만 두고, 저장소와 `static/` 에는 올리지 않아요(빌드 스크립트만).
   - **구텐베르크·TCP·archive.org**: 구텐베르크(머리말·꼬리말을 뗀 것), TCP(CC0), archive.org 의 퍼블릭 도메인 텍스트는 어느 경우에도 할 일이 없어요.
   - **앱 코드는 무관해요**: AGPL 과 달리 앱 코드까지 공개하라는 조항이 없어요.
2. **정리 단계가 필요해요**
   - Kanripo: 무표점이고 글자 오류가 있어요(己·已·巳).
   - 위키문헌 표점본: 간체, 저본 불명, 현대 교주가 섞여 있어요.
   - 영어 근대서: 대부분 구글 OCR 이에요.
3. **검색은 키로**: 계산(만세력·천문)은 코드로 하고, RAG 는 해석 문단만 찾아요. 궁통보감(일간 × 월), 삼명통회(일간 × 시, 일주), Heindel·Leo(달 × 집)는 키로 바로 찾는 구조라 벡터 검색보다 정확해요.
4. **흉한 문장 거르기**
   - 고전에는 요절·형벌·빈천 같은 판단이 많아요(서양도 8집 = 죽음).
   - 근대 영어서에는 질병 진단(Heindel·Butler 부제)과 옛 성 역할 고정관념이 있어요.
   - 생성 단계에서 메시지 가이드에 맞게 걸러요: 불안 조성 금지, 건강은 생활 습관 수준, 재물은 종목·코인 금지.
5. **정책**
   - 생성형 AI 사전 고지와 결과 라벨이 필요해요(서비스 오픈 정책 2-4).
   - 대화형이면 'AI 채팅·상담' 필수 6요건이 붙어요. 모델·프롬프트를 바꿀 때마다 배포 검토를 미리 받아야 해요.
   - 서버(Edge Function)가 필요해서, 2단계의 '서버·AI 없음' 결정이 바뀌어요.

## 5. 확인 못 한 것

- ctext 약관 원문(차단돼서 검색 요약으로만 확인), kanripo.org 본 사이트 문구(GitHub 설명으로만 확인).
- 袁樹珊 사망 연도(1962 대 1968), 이석영 사망 연도.
- 子平眞詮 원문(평주 없는 판)·滴天髓徵義·補註·造化元鑰·命理約言 원본의 타이핑된 텍스트.
- 국립중앙도서관 고문헌 각 건의 공공누리 유형, 장서각·한국고전종합DB 의 명과학 교재.
- Wikimedia Commons 스캔(NLC·CADAL) 각 파일의 라이선스 표기.
- Robbins 1940년판의 런던 동시 출판 여부(한국 제3조④ 적용에 영향).
- Riley 영역의 배포 조건.
- Ashmand·Rosa Baughan·H. Däath 의 사망 연도.
- **2026-10-23 닫힌 것(Wikidata)**: R. H. Allen 1838–1908(Q3934810), Mary Proctor 1862–1957(Q539738), G. R. Mair 1877–1952(Q98596643, Loeb 역자와 동일인 여부는 추정). **여전히 미확인**: Timothy Harley(1845–1904 단일 출처)·Rosa Baughan·Ashmand·Simmonite·Fernie — 모두 1822~1904년 출판이라 1963년 이후 사망은 산술적으로 불가능해 실무상 문제 없음. Pavitt(1914)·H. Däath·H. S. Green 만 실제로 갈릴 수 있어 제외·조건부 유지.
- Llewellyn George 『A to Z』 1910~1930 판의 디지털본.
- archive.org 약관 '연구 목적' 조항이 퍼블릭 도메인 텍스트의 상업적 재사용에 미치는 효과.

## 6. 적절성 점검 (2026-10-23)

기존 목록을 직접 열어 본 결과예요.

- **받을 수 있어요**: archive.org 15권(Leo 4·Heindel 2·Adams 2·Butler·Kirk·Pagan·Zadkiel·Raphael·Robson·Lilly) 모두 `access-restricted` 없음, `_djvu.txt` 있음.
- **색인 키 구조 확인(위키문헌 API sections)**: 穷通宝鉴 56절(일간 10 × 三春·三夏·三秋·三冬, 달은 그 안 문단), 滴天髓闡微 65절(通神論 34·六親論 29 + 부록), 三命通會/卷八 60절(六甲~六戊 × 12시, 나머지 5간은 卷九), 淵海子平 73절.
- **일진 규칙 근거**: 三命通會 卷二 소제목에 論十干合·論支元六合·論支元三合·論六害·論三刑·論衝擊, 卷三에 論十干祿·論驛馬·論天乙貴人·論空亡·論羊刃 등 신살 24절(Kanripo 원문). 協紀辨方書 卷十은 「宜忌」 장(宜忌等第表 포함)이 맞아요.
- **OCR 경로**: Commons 스캔 4종(子平真詮 287쪽·窮通寶鑑評註 277쪽·滴天髓闡微 CADAL 521쪽·滴天髓輯要 65쪽) 모두 라이선스 태그 Public domain.
- **등급 조정**: Sepharial 상→중(내용 얕음). Heindel·Leo 는 위 항목에 확인 메모.
- **구조적 한계**: 저작권 없는 문헌에는 **'오늘 하루 운세' 장르가 없어요.** 서양의 하루 트랜짓 달 운세는 1930년대 이후 신문 칼럼 장르(전부 저작권 보호 중)이고, 동양 고전은 명식 분석과 택일이에요. 그래서 RAG 는 주제·규칙·근거 인용까지 맡고, 문장 톤은 모델 + 메시지 가이드 + 기존 144문장 스타일이 맡아요. 고전을 통째로 넣기보다 집 의미·십신·오행·합충 규칙을 구조화해 뽑아 넣는 편이 정확해요. 가장 가까운 PD 장르는 **택일(electional)** — 아래 7절 Ramesey.

## 7. 2차 조사 — 별자리 추가 (2026-10-23, 기존 목록에 없는 것만)

핵심 항목(Ramesey·Agrippa TCP, 구텐베르크 5권, archive.org 4권, 한국어 위키 문서)은 직접 다시 확인했어요.

### 7-1. 넣을 것 — 상

| 자료 | 앱 용도 | 텍스트 | 권리·조건 |
|---|---|---|---|
| **William Ramesey 『Astrologia Restaurata』(1653)** Liber III 'Introduction to Elections' | **오늘 하기 좋은 일·피할 일** — 달이 든 궁(활동궁 Aries·Cancer·Libra·Capricorn 은 "Planting, Sowing, Graffing, buying and selling", 고정궁은 "building, marriages… continue")·달의 애스펙트·28수(Mansions) 표·1~12집별 택일(머리 자르기·짧은 여행·땅 사기·결혼…) | TCP A57689 https://github.com/textcreationpartnership/A57689 (XML 2.0MB), Wellcome 스캔 b30323149 | CC0("waived all copyright"). 고어·ſ 정규화 필요 |
| **Agrippa 『Three Books of Occult Philosophy』(영역 1651)** | **행운 색·금속·숫자의 근거** — I권 23~31장 행성별 사물(XXIV 'What things are Lunary'), XLIX 'to what Stars, Houses, and Elements severall colours are ascribed', II권 수의 Scale(2~12) 표 | TCP A26565 https://github.com/textcreationpartnership/A26565 (XML 1.5MB) | CC0 |
| **G. F. Kunz 『The Curious Lore of Precious Stones』(1913)** — 1856–1932 | 행운 보석 — IX Birth-stones, X Planetary and Astral Influences | 구텐베르크 #57978 | PD |
| **Isidore Kozminsky 『The Magic and Science of Jewels and Stones』(1922)** — 사망 1940/1944(둘 다 1962 이전) | 행운 보석 — XXXIII Zodiacal Classification, XXXIV Charubel's Gem Influences | 구텐베르크 #57980 | PD |
| **Timothy Harley 『Moon Lore』(1885)** | **달 모양 문구** — III Lunar Fancies·Lunar Influences(초승달·보름달 풍습), new moon 72회·full moon 29회 | 구텐베르크 #27228, archive.org moonlore00harl | PD(1885 출판) |
| **R. H. Allen 『Star Names: Their Lore and Meaning』(1899)** | 별자리 소개 — 이름 유래·신화 | LacusCurtius https://penelope.uchicago.edu/Thayer/E/Gazetteer/Topics/astronomy/_Texts/secondary/ALLSTA/home.html (별표 1개 = PD), archive.org allen-r.-star-names | PD |
| **W. T. Olcott 『Star Lore of All Ages』(1911)** — 1873–1936 | 별자리 소개 — 12궁 신화 한 권 | archive.org starloreofallage00olco | PD |
| **한국어 위키백과 점성술 문서군** | 한국어 용어·표기 기준 — 황도대(41KB)·점성술·서양 점성술·하우스 (점성술)(35KB)·점성술의 행성(77KB, 지배성)·사원소설·탄생석·달의 위상·12궁(백양궁~쌍어궁, 대부분 짧음) | https://ko.wikipedia.org/wiki/황도대 등 | CC BY-SA 4.0 |
| **위키문헌 『글로벌 세계 대백과사전』** 「별자리」(81KB)·「지구와 달의 운동」(23KB) | 한국어 별자리 설명·달의 차고 이지러짐 | https://ko.wikisource.org/wiki/글로벌_세계_대백과사전/컴퓨터·환경·첨단·지구과학/우주-지구-기상/우주의_신비/별자리 | CC BY-SA 3.0(카카오 기증) |

### 7-2. 넣을 것 — 중

- **Sepharial 『Cosmic Symbolism』(1912)** — XIII Planetary Numbers, XVI Planetary Hours(요일), XXIII Lunar Influence → 행운 숫자·요일. 구텐베르크 #70749. 같은 저자 『The Kabala of Numbers』(1911/13, archive.org TheKabalaOfNumbers).
- **Alan Leo 『The Key to Your Own Nativity』(1910)** — 행성 × 궁·집 해석 모듈. archive.org dli.ernet.128062(1920 인쇄). 『Esoteric Astrology』(1913)·『Saturn, the Reaper』(1916)는 하.
- **Charubel 『The Degrees of the Zodiac Symbolised』 2판(1907)** — 도(度)별 상징 한 줄. Casa Fernando Pessoa https://bibliotecaparticular.casafernandopessoa.pt/1-20 (PD 마크 1.0, PDF라 OCR 필요). Charubel = John Thomas 1826–1908.
- **Ovid 『Fasti』 Riley 영역(1851; 1816–1878)** — 별자리 기원 신화. archive.org fastitristiapont00ovid. Frazer 영역(1929, 1854–1941)도 PD(단 Loeb 1931판은 미국 2027년까지 주의).
- **Bulfinch 『The Age of Fable』(1855)** — 그리스 신화 일반. 구텐베르크 #4925.
- **Raphael(R. T. Cross) 『A Description of the Faces and Degrees of the Zodiac』(1879)**, **James Wilson 『A Complete Dictionary of Astrology』(1819)**, **Zadkiel's Almanac 1909·Old Moore's 1916/1924** — 참고용.
- **TCP 고서(CC0)**: Richard Kirby 『The Marrow of Astrology』(1687) A47491(12궁 성질), 『The Shepardes Kalender』(1570) A12110(달이 든 궁과 여행·신체 길흉), 『Arcandam』(1562) A20862, 『Erra Pater』(1605) A17624.
- **우리말샘** — 황도^십이궁·별자리명·초승달·보름달·궁합 정의. CC BY-SA 2.0 KR("상업적 용도까지 포함하여 자유롭게 이용").
- **Wikidata(CC0)** — 12궁 항목(Q1795024 클래스, 한국어 라벨) 있지만 **원소·성질·지배성 속성은 없어요.** 12행 표는 직접 만들고 근거는 위키백과 '점성술의 행성'·Agrippa 로. HF `jomarie04/Zodiac_Signs_Dataset`(CC0, 12행 element·quality·ruler) 보조.
- **Aratus 『Phaenomena』 G. R. Mair 영역(Loeb 1921)** — 역자 1877–1952(Wikidata Q98596643, 동일인 여부는 추정). archive.org callimachuslycop0000wmai. Poste 영역(1880, 1823–1902)도 PD.

### 7-3. 조건부·하

- **한국천문연구원 '별자리 전설'**(https://astro.kasi.re.kr/kor/post/constellationLegend) — 한국어 신화 1순위지만 **공공누리 표시 없음**. KASI 저작권정책: 표시 없는 자료는 담당자와 사전 협의 → 협의 전 불가.
- **Hyginus 『De Astronomia』**·**Eratosthenes 『Catasterismi』** — 원문(라틴어·그리스어)만 PD, 영어 PD 번역 없음(Grant 1960·Condos 1997 보호 중).
- **Vivian Robson 『Electional Astrology』(1937)** — 한국 만료, 미국은 1937 영국 출판이라 보호 가능성 → 조건부.
- **Kozminsky 『Zodiacal Symbology』(1917)** — PD 이지만 무료 원문 없음(archive.org 는 1984 재판 대출뿐).
- 국립중앙과학관 별자리 CSV(공공데이터 15067819, 천문 메타만), 한국학중앙연구원 전문사전 정의(15148089, 한 줄 정의만), Wikiversity Birthstones·Lunar effect, Catholic Encyclopedia(1913) Astrology.

### 7-4. 넣으면 안 되는 것 (추가)

- **Sabian Symbols** — Marc Edmund Jones(1888–1980) 『The Sabian Symbols in Astrology』(1953), Dane Rudhyar 『An Astrological Mandala』(1973). 웹·HF 의 Sabian 데이터도 같은 이유로 불가.
- **운세 문장 데이터셋 전부 불가** — 업로더의 CC0·MIT·Apache 표기는 긁어 온 원문의 권리를 바꾸지 못해요. HF `karthiksagarn/astro_horoscope`(= Kaggle `shahp7575/horoscopes`, Horoscope.com 스크랩), `tellang/yeji-horoscope-ko`(출처 불명 영어 운세 + 한국어 번역), `junonnong/daily_horoscope_kr`, `dkagramanyan/horoscopes_ru`(Rambler), `ZodiacViews/*`(HT 등 스크랩), Kaggle `prasad22/*`·`anshulmehtakaggl/*`·`katyashakhova/*`·`thedivtagguy/*`(TOI). 모델 `stevhliu/astroGPT`도 Horoscope.com 스크랩.
- **sacred-texts 판** Allen·Harley 등 — 같은 책을 LacusCurtius·구텐베르크·archive.org 로.

## 8. 2차 조사 — 사주·한국 전통 운세 추가 (2026-10-23, 기존 목록에 없는 것만)

핵심 항목(민족문화대백과 이용 안내, 위키문헌 五行精紀·選擇要略·오행 원문, Commons 스캔 5종, 라이브러리 라이선스 6개, HF bazi-nayin, IANA tzdb, 순종실록)은 직접 다시 확인했어요.

### 8-1. 한국어 해설 — 받는 곳별 판단

| 곳 | 조건(원문) | 판단 |
|---|---|---|
| **한국민족문화대백과사전**(encykorea.aks.ac.kr) | "한국학중앙연구원이 저작재산권 전부를 보유한 저작물에 국한하여 저작권법 제24조의2(공공저작물의 자유이용)에 따라 별도의 이용 허락 없이 자유이용이 가능합니다", 범위 "항목의 원고(본문) 전체", 출처 "[항목명],『한국민족문화대백과사전』"(https://encykorea.aks.ac.kr/Guide/ContentUse). 본문의 공공누리 유형 번호는 미표기 | **조건부로 낮춤(2026-10-23 API 확인)**. OpenAPI 로 받을 수 있는 항목은 **15,836건**(전체 7.5만의 약 1/5, 2022년 이후 집필·개정분으로 보임)이고, **사주·음양오행설·띠·궁합·일진·당사주·토정비결·삼재·택일·손·윷점·오행점·천기대요·세시풍속·관상감은 전부 204(없음)**. 있는 것: 명과학(관상감) E0080897(1,109자)·점복신앙·점복설화·동국세시기·열양세시기·책력·천문학(관상감). 안내문의 "저작재산권 전부를 보유한 저작물에 국한"이 이 집합과 같을 가능성이 커서, 옛 항목은 자유이용 대상이 아닐 수 있음 → **메일 문의로 확정 전에는 옛 항목 본문을 쓰지 않는다.** 검색은 표제어 부분 일치(본문 검색 아님), pageSize 20 고정, 본문은 마크다운(`# 소제목`, `[링크](E…)`, 각주 `[^n]`). 키는 `~/.config/encykorea/api_key`(사용자 보관) |
| **한국민속대백과사전**(folkency.nfm.go.kr) | 푸터 "텍스트는 공공누리 제2유형(출처명시+상업적 이용금지)", "상업적 이용이 필요하시면 국립민속박물관(사전편찬팀)과 사전 협의" | **불가**(협의 전). 표제어 설계 참고만 |
| **우리말샘·표준국어대사전** | CC BY-SA 2.0 KR, "상업적 용도까지 포함하여 자유롭게 이용". 단 "출전이 있는 용례"는 원저작자 권리 | 사용(용례 제외) |
| **한국어 위키백과** | CC BY-SA 4.0 | 사용 |
| **한국고전종합DB**(db.itkc.or.kr) | "무단 복제 및 배포를 원칙적으로 금합니다", "수익을 얻거나… 사전에 별도의 협의" | **불가**. 같은 원문은 NL·Commons·위키문헌 사본으로 |
| **국립중앙도서관 고문헌** | 레코드에 유형 번호 없음, "[관외이용]-무료 — 저작권 만료" 문구. 같은 스캔이 Commons 에 `File:CNTS-…` 로 올라가 있고 틀 PD-scan·PD-South Korea | Commons 사본 사용 |
| **e뮤지엄** | 건별 "제 1유형 : 출처표시" | 건별 확인 후 사용 |

### 8-2. 넣을 것 — 상

| 자료 | 앱 용도 | 텍스트 | 권리 |
|---|---|---|---|
| **민족문화대백과 표제어** — 사주 E0025957, 음양오행설 E0043032, **띠 E0017225**(12띠별 성격 절, 쥐띠~돼지띠 개별 항목), 궁합 E0006817(겉궁합=12지·속궁합=오행), **일진 E0047325**(생기복덕 8신), 토정비결 E0059207(작괘법), 당사주 E0013895·E0013896, 삼재 E0026787(배당표), 손 E0030463, 택일 E0059132, **윷점 E0042795**(64괘 점사 전문), 오행점 E0038604, 천기대요 E0055802, 명과학 E0080897 | 한국어 본문·띠 성격·토정비결 규칙·삼재·손 없는 날 | https://encykorea.aks.ac.kr/Article/E0017225 등 | **보류(2026-10-23)**: 명과학 E0080897 만 API 에 있고 나머지는 전부 없음(8-1 참고). 옛 항목이 자유이용 대상인지 메일로 확정한 뒤에. 그때까지 한국어 본문은 한국어 위키백과(사주명리학·십신·신살·띠·토정비결·삼재·손 없는 날)·우리말샘·『글로벌 세계 대백과사전』로 |
| **『五行精紀』 宋 廖中** 34권 | **60갑자 일주론·십간론** — 卷1~2 論六十甲子, 卷3~5 論乾神(십간), 卷6 論支神, 卷13~27 길신·흉신·三刑·六害·空亡·衝破, 卷28~32 性情·疾病·壽夭, 卷33~34 大運·太歲 | https://zh.wikisource.org/wiki/五行精紀 (562KB 한 페이지) | 원문 PD, CC BY-SA 4.0. **간체·번체 혼재** → 정규화 필요. Kanripo 에는 없음 |
| **『選擇要略』 李純之(조선 세종대)** | **삼재의 조선 원문** — /中 「論三災星年」 표: 申子辰生 → 寅卯辰年, 巳酉丑生 → 亥子丑年, 寅午戌生 → 申酉戌年, 亥卯未生 → 巳午未年(한국 삼재 배당과 일치) | https://zh.wikisource.org/wiki/選擇要略/中 (/上·/下 분할, 교정률 25%), Commons `File:CNTS-00047981900 1~3 選擇要略.pdf` | PD |
| **『土亭秘訣』 필사본** | 144괘 한문 괘사 원문 → OCR 후 (상·중·하괘) 번호 키 | Commons https://commons.wikimedia.org/wiki/File:CNTS-00076808100_-土亭秘訣-.pdf (68쪽, Public domain) | PD. 판본 검수 필요 |
| **오행 ↔ 색·방위·수 1차 원문** | **행운 색·방향·숫자 근거** — 『黃帝內經素問』 金匱真言論 "東方青色…其數八"(https://zh.wikisource.org/wiki/黃帝內經/素問第一卷, Kanripo KR3e0001), 『禮記』 月令(https://zh.wikisource.org/wiki/禮記/月令, KR1d0052), 『淮南子』 時則訓·天文訓(https://zh.wikisource.org/wiki/淮南子/時則訓, KR3j0010 — 삼합 기원 "木生於亥，壯於卯，死於未", 육충 "子午、丑未、寅申、卯酉、辰戌、巳亥"), 『呂氏春秋』 孟春紀(KR3j0009), 『尚書』 洪範, 易傳 繫辭上(하도 수) | 위키문헌·Kanripo | PD, CC BY-SA 4.0 |
| **三命通會 보강 위치**(Kanripo 파일:행) | 卷2 論地支屬相(002:544 "子屬䑕丑屬牛…"), 論支元六合(1751)·三合(1811)·六害(1903)·三刑(1946)·衝擊(2066), 論五行旺相休囚死並寄生十二宫(975); **卷3 論元辰(1155)** — "陽男陰女在衝前一位支辰，陰男陽女在衝後一位支辰" = 한국 원진 6쌍(子未·丑午·寅酉·卯申·辰亥·巳戌)과 일치, 말미 "常術鼠忌羊頭歌未分男女不足憑也"(한국식 가결 언급) | 기존 KR3g0042 | PD |
| **라이브러리·구조화 데이터(코드·메타용)** | **6tail lunar-javascript 1.7.7**(MIT, ★1713): 60갑자·납음·십신 100조합·지장간·충·공망·신살 151개 이름·宜忌 142항목·28수·九星 색 — 이름 테이블(해석 문장 없음), **절기가 UTC+8 기준**이라 한국은 보정. **OPN48/cnlunar**(MIT, ★857): 『欽定協紀辨方書』 宜忌等第表를 따르고 원문을 주석으로 보존. **golbin/ssaju**(npm, MIT, ★139): 원국·십성·12운성·합충형파해·신살·격국·대운·세운·월운, KST·DST 보정 내장, `toCompact()` LLM 출력. **mtgmtg1/saju-calendar-data**(CC BY 4.0): 절기 1900~2100 분 단위·일진·연도별 띠 경계. **HF Shann5/bazi-nayin**(CC BY 4.0): 三命通會 卷1 에서 구조화한 납음 663쌍 + 원문 인용·검증 스크립트. sxtwl(BSD-3) 계산 엔진 | GitHub·HF | 상업 가능 |

### 8-3. 넣을 것 — 중

- **당사주** — 규칙은 encykorea(12성: 천귀·천액·천권·천파·천간·천문·천복·천역·천고·천인·천예·천수, 子에 천귀성 붙여 생년→월→일→시 순행). 원문 그림책 Commons `File:CNTS-00047981929 1 唐四柱.pdf`(101쪽, PD) — OCR 난도 높음.
- **『天機大要』**(1636 성여훈, 관상감 교재) — 혼인문 男女九宮宮合法·출행·이거·기복일. Commons `File:CNTS-00047993889 天機大要.pdf`(236쪽, PD). 1917·1936 활자본 증보분은 편자 사망 연도 미확인이라 제외.
- **『東國歲時記』 1911 조선광문회본(附 京都雜志·洌陽歲時記)** — 정초 오행점·윷점·삼재 예방 원문. Commons `File:CNTS-00047987514 東國歲時記.pdf`(116쪽, PD). 홍석모·유득공·김매순·최남선(1957 사망) 모두 만료.
- **『玉匣記』**(명청 민간 通書) — 날짜별 吉凶日·彭祖百忌·太白日游之方·男女屬相配婚. https://zh.wikisource.org/wiki/玉匣記 (164KB). '前言' 절은 현대 서문일 수 있어 제외. 주의: 「男女屬相配婚」 가결("白馬怕青牛…")은 六害 기준이라 한국 원진 6쌍과 달라요.
- **한국어 위키백과 사주 문서군** — 십신(83KB)·신살(39KB)·사주명리학(33KB)·간지·오행·지장간(21KB)·격국(18KB)·십이운성·납음·띠 (생초)(43KB)·토정비결·삼재·손 없는 날·오방색·절기(39KB)·입춘. 없음: 원진살·당사주·택일·윷점·고전 서명. '궁합' 문서는 홍보성 문구가 있어 품질 주의.
- **우리말샘** 표제어: 원진살·겉궁합·속궁합·삼재·손^없는^날·당사주·납음·토정비결·일진·띠.
- **12지 동물 배당 원문** — 『論衡』 物勢篇(https://zh.wikisource.org/wiki/論衡/14, KR3j0080), 『五行大義』 卷5 論三十六禽. 띠별 '성격'은 고전에 없고 encykorea 띠 항목으로.
- **주역(선택)** — 위키문헌 周易·周易正義·伊川易傳·周易本義(四庫), Kanripo KR1a0001·KR1a0006·KR1a0007·KR1a0016·KR1a0031·KR1a0117. 하~중.
- 규장각 『土亭秘訣』 奎古文 461·義派古 23, 『土亭家藏訣』 奎12379, 『天機大要』 奎古 1286 — 출처 명기 시 자유 이용, 이미지 제공 여부 미확인.
- e뮤지엄 「선한문해석 토정비결」(국립한글박물관 한기 981, 제1유형) — 판권지 소실이라 번역문 보호 여부 판단 불가, 문체 참고만.

### 8-4. 넣으면 안 되는 것 (추가)

- **한국민속대백과사전 본문 전부**(제2유형), **한국고전종합DB 본문·번역**(ITKC 2016 『선택요략』·2017 『선택기요』 번역 포함), 국립민속박물관 『조선대세시기』 번역 시리즈.
- 현대 토정비결·당사주 간행본: 김혁제 『四十五句 松亭土亭秘訣』(명문당), 『당사주요람』(명문당 1969·1991), 경화사 1975·남산당 2012·추송학 1978·조희준 1967, 민속 12098 『秘傳原本 그림唐四柱』(광복 후). 1935 박건회 편 『十八句 土亭秘訣』은 사망 연도 미확인이라 보류.
- **운세·사주 문장 데이터셋 전부** — HF `tellang/yeji-horoscope-ko`(DATASET_INDEX 에 "Kaggle shahp7575/horoscopes… Horoscope.com 스크래핑" 명시)·`tellang/yeji-fortune-telling-ko-v9`(CC BY-NC + GPT·Gemini 합성)·`yeji-bazi-interpretations`(gpt5mini 100%)·`junonnong/daily_horoscope_kr`(출처 없음, 고정 문장 51종)·`MonsterPPPPP/BaZi2500`(CC BY-NC)·`czuo03/bazi-reasoning-300`(현대 교재 + DeepSeek)·`dclef/bazi-non-reasoning-10k`(Kimi 생성, 千里命稿 포함)·`pokkoa` 고서 모음(千里命稿·子平真詮評注 혼입)·`molpass/mcp-tojeong` 144괘 해석문("개인 소장 자료 윤문", 권리 불명 — 단 태세·월건·일진수 표는 사실 데이터라 가능). `rayraykim/Nemotron-Personas-Korea-Saju`(CC BY 4.0, 100만 행)는 "명리학 전문가 검수를 거치지 않음" 명시라 하.
- **AI Hub**: 운세·사주 데이터셋 없음. **공공데이터포털**: 운세·토정비결·점술 0건(사주 16건은 전부 '우리사주').
- **rath/orrery**(AGPL-3.0, ★156) — 서버에서만 써도 수정 시 소스 제공 의무(AGPL §13). **Sazupalza**(GPL-3.0) — 서버 전용이면 공개 의무 없지만 번들에 넣으면 앱 전체 GPL. 寿星天文历 원본(sxwnl)은 LICENSE 없음·"천문 알고리즘 수정 금지" 선언 → 직접 쓰지 말고 MIT·BSD 재구현 사용. 라이선스 없는 저장소(cassandra-ai, askLuck, bikul-manseryeok, nanamix/korean-fortune-system, vipick/saju-*, deepdaiv-rag/24f-saju 등)는 사용 불가.

### 8-5. 일진론: 고전에 '하루 운세' 장르는 없어요

- 三命通會 12권 소제목 전수, 五行精紀 34권 목차, 協紀辨方書 36권 구성을 확인한 결과 — 命(원국)·運(大運·小運·太歲)·日時斷(일주 × 시주 원국)까지만 있고 流日·日運 장이 없어요. 五行精紀도 卷33~34 大運·小運·太歲·歲運에서 끝나요.
- 합·충·형·해·공망·12운성의 **정의**는 三命通會 卷2~3·五行精紀 卷25~26 에 있어요. 앱이 그 정의를 '오늘 일진 × 사용자 일주'에 적용하는 건 **현대식 응용**이라고 설계 문서에 적어야 해요.
- 가장 가까운 전통 근거(택일 장르): ① 協紀辨方書 — 날 자체의 神煞·宜忌(卷10 宜忌·卷11 用事·卷12~24 月表·卷32 日表), 사람과 날의 관계는 卷35 "忌本命日、本命對衝日…日辰納音尅本命納音日"(年柱 기준, 6tail 의 冲煞 데이터가 이것). ② 한국 민속 **생기복덕법** — encykorea 일진 E0047325(남녀·연령별로 날의 지지에 生氣·天醫·絶體·遊魂·禍害·福德·絶命·歸魂 배당). ③ 玉匣記 — 날짜별 吉凶日·彭祖百忌.
- **삼재는 三命通會·協紀辨方書 본문에 없어요**(grep 0건). 조선 원문은 選擇要略.
- **손 없는 날**: 중국식(玉匣記 太白日游之方·御定月令輯要)은 8방 × 1일, 한국 민속은 4방 × 2일(9·10일이 손 없는 날)이라 달라요. RAG 본문은 encykorea 손 항목, 중국 원문은 유래 설명용.

### 8-6. 시주 계산용 — 한국 표준시 변천 (1차 출처)

| 시기 | 기준 | 출처 |
|---|---|---|
| 1908-04-01 | UTC+8:30(동경 127°30′) | 『순종실록』 융희 2년 2월 7일 칙령 제5호 「大韓國標準時所關件」(https://sillok.history.go.kr/id/kzb_10102007_002, 직접 확인) |
| 1912-01-01 | UTC+9 | 조선총독부 관보 제367호 고시 제338호(위키백과·IANA 인용, 관보 원문 미확인), 국가기록원 연표 |
| 1954-03-21 00:30→00:00 | UTC+8:30 | 국가기록원 '이달의 기록 2011-03' — 대통령령 제876호 「표준 자오선 변경에 관한 건」(1954-03-17 관보) |
| 1961-08-10 00:00 | UTC+9 | 국가기록원 — 「표준자오선 변경에 관한 법률」(1961-08-07 제정, 법률 제676호는 위키백과·IANA 표기) |
| 현행 | 동경 135° | 「표준시에 관한 법률」[법률 제10640호, 2011-05-19 전부개정] |

**서머타임(+1h), IANA tzdb `asia` Rule ROK(퍼블릭 도메인, 직접 확인)**: 1948 6/1 0:00 ~ 9/12 24:00 · 1949 4/3 ~ 9월 7일 이후 첫 토요일 24:00(1949~1951 공통 종료 규칙) · 1950 4/1 · 1951 5/6 · 1955 5/5 ~ 9/8 24:00 · 1956 5/20 ~ 9/29 24:00 · 1957~1960 5월 첫 일요일 0:00 ~ 9월 17일 이후 첫 토요일 24:00 · **1987~1988 5월 8일 이후 첫 일요일 02:00 ~ 10월 8일 이후 첫 일요일 03:00**(1987 5/10~10/11, 1988 5/8~10/9). 1987 은 국가기록원 '오늘의 기록 5월 10일'로 확인, 1988 종료일은 IANA 만. KASI 공식 연혁 페이지는 404.

**적용**: 시주는 (입력 시각 − 서머타임) → UTC+8:30 기간 보정 → 진태양시(서울 127°E 기준 약 −32분, 균시차)까지 할지는 설계 결정. 절기 시각은 astronomy-engine `SearchSunLongitude`(15°마다)로 직접 계산하고 KASI 특일 API(15012690)·saju-calendar-data 와 대조.

## 직접 재확인한 것 (2026-10-22)

- Kanripo 조직 설명 "Licensed as CC BY SA 4.0".
- KR3g0042 卷9 의 「六己日甲子時斷」~ 시단 단락(원문 표기는 「六已日」「六巳日」).
- 위키문헌 문서 5개 존재: 穷通宝鉴, 三命通會 (四庫全書本), 滴天髓闡微, 淵海子平, 神峰通考.
- 구텐베르크 #46963(Sepharial)·#70850(Tetrabiblos, Ashmand)·#42889(Baughan) 제목.
- archive.org 9개 항목의 제목·연도: Leo 3권, Heindel, Adams 2권, Butler, Kirk, Pagan.

## 직접 재확인한 것 (2026-10-23)

- archive.org 15권 접근 제한 없음·djvu.txt 있음. Heindel 달 12집(7815행~)·Leo Progressed 달의 집 통과(7648행~) 본문 열람. Sepharial 목차.
- 위키문헌 sections API: 穷通宝鉴 56·滴天髓闡微 65·三命通會/卷八 60·淵海子平 73. Kanripo KR3g0042 卷二·卷三 소제목, KR3g0051 卷十 宜忌.
- Commons 스캔 4종 라이선스 태그 Public domain.
- TCP A57689(Ramesey) CC0 문구·Liber III 택일 장 제목·활동궁 본문, A26565(Agrippa) XXIV·XLIX·수의 Scale 장 제목.
- 구텐베르크 #57978·#57980·#27228·#70749·#4925 제목, archive.org starloreofallage00olco·allen-r.-star-names·dli.ernet.128062·fastitristiapont00ovid.
- ko.wikisource 글로벌 세계 대백과 「별자리」 81,264B·「지구와 달의 운동」 23,550B, ko.wikipedia 황도대·하우스 (점성술)·점성술의 행성·사원소설·탄생석·백양궁·쌍어궁 존재, 우리말샘 저작권 정책 CC BY-SA 2.0 KR 문구.
- encykorea Guide/ContentUse 자유이용 문구. zh.wikisource 五行精紀(562,547B)·玉匣記(164,510B)·選擇要略(/上·/中·/下 분할, /中에 三災星 표)·黃帝內經/素問第一卷·禮記/月令·淮南子/時則訓 존재. Commons `CNTS-00076808100 -土亭秘訣-.pdf`(68쪽)·`CNTS-00047993889 天機大要.pdf`(236쪽)·`CNTS-00047987514 東國歲時記.pdf`(116쪽)·`CNTS-00047981929 1 唐四柱.pdf`(101쪽) 라이선스 Public domain, `CNTS-00047981900 1~3 選擇要略.pdf` 존재. GitHub license: 6tail/lunar-javascript MIT·OPN48/cnlunar MIT·golbin/ssaju MIT·yuangu/sxtwl_cpp BSD-3·rath/orrery AGPL-3.0·usingsky/korean_lunar_calendar_py MIT. HF Shann5/bazi-nayin cc-by-4.0. IANA tzdb Rule ROK 1948~1988. 순종실록 kzb_10102007_002 표준시 칙령.
