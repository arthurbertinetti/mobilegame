// === Garden canvas render + UI + events — extracted from farmvalley.html ===
// Loaded AFTER js/sprites.js (uses _gTileBase, _gTileObj, _gCloud, _gZoom, _gNight, etc.).

function renderGardenCanvas(){
  var cv=$('garden-canvas');if(!cv)return;
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  // Sky (day/night)
  var bg=ctx.createLinearGradient(0,0,0,H);
  if(_gNight){
    bg.addColorStop(0,'#0a1838');bg.addColorStop(.4,'#1a2858');
    bg.addColorStop(.6,'#2a3868');bg.addColorStop(1,'#1c5028');
  }else{
    bg.addColorStop(0,'#5ab4e8');bg.addColorStop(0.35,'#a0cde8');
    bg.addColorStop(0.55,'#d0edb8');bg.addColorStop(1,'#a8d078');
  }
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  // Sun or Moon
  var sunX=W*.8,sunY=H*.09;
  if(_gNight){
    // Stars
    ctx.fillStyle='#fff';
    for(var st=0;st<28;st++){
      var sx=(st*73+13)%W,sy=((st*47+5)%Math.floor(H*.45));
      var sr=.6+(st%4)*.3;
      ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fill();
    }
    // Moon
    ctx.fillStyle='rgba(245,245,210,.95)';
    ctx.beginPath();ctx.arc(sunX,sunY,28,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(180,180,150,.5)';
    ctx.beginPath();ctx.arc(sunX-8,sunY-3,5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(sunX+5,sunY+8,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(sunX-3,sunY+10,2,0,Math.PI*2);ctx.fill();
    // Halo
    var mg=ctx.createRadialGradient(sunX,sunY,28,sunX,sunY,52);
    mg.addColorStop(0,'rgba(245,245,210,.3)');mg.addColorStop(1,'rgba(245,245,210,0)');
    ctx.fillStyle=mg;ctx.beginPath();ctx.arc(sunX,sunY,52,0,Math.PI*2);ctx.fill();
  }else{
    var sg=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,36);
    sg.addColorStop(0,'rgba(255,252,140,.98)');sg.addColorStop(.45,'rgba(255,225,50,.65)');sg.addColorStop(1,'rgba(255,200,0,0)');
    ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sunX,sunY,36,0,Math.PI*2);ctx.fill();
    _gCloud(ctx,W*.14,H*.08,1.05);_gCloud(ctx,W*.5,H*.04,0.82);_gCloud(ctx,W*.76,H*.13,0.65);
  }
  // Tiles (stable sort: depth ascending, then r ascending for tie-break)
  var tiles=[];
  for(var ri=0;ri<GARDEN_SIZE;ri++)for(var ci=0;ci<GARDEN_SIZE;ci++)tiles.push({c:ci,r:ri,d:ci+ri});
  tiles.sort(function(a,b){if(a.d!==b.d)return a.d-b.d;return a.r-b.r;});
  tiles.forEach(function(t){
    var idx=t.r*GARDEN_SIZE+t.c,g=state.gardenGrid[idx];
    var catId=g?getGardenCatId(g.id):null;
    var hov=t.c===_gHoverC&&t.r===_gHoverR;
    var sel=gardenMode==='move'&&gardenMoveSrc===idx;
    _gTileBase(ctx,t.c,t.r,hov,sel);
    if(g){_gTileObj(ctx,t.c,t.r,catId,g.id,g.stateIdx||0,hov);}
  });
  // Night overlay (semi-transparent dark blue)
  if(_gNight){
    ctx.fillStyle='rgba(20,30,80,0.28)';
    ctx.fillRect(0,0,W,H);
    // Re-render glowing lights on top of overlay so they "pop"
    tiles.forEach(function(t){
      var idx=t.r*GARDEN_SIZE+t.c,g=state.gardenGrid[idx];
      if(!g)return;
      if(g.id==='phare'||g.id==='lampadaire'){
        var p=_isoPos(t.c,t.r),s=Math.max(_IW/38,.3);
        var oh=Math.max((_ITEM_H[g.id]||1.5)*_ID,3);
        var lx=p.x,ly=p.y-oh*.7;
        if(g.id==='lampadaire')lx=p.x+_IW*.13;
        var lg=ctx.createRadialGradient(lx,ly,0,lx,ly,s*22);
        lg.addColorStop(0,'rgba(255,240,150,.85)');
        lg.addColorStop(.5,'rgba(255,220,80,.4)');
        lg.addColorStop(1,'rgba(255,200,0,0)');
        ctx.fillStyle=lg;
        ctx.beginPath();ctx.arc(lx,ly,s*22,0,Math.PI*2);ctx.fill();
      }
    });
  }
  _gZoomUI(ctx,W);
  _gTimeUI(ctx,W);
  ctx.font='10px sans-serif';ctx.fillStyle=_gNight?'rgba(255,255,255,.4)':'rgba(0,0,0,.25)';ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.fillText('⟵ Glisser · ⊕ Pincer/molette pour zoomer ⟶',W/2,H-3);
}
function _gTimeUI(ctx,W){
  var bx=W-10,by=14+28*2+14,bw=30,bh=28,br=7;
  ctx.beginPath();ctx.moveTo(bx-bw+br,by);ctx.lineTo(bx-br,by);ctx.arcTo(bx,by,bx,by+br,br);
  ctx.lineTo(bx,by+bh-br);ctx.arcTo(bx,by+bh,bx-br,by+bh,br);
  ctx.lineTo(bx-bw+br,by+bh);ctx.arcTo(bx-bw,by+bh,bx-bw,by+bh-br,br);
  ctx.lineTo(bx-bw,by+br);ctx.arcTo(bx-bw,by,bx-bw+br,by,br);ctx.closePath();
  var g=ctx.createLinearGradient(bx-bw,by,bx-bw,by+bh);
  if(_gNight){g.addColorStop(0,'rgba(40,55,100,.96)');g.addColorStop(1,'rgba(20,35,75,.92)');}
  else{g.addColorStop(0,'rgba(255,255,255,.96)');g.addColorStop(1,'rgba(215,225,215,.92)');}
  ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1;ctx.stroke();
  ctx.font='16px serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle=_gNight?'#fff':'#222';
  ctx.fillText(_gNight?'🌙':'☀️',bx-bw/2,by+bh/2+1);
}
function _gZoomUI(ctx,W){
  var bx=W-10,by=14,bw=30,bh=28,br=7;
  function rrect(x,y,w,h,r2){
    ctx.beginPath();ctx.moveTo(x+r2,y);ctx.lineTo(x+w-r2,y);ctx.arcTo(x+w,y,x+w,y+r2,r2);
    ctx.lineTo(x+w,y+h-r2);ctx.arcTo(x+w,y+h,x+w-r2,y+h,r2);
    ctx.lineTo(x+r2,y+h);ctx.arcTo(x,y+h,x,y+h-r2,r2);
    ctx.lineTo(x,y+r2);ctx.arcTo(x,y,x+r2,y,r2);ctx.closePath();
  }
  rrect(bx-bw,by,bw,bh,br);
  var g1=ctx.createLinearGradient(bx-bw,by,bx-bw,by+bh);
  g1.addColorStop(0,'rgba(255,255,255,.96)');g1.addColorStop(1,'rgba(215,225,215,.92)');
  ctx.fillStyle=g1;ctx.fill();ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#223';ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('+',bx-bw/2,by+bh/2);
  rrect(bx-bw,by+bh+6,bw,bh,br);
  var g2=ctx.createLinearGradient(bx-bw,by+bh+6,bx-bw,by+bh*2+6);
  g2.addColorStop(0,'rgba(255,255,255,.96)');g2.addColorStop(1,'rgba(215,225,215,.92)');
  ctx.fillStyle=g2;ctx.fill();ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#223';ctx.font='bold 22px sans-serif';
  ctx.fillText('−',bx-bw/2,by+bh+6+bh/2);
  ctx.font='9px sans-serif';ctx.fillStyle='rgba(0,0,0,.45)';ctx.textBaseline='top';
  ctx.fillText(Math.round(_gZoom*100)+'%',bx-bw/2,by+bh*2+10);
}
function _gZoomHit(px,py,W){
  var bx=W-10,by=14,bw=30,bh=28;
  if(px>=bx-bw&&px<=bx){
    if(py>=by&&py<=by+bh){_gZoom=Math.min(_gZMax,+((_gZoom+.2).toFixed(2)));_gUpdISO();renderGardenCanvas();return true;}
    if(py>=by+bh+6&&py<=by+bh*2+6){_gZoom=Math.max(_gZMin,+((_gZoom-.2).toFixed(2)));_gUpdISO();renderGardenCanvas();return true;}
    var ty=14+bh*2+14;
    if(py>=ty&&py<=ty+bh){_gNight=!_gNight;renderGardenCanvas();return true;}
  }
  return false;
}
function _gSetupEvents(cv){
  function gp(e){var r=cv.getBoundingClientRect();return{x:(e.clientX||0)-r.left,y:(e.clientY||0)-r.top};}
  function tp(e,i){var r=cv.getBoundingClientRect(),t=e.touches[i||0];return{x:t.clientX-r.left,y:t.clientY-r.top};}
  cv.addEventListener('wheel',function(e){
    e.preventDefault();
    _gZoom=Math.max(_gZMin,Math.min(_gZMax,+(_gZoom+(e.deltaY>0?-.12:.12)).toFixed(2)));
    _gUpdISO();renderGardenCanvas();
  },{passive:false});
  cv.addEventListener('mousedown',function(e){var p=gp(e);_gMouseDown=true;_gDistMoved=0;_gDx=p.x;_gDy=p.y;cv.style.cursor='grabbing';});
  cv.addEventListener('mousemove',function(e){
    var p=gp(e);
    if(_gMouseDown){var dx=p.x-_gDx,dy=p.y-_gDy;_gDistMoved+=Math.abs(dx)+Math.abs(dy);if(_gDistMoved>4){_gOffX+=dx;_gOffY+=dy;_gDx=p.x;_gDy=p.y;renderGardenCanvas();}}
    else{var rc=_isoFromScreen(p.x,p.y);if(rc.c!==_gHoverC||rc.r!==_gHoverR){_gHoverC=rc.c;_gHoverR=rc.r;renderGardenCanvas();}}
  });
  cv.addEventListener('mouseup',function(e){
    var p=gp(e);cv.style.cursor='grab';
    if(_gDistMoved<=4){if(!_gZoomHit(p.x,p.y,cv.width)){var rc=_isoFromScreen(p.x,p.y);if(rc.c>=0&&rc.c<GARDEN_SIZE&&rc.r>=0&&rc.r<GARDEN_SIZE)onGardenClick(rc.r*GARDEN_SIZE+rc.c);}}
    _gMouseDown=false;
  });
  cv.addEventListener('mouseleave',function(){_gHoverC=-1;_gHoverR=-1;_gMouseDown=false;cv.style.cursor='grab';renderGardenCanvas();});
  cv.addEventListener('touchstart',function(e){
    if(e.touches.length===2){_gPinching=true;var dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;_gPinchDist=Math.sqrt(dx*dx+dy*dy);e.preventDefault();return;}
    var p=tp(e);_gMouseDown=true;_gDistMoved=0;_gDx=p.x;_gDy=p.y;e.preventDefault();
  },{passive:false});
  cv.addEventListener('touchmove',function(e){
    if(_gPinching&&e.touches.length===2){var dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;var dist=Math.sqrt(dx*dx+dy*dy);_gZoom=Math.max(_gZMin,Math.min(_gZMax,+(_gZoom*(dist/_gPinchDist)).toFixed(2)));_gPinchDist=dist;_gUpdISO();renderGardenCanvas();e.preventDefault();return;}
    var p=tp(e);var dx=p.x-_gDx,dy=p.y-_gDy;_gDistMoved+=Math.abs(dx)+Math.abs(dy);if(_gDistMoved>4){_gOffX+=dx;_gOffY+=dy;_gDx=p.x;_gDy=p.y;renderGardenCanvas();}e.preventDefault();
  },{passive:false});
  cv.addEventListener('touchend',function(e){
    if(_gPinching){if(e.touches.length<2)_gPinching=false;e.preventDefault();return;}
    if(_gDistMoved<=4){if(!_gZoomHit(_gDx,_gDy,cv.width)){var rc=_isoFromScreen(_gDx,_gDy);if(rc.c>=0&&rc.c<GARDEN_SIZE&&rc.r>=0&&rc.r<GARDEN_SIZE)onGardenClick(rc.r*GARDEN_SIZE+rc.c);}}
    _gMouseDown=false;e.preventDefault();
  },{passive:false});
}
