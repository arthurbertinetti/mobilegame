// === Mini-jeux: lights out, memory, simon, taquin, flood, snake, maze, minesweeper, pattern, 2048 — extracted from farmvalley.html ===

// ===== MINI-JEU =====
var mgSubTab='menu';
var mgGamePage=false;
// --- Lights Out ---
var mgGrid=[],mgSize=3,mgMoves=0,mgPlaying=false;
function getMGSize(lv){if(lv<=5)return 3;if(lv<=15)return 4;if(lv<=30)return 5;if(lv<=50)return 6;if(lv<=75)return 7;return 8;}
function getMGClicks(lv){if(lv<=3)return lv+1;if(lv<=10)return Math.floor(lv*0.8+2);if(lv<=30)return Math.floor(lv*0.6+4);return Math.floor(lv*0.5+8);}
function mgToggle(grid,size,r,c){grid[r*size+c]=1-grid[r*size+c];if(r>0)grid[(r-1)*size+c]=1-grid[(r-1)*size+c];if(r<size-1)grid[(r+1)*size+c]=1-grid[(r+1)*size+c];if(c>0)grid[r*size+(c-1)]=1-grid[r*size+(c-1)];if(c<size-1)grid[r*size+(c+1)]=1-grid[r*size+(c+1)];}
function mgGenLevel(lv){mgSize=getMGSize(lv);var total=mgSize*mgSize;mgGrid=[];for(var i=0;i<total;i++)mgGrid.push(0);var clicks=getMGClicks(lv);var used={};for(var c=0;c<clicks;c++){var pos;do{pos=Math.floor(Math.random()*total);}while(used[pos]);used[pos]=1;mgToggle(mgGrid,mgSize,Math.floor(pos/mgSize),pos%mgSize);}if(mgGrid.every(function(v){return v===0;})){var p=Math.floor(Math.random()*total);mgToggle(mgGrid,mgSize,Math.floor(p/mgSize),p%mgSize);}mgMoves=0;mgPlaying=true;}
function mgCheckWin(){return mgGrid.every(function(v){return v===0;});}
var mgPlayingLv=1;
// --- Memory ---
var MM_EMOJIS=['🍎','🍌','🍇','🍒','🍓','🌻','🌸','🍄','🎃','🌽','🥕','🍑','🍋','🫐','🥝','🍉','🥭','🍐','🌹','🪻',
'🐝','🦋','🐞','🐸','🐧','🐶','🐱','🐰','🐷','🐮','🐔','🐴','🐺','🐍','🐢','🐙','🦈','🐬','🐳','🐘',
'🦁','🐯','🐻','🐼','🐨','🦊','🐹','🐭','🦉','🦅','🦆','🐦','🐤','🦜','🦢','🦩','🦚','🐓','🦃','🐗',
'🐑','🐐','🦌','🦙','🐩','🐕','🐈','🐇','🦝','🦦','🦥','🦔','🐿','🦎','🐊','🦏','🐪','🐫','🦒','🦘',
'🍔','🍟','🌭','🍕','🥪','🌮','🌯','🥗','🥘','🍲','🍛','🍜','🍝','🍣','🍱','🥟','🍤','🍙','🍚','🍘',
'🍥','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍩','🍪','🧇','🥞','🍳','🥚','🥓',
'🥩','🍗','🍖','🧀','🥐','🍿','🥤','🍵','☕','🧃','🍶','🍷','🍸','🍹','🍺','🥂','🥃','🧊','🍼','🫖',
'⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🥊','🎯','🏹','🎣','🥌','🛹','🎿','⛸','🏄','🏊',
'🚗','🚕','🚙','🚌','🏎','🚓','🚑','🚒','🛻','🚚','🚜','🏍','🛵','🚲','🛴','🚂','🚀','🛸','🚁','⛵',
'🚤','🛶','🛥','🚢','✈','🛩','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚆','🚊','🛺','🚍',
'❤','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔶',
'🔷','🔸','🔹','🔺','🔻','💠','🔘','♠','♥','♦','♣','🃏','🎲','♟','🧩','🎮','🕹','🎰','🎪','🎭',
'🎨','🧵','🧶','🎀','🎁','🎈','🎉','🎊','✨','🏆','🥇','🥈','🥉','💎','🔮','👑','💍','⚙','🔧','🔨',
'🔩','🧲','💡','🔦','🕯','📱','💻','⌨','📷','📸','🎥','📹','📺','📻','🎵','🎶','🎼','🎹','🎸','🎺',
'🎻','🥁','🎤','🎧','🪈','🪗','🪕','🪘','📯','🔔','📣','📢','💌','📜','📋','📁','📌','📍','🗝','🛠',
'🌍','🌎','🌏','🗺','🏔','🌋','⛰','🏝','🏖','🏜','🗻','☀','🌤','🌈','⛅','🌊','💧','🔥','❄','⛄',
'🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','⛪','🕌','🛕','🕍','⛩',
'🗼','🗽','🗿','⛲','🎡','🎢','🎠','⛱','🏟','🌃','🌉','🌁','🌄','🌅','🌆','🌇','🌌','🎆','🎇','🧨',
'👀','👋','🤚','✋','🖐','✌','🤞','🤟','🤘','🤙','👈','👉','👆','👇','👍','👎','✊','👊','🤛','🤜',
'😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😇','🥰','😍','🤩','😘','😗','😋','😛','😜',
'🌙','⭐','🌟','💫','🪐','☄','🌠','🏏','🔭','🧭','⏰','⌛','🧿','🪬','📿','🧸','🪆','🎋','🎍','🎎',
'🎏','🎐','🧧','🎑','🏮','📦','📫','📮','🗳','📝','📰','🗞','📖','📚','🔖','🏷','💰','💴','💵','💶',
'🪙','💳','🧾','💹','🛒','🛍','🎒','🧳','👜','👝','🪄','🏏'];
var mmCards=[],mmFlipped=[],mmMatched=0,mmMoves=0,mmPlaying=false,mmSize=0,mmPairs=0,mmBusy=false,mmPlayingLv=1;
function mmGetSize(lv){if(lv<=10)return[5,5];if(lv<=20)return[10,10];if(lv<=40)return[20,20];if(lv<=70)return[25,25];return[30,30];}
function mmGenLevel(lv){var sz=mmGetSize(lv);mmSize=sz;var total=sz[0]*sz[1];var hasJoker=total%2!==0;mmPairs=Math.floor(total/2);var pool=MM_EMOJIS.slice();shuffle(pool);var chosen=pool.slice(0,mmPairs);mmCards=chosen.concat(chosen);if(hasJoker)mmCards.push('⭐');shuffle(mmCards);mmFlipped=[];mmMatched=0;mmMoves=0;mmPlaying=true;mmBusy=false;mmPlayingLv=lv;}
// --- Simon ---
var SIMON_COLORS=['#e74c3c','#3498db','#2ecc71','#f1c40f'];
var siSeq=[],siInput=[],siPlaying=false,siShowing=false,siPlayingLv=1;
function siGenLevel(lv){var len=lv+2;siSeq=[];for(var i=0;i<len;i++)siSeq.push(Math.floor(Math.random()*4));siInput=[];siPlaying=true;siShowing=true;siPlayingLv=lv;}
// --- Taquin ---
var tqGrid=[],tqSize=0,tqEmpty=0,tqMoves=0,tqPlaying=false,tqPlayingLv=1;
function tqGetSize(lv){if(lv<=10)return 3;if(lv<=30)return 4;if(lv<=55)return 5;if(lv<=80)return 6;return 7;}
function tqGenLevel(lv){tqSize=tqGetSize(lv);var total=tqSize*tqSize;tqGrid=[];for(var i=0;i<total-1;i++)tqGrid.push(i+1);tqGrid.push(0);tqEmpty=total-1;var shuffles=50+lv*10;for(var s=0;s<shuffles;s++){var moves=tqGetMoves();if(moves.length>0){var pick=moves[Math.floor(Math.random()*moves.length)];tqSwap(pick);}}tqMoves=0;tqPlaying=true;tqPlayingLv=lv;}
function tqGetMoves(){var r=Math.floor(tqEmpty/tqSize),c=tqEmpty%tqSize,m=[];if(r>0)m.push(tqEmpty-tqSize);if(r<tqSize-1)m.push(tqEmpty+tqSize);if(c>0)m.push(tqEmpty-1);if(c<tqSize-1)m.push(tqEmpty+1);return m;}
function tqSwap(idx){tqGrid[tqEmpty]=tqGrid[idx];tqGrid[idx]=0;tqEmpty=idx;}
function tqCheckWin(){for(var i=0;i<tqGrid.length-1;i++)if(tqGrid[i]!==i+1)return false;return tqGrid[tqGrid.length-1]===0;}
// --- Flood ---
var FL_COLORS=['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22','#1abc9c'];
var flGrid=[],flSize=0,flNumColors=0,flMoves=0,flMaxMoves=0,flPlaying=false,flPlayingLv=1;
function flGetParams(lv){if(lv<=10)return{size:6,colors:4,moves:14};if(lv<=25)return{size:8,colors:5,moves:18};if(lv<=45)return{size:10,colors:5,moves:22};if(lv<=70)return{size:12,colors:6,moves:28};if(lv<=90)return{size:14,colors:6,moves:32};return{size:16,colors:7,moves:38};}
function flGenLevel(lv){var p=flGetParams(lv);flSize=p.size;flNumColors=p.colors;flMaxMoves=p.moves;flGrid=[];var total=flSize*flSize;for(var i=0;i<total;i++)flGrid.push(Math.floor(Math.random()*flNumColors));flMoves=0;flPlaying=true;flPlayingLv=lv;}
function flFlood(color){if(!flPlaying||color===flGrid[0])return;var oldColor=flGrid[0];var visited={};var queue=[0];while(queue.length>0){var pos=queue.shift();if(visited[pos])continue;visited[pos]=true;if(flGrid[pos]!==oldColor)continue;flGrid[pos]=color;var r=Math.floor(pos/flSize),c=pos%flSize;if(r>0)queue.push(pos-flSize);if(r<flSize-1)queue.push(pos+flSize);if(c>0)queue.push(pos-1);if(c<flSize-1)queue.push(pos+1);}flMoves++;}
// --- Snake ---
var snGrid=[],snSize=0,snSnake=[],snDir=0,snFood=-1,snEaten=0,snTarget=0,snPlaying=false,snPlayingLv=1,snAlive=true;
function snGetParams(lv){if(lv<=15)return{size:6,target:3+lv};if(lv<=40)return{size:8,target:4+lv};if(lv<=70)return{size:10,target:5+lv};return{size:12,target:6+lv};}
function snGenLevel(lv){var p=snGetParams(lv);snSize=p.size;snTarget=p.target;snGrid=[];for(var i=0;i<snSize*snSize;i++)snGrid.push(0);var mid=Math.floor(snSize/2)*snSize+Math.floor(snSize/2);snSnake=[mid];snGrid[mid]=1;snDir=1;snEaten=0;snAlive=true;snPlaying=true;snPlayingLv=lv;snPlaceFood();}
function snPlaceFood(){var free=[];for(var i=0;i<snGrid.length;i++)if(snGrid[i]===0)free.push(i);if(free.length===0)return;snFood=free[Math.floor(Math.random()*free.length)];snGrid[snFood]=2;}
function snMove(){if(!snPlaying||!snAlive)return;var head=snSnake[0];var r=Math.floor(head/snSize),c=head%snSize;var dirs=[[-1,0],[0,1],[1,0],[0,-1]];var nr=r+dirs[snDir][0],nc=c+dirs[snDir][1];if(nr<0||nr>=snSize||nc<0||nc>=snSize){snAlive=false;snPlaying=false;return;}var npos=nr*snSize+nc;if(snGrid[npos]===1){snAlive=false;snPlaying=false;return;}var ate=npos===snFood;snSnake.unshift(npos);snGrid[npos]=1;if(ate){snEaten++;if(snEaten>=snTarget){snPlaying=false;return;}snPlaceFood();}else{var tail=snSnake.pop();snGrid[tail]=0;}}
// --- Maze ---
var maGrid=[],maSize=0,maPlayer=0,maExit=0,maMoves=0,maPlaying=false,maPlayingLv=1;
function maGetSize(lv){if(lv<=10)return 5;if(lv<=25)return 7;if(lv<=45)return 9;if(lv<=70)return 11;if(lv<=90)return 13;return 15;}
function maGenLevel(lv){maSize=maGetSize(lv);var w=maSize*2+1;maGrid=[];for(var i=0;i<w*w;i++)maGrid.push(1);var visited={};function carve(r,c){visited[r+','+c]=true;maGrid[(r*2+1)*w+(c*2+1)]=0;var dirs=[[0,1],[0,-1],[1,0],[-1,0]];shuffle(dirs);for(var d=0;d<dirs.length;d++){var nr=r+dirs[d][0],nc=c+dirs[d][1];if(nr>=0&&nr<maSize&&nc>=0&&nc<maSize&&!visited[nr+','+nc]){maGrid[(r*2+1+dirs[d][0])*w+(c*2+1+dirs[d][1])]=0;carve(nr,nc);}}}carve(0,0);maPlayer=1*w+1;maExit=(w-2)*w+(w-2);maMoves=0;maPlaying=true;maPlayingLv=lv;}
// --- Démineur (Minesweeper) ---
var msGrid=[],msRevealed=[],msFlagged=[],msSize=0,msMines=0,msPlaying=false,msPlayingLv=1,msWon=false,msFirstClick=true;
function msGetParams(lv){if(lv<=10)return{size:6,mines:5+lv};if(lv<=25)return{size:8,mines:8+lv};if(lv<=50)return{size:10,mines:12+lv};if(lv<=75)return{size:12,mines:16+lv};return{size:14,mines:20+lv};}
function msGenLevel(lv){var p=msGetParams(lv);msSize=p.size;msMines=Math.min(p.mines,Math.floor(msSize*msSize*0.35));var total=msSize*msSize;msGrid=[];msRevealed=[];msFlagged=[];for(var i=0;i<total;i++){msGrid.push(0);msRevealed.push(false);msFlagged.push(false);}msPlaying=true;msWon=false;msFirstClick=true;msPlayingLv=lv;}
function msPlaceMines(safeIdx){var total=msSize*msSize;var placed=0;while(placed<msMines){var pos=Math.floor(Math.random()*total);if(pos===safeIdx||msGrid[pos]===-1)continue;var sr=Math.floor(safeIdx/msSize),sc=safeIdx%msSize,pr=Math.floor(pos/msSize),pc=pos%msSize;if(Math.abs(sr-pr)<=1&&Math.abs(sc-pc)<=1)continue;msGrid[pos]=-1;placed++;}for(var i=0;i<total;i++){if(msGrid[i]===-1)continue;var r=Math.floor(i/msSize),c=i%msSize,cnt=0;for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){var nr=r+dr,nc=c+dc;if(nr>=0&&nr<msSize&&nc>=0&&nc<msSize&&msGrid[nr*msSize+nc]===-1)cnt++;}msGrid[i]=cnt;}}
function msReveal(idx){if(!msPlaying||msRevealed[idx]||msFlagged[idx])return;if(msFirstClick){msFirstClick=false;msPlaceMines(idx);}if(msGrid[idx]===-1){msPlaying=false;msWon=false;for(var i=0;i<msGrid.length;i++)msRevealed[i]=true;return;}msRevealed[idx]=true;if(msGrid[idx]===0){var queue=[idx];var visited={};visited[idx]=true;while(queue.length>0){var p=queue.shift();var r=Math.floor(p/msSize),c=p%msSize;for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){var nr=r+dr,nc=c+dc;if(nr>=0&&nr<msSize&&nc>=0&&nc<msSize){var ni=nr*msSize+nc;if(!visited[ni]&&!msRevealed[ni]&&!msFlagged[ni]){msRevealed[ni]=true;visited[ni]=true;if(msGrid[ni]===0)queue.push(ni);}}}}}msCheckWin();}
function msCheckWin(){var total=msSize*msSize;var revealed=0;for(var i=0;i<total;i++)if(msRevealed[i])revealed++;if(revealed===total-msMines){msPlaying=false;msWon=true;}}
function msToggleFlag(idx){if(!msPlaying||msRevealed[idx])return;msFlagged[idx]=!msFlagged[idx];}
// --- Color Pattern ---
var cpGrid=[],cpTarget=[],cpSize=0,cpMoves=0,cpPlaying=false,cpShowing=false,cpPlayingLv=1,cpNumColors=0;
var CP_COLORS=['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22'];
function cpGetParams(lv){if(lv<=10)return{size:3,colors:3,filled:3+lv};if(lv<=30)return{size:4,colors:4,filled:5+lv};if(lv<=60)return{size:5,colors:5,filled:6+lv};return{size:6,colors:6,filled:8+lv};}
function cpGenLevel(lv){var p=cpGetParams(lv);cpSize=p.size;cpNumColors=p.colors;var total=cpSize*cpSize;cpTarget=[];cpGrid=[];for(var i=0;i<total;i++){cpTarget.push(0);cpGrid.push(0);}var filled=Math.min(p.filled,total);var positions=[];for(var i=0;i<total;i++)positions.push(i);shuffle(positions);for(var f=0;f<filled;f++){cpTarget[positions[f]]=1+Math.floor(Math.random()*cpNumColors);}cpMoves=0;cpPlaying=true;cpShowing=true;cpPlayingLv=lv;}
function cpCheckWin(){for(var i=0;i<cpTarget.length;i++)if(cpGrid[i]!==cpTarget[i])return false;return true;}
// --- 2048 ---
var rvGrid=[],rvSize=4,rvScore=0,rvTarget=0,rvPlaying=false,rvPlayingLv=1,rvWon=false;
function rvGetTarget(lv){if(lv<=5)return 64;if(lv<=15)return 128;if(lv<=30)return 256;if(lv<=50)return 512;if(lv<=75)return 1024;return 2048;}
function rvGenLevel(lv){rvSize=4;rvTarget=rvGetTarget(lv);rvGrid=[];for(var i=0;i<rvSize*rvSize;i++)rvGrid.push(0);rvAddTile();rvAddTile();rvScore=0;rvPlaying=true;rvWon=false;rvPlayingLv=lv;}
function rvAddTile(){var free=[];for(var i=0;i<rvGrid.length;i++)if(rvGrid[i]===0)free.push(i);if(free.length===0)return;rvGrid[free[Math.floor(Math.random()*free.length)]]=Math.random()<0.9?2:4;}
function rvSlide(dir){var moved=false;function getRC(r,c){return r*rvSize+c;}if(dir===0){for(var c=0;c<rvSize;c++){var col=[];for(var r=0;r<rvSize;r++)col.push(rvGrid[getRC(r,c)]);var merged=rvMerge(col);for(var r=0;r<rvSize;r++){if(rvGrid[getRC(r,c)]!==merged[r])moved=true;rvGrid[getRC(r,c)]=merged[r];}}}else if(dir===2){for(var c=0;c<rvSize;c++){var col=[];for(var r=rvSize-1;r>=0;r--)col.push(rvGrid[getRC(r,c)]);var merged=rvMerge(col);for(var r=rvSize-1;r>=0;r--){if(rvGrid[getRC(r,c)]!==merged[rvSize-1-r])moved=true;rvGrid[getRC(r,c)]=merged[rvSize-1-r];}}}else if(dir===3){for(var r=0;r<rvSize;r++){var row=[];for(var c=0;c<rvSize;c++)row.push(rvGrid[getRC(r,c)]);var merged=rvMerge(row);for(var c=0;c<rvSize;c++){if(rvGrid[getRC(r,c)]!==merged[c])moved=true;rvGrid[getRC(r,c)]=merged[c];}}}else{for(var r=0;r<rvSize;r++){var row=[];for(var c=rvSize-1;c>=0;c--)row.push(rvGrid[getRC(r,c)]);var merged=rvMerge(row);for(var c=rvSize-1;c>=0;c--){if(rvGrid[getRC(r,c)]!==merged[rvSize-1-c])moved=true;rvGrid[getRC(r,c)]=merged[rvSize-1-c];}}}if(moved)rvAddTile();return moved;}
function rvMerge(arr){var filtered=arr.filter(function(v){return v>0;});var result=[];for(var i=0;i<filtered.length;i++){if(i<filtered.length-1&&filtered[i]===filtered[i+1]){result.push(filtered[i]*2);rvScore+=filtered[i]*2;i++;}else{result.push(filtered[i]);}}while(result.length<rvSize)result.push(0);return result;}
function rvCheckGameOver(){for(var i=0;i<rvGrid.length;i++){if(rvGrid[i]===0)return false;var r=Math.floor(i/rvSize),c=i%rvSize;if(r<rvSize-1&&rvGrid[i]===rvGrid[(r+1)*rvSize+c])return false;if(c<rvSize-1&&rvGrid[i]===rvGrid[r*rvSize+c+1])return false;}return true;}

