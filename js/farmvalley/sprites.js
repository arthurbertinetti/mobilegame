// === Sprites & 3D iso engine — extracted from farmvalley.html ===
// Loaded AFTER js/data-iso.js (uses GARDEN_CATS, _ITEM_H, _ITEM_COL, _CAT_COL, _ROOF_COL, _gBLDS, _gTRS, _gPLS, _gWTS, _gFlatItems, ISO_W/H/D).
// Loaded BEFORE js/garden-render.js (provides _gSprite, _gTileObj, _gTileBase, _gBox, _gSetupEvents prerequisites).

// ===== ISOMETRIC GARDEN v2 — 3D Quality =====
// (extrait dans js/data-iso.js: ISO_W / ISO_H / ISO_D)
var _gZoom=1.0,_gZMin=0.28,_gZMax=2.8;
var _IW=ISO_W,_IH=ISO_H,_ID=ISO_D;
function _gUpdISO(){_IW=Math.round(ISO_W*_gZoom);_IH=Math.round(ISO_H*_gZoom);_ID=Math.round(ISO_D*_gZoom);_gSpriteCache={};}
var _gSpriteCache={};
var _gNight=false;
// (extrait dans js/data-iso.js: _gFlatItems)
function _gGetCachedSprite(id,stateIdx,catId){
  var key=id+':'+(stateIdx||0);
  var cached=_gSpriteCache[key];
  if(cached)return cached;
  var hw=_IW/2,hh=_IH/2;
  var W=Math.max(Math.ceil(hw*4),64),H=Math.max(Math.ceil(hh*16),120);
  var off=document.createElement('canvas');
  off.width=W;off.height=H;
  var oc=off.getContext('2d');
  var ax=Math.round(W/2),ay=Math.round(H-hh*1.6);
  if(_gFlatItems.indexOf(id)<0){
    oc.save();oc.globalAlpha=0.22;
    oc.beginPath();oc.ellipse(ax,ay,hw*.66*.85,hh*.66*.78,0,0,Math.PI*2);
    oc.fillStyle='#000';oc.fill();oc.restore();
  }
  _gSprite(oc,ax,ay,hw,hh,id,catId,stateIdx);
  cached={canvas:off,ax:ax,ay:ay};
  _gSpriteCache[key]=cached;
  return cached;
}
var _gOffX=0,_gOffY=0;
var _gHoverC=-1,_gHoverR=-1;
var _gMouseDown=false,_gDx=0,_gDy=0,_gDistMoved=0;
var _gPinching=false,_gPinchDist=0;
function _isoPos(c,r){return{x:_gOffX+(c-r)*_IW/2,y:_gOffY+(c+r)*_IH/2};}
function _isoFromScreen(sx,sy){var rx=sx-_gOffX,ry=sy-_gOffY;return{c:Math.floor(rx/_IW+ry/_IH),r:Math.floor(ry/_IH-rx/_IW)};}
function _gHL(h,f){
  if(!h||h[0]!=='#')return h;
  var r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  r=Math.min(255,Math.round(r*f));g=Math.min(255,Math.round(g*f));b=Math.min(255,Math.round(b*f));
  return'#'+(r<16?'0':'')+r.toString(16)+(g<16?'0':'')+g.toString(16)+(b<16?'0':'')+b.toString(16);
}
// Item 3D object height multiplier (× _ID)
// (extrait dans js/data-iso.js: _ITEM_H)
// Item 3D object colors [top-face, left-face, right-face]
// (extrait dans js/data-iso.js: _ITEM_COL)
// (extrait dans js/data-iso.js: _CAT_COL)
function _gCloud(ctx,cx,cy,s){
  ctx.save();ctx.globalAlpha=0.7;ctx.fillStyle='rgba(255,255,255,.94)';
  var r=14*s;
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(cx-r*.72,cy+r*.32,r*.62,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(cx+r*.72,cy+r*.32,r*.62,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(cx,cy+r*.15,r*.78,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function _gBox(ctx,x,y,hw,hh,d,tC,lC,rC){
  var tg=ctx.createLinearGradient(x-hw,y-hh,x+hw,y+hh);
  tg.addColorStop(0,_gHL(tC,1.22));tg.addColorStop(1,_gHL(tC,0.86));
  ctx.beginPath();ctx.moveTo(x,y-hh);ctx.lineTo(x+hw,y);ctx.lineTo(x,y+hh);ctx.lineTo(x-hw,y);ctx.closePath();
  ctx.fillStyle=tg;ctx.fill();
  var lg=ctx.createLinearGradient(x-hw,y,x,y+hh);
  lg.addColorStop(0,_gHL(lC,1.08));lg.addColorStop(1,_gHL(lC,0.82));
  ctx.beginPath();ctx.moveTo(x-hw,y);ctx.lineTo(x,y+hh);ctx.lineTo(x,y+hh+d);ctx.lineTo(x-hw,y+d);ctx.closePath();
  ctx.fillStyle=lg;ctx.fill();
  var rg=ctx.createLinearGradient(x,y+hh,x+hw,y);
  rg.addColorStop(0,_gHL(rC,0.9));rg.addColorStop(1,_gHL(rC,1.14));
  ctx.beginPath();ctx.moveTo(x+hw,y);ctx.lineTo(x,y+hh);ctx.lineTo(x,y+hh+d);ctx.lineTo(x+hw,y+d);ctx.closePath();
  ctx.fillStyle=rg;ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=0.7;
  ctx.beginPath();ctx.moveTo(x,y-hh);ctx.lineTo(x+hw,y);ctx.lineTo(x,y+hh);ctx.lineTo(x-hw,y);ctx.closePath();ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-hw,y);ctx.lineTo(x-hw,y+d);ctx.moveTo(x+hw,y);ctx.lineTo(x+hw,y+d);ctx.moveTo(x-hw,y+d);ctx.lineTo(x,y+hh+d);ctx.lineTo(x+hw,y+d);ctx.stroke();
}
function _gTileBase(ctx,c,r,hover,sel){
  var p=_isoPos(c,r),x=p.x,y=p.y,hw=_IW/2,hh=_IH/2,d=_ID;
  var tC,lC,rC;
  if(sel){tC='#c0392b';lC='#7b241c';rC='#e74c3c';}
  else if(hover){tC='#70d040';lC='#408022';rC='#90e860';}
  else{tC='#52a428';lC='#347018';rC='#6dc43c';}
  _gBox(ctx,x,y,hw,hh,d,tC,lC,rC);
}
// ---- Roof colors per building ----
// (extrait dans js/data-iso.js: _ROOF_COL)
// ---- Sprite dispatch ----
// (extrait dans js/data-iso.js: _gBLDS / _gTRS / _gPLS / _gWTS)
function _gTileObj(ctx,c,r,catId,itemId,stateIdx,hover){
  var p=_isoPos(c,r),x=p.x,y=p.y;
  var cached=_gGetCachedSprite(itemId,stateIdx||0,catId);
  ctx.drawImage(cached.canvas,Math.round(x-cached.ax),Math.round(y-cached.ay));
  return y-_IH;
}
function _gSprite(ctx,x,y,hw,hh,id,catId,stateIdx){
  var s=Math.max(_IW/38,.3);
  var bw=hw*.66,bh=hh*.66;
  var col=_ITEM_COL[id]||_CAT_COL[catId]||['#b8a880','#786840','#d8c8a0'];
  var oh=Math.max((_ITEM_H[id]||1.5)*_ID,3);
  if(_gBLDS.indexOf(id)>=0)return _gHouseSprite(ctx,x,y,bw,bh,oh,col,id,s,stateIdx);
  if(id==='sapin')return _gFirSprite(ctx,x,y,bw,bh,oh,s);
  if(_gTRS.indexOf(id)>=0)return _gTreeSprite(ctx,x,y,bw,bh,oh,col,id,s);
  if(_gPLS.indexOf(id)>=0)return _gPlantSprite(ctx,x,y,bw,bh,oh,col,id,s);
  if(_gWTS.indexOf(id)>=0)return _gWaterSprite(ctx,x,y,bw,bh,s,id);
  if(catId==='mobilier')return _gMobSprite(ctx,x,y,bw,bh,oh,col,id,s);
  if(catId==='cloture')return _gFenceSprite(ctx,x,y,bw,bh,oh,col,id,s);
  var oy=y-bh-oh;_gBox(ctx,x,oy,bw,bh,oh,col[0],col[1],col[2]);return oy-bh;
}
// ---- Right-face parallelogram helper: u=0→back(x+bw) u=1→front(x), v=0→top v=1→bottom ----
function _gRF(ctx,x,wy,bw,bh,wh,u0,v0,u1,v1,fill,str){
  ctx.beginPath();
  ctx.moveTo(x+bw*(1-u0),wy+u0*bh+v0*wh);ctx.lineTo(x+bw*(1-u1),wy+u1*bh+v0*wh);
  ctx.lineTo(x+bw*(1-u1),wy+u1*bh+v1*wh);ctx.lineTo(x+bw*(1-u0),wy+u0*bh+v1*wh);
  ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(str){ctx.strokeStyle=str;ctx.lineWidth=0.55;ctx.stroke();}
}
// ---- Pyramid roof helper, returns peak y ----
function _gPyramid(ctx,x,wy,bw,bh,rh,rc){
  var peak=wy-bh-rh;
  ctx.beginPath();ctx.moveTo(x,wy-bh);ctx.lineTo(x-bw,wy);ctx.lineTo(x,peak);ctx.closePath();ctx.fillStyle=_gHL(rc,.76);ctx.fill();
  ctx.beginPath();ctx.moveTo(x,wy-bh);ctx.lineTo(x+bw,wy);ctx.lineTo(x,peak);ctx.closePath();ctx.fillStyle=_gHL(rc,1.06);ctx.fill();
  ctx.beginPath();ctx.moveTo(x-bw,wy);ctx.lineTo(x,wy+bh);ctx.lineTo(x,peak);ctx.closePath();ctx.fillStyle=_gHL(rc,.68);ctx.fill();
  ctx.beginPath();ctx.moveTo(x+bw,wy);ctx.lineTo(x,wy+bh);ctx.lineTo(x,peak);ctx.closePath();ctx.fillStyle=rc;ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=0.7;
  ctx.beginPath();ctx.moveTo(x-bw,wy);ctx.lineTo(x,peak);ctx.lineTo(x+bw,wy);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,wy-bh);ctx.lineTo(x,peak);ctx.moveTo(x,wy+bh);ctx.lineTo(x,peak);ctx.stroke();
  return peak;
}
// ---- Gable roof helper (ridge runs W→E, perpendicular to view) ----
function _gGableRoof(ctx,x,wy,bw,bh,rh,rc){
  var rWx=x-bw/2,rWy=wy-bh/2-rh,rEx=x+bw/2,rEy=wy+bh/2-rh;
  ctx.beginPath();ctx.moveTo(x,wy-bh);ctx.lineTo(x+bw,wy);ctx.lineTo(rEx,rEy);ctx.lineTo(rWx,rWy);ctx.closePath();
  ctx.fillStyle=_gHL(rc,.65);ctx.fill();
  ctx.beginPath();ctx.moveTo(x,wy-bh);ctx.lineTo(x-bw,wy);ctx.lineTo(rWx,rWy);ctx.closePath();
  ctx.fillStyle=_gHL(rc,.5);ctx.fill();
  var sg=ctx.createLinearGradient(x-bw,wy,x+bw/2,wy+bh/2-rh);
  sg.addColorStop(0,_gHL(rc,.78));sg.addColorStop(1,rc);
  ctx.beginPath();ctx.moveTo(x,wy+bh);ctx.lineTo(x-bw,wy);ctx.lineTo(rWx,rWy);ctx.lineTo(rEx,rEy);ctx.closePath();
  ctx.fillStyle=sg;ctx.fill();
  var eg=ctx.createLinearGradient(x,wy+bh,x+bw,wy);
  eg.addColorStop(0,_gHL(rc,1.02));eg.addColorStop(1,_gHL(rc,1.18));
  ctx.beginPath();ctx.moveTo(x+bw,wy);ctx.lineTo(x,wy+bh);ctx.lineTo(rEx,rEy);ctx.closePath();
  ctx.fillStyle=eg;ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.28)';ctx.lineWidth=0.8;
  ctx.beginPath();ctx.moveTo(rWx,rWy);ctx.lineTo(rEx,rEy);
  ctx.moveTo(x-bw,wy);ctx.lineTo(rWx,rWy);
  ctx.moveTo(x,wy+bh);ctx.lineTo(rEx,rEy);
  ctx.moveTo(x+bw,wy);ctx.lineTo(rEx,rEy);
  ctx.stroke();
  return Math.min(rWy,rEy);
}
// ---- Gambrel (barn) roof helper ----
function _gGambrelRoof(ctx,x,wy,bw,bh,rh,rc){
  var lh=rh*.42;
  var lWx=x-bw*.4,lWy=wy-bh*.4-lh,lEx=x+bw*.4,lEy=wy+bh*.4-lh;
  var rWx=x-bw*.06,rWy=wy-bh*.06-rh,rEx=x+bw*.06,rEy=wy+bh*.06-rh;
  ctx.beginPath();ctx.moveTo(x,wy-bh);ctx.lineTo(x+bw,wy);ctx.lineTo(lEx,lEy);ctx.lineTo(lWx,lWy);ctx.closePath();
  ctx.fillStyle=_gHL(rc,.6);ctx.fill();
  ctx.beginPath();ctx.moveTo(lWx,lWy);ctx.lineTo(lEx,lEy);ctx.lineTo(rEx,rEy);ctx.lineTo(rWx,rWy);ctx.closePath();
  ctx.fillStyle=_gHL(rc,.65);ctx.fill();
  ctx.beginPath();ctx.moveTo(x,wy-bh);ctx.lineTo(x-bw,wy);ctx.lineTo(lWx,lWy);ctx.lineTo(rWx,rWy);ctx.closePath();
  ctx.fillStyle=_gHL(rc,.5);ctx.fill();
  ctx.beginPath();ctx.moveTo(x,wy+bh);ctx.lineTo(x-bw,wy);ctx.lineTo(lWx,lWy);ctx.lineTo(lEx,lEy);ctx.closePath();
  ctx.fillStyle=rc;ctx.fill();
  ctx.beginPath();ctx.moveTo(lWx,lWy);ctx.lineTo(lEx,lEy);ctx.lineTo(rEx,rEy);ctx.lineTo(rWx,rWy);ctx.closePath();
  ctx.fillStyle=_gHL(rc,1.08);ctx.fill();
  ctx.beginPath();ctx.moveTo(x+bw,wy);ctx.lineTo(x,wy+bh);ctx.lineTo(lEx,lEy);ctx.lineTo(rEx,rEy);ctx.closePath();
  ctx.fillStyle=_gHL(rc,1.18);ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=0.8;
  ctx.beginPath();ctx.moveTo(rWx,rWy);ctx.lineTo(rEx,rEy);
  ctx.moveTo(x-bw,wy);ctx.lineTo(lWx,lWy);ctx.lineTo(rWx,rWy);
  ctx.moveTo(x+bw,wy);ctx.lineTo(lEx,lEy);ctx.lineTo(rEx,rEy);
  ctx.moveTo(x,wy+bh);ctx.lineTo(lEx,lEy);
  ctx.moveTo(lWx,lWy);ctx.lineTo(lEx,lEy);
  ctx.stroke();
  return Math.min(rWy,rEy);
}
// ---- Building dispatcher ----
function _gHouseSprite(ctx,x,y,bw,bh,oh,col,id,s,stateIdx){
  stateIdx=stateIdx||0;
  var topY;
  if(id==='cabane')topY=_gBCabane(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='maison')topY=_gBMaison(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='serre')topY=_gBSerre(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='grange')topY=_gBGrange(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='cafe')topY=_gBCafe(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='marche')topY=_gBMarche(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='moulin_d')topY=_gBMoulin(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='poste')topY=_gBPoste(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='phare')topY=_gBPhare(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='bibliotheque')topY=_gBBiblio(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='eglise')topY=_gBEglise(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='ecole')topY=_gBEcole(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='hotel')topY=_gBHotel(ctx,x,y,bw,bh,oh,col,s);
  else if(id==='chateau')topY=_gBChateau(ctx,x,y,bw,bh,oh,col,s);
  else{var wh=oh*.6,wy=y-bh-wh;_gBox(ctx,x,wy,bw,bh,wh,col[0],col[1],col[2]);topY=_gPyramid(ctx,x,wy,bw,bh,oh*.5,'#8B4513');}
  if(stateIdx===0)_gBConstructOverlay(ctx,x,y,bw,bh,oh,topY,s);
  else if(stateIdx>=2)_gBRenovFlair(ctx,x,topY,bw,bh,oh,stateIdx,s);
  return topY;
}
// ---- Construction overlay (state 0 = "à rénover") ----
function _gBConstructOverlay(ctx,x,y,bw,bh,oh,topY,s){
  // Semi-transparent dark haze on the building
  ctx.save();ctx.globalAlpha=0.32;
  ctx.fillStyle='#3a3a3a';
  ctx.beginPath();
  ctx.moveTo(x-bw*1.2,y-bh*.05);ctx.lineTo(x,topY-oh*.08);ctx.lineTo(x+bw*1.2,y-bh*.05);
  ctx.lineTo(x,y+bh*.5);ctx.closePath();ctx.fill();
  ctx.restore();
  // Wooden scaffolding poles
  ctx.strokeStyle='#8B5A2B';ctx.lineWidth=s*1.1;
  ctx.beginPath();ctx.moveTo(x+bw+s,y);ctx.lineTo(x+bw+s,topY+oh*.05);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-bw-s,y);ctx.lineTo(x-bw-s,topY+oh*.05);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,y+bh);ctx.lineTo(x,topY+oh*.1);ctx.stroke();
  // Horizontal scaffolding planks (3 levels)
  ctx.lineWidth=s*.8;
  for(var li=0;li<3;li++){
    var lvl=li/3+.18;
    var lyTop=topY+(y-topY)*lvl;
    ctx.beginPath();
    ctx.moveTo(x-bw-s,lyTop);ctx.lineTo(x,lyTop+bh*.6);ctx.lineTo(x+bw+s,lyTop);
    ctx.stroke();
  }
  // Yellow caution tape (zigzag)
  ctx.strokeStyle='#FFD700';ctx.lineWidth=s*.85;
  ctx.setLineDash([s*1.5,s*.8]);
  ctx.beginPath();
  ctx.moveTo(x-bw,y-oh*.4);ctx.lineTo(x,y-oh*.4+bh*.5);ctx.lineTo(x+bw,y-oh*.4);
  ctx.stroke();ctx.setLineDash([]);
  // Construction warning triangle floating above
  var sgnY=topY-s*4;
  ctx.fillStyle='#FFC107';
  ctx.beginPath();
  ctx.moveTo(x,sgnY-s*4);ctx.lineTo(x-s*3.5,sgnY+s*.5);ctx.lineTo(x+s*3.5,sgnY+s*.5);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='#000';ctx.lineWidth=s*.5;ctx.stroke();
  ctx.fillStyle='#000';
  ctx.fillRect(x-s*.3,sgnY-s*2.5,s*.6,s*1.8);
  ctx.beginPath();ctx.arc(x,sgnY-s*.1,s*.4,0,Math.PI*2);ctx.fill();
}
// ---- Renovation flair (state >= 2) ----
function _gBRenovFlair(ctx,x,topY,bw,bh,oh,stateIdx,s){
  // State 2-3: small flag
  if(stateIdx>=2){
    ctx.strokeStyle='#888';ctx.lineWidth=s*.5;
    ctx.beginPath();ctx.moveTo(x,topY);ctx.lineTo(x,topY-s*5);ctx.stroke();
    ctx.fillStyle=stateIdx>=5?'#FFD700':'#4CAF50';
    ctx.beginPath();
    ctx.moveTo(x,topY-s*5);ctx.lineTo(x+s*4,topY-s*4);ctx.lineTo(x,topY-s*3);
    ctx.closePath();ctx.fill();
  }
  // State 4+: string lights around the top edge
  if(stateIdx>=4){
    var lightCount=Math.min(stateIdx+2,8);
    for(var li=0;li<lightCount;li++){
      var la=li/(lightCount-1)*Math.PI;
      var lx=x+Math.cos(la+0.2)*bw*0.95;
      var ly=topY+Math.sin(la+0.2)*bh*0.55+s*1.5;
      var hue=(li*60)%360;
      ctx.fillStyle='hsla('+hue+',85%,65%,0.4)';
      ctx.beginPath();ctx.arc(lx,ly,s*1.4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='hsl('+hue+',85%,65%)';
      ctx.beginPath();ctx.arc(lx,ly,s*.7,0,Math.PI*2);ctx.fill();
    }
  }
  // State 6+: gold sparkles around the top
  if(stateIdx>=6){
    ctx.fillStyle='#FFD700';
    var sparkleCount=Math.min(stateIdx,8);
    for(var si=0;si<sparkleCount;si++){
      var sa=si/sparkleCount*Math.PI*2+0.5;
      var sx=x+Math.cos(sa)*bw*1.05;
      var sy=topY+Math.sin(sa)*bh*0.55-s*2;
      ctx.beginPath();
      ctx.moveTo(sx,sy-s*1.2);ctx.lineTo(sx+s*.4,sy-s*.4);
      ctx.lineTo(sx+s*1.2,sy);ctx.lineTo(sx+s*.4,sy+s*.4);
      ctx.lineTo(sx,sy+s*1.2);ctx.lineTo(sx-s*.4,sy+s*.4);
      ctx.lineTo(sx-s*1.2,sy);ctx.lineTo(sx-s*.4,sy-s*.4);
      ctx.closePath();ctx.fill();
    }
  }
  // State 8+: golden crown with gems
  if(stateIdx>=8){
    ctx.fillStyle='#FFD700';
    ctx.beginPath();
    ctx.moveTo(x-s*2.8,topY-s*5);ctx.lineTo(x-s*2.2,topY-s*8.5);
    ctx.lineTo(x-s*1.1,topY-s*5.8);ctx.lineTo(x,topY-s*9.5);
    ctx.lineTo(x+s*1.1,topY-s*5.8);ctx.lineTo(x+s*2.2,topY-s*8.5);
    ctx.lineTo(x+s*2.8,topY-s*5);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#B8860B';ctx.lineWidth=s*.4;ctx.stroke();
    ctx.fillStyle='#E91E63';
    ctx.beginPath();ctx.arc(x-s*2.2,topY-s*7.5,s*.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4CAF50';
    ctx.beginPath();ctx.arc(x,topY-s*8.5,s*.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#2196F3';
    ctx.beginPath();ctx.arc(x+s*2.2,topY-s*7.5,s*.5,0,Math.PI*2);ctx.fill();
  }
}
// CABANE — small log hut with steep thatched overhanging roof
function _gBCabane(ctx,x,y,bw,bh,oh,col,s){
  var bw2=bw*.82,bh2=bh*.82,wh=oh*.4,wy=y-bh2-wh;
  _gBox(ctx,x,wy,bw2,bh2,wh,'#a06838','#5a3008','#c08458');
  ctx.strokeStyle='rgba(40,15,5,.32)';ctx.lineWidth=s*.6;
  for(var i=1;i<3;i++){var v=i/3;
    ctx.beginPath();ctx.moveTo(x+bw2,wy+v*wh);ctx.lineTo(x,wy+bh2+v*wh);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-bw2,wy+v*wh);ctx.lineTo(x,wy+bh2+v*wh);ctx.stroke();}
  _gRF(ctx,x,wy,bw2,bh2,wh,.42,.42,.94,.97,'#2a1003',null);
  ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(x+bw2*.48,wy+.52*bh2+.7*wh,s*.6,0,Math.PI*2);ctx.fill();
  var rh=oh*.78,peak=wy-bh2-rh,rc='#7a3818',ow=bw2*1.22,oh2=bh2*1.22;
  ctx.beginPath();ctx.moveTo(x,wy-oh2);ctx.lineTo(x+ow,wy);ctx.lineTo(x,wy+oh2);ctx.lineTo(x-ow,wy);ctx.closePath();
  ctx.fillStyle=_gHL(rc,.5);ctx.fill();
  ctx.beginPath();ctx.moveTo(x,wy-oh2);ctx.lineTo(x-ow,wy);ctx.lineTo(x,peak);ctx.closePath();ctx.fillStyle=_gHL(rc,.65);ctx.fill();
  ctx.beginPath();ctx.moveTo(x,wy-oh2);ctx.lineTo(x+ow,wy);ctx.lineTo(x,peak);ctx.closePath();ctx.fillStyle=_gHL(rc,1.05);ctx.fill();
  ctx.beginPath();ctx.moveTo(x-ow,wy);ctx.lineTo(x,wy+oh2);ctx.lineTo(x,peak);ctx.closePath();ctx.fillStyle=_gHL(rc,.55);ctx.fill();
  var tg=ctx.createLinearGradient(x,peak,x,wy);tg.addColorStop(0,_gHL(rc,1.18));tg.addColorStop(1,rc);
  ctx.beginPath();ctx.moveTo(x+ow,wy);ctx.lineTo(x,wy+oh2);ctx.lineTo(x,peak);ctx.closePath();ctx.fillStyle=tg;ctx.fill();
  ctx.strokeStyle='rgba(40,15,5,.4)';ctx.lineWidth=s*.4;
  for(var ti=0;ti<7;ti++){var fa=ti/7*Math.PI*2+.2;
    var ex=x+Math.cos(fa)*ow*.8,ey=wy+Math.sin(fa)*oh2*.8;
    ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(x+Math.cos(fa)*ow*.15,peak+rh*.6);ctx.stroke();}
  ctx.strokeStyle='rgba(0,0,0,.32)';ctx.lineWidth=0.8;
  ctx.beginPath();ctx.moveTo(x-ow,wy);ctx.lineTo(x,peak);ctx.lineTo(x+ow,wy);
  ctx.moveTo(x,wy-oh2);ctx.lineTo(x,peak);ctx.moveTo(x,wy+oh2);ctx.lineTo(x,peak);ctx.stroke();
  return peak;
}
// MAISON — classic house, white walls, RED gable roof, chimney with smoke
function _gBMaison(ctx,x,y,bw,bh,oh,col,s){
  var wh=oh*.5,wy=y-bh-wh;
  _gBox(ctx,x,wy,bw,bh,wh,'#f5e8d0','#a08c60','#fff8e0');
  var wc='rgba(140,210,255,.85)';
  _gRF(ctx,x,wy,bw,bh,wh,.06,.15,.34,.55,wc,'rgba(80,50,20,.5)');
  _gRF(ctx,x,wy,bw,bh,wh,.46,.15,.74,.55,wc,'rgba(80,50,20,.5)');
  ctx.strokeStyle='rgba(80,50,20,.55)';ctx.lineWidth=s*.55;
  [.06,.46].forEach(function(u0){var u1=u0+.28,um=(u0+u1)/2;
    ctx.beginPath();ctx.moveTo(x+bw*(1-um),wy+um*bh+.15*wh);ctx.lineTo(x+bw*(1-um),wy+um*bh+.55*wh);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+bw*(1-u0),wy+u0*bh+.35*wh);ctx.lineTo(x+bw*(1-u1),wy+u1*bh+.35*wh);ctx.stroke();});
  _gRF(ctx,x,wy,bw,bh,wh,.78,.55,.99,.97,'#5a2c0c',null);
  ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(x+bw*(1-.86),wy+.86*bh+.78*wh,s*.55,0,Math.PI*2);ctx.fill();
  var rh=oh*.5,peakY=_gGableRoof(ctx,x,wy,bw,bh,rh,'#c83020');
  _gBox(ctx,x+bw*.42,wy-bh*.05,bw*.13,bh*.13,oh*.34,'#a06848','#603810','#b07050');
  _gBox(ctx,x+bw*.42,wy-bh*.05-oh*.34,bw*.16,bh*.16,oh*.04,'#5a3818','#3a2008','#704020');
  ctx.fillStyle='rgba(220,220,220,.55)';ctx.beginPath();ctx.arc(x+bw*.42,wy-bh*.05-oh*.42,s*1.8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(200,200,200,.4)';ctx.beginPath();ctx.arc(x+bw*.46,wy-bh*.05-oh*.52,s*2.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(180,180,180,.3)';ctx.beginPath();ctx.arc(x+bw*.5,wy-bh*.05-oh*.62,s*2.6,0,Math.PI*2);ctx.fill();
  return peakY;
}
// SERRE — greenhouse with arched glass roof
function _gBSerre(ctx,x,y,bw,bh,oh,col,s){
  var wh=oh*.42,wy=y-bh-wh;
  // Walls: solid pale-green glass-like color (opaque)
  _gBox(ctx,x,wy,bw,bh,wh,'#cdebd4','#74a888','#dff5e2');
  // Glass shine highlights (semi-transparent white) on right face
  _gRF(ctx,x,wy,bw,bh,wh,.05,.05,.42,.45,'rgba(255,255,255,.35)',null);
  _gRF(ctx,x,wy,bw,bh,wh,.55,.05,.92,.45,'rgba(255,255,255,.18)',null);
  // Frame divisions
  ctx.strokeStyle='rgba(40,90,55,.85)';ctx.lineWidth=s*.7;
  [.2,.4,.6,.8].forEach(function(u){ctx.beginPath();
    ctx.moveTo(x+bw*(1-u),wy+u*bh);ctx.lineTo(x+bw*(1-u),wy+u*bh+wh);ctx.stroke();});
  _gRF(ctx,x,wy,bw,bh,wh,0,.5,1,.51,'rgba(40,90,55,.7)',null);
  // Plants visible behind glass (more opaque, darker)
  ctx.fillStyle='#2e7d32';
  [.18,.42,.62,.85].forEach(function(u){ctx.beginPath();
    ctx.ellipse(x+bw*(1-u),wy+u*bh+wh*.72,bw*.13,wh*.2,0,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle='#43a047';
  [.18,.42,.62,.85].forEach(function(u){ctx.beginPath();
    ctx.ellipse(x+bw*(1-u)-bw*.03,wy+u*bh+wh*.65,bw*.08,wh*.13,0,0,Math.PI*2);ctx.fill();});
  // Door (solid wood)
  _gRF(ctx,x,wy,bw,bh,wh,.65,.38,1,.97,'#5d4037',null);
  _gRF(ctx,x,wy,bw,bh,wh,.7,.42,.95,.85,'rgba(170,220,180,.85)',null);
  // Arched glass roof (solid pale green with shine)
  var rh=oh*.55;
  // Front face of arched roof (visible)
  ctx.fillStyle='#b8e0c2';
  ctx.beginPath();
  ctx.moveTo(x-bw,wy);ctx.bezierCurveTo(x-bw*.6,wy-rh*.6,x+bw*.6,wy-rh*.6,x+bw,wy);
  ctx.lineTo(x,wy+bh);ctx.closePath();ctx.fill();
  // Roof shine on front-right side
  ctx.fillStyle='rgba(255,255,255,.32)';
  ctx.beginPath();
  ctx.moveTo(x+bw*.1,wy-rh*.1);ctx.bezierCurveTo(x+bw*.5,wy-rh*.55,x+bw*.85,wy-rh*.2,x+bw*.95,wy-bh*.05);
  ctx.lineTo(x+bw*.65,wy+bh*.45);ctx.bezierCurveTo(x+bw*.5,wy-rh*.05,x+bw*.3,wy-rh*.15,x,wy-rh*.05);
  ctx.closePath();ctx.fill();
  // Back face of roof (slightly darker, for depth)
  ctx.fillStyle='#9ec9a7';
  ctx.beginPath();
  ctx.moveTo(x-bw,wy);ctx.bezierCurveTo(x-bw*.6,wy-rh*.6,x+bw*.6,wy-rh*.6,x+bw,wy);
  ctx.lineTo(x,wy-bh);ctx.closePath();ctx.fill();
  // Frame: arch curve + ridge + ribs
  ctx.strokeStyle='#2e6b3e';ctx.lineWidth=s*.95;
  ctx.beginPath();ctx.moveTo(x-bw,wy);ctx.bezierCurveTo(x-bw*.6,wy-rh*.6,x+bw*.6,wy-rh*.6,x+bw,wy);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,wy+bh);ctx.lineTo(x,wy-bh);ctx.stroke();
  // Ridge cap (top of arch)
  ctx.strokeStyle='#3a8048';ctx.lineWidth=s*.6;
  [-bw*.5,bw*.5].forEach(function(dx){ctx.beginPath();
    ctx.moveTo(x+dx,wy);ctx.bezierCurveTo(x+dx*.6,wy-rh*.4,x+dx*.2,wy-rh*.55,x,wy-rh*.55);ctx.stroke();});
  return wy-rh*.6;
}
// GRANGE — barn with deep red walls, white trim, gambrel roof, X doors
function _gBGrange(ctx,x,y,bw,bh,oh,col,s){
  var bw2=bw*1.05,bh2=bh,wh=oh*.55,wy=y-bh2-wh;
  _gBox(ctx,x,wy,bw2,bh2,wh,'#c02818','#8a1010','#dc4830');
  ctx.strokeStyle='rgba(40,5,5,.35)';ctx.lineWidth=s*.55;
  for(var pi=0;pi<5;pi++){var u=pi/4*.95+.025;
    ctx.beginPath();ctx.moveTo(x+bw2*(1-u),wy+u*bh2);ctx.lineTo(x+bw2*(1-u),wy+u*bh2+wh);ctx.stroke();}
  _gRF(ctx,x,wy,bw2,bh2,wh,0,0,1,.05,'#ffffff',null);
  _gRF(ctx,x,wy,bw2,bh2,wh,0,.95,1,1,'#ffffff',null);
  _gRF(ctx,x,wy,bw2,bh2,wh,.35,.3,1,.97,'#1a0a02',null);
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=s*1.1;
  var d0x=x+bw2*(1-.35),d0y=wy+.35*bh2+.3*wh,d1x=x,d1y=wy+bh2+.97*wh;
  var d2x=x+bw2*(1-.35),d2y=wy+.35*bh2+.97*wh,d3x=x,d3y=wy+bh2+.3*wh;
  ctx.beginPath();ctx.moveTo(d0x,d0y);ctx.lineTo(d1x,d1y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(d2x,d2y);ctx.lineTo(d3x,d3y);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=s*.7;
  ctx.beginPath();ctx.moveTo((d0x+d3x)/2,(d0y+d3y)/2);ctx.lineTo((d1x+d2x)/2,(d1y+d2y)/2);ctx.stroke();
  _gRF(ctx,x,wy,bw2,bh2,wh,.06,.08,.32,.28,'rgba(220,180,80,.85)',null);
  return _gGambrelRoof(ctx,x,wy,bw2,bh2,oh*.5,'#8a1010');
}
// CAFE — cafe with prominent striped awning, coffee cup sign
function _gBCafe(ctx,x,y,bw,bh,oh,col,s){
  var wh=oh*.55,wy=y-bh-wh;
  _gBox(ctx,x,wy,bw,bh,wh,'#d4a878','#8a5028','#e8c098');
  _gRF(ctx,x,wy,bw,bh,wh,.05,.3,.6,.78,'rgba(140,210,255,.78)','rgba(80,50,20,.4)');
  ctx.strokeStyle='rgba(80,50,20,.5)';ctx.lineWidth=s*.55;
  [.2,.4].forEach(function(u){ctx.beginPath();
    ctx.moveTo(x+bw*(1-u),wy+u*bh+.3*wh);ctx.lineTo(x+bw*(1-u),wy+u*bh+.78*wh);ctx.stroke();});
  _gRF(ctx,x,wy,bw,bh,wh,.65,.5,.99,.97,'#5a2c0c',null);
  _gRF(ctx,x,wy,bw,bh,wh,.7,.55,.94,.78,'rgba(140,210,255,.5)',null);
  var ah=wh*.18;
  var stripes=['#e53935','#fff','#e53935','#fff','#e53935','#fff'];
  for(var ai=0;ai<6;ai++){var u0=ai/6,u1=(ai+1)/6;
    var ex0=x+bw*(1-u0)*1.06,ey0=wy+u0*bh-ah*.5;
    var ex1=x+bw*(1-u1)*1.06,ey1=wy+u1*bh-ah*.5;
    ctx.beginPath();ctx.moveTo(ex0,ey0);ctx.lineTo(ex1,ey1);
    ctx.lineTo(ex1+s*1.2,ey1+ah*.6);ctx.lineTo(ex0+s*1.2,ey0+ah*.6);ctx.closePath();
    ctx.fillStyle=stripes[ai];ctx.fill();}
  for(var ai2=0;ai2<6;ai2++){var u0=ai2/6;
    var ex0=x+bw*(1-u0)*1.06+s*1.2,ey0=wy+u0*bh-ah*.5+ah*.6;
    ctx.fillStyle=ai2%2?'#fff':'#e53935';
    ctx.beginPath();ctx.arc(ex0+s*.5,ey0,s*.85,0,Math.PI);ctx.fill();}
  ctx.beginPath();ctx.arc(x+bw*.18,wy-bh*.05,s*2.2,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
  ctx.beginPath();ctx.arc(x+bw*.18,wy-bh*.05,s*1.6,0,Math.PI*2);ctx.fillStyle='#5a2c0c';ctx.fill();
  ctx.strokeStyle='rgba(220,220,220,.65)';ctx.lineWidth=s*.55;
  for(var ci=0;ci<3;ci++){ctx.beginPath();
    ctx.moveTo(x+bw*.18-s*.7+ci*s*.7,wy-bh*.05-s*2);
    ctx.bezierCurveTo(x+bw*.18-s*1.1+ci*s*.7,wy-bh*.05-s*3.2,x+bw*.18+ci*s*.7,wy-bh*.05-s*4.4,x+bw*.18-s*.5+ci*s*.7,wy-bh*.05-s*5.5);
    ctx.stroke();}
  return _gPyramid(ctx,x,wy,bw,bh,oh*.32,'#5a3010');
}
// MARCHE — market shop with multi-color awning and goods
function _gBMarche(ctx,x,y,bw,bh,oh,col,s){
  var bw2=bw*1.0,bh2=bh*.95,wh=oh*.45,wy=y-bh2-wh;
  _gBox(ctx,x,wy,bw2,bh2,wh,'#f0e0c0','#a08868','#fff5d8');
  _gRF(ctx,x,wy,bw2,bh2,wh,.05,.2,.95,.85,'#3a2008',null);
  var goods=[['rgba(255,80,60,.95)',.1,.45,.28,.7],['rgba(80,200,80,.95)',.32,.5,.5,.7],
             ['rgba(255,220,60,.95)',.54,.45,.72,.7],['rgba(255,140,40,.95)',.76,.5,.92,.7]];
  goods.forEach(function(g){_gRF(ctx,x,wy,bw2,bh2,wh,g[1],g[2],g[3],g[4],g[0],'rgba(0,0,0,.3)');
    var um=(g[1]+g[3])/2,vm=(g[2]+g[4])/2;
    ctx.fillStyle='rgba(255,255,255,.85)';
    ctx.beginPath();ctx.arc(x+bw2*(1-um),wy+um*bh2+vm*wh,s*1,0,Math.PI*2);ctx.fill();});
  var ah=wh*.22,awColors=['#FF5722','#FFEB3B','#4CAF50','#2196F3','#FF5722','#FFEB3B','#4CAF50'];
  for(var mi=0;mi<7;mi++){var u0=mi/7,u1=(mi+1)/7;
    var ex0=x+bw2*(1-u0)*1.08,ey0=wy+u0*bh2-ah*.5;
    var ex1=x+bw2*(1-u1)*1.08,ey1=wy+u1*bh2-ah*.5;
    ctx.beginPath();ctx.moveTo(ex0,ey0);ctx.lineTo(ex1,ey1);
    ctx.lineTo(ex1+s*1.5,ey1+ah);ctx.lineTo(ex0+s*1.5,ey0+ah);ctx.closePath();
    ctx.fillStyle=awColors[mi];ctx.fill();}
  ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=s*.4;
  for(var mi2=1;mi2<7;mi2++){var u=mi2/7;
    var ex=x+bw2*(1-u)*1.08,ey=wy+u*bh2-ah*.5;
    ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+s*1.5,ey+ah);ctx.stroke();}
  ctx.strokeStyle='#5a3818';ctx.lineWidth=s;
  [.05,.5,.95].forEach(function(u){
    ctx.beginPath();ctx.moveTo(x+bw2*(1-u)*1.08+s*1.5,wy+u*bh2+ah*.5);
    ctx.lineTo(x+bw2*(1-u)*1.08+s*1.5,wy+u*bh2+ah*.5+wh*.3);ctx.stroke();});
  return wy-ah*.5;
}
// MOULIN — windmill with stone tower, conical hat, prominent blades
function _gBMoulin(ctx,x,y,bw,bh,oh,col,s){
  var tw=bw*.65,th=bh*.65,wh=oh*.7,wy=y-bh-wh;
  _gBox(ctx,x,wy,tw,th,wh,'#d8d4c8','#8a8478','#f0ece0');
  ctx.strokeStyle='rgba(60,50,40,.25)';ctx.lineWidth=s*.5;
  for(var mi=1;mi<5;mi++){var v=mi/5;
    ctx.beginPath();ctx.moveTo(x+tw,wy+v*wh);ctx.lineTo(x,wy+th+v*wh);ctx.stroke();}
  _gRF(ctx,x,wy,tw,th,wh,.5,.5,.95,.97,'#3a1a05',null);
  _gRF(ctx,x,wy,tw,th,wh,.08,.15,.42,.4,'rgba(140,200,235,.85)','rgba(60,40,20,.4)');
  _gRF(ctx,x,wy,tw,th,wh,.08,.55,.42,.78,'rgba(140,200,235,.85)','rgba(60,40,20,.4)');
  var rh=oh*.4,peak=wy-th-rh,rc='#5a4030';
  ctx.beginPath();ctx.moveTo(x-tw,wy);ctx.lineTo(x,wy+th);ctx.lineTo(x,peak);ctx.closePath();ctx.fillStyle=_gHL(rc,.6);ctx.fill();
  ctx.beginPath();ctx.moveTo(x+tw,wy);ctx.lineTo(x,wy+th);ctx.lineTo(x,peak);ctx.closePath();ctx.fillStyle=rc;ctx.fill();
  ctx.beginPath();ctx.moveTo(x-tw,wy);ctx.lineTo(x,wy-th);ctx.lineTo(x,peak);ctx.closePath();ctx.fillStyle=_gHL(rc,.7);ctx.fill();
  ctx.beginPath();ctx.moveTo(x+tw,wy);ctx.lineTo(x,wy-th);ctx.lineTo(x,peak);ctx.closePath();ctx.fillStyle=_gHL(rc,1.05);ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=0.7;
  ctx.beginPath();ctx.moveTo(x-tw,wy);ctx.lineTo(x,peak);ctx.lineTo(x+tw,wy);
  ctx.moveTo(x,wy-th);ctx.lineTo(x,peak);ctx.moveTo(x,wy+th);ctx.lineTo(x,peak);ctx.stroke();
  var sc=x,sy=peak+rh*.45,bladeLen=bw*1.05;
  for(var wi=0;wi<4;wi++){var wa=wi/4*Math.PI*2+.4;
    var ex=sc+Math.cos(wa)*bladeLen,ey=sy+Math.sin(wa)*bladeLen*.7;
    ctx.strokeStyle='rgba(70,40,15,.9)';ctx.lineWidth=s*1.7;
    ctx.beginPath();ctx.moveTo(sc,sy);ctx.lineTo(ex,ey);ctx.stroke();
    var sailW=bladeLen*.55,sailH=s*5;
    var nx=-Math.sin(wa)*sailH,ny=Math.cos(wa)*sailH*.7;
    var sx2=sc+Math.cos(wa)*sailW*.45,sy2=sy+Math.sin(wa)*sailW*.45;
    var sx3=sc+Math.cos(wa)*bladeLen,sy3=sy+Math.sin(wa)*bladeLen*.7;
    ctx.beginPath();ctx.moveTo(sx2-nx*.25,sy2-ny*.25);ctx.lineTo(sx3-nx*.25,sy3-ny*.25);
    ctx.lineTo(sx3+nx,sy3+ny);ctx.lineTo(sx2+nx,sy2+ny);ctx.closePath();
    var sg=ctx.createLinearGradient(sx2,sy2,sx3,sy3);
    sg.addColorStop(0,'rgba(245,235,200,.95)');sg.addColorStop(1,'rgba(195,170,130,.9)');
    ctx.fillStyle=sg;ctx.fill();
    ctx.strokeStyle='rgba(80,60,30,.75)';ctx.lineWidth=s*.5;ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx2,sy2);ctx.lineTo(sx3,sy3);ctx.stroke();}
  ctx.beginPath();ctx.arc(sc,sy,s*2.6,0,Math.PI*2);ctx.fillStyle='#3a2008';ctx.fill();
  ctx.beginPath();ctx.arc(sc,sy,s*1.3,0,Math.PI*2);ctx.fillStyle='#FFD700';ctx.fill();
  return peak-s*2;
}
// POSTE — blue post office with 〒 mark, mailbox in front
function _gBPoste(ctx,x,y,bw,bh,oh,col,s){
  var wh=oh*.6,wy=y-bh-wh;
  _gBox(ctx,x,wy,bw,bh,wh,'#3878c8','#1850a0','#5898e0');
  _gRF(ctx,x,wy,bw,bh,wh,0,.32,1,.4,'#FFC107',null);
  _gRF(ctx,x,wy,bw,bh,wh,.18,.12,.6,.18,'#FFFFFF',null);
  _gRF(ctx,x,wy,bw,bh,wh,.36,.18,.42,.28,'#FFFFFF',null);
  var wc='rgba(180,230,255,.85)';
  _gRF(ctx,x,wy,bw,bh,wh,.06,.45,.3,.7,wc,'rgba(20,30,80,.5)');
  _gRF(ctx,x,wy,bw,bh,wh,.7,.45,.94,.7,wc,'rgba(20,30,80,.5)');
  _gRF(ctx,x,wy,bw,bh,wh,.4,.55,.62,.97,'#1a2858',null);
  _gBox(ctx,x+bw*.7,y-bh*.6,bw*.1,bh*.1,oh*.32,'#FFC107','#a08010','#FFE060');
  ctx.fillStyle='#1a2858';
  ctx.fillRect(x+bw*.66,y-bh*.6-oh*.18,bw*.12,s*.7);
  var rh=oh*.3,rc='#1a4080',peak=_gPyramid(ctx,x,wy,bw,bh,rh,rc);
  ctx.strokeStyle='#999';ctx.lineWidth=s*.7;
  ctx.beginPath();ctx.moveTo(x,peak);ctx.lineTo(x,peak-s*8);ctx.stroke();
  ctx.fillStyle='#FFC107';ctx.beginPath();
  ctx.moveTo(x,peak-s*8);ctx.lineTo(x+s*5,peak-s*6.5);ctx.lineTo(x,peak-s*5);ctx.closePath();ctx.fill();
  return peak-s*8;
}
// PHARE — lighthouse, very thin and tall, red/white stripes, glowing top
function _gBPhare(ctx,x,y,bw,bh,oh,col,s){
  var tw=bw*.38,th=bh*.38,ns=6,sh=oh*.13,wh=ns*sh;
  for(var pi=0;pi<ns;pi++){var sy=y-bh-pi*sh-sh,e=pi%2;
    _gBox(ctx,x,sy,tw,th,sh,e?'#f8f8f8':'#e63838',e?'#dadada':'#b71c1c',e?'#ffffff':'#ef5350');}
  var wy2=y-bh-wh;
  _gRF(ctx,x,wy2+wh-sh,tw,th,sh,.3,.25,.85,.95,'#3a1a05',null);
  _gBox(ctx,x,wy2,tw*1.32,th*1.32,sh*.18,'#bdbdbd','#8a8a8a','#e0e0e0');
  var lrY=wy2-th*.2;
  _gBox(ctx,x,lrY,tw*.9,th*.9,sh*.85,'rgba(255,255,200,.85)','rgba(180,180,80,.6)','rgba(255,255,220,.85)');
  var lcy=lrY-th*.4,lg=ctx.createRadialGradient(x,lcy,0,x,lcy,s*22);
  lg.addColorStop(0,'rgba(255,255,180,1)');lg.addColorStop(.3,'rgba(255,230,80,.8)');lg.addColorStop(1,'rgba(255,200,0,0)');
  ctx.globalAlpha=.95;ctx.beginPath();ctx.arc(x,lcy,s*22,0,Math.PI*2);ctx.fillStyle=lg;ctx.fill();
  ctx.globalAlpha=.18;ctx.beginPath();ctx.arc(x,lcy,s*40,0,Math.PI*2);ctx.fillStyle='rgba(255,230,60,1)';ctx.fill();ctx.globalAlpha=1;
  var htY=lrY-th*.95,peak=htY-oh*.18;
  ctx.beginPath();ctx.moveTo(x-tw,htY);ctx.lineTo(x,htY-bh*.13);ctx.lineTo(x+tw,htY);ctx.closePath();ctx.fillStyle='#e63838';ctx.fill();
  ctx.beginPath();ctx.moveTo(x-tw,htY);ctx.lineTo(x,peak);ctx.lineTo(x,htY-bh*.13);ctx.closePath();ctx.fillStyle='#b71c1c';ctx.fill();
  ctx.beginPath();ctx.moveTo(x+tw,htY);ctx.lineTo(x,peak);ctx.lineTo(x,htY-bh*.13);ctx.closePath();ctx.fillStyle='#ef5350';ctx.fill();
  ctx.strokeStyle='#222';ctx.lineWidth=s*.6;
  ctx.beginPath();ctx.moveTo(x,peak);ctx.lineTo(x,peak-s*3);ctx.stroke();
  ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(x,peak-s*3,s*.85,0,Math.PI*2);ctx.fill();
  return peak-s*3;
}
// BIBLIOTHEQUE — library with classical columns and pediment
function _gBBiblio(ctx,x,y,bw,bh,oh,col,s){
  var wh=oh*.62,wy=y-bh-wh;
  _gBox(ctx,x,wy,bw,bh,wh,'#e8d8b8','#a89878','#f8e8c8');
  _gRF(ctx,x,wy,bw,bh,wh,0,.92,1,1,'#c8b898',null);
  for(var ci=0;ci<5;ci++){var cu=.05+ci*.18;
    _gRF(ctx,x,wy,bw,bh,wh,cu-.015,.85,cu+.105,.92,'#a89878',null);
    _gRF(ctx,x,wy,bw,bh,wh,cu,.18,cu+.075,.85,'#f0e0c0','rgba(80,60,40,.3)');
    _gRF(ctx,x,wy,bw,bh,wh,cu+.05,.18,cu+.075,.85,'rgba(0,0,0,.18)',null);
    _gRF(ctx,x,wy,bw,bh,wh,cu-.015,.13,cu+.105,.18,'#c8b898',null);}
  _gRF(ctx,x,wy,bw,bh,wh,.4,.3,.6,.8,'#3a2008',null);
  _gRF(ctx,x,wy,bw,bh,wh,.38,.78,.62,.85,'#c0a878',null);
  _gRF(ctx,x,wy,bw,bh,wh,0,.05,1,.13,'#d8c8a8',null);
  _gRF(ctx,x,wy,bw,bh,wh,0,.13,1,.15,'#8a7858',null);
  var rh=oh*.22,rc='#dac8a0';
  var rWx=x-bw/2,rWy=wy-bh/2-rh,rEx=x+bw/2,rEy=wy+bh/2-rh;
  ctx.beginPath();ctx.moveTo(x,wy-bh);ctx.lineTo(x+bw,wy);ctx.lineTo(rEx,rEy);ctx.lineTo(rWx,rWy);ctx.closePath();ctx.fillStyle=_gHL(rc,.65);ctx.fill();
  ctx.beginPath();ctx.moveTo(x,wy-bh);ctx.lineTo(x-bw,wy);ctx.lineTo(rWx,rWy);ctx.closePath();ctx.fillStyle=_gHL(rc,.55);ctx.fill();
  ctx.beginPath();ctx.moveTo(x,wy+bh);ctx.lineTo(x-bw,wy);ctx.lineTo(rWx,rWy);ctx.lineTo(rEx,rEy);ctx.closePath();ctx.fillStyle=rc;ctx.fill();
  ctx.beginPath();ctx.moveTo(x+bw,wy);ctx.lineTo(x,wy+bh);ctx.lineTo(rEx,rEy);ctx.closePath();
  var pg=ctx.createLinearGradient(x,wy,x+bw,wy);pg.addColorStop(0,'#f0e0c0');pg.addColorStop(1,'#c8b898');
  ctx.fillStyle=pg;ctx.fill();
  var pcx=(x+bw+x+rEx)/3,pcy=(wy+wy+bh+rEy)/3;
  ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(pcx,pcy-s*.5,s*1.6,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.28)';ctx.lineWidth=0.7;
  ctx.beginPath();ctx.moveTo(rWx,rWy);ctx.lineTo(rEx,rEy);
  ctx.moveTo(x-bw,wy);ctx.lineTo(rWx,rWy);
  ctx.moveTo(x,wy+bh);ctx.lineTo(rEx,rEy);
  ctx.moveTo(x+bw,wy);ctx.lineTo(rEx,rEy);ctx.stroke();
  return Math.min(rWy,rEy);
}
// EGLISE — church with main nave + tall steeple with cross
function _gBEglise(ctx,x,y,bw,bh,oh,col,s){
  var nw=bw*.85,nh=bh*.95,nwh=oh*.45,nx=x+bw*.18,nwy=y-nh-nwh;
  _gBox(ctx,nx,nwy,nw,nh,nwh,'#e8e8f0','#9898b0','#f8f8ff');
  var sgcs=['rgba(180,80,180,.85)','rgba(80,160,200,.85)','rgba(180,60,80,.85)'];
  [0,1,2].forEach(function(i){_gRF(ctx,nx,nwy,nw,nh,nwh,.1+i*.27,.2,.25+i*.27,.6,sgcs[i],'rgba(60,30,80,.5)');});
  _gRF(ctx,nx,nwy,nw,nh,nwh,.83,.55,.97,.97,'#3a1a05',null);
  ctx.strokeStyle='rgba(255,215,0,.85)';ctx.lineWidth=s*.5;
  ctx.beginPath();ctx.moveTo(nx+nw*(1-.9),nwy+.9*nh+.65*nwh);ctx.lineTo(nx+nw*(1-.9),nwy+.9*nh+.85*nwh);ctx.stroke();
  ctx.beginPath();ctx.moveTo(nx+nw*(1-.94),nwy+.94*nh+.72*nwh);ctx.lineTo(nx+nw*(1-.86),nwy+.86*nh+.72*nwh);ctx.stroke();
  var nrh=oh*.32,nrc='#705858';
  var nrWx=nx-nw/2,nrWy=nwy-nh/2-nrh,nrEx=nx+nw/2,nrEy=nwy+nh/2-nrh;
  ctx.beginPath();ctx.moveTo(nx,nwy-nh);ctx.lineTo(nx+nw,nwy);ctx.lineTo(nrEx,nrEy);ctx.lineTo(nrWx,nrWy);ctx.closePath();
  ctx.fillStyle=_gHL(nrc,.65);ctx.fill();
  ctx.beginPath();ctx.moveTo(nx,nwy+nh);ctx.lineTo(nx-nw,nwy);ctx.lineTo(nrWx,nrWy);ctx.lineTo(nrEx,nrEy);ctx.closePath();
  ctx.fillStyle=nrc;ctx.fill();
  ctx.beginPath();ctx.moveTo(nx+nw,nwy);ctx.lineTo(nx,nwy+nh);ctx.lineTo(nrEx,nrEy);ctx.closePath();
  ctx.fillStyle='#e0e0ec';ctx.fill();
  var ewx=(nx+nw+nx+nrEx)/3,ewy=(nwy+nwy+nh+nrEy)/3;
  ctx.beginPath();ctx.arc(ewx,ewy,s*1.8,0,Math.PI*2);ctx.fillStyle='rgba(255,200,60,.85)';ctx.fill();
  ctx.strokeStyle='#705858';ctx.lineWidth=s*.4;ctx.stroke();
  var tx=x-bw*.5,tw=bw*.32,thh=bh*.32,twh=oh*.95,twy=y-bh-twh;
  _gBox(ctx,tx,twy,tw,thh,twh,'#dce8d0','#8a9080','#f0f8e8');
  _gRF(ctx,tx,twy,tw,thh,twh,.15,.35,.55,.7,'rgba(255,200,60,.85)','rgba(80,60,40,.4)');
  ctx.fillStyle='rgba(80,60,30,.7)';
  ctx.beginPath();ctx.arc(tx+tw*(1-.35),twy+.35*thh+.5*twh,s*.9,0,Math.PI*2);ctx.fill();
  var srh=oh*.7,speak=twy-thh-srh;
  ctx.beginPath();ctx.moveTo(tx-tw,twy);ctx.lineTo(tx,twy-thh);ctx.lineTo(tx,speak);ctx.closePath();ctx.fillStyle=_gHL('#9098a0',.7);ctx.fill();
  ctx.beginPath();ctx.moveTo(tx+tw,twy);ctx.lineTo(tx,twy-thh);ctx.lineTo(tx,speak);ctx.closePath();ctx.fillStyle=_gHL('#9098a0',1.05);ctx.fill();
  ctx.beginPath();ctx.moveTo(tx-tw,twy);ctx.lineTo(tx,twy+thh);ctx.lineTo(tx,speak);ctx.closePath();ctx.fillStyle=_gHL('#9098a0',.6);ctx.fill();
  ctx.beginPath();ctx.moveTo(tx+tw,twy);ctx.lineTo(tx,twy+thh);ctx.lineTo(tx,speak);ctx.closePath();ctx.fillStyle='#9098a0';ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.32)';ctx.lineWidth=0.7;
  ctx.beginPath();ctx.moveTo(tx-tw,twy);ctx.lineTo(tx,speak);ctx.lineTo(tx+tw,twy);
  ctx.moveTo(tx,twy-thh);ctx.lineTo(tx,speak);ctx.moveTo(tx,twy+thh);ctx.lineTo(tx,speak);ctx.stroke();
  ctx.fillStyle='#FFD700';
  ctx.fillRect(tx-s*.7,speak-s*12,s*1.4,s*12);
  ctx.fillRect(tx-s*4.5,speak-s*9,s*9,s*1.6);
  ctx.strokeStyle='rgba(180,140,0,.95)';ctx.lineWidth=s*.4;
  ctx.strokeRect(tx-s*.7,speak-s*12,s*1.4,s*12);
  ctx.strokeRect(tx-s*4.5,speak-s*9,s*9,s*1.6);
  return speak-s*12;
}
// ECOLE — school with 2 stories, bell tower, French flag
function _gBEcole(ctx,x,y,bw,bh,oh,col,s){
  var bw2=bw,bh2=bh*.95,wh=oh*.72,wy=y-bh2-wh;
  _gBox(ctx,x,wy,bw2,bh2,wh,'#e0c060','#a08820','#f0e078');
  _gRF(ctx,x,wy,bw2,bh2,wh,0,.46,1,.5,'rgba(60,40,5,.4)',null);
  var wc='rgba(140,210,255,.85)';
  for(var ri=0;ri<2;ri++){for(var ci=0;ci<4;ci++){
    var u0=.06+ci*.22,v0=.1+ri*.4,u1=u0+.13,v1=v0+.25;
    _gRF(ctx,x,wy,bw2,bh2,wh,u0,v0,u1,v1,wc,'rgba(60,40,5,.5)');
    ctx.strokeStyle='rgba(60,40,5,.45)';ctx.lineWidth=s*.4;
    var um=(u0+u1)/2,vm=(v0+v1)/2;
    ctx.beginPath();ctx.moveTo(x+bw2*(1-um),wy+um*bh2+v0*wh);ctx.lineTo(x+bw2*(1-um),wy+um*bh2+v1*wh);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+bw2*(1-u0),wy+u0*bh2+vm*wh);ctx.lineTo(x+bw2*(1-u1),wy+u1*bh2+vm*wh);ctx.stroke();}}
  _gRF(ctx,x,wy,bw2,bh2,wh,.42,.78,.58,.97,'#5a2c0c',null);
  _gRF(ctx,x,wy,bw2,bh2,wh,.38,.95,.62,1,'#a08820',null);
  var rh=oh*.18,rc='#8a4828',peak=_gPyramid(ctx,x,wy,bw2,bh2,rh,rc);
  var btw=bw2*.18,bth=bh2*.18,btwh=oh*.22;
  _gBox(ctx,x,peak-btwh,btw,bth,btwh,'#f0e078','#a08820','#fff8a0');
  _gRF(ctx,x,peak-btwh,btw,bth,btwh,.2,.2,.85,.8,'#3a2008',null);
  ctx.fillStyle='#FFD700';
  ctx.beginPath();ctx.arc(x+btw*.5,peak-btwh+.5*bth+.5*btwh,s*.9,0,Math.PI*2);ctx.fill();
  var btrh=oh*.12,btpeak=peak-btwh-bth-btrh;
  ctx.beginPath();ctx.moveTo(x-btw,peak-btwh);ctx.lineTo(x,peak-btwh-bth);ctx.lineTo(x+btw,peak-btwh);ctx.closePath();
  ctx.fillStyle=_gHL(rc,.7);ctx.fill();
  ctx.beginPath();ctx.moveTo(x-btw,peak-btwh);ctx.lineTo(x,btpeak);ctx.lineTo(x,peak-btwh-bth);ctx.closePath();ctx.fillStyle=_gHL(rc,.65);ctx.fill();
  ctx.beginPath();ctx.moveTo(x+btw,peak-btwh);ctx.lineTo(x,btpeak);ctx.lineTo(x,peak-btwh-bth);ctx.closePath();ctx.fillStyle=rc;ctx.fill();
  ctx.strokeStyle='#888';ctx.lineWidth=s*.6;
  ctx.beginPath();ctx.moveTo(x,btpeak);ctx.lineTo(x,btpeak-s*8);ctx.stroke();
  ctx.fillStyle='#0055A4';ctx.fillRect(x,btpeak-s*8,s*1.5,s*3.5);
  ctx.fillStyle='#fff';ctx.fillRect(x+s*1.5,btpeak-s*8,s*1.5,s*3.5);
  ctx.fillStyle='#EF4135';ctx.fillRect(x+s*3,btpeak-s*8,s*1.5,s*3.5);
  return btpeak-s*8;
}
// HOTEL — tall hotel with multiple floors, awning entrance, stars
function _gBHotel(ctx,x,y,bw,bh,oh,col,s){
  var wh=oh*.85,wy=y-bh-wh;
  _gBox(ctx,x,wy,bw,bh,wh,'#e0a8d8','#a868a0','#f0c0e8');
  for(var fi=1;fi<4;fi++){var v=fi/4;
    _gRF(ctx,x,wy,bw,bh,wh,0,v,1,v+.012,'rgba(80,40,80,.4)',null);}
  var wc='rgba(140,210,255,.85)';
  for(var ri=0;ri<4;ri++){for(var ci=0;ci<3;ci++){
    var u0=.06+ci*.3,v0=.04+ri*.21,u1=u0+.18,v1=v0+.14;
    _gRF(ctx,x,wy,bw,bh,wh,u0,v0,u1,v1,wc,'rgba(60,30,60,.4)');
    _gRF(ctx,x,wy,bw,bh,wh,u0-.01,v1,u1+.01,v1+.022,'rgba(80,40,80,.4)',null);}}
  _gRF(ctx,x,wy,bw,bh,wh,.4,.88,.62,1,'#3a1a30',null);
  ctx.fillStyle='#a02858';
  ctx.beginPath();
  ctx.moveTo(x+bw*(1-.32),wy+.32*bh+.78*wh);ctx.lineTo(x+bw*(1-.7),wy+.7*bh+.78*wh);
  ctx.lineTo(x+bw*(1-.7)-s*1.5,wy+.7*bh+.78*wh+s*1.5);ctx.lineTo(x+bw*(1-.32)-s*1.5,wy+.32*bh+.78*wh+s*1.5);
  ctx.closePath();ctx.fill();
  _gRF(ctx,x,wy,bw,bh,wh,.3,.71,.7,.78,'#FFD700','#a08010');
  ctx.fillStyle='#a02858';
  for(var st=0;st<5;st++){var su=.34+st*.066;
    var sxp=x+bw*(1-su),syp=wy+su*bh+.745*wh;
    ctx.beginPath();
    for(var sa=0;sa<10;sa++){var sang=sa/10*Math.PI*2-Math.PI/2;
      var sr=sa%2?s*.45:s*.95;
      var spx=sxp+Math.cos(sang)*sr,spy=syp+Math.sin(sang)*sr;
      if(sa===0)ctx.moveTo(spx,spy);else ctx.lineTo(spx,spy);}
    ctx.closePath();ctx.fill();}
  var rh=oh*.06;
  _gBox(ctx,x,wy-rh*.5,bw*1.05,bh*1.05,rh,'#a868a0','#704868','#c890c0');
  [-bw*.7,-bw*.35,0,bw*.35,bw*.7].forEach(function(dx){
    _gBox(ctx,x+dx,wy-rh,bw*.07,bh*.07,oh*.05,'#c890c0','#704868','#e0a8d8');});
  return wy-rh-oh*.05;
}
// CHATEAU — castle with corner towers, crenellations, gate, flag
function _gBChateau(ctx,x,y,bw,bh,oh,col,s){
  var bw2=bw*1.05,bh2=bh,wh=oh*.5,wy=y-bh2-wh;
  _gBox(ctx,x,wy,bw2,bh2,wh,'#c8d0d8','#707888','#e0e8f0');
  ctx.strokeStyle='rgba(40,40,50,.18)';ctx.lineWidth=s*.5;
  for(var ci=1;ci<5;ci++){var v=ci/5;
    ctx.beginPath();ctx.moveTo(x+bw2,wy+v*wh);ctx.lineTo(x,wy+bh2+v*wh);ctx.stroke();}
  _gRF(ctx,x,wy,bw2,bh2,wh,.42,.42,.78,.97,'#0a0500',null);
  ctx.strokeStyle='rgba(80,60,30,.75)';ctx.lineWidth=s*.6;
  for(var pb=0;pb<5;pb++){var pu=.42+pb*.09;
    var pby0=wy+pu*bh2+.42*wh,pby1=wy+pu*bh2+.95*wh;
    var pbx=x+bw2*(1-pu);
    ctx.beginPath();ctx.moveTo(pbx,pby0);ctx.lineTo(pbx,pby1);ctx.stroke();}
  for(var pb2=0;pb2<3;pb2++){var pv=.55+pb2*.15;
    _gRF(ctx,x,wy,bw2,bh2,wh,.42,pv,.78,pv+.02,'rgba(80,60,30,.75)',null);}
  _gRF(ctx,x,wy,bw2,bh2,wh,.08,.25,.16,.65,'#1a0d05',null);
  _gRF(ctx,x,wy,bw2,bh2,wh,.84,.25,.92,.65,'#1a0d05',null);
  var bc='#a8b0b8';
  [{dx:-bw2*.85,dy:-bh2*.45},{dx:-bw2*.5,dy:-bh2*.18},{dx:-bw2*.18,dy:-bh2*.0},
   {dx:.18*bw2,dy:bh2*.05},{dx:.5*bw2,dy:-bh2*.18},{dx:.85*bw2,dy:-bh2*.45}].forEach(function(c){
    _gBox(ctx,x+c.dx,wy+c.dy,bw2*.1,bh2*.08,oh*.13,bc,'#707888','#e0e8f0');});
  [{dx:-bw2*.78},{dx:bw2*.78}].forEach(function(t){
    var ctw=bw*.32,cth=bh*.26,ctwh=oh*.92,ctwy=y-bh2-ctwh;
    _gBox(ctx,x+t.dx,ctwy,ctw,cth,ctwh,'#d0d8e0','#788090','#e8f0f8');
    ctx.strokeStyle='rgba(40,40,50,.2)';ctx.lineWidth=s*.4;
    for(var ti=1;ti<5;ti++){var tv=ti/5;
      ctx.beginPath();ctx.moveTo(x+t.dx+ctw,ctwy+tv*ctwh);ctx.lineTo(x+t.dx,ctwy+cth+tv*ctwh);ctx.stroke();}
    _gRF(ctx,x+t.dx,ctwy,ctw,cth,ctwh,.35,.35,.65,.6,'rgba(255,200,80,.85)','rgba(60,40,5,.4)');
    [[-ctw*.6,-cth*.45],[-ctw*.2,-cth*.1],[ctw*.2,-cth*.1],[ctw*.6,-cth*.45]].forEach(function(p){
      _gBox(ctx,x+t.dx+p[0],ctwy+p[1],ctw*.18,cth*.18,oh*.08,bc,'#788090','#e0e8f0');});
    var crc='#3a4858',cpeak=ctwy-cth*1.05-oh*.22;
    ctx.beginPath();ctx.moveTo(x+t.dx-ctw,ctwy);ctx.lineTo(x+t.dx,ctwy-cth);ctx.lineTo(x+t.dx+ctw,ctwy);ctx.closePath();ctx.fillStyle=_gHL(crc,.85);ctx.fill();
    ctx.beginPath();ctx.moveTo(x+t.dx-ctw,ctwy);ctx.lineTo(x+t.dx,cpeak);ctx.lineTo(x+t.dx,ctwy-cth);ctx.closePath();ctx.fillStyle=_gHL(crc,.65);ctx.fill();
    ctx.beginPath();ctx.moveTo(x+t.dx+ctw,ctwy);ctx.lineTo(x+t.dx,cpeak);ctx.lineTo(x+t.dx,ctwy-cth);ctx.closePath();ctx.fillStyle=crc;ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=0.6;
    ctx.beginPath();ctx.moveTo(x+t.dx-ctw,ctwy);ctx.lineTo(x+t.dx,cpeak);ctx.lineTo(x+t.dx+ctw,ctwy);
    ctx.moveTo(x+t.dx,ctwy-cth);ctx.lineTo(x+t.dx,cpeak);ctx.stroke();
    if(t.dx>0){ctx.strokeStyle='#888';ctx.lineWidth=s*.5;
      ctx.beginPath();ctx.moveTo(x+t.dx,cpeak);ctx.lineTo(x+t.dx,cpeak-s*8);ctx.stroke();
      ctx.fillStyle='#c0392b';
      ctx.beginPath();ctx.moveTo(x+t.dx,cpeak-s*8);ctx.lineTo(x+t.dx+s*5,cpeak-s*6);ctx.lineTo(x+t.dx,cpeak-s*4);
      ctx.closePath();ctx.fill();}});
  return wy-oh*.92-oh*.22-s*8;
}
// ---- Fir tree (sapin) ----
function _gFirSprite(ctx,x,y,bw,bh,oh,s){
  var trH=oh*.22,trW=bw*.16;
  ctx.fillStyle='#5D3E1A';ctx.fillRect(x-trW,y-bh-trH,trW*2,trH+bh);
  var layers=3,layerH=oh*.78/layers;
  for(var li=0;li<layers;li++){
    var fw=bw*(1.15-li*.28),fy=y-bh-trH-li*layerH*.72;
    var fg=ctx.createLinearGradient(x-fw,fy-layerH,x+fw,fy);
    fg.addColorStop(0,li===0?'#2E7D32':li===1?'#388E3C':'#43A047');
    fg.addColorStop(1,li===0?'#1B5E20':'#2E7D32');
    ctx.beginPath();ctx.moveTo(x-fw,fy);ctx.lineTo(x+fw,fy);ctx.lineTo(x,fy-layerH*1.1);ctx.closePath();
    ctx.fillStyle=fg;ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.14)';ctx.lineWidth=0.5;ctx.stroke();
    // Snow highlight
    ctx.beginPath();ctx.moveTo(x-fw*.15,fy-layerH*.72);ctx.lineTo(x+fw*.15,fy-layerH*.72);ctx.lineTo(x,fy-layerH*1.1);ctx.closePath();
    ctx.fillStyle='rgba(255,255,255,.18)';ctx.fill();
  }
  return y-bh-trH-oh*.78-s*2;
}
// ---- Round/palm/bamboo trees ----
function _gTreeSprite(ctx,x,y,bw,bh,oh,col,id,s){
  var trH=oh*.32,trW=bw*.15;
  var cR=bw*(id==='palmier'?.65:id==='bonsai'?.75:.88);
  var cY=y-bh-trH-cR*.55;
  // Trunk
  ctx.fillStyle=id==='bambou'?'#66BB6A':'#6B3A1F';
  ctx.fillRect(x-trW,y-bh-trH,trW*2,trH+bh);
  if(id==='bambou'){
    // Segments
    ctx.strokeStyle='#388E3C';ctx.lineWidth=s*.9;
    for(var bi=0;bi<4;bi++){var bsy=y-bh-trH*(bi*.28+.1);ctx.beginPath();ctx.moveTo(x-trW,bsy);ctx.lineTo(x+trW,bsy);ctx.stroke();}
    // Fan leaves
    for(var bfi=0;bfi<6;bfi++){var bfa=bfi/6*Math.PI*2;ctx.strokeStyle=bfi%2?'#4CAF50':'#66BB6A';ctx.lineWidth=s*1.6;ctx.beginPath();ctx.moveTo(x,cY+cR*.3);ctx.quadraticCurveTo(x+Math.cos(bfa)*cR*.5,cY-cR*.2,x+Math.cos(bfa)*cR*.9,cY+Math.sin(bfa)*cR*.5);ctx.stroke();}
    return cY-cR*.55;
  }
  if(id==='palmier'){
    for(var pi=0;pi<7;pi++){var pa=pi/7*Math.PI*2,px2=Math.cos(pa)*bw*.9,py2=Math.sin(pa)*bh*.7;ctx.strokeStyle='#4CAF50';ctx.lineWidth=s*2;ctx.beginPath();ctx.moveTo(x,cY);ctx.bezierCurveTo(x+px2*.4,cY+py2*.4-s*3,x+px2*.8,cY+py2*.8-s*2,x+px2,cY+py2);ctx.stroke();}
    return cY-s*5;
  }
  // Round canopy with radial gradient
  var cg=ctx.createRadialGradient(x-cR*.25,cY-cR*.25,0,x,cY,cR);
  cg.addColorStop(0,_gHL(col[0],1.35));cg.addColorStop(.55,col[0]);cg.addColorStop(1,_gHL(col[0],.72));
  ctx.beginPath();ctx.arc(x,cY,cR,0,Math.PI*2);ctx.fillStyle=cg;ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=0.6;ctx.stroke();
  // Cerisier blossoms
  if(id==='cerisier'){
    ctx.globalAlpha=.65;
    for(var fi=0;fi<9;fi++){var fa2=fi/9*Math.PI*2,fr=cR*(.38+Math.abs(Math.sin(fi*1.7))*.42);ctx.beginPath();ctx.arc(x+Math.cos(fa2)*fr,cY+Math.sin(fa2)*fr*.65,s*2.8,0,Math.PI*2);ctx.fillStyle='#F8A0C0';ctx.fill();}
    ctx.globalAlpha=1;
  }
  return cY-cR;
}
// ---- Small plants, flowers, rocks ----
function _gPlantSprite(ctx,x,y,bw,bh,oh,col,id,s){
  if(id==='nenuphare'){
    var ng=ctx.createRadialGradient(x,y-bh*.5,0,x,y-bh*.5,bw*.8);
    ng.addColorStop(0,'#43A047');ng.addColorStop(1,'#2E7D32');
    ctx.beginPath();ctx.moveTo(x,y-bh*.5);ctx.arc(x,y-bh*.5,bw*.75,-0.25,Math.PI*2-.1);ctx.closePath();ctx.fillStyle=ng;ctx.fill();
    ctx.beginPath();ctx.arc(x-bw*.1,y-bh*.5,bw*.22,0,Math.PI*2);ctx.fillStyle='#E91E63';ctx.fill();
    ctx.beginPath();ctx.arc(x-bw*.1,y-bh*.5,bw*.1,0,Math.PI*2);ctx.fillStyle='#FDD835';ctx.fill();
    return y-bh;
  }
  if(id==='pierre_deco'||id==='souche'){
    var rC=id==='souche'?['#8B4513','#5a2c08','#a86030']:['#9E9E9E','#616161','#C0C0C0'];
    var rh=oh*.7,rw=bw*.75;
    _gBox(ctx,x,y-bh*.5-rh,rw,bh*.55,rh,rC[0],rC[1],rC[2]);
    if(id==='souche'){
      // Rings on top
      ctx.strokeStyle='rgba(80,40,10,.35)';ctx.lineWidth=0.8;
      ctx.beginPath();ctx.ellipse(x,y-bh*.5-rh,rw*.55,bh*.3,0,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.ellipse(x,y-bh*.5-rh,rw*.3,bh*.16,0,0,Math.PI*2);ctx.stroke();
    }
    return y-bh*.5-rh-bh*.55;
  }
  if(id==='champignon_d'){
    // Stalk
    ctx.fillStyle='#EFEBE9';ctx.fillRect(x-s*2.5,y-bh-oh*.45,s*5,oh*.45+bh);
    // Cap
    var mr=bw*.7,mh=oh*.55;
    ctx.beginPath();ctx.moveTo(x-mr,y-bh-oh*.42);ctx.quadraticCurveTo(x-mr*.2,y-bh-oh*.42-mh,x,y-bh-oh*.42-mh);ctx.quadraticCurveTo(x+mr*.2,y-bh-oh*.42-mh,x+mr,y-bh-oh*.42);ctx.closePath();
    var mg=ctx.createLinearGradient(x-mr,y-bh-oh*.42-mh,x+mr,y-bh-oh*.42);
    mg.addColorStop(0,'#D32F2F');mg.addColorStop(1,'#B71C1C');ctx.fillStyle=mg;ctx.fill();
    // White spots
    ctx.fillStyle='rgba(255,255,255,.75)';
    [[-.35,.4],[.3,.55],[0,.25],[-.5,.6],[.55,.45]].forEach(function(d){ctx.beginPath();ctx.arc(x+d[0]*mr,y-bh-oh*.42-mh*d[1],s*2.2,0,Math.PI*2);ctx.fill();});
    return y-bh-oh*.42-mh;
  }
  // Stem
  var sh=oh*(id==='herbe'?.38:id==='buisson'?.25:.42);
  if(id!=='trefle')ctx.strokeStyle='#388E3C',ctx.lineWidth=s*1.6,ctx.beginPath(),ctx.moveTo(x,y-bh),ctx.lineTo(x,y-bh-sh),ctx.stroke();
  var hr=bw*(id==='tournesol'?.58:id==='buisson'?.82:id==='herbe'?.45:id==='cactus'?.38:.5);
  var hy=y-bh-sh-(id==='trefle'?0:hr*.35);
  if(id==='tournesol'){
    for(var pi=0;pi<8;pi++){var pa=pi/8*Math.PI*2;ctx.beginPath();ctx.ellipse(x+Math.cos(pa)*hr*.95,hy+Math.sin(pa)*hr*.72,s*3.8,s*2.2,pa,0,Math.PI*2);ctx.fillStyle='#FDD835';ctx.fill();}
    ctx.beginPath();ctx.arc(x,hy,hr*.42,0,Math.PI*2);ctx.fillStyle='#6D4C41';ctx.fill();
  }else if(id==='cactus'){
    ctx.fillStyle='#43A047';ctx.fillRect(x-s*3.2,y-bh-oh*.72,s*6.4,oh*.72+bh);
    ctx.beginPath();ctx.arc(x,y-bh-oh*.72,s*3.2,Math.PI,0);ctx.fill();
    ctx.fillRect(x-bw*.55,y-bh-oh*.44,bw*.28,s*4.5);ctx.fillRect(x+bw*.27,y-bh-oh*.34,bw*.28,s*4.5);
    ctx.beginPath();ctx.arc(x-bw*.41,y-bh-oh*.44,s*2.8,Math.PI,0);ctx.fill();
    ctx.beginPath();ctx.arc(x+bw*.41,y-bh-oh*.34,s*2.8,Math.PI,0);ctx.fill();
  }else if(id==='herbe'){
    for(var gi=0;gi<6;gi++){var ga=(gi-2.5)*.35,gx2=x+(gi-2.5)*bw*.18;ctx.strokeStyle=gi%2?'#4CAF50':'#66BB6A';ctx.lineWidth=s*1.5;ctx.beginPath();ctx.moveTo(gx2,y-bh);ctx.quadraticCurveTo(gx2+Math.sin(ga)*s*4,y-bh-sh*.5,gx2+Math.sin(ga*1.5)*s*7,y-bh-sh);ctx.stroke();}
    return y-bh-sh;
  }else if(id==='buisson'){
    for(var bi=0;bi<5;bi++){var ba2=bi/5*Math.PI*2;ctx.beginPath();ctx.arc(x+Math.cos(ba2)*hr*.52,hy+Math.sin(ba2)*hr*.4,hr*.56,0,Math.PI*2);ctx.fillStyle=bi%2?'#388E3C':'#4CAF50';ctx.fill();}
    ctx.beginPath();ctx.arc(x,hy,hr*.68,0,Math.PI*2);ctx.fillStyle='#43A047';ctx.fill();
  }else if(id==='trefle'){
    for(var ti=0;ti<4;ti++){var ta=ti/4*Math.PI*2;ctx.beginPath();ctx.arc(x+Math.cos(ta)*hr*.55,y-bh+Math.sin(ta)*hr*.4,hr*.55,0,Math.PI*2);ctx.fillStyle='#4CAF50';ctx.fill();}
  }else if(id==='lierre'){
    for(var ii=0;ii<6;ii++){var ia=ii/6*Math.PI*2,ir=hr*(0.4+Math.sin(ii)*0.3+.3);ctx.beginPath();ctx.ellipse(x+Math.cos(ia)*ir,hy+Math.sin(ia)*ir*.65,s*3.5,s*2.5,ia*.5,0,Math.PI*2);ctx.fillStyle=ii%2?'#43A047':'#2E7D32';ctx.fill();}
  }else{
    // Rose / fleur generic
    var fc=id==='rose'?'#E91E63':'#F060A0';
    for(var fli=0;fli<5;fli++){var fla=fli/5*Math.PI*2;ctx.beginPath();ctx.ellipse(x+Math.cos(fla)*hr*.65,hy+Math.sin(fla)*hr*.6,hr*.48,hr*.38,fla,0,Math.PI*2);ctx.fillStyle=fli%2?fc:_gHL(fc,1.2);ctx.fill();}
    ctx.beginPath();ctx.arc(x,hy,hr*.28,0,Math.PI*2);ctx.fillStyle='#FDD835';ctx.fill();
  }
  return hy-hr-(id==='tournesol'?s*2:0);
}
// ---- Water tiles dispatcher ----
function _gWaterSprite(ctx,x,y,bw,bh,s,id){
  if(id==='lac')return _gWLac(ctx,x,y,bw,bh,s);
  if(id==='riviere')return _gWRiviere(ctx,x,y,bw,bh,s);
  if(id==='mare')return _gWMare(ctx,x,y,bw,bh,s);
  return _gWLac(ctx,x,y,bw,bh,s);
}
// LAC — grand plan d'eau bleu profond avec rochers, roseaux, canard
function _gWLac(ctx,x,y,bw,bh,s){
  var wbw=bw*1.04,wbh=bh*1.04;
  var wg=ctx.createLinearGradient(x-wbw,y-wbh,x+wbw,y+wbh);
  wg.addColorStop(0,'#29B6F6');wg.addColorStop(.5,'#0288D1');wg.addColorStop(1,'#01579B');
  ctx.beginPath();ctx.moveTo(x,y-wbh);ctx.lineTo(x+wbw,y);ctx.lineTo(x,y+wbh);ctx.lineTo(x-wbw,y);ctx.closePath();
  ctx.fillStyle=wg;ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.22)';
  ctx.beginPath();ctx.ellipse(x-wbw*.25,y-wbh*.35,wbw*.3,wbh*.2,-.4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.32)';ctx.lineWidth=s*1.1;
  for(var wi=0;wi<3;wi++){var wy2=y+(-1+wi)*bh*.36,wa=(-1+wi)*.18;
    ctx.beginPath();ctx.moveTo(x-wbw*(0.38-wi*.06),wy2);
    ctx.quadraticCurveTo(x+Math.cos(wa)*wbw*.1,wy2-bh*.14,x+wbw*(0.38-wi*.06),wy2);ctx.stroke();}
  // Rochers aux coins
  [[-wbw*.85,-wbh*.05],[wbw*.85,-wbh*.05],[0,wbh*.85]].forEach(function(p){
    ctx.fillStyle='#616161';
    ctx.beginPath();ctx.arc(x+p[0],y+p[1],s*1.7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#9E9E9E';
    ctx.beginPath();ctx.arc(x+p[0]-s*.5,y+p[1]-s*.5,s*.9,0,Math.PI*2);ctx.fill();});
  // Roseaux
  ctx.strokeStyle='#33691E';ctx.lineWidth=s*.5;
  [[-wbw*.6,-wbh*.45],[wbw*.55,-wbh*.5],[wbw*.55,wbh*.4]].forEach(function(rp){
    for(var ri=0;ri<3;ri++){var rx=x+rp[0]+(ri-1)*s*.6,ry=y+rp[1];
      ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx+s*.3,ry-s*4);ctx.stroke();
      ctx.fillStyle='#5D4037';
      ctx.beginPath();ctx.ellipse(rx+s*.3,ry-s*4,s*.3,s,0,0,Math.PI*2);ctx.fill();}});
  // Canard
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.ellipse(x+bw*.2,y-bh*.05,s*1.5,s*.8,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x+bw*.32,y-bh*.15,s*.6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFC107';
  ctx.beginPath();ctx.moveTo(x+bw*.36,y-bh*.15);ctx.lineTo(x+bw*.42,y-bh*.13);ctx.lineTo(x+bw*.36,y-bh*.1);ctx.closePath();ctx.fill();
  ctx.fillStyle='#000';
  ctx.beginPath();ctx.arc(x+bw*.31,y-bh*.16,s*.15,0,Math.PI*2);ctx.fill();
  return y-wbh;
}
// RIVIERE — eau qui coule avec courants, flèches, poisson, berges
function _gWRiviere(ctx,x,y,bw,bh,s){
  var wbw=bw*1.04,wbh=bh*1.04;
  var wg=ctx.createLinearGradient(x-wbw,y-wbh,x+wbw,y+wbh);
  wg.addColorStop(0,'#4FC3F7');wg.addColorStop(.5,'#0277BD');wg.addColorStop(1,'#01579B');
  ctx.beginPath();ctx.moveTo(x,y-wbh);ctx.lineTo(x+wbw,y);ctx.lineTo(x,y+wbh);ctx.lineTo(x-wbw,y);ctx.closePath();
  ctx.fillStyle=wg;ctx.fill();
  // Courants en bezier (fortes lignes de courant)
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=s*.9;
  for(var fi=0;fi<5;fi++){
    var fy=y+(fi-2)*bh*.3;
    var xstart=x-wbw*(0.7-Math.abs(fi-2)*0.15);
    var xend=x+wbw*(0.7-Math.abs(fi-2)*0.15);
    ctx.beginPath();ctx.moveTo(xstart,fy);
    ctx.bezierCurveTo(xstart+wbw*.3,fy-bh*.12,xend-wbw*.3,fy+bh*.12,xend,fy);
    ctx.stroke();}
  // Flèches de courant
  ctx.fillStyle='rgba(255,255,255,.45)';
  for(var ai=0;ai<3;ai++){
    var ax=x-wbw*.4+ai*wbw*.4,ay=y-bh*.1+ai*bh*.05;
    ctx.beginPath();ctx.moveTo(ax,ay-s);ctx.lineTo(ax+s*1.6,ay);
    ctx.lineTo(ax,ay+s);ctx.closePath();ctx.fill();}
  // Berges (touffes d'herbe en haut et bas)
  ctx.fillStyle='#388E3C';
  ctx.beginPath();ctx.ellipse(x,y-wbh+s*1.5,wbw*.3,s*1.5,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(x,y+wbh-s*1.5,wbw*.3,s*1.5,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#1B5E20';ctx.lineWidth=s*.4;
  for(var gi=0;gi<5;gi++){var gx=x+(gi-2)*wbw*.15;
    ctx.beginPath();ctx.moveTo(gx,y-wbh+s);ctx.lineTo(gx+s*.3,y-wbh-s*1.5);ctx.stroke();
    ctx.beginPath();ctx.moveTo(gx,y+wbh-s);ctx.lineTo(gx+s*.3,y+wbh+s*.5);ctx.stroke();}
  // Poisson orange qui saute
  ctx.fillStyle='#FF9800';
  ctx.beginPath();ctx.ellipse(x-bw*.2,y,s*1.5,s*.6,0.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#F57C00';
  ctx.beginPath();ctx.moveTo(x-bw*.35,y);ctx.lineTo(x-bw*.5,y-s);ctx.lineTo(x-bw*.5,y+s);ctx.closePath();ctx.fill();
  ctx.fillStyle='#000';
  ctx.beginPath();ctx.arc(x-bw*.1,y-s*.2,s*.2,0,Math.PI*2);ctx.fill();
  return y-wbh;
}
// MARE — petite mare verte avec nénuphars, fleur rose, grenouille
function _gWMare(ctx,x,y,bw,bh,s){
  var wbw=bw*.85,wbh=bh*.85;
  var wg=ctx.createLinearGradient(x-wbw,y-wbh,x+wbw,y+wbh);
  wg.addColorStop(0,'#26A69A');wg.addColorStop(.5,'#00796B');wg.addColorStop(1,'#004D40');
  ctx.beginPath();ctx.moveTo(x,y-wbh);ctx.lineTo(x+wbw,y);ctx.lineTo(x,y+wbh);ctx.lineTo(x-wbw,y);ctx.closePath();
  ctx.fillStyle=wg;ctx.fill();
  // Roseaux autour
  ctx.strokeStyle='#33691E';ctx.lineWidth=s*.45;
  for(var ri=0;ri<7;ri++){var ra=ri/7*Math.PI*2;
    var rx=x+Math.cos(ra)*wbw*.95,ry=y+Math.sin(ra)*wbh*.7;
    ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx+s*.2,ry-s*3);ctx.stroke();
    ctx.fillStyle='#5D4037';
    ctx.beginPath();ctx.ellipse(rx+s*.2,ry-s*3.5,s*.25,s*.8,0,0,Math.PI*2);ctx.fill();}
  // Nénuphars (3 disques verts)
  [[-bw*.3,bh*.05],[bw*.25,-bh*.15],[bw*.05,bh*.3]].forEach(function(p){
    ctx.fillStyle='#43A047';
    ctx.beginPath();ctx.ellipse(x+p[0],y+p[1],bw*.18,bh*.15,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.25)';
    ctx.beginPath();ctx.moveTo(x+p[0]+bw*.18,y+p[1]);ctx.lineTo(x+p[0]+bw*.05,y+p[1]+bh*.04);ctx.lineTo(x+p[0]+bw*.05,y+p[1]-bh*.04);ctx.closePath();ctx.fill();});
  // Fleur de nénuphar rose
  ctx.fillStyle='#F8BBD0';
  ctx.beginPath();ctx.arc(x-bw*.3,y+bh*.05-s,s*1.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#E91E63';
  ctx.beginPath();ctx.arc(x-bw*.3,y+bh*.05-s,s*.7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFC107';
  ctx.beginPath();ctx.arc(x-bw*.3,y+bh*.05-s,s*.3,0,Math.PI*2);ctx.fill();
  // Grenouille verte
  ctx.fillStyle='#33691E';
  ctx.beginPath();ctx.arc(x+bw*.05,y+bh*.3-s,s*.8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFEB3B';
  ctx.beginPath();ctx.arc(x+bw*.05-s*.4,y+bh*.3-s*1.7,s*.25,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x+bw*.05+s*.4,y+bh*.3-s*1.7,s*.25,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#000';
  ctx.beginPath();ctx.arc(x+bw*.05-s*.4,y+bh*.3-s*1.7,s*.12,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x+bw*.05+s*.4,y+bh*.3-s*1.7,s*.12,0,Math.PI*2);ctx.fill();
  // Bulles
  ctx.fillStyle='rgba(255,255,255,.6)';
  ctx.beginPath();ctx.arc(x-bw*.1,y-bh*.05,s*.4,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x+bw*.15,y+bh*.1,s*.3,0,Math.PI*2);ctx.fill();
  return y-wbh;
}
// ---- Lampadaire ----
function _gPoleSprite(ctx,x,y,bw,bh,oh,s){
  var ph=oh*.88,pw=Math.max(s*2,1.5);
  // Pole
  var pg=ctx.createLinearGradient(x-pw,0,x+pw,0);pg.addColorStop(0,'#424242');pg.addColorStop(.5,'#757575');pg.addColorStop(1,'#424242');
  ctx.fillStyle=pg;ctx.fillRect(x-pw,y-bh-ph,pw*2,ph+bh);
  // Arm
  ctx.strokeStyle='#424242';ctx.lineWidth=pw*1.2;
  ctx.beginPath();ctx.moveTo(x,y-bh-ph);ctx.quadraticCurveTo(x+bw*.38,y-bh-ph+s*4,x+bw*.45,y-bh-ph+s*8);ctx.stroke();
  // Lamp globe
  var lr=s*5.5;var lx=x+bw*.45,ly=y-bh-ph+s*8;
  var lglw=ctx.createRadialGradient(lx-lr*.3,ly-lr*.3,0,lx,ly,lr);
  lglw.addColorStop(0,'rgba(255,255,200,.98)');lglw.addColorStop(.5,'rgba(255,220,60,.75)');lglw.addColorStop(1,'rgba(255,180,0,.1)');
  ctx.beginPath();ctx.arc(lx,ly,lr,0,Math.PI*2);ctx.fillStyle=lglw;ctx.fill();
  // Glow halo
  ctx.globalAlpha=.18;ctx.beginPath();ctx.arc(lx,ly,lr*3,0,Math.PI*2);ctx.fillStyle='rgba(255,220,60,1)';ctx.fill();ctx.globalAlpha=1;
  return y-bh-ph-lr;
}
// ---- Fontaine ----
function _gFountainSprite(ctx,x,y,bw,bh,oh,s){
  var bz=bw*.78,bz2=bh*.62;
  _gBox(ctx,x,y-bz2*.55,bz,bz2*.5,bz2*.4,'#B0BEC5','#78909C','#CFD8DC');
  // Water in basin
  var wbg=ctx.createLinearGradient(x-bz,y-bz2,x+bz,y);
  wbg.addColorStop(0,'rgba(41,182,246,.8)');wbg.addColorStop(1,'rgba(1,87,155,.6)');
  ctx.beginPath();ctx.moveTo(x,y-bz2);ctx.lineTo(x+bz,y-bz2*.5);ctx.lineTo(x,y);ctx.lineTo(x-bz,y-bz2*.5);ctx.closePath();ctx.fillStyle=wbg;ctx.fill();
  // Water jet arc
  ctx.strokeStyle='rgba(130,210,255,.88)';ctx.lineWidth=s*2.2;
  ctx.beginPath();ctx.moveTo(x,y-bz2*.5);ctx.bezierCurveTo(x-bz*.65,y-bz2*.5-oh*.75,x+bz*.65,y-bz2*.5-oh*.75,x,y-bz2*.5);ctx.stroke();
  // Droplets
  ctx.fillStyle='rgba(100,190,255,.7)';
  [[-bz*.55,y-bz2*.5-oh*.55],[bz*.55,y-bz2*.5-oh*.55],[0,y-bz2*.5-oh*.82]].forEach(function(d){ctx.beginPath();ctx.arc(d[0]+x,d[1],s*2,0,Math.PI*2);ctx.fill();});
  return y-bz2*.5-oh*.85;
}
// === Mobilier dispatcher ===
function _gMobSprite(ctx,x,y,bw,bh,oh,col,id,s){
  if(id==='lampadaire')return _gPoleSprite(ctx,x,y,bw,bh,oh,s);
  if(id==='fontaine')return _gFountainSprite(ctx,x,y,bw,bh,oh,s);
  if(id==='boite_lettre')return _gMboite(ctx,x,y,bw,bh,oh,s);
  if(id==='pot_fleur')return _gMpot(ctx,x,y,bw,bh,oh,s);
  if(id==='table')return _gMtable(ctx,x,y,bw,bh,oh,s);
  if(id==='banc')return _gMbanc(ctx,x,y,bw,bh,oh,s);
  if(id==='hamac')return _gMhamac(ctx,x,y,bw,bh,oh,s);
  if(id==='barbecue')return _gMbbq(ctx,x,y,bw,bh,oh,s);
  if(id==='balancoire')return _gMswing(ctx,x,y,bw,bh,oh,s);
  if(id==='parasol')return _gMumb(ctx,x,y,bw,bh,oh,s);
  if(id==='toboggan')return _gMslide(ctx,x,y,bw,bh,oh,s);
  if(id==='borne')return _gMborne(ctx,x,y,bw,bh,oh,s);
  if(id==='horloge')return _gMclock(ctx,x,y,bw,bh,oh,s);
  if(id==='telescope')return _gMtele(ctx,x,y,bw,bh,oh,s);
  if(id==='statue')return _gMstatue(ctx,x,y,bw,bh,oh,s);
  if(id==='jacuzzi')return _gMjacuz(ctx,x,y,bw,bh,oh,s);
  var oy=y-bh-oh;_gBox(ctx,x,oy,bw,bh,oh,col[0],col[1],col[2]);return oy-bh;
}
// === Fence/Cloture dispatcher ===
function _gFenceSprite(ctx,x,y,bw,bh,oh,col,id,s){
  if(id==='chemin')return _gFchemin(ctx,x,y,bw,bh,oh,s);
  if(id==='cloture_bois')return _gFcloture(ctx,x,y,bw,bh,oh,s);
  if(id==='haie')return _gFhaie(ctx,x,y,bw,bh,oh,s);
  if(id==='allee')return _gFallee(ctx,x,y,bw,bh,oh,s);
  if(id==='muret')return _gFmuret(ctx,x,y,bw,bh,oh,s);
  if(id==='mur_pierre')return _gFmurp(ctx,x,y,bw,bh,oh,s);
  if(id==='barriere')return _gFbar(ctx,x,y,bw,bh,oh,s);
  if(id==='escalier')return _gFstairs(ctx,x,y,bw,bh,oh,s);
  if(id==='portail')return _gFgate(ctx,x,y,bw,bh,oh,s);
  if(id==='arche')return _gFarche(ctx,x,y,bw,bh,oh,s);
  if(id==='passerelle')return _gFwalk(ctx,x,y,bw,bh,oh,s);
  if(id==='pont')return _gFbridge(ctx,x,y,bw,bh,oh,s);
  var oy=y-bh-oh;_gBox(ctx,x,oy,bw,bh,oh,col[0],col[1],col[2]);return oy-bh;
}
// MOBILIER — boite aux lettres rouge
function _gMboite(ctx,x,y,bw,bh,oh,s){
  var pH=oh*.6,pw=bw*.1,ph=bh*.1;
  _gBox(ctx,x,y-bh-pH,pw,ph,pH,'#8B4513','#5D2F08','#A0633A');
  var mw=bw*.42,mh=bh*.4,mH=oh*.32;
  _gBox(ctx,x,y-bh-pH-mH,mw,mh,mH,'#F44336','#B71C1C','#EF5350');
  _gRF(ctx,x,y-bh-pH-mH,mw,mh,mH,.2,.35,.8,.5,'#fff',null);
  ctx.fillStyle='#D32F2F';ctx.fillRect(x+mw*.7,y-bh-pH-mH+mh*.2,s*1.2,s*2);
  return y-bh-pH-mH;
}
// MOBILIER — pot de fleurs avec plante
function _gMpot(ctx,x,y,bw,bh,oh,s){
  var pw=bw*.5,ph=bh*.5,pH=oh*.5;
  _gBox(ctx,x,y-bh-pH,pw,ph,pH,'#D2691E','#8B4513','#E89060');
  _gBox(ctx,x,y-bh-pH,pw*1.15,ph*1.15,pH*.12,'#F08850','#A05028','#FFA070');
  ctx.fillStyle='#3E2723';
  ctx.beginPath();ctx.ellipse(x,y-bh-pH-pH*.06,pw*.85,ph*.85,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#43A047';
  ctx.beginPath();ctx.arc(x,y-bh-pH-oh*.16,bw*.2,0,Math.PI*2);ctx.fill();
  [['#E91E63',-bw*.2,-oh*.22],['#FFC107',0,-oh*.32],['#9C27B0',bw*.2,-oh*.2]].forEach(function(f){
    ctx.fillStyle=f[0];ctx.beginPath();ctx.arc(x+f[1],y-bh-pH+f[2],bw*.13,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#FFEB3B';ctx.beginPath();ctx.arc(x+f[1],y-bh-pH+f[2],bw*.05,0,Math.PI*2);ctx.fill();});
  return y-bh-pH-oh*.4;
}
// MOBILIER — table en bois avec assiette + tasse
function _gMtable(ctx,x,y,bw,bh,oh,s){
  var lH=oh*.55,tw=bw*.85,th=bh*.85,tH=oh*.12;
  ctx.fillStyle='#5D4037';
  ctx.fillRect(x-tw*.7,y-bh-lH,s*.8,lH+bh*.3);
  ctx.fillRect(x+tw*.7-s*.8,y-bh-lH,s*.8,lH+bh*.3);
  ctx.fillRect(x-s*.4,y-lH,s*.8,lH);
  _gBox(ctx,x,y-bh-lH,tw,th,tH,'#A0785A','#6D4C2A','#C09078');
  ctx.fillStyle='#FFF8E1';
  ctx.beginPath();ctx.ellipse(x-bw*.2,y-bh-lH+bh*.05,bw*.18,bh*.13,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#5D4037';ctx.fillRect(x+bw*.15,y-bh-lH-s*1.2,s*1.5,s*1.5);
  ctx.strokeStyle='#5D4037';ctx.lineWidth=s*.4;
  ctx.beginPath();ctx.arc(x+bw*.15+s*1.7,y-bh-lH-s*.5,s*.7,-Math.PI*.5,Math.PI*.5);ctx.stroke();
  return y-bh-lH-tH;
}
// MOBILIER — banc en bois
function _gMbanc(ctx,x,y,bw,bh,oh,s){
  var tw=bw*.95,th=bh*.4,tH=oh*.1;
  var ty=y-bh*.7-oh*.45;
  ctx.fillStyle='#4E342E';
  ctx.fillRect(x-tw*.85,y-oh*.5,s*.8,oh*.5+bh*.3);
  ctx.fillRect(x+tw*.85-s*.8,y-oh*.5,s*.8,oh*.5+bh*.3);
  _gBox(ctx,x,ty,tw,th,tH,'#8D6E63','#4E342E','#A88878');
  var bH=oh*.45;
  ctx.fillStyle='#4E342E';
  ctx.fillRect(x-tw*.85,ty-bH,s*.8,bH);
  ctx.fillRect(x+tw*.85-s*.8,ty-bH,s*.8,bH);
  ctx.fillStyle='#8D6E63';
  for(var bi=0;bi<3;bi++){ctx.fillRect(x-tw*.8,ty-bH+bi*bH*.3,tw*1.6,bH*.16);}
  return ty-bH;
}
// MOBILIER — hamac entre 2 poteaux
function _gMhamac(ctx,x,y,bw,bh,oh,s){
  var pH=oh*.65;
  ctx.fillStyle='#6D4C2A';
  ctx.fillRect(x-bw*.85,y-bh-pH,s*.8,pH+bh);
  ctx.fillRect(x+bw*.85-s*.8,y-bh-pH,s*.8,pH+bh);
  ctx.fillStyle='#A0785A';
  ctx.beginPath();ctx.arc(x-bw*.85+s*.4,y-bh-pH,s*1,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x+bw*.85-s*.4,y-bh-pH,s*1,0,Math.PI*2);ctx.fill();
  var hy1=y-bh-pH*.3,hy2=y-bh-pH*.05;
  ctx.fillStyle='#29B6F6';
  ctx.beginPath();
  ctx.moveTo(x-bw*.8,hy1);ctx.quadraticCurveTo(x,hy2,x+bw*.8,hy1);
  ctx.lineTo(x+bw*.8,hy1+s*1.5);ctx.quadraticCurveTo(x,hy2+s*1.5,x-bw*.8,hy1+s*1.5);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#F48FB1';
  ctx.beginPath();
  ctx.moveTo(x-bw*.8,hy1+s*.3);ctx.quadraticCurveTo(x,hy2+s*.3,x+bw*.8,hy1+s*.3);
  ctx.lineTo(x+bw*.8,hy1+s*.7);ctx.quadraticCurveTo(x,hy2+s*.7,x-bw*.8,hy1+s*.7);
  ctx.closePath();ctx.fill();
  return y-bh-pH;
}
// MOBILIER — barbecue avec flammes
function _gMbbq(ctx,x,y,bw,bh,oh,s){
  var bw2=bw*.55,bh2=bh*.5,bH=oh*.42;
  ctx.fillStyle='#212121';
  ctx.fillRect(x-bw2*.6,y-bh*.5,s*.6,bh*.5+bH*.4);
  ctx.fillRect(x+bw2*.6-s*.6,y-bh*.5,s*.6,bh*.5+bH*.4);
  _gBox(ctx,x,y-bh-bH,bw2,bh2,bH,'#424242','#212121','#616161');
  var ty=y-bh-bH;
  ctx.strokeStyle='#9E9E9E';ctx.lineWidth=s*.5;
  for(var gi=0;gi<5;gi++){var gv=gi/4*bw2*1.5-bw2*.75;
    ctx.beginPath();ctx.moveTo(x+gv,ty-bh2*.3);ctx.lineTo(x+gv*.8,ty+bh2*.3);ctx.stroke();}
  ctx.fillStyle='#FF5722';
  ctx.beginPath();
  ctx.moveTo(x-bw*.2,ty);ctx.quadraticCurveTo(x-bw*.25,ty-oh*.18,x-bw*.1,ty-oh*.22);
  ctx.quadraticCurveTo(x,ty-oh*.36,x+bw*.05,ty-oh*.22);
  ctx.quadraticCurveTo(x+bw*.2,ty-oh*.18,x+bw*.2,ty);ctx.closePath();ctx.fill();
  ctx.fillStyle='#FFC107';
  ctx.beginPath();
  ctx.moveTo(x-bw*.1,ty);ctx.quadraticCurveTo(x-bw*.05,ty-oh*.13,x,ty-oh*.22);
  ctx.quadraticCurveTo(x+bw*.1,ty-oh*.13,x+bw*.1,ty);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(180,180,180,.5)';
  ctx.beginPath();ctx.arc(x,ty-oh*.45,s*1.5,0,Math.PI*2);ctx.fill();
  return ty-oh*.45;
}
// MOBILIER — balançoire avec structure A
function _gMswing(ctx,x,y,bw,bh,oh,s){
  var pH=oh*.85;
  ctx.strokeStyle='#a07048';ctx.lineWidth=s*1.4;
  ctx.beginPath();ctx.moveTo(x-bw*.8,y);ctx.lineTo(x,y-bh-pH);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+bw*.8,y);ctx.lineTo(x,y-bh-pH);ctx.stroke();
  ctx.strokeStyle='#5a3020';ctx.lineWidth=s*1.2;
  ctx.beginPath();ctx.moveTo(x-bw*.4,y-bh-pH*.95);ctx.lineTo(x+bw*.4,y-bh-pH*.95);ctx.stroke();
  ctx.strokeStyle='#8D6E63';ctx.lineWidth=s*.6;
  var sy=y-bh-pH*.3;
  ctx.beginPath();ctx.moveTo(x-bw*.18,y-bh-pH*.95);ctx.lineTo(x-bw*.18,sy);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+bw*.18,y-bh-pH*.95);ctx.lineTo(x+bw*.18,sy);ctx.stroke();
  ctx.fillStyle='#FF7043';ctx.fillRect(x-bw*.27,sy,bw*.54,s*1.5);
  ctx.fillStyle='#D84315';ctx.fillRect(x-bw*.27,sy+s*1.5,bw*.54,s*.5);
  return y-bh-pH;
}
// MOBILIER — parasol orange
function _gMumb(ctx,x,y,bw,bh,oh,s){
  var pH=oh*.85;
  ctx.fillStyle='#795548';ctx.fillRect(x-s*.5,y-bh-pH,s,pH+bh);
  var cy=y-bh-pH,cR=bw*1.05;
  for(var pi=0;pi<8;pi++){var pa1=pi/8*Math.PI-Math.PI,pa2=(pi+1)/8*Math.PI-Math.PI;
    ctx.beginPath();ctx.moveTo(x,cy);
    ctx.lineTo(x+Math.cos(pa1)*cR,cy+Math.sin(pa1)*cR*.4+oh*.05);
    ctx.lineTo(x+Math.cos(pa2)*cR,cy+Math.sin(pa2)*cR*.4+oh*.05);
    ctx.closePath();
    ctx.fillStyle=pi%2?'#FF6B35':'#FF9800';ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=s*.4;ctx.stroke();}
  ctx.fillStyle='#5D4037';ctx.beginPath();ctx.arc(x,cy-s*.5,s*.8,0,Math.PI*2);ctx.fill();
  return cy-s;
}
// MOBILIER — toboggan avec échelle et glissière
function _gMslide(ctx,x,y,bw,bh,oh,s){
  var lH=oh*.7;
  ctx.fillStyle='#FFC107';
  ctx.fillRect(x-bw*.85,y-bh-lH,s*.7,lH+bh);
  ctx.fillRect(x-bw*.5,y-bh-lH,s*.7,lH+bh);
  ctx.strokeStyle='#FFA000';ctx.lineWidth=s*.5;
  for(var ri=0;ri<5;ri++){var rv=y-bh-lH+ri/5*lH*.95;
    ctx.beginPath();ctx.moveTo(x-bw*.85,rv);ctx.lineTo(x-bw*.5,rv);ctx.stroke();}
  var tx=x-bw*.5,ty=y-bh-lH;
  ctx.fillStyle='#FF9800';ctx.fillRect(tx,ty,bw*.4,s*1.5);
  ctx.strokeStyle='#1976D2';ctx.lineWidth=s*4;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(tx+bw*.4,ty+s*.5);
  ctx.bezierCurveTo(x+bw*.2,ty+oh*.3,x+bw*.4,y-bh*.5,x+bw*.85,y);ctx.stroke();
  ctx.strokeStyle='#42A5F5';ctx.lineWidth=s*1.5;
  ctx.beginPath();ctx.moveTo(tx+bw*.4,ty+s*.5);
  ctx.bezierCurveTo(x+bw*.2,ty+oh*.3,x+bw*.4,y-bh*.5,x+bw*.85,y);ctx.stroke();
  ctx.lineCap='butt';
  return ty;
}
// MOBILIER — borne directionnelle
function _gMborne(ctx,x,y,bw,bh,oh,s){
  var pw=bw*.18,ph=bh*.18,pH=oh*.85;
  _gBox(ctx,x,y-bh-pH,pw,ph,pH,'#FFFFFF','#BDBDBD','#F5F5F5');
  _gBox(ctx,x,y-bh-pH,pw,ph,pH*.18,'#E53935','#B71C1C','#EF5350');
  ctx.fillStyle='#000';
  ctx.fillRect(x-s*.4,y-bh-pH+pH*.4,s*.8,pH*.3);
  ctx.beginPath();ctx.arc(x,y-bh-pH+pH*.32,s*.5,0,Math.PI*2);ctx.fill();
  return y-bh-pH;
}
// MOBILIER — horloge avec cadran
function _gMclock(ctx,x,y,bw,bh,oh,s){
  var pw=bw*.32,ph=bh*.32,pH=oh*.7;
  _gBox(ctx,x,y-bh-pH,pw,ph,pH,'#A0785A','#5D4037','#C09878');
  var fx=x+pw*.5,fy=y-bh-pH+pH*.3;
  ctx.fillStyle='#F9A825';
  ctx.beginPath();ctx.arc(fx,fy,oh*.18,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#5D4037';ctx.lineWidth=s*.5;ctx.stroke();
  ctx.strokeStyle='#212121';ctx.lineWidth=s*.4;
  for(var hi=0;hi<12;hi++){var ha=hi/12*Math.PI*2-Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(fx+Math.cos(ha)*oh*.14,fy+Math.sin(ha)*oh*.14);
    ctx.lineTo(fx+Math.cos(ha)*oh*.18,fy+Math.sin(ha)*oh*.18);ctx.stroke();}
  ctx.lineWidth=s*.5;
  ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx,fy-oh*.13);ctx.stroke();
  ctx.lineWidth=s*.7;
  ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx+oh*.08,fy);ctx.stroke();
  var rH=oh*.18;
  ctx.fillStyle='#5D4037';
  ctx.beginPath();
  ctx.moveTo(x-pw,y-bh-pH);ctx.lineTo(x,y-bh-pH-rH);ctx.lineTo(x+pw,y-bh-pH);
  ctx.lineTo(x,y-bh-pH+ph);ctx.closePath();ctx.fill();
  return y-bh-pH-rH;
}
// MOBILIER — telescope sur trépied
function _gMtele(ctx,x,y,bw,bh,oh,s){
  var lH=oh*.5;
  ctx.strokeStyle='#37474F';ctx.lineWidth=s*1;
  ctx.beginPath();ctx.moveTo(x-bw*.4,y);ctx.lineTo(x,y-bh-lH);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+bw*.4,y);ctx.lineTo(x,y-bh-lH);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,y-bh*.5);ctx.lineTo(x,y-bh-lH);ctx.stroke();
  ctx.fillStyle='#263238';
  ctx.beginPath();ctx.arc(x,y-bh-lH,s*1.5,0,Math.PI*2);ctx.fill();
  var tcy=y-bh-lH-s*1,ang=-Math.PI*.35;
  var tubeL=oh*.55,tubeR=s*1.6;
  var ex=x+Math.cos(ang)*tubeL,ey=tcy+Math.sin(ang)*tubeL;
  ctx.strokeStyle='#90A4AE';ctx.lineWidth=tubeR;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x,tcy);ctx.lineTo(ex,ey);ctx.stroke();
  ctx.lineCap='butt';
  ctx.fillStyle='#212121';
  ctx.beginPath();ctx.arc(x,tcy,s*1.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1565C0';
  ctx.beginPath();ctx.arc(ex,ey,tubeR*.7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.4)';
  ctx.beginPath();ctx.arc(ex-tubeR*.2,ey-tubeR*.2,tubeR*.3,0,Math.PI*2);ctx.fill();
  return ey-tubeR;
}
// MOBILIER — statue sur piédestal
function _gMstatue(ctx,x,y,bw,bh,oh,s){
  var pw=bw*.55,ph=bh*.55,pH=oh*.4;
  _gBox(ctx,x,y-bh-pH,pw,ph,pH,'#9E9E9E','#616161','#BDBDBD');
  _gBox(ctx,x,y-bh-pH,pw*1.15,ph*1.15,pH*.1,'#BDBDBD','#757575','#E0E0E0');
  var fy=y-bh-pH;
  ctx.fillStyle='#D8D8D8';
  ctx.beginPath();
  ctx.moveTo(x-bw*.26,fy-oh*.06);ctx.lineTo(x-bw*.16,fy-oh*.5);
  ctx.lineTo(x+bw*.16,fy-oh*.5);ctx.lineTo(x+bw*.26,fy-oh*.06);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#E0E0E0';
  ctx.beginPath();ctx.arc(x,fy-oh*.55,bw*.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#D8D8D8';
  ctx.fillRect(x-bw*.32,fy-oh*.42,s*1.2,oh*.25);
  ctx.fillRect(x+bw*.32-s*1.2,fy-oh*.42,s*1.2,oh*.25);
  ctx.fillStyle='#FFD700';
  ctx.beginPath();
  ctx.moveTo(x-bw*.18,fy-oh*.62);ctx.lineTo(x-bw*.18,fy-oh*.7);
  ctx.lineTo(x-bw*.1,fy-oh*.72);ctx.lineTo(x,fy-oh*.78);
  ctx.lineTo(x+bw*.1,fy-oh*.72);ctx.lineTo(x+bw*.18,fy-oh*.7);
  ctx.lineTo(x+bw*.18,fy-oh*.62);ctx.closePath();ctx.fill();
  return fy-oh*.78;
}
// MOBILIER — jacuzzi avec eau bouillonnante et vapeur
function _gMjacuz(ctx,x,y,bw,bh,oh,s){
  var bw2=bw*.85,bh2=bh*.85,bH=oh*.5;
  _gBox(ctx,x,y-bh2-bH,bw2,bh2,bH,'#A0785A','#6D4C2A','#C09878');
  var wbw=bw2*.85,wbh=bh2*.85;
  ctx.fillStyle='#00BCD4';
  ctx.beginPath();
  ctx.moveTo(x,y-bh2-bH-wbh*.05);
  ctx.lineTo(x+wbw,y-bh2-bH+wbh*.4);
  ctx.lineTo(x,y-bh2-bH+wbh);
  ctx.lineTo(x-wbw,y-bh2-bH+wbh*.4);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.3)';
  ctx.beginPath();ctx.ellipse(x-wbw*.2,y-bh2-bH+wbh*.3,wbw*.4,wbh*.2,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.7)';
  [[-wbw*.3,wbh*.3,1.5],[wbw*.2,wbh*.45,1.2],[-wbw*.1,wbh*.55,1.8],[wbw*.35,wbh*.6,1]].forEach(function(b){
    ctx.beginPath();ctx.arc(x+b[0],y-bh2-bH+b[1],s*b[2],0,Math.PI*2);ctx.fill();});
  ctx.fillStyle='rgba(220,220,220,.5)';
  ctx.beginPath();ctx.arc(x-bw*.2,y-bh2-bH-oh*.1,s*1.8,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x+bw*.1,y-bh2-bH-oh*.18,s*2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x+bw*.3,y-bh2-bH-oh*.05,s*1.6,0,Math.PI*2);ctx.fill();
  return y-bh2-bH-oh*.2;
}
// CLOTURE — chemin: 4 dalles de pierre au sol
function _gFchemin(ctx,x,y,bw,bh,oh,s){
  for(var ti=0;ti<4;ti++){var tu=ti%2,tv=Math.floor(ti/2);
    var dx=(tu-.5)*bw*.7,dy=(tv-.5)*bh*.6;
    var sw=bw*.32,sh=bh*.3;
    ctx.fillStyle=ti%2?'#9E9E9E':'#757575';
    ctx.beginPath();
    ctx.moveTo(x+dx,y+dy-sh);ctx.lineTo(x+dx+sw,y+dy);
    ctx.lineTo(x+dx,y+dy+sh);ctx.lineTo(x+dx-sw,y+dy);
    ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=s*.4;ctx.stroke();}
  return y-bh*.5;
}
// CLOTURE — clôture en bois avec piquets pointus
function _gFcloture(ctx,x,y,bw,bh,oh,s){
  var fH=oh*.85;
  ctx.fillStyle='#5a3820';
  ctx.fillRect(x-bw*.85,y-bh*.1-fH*.65,bw*1.7,s*1);
  ctx.fillRect(x-bw*.85,y-bh*.1-fH*.25,bw*1.7,s*1);
  ctx.fillStyle='#9a7050';ctx.strokeStyle='#5a3820';ctx.lineWidth=s*.4;
  for(var fi=0;fi<5;fi++){var fx=x-bw*.7+fi*bw*.35;
    var sH=fH*(0.85+(fi%2)*0.08);
    ctx.beginPath();
    ctx.moveTo(fx-s*.8,y);ctx.lineTo(fx-s*.8,y-bh*.1-sH);
    ctx.lineTo(fx,y-bh*.1-sH-s*1.4);
    ctx.lineTo(fx+s*.8,y-bh*.1-sH);ctx.lineTo(fx+s*.8,y);
    ctx.closePath();ctx.fill();ctx.stroke();}
  return y-bh-fH;
}
// CLOTURE — haie verte avec plusieurs buissons
function _gFhaie(ctx,x,y,bw,bh,oh,s){
  for(var hi=0;hi<6;hi++){var hx=x-bw*.85+hi*bw*.34;
    ctx.fillStyle='#2E7D32';
    ctx.beginPath();ctx.arc(hx,y-bh*.2,bw*.2,0,Math.PI*2);ctx.fill();}
  for(var hj=0;hj<5;hj++){var hx=x-bw*.7+hj*bw*.35;
    var hy=y-bh*.45-oh*.4,hr=bw*.25;
    var hg=ctx.createRadialGradient(hx-hr*.3,hy-hr*.3,0,hx,hy,hr);
    hg.addColorStop(0,'#60B060');hg.addColorStop(.6,'#388E3C');hg.addColorStop(1,'#1B5E20');
    ctx.fillStyle=hg;
    ctx.beginPath();ctx.arc(hx,hy,hr,0,Math.PI*2);ctx.fill();}
  return y-bh*.45-oh*.6;
}
// CLOTURE — allée: dalles claires en damier
function _gFallee(ctx,x,y,bw,bh,oh,s){
  ctx.fillStyle='#E0E0E0';
  ctx.beginPath();
  ctx.moveTo(x,y-bh);ctx.lineTo(x+bw,y);ctx.lineTo(x,y+bh*.4);ctx.lineTo(x-bw,y);
  ctx.closePath();ctx.fill();
  for(var pi=0;pi<2;pi++){for(var pj=0;pj<2;pj++){
    var px=(pi-.5)*bw*.6,py=(pj-.5)*bh*.55;
    ctx.fillStyle=(pi+pj)%2?'#BDBDBD':'#E8E8E8';
    ctx.beginPath();
    ctx.moveTo(x+px,y+py-bh*.25);ctx.lineTo(x+px+bw*.3,y+py);
    ctx.lineTo(x+px,y+py+bh*.25);ctx.lineTo(x+px-bw*.3,y+py);
    ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=s*.3;ctx.stroke();}}
  return y-bh*.5;
}
// CLOTURE — muret bas en pierre
function _gFmuret(ctx,x,y,bw,bh,oh,s){
  var bw2=bw*.85,bh2=bh*.4,wH=oh*.7;
  _gBox(ctx,x,y-bh2-wH,bw2,bh2,wH,'#B0A898','#706860','#D0C8C0');
  ctx.strokeStyle='rgba(60,50,40,.35)';ctx.lineWidth=s*.45;
  for(var mi=1;mi<3;mi++){var v=mi/3;
    ctx.beginPath();
    ctx.moveTo(x+bw2,y-bh2-wH+v*wH);ctx.lineTo(x,y-wH+v*wH);ctx.stroke();}
  for(var bi=0;bi<3;bi++){var u=bi%2?.3:.55,bv=bi/3;
    var bx=x+bw2*(1-u),by=y+u*bh2-bh2-wH+bv*wH;
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+wH*.18);ctx.stroke();}
  _gBox(ctx,x,y-bh2-wH,bw2*1.08,bh2*1.08,wH*.1,'#C8C0B0','#807870','#E0D8C8');
  return y-bh2-wH;
}
// CLOTURE — mur en pierre haut
function _gFmurp(ctx,x,y,bw,bh,oh,s){
  var bw2=bw*.85,bh2=bh*.4,wH=oh*.95;
  _gBox(ctx,x,y-bh2-wH,bw2,bh2,wH,'#9E9E9E','#484848','#BDBDBD');
  ctx.strokeStyle='rgba(40,40,40,.45)';ctx.lineWidth=s*.5;
  for(var mi=1;mi<6;mi++){var v=mi/6;
    ctx.beginPath();
    ctx.moveTo(x+bw2,y-bh2-wH+v*wH);ctx.lineTo(x,y-wH+v*wH);ctx.stroke();}
  for(var bi=0;bi<6;bi++){var u=bi%2?.25:.5,bv=bi/6;
    var bx=x+bw2*(1-u),by=y+u*bh2-bh2-wH+bv*wH;
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+wH*.15);ctx.stroke();}
  _gBox(ctx,x,y-bh2-wH,bw2*1.05,bh2*1.05,wH*.06,'#BDBDBD','#7A7A7A','#D8D8D8');
  return y-bh2-wH;
}
// CLOTURE — barrière métallique avec pointes
function _gFbar(ctx,x,y,bw,bh,oh,s){
  var pH=oh*.7;
  ctx.fillStyle='#37474F';
  ctx.fillRect(x-bw*.85,y-bh*.1-pH,s*1.2,pH+bh*.2);
  ctx.fillRect(x+bw*.85-s*1.2,y-bh*.1-pH,s*1.2,pH+bh*.2);
  ctx.fillStyle='#78909C';
  ctx.fillRect(x-bw*.85,y-bh*.1-pH,bw*1.7,s*1.2);
  ctx.fillRect(x-bw*.85,y-bh*.1-pH*.55,bw*1.7,s*.7);
  ctx.fillRect(x-bw*.85,y-bh*.1-pH*.15,bw*1.7,s*.7);
  ctx.fillStyle='#546E7A';
  for(var bi=1;bi<5;bi++){var bx=x-bw*.85+bi*bw*1.7/5;
    ctx.fillRect(bx,y-bh*.1-pH*.85,s*.6,pH*.85);}
  ctx.fillStyle='#FFD700';
  ctx.beginPath();
  ctx.moveTo(x-bw*.85+s*.6,y-bh*.1-pH-s*1.5);
  ctx.lineTo(x-bw*.85,y-bh*.1-pH);ctx.lineTo(x-bw*.85+s*1.2,y-bh*.1-pH);
  ctx.closePath();ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x+bw*.85-s*.6,y-bh*.1-pH-s*1.5);
  ctx.lineTo(x+bw*.85-s*1.2,y-bh*.1-pH);ctx.lineTo(x+bw*.85,y-bh*.1-pH);
  ctx.closePath();ctx.fill();
  return y-bh*.1-pH-s*1.5;
}
// CLOTURE — escalier avec 4 marches
function _gFstairs(ctx,x,y,bw,bh,oh,s){
  var steps=4;
  for(var si=0;si<steps;si++){var sv=si/steps;
    var sw=bw*.95*(1-sv*.4),sh=bh*.5*(1-sv*.3),sd=oh*.18;
    var sy=y-bh*.4-si*sd;
    _gBox(ctx,x,sy,sw,sh,sd,'#BCBCBC','#6E6E6E','#DCDCDC');}
  return y-bh*.4-steps*oh*.18;
}
// CLOTURE — portail avec pilliers en pierre et grille en fer
function _gFgate(ctx,x,y,bw,bh,oh,s){
  var pH=oh*.85,pw=bw*.18,ph=bh*.18;
  _gBox(ctx,x-bw*.8,y-bh*.1-pH,pw,ph,pH,'#B0A898','#706860','#D0C8C0');
  _gBox(ctx,x+bw*.8,y-bh*.1-pH,pw,ph,pH,'#B0A898','#706860','#D0C8C0');
  _gBox(ctx,x-bw*.8,y-bh*.1-pH,pw*1.25,ph*1.25,pH*.08,'#C8C0B0','#807870','#E0D8C8');
  _gBox(ctx,x+bw*.8,y-bh*.1-pH,pw*1.25,ph*1.25,pH*.08,'#C8C0B0','#807870','#E0D8C8');
  ctx.fillStyle='#37474F';
  ctx.fillRect(x-bw*.55,y-bh*.1-pH*.85,s*.8,pH*.85);
  ctx.fillRect(x+bw*.55-s*.8,y-bh*.1-pH*.85,s*.8,pH*.85);
  ctx.strokeStyle='#37474F';ctx.lineWidth=s*1.2;
  ctx.beginPath();
  ctx.moveTo(x-bw*.55,y-bh*.1-pH*.85);
  ctx.bezierCurveTo(x-bw*.4,y-bh*.1-pH*1.05,x+bw*.4,y-bh*.1-pH*1.05,x+bw*.55,y-bh*.1-pH*.85);
  ctx.stroke();
  ctx.strokeStyle='#546E7A';ctx.lineWidth=s*.5;
  for(var bi=1;bi<6;bi++){var bx=x-bw*.55+bi*bw*1.1/6;
    ctx.beginPath();ctx.moveTo(bx,y-bh*.1-pH*.85);ctx.lineTo(bx,y-bh*.1);ctx.stroke();}
  ctx.fillStyle='#FFD700';
  ctx.beginPath();ctx.arc(x,y-bh*.1-pH*.5,s*1.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFA000';
  ctx.beginPath();ctx.arc(x,y-bh*.1-pH*.5,s*.7,0,Math.PI*2);ctx.fill();
  return y-bh*.1-pH*1.05;
}
// CLOTURE — arche romantique avec roses
function _gFarche(ctx,x,y,bw,bh,oh,s){
  var pH=oh*.7,pw=bw*.15,ph=bh*.15;
  _gBox(ctx,x-bw*.7,y-bh*.1-pH,pw,ph,pH,'#E91E63','#880E4F','#F080A8');
  _gBox(ctx,x+bw*.7,y-bh*.1-pH,pw,ph,pH,'#E91E63','#880E4F','#F080A8');
  ctx.fillStyle='#E91E63';
  ctx.beginPath();
  ctx.moveTo(x-bw*.85,y-bh*.1-pH);
  ctx.bezierCurveTo(x-bw*.7,y-bh*.1-pH*1.4,x+bw*.7,y-bh*.1-pH*1.4,x+bw*.85,y-bh*.1-pH);
  ctx.lineTo(x+bw*.55,y-bh*.1-pH);
  ctx.bezierCurveTo(x+bw*.4,y-bh*.1-pH*1.2,x-bw*.4,y-bh*.1-pH*1.2,x-bw*.55,y-bh*.1-pH);
  ctx.closePath();ctx.fill();
  [[-bw*.5,-pH-s*2],[-bw*.2,-pH*1.2-s*.5],[bw*.2,-pH*1.2-s*.5],[bw*.5,-pH-s*2]].forEach(function(f){
    ctx.fillStyle='#FF1744';
    ctx.beginPath();ctx.arc(x+f[0],y-bh*.1+f[1],s*1.7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#C2185B';
    ctx.beginPath();ctx.arc(x+f[0],y-bh*.1+f[1],s*.8,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle='#43A047';
  for(var vi=0;vi<6;vi++){var va=vi/6*Math.PI;
    ctx.beginPath();
    ctx.arc(x+Math.cos(va)*bw*.7,y-bh*.1-pH-Math.sin(va)*pH*.5,s*1.3,0,Math.PI*2);ctx.fill();}
  return y-bh*.1-pH*1.4;
}
// CLOTURE — passerelle en bois avec rambardes
function _gFwalk(ctx,x,y,bw,bh,oh,s){
  var bw2=bw*.95,bh2=bh*.5,wH=oh*.12;
  _gBox(ctx,x,y-bh2-wH,bw2,bh2,wH,'#A0785A','#5D4037','#C09878');
  ctx.strokeStyle='rgba(60,40,20,.4)';ctx.lineWidth=s*.4;
  for(var pi=1;pi<5;pi++){var u=pi/5;
    ctx.beginPath();
    ctx.moveTo(x+bw2*(1-u),y-bh2-wH+u*bh2);
    ctx.lineTo(x+bw2*(1-u),y-bh2-wH+u*bh2+wH);ctx.stroke();}
  ctx.fillStyle='#5D4037';
  ctx.fillRect(x-bw2,y-bh2-wH-oh*.3,s*.5,oh*.3);
  ctx.fillRect(x+bw2-s*.5,y-bh2-wH-oh*.3,s*.5,oh*.3);
  ctx.fillRect(x,y-wH-oh*.3,s*.5,oh*.3);
  ctx.fillRect(x-bw2,y-bh2-wH-oh*.3,bw2*2,s*.6);
  return y-bh2-wH-oh*.3;
}
// CLOTURE — pont arché en bois sur eau
function _gFbridge(ctx,x,y,bw,bh,oh,s){
  ctx.fillStyle='#9a7848';
  ctx.beginPath();
  ctx.moveTo(x-bw*.95,y);ctx.lineTo(x-bw*.95,y-bh*.1-oh*.2);
  ctx.bezierCurveTo(x-bw*.4,y-bh*.1-oh*.55,x+bw*.4,y-bh*.1-oh*.55,x+bw*.95,y-bh*.1-oh*.2);
  ctx.lineTo(x+bw*.95,y);ctx.closePath();ctx.fill();
  ctx.fillStyle='#0288D1';
  ctx.beginPath();
  ctx.moveTo(x-bw*.55,y);
  ctx.bezierCurveTo(x-bw*.55,y-oh*.32,x+bw*.55,y-oh*.32,x+bw*.55,y);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.5)';
  ctx.beginPath();ctx.arc(x-bw*.2,y-oh*.18,s*.5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x+bw*.2,y-oh*.12,s*.4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#A0785A';
  ctx.fillRect(x-bw,y-bh*.1-oh*.55,bw*2,s*1.5);
  ctx.strokeStyle='#5D4037';ctx.lineWidth=s*.3;
  for(var pi=0;pi<7;pi++){var px=x-bw+pi*bw*.33;
    ctx.beginPath();ctx.moveTo(px,y-bh*.1-oh*.55);ctx.lineTo(px,y-bh*.1-oh*.55+s*1.5);ctx.stroke();}
  ctx.fillStyle='#5D4037';
  ctx.fillRect(x-bw,y-bh*.1-oh*.7,s*.5,oh*.15);
  ctx.fillRect(x+bw-s*.5,y-bh*.1-oh*.7,s*.5,oh*.15);
  ctx.fillRect(x-bw*.5,y-bh*.1-oh*.7,s*.5,oh*.15);
  ctx.fillRect(x+bw*.5-s*.5,y-bh*.1-oh*.7,s*.5,oh*.15);
  ctx.fillRect(x-bw,y-bh*.1-oh*.7,bw*2,s*.6);
  return y-bh*.1-oh*.7;
}
