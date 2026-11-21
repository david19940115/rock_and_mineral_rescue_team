"use strict";

const exhibitGroups = ["沉積岩", "火成岩", "變質岩", "礦物"];
const transformations = [
  { from: "limestone", to: "marble", change: "石灰岩中的方解石重新結晶，形成互相嵌合的晶粒。" },
  { from: "shale", to: "slate", change: "頁岩在低度變質時，細小的片狀礦物逐漸定向排列，形成容易沿平面劈開的板岩。" },
  { from: "granite", to: "gneiss", change: "花崗岩經過變質與變形，礦物可重新排列，形成帶有片麻狀構造的花崗片麻岩。" }
];
let museumViewer = null;

function closeMuseumViewer() {
  if (museumViewer) museumViewer.destroy();
  museumViewer = null;
}

function resetMuseum() {
  closeMuseumViewer();
}

function museumRecord() {
  if (!s.museum) s.museum = { selected: "limestone", angle: 0 };
  if (!Object.hasOwn(exhibits, s.museum.selected)) s.museum.selected = "limestone";
  return s.museum;
}

function exhibitButton(action, value, label, active = false) {
  return '<button data-museum="'+action+'" data-value="'+value+'" aria-pressed="'+active+'" class="'+(active?"current":"")+'">'+label+'</button>';
}

function specimenRail(group, selected) {
  return Object.entries(exhibits).filter(([,e])=>e.group===group).map(([id,e])=>{
    const tile='<canvas class="cabinet-thumb" data-specimen="'+id+'" width="96" height="68" aria-hidden="true"></canvas><span>'+e.name+'</span>';
    return exhibitButton("select", id, tile, id===selected);
  }).join("");
}

function compareLabel(id) {
  return '<canvas class="cabinet-thumb" data-specimen="'+id+'" width="96" height="68" aria-hidden="true"></canvas><span>'+exhibits[id].name+'</span>';
}

function parentGallery(selected) {
  const pairs = transformations.map(pair=>{
    const active = selected===pair.from || selected===pair.to;
    return '<article class="pair-card'+(active?" related":"")+'"><div class="pair-buttons">'+
      exhibitButton("select",pair.from,compareLabel(pair.from),selected===pair.from)+
      '<span aria-label="變質成">→</span>'+
      exhibitButton("select",pair.to,compareLabel(pair.to),selected===pair.to)+
      '</div><p>'+pair.change+'</p></article>';
  }).join("");
  return '<section class="parent-gallery"><h2>變質前後對照</h2><p>原岩在固態下受熱或受壓，礦物和構造可能改變。點一件標本，到觀察臺比較。</p><div class="pair-grid">'+pairs+'</div></section>';
}

function museumScreen() {
  const record = museumRecord();
  const id = record.selected, exhibit = exhibits[id], group = exhibit.group;
  const index = Object.keys(exhibits).indexOf(id)+1;
  const count = Object.keys(exhibits).length;
  const categories = exhibitGroups.map(g=>exhibitButton("group",g,g,group===g)).join("");
  const hardness = exhibit.hardness ? '<div class="hardness"><span>摩氏硬度</span><strong>'+exhibit.hardness+'</strong><small>數值越大，越能抵抗刻劃。</small></div>' :
    '<p class="rock-hardness">岩石由一種或多種礦物組成。不同顆粒的硬度可能不同，這裡列出礦物各自的摩氏硬度。</p>';
  return '<div class="museum-intro">'+talk(8,"博物館開館了！挑一件標本，用手指轉一圈，再到變質前後對照區找它的親戚。")+
    '</div><div class="museum-toolbar"><div role="group" aria-label="展區" class="museum-tabs">'+categories+
    '</div><span class="catalog-count">'+count+' 件館藏</span></div>'+
    '<div class="museum-grid"><aside class="specimen-rail" aria-label="展櫃中的標本">'+specimenRail(group,id)+'</aside>'+
    '<div class="museum-display"><div class="display-meta"><span>'+group+'展櫃</span><span>館藏 '+String(index).padStart(2,"0")+'</span></div>'+
    '<canvas id="museum-turntable" width="560" height="340" aria-label="'+exhibit.name+'的可旋轉立體示意模型"></canvas>'+
    '<div class="turn-controls"><button data-museum="left" aria-label="向左轉動四十五度">↶ 左轉</button><output id="view-angle">'+Math.round(record.angle)+'°</output><button data-museum="right" aria-label="向右轉動四十五度">右轉 ↷</button></div>'+
    '<p class="view-caption">左右拖曳觀察立體示意模型</p></div>'+
    '<article class="exhibit-label"><span class="eyebrow">館藏標本</span><h2>'+exhibit.name+'</h2><h3>外觀與特色</h3><p>'+exhibit.look+
    '</p><h3>生活與用途</h3><p>'+exhibit.use+'</p>'+hardness+'</article></div>'+
    parentGallery(id)+'<div class="museum-exit">'+btn("results","查看救援成績")+btn("soil","前往"+labels[6])+btn("race","挑戰輸送帶競速")+'</div>';
}

const museumThumbnails = new Map();
function openMuseumViewer() {
  const record = museumRecord();
  museumViewer = mountTurntable($("museum-turntable"),record.selected,record.angle,(degrees)=>{
    record.angle = ((degrees%360)+360)%360;
    $("view-angle").textContent = Math.round(record.angle)%360+"°";
  });
  main.querySelectorAll(".cabinet-thumb").forEach(canvas=>{
    const id = canvas.dataset.specimen;
    if (!museumThumbnails.has(id)) {
      const image = document.createElement("canvas");
      image.width=96; image.height=68;
      drawSpecimen(image,id,15);
      museumThumbnails.set(id,image);
    }
    canvas.getContext("2d").drawImage(museumThumbnails.get(id),0,0,canvas.width,canvas.height);
  });
}

document.addEventListener("click", event=>{
  const button = event.target.closest("[data-museum]");
  if (!button || !museumViewer) return;
  const {museum:action,value} = button.dataset;
  if (action==="left" || action==="right") {
    museumViewer.rotateBy(action==="left"?-45:45);
    save();
    return;
  }
  const record = museumRecord();
  const id = action==="group" ? Object.keys(exhibits).find(id=>exhibits[id].group===value) : value;
  const fromPair = !!button.closest(".parent-gallery");
  if (id!==record.selected) {
    record.selected=id;
    record.angle=0;
    save();
    render();
  }
  if (fromPair) main.querySelector(".museum-toolbar").scrollIntoView({block:"start"});
  const groupButton = action==="group";
  const focusTarget = groupButton ? '.museum-tabs [aria-pressed="true"]' : '.specimen-rail [aria-pressed="true"]';
  main.querySelector(focusTarget)?.focus({preventScroll:true});
});