// ===== MG GAME LIST =====
var MG_GAMES=[
{key:'lightsout',label:'🔦 Lights Out',stateKey:'mgLevel'},
{key:'memory',label:'🧠 Mémoire',stateKey:'mmLevel'},
{key:'simon',label:'🎵 Simon',stateKey:'siLevel'},
{key:'taquin',label:'🧩 Taquin',stateKey:'tqLevel'},
{key:'flood',label:'🎨 Flood',stateKey:'flLevel'},
{key:'snake',label:'🐍 Snake',stateKey:'snLevel'},
{key:'maze',label:'🏁 Labyrinthe',stateKey:'maLevel'},
{key:'minesweeper',label:'💣 Démineur',stateKey:'ppLevel'},
{key:'pattern',label:'🎯 Pattern',stateKey:'cpLevel'},
{key:'2048',label:'🔢 2048',stateKey:'rvLevel'}
];
function mgGetLevel(game){return state[game.stateKey]||1;}
function mgSetLevel(game,lv){state[game.stateKey]=lv;}
function mgWinLevel(gameKey){
var game=null;for(var i=0;i<MG_GAMES.length;i++)if(MG_GAMES[i].key===gameKey){game=MG_GAMES[i];break;}
if(!game)return;
var cur=mgGetLevel(game);
if(mgPlayingLv>=cur&&cur<=100){
mgSetLevel(game,Math.min(101,cur+1));
state.stars=(state.stars||0)+1;
showFloat(innerWidth/2,innerHeight/2,'🎉 Niveau réussi! +1⭐');updateUI();saveGame();
}else{showFloat(innerWidth/2,innerHeight/2,'🎉 Bravo! (déjà complété)');}
}

