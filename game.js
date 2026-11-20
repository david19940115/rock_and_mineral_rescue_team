"use strict";
const people = [
 ["大衛老師","卡其探勘背心、方框眼鏡與指揮棒"],
 ["瑄哥","白色上衣、黑短褲，手握舞台麥克風"],
 ["吉他凱","灰色短袖、黑短褲，抱著木吉他放聲唱"],
 ["恩哥","深色西裝外套、白球鞋，擔任鋼琴手"],
 ["寧姐","灰色連帽衣、藍色長褲，抱著木吉他"],
 ["嫣姐","灰色上衣、淺色短褲，捧著裝飾蛋糕"],
 ["吟姐","水藍耳罩與音符手套"],
 ["竣哥","深藍飛行外套與羅盤臂章"],
 ["惡魔凱","黑框眼鏡、藍色上衣，全身沾著泥巴"]
];
function heroFile(i){return [0,6,7].includes(i)?"hero"+i:"explorer"+i}
const data={limestone:["石灰岩","千層蛋糕屬於沉積岩，主要成分是方解石。"],granite:["花崗岩","火爆小子是地下岩漿冷卻凝固形成的火成岩，主要含長石、石英和黑雲母。"],talc:["滑石","摩氏硬度 1，三種裡最不硬。"],calcite:["方解石","摩氏硬度 3，能刻傷滑石，也會被石英刻傷。"],quartz:["石英","摩氏硬度 7，是這三種礦物裡最硬的。"],feldspar:["長石","花崗岩常見的組成礦物。"],mica:["黑雲母","花崗岩中常見的深色片狀礦物。"]};
const trio=["talc","calcite","quartz"],hard={talc:1,calcite:3,quartz:7};
const names=["河岸救援","刻痕機關室","展場輸送帶"];
const labels=["出發集合","河岸救援","岩石觀察台","刻痕機關室","展場輸送帶","岩礦博物館","玉里稻田"];
const $=id=>document.getElementById(id),main=$("main"),key="class6a.rockrescue.quiz20";
function shuffle(arr){let copy=[...arr];for(let i=copy.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
function fresh(hero){return {hero,stage:1,x:0,y:2,found:[],rock:0,model:0,parts:[],turn:0,known:[],tests:[],rank:[],cargoVersion:2,queue:drawCargoRound(),delivered:0,miss:0,soil:0}}
let s;
try {
 s=JSON.parse(localStorage.getItem(key)) || JSON.parse(localStorage.getItem("class6a.rockrescue.v3")) || JSON.parse(localStorage.getItem("yuli.fieldclub.museum.v2")) || JSON.parse(localStorage.getItem("yuli.fieldclub.v1"));
 if(s?.stage===3 && !allTrialsDone(s.tests)) s.rank=[];
 if(s?.stage===2 && !s.turn) s.parts=[];
} catch { s=null }
if(!s||!Array.isArray(s.queue)||!people[s.hero]||!labels[s.stage])s=null;
// Carry over earned points; the old numeric question IDs belong to the seven-question bank.
if(s && s.cargoVersion!==2){
 s.queue=s.stage<5?drawCargoRound().slice(s.stage===4?s.delivered:0):[];
 s.cargoVersion=2;
}
let lobby=true,pick=s?s.hero:0,sound=true,ac,toastTimer,anim=0,runTimer=0,timerStart=0,elapsed=0,racing=false;
let tool=null,target=null,focusSlot=0,lastTest=null,paused=false,soilTime=0;
if(s?.stage===4&&s.raceActive){racing=true;elapsed=s.raceElapsed||0}
function save(){if(s&&s.stage===4){s.raceActive=racing;s.raceElapsed=elapsed+(timerStart?performance.now()-timerStart:0)}try{localStorage.setItem(key,JSON.stringify(s))}catch{}}
function tone(freq=600){if(!sound)return;try{ac ||= new (window.AudioContext||window.webkitAudioContext)();ac.resume();let osc=ac.createOscillator(),gain=ac.createGain();osc.type="triangle";osc.frequency.value=freq;gain.gain.setValueAtTime(.06,ac.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.11);osc.connect(gain).connect(ac.destination);osc.start();osc.stop(ac.currentTime+.12)}catch{}}
function notify(msg){$("notice").textContent=msg;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("notice").textContent="",2800)}
function img(file,cls="spec",alt=""){return '<img draggable="false" class="'+cls+'" src="assets/'+file+'.png" alt="'+alt+'">'}
function hero(i,cls="sprite"){return img(heroFile(i),cls,people[i][0])}
function btn(action,title,cls="",more=""){return '<button data-do="'+action+'" class="'+cls+'" '+more+'>'+title+'</button>'}
function item(id,action,selected=false){return btn(action,img(id)+data[id][0],"item"+(selected?" sel":""),'aria-pressed="'+selected+'"')}
function talk(i,msg,own){return '<div class="dialogue">'+hero(i)+'<div><strong>'+people[i][0]+(i===s.hero?"・我":"・隊友")+'</strong><p>'+(i===s.hero&&own?own:msg)+'</p></div></div>'}
function unlock(...ids){s.known=[...new Set([...s.known,...ids])]}
function modal(title,html){$("dialogbody").innerHTML="<h2>"+title+"</h2>"+html;if(!$("dialog").open)$("dialog").showModal()}
function render(){closeMuseumViewer();cancelAnimationFrame(anim);clearInterval(runTimer);if(lobby){renderLobby();return}
 const content=[null,riverScreen,rockScreen,labScreen,beltScreen,museumScreen,soilScreen][s.stage]();
 main.innerHTML='<section class="stage"><div class="stagehead"><div><span class="eyebrow">六年甲班岩礦救援隊　 /　'+(s.stage===6?"支線任務":"救援任務")+'</span><h1>'+labels[s.stage]+'</h1></div>'+btn("home","⌂　集合處")+'</div>'+content+'</section>';
 if(s.stage===5)openMuseumViewer();
 if(s.stage===1)startRiver();
 if(s.stage===2){drawModel();drawSpecimen($("observation-rock"),specimens[s.rock],(s.turn%2)*180)}
 if(s.stage===3)drawTest();
 if(s.stage===4){setupChute();if(racing)startClock()}
}
function renderLobby(){const resume=!!s;main.innerHTML='<div class="lobby"><section class="scene"><div class="scenehead"><span class="eyebrow">✦　HUALIEN · YULI</span><h1><span class="class-name">六年甲班</span>岩礦救援隊</h1><p>找回失落標本，重開校園自然展。</p></div>'+hero(pick,"sprite lead")+'<div class="scenefoot"><span class="tag">●　集合地點</span><b>花東縱谷・玉里田野</b></div></section><section class="box"><span class="eyebrow">SELECT YOUR EXPLORER</span><h2>選擇探險隊員</h2><p>選一位出發，其他八位將在途中接應。</p><div class="roster">'+people.map((p,i)=>btn("pick-"+i,hero(i)+p[0],"char"+(i===pick?" sel":""),'aria-pressed="'+(i===pick)+'"')).join("")+'</div><p class="desc"><strong>◆　'+people[pick][0]+'</strong><br>'+people[pick][1]+'</p>'+btn("start","▶　"+(resume?"開啟新冒險":"集合出發"),"action wide")+(resume?btn("resume","繼續"+people[s.hero][0]+"的進度 · "+labels[s.stage],"wide",'style="margin-top:8px"'):"")+'</section></div><section class="route"><h3>探險路線</h3><div class="missions">'+names.map((name,i)=>'<div class="mission">'+img(["limestone","quartz","granite"][i])+'<div><small>MISSION 0'+(i+1)+'</small><strong>'+name+'</strong></div></div>').join("")+'</div></section>'}
function riverScreen(){return talk(0,"自然展的推車翻了！沿棧道拿回兩箱標本，再去右岸找恩哥。","我來帶隊！先拿回兩箱標本，再去右岸找恩哥。")+'<div class="riverwrap"><canvas id="river" width="800" height="350" role="img" aria-label="棧道地圖，使用下方方向按鈕或方向鍵移動"></canvas></div><div class="dpad">'+[["left","◀","左"],["up","▲","上"],["down","▼","下"],["right","▶","右"]].map(a=>btn("move-"+a[0],a[1],"",'aria-label="往'+a[2]+'"')).join("")+btn("pause",paused?"▶ 繼續":"Ⅱ 暫停")+'</div><p align="center" id="riverstat">標本箱 '+s.found.length+' / 2　｜　點相鄰木板或用方向鍵移動，避開移動的木箱。</p>'}
const specimens=["limestone","granite"],parts=[["calcite"],["feldspar","quartz","mica"]];
function rockQuestions(n) {
 const ids=n?["quartz","talc","mica","feldspar"]:["talc","calcite","quartz"];
 return '<h3>找出'+(n?"三種主要礦物":"主要礦物")+'</h3><div class="cards">'+ids.map(k=>item(k,"part-"+k,s.parts.includes(k))).join("")+'</div><p class="note">'+(s.parts.length?"已找到 "+s.parts.map(k=>data[k][0]).join("、"):"點選礦物，補上標本說明牌。")+'</p>';
}
function rockScreen() {
 const n=s.rock, id=specimens[n], turned=s.turn>0, built=s.model===3;
 const notes=[
  ["海底有含鈣的沉積物。","一層沉積物留下了。","更多沉積物覆蓋在上面。","沉積物經過長時間的堆積與固結，形成沉積岩。"],
  ["地下深處有岩漿。","岩漿逐漸冷卻。","不同礦物的晶體漸漸長大。","岩漿在地下緩慢冷卻凝固，形成火成岩。"]
 ];
 const modelControl=built?"":btn("model",n?"推進冷卻時間 →":"堆疊沉積層 ↓","action");
 const guide=turned?(n?"觀察顆粒的大小和顏色，再比對礦物卡。":"這件標本主要由一種礦物組成，試著補上說明牌。"):"先點樣本或「換面觀察」，看看同一塊岩石的另一側。";
 const ready=turned && built;
 const sample='<div class="bench"><span class="eyebrow">標本　'+(n+1)+' / 2</span><h2>'+["千層蛋糕","火爆小子"][n]+'</h2><div class="display observation">'+btn("rotate",'<canvas id="observation-rock" width="360" height="200" aria-label="岩石立體示意模型"></canvas>',"","aria-label=轉動樣本")+'</div>'+btn("rotate","↻　換面觀察")+'<p>'+(turned?(s.turn%2?'背面 · 已觀察兩面':'正面 · 已觀察兩面'):"從另一側觀察這件標本。")+'</p></div>';
 const model='<div class="bench"><h3>'+["沉積環境模型","地下岩漿模型"][n]+'</h3><div class="bar"><i style="width:'+s.model/3*100+'%"></i></div><p>'+notes[n][s.model]+'</p>'+modelControl+(ready?rockQuestions(n):'<p class="gate-note">觀察進度　'+(turned?"✓ 已換面":"○ 待換面")+'　·　模型 '+s.model+' / 3</p>')+'</div>';
 return talk(3,"兩箱都到了！我來把標本搬到觀察台。")+talk(1,"先把岩石轉個面，並推進形成模型。兩件事完成後，才會打開礦物卡。")+'<div class="labgrid">'+sample+model+'</div>'+talk(n?4:5,guide)+(ready && s.parts.length===parts[n].length?btn("nextRock","收錄"+data[id][0]+"　→","action wide"):"");
}
function slot(v,i){return btn("slot-"+i,(i?"被刻樣本":"手持工具")+"<br>"+(v?img(v)+data[v][0]:"點選礦物"),"slot"+(focusSlot===i?" sel":""))}
function allTrialsDone(tests) {
 return Array.isArray(tests) && ["talc","calcite","quartz"].every(a=>["talc","calcite","quartz"].every(b=>a===b||tests.includes(a+"/"+b)));
}
function trialLog() {
 return trio.map(a=>trio.filter(b=>a!==b).map(b=>{
  const key=a+"/"+b,done=s.tests.includes(key);
  return '<li class="'+(done?"measured":"")+'"><span>'+data[a][0]+' → '+data[b][0]+'</span><b>'+(done?(hard[a]>hard[b]?"有刻痕":"無刻痕"):"待試刻")+'</b></li>';
 }).join("")).join("");
}
function labScreen() {
 const done=allTrialsDone(s.tests);
 const sorting=done?'<h3>由最不硬排到最硬</h3><div class="cards">'+["quartz","talc","calcite"].map(k=>item(k,"rank-"+k,s.rank.includes(k))).join("")+'</div><p class="note">'+(s.rank.map(k=>data[k][0]).join(" → ")||"依序點選三塊礦物")+'</p>'+btn("resetRank","清除排序")+' '+btn("unlock","開鎖","action"):'<p class="gate-note">六筆不同方向的試刻都完成後，硬度鎖就會出現。</p>';
 return talk(2,"先選手持工具，再選被刻樣本。按「試刻一下」，交換方向後再試一次。")+'<div class="labgrid"><div class="bench"><h3>刻劃工作臺</h3><div class="slots">'+slot(tool,0)+' → '+slot(target,1)+'</div><div class="cards">'+trio.map(k=>item(k,"min-"+k)).join("")+'</div><div class="row controls">'+btn("swap","⇆　交換方向")+btn("test","試刻一下","action")+'</div><p class="note">'+(lastTest?describeTest(lastTest):"在兩個樣本格上橫向滑動也能試刻。")+'</p></div><div class="bench"><h3>實驗紀錄　'+s.tests.length+' / 6</h3><p>手持工具 → 被刻樣本</p><ul class="trial-log">'+trialLog()+'</ul>'+sorting+'</div></div>'+talk(6,"觀察被刻的那一面。留下凹痕的礦物，硬度比手持工具低。");
}
function describeTest(t){let [a,b]=t.split("/");return data[a][0]+" 刻 "+data[b][0]+" → "+(hard[a]>hard[b]?data[b][0]+"有刻痕":"沒有刻痕")}
function showResults() {
 modal("救援任務完成",'<div class="team">'+people.map((_,i)=>hero(i)).join("")+'</div><p>九位隊員集合，七箱展品全部歸位。</p><p>◆ 找回千層蛋糕與火爆小子<br>◆ 已記錄 '+s.tests.length+' 種不同方向的試刻<br>◆ '+(s.miss?"貨箱重新分流 "+s.miss+" 次後完成":"全數首次分流正確，取得精準展務章")+(s.time!=null?"<br>◆ 競速成績 "+(s.time/1000).toFixed(1)+" 秒":"")+'</p>');
}
const earth=["🪨","🌱　🪨","🍂　🪨","🌾　🌾　🌾"],soilNotes=["樹根伸入岩縫。","根系生長，岩石風化、裂成碎屑。","落葉等生物遺體分解，留下腐植質。","經過長時間，風化殘餘物和腐植質等形成土壤，可以栽種稻米。"];
function soilScreen(){return '<div class="results"><span class="eyebrow">田野支線</span><h2>讓稻田長出新芽</h2><div id="soilscene" class="soil">'+earth[soilTime]+'</div><p id="soilnote">'+soilNotes[soilTime]+'</p><label>拖動時間　<input id="soilrange" type="range" min="0" max="3" value="'+soilTime+'"></label><div class="controls">'+btn("sow",s.soil?"查看收成":"種下秧苗","action")+btn("backWin","返回展場")+'</div></div>'}
function resetLocal(){resetMuseum();paused=false;tool=target=lastTest=null;focusSlot=0;soilTime=0;racing=false;elapsed=0;timerStart=0}
function go(stage){s.stage=stage;paused=false;save();render();window.scrollTo(0,0)}
function begin(){resetLocal();s=fresh(pick);lobby=false;go(1)}
function startClock(){clearInterval(runTimer);if(!timerStart&&!paused)timerStart=performance.now();function paint(){if($("clock"))$("clock").textContent=((elapsed+(timerStart?performance.now()-timerStart:0))/1000).toFixed(1)+" 秒"}paint();runTimer=setInterval(paint,150)}
window.addEventListener("pagehide",()=>{if(s)save()});
function pauseTime(){if(timerStart){elapsed+=performance.now()-timerStart;timerStart=0}}
function action(a){let [op,v]=a.split("-");if(op==="pick"){pick=+v;render();return}if(op==="start"){if(!s)begin();else modal("重新集合？","<p>開始新冒險會更新這個瀏覽器的遊戲進度。</p>"+btn("confirm","開始新冒險","action"));return}if(op==="confirm"){$("dialog").close();begin();return}if(op==="resume"){lobby=false;render();return}if(op==="home"){pauseTime();lobby=true;pick=s.hero;save();render();return}if(op==="pause"){if(!paused)pauseTime();paused=!paused;render();return}
 if(op==="move"){moveRiver(v);return}if(op==="rotate")s.turn++;if(op==="model")s.model=Math.min(3,s.model+1);
 if(op==="part"){if(!s.turn||s.model!==3)return;if(!parts[s.rock].includes(v)){notify("再看隊友提供的成分線索。");return}if(!s.parts.includes(v))s.parts.push(v)}
 if(op==="nextRock"){if(s.parts.length!==parts[s.rock].length||s.model!==3)return;if(!s.turn){notify("收錄前先點標本觀察另一面。");return}unlock(specimens[s.rock],...s.parts);if(s.rock===1){go(3);return}s.rock=1;s.turn=0;s.model=0;s.parts=[]}
 if(op==="slot")focusSlot=+v;if(op==="min"){if(focusSlot===0)tool=v;else target=v;focusSlot=1-focusSlot;lastTest=null}if(op==="swap"){[tool,target]=[target,tool];lastTest=null}
 if(op==="test"){if(!tool||!target||tool===target){notify("先選兩種不同的礦物。");return}lastTest=tool+"/"+target;if(!s.tests.includes(lastTest))s.tests.push(lastTest);tone(hard[tool]>hard[target]?840:300)}
 if(op==="rank"&&allTrialsDone(s.tests)&&trio.includes(v)&&!s.rank.includes(v))s.rank.push(v);if(op==="resetRank")s.rank=[];
 if(op==="unlock"){if(!allTrialsDone(s.tests)){notify("請先完成六筆不同方向的試刻。");return}if(String(s.rank)!==String(trio)){s.rank=[];notify("先放最容易被刻傷的，再放其餘兩塊。");save();render();return}unlock(...trio);go(4);notify("硬度鎖開了！請幫展場分流貨箱。");return}
 if(op==="send"){sendCargo(v);return}
 if(op==="results"){showResults();return}
 if(op==="race"){s.queue=drawCargoRound();s.delivered=s.miss=0;s.time=null;elapsed=timerStart=0;racing=true;go(4);return}if(op==="soil"){soilTime=s.soil?3:0;go(6);return}if(op==="backWin"){go(5);return}if(op==="sow"){if(soilTime<3){notify("把時間往前推，看看土壤如何形成。");return}s.soil=1;save();modal("稻穗成熟了！","<p>你讓岩石的風化物和腐植質經過長時間形成土壤，完成玉里稻田支線。</p>");return}
 save();render()}
document.addEventListener("click",e=>{let b=e.target.closest("[data-do]");if(b){tone(460);action(b.dataset.do)}});document.addEventListener("input",e=>{if(e.target.id==="soilrange"){soilTime=+e.target.value;$("soilscene").textContent=earth[soilTime];$("soilnote").textContent=soilNotes[soilTime]}});
let swipeX=null;document.addEventListener("pointerdown",e=>{if(e.target.closest(".slots"))swipeX=e.clientX});document.addEventListener("pointerup",e=>{if(swipeX!==null&&Math.abs(e.clientX-swipeX)>50&&s?.stage===3&&!lobby)action("test");swipeX=null});
function book(){let known=s?.known||[];modal("田野圖鑑",'<p>已收錄 '+known.length+' / 7 種岩礦，完成觀察或刻劃即可解鎖。</p><div class="journal">'+Object.entries(data).map(([k,d])=>'<article>'+(known.includes(k)?img(k)+"<h3>"+d[0]+"</h3><p>"+d[1]+"</p>":"<span class=tiny>尚待調查</span><h3>？</h3>")+'</article>').join("")+'</div>')}
$("book").onclick=book;$("help").onclick=()=>modal("探險手冊","<p>① 在集合處選主角。沿河岸用方向鍵、方向鈕或點相鄰木板移動，收集兩箱標本。</p><p>② 觀察岩石並補齊成分。到工作臺試刻兩種礦物，再依硬度排列。</p><p>③ 根據每箱的線索，從四個展櫃選一個。答對得 1 分，累計 7 分過關。完成主線會進入岩礦博物館，可轉動館藏、探索岩石變質，也可挑戰競速或到稻田栽種。</p><p>可用 Tab 或左右鍵移動按鈕焦點，Enter 操作。進度會儲存在本瀏覽器。</p>");$("close").onclick=()=>$("dialog").close();
document.addEventListener("keydown",e=>{let dir={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"}[e.key];if(!dir||e.target.tagName==="INPUT")return;if(!lobby&&s.stage===1&&!$("dialog").open){e.preventDefault();moveRiver(dir);return}let arr=[...document.querySelectorAll($("dialog").open?"dialog button":"header button,main button")];if(!arr.length)return;e.preventDefault();arr[(arr.indexOf(document.activeElement)+(dir==="left"||dir==="up"?-1:1)+arr.length)%arr.length].focus()});

const riverTiles=[[1,1,1,0,1,1,1],[0,1,1,1,1,0,1],[1,1,0,1,1,1,1],[1,1,1,1,0,1,1]];
const caches=[[2,0],[5,3]], riverArt=new Map();
let riverTime=0,lastFrame=0,grace=0;
function bitmap(file){if(!riverArt.has(file)){let im=new Image();im.src="assets/"+file+".png";riverArt.set(file,im)}return riverArt.get(file)}
function pos(x,y){return [68+x*110,99+y*65]}
function obstacles(){return [[1+Math.abs((riverTime*.001%6)-3),1],[3+Math.abs((riverTime*.0008%6)-3),2]]}
function moveRiver(dir){if(paused||$("dialog").open||lobby||s.stage!==1)return;let [dx,dy]={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[dir];let x=s.x+dx,y=s.y+dy;if(!riverTiles[y]?.[x]){notify("走相鄰的木板，繞過水面。");return}s.x=x;s.y=y;let i=caches.findIndex(([a,b])=>a===x&&b===y);if(i>=0&&!s.found.includes(i)){s.found.push(i);tone(925);notify("取得標本箱 "+(i+1)+"！")}if(x===6&&y===0){if(s.found.length===2){go(2);return}notify("恩哥：還有標本箱在棧道上！")}save();updateRiverStatus()}
function updateRiverStatus(){let el=$("riverstat");if(el)el.textContent="標本箱 "+s.found.length+" / 2　｜　"+(s.found.length===2?"帶著標本走到右上角接應點。":"點相鄰木板或使用方向鍵，避開滾動的木箱。")}
function startRiver(){const canvas=$("river"),ctx=canvas.getContext("2d");lastFrame=0;updateRiverStatus();
 canvas.onclick=e=>{let r=canvas.getBoundingClientRect(),x=Math.round(((e.clientX-r.left)*800/r.width-68)/110),y=Math.round(((e.clientY-r.top)*350/r.height-99)/65);let dx=x-s.x,dy=y-s.y;if(Math.abs(dx)+Math.abs(dy)===1)moveRiver(dx>0?"right":dx<0?"left":dy>0?"down":"up");else if(!paused)notify("點主角旁邊的一格木板。")};
 function drawImg(id,x,y,w,h){let im=bitmap(id);if(im.complete&&im.naturalWidth)ctx.drawImage(im,x,y,w,h)}
 function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
 function crate(x,y,gold){rect(x-16,y-25,32,28,"#523e33");rect(x-13,y-22,26,22,gold?"#ffcf67":"#b27b46");rect(x-10,y-19,20,16,gold?"#b58b41":"#815b40");ctx.fillStyle=gold?"#fff4a8":"#ce9b6b";ctx.font="bold 20px monospace";ctx.textAlign="center";ctx.fillText(gold?"◆":"×",x,y-4)}
 function frame(t){if(!paused&&!$("dialog").open&&!document.hidden)riverTime+=lastFrame?Math.min(t-lastFrame,60):0;lastFrame=t;ctx.imageSmoothingEnabled=false;rect(0,0,800,350,"#578b91");drawImg("valley",0,0,800,350);rect(0,53,800,297,"#183b449b");for(let y=0;y<4;y++)for(let x=0;x<7;x++){if(!riverTiles[y][x])continue;let [px,py]=pos(x,y);if(riverTiles[y+1]?.[x])rect(px-16,py,32,65,"#b79469");if(riverTiles[y][x+1])rect(px,py-5,110,11,"#ad9065")}
 for(let y=0;y<4;y++)for(let x=0;x<7;x++){if(!riverTiles[y][x])continue;let [px,py]=pos(x,y);rect(px-41,py-6,82,20,"#493c33");rect(px-41,py-11,82,19,"#b79065");rect(px-39,py-10,78,4,"#d5b585");rect(px-34,py,68,2,"#856c50");for(let dx of [-35,33])rect(px+dx,py-4,3,3,"#594e44")}
 caches.forEach(([x,y],i)=>{if(!s.found.includes(i))crate(...pos(x,y),true)});let [ex,ey]=pos(6,0);if(s.hero===3){rect(ex-17,ey-20,34,18,"#a87846");rect(ex-14,ey-22,28,4,"#e0bb7d")}else{drawImg(heroFile(3),ex-21,ey-54,42,56)}ctx.textAlign="center";ctx.font="bold 14px sans-serif";rect(ex-28,ey-70,56,17,"#193c3b");ctx.fillStyle="#ffdf90";ctx.fillText("接應點",ex,ey-56);
 for(let [x,y] of obstacles()){crate(...pos(x,y),false);if(!paused&&!$("dialog").open&&riverTime>grace&&y===s.y&&Math.abs(x-s.x)<.33){s.x=0;s.y=2;grace=riverTime+1300;save();notify("被木箱碰到了！已收集的標本還在，從起點再出發。")}}
 let [px,py]=pos(s.x,s.y);rect(px-18,py-2,36,6,"#4f5243");drawImg(heroFile(s.hero),px-24,py-58,48,64);if(paused){rect(0,0,800,350,"#112b36b3");ctx.fillStyle="white";ctx.font="bold 26px sans-serif";ctx.fillText("已暫停",400,180)}anim=requestAnimationFrame(frame)}
 anim=requestAnimationFrame(frame)}
function drawModel(){
 const panel=main.querySelector(".labgrid .bench:nth-child(2)"),model=document.createElement("div");
 model.className="formation "+(s.rock?"magma":"strata")+" phase"+s.model;
 model.setAttribute("aria-hidden","true");
 let layers=s.rock?15:s.model+1;
 for(let i=0;i<layers;i++){let part=document.createElement("i");if(s.rock){part.style.left=(9+i*23%80)+"%";part.style.top=(15+i*37%63)+"%";part.style.opacity=(s.model/3).toString();part.style.background=["#e8b6a0","#c8d4d3","#404b52"][i%3]}else{part.style.bottom=(i*11)+"px";part.style.background=["#ac9370","#dac498","#ad9774","#d6bd8c"][i]};model.append(part)}
 panel.querySelector("h3").after(model);
}
function drawTest(){
 const slots=main.querySelector(".slots"),result=document.createElement("div");
 slots.style.touchAction="pan-y";result.className="testview";result.setAttribute("aria-hidden","true");
 if(target){result.innerHTML=img(target)+(lastTest&&hard[tool]>hard[target]?'<i class="scratch"></i>':"")}
 if(tool){result.insertAdjacentHTML("beforeend",'<div class="tip '+(lastTest?"stroke":"")+'">'+img(tool)+'</div>')}
 if(tool||target)slots.after(result);
}
function setupChute(){
 const track=main.querySelector(".belt"),cargo=main.querySelector(".cargo");
 track.classList.toggle("rolling",!paused);cargo.style.touchAction="none";cargo.tabIndex=0;
 cargo.setAttribute("aria-label","標本貨箱，可拖到下方展櫃或直接點選展櫃");
 let start=null;
 cargo.onpointerdown=e=>{if(paused)return;start=[e.clientX,e.clientY];cargo.setPointerCapture(e.pointerId)};
 cargo.onpointermove=e=>{if(!start)return;cargo.style.translate=(e.clientX-start[0])+"px "+(e.clientY-start[1])+"px";cargo.style.opacity=".8";track.style.overflow="visible"};
 cargo.onpointercancel=()=>{start=null;cargo.style.translate="";cargo.style.opacity="";track.style.overflow=""};
 cargo.onpointerup=e=>{if(!start)return;cargo.style.pointerEvents="none";let chute=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-do^="send-"]');cargo.style.pointerEvents="";cargo.onpointercancel();if(chute)action(chute.dataset.do)};
}
// Save the completed run before the entrance animation so a reload can resume at the museum.
function celebrateVictory() {
 const overlay = $("victory");
 if (overlay.open) return;
 s.stage = 5;
 save();
 clearInterval(runTimer);
 clearTimeout(toastTimer);
 $("notice").textContent = "";
 const fragments = Array.from({length:64}, (_,i)=>{
   const x = (i * 37 + 7) % 101;
   return '<i style="--x:'+x+'%;--drift:'+((i%7-3)*16)+'px;--delay:'+((i%13)*0.085-1.1)+'s;--speed:'+(2.4+i%6*.24)+'s;--hue:'+["#ffe07b","#9af4dc","#ff977a","#d6b5ff"][i%4]+'"></i>';
 }).join("");
 const team = people.map((person,i)=>'<span style="--i:'+i+'">'+hero(i)+'</span>').join("");
 overlay.innerHTML = '<div class="victory-rays" aria-hidden="true"></div><div class="victory-confetti" aria-hidden="true">'+fragments+'</div>'+
   '<div class="victory-poster"><div class="victory-name">六年甲班岩礦救援隊</div>'+
   '<div class="victory-medal" aria-hidden="true">'+img("quartz")+'</div>'+
   '<h1 id="victory-title">過關</h1><p class="victory-message">七箱標本，全數歸位！</p>'+
   '<div class="victory-team" aria-hidden="true">'+team+'</div>'+
   '<p id="victory-next">即將進入岩礦博物館</p><div class="victory-progress" aria-hidden="true"><i></i></div></div>';
 overlay.oncancel = event=>event.preventDefault();
 overlay.showModal();
 tone(880);
 window.setTimeout(()=>{
   overlay.close();
   overlay.replaceChildren();
   go(5);
   const heading = main.querySelector("h1");
   heading.tabIndex = -1;
   heading.focus({preventScroll:true});
 },5000);
}
render();
