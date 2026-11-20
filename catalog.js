// 教學標本。硬度採摩氏刻劃硬度，岩石展品保留 null。
const exhibits = {
  limestone: {
    name: "石灰岩", group: "沉積岩", hardness: null,
    look: "「千層蛋糕」主要由方解石組成。有些石灰岩能看到層理或貝殼碎片，也有些看起來像一整塊。",
    use: "石灰岩是製造水泥的主要原料之一。建造房屋時使用的混凝土，通常就含有水泥。",
    sourceName: "猶他州地質調查局・三大岩類", source: "https://geology.utah.gov/map-pub/survey-notes/glad-you-asked/igneous-sedimentary-metamorphic-rocks/"
  },
  shale: {
    name: "頁岩", group: "沉積岩", hardness: null,
    look: "細小的黏土和粉砂沉積後形成頁岩。從側面看，常有很薄的層紋，容易沿著層面分開。",
    use: "富含黏土的頁岩可作為燒製建築用磚的原料。",
    sourceName: "密蘇里州自然資源部・黏土與頁岩", source: "https://dnr.mo.gov/document-search/clay-shale-pub2905/pub2905"
  },
  sandstone: {
    name: "砂岩", group: "沉積岩", hardness: null,
    look: "砂粒沉積、黏結後形成砂岩。表面常看得出一粒粒的砂，有些標本還保留條紋。",
    use: "質地適合的砂岩可以切成石塊，用於建築牆面或鋪路。",
    sourceName: "美國地質調查局・建築石材", source: "https://pubs.usgs.gov/myb/vol1/2018/myb1-2018-dimension-stone.pdf"
  },
  andesite: {
    name: "安山岩", group: "火成岩", hardness: null,
    look: "安山岩是火山岩，常呈灰色到灰黑色。仔細看，有些標本的細粒底色中散布著較大的淺色晶粒。",
    use: "臺灣有些廟宇的龍柱、石獅和牆面石雕，就是用安山岩雕成的。",
    sourceName: "國立臺灣博物館・安山岩", source: "https://collections.culture.tw/ntm_collectionsweb/collection.aspx?GID=MRMKMWM6M8M2"
  },
  basalt: {
    name: "玄武岩", group: "火成岩", hardness: null,
    look: "玄武岩是常呈深灰至黑色的火山岩。顆粒通常很細，有些標本能看見氣泡留下的孔洞。",
    use: "澎湖有些「菜宅」用當地玄武岩堆成石牆，替菜園裡的作物擋風。",
    sourceName: "澎湖縣政府文化局・菜宅風貌", source: "https://basalt.phhcc.gov.tw/c/c01_02.asp"
  },
  granite: {
    name: "花崗岩", group: "火成岩", hardness: null,
    look: "「火爆小子」來自地下緩慢冷卻的岩漿。能用肉眼分辨交錯的礦物晶粒，常見長石、石英和黑雲母。",
    use: "花崗岩可切成耐用的石板，鋪在室外地面或裝在建築外牆上。",
    sourceName: "猶他州地質調查局・三大岩類", source: "https://geology.utah.gov/map-pub/survey-notes/glad-you-asked/igneous-sedimentary-metamorphic-rocks/"
  },
  marble: {
    name: "大理岩", group: "變質岩", hardness: null,
    look: "石灰岩受熱等因素影響，方解石重新結晶，可以形成大理岩。常見白色標本，有些還帶著其他礦物形成的紋路。白雲岩也能變成大理岩。",
    use: "大理岩可以雕成藝術品，也能磨光做成桌面。在花蓮太魯閣，還能看到大理岩峽谷。",
    sourceName: "國立臺灣博物館・大理岩", source: "https://collections.culture.tw/ntm_collectionsweb/Collection?GID=MCM6MRMNMW",
    sourceName2: "美國國家公園管理局・變質岩與原岩", source2: "https://www.nps.gov/romo/learn/education/upload/Geology-Teacher-Guide-for-web.pdf"
  },
  slate: {
    name: "板岩", group: "變質岩", hardness: null,
    look: "頁岩等細粒岩石經過低度變質，可以形成板岩。變質時產生的平行弱面讓岩石容易劈成平整的薄板。",
    use: "臺灣有些地方會取板岩做屋頂或砌牆，將一片片岩板疊成石板屋。",
    sourceName: "蘭陽博物館・蘇澳的板岩", source: "https://www.lym.gov.tw/ch/collection/epaper/epaper-detail/b78e03c1-3ea7-11eb-90c7-2760f1289ae7/"
  },
  gneiss: {
    name: "花崗片麻岩", group: "變質岩", hardness: null,
    look: "花崗岩經變質作用可以形成花崗片麻岩。淺色的石英、長石和深色礦物常聚成不同條帶，轉到側面看一看。",
    use: "花崗片麻岩可作建築或裝飾石材。切開並磨光石面，就能欣賞深淺相間的紋路。",
    sourceName: "國立自然科學博物館・花崗片麻岩", source: "https://www.nmns.edu.tw/ch/exhibitions/galleries/outdoor/classroom/028/index.html",
    sourceName2: "國立臺灣博物館・片麻岩用途", source2: "https://collections.culture.tw/ntm_collectionsweb/EN/Collection?GID=MHMSMBMLMW"
  },
  talc: {
    name: "滑石", group: "礦物", hardness: "1",
    look: "滑石常呈白色或淡綠色，摸起來滑滑的。指甲就能在它表面留下刻痕，是摩氏硬度表第 1 級的標準礦物。",
    use: "滑石磨成細粉，可當作紙張或塗料的填料。",
    sourceName: "美國地質調查局・滑石教材", source: "https://pubs.usgs.gov/gip/2005/17/gip-17.pdf"
  },
  calcite: {
    name: "方解石", group: "礦物", hardness: "3",
    look: "方解石常見白色或透明的標本。它容易沿三個方向裂開，形成有斜角的菱面體。石灰岩裡常含有大量方解石。",
    use: "含有大量方解石的石灰岩可以用來製造水泥。",
    sourceName: "地質調查及礦業管理中心・方解石", source: "https://twgeoref.gsmma.gov.tw/GipOpenWeb/wSite/ct?ctNode=1233&mp=105&xItem=125822"
  },
  quartz: {
    name: "石英", group: "礦物", hardness: "7",
    look: "石英可呈無色、乳白色或其他顏色。生長空間充足時，常長成有六個側面的晶柱。石英能在滑石和方解石上留下刻痕。",
    use: "漂亮的水晶可磨成飾品。富含石英的純淨砂也是製造玻璃的原料。",
    sourceName: "明尼蘇達大學・石英", source: "https://commonminerals.esci.umn.edu/minerals-o-s/quartz"
  },
  feldspar: {
    name: "長石（正長石）", group: "礦物", hardness: "6",
    look: "長石是一個礦物家族，這裡以正長石為例。它可以呈粉紅色或白色，常沿兩個接近直角的方向裂開。",
    use: "長石可作為製造玻璃和陶瓷的原料，例如燒製瓷器使用的配料。",
    sourceName: "明尼蘇達大學・鉀長石", source: "https://commonminerals.esci.umn.edu/minerals-o-s/potassium-feldspar"
  },
  mica: {
    name: "黑雲母", group: "礦物", hardness: "2.5～3",
    look: "黑雲母常呈黑色或深褐色，能沿同一個方向一層層剝成薄片，平滑的片面可反光。",
    use: "有些花崗岩地板上的深色亮片就是黑雲母。地質學家也能分析黑雲母，推算岩石在地下冷卻的年代。",
    sourceName: "科技大觀園・礦物記錄的冷卻年代", source: "https://scitechvista.nat.gov.tw/Article/C000009/detail?ID=59b78412-cef3-4f0a-8720-1bb37c815e4d",
    sourceName2: "礦業工程學會教育基金會・黑雲母硬度", source2: "https://mineralseducationcoalition.org/minerals-database/biotite/"
  },
  gypsum: {
    name: "石膏", group: "礦物", hardness: "2",
    look: "石膏可呈白色或透明，晶體有時呈板狀。它相當軟，指甲就能在表面留下刻痕。",
    use: "室內隔間常使用的石膏板，板芯的主要材料就是石膏。",
    sourceName: "明尼蘇達大學・石膏", source: "https://commonminerals.esci.umn.edu/minerals-g-m/gypsum"
  },
  graphite: {
    name: "石墨", group: "礦物", hardness: "1～2",
    look: "石墨由碳組成，呈深灰到黑色，表面有時帶金屬光澤。它很軟，能在紙上留下灰黑痕跡。",
    use: "木頭鉛筆的筆芯通常用石墨和黏土製成。在相近配方中，石墨比例越高，畫出的線條通常越黑。",
    sourceName: "明尼蘇達大學・石墨", source: "https://commonminerals.esci.umn.edu/minerals-g-m/graphite"
  },
  sulfur: {
    name: "硫黃", group: "礦物", hardness: "1.5～2.5",
    look: "天然硫黃常呈鮮黃色，有時能看到小晶體。標本較軟，也容易碎裂。",
    use: "硫黃可作為煙火的原料之一，工業上也用它製造硫酸，再用於肥料生產。",
    sourceName: "明尼蘇達大學・自然硫", source: "https://commonminerals.esci.umn.edu/minerals-o-s/sulfur"
  }
};