function buildMiniGame(){
var tabs=$('mg-sub-tabs');var content=$('mg-content');
if(!tabs||!content)return;
tabs.innerHTML='';content.innerHTML='';
if(mgSubTab==='menu'){
var grid=document.createElement('div');grid.className='mg-tab-grid';
MG_GAMES.forEach(function(g){
var btn=document.createElement('button');btn.className='mg-tab-btn';
var curLv=mgGetLevel(g);
btn.innerHTML=g.label+'<br><span style="font-size:.55rem;color:#888">Niv.'+Math.min(curLv,100)+'/100</span>';
btn.addEventListener('click',function(){mgSubTab=g.key;mgGamePage=false;buildMiniGame();});
grid.appendChild(btn);
});
content.appendChild(grid);
var rulesBtn=document.createElement('button');
rulesBtn.className='mg-tab-btn';rulesBtn.style.cssText='margin:8px auto;display:block;width:90%;max-width:300px';
rulesBtn.textContent='📖 Règles';
rulesBtn.addEventListener('click',function(){mgSubTab='regles';buildMiniGame();});
content.appendChild(rulesBtn);
return;
}
if(mgSubTab==='regles'){
var backBtn=document.createElement('button');backBtn.className='mg-back-btn';backBtn.textContent='⬅️ Retour';
backBtn.addEventListener('click',function(){mgSubTab='menu';buildMiniGame();});
var rulesDiv=document.createElement('div');
renderMGRules(rulesDiv);
content.appendChild(backBtn);
content.appendChild(rulesDiv);
return;
}
var curGame=null;for(var i=0;i<MG_GAMES.length;i++)if(MG_GAMES[i].key===mgSubTab){curGame=MG_GAMES[i];break;}
if(!curGame){mgSubTab='menu';buildMiniGame();return;}
var backBtn=document.createElement('button');backBtn.className='mg-back-btn';
backBtn.textContent='⬅️ Retour';
backBtn.addEventListener('click',function(){
if(mgGamePage){mgGamePage=false;buildMiniGame();}
else{mgSubTab='menu';buildMiniGame();}
});
content.appendChild(backBtn);
if(!mgGamePage){
var title=document.createElement('div');title.className='mg-info';title.innerHTML='<b>'+curGame.label+'</b>';content.appendChild(title);
var selDiv=document.createElement('div');selDiv.className='mg-lvl-grid';
var maxLv=mgGetLevel(curGame);
for(var lv=1;lv<=100;lv++){
var btn=document.createElement('button');
var done=lv<maxLv;var cur=lv===maxLv;var locked=lv>maxLv;
btn.className='mg-lvl-btn'+(done?' mg-done':'')+(cur?' mg-cur':'')+(locked?' mg-locked':'');
btn.textContent=(done?'✅ ':'')+lv;btn.disabled=locked;
(function(l){btn.addEventListener('click',function(){
if(l>mgGetLevel(curGame))return;
mgPlayingLv=l;mgGamePage=true;mgStartGame(curGame.key,l);buildMiniGame();
});})(lv);
selDiv.appendChild(btn);
}
content.appendChild(selDiv);
}else{
renderGamePage(content,curGame);
}
}
function mgStartGame(key,lv){
mgPlayingLv=lv;
if(key==='lightsout'){mgGenLevel(lv);mgPlaying=true;}
else if(key==='memory'){mmGenLevel(lv);}
else if(key==='simon'){siGenLevel(lv);}
else if(key==='taquin'){tqGenLevel(lv);}
else if(key==='flood'){flGenLevel(lv);}
else if(key==='snake'){snGenLevel(lv);}
else if(key==='maze'){maGenLevel(lv);}
else if(key==='minesweeper'){msGenLevel(lv);}
else if(key==='pattern'){cpGenLevel(lv);}
else if(key==='2048'){rvGenLevel(lv);}
}
function renderGamePage(ct,game){
var key=game.key;
if(key==='lightsout')renderLightsOutGame(ct,game);
else if(key==='memory')renderMemoryGamePage(ct,game);
else if(key==='simon')renderSimonGamePage(ct,game);
else if(key==='taquin')renderTaquinGamePage(ct,game);
else if(key==='flood')renderFloodGamePage(ct,game);
else if(key==='snake')renderSnakeGamePage(ct,game);
else if(key==='maze')renderMazeGamePage(ct,game);
else if(key==='minesweeper')renderMinesweeperGamePage(ct,game);
else if(key==='pattern')renderPatternGamePage(ct,game);
else if(key==='2048')render2048GamePage(ct,game);
}
function mgNavBtns(ct,game){
var nav=document.createElement('div');nav.className='mg-nav-btns';
var menuBtn=document.createElement('button');menuBtn.className='mg-nav-btn prev';menuBtn.textContent='⬅️ Menu';
menuBtn.addEventListener('click',function(){mgGamePage=false;buildMiniGame();});
nav.appendChild(menuBtn);
var nextLv=mgPlayingLv+1;
if(nextLv<=mgGetLevel(game)&&nextLv<=100){
var nextBtn=document.createElement('button');nextBtn.className='mg-nav-btn next';nextBtn.textContent='➡️ Suivant';
nextBtn.addEventListener('click',function(){mgPlayingLv=nextLv;mgStartGame(game.key,nextLv);buildMiniGame();});
nav.appendChild(nextBtn);
}
ct.appendChild(nav);
}
function mgResetBtn(ct,game){
var resetBtn=document.createElement('button');
resetBtn.style.cssText='display:block;margin:6px auto;padding:6px 16px;background:#e74c3c;color:#fff;border:none;border-radius:8px;font-weight:bold;font-size:.78rem;cursor:pointer';
resetBtn.textContent='🔄 Recommencer';
resetBtn.addEventListener('click',function(){mgStartGame(game.key,mgPlayingLv);buildMiniGame();});
ct.appendChild(resetBtn);
}

