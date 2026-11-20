"use strict";

// 課本 3-2，第 74–81 頁。每題的干擾選項與正解同為岩石或同為礦物。
// 題號供存檔使用。追加新題時保留原有順序。
function cargoClue(answer, prompt, alternatives) {
  return {answer, prompt, alternatives};
}
const cargoBank = [
  cargoClue("limestone", "一塊沉積岩裡，含量最多的礦物是方解石。它該送往哪個展櫃？", ["shale","sandstone","granite"]),
  cargoClue("limestone", "水泥廠送來一件原料標本。紀錄寫著「沉積岩，富含碳酸鈣」。哪張標籤適合它？", ["marble","basalt","sandstone"]),
  cargoClue("limestone", "這箱標本原本是沉積岩，主要含方解石。地質紀錄指出，同類岩石受熱重新結晶後能變成大理岩。箱中原來是哪種岩石？", ["shale","slate","gneiss"]),

  cargoClue("granite", "工程師送來一塊外牆石板。放大觀察，可辨認彼此嵌合的長石、石英和黑雲母晶粒；採集卡將它歸為火成岩。它是哪一種？", ["marble","sandstone","basalt"]),
  cargoClue("granite", "有一箱的形成紀錄寫著「岩漿留在地底，慢慢冷卻；晶粒大到肉眼就能分辨」。哪種岩石最符合？", ["andesite","basalt","slate"]),
  cargoClue("granite", "工匠用這塊石材鋪室外地板。剖面裡有淺色與深色晶粒交錯，地質卡還標出它形成於地下深處。該貼上哪個名稱？", ["shale","limestone","andesite"]),

  cargoClue("talc", "有一塊礦物連摩氏硬度 2 的標準樣本都刻不傷，反過來卻被它刻出凹痕。四個展櫃中，哪個能收下它？", ["calcite","quartz","feldspar"]),
  cargoClue("talc", "造紙廠送來一包礦粉和它的原石。說明寫著「容易磨成粉，是摩氏硬度表第一級的標準礦物」。原石是哪一種？", ["gypsum","quartz","sulfur"]),
  cargoClue("talc", "老師拿出摩氏硬度表的第 1、3、7 級標準樣本。這一箱裝的是三塊之中最容易被另外兩塊刻傷的那一塊。是哪種礦物？", ["gypsum","calcite","quartz"]),

  cargoClue("calcite", "未知礦物能刻傷硬度 2 的石膏，卻被硬度 4 的螢石刻傷。四張標籤裡，哪一張符合這兩筆紀錄？", ["graphite","feldspar","quartz"]),
  cargoClue("calcite", "石灰岩的展牌少了一行。若要補上「這種岩石最主要的組成礦物」，你要去哪個礦物櫃找樣本？", ["quartz","mica","gypsum"]),
  cargoClue("calcite", "三個標準樣本的摩氏硬度分別是 1、3、7。展覽需要中間那塊，示範它既能刻傷較軟的樣本，也會被較硬的樣本刻傷。應送出哪一塊？", ["talc","gypsum","feldspar"]),

  cargoClue("quartz", "飾品師把透明水晶送來參展。館員要依它的礦物種類歸檔，這件飾品該進哪個櫃？", ["calcite","feldspar","gypsum"]),
  cargoClue("quartz", "箱內的標準礦物能在硬度 6 的正長石上留下刻痕，卻刻不傷硬度 8 的黃玉。你會選哪個展櫃？", ["talc","mica","gypsum"]),
  cargoClue("quartz", "從花崗岩中辨認出一顆礦物。它在摩氏硬度表上排第 7 級，能刻傷方解石。這顆礦物該放在哪裡？", ["feldspar","mica","graphite"]),

  cargoClue("marble", "藝品店送來一塊有不規則紋路的石雕。紀錄顯示，它由含方解石的石灰岩經變質作用形成。該把成品送到哪一櫃？", ["slate","gneiss","granite"]),
  cargoClue("andesite", "一件廟宇龍柱的石材樣本呈灰黑色，在細緻的底色中看得到較大的斑點。依課本介紹的龍柱石材，它最可能來自哪個展櫃？", ["limestone","marble","shale"]),
  cargoClue("gypsum", "裝修師傅帶來室內隔間用的板材。板芯主要使用一種摩氏硬度 2 的礦物。該到哪個展櫃尋找它的原料？", ["talc","feldspar","mica"]),
  cargoClue("graphite", "削鉛筆時撿到一段黑色筆芯。筆芯中的黏土負責調整軟硬，另一種能在紙上留下灰黑線條的礦物是什麼？", ["talc","sulfur","quartz"]),
  cargoClue("sulfur", "這件標本常呈鮮黃色。課本的生活應用展板說，它可作為製造煙火的原料之一。該送到哪個礦物櫃？", ["gypsum","calcite","graphite"])
];

const scoreGoal = 7;
const focusMineralsAndRocks = ["limestone","granite","talc","calcite","quartz"];

function drawCargoRound() {
  const indices = cargoBank.map((_,i)=>i);
  const focus = focusMineralsAndRocks.map(name=>shuffle(indices.filter(i=>cargoBank[i].answer===name))[0]);
  const extra = shuffle(indices.filter(i=>!focusMineralsAndRocks.includes(cargoBank[i].answer))).slice(0,2);
  return shuffle([...focus,...extra]).map(id=>{
    const question = cargoBank[id];
    return {id, options:shuffle([question.answer,...question.alternatives])};
  });
}

function beltScreen() {
  const current = s.queue[0];
  const question = cargoBank[current.id];
  const options = current.options.map((id,index)=>{
    const letter = '<span class="chute-letter" aria-hidden="true">'+"ABCD"[index]+'</span>';
    return btn("send-"+id,letter+exhibits[id].name,"chute-choice",paused?"disabled":"");
  }).join("");
  return talk(7,"讀取封箱上的線索，把貨箱送到正確的展櫃。每箱答對得 1 分，集滿 7 分就開館。")+
    '<div class="row belt-score"><b>分流得分　'+s.delivered+' / '+scoreGoal+'</b><div>'+
    (racing?'<span id="clock"></span>　':"")+btn("pause",paused?"▶ 繼續":"Ⅱ 暫停")+'</div></div>'+
    '<div class="belt"><div class="cargo"><span class="eyebrow">FIELD EXPRESS ▸ 標本貨箱</span>'+
    '<div class="sealed-parcel" aria-hidden="true"><i></i></div>'+
    '<h3>'+(paused?"輸送帶已暫停":question.prompt)+'</h3></div></div>'+
    '<div class="chute-grid">'+options+'</div><p align="center">點選展櫃或拖曳貨箱。送錯的貨箱會回到隊尾，稍後再試。</p>';
}

function sendCargo(choice) {
  if (s.stage!==4 || lobby || paused || !s.queue.length) return;
  const current=s.queue[0];
  if (!current.options.includes(choice)) return;
  s.queue.shift();
  if (choice!==cargoBank[current.id].answer) {
    s.miss++;
    s.queue.push(current);
    notify("這箱的線索和展櫃不符，回到隊尾再試一次。");
  } else {
    s.delivered++;
    tone();
    notify("分流成功，獲得 1 分！");
  }
  if (s.delivered===scoreGoal) {
    if (racing) {pauseTime();s.time=elapsed;racing=false;}
    celebrateVictory();
    return;
  }
  save();
  render();
}
