/* Original, locally drawn geology specimens for the Yuli exhibition. */
(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const DEG = Math.PI / 180;
  const cache = new Map();
  const definitions = {
    limestone: ['stone', '#c7c5b6', 1.16, .72, .83],
    shale: ['layer', '#695e59', 1.24, .54, .84],
    sandstone: ['stone', '#bf946e', 1.18, .72, .82],
    andesite: ['stone', '#868884', 1.11, .85, .80],
    basalt: ['stone', '#515660', 1.04, .85, .88],
    granite: ['stone', '#ceac94', 1.17, .78, .85],
    marble: ['stone', '#e1e0d9', 1.10, .80, .85],
    slate: ['layer', '#687783', 1.27, .46, .78],
    gneiss: ['stone', '#c7b9a5', 1.23, .72, .83],
    talc: ['layer', '#b4c6ae', 1.10, .63, .80],
    calcite: ['rhombs', '#e5cfac'],
    quartz: ['quartz', '#dce7e8'],
    feldspar: ['blocks', '#dda694'],
    mica: ['books', '#69564c'],
    gypsum: ['blades', '#e4dfcf'],
    graphite: ['layer', '#606775', 1.14, .56, .78],
    sulfur: ['sulfur', '#f0c33e']
  };

  function hash(x,y,z,seed) {
    let n = Math.imul(x,374761393) + Math.imul(y,668265263) + Math.imul(z,144269) + seed;
    n = Math.imul(n ^ (n >>> 13),1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  const lerp = (a,b,f) => a + (b-a)*f;
  function noise(x,y,z,seed) {
    const i=Math.floor(x), j=Math.floor(y), k=Math.floor(z);
    const smooth = t => t*t*(3-2*t);
    const u=smooth(x-i), v=smooth(y-j), w=smooth(z-k);
    const plane = l => lerp(
      lerp(hash(i,j,l,seed),hash(i+1,j,l,seed),u),
      lerp(hash(i,j+1,l,seed),hash(i+1,j+1,l,seed),u),v);
    return lerp(plane(k),plane(k+1),w);
  }
  const rgb = str => [1,3,5].map(i=>parseInt(str.slice(i,i+2),16));
  const diff = (p,q) => p.map((v,i)=>v-q[i]);
  const dot = (p,q) => p.reduce((s,v,i)=>s+v*q[i],0);
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const length = v => Math.hypot(...v);
  const avg = points => [0,1,2].map(i=>points.reduce((s,p)=>s+p[i],0)/points.length);

  function buildModel(id) {
    const [kind,hex,sx,sy,sz]=definitions[id];
    const seed=1923+Object.keys(definitions).indexOf(id)*171;
    let n=0;
    const random=()=>hash(++n,0,0,seed);
    const faces=[];
    function face(a,b,c,center,variation=0) {
      const normal=cross(diff(b,a),diff(c,a)), len=length(normal);
      if (len<.00001) return;
      const direction=dot(normal,diff(a,center))<0?-1:1;
      faces.push({p:[a,b,c], normal:normal.map(v=>v*direction/len), variation});
    }
    function shell(rings,center) {
      const first=rings[0], last=rings[rings.length-1];
      const low=avg(first),high=avg(last);
      for(let j=0;j<first.length;j++) {
        const k=(j+1)%first.length;
        face(low,first[k],first[j],center);
        face(high,last[j],last[k],center);
        for(let i=0;i<rings.length-1;i++) {
          const a=rings[i][j], b=rings[i][k], c=rings[i+1][k], d=rings[i+1][j];
          const variation=(random()-.5)*.045;
          face(a,b,c,center,variation); face(a,c,d,center,variation);
        }
      }
    }
    function pebble() {
      const flake=kind==='layer', count=flake?9:10;
      const heights=flake?[-.91,-.84,-.53,-.40,-.19,-.05,.29,.39,.65,.79]:[-.83,-.51,.04,.55,.82];
      const radii=flake?[.72,.86,.93,.85,.99,.92,.99,.91,.82,.70]:[.63,.94,1.02,.89,.63];
      const outline=Array.from({length:count},(_,i)=>({a:TAU*(i+random()*.42)/count,r:.86+random()*.23,tip:random()-.5}));
      const rings=heights.map((h,index)=>outline.map(({a,r,tip})=>{
        const angle=a+(flake?0:(random()-.5)*.15);
        const radial=r*(radii[index]+(random()-.5)*(flake?.055:.12));
        const x=Math.cos(angle)*sx*radial+h*.09;
        const z=Math.sin(angle)*sz*radial;
        return [x,h*sy+tip*(flake?.13:.24)+x*.08+(random()-.5)*(flake?.018:.065),z];
      }));
      shell(rings,[0,0,0]);
    }
    // Build a closed, faceted crystal around an independent local origin.
    function prism(cx,cy,cz,radius,height,sides,options={}) {
      const {skew=0,tip=0,flat=1,lean=0,spin=0,oblique=false}=options;
      function ring(y,scale,shift=0) {
        return Array.from({length:sides},(_,i)=>{
          const a=TAU*i/sides+spin;
          const x=Math.cos(a)*radius*scale, z=Math.sin(a)*radius*scale*flat;
          return [cx+x+y*lean+shift,cy+y+(oblique?x*.16+z*.20:0),cz+z+y*skew];
        });
      }
      const bipyramid=kind==='sulfur';
      const lower=ring(-height*.5,bipyramid?.18:.91);
      const waist=ring(bipyramid?-.03*height:height*.45-tip*height*.28,1);
      const upper=ring(height*.5,tip?1-tip:1);
      shell([lower,waist,upper],[cx,cy,cz]);
    }
    if(kind==='stone'||kind==='layer') pebble();
    else if(kind==='quartz'){
      [[-.58,-.18,-.10,.35,1.30,-.20],[.12,.15,-.28,.44,1.80,.03],[.65,-.22,.10,.29,1.22,.22],[-.17,-.32,.38,.34,1.10,-.12]].forEach(([x,y,z,r,h,l],i)=>prism(x,y,z,r,h,6,{tip:.98,lean:l,spin:i*.37}));
    } else if(kind==='rhombs'||kind==='blocks'){
      const feld=kind==='blocks';
      [[-.37,-.07,.07,.65,.76],[.39,.18,-.16,.66,.88],[.20,-.27,.40,.50,.52]].forEach(([x,y,z,r,h],i)=>prism(x,y,z,r,h*(feld?1.45:1),4,{spin:.67+i*.16,flat:.94,lean:feld?.10:.36,skew:feld?.02:.19,oblique:true}));
    } else if(kind==='books'){
      for(let i=0;i<12;i++) prism(Math.sin(i)*.032,-.45+i*.079,Math.cos(i)*.022,1.00-i*.014,.09,6,{flat:.79,spin:.25+Math.sin(i*1.8)*.038,oblique:true});
    } else if(kind==='blades'){
      for(let i=0;i<7;i++) prism((i-3)*.22,-.08+Math.sin(i)*.12,(random()-.5)*.62,.31,1.24+random()*.46,4,{flat:.45,spin:i*.76,lean:(i-3)*.115,tip:.27,skew:(random()-.5)*.30});
    } else {
      [[0,.13,-.19,.68,1.52],[-.57,-.21,.05,.42,.95],[.52,-.10,.05,.49,1.0],[-.06,-.32,.38,.46,.86]].forEach(([x,y,z,r,h],i)=>prism(x,y,z,r,h,6,{tip:.94,flat:.91,lean:(i-1)*.12,spin:i*.64}));
    }
    const points=faces.flatMap(f=>f.p);
    const min=axis=>Math.min(...points.map(p=>p[axis]));
    const max=axis=>Math.max(...points.map(p=>p[axis]));
    const center=[0,1,2].map(axis=>(min(axis)+max(axis))/2);
    const radius=Math.max(...points.map(p=>length(diff(p,center))));
    const model={faces,center,radius,seed,base:rgb(hex),id};
    bakeTexture(model);
    return model;
  }

  // The material is sampled in specimen coordinates, so veins and grains remain
  // fixed to the surface and line up across its triangulated faces.
  const palettes={
    light:[231,220,200], pink:[211,155,137], quartz:[171,170,166], black:[64,64,68],
    marble:[117,129,128], darkband:[74,72,77], anorthite:[192,195,178], pore:[57,60,65]
  };
  function material(model,x,y,z) {
    const {id,seed,base}=model;
    const fine=hash(Math.floor(x*118),Math.floor(y*118),Math.floor(z*118),seed);
    const rough=noise(x*5,y*5,z*5,seed);
    const grain=noise(x*22,y*22,z*22,seed+5);
    let mix=base, weight=0, adjustment=(fine-.5)*13+(rough-.5)*23;
    const layer=y-x*.11+z*.13;
    switch(id) {
      case 'granite': {
        // Interlocking patches of feldspar, quartz and dark mica.
        const g=noise(x*12+rough,y*12,z*12,seed+91);
        mix=g>.63?palettes.black:g>.51?palettes.quartz:g>.38?palettes.pink:palettes.light;
        weight=.93; adjustment+=(grain-.5)*38; break;
      }
      case 'marble': {
        const vein=Math.abs(Math.sin(x*3.8+y*4.3+z*2+rough*2.6));
        mix=palettes.marble; weight=vein<.14?.64:vein<.29?.20:0; break;
      }
      case 'gneiss': {
        const stripe=Math.sin(layer*31+Math.sin(x*3+z)*2.2+rough*2.5);
        mix=palettes.darkband; weight=Math.max(0,stripe)*.88; adjustment+=(grain-.5)*59; break;
      }
      case 'andesite': mix=grain>.61?palettes.anorthite:palettes.black; weight=grain>.61?.77:grain<.28?.54:.03; break;
      case 'basalt': mix=palettes.pore; weight=rough>.64?.53:.16; adjustment+=(grain-.5)*17; break;
      case 'shale': case 'slate': case 'graphite': case 'mica': {
        const bedding=id==='mica'?y-x*.16-z*.20:layer;
        adjustment+=Math.sin(bedding*(id==='mica'?145:89)+rough*1.7)*9+(grain-.5)*12;
        if(id==='graphite'||id==='mica') adjustment+=fine>.92?29:0;
        break;
      }
      case 'sandstone': adjustment+=(fine-.5)*33+Math.sin(layer*22+rough*2)*6;break;
      case 'limestone': adjustment+=(grain-.5)*12; break;
      case 'talc': adjustment+=Math.sin(layer*41+rough*5)*7;break;
      case 'feldspar': adjustment+=Math.sin((x-y*.10)*68+z*11)*3;break;
      case 'gypsum': adjustment+=Math.sin(x*118+z*24+y*.5)*8;break;
      case 'quartz': adjustment=(rough-.5)*12+(fine-.5)*5+Math.max(0,.33-Math.abs(y)) *18;break;
      case 'calcite': adjustment=(rough-.5)*14+Math.sin((y-x*.16-z*.20)*51)*4;break;
      case 'sulfur': adjustment+=(grain-.5)*14;break;
    }
    return [0,1,2].map(i=>lerp(base[i],mix[i],weight)+adjustment);
  }
  function bakeTexture(model) {
    const tile=28, pad=2, edge=tile-2*pad, cols=12;
    const atlas=document.createElement('canvas');
    atlas.width=tile*cols;atlas.height=tile*Math.ceil(model.faces.length/cols);
    const ctx=atlas.getContext('2d'), data=ctx.createImageData(atlas.width,atlas.height);
    model.faces.forEach((face,i)=>{
      const [a,b,c]=face.p, ox=(i%cols)*tile, oy=Math.floor(i/cols)*tile;
      face.uv=[ox,oy]; const ab=diff(b,a),ac=diff(c,a);
      for(let py=0;py<tile;py++)for(let px=0;px<tile;px++){
        if(px+py>tile+3) continue;
        const u=(px-pad)/edge, v=(py-pad)/edge;
        const col=material(model,a[0]+u*ab[0]+v*ac[0],a[1]+u*ab[1]+v*ac[1],a[2]+u*ab[2]+v*ac[2]);
        const off=4*((oy+py)*atlas.width+ox+px);
        for(let j=0;j<3;j++) data.data[off+j]=col[j];
        data.data[off+3]=255;
      }
    });
    ctx.putImageData(data,0,0);Object.assign(model,{atlas,tile,pad,edge});
  }
  function getModel(id) {
    if(!Object.hasOwn(definitions,id)) throw new RangeError('Unknown specimen: '+id);
    if(!cache.has(id)) cache.set(id,buildModel(id));
    return cache.get(id);
  }
  function paint(canvas,id,angle,tilt=.30) {
    const model=getModel(id);
    const rect=canvas.getBoundingClientRect();
    const ratio=Math.min(window.devicePixelRatio||1,2);
    // Detached gallery thumbnails can set their canvas bitmap size directly.
    const width=rect.width>0?Math.max(1,Math.round(rect.width*ratio)):canvas.width;
    const height=rect.height>0?Math.max(1,Math.round(rect.height*ratio)):canvas.height;
    if(canvas.width!==width) canvas.width=width;
    if(canvas.height!==height) canvas.height=height;
    const ctx=canvas.getContext('2d');
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);
    const az=(angle-16)*DEG, ca=Math.cos(az),sa=Math.sin(az),ct=Math.cos(tilt),st=Math.sin(tilt);
    const scale=Math.min(width*.46,height*.48)/model.radius, ox=width*.50,oy=height*.50;
    const rotate=([x,y,z])=>{
      const rz=-x*sa+z*ca;
      return [x*ca+z*sa,y*ct-rz*st,y*st+rz*ct];
    };
    const items=[];
    for(const face of model.faces) {
      const n=rotate(face.normal); if(n[2]<=.0001) continue;
      const vertices=face.p.map(p=>rotate(diff(p,model.center)));
      const xy=vertices.map(p=>[ox+p[0]*scale,oy-p[1]*scale]);
      const depth=vertices.reduce((sum,p)=>sum+p[2],0)/3;
      const diffuse=Math.max(0,dot(n,[-.43,.73,.54]));
      const spec=Math.max(0,dot(n,[-.23,.40,.887]));
      const gloss=['mica','graphite','quartz','gypsum','calcite'].includes(id)?.30:.085;
      items.push({face,xy,depth,shade:.29-.37*diffuse-face.variation-gloss*Math.pow(spec,18)});
    }
    items.sort((a,b)=>a.depth-b.depth);
    const {atlas,tile,edge,pad}=model;
    for(const {face,xy,shade} of items) {
      const [a,b,c]=xy, centroid=avg(xy.map(([x,y])=>[x,y,0]));
      // Sub-pixel overlap keeps the joins closed at every device pixel ratio.
      const path=new Path2D();
      xy.forEach((p,i)=>{
        const dx=p[0]-centroid[0],dy=p[1]-centroid[1],r=Math.max(1,Math.hypot(dx,dy));
        const x=p[0]+dx/r*.72, y=p[1]+dy/r*.72;
        if(i) path.lineTo(x,y);else path.moveTo(x,y);
      });
      path.closePath();ctx.save();ctx.clip(path);
      const ax=(b[0]-a[0])/edge,ay=(b[1]-a[1])/edge,bx=(c[0]-a[0])/edge,by=(c[1]-a[1])/edge;
      ctx.setTransform(ax,ay,bx,by,a[0]-pad*(ax+bx),a[1]-pad*(ay+by));
      ctx.drawImage(atlas,face.uv[0],face.uv[1],tile,tile,0,0,tile,tile);
      ctx.setTransform(1,0,0,1,0,0);
      ctx.fillStyle=shade>=0?'rgba(15,24,39,'+shade+')':'rgba(255,250,232,'+-shade+')';
      ctx.fill(path);ctx.restore();
    }
  }
  window.drawSpecimen=(canvas,id,angleDegrees=0)=>paint(canvas,id,Number(angleDegrees)||0);
  window.mountTurntable=function(canvas,id,angleDegrees=0,onAngleChange) {
    let angle=Number(angleDegrees)||0,tilt=.30,drag=null,frame=0,closed=false;
    const oldTouch=canvas.style.touchAction, oldCursor=canvas.style.cursor;
    canvas.style.touchAction='none';canvas.style.cursor='grab';
    const redraw=()=>{
      if(!frame&&!closed)frame=requestAnimationFrame(()=>{frame=0;if(!closed)paint(canvas,id,angle,tilt);});
    };
    function rotateBy(degrees) {
      angle=((angle+(Number(degrees)||0))%360+360)%360;
      redraw();if(typeof onAngleChange==='function')onAngleChange(angle);
    }
    function down(e) {
      if(drag||e.button!==0)return;
      drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor='grabbing';
    }
    function move(e) {
      if(!drag||e.pointerId!==drag.id)return;
      const unit=220/Math.max(120,canvas.getBoundingClientRect().width);
      tilt=Math.max(-.95,Math.min(1.1,tilt+(e.clientY-drag.y)*unit*DEG));
      rotateBy((e.clientX-drag.x)*unit);
      drag.x=e.clientX;drag.y=e.clientY;
    }
    function end(e) {if(drag&&drag.id===e.pointerId){drag=null;canvas.style.cursor='grab';}}
    const events={pointerdown:down,pointermove:move,pointerup:end,pointercancel:end,lostpointercapture:end};
    for(const [name,cb] of Object.entries(events))canvas.addEventListener(name,cb);
    const observer=typeof ResizeObserver==='function'?new ResizeObserver(redraw):null;
    if(observer)observer.observe(canvas);else window.addEventListener('resize',redraw);
    paint(canvas,id,angle,tilt);
    return {rotateBy,destroy(){
      closed=true;cancelAnimationFrame(frame);
      for(const [name,cb] of Object.entries(events))canvas.removeEventListener(name,cb);
      if(drag&&canvas.hasPointerCapture(drag.id))canvas.releasePointerCapture(drag.id);
      if(observer)observer.disconnect();else window.removeEventListener('resize',redraw);
      canvas.style.touchAction=oldTouch;canvas.style.cursor=oldCursor;
    }};
  };
})();