// ===== RENDER EACH GAME =====
function renderLightsOutGame(ct,game){
var info=document.createElement('div');info.className='mg-info';
info.innerHTML='🔦 Niveau '+mgPlayingLv+' — Grille '+mgSize+'×'+mgSize+' — Coups: '+mgMoves;ct.appendChild(info);
var area=document.createElement('div');area.className='mg-grid';
area.style.gridTemplateColumns='repeat('+mgSize+',50px)';area.style.display='inline-grid';
for(var i=0;i<mgSize*mgSize;i++){
var cell=document.createElement('div');cell.className='mg-cell'+(mgGrid[i]?' mg-on':' mg-off');
cell.textContent=mgGrid[i]?'💡':'';cell.dataset.idx=i;
(function(idx){cell.addEventListener('click',function(){
if(!mgPlaying)return;var r=Math.floor(idx/mgSize),c=idx%mgSize;
mgToggle(mgGrid,mgSize,r,c);mgMoves++;
if(mgCheckWin()){mgPlaying=false;mgWinLevel('lightsout');}
buildMiniGame();
});})(i);
area.appendChild(cell);
}
var wrap=document.createElement('div');wrap.style.textAlign='center';wrap.appendChild(area);ct.appendChild(wrap);
if(!mgPlaying){
var win=document.createElement('div');win.style.cssText='text-align:center;font-size:1.1rem;font-weight:bold;color:#4CAF50;padding:8px';
win.textContent='🎉 Terminé en '+mgMoves+' coups!';ct.appendChild(win);
mgNavBtns(ct,game);
}
mgResetBtn(ct,game);
}
function renderMemoryGamePage(ct,game){
if(!mmPlaying&&mmMatched<mmPairs&&mmMoves===0){mmGenLevel(mgPlayingLv);}
var cols=mmSize[1],rows=mmSize[0],total=rows*cols;
var cardPx=cols<=5?55:cols<=10?30:cols<=20?16:cols<=25?13:11;
var gapPx=cols<=5?6:cols<=10?3:1;
var fontSize=cols<=5?'1.4rem':cols<=10?'.85rem':cols<=20?'.5rem':cols<=25?'.4rem':'.33rem';
var info=document.createElement('div');info.className='mg-info';
info.innerHTML='🧠 Niveau '+mmPlayingLv+' — '+rows+'×'+cols+' — Coups: '+mmMoves+' — Paires: '+mmMatched+'/'+mmPairs;ct.appendChild(info);
var area=document.createElement('div');area.className='mm-grid';
area.style.gridTemplateColumns='repeat('+cols+','+cardPx+'px)';area.style.gap=gapPx+'px';area.style.display='inline-grid';
for(var i=0;i<total;i++){
var card=document.createElement('div');var isJoker=mmCards[i]==='⭐';var isFlipped=mmFlipped.indexOf(i)>=0;var isMatched=mmCards[i]===null;
card.className='mm-card'+(isFlipped?' mm-flip':'')+(isMatched?' mm-match':'')+(isJoker?' mm-joker':'');
card.style.width=cardPx+'px';card.style.height=cardPx+'px';card.style.fontSize=fontSize;
card.textContent=isJoker?'⭐':(isFlipped||isMatched)?(mmCards[i]||(isMatched?'✅':'')):'?';
if(!isMatched&&!isFlipped&&!isJoker){(function(idx){card.addEventListener('click',function(){
if(mmBusy||!mmPlaying)return;if(mmFlipped.indexOf(idx)>=0)return;
mmFlipped.push(idx);mmMoves++;
if(mmFlipped.length===2){mmBusy=true;var a=mmFlipped[0],b=mmFlipped[1];
buildMiniGame();
if(mmCards[a]===mmCards[b]){setTimeout(function(){mmCards[a]=null;mmCards[b]=null;mmMatched++;mmFlipped=[];mmBusy=false;
if(mmMatched>=mmPairs){mmPlaying=false;mgWinLevel('memory');}buildMiniGame();},500);
}else{setTimeout(function(){mmFlipped=[];mmBusy=false;buildMiniGame();},800);}
}else{buildMiniGame();}
});})(i);}
area.appendChild(card);
}
var wrap=document.createElement('div');wrap.style.cssText='text-align:center;overflow:auto;max-height:65vh';wrap.appendChild(area);ct.appendChild(wrap);
if(!mmPlaying&&mmMatched>=mmPairs){
var win=document.createElement('div');win.style.cssText='text-align:center;font-size:1.1rem;font-weight:bold;color:#4CAF50;padding:8px';
win.textContent='🎉 Terminé en '+mmMoves+' coups!';ct.appendChild(win);
mgNavBtns(ct,game);
}
mgResetBtn(ct,game);
}
function renderSimonGamePage(ct,game){
var info=document.createElement('div');info.className='mg-info';
info.innerHTML='🎵 Niveau '+siPlayingLv+' — Séquence: '+siSeq.length+' — '+(siShowing?'👀 Observez...':'👆 '+siInput.length+'/'+siSeq.length);ct.appendChild(info);
var pad=document.createElement('div');pad.className='simon-pad';
for(var c=0;c<4;c++){
var btn=document.createElement('div');btn.className='simon-btn';btn.dataset.color=c;btn.style.background=SIMON_COLORS[c];btn.id='simon-btn-'+c;
(function(ci){btn.addEventListener('click',function(){
if(!siPlaying||siShowing)return;siInput.push(ci);
var el=document.getElementById('simon-btn-'+ci);if(el){el.classList.add('simon-flash');setTimeout(function(){el.classList.remove('simon-flash');},300);}
if(siInput[siInput.length-1]!==siSeq[siInput.length-1]){siPlaying=false;showFloat(innerWidth/2,innerHeight/2,'❌ Raté!');setTimeout(function(){buildMiniGame();},800);return;}
if(siInput.length===siSeq.length){siPlaying=false;mgWinLevel('simon');setTimeout(function(){buildMiniGame();},800);}
else{var infoEl=ct.querySelector('.mg-info');if(infoEl)infoEl.innerHTML='🎵 Niveau '+siPlayingLv+' — Séquence: '+siSeq.length+' — 👆 '+siInput.length+'/'+siSeq.length;}
});})(c);
pad.appendChild(btn);
}
var wrap=document.createElement('div');wrap.style.textAlign='center';wrap.appendChild(pad);ct.appendChild(wrap);
if(siShowing){setTimeout(function(){siShowSequence(ct);},600);}
if(!siPlaying&&siInput.length===siSeq.length&&siInput.length>0){mgNavBtns(ct,game);}
mgResetBtn(ct,game);
}
function siShowSequence(ct){siShowing=true;siInput=[];var i=0;
function flashNext(){if(i>=siSeq.length){siShowing=false;buildMiniGame();return;}
var el=document.getElementById('simon-btn-'+siSeq[i]);if(el){el.classList.add('simon-flash');setTimeout(function(){el.classList.remove('simon-flash');i++;setTimeout(flashNext,300);},500);}else{i++;setTimeout(flashNext,300);}}flashNext();}
function renderTaquinGamePage(ct,game){
var cellPx=tqSize<=3?70:tqSize<=4?55:tqSize<=5?46:tqSize<=6?38:32;
var info=document.createElement('div');info.className='mg-info';
info.innerHTML='🧩 Niveau '+tqPlayingLv+' — '+tqSize+'×'+tqSize+' — Coups: '+tqMoves;ct.appendChild(info);
var area=document.createElement('div');area.className='tq-grid';
area.style.gridTemplateColumns='repeat('+tqSize+','+cellPx+'px)';area.style.display='inline-grid';
for(var i=0;i<tqSize*tqSize;i++){
var cell=document.createElement('div');cell.className='tq-cell'+(tqGrid[i]===0?' tq-empty':'');
cell.style.width=cellPx+'px';cell.style.height=cellPx+'px';cell.style.fontSize=(cellPx>50?'1.1rem':'.85rem');
if(tqGrid[i]!==0){cell.textContent=tqGrid[i];cell.style.background='linear-gradient(145deg,#42a5f5,#1976d2)';cell.style.color='#fff';
(function(idx){cell.addEventListener('click',function(){if(!tqPlaying)return;var moves=tqGetMoves();if(moves.indexOf(idx)<0)return;tqSwap(idx);tqMoves++;
if(tqCheckWin()){tqPlaying=false;mgWinLevel('taquin');}buildMiniGame();});})(i);}
area.appendChild(cell);
}
var wrap=document.createElement('div');wrap.style.textAlign='center';wrap.appendChild(area);ct.appendChild(wrap);
if(!tqPlaying&&tqCheckWin()){var win=document.createElement('div');win.style.cssText='text-align:center;font-size:1.1rem;font-weight:bold;color:#4CAF50;padding:8px';win.textContent='🎉 Terminé en '+tqMoves+' coups!';ct.appendChild(win);mgNavBtns(ct,game);}
mgResetBtn(ct,game);
}
function renderFloodGamePage(ct,game){
var cellPx=flSize<=6?40:flSize<=8?32:flSize<=10?26:flSize<=12?22:flSize<=14?18:15;
var info=document.createElement('div');info.className='mg-info';
info.innerHTML='🎨 Niveau '+flPlayingLv+' — '+flSize+'×'+flSize+' — Coups: '+flMoves+'/'+flMaxMoves;ct.appendChild(info);
var area=document.createElement('div');area.className='fl-grid';
area.style.gridTemplateColumns='repeat('+flSize+','+cellPx+'px)';area.style.display='inline-grid';
for(var i=0;i<flSize*flSize;i++){var cell=document.createElement('div');cell.className='fl-cell';cell.style.width=cellPx+'px';cell.style.height=cellPx+'px';cell.style.background=FL_COLORS[flGrid[i]];area.appendChild(cell);}
var wrap=document.createElement('div');wrap.style.textAlign='center';wrap.appendChild(area);ct.appendChild(wrap);
if(flPlaying){
var colorsDiv=document.createElement('div');colorsDiv.className='fl-colors';
for(var c=0;c<flNumColors;c++){var cb=document.createElement('div');cb.className='fl-color-btn'+(flGrid[0]===c?' fl-active':'');cb.style.background=FL_COLORS[c];
(function(ci){cb.addEventListener('click',function(){flFlood(ci);
var won=flGrid.every(function(v){return v===flGrid[0];});
if(won){flPlaying=false;mgWinLevel('flood');}
else if(flMoves>=flMaxMoves){flPlaying=false;showFloat(innerWidth/2,innerHeight/2,'❌ Plus de coups!');}
buildMiniGame();});})(c);colorsDiv.appendChild(cb);}
ct.appendChild(colorsDiv);
}
if(!flPlaying){var won=flGrid.every(function(v){return v===flGrid[0];});var msg=document.createElement('div');msg.style.cssText='text-align:center;font-size:1rem;font-weight:bold;padding:8px;color:'+(won?'#4CAF50':'#e74c3c');msg.textContent=won?'🎉 Terminé en '+flMoves+' coups!':'❌ Raté!';ct.appendChild(msg);
if(won)mgNavBtns(ct,game);}
mgResetBtn(ct,game);
}
function renderSnakeGamePage(ct,game){
var cellPx=snSize<=6?45:snSize<=8?35:snSize<=10?28:22;
var info=document.createElement('div');info.className='mg-info';
info.innerHTML='🐍 Niveau '+snPlayingLv+' — '+snSize+'×'+snSize+' — Mangé: '+snEaten+'/'+snTarget;ct.appendChild(info);
var area=document.createElement('div');area.style.cssText='display:inline-grid;gap:1px;padding:4px;background:rgba(0,0,0,.15);border-radius:8px';
area.style.gridTemplateColumns='repeat('+snSize+','+cellPx+'px)';
for(var i=0;i<snSize*snSize;i++){
var cell=document.createElement('div');cell.style.cssText='width:'+cellPx+'px;height:'+cellPx+'px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:'+(cellPx>30?'1rem':'.7rem');
if(i===snSnake[0])cell.style.background='#27ae60';
else if(snGrid[i]===1)cell.style.background='#2ecc71';
else if(snGrid[i]===2){cell.style.background='#e74c3c';cell.textContent='🍎';}
else cell.style.background='#ddd';
area.appendChild(cell);
}
var wrap=document.createElement('div');wrap.style.textAlign='center';wrap.appendChild(area);ct.appendChild(wrap);
if(snPlaying&&snAlive){
var dirs=document.createElement('div');dirs.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px';
var row1=document.createElement('div');
var upBtn=document.createElement('button');upBtn.className='mg-nav-btn prev';upBtn.textContent='⬆️';upBtn.style.cssText='padding:10px 20px;font-size:1.2rem;background:#5d4037;color:#fff;border:none;border-radius:8px;cursor:pointer';
upBtn.addEventListener('click',function(){if(snDir!==2){snDir=0;snMove();if(!snAlive){showFloat(innerWidth/2,innerHeight/2,'❌ Perdu!');}else if(!snPlaying&&snEaten>=snTarget){mgWinLevel('snake');}buildMiniGame();}});
row1.appendChild(upBtn);dirs.appendChild(row1);
var row2=document.createElement('div');row2.style.cssText='display:flex;gap:8px';
var leftBtn=document.createElement('button');leftBtn.textContent='⬅️';leftBtn.style.cssText='padding:10px 20px;font-size:1.2rem;background:#5d4037;color:#fff;border:none;border-radius:8px;cursor:pointer';
leftBtn.addEventListener('click',function(){if(snDir!==1){snDir=3;snMove();if(!snAlive){showFloat(innerWidth/2,innerHeight/2,'❌ Perdu!');}else if(!snPlaying&&snEaten>=snTarget){mgWinLevel('snake');}buildMiniGame();}});
var downBtn=document.createElement('button');downBtn.textContent='⬇️';downBtn.style.cssText='padding:10px 20px;font-size:1.2rem;background:#5d4037;color:#fff;border:none;border-radius:8px;cursor:pointer';
downBtn.addEventListener('click',function(){if(snDir!==0){snDir=2;snMove();if(!snAlive){showFloat(innerWidth/2,innerHeight/2,'❌ Perdu!');}else if(!snPlaying&&snEaten>=snTarget){mgWinLevel('snake');}buildMiniGame();}});
var rightBtn=document.createElement('button');rightBtn.textContent='➡️';rightBtn.style.cssText='padding:10px 20px;font-size:1.2rem;background:#5d4037;color:#fff;border:none;border-radius:8px;cursor:pointer';
rightBtn.addEventListener('click',function(){if(snDir!==3){snDir=1;snMove();if(!snAlive){showFloat(innerWidth/2,innerHeight/2,'❌ Perdu!');}else if(!snPlaying&&snEaten>=snTarget){mgWinLevel('snake');}buildMiniGame();}});
row2.appendChild(leftBtn);row2.appendChild(downBtn);row2.appendChild(rightBtn);dirs.appendChild(row2);
ct.appendChild(dirs);
}
if(!snPlaying){var msg=document.createElement('div');msg.style.cssText='text-align:center;font-size:1rem;font-weight:bold;padding:8px;color:'+(snEaten>=snTarget?'#4CAF50':'#e74c3c');msg.textContent=snEaten>=snTarget?'🎉 Niveau réussi!':'❌ Perdu!';ct.appendChild(msg);
if(snEaten>=snTarget)mgNavBtns(ct,game);}
mgResetBtn(ct,game);
}
function renderMazeGamePage(ct,game){
var w=maSize*2+1;var cellPx=maSize<=5?22:maSize<=7?16:maSize<=9?13:maSize<=11?11:maSize<=13?9:8;
var info=document.createElement('div');info.className='mg-info';
info.innerHTML='🏁 Niveau '+maPlayingLv+' — '+maSize+'×'+maSize+' — Mouvements: '+maMoves;ct.appendChild(info);
var dirDiv=document.createElement('div');dirDiv.style.cssText='display:flex;gap:4px;justify-content:center;flex-wrap:wrap;padding:4px';
['⬆️','⬇️','⬅️','➡️'].forEach(function(label,di){
  var dirs=[[0,-1],[0,1],[-1,0],[1,0]];
  var b=document.createElement('button');b.textContent=label;
  b.style.cssText='padding:8px 16px;font-size:1.2rem;background:#5d4037;color:#fff;border:none;border-radius:8px;cursor:pointer;min-width:44px';
  b.addEventListener('click',function(){
    if(!maPlaying)return;
    var pr=Math.floor(maPlayer/w),pc=maPlayer%w;
    var nr=pr+dirs[di][1],nc=pc+dirs[di][0];
    if(nr<0||nr>=w||nc<0||nc>=w)return;
    var nidx=nr*w+nc;
    if(maGrid[nidx]===1)return;
    maPlayer=nidx;maMoves++;
    if(maPlayer===maExit){maPlaying=false;mgWinLevel('maze');}
    buildMiniGame();
  });
  dirDiv.appendChild(b);
});
ct.appendChild(dirDiv);
var area=document.createElement('div');area.style.cssText='display:inline-grid;gap:0;padding:2px;background:#333;border-radius:4px';
area.style.gridTemplateColumns='repeat('+w+','+cellPx+'px)';
for(var i=0;i<w*w;i++){
var cell=document.createElement('div');cell.style.cssText='width:'+cellPx+'px;height:'+cellPx+'px;';
if(i===maPlayer)cell.style.background='#2ecc71';
else if(i===maExit)cell.style.background='#e74c3c';
else if(maGrid[i]===1)cell.style.background='#333';
else cell.style.background='#ecf0f1';
area.appendChild(cell);
}
var wrap=document.createElement('div');wrap.style.textAlign='center';wrap.appendChild(area);ct.appendChild(wrap);
// Touch swipe on grid
var touchStartX=0,touchStartY=0;
wrap.addEventListener('touchstart',function(e){touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY;},{passive:true});
wrap.addEventListener('touchend',function(e){
  if(!maPlaying)return;
  var dx=e.changedTouches[0].clientX-touchStartX;
  var dy=e.changedTouches[0].clientY-touchStartY;
  if(Math.abs(dx)<15&&Math.abs(dy)<15)return;
  var pr=Math.floor(maPlayer/w),pc=maPlayer%w,nr,nc;
  if(Math.abs(dx)>Math.abs(dy)){nr=pr;nc=pc+(dx>0?1:-1);}
  else{nr=pr+(dy>0?1:-1);nc=pc;}
  if(nr<0||nr>=w||nc<0||nc>=w)return;
  var nidx=nr*w+nc;
  if(maGrid[nidx]===1)return;
  maPlayer=nidx;maMoves++;
  if(maPlayer===maExit){maPlaying=false;mgWinLevel('maze');}
  buildMiniGame();
});
if(!maPlaying&&maPlayer===maExit){var win=document.createElement('div');win.style.cssText='text-align:center;font-size:1rem;font-weight:bold;color:#4CAF50;padding:8px';win.textContent='🎉 Terminé en '+maMoves+' mouvements!';ct.appendChild(win);mgNavBtns(ct,game);}
mgResetBtn(ct,game);
}
function renderMinesweeperGamePage(ct,game){
var cellPx=msSize<=6?38:msSize<=8?32:msSize<=10?26:msSize<=12?22:18;
var flagCount=0;for(var fi=0;fi<msFlagged.length;fi++)if(msFlagged[fi])flagCount++;
var info=document.createElement('div');info.className='mg-info';
info.innerHTML='💣 Niveau '+msPlayingLv+' — '+msSize+'×'+msSize+' — 💣 '+(msMines-flagCount)+' restante(s) · 🚩 '+flagCount;ct.appendChild(info);
var msMode='reveal';
var modeBar=document.createElement('div');modeBar.style.cssText='display:flex;gap:6px;justify-content:center;padding:4px';
var revBtn=document.createElement('button');revBtn.style.cssText='padding:6px 14px;border:none;border-radius:6px;font-size:.8rem;font-weight:bold;cursor:pointer;background:#4CAF50;color:#fff';revBtn.textContent='👆 Révéler';
var flagBtn=document.createElement('button');flagBtn.style.cssText='padding:6px 14px;border:none;border-radius:6px;font-size:.8rem;font-weight:bold;cursor:pointer;background:#bbb;color:#333';flagBtn.textContent='🚩 Drapeau';
revBtn.addEventListener('click',function(){msMode='reveal';revBtn.style.background='#4CAF50';revBtn.style.color='#fff';flagBtn.style.background='#bbb';flagBtn.style.color='#333';});
flagBtn.addEventListener('click',function(){msMode='flag';flagBtn.style.background='#e67e22';flagBtn.style.color='#fff';revBtn.style.background='#bbb';revBtn.style.color='#333';});
modeBar.appendChild(revBtn);modeBar.appendChild(flagBtn);ct.appendChild(modeBar);
var area=document.createElement('div');area.style.cssText='display:inline-grid;gap:1px;padding:4px;background:rgba(0,0,0,.15);border-radius:8px';
area.style.gridTemplateColumns='repeat('+msSize+','+cellPx+'px)';
var MS_NUM_COLORS=['','#1976D2','#388E3C','#D32F2F','#7B1FA2','#FF8F00','#00838F','#333','#888'];
for(var i=0;i<msSize*msSize;i++){
var cell=document.createElement('div');
cell.style.cssText='width:'+cellPx+'px;height:'+cellPx+'px;display:flex;align-items:center;justify-content:center;border-radius:3px;cursor:pointer;font-size:'+(cellPx>30?'.8rem':'.6rem')+';font-weight:bold';
if(msRevealed[i]){
  if(msGrid[i]===-1){cell.style.background='#e74c3c';cell.textContent='💣';}
  else{cell.style.background='#e8e8e8';if(msGrid[i]>0){cell.textContent=msGrid[i];cell.style.color=MS_NUM_COLORS[msGrid[i]]||'#333';}else cell.style.background='#d5d5d5';}
}else if(msFlagged[i]){cell.style.background='#fff3e0';cell.textContent='🚩';}
else{cell.style.background='linear-gradient(145deg,#90CAF9,#64B5F6)';}
if(msPlaying&&!msRevealed[i]){(function(idx){cell.addEventListener('click',function(){
  if(!msPlaying)return;
  if(msMode==='flag'){msToggleFlag(idx);}
  else{msReveal(idx);if(!msPlaying&&msWon)mgWinLevel('minesweeper');if(!msPlaying&&!msWon)showFloat(innerWidth/2,innerHeight/2,'💥 Boom!');}
  buildMiniGame();
});})(i);}
area.appendChild(cell);
}
var wrap=document.createElement('div');wrap.style.textAlign='center';wrap.appendChild(area);ct.appendChild(wrap);
if(!msPlaying){var msg=document.createElement('div');msg.style.cssText='text-align:center;font-size:1rem;font-weight:bold;padding:8px;color:'+(msWon?'#4CAF50':'#e74c3c');msg.textContent=msWon?'🎉 Déminé!':'💥 Boom! Perdu!';ct.appendChild(msg);
if(msWon)mgNavBtns(ct,game);}
mgResetBtn(ct,game);
}
function renderPatternGamePage(ct,game){
var cellPx=cpSize<=3?55:cpSize<=4?46:cpSize<=5?38:32;
var info=document.createElement('div');info.className='mg-info';
info.innerHTML='🎯 Niveau '+cpPlayingLv+' — '+cpSize+'×'+cpSize+(cpShowing?' — 👀 Mémorisez!':' — 👆 Reproduisez!');ct.appendChild(info);
var area=document.createElement('div');area.style.cssText='display:inline-grid;gap:3px;padding:4px;background:rgba(0,0,0,.1);border-radius:8px';
area.style.gridTemplateColumns='repeat('+cpSize+','+cellPx+'px)';
var displayGrid=cpShowing?cpTarget:cpGrid;
for(var i=0;i<cpSize*cpSize;i++){
var cell=document.createElement('div');
cell.style.cssText='width:'+cellPx+'px;height:'+cellPx+'px;border-radius:6px;cursor:pointer;border:2px solid rgba(0,0,0,.1);display:flex;align-items:center;justify-content:center';
cell.style.background=displayGrid[i]>0?CP_COLORS[displayGrid[i]-1]:'#eee';
if(!cpShowing&&cpPlaying){
(function(idx){cell.addEventListener('click',function(){
if(!cpPlaying||cpShowing)return;
cpGrid[idx]=(cpGrid[idx]+1)%(cpNumColors+1);cpMoves++;
if(cpCheckWin()){cpPlaying=false;mgWinLevel('pattern');}
buildMiniGame();
});})(i);
}
area.appendChild(cell);
}
var wrap=document.createElement('div');wrap.style.textAlign='center';wrap.appendChild(area);ct.appendChild(wrap);
if(cpShowing){setTimeout(function(){cpShowing=false;buildMiniGame();},2000+cpPlayingLv*30);}
if(!cpShowing&&cpPlaying){
var legend=document.createElement('div');legend.style.cssText='text-align:center;font-size:.65rem;color:#888;padding:4px';
legend.textContent='Touche une case pour changer sa couleur ('+cpNumColors+' couleurs + vide)';ct.appendChild(legend);
var hintCost=100+cpPlayingLv*20;
var hintBtn=document.createElement('button');
hintBtn.style.cssText='display:block;margin:6px auto;padding:6px 16px;background:'+(state.coins>=hintCost?'#e67e22':'#bbb')+';color:#fff;border:none;border-radius:8px;font-size:.75rem;font-weight:bold;cursor:pointer';
hintBtn.textContent='💡 Indice ('+fmtN(hintCost)+'💰)';
hintBtn.disabled=state.coins<hintCost;
hintBtn.addEventListener('click',function(){
  if(state.coins<hintCost)return;
  state.coins-=hintCost;updateUI();
  cpShowing=true;buildMiniGame();
  setTimeout(function(){cpShowing=false;buildMiniGame();},1500);
});
ct.appendChild(hintBtn);
}
if(!cpPlaying&&cpCheckWin()){var win=document.createElement('div');win.style.cssText='text-align:center;font-size:1rem;font-weight:bold;color:#4CAF50;padding:8px';win.textContent='🎉 Pattern réussi!';ct.appendChild(win);mgNavBtns(ct,game);}
mgResetBtn(ct,game);
}
function render2048GamePage(ct,game){
var cellPx=50;
var info=document.createElement('div');info.className='mg-info';
info.innerHTML='🔢 Niveau '+rvPlayingLv+' — Objectif: '+rvTarget+' — Score: '+rvScore;ct.appendChild(info);
var area=document.createElement('div');area.style.cssText='display:inline-grid;gap:4px;padding:6px;background:#bbada0;border-radius:8px';
area.style.gridTemplateColumns='repeat('+rvSize+','+cellPx+'px)';
var colorMap={0:'#cdc1b4',2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'};
for(var i=0;i<rvSize*rvSize;i++){
var cell=document.createElement('div');var val=rvGrid[i];
cell.style.cssText='width:'+cellPx+'px;height:'+cellPx+'px;display:flex;align-items:center;justify-content:center;border-radius:4px;font-weight:bold;font-size:'+(val>99?'.7rem':'.9rem')+';color:'+(val<=4?'#776e65':'#fff')+';background:'+(colorMap[val]||'#3c3a32');
if(val>0)cell.textContent=val;
area.appendChild(cell);
}
var wrap=document.createElement('div');wrap.style.textAlign='center';wrap.appendChild(area);ct.appendChild(wrap);
if(rvPlaying&&!rvWon){
var dirDiv=document.createElement('div');dirDiv.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px';
function mkDirBtn(label,dir){
var b=document.createElement('button');b.textContent=label;b.style.cssText='padding:10px 20px;font-size:1.2rem;background:#8f7a66;color:#fff;border:none;border-radius:8px;cursor:pointer';
b.addEventListener('click',function(){
rvSlide(dir);
if(rvGrid.some(function(v){return v>=rvTarget;})){rvPlaying=false;rvWon=true;mgWinLevel('2048');}
else if(rvCheckGameOver()){rvPlaying=false;showFloat(innerWidth/2,innerHeight/2,'❌ Game Over!');}
buildMiniGame();
});return b;
}
var r1=document.createElement('div');r1.appendChild(mkDirBtn('⬆️',0));dirDiv.appendChild(r1);
var r2=document.createElement('div');r2.style.cssText='display:flex;gap:8px';
r2.appendChild(mkDirBtn('⬅️',3));r2.appendChild(mkDirBtn('⬇️',2));r2.appendChild(mkDirBtn('➡️',1));
dirDiv.appendChild(r2);ct.appendChild(dirDiv);
}
if(!rvPlaying){var msg=document.createElement('div');msg.style.cssText='text-align:center;font-size:1rem;font-weight:bold;padding:8px;color:'+(rvWon?'#4CAF50':'#e74c3c');msg.textContent=rvWon?'🎉 '+rvTarget+' atteint!':'❌ Game Over!';ct.appendChild(msg);
if(rvWon)mgNavBtns(ct,game);}
mgResetBtn(ct,game);
}

function renderMGRules(ct){
ct.innerHTML+='<div class="mg-rules">'
+'<h3 style="text-align:center;margin-bottom:8px">📖 Règles des Mini-Jeux</h3>'
+'<h4>🔦 Lights Out</h4>'
+'<p>Éteindre toutes les lumières. Toucher une case change son état et les 4 adjacentes.</p>'
+'<p>100 niveaux — grilles de 3×3 à 8×8. +1⭐/niveau.</p>'
+'<hr style="margin:8px 0;border-color:rgba(0,0,0,.1)">'
+'<h4>🧠 Mémoire</h4>'
+'<p>Retrouver les paires de cartes identiques. 100 niveaux, grilles de 5×5 à 30×30. +1⭐/niveau.</p>'
+'<hr style="margin:8px 0;border-color:rgba(0,0,0,.1)">'
+'<h4>🎵 Simon</h4>'
+'<p>Reproduire la séquence de couleurs montrée. 100 niveaux, séquences de 3 à 102. +1⭐/niveau.</p>'
+'<hr style="margin:8px 0;border-color:rgba(0,0,0,.1)">'
+'<h4>🧩 Taquin</h4>'
+'<p>Remettre les numéros dans l\'ordre en glissant les tuiles. 100 niveaux, 3×3 à 7×7. +1⭐/niveau.</p>'
+'<hr style="margin:8px 0;border-color:rgba(0,0,0,.1)">'
+'<h4>🎨 Flood</h4>'
+'<p>Remplir la grille d\'une seule couleur en nombre limité de coups. 100 niveaux. +1⭐/niveau.</p>'
+'<hr style="margin:8px 0;border-color:rgba(0,0,0,.1)">'
+'<h4>🐍 Snake</h4>'
+'<p>Diriger le serpent pour manger les pommes. Ne toucher ni les murs ni son corps! 100 niveaux. +1⭐/niveau.</p>'
+'<hr style="margin:8px 0;border-color:rgba(0,0,0,.1)">'
+'<h4>🏁 Labyrinthe</h4>'
+'<p>Trouver la sortie (case rouge) du labyrinthe. Toucher les cases adjacentes pour se déplacer. 100 niveaux. +1⭐/niveau.</p>'
+'<hr style="margin:8px 0;border-color:rgba(0,0,0,.1)">'
+'<h4>� Démineur</h4>'
+'<p>Révélez toutes les cases sans mines! Les chiffres indiquent combien de mines sont adjacentes. Utilisez les drapeaux pour marquer les mines. 100 niveaux. +1⭐/niveau.</p>'
+'<hr style="margin:8px 0;border-color:rgba(0,0,0,.1)">'
+'<h4>🎯 Pattern</h4>'
+'<p>Un motif coloré est montré brièvement. Reproduisez-le de mémoire! Toucher pour changer la couleur. 100 niveaux. +1⭐/niveau.</p>'
+'<hr style="margin:8px 0;border-color:rgba(0,0,0,.1)">'
+'<h4>🔢 2048</h4>'
+'<p>Glissez les tuiles pour fusionner les nombres identiques. Atteignez l\'objectif! 100 niveaux. +1⭐/niveau.</p>'
+'</div>';
}
