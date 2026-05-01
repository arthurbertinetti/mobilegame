// === Iso/Garden data — extracted from farmvalley.html ===
// Loaded BEFORE the main inline <script> so all globals exist when needed.

// --- GARDEN_SIZE / GARDEN_CATS ---
var GARDEN_SIZE=16;
var GARDEN_CATS=[
  {id:'batiment',name:'🏠 Bâtiments',items:[
    {id:'cabane',name:'Cabane',emoji:'🛖',cost:20000,wood:15,states:['🪵','🛖','🏕️','⛺','🏡'],reward:{res:{oeuf:5}},rewardDesc:'5🥚/mois'},
    {id:'maison',name:'Maison',emoji:'🏠',cost:30000,wood:20,states:['🏚️','🏠','🏡'],reward:{coins:10000},rewardDesc:'10 000💰/mois'},
    {id:'serre',name:'Serre',emoji:'🌿',cost:50000,wood:30,states:['🏗️','🌿','🌱','🌲'],reward:{randomCrops:7,randomHerbs:5},rewardDesc:'7 cultures + 5 herbes al\u00e9a./mois'},
    {id:'grange',name:'Grange',emoji:'🏠',cost:80000,wood:40,states:['🏗️','🏠','🏡','🏘️','🌾','🎪'],reward:{res:{lait:10}},rewardDesc:'10🥛/mois'},
    {id:'cafe',name:'Café',emoji:'☕',cost:90000,wood:35,states:['🏗️','☕','🍵','🧁','🎂','🍰','🍩','🍪','🫖','🥐','🍽️','⭐','🌟','✨','🏆'],reward:{randomTransfo:3,coins:8000},rewardDesc:'8 000💰 + 3 ress. transfo./mois'},
    {id:'marche',name:'Marché',emoji:'🏪',cost:100000,wood:45,states:['🏗️','🏪','🏬','🛒','🛍️','💰','🎪','🎡','🏟️','🎠','🎢','🎆','🌟','🏆'],reward:{randomAnimal:15},rewardDesc:'15 ress. animaux/mois'},
    {id:'moulin_d',name:'Moulin',emoji:'🏭',cost:120000,wood:50,states:['🏗️','🏭','⚙️','🔧','🔩','💨','🌬️'],reward:{res:{farine_ble:4,farine_mais:4}},rewardDesc:'4 farine blé + 4 farine maïs/mois'},
    {id:'poste',name:'Poste',emoji:'🏣',cost:130000,wood:50,states:['🏗️','🏣','📮','📬','📫','📦','🏤','📨','💌','🎁','🚚','📡','🛰️','🌍','✨','🏆'],reward:{randomBrut:12},rewardDesc:'12 ressources/mois'},
    {id:'phare',name:'Phare',emoji:'🗼',cost:150000,wood:50,states:['🏗️','🗼','🔦','💡','🌟','✨','🔆','⚡','🌈','🎆'],reward:{coins:15000,randomBrut:3},rewardDesc:'15 000💰 + 3 ress./mois'},
    {id:'bibliotheque',name:'Bibliothèque',emoji:'🏢',cost:180000,wood:55,states:['🏗️','🏢','📖','📚','📜','🔖','🏛️','📕','📗','📘','📙','🎭','🏆'],reward:{randomTransfo:5},rewardDesc:'5 ress. transformées/mois'},
    {id:'eglise',name:'Chapelle',emoji:'⛪',cost:200000,wood:60,states:['🏗️','⛪','🕍','🛕','💒','🙏','✝️','⭐'],reward:{coins:20000,stars:1},rewardDesc:'20 000💰 + 1⭐/mois'},
    {id:'ecole',name:'École',emoji:'🏫',cost:250000,wood:70,states:['🏗️','🏫','📚','🎓','🔬','🔭','🏅','📐','✏️','🎨','🧪','🏆'],reward:{coins:25000,randomBrut:5},rewardDesc:'25 000💰 + 5 ress./mois'},
    {id:'hotel',name:'Hôtel',emoji:'🏨',cost:350000,wood:80,states:['🏗️','🏨','🏩','🛎️','🎩','💎','🌟','✨','🏆','👑','🎖️'],reward:{coins:35000},rewardDesc:'35 000💰/mois'},
    {id:'chateau',name:'Château',emoji:'🏰',cost:500000,wood:100,states:['🏗️','🏰','🏯','👑','🗡️','🛡️','⚜️','🦁','💎'],reward:{coins:50000},rewardDesc:'50 000💰/mois'}
  ]},
  {id:'deco',name:'🌳 Décorations',items:[
    {id:'souche',name:'Souche',emoji:'🪵',cost:2000},
    {id:'herbe',name:'Herbe haute',emoji:'🌾',cost:3000},
    {id:'fleur_d',name:'Fleurs',emoji:'🌷',cost:4000},
    {id:'buisson',name:'Buisson',emoji:'☘️',cost:4000},
    {id:'lierre',name:'Lierre',emoji:'🌿',cost:5000},
    {id:'tournesol',name:'Tournesol',emoji:'🌻',cost:5000},
    {id:'arbre_d',name:'Arbre',emoji:'🌳',cost:6000},
    {id:'champignon_d',name:'Champignon',emoji:'🍄',cost:6000},
    {id:'pierre_deco',name:'Rocher',emoji:'🪨',cost:6000},
    {id:'rose',name:'Roses',emoji:'🌹',cost:7000},
    {id:'sapin',name:'Sapin',emoji:'🌲',cost:8000},
    {id:'cactus',name:'Cactus',emoji:'🌵',cost:8000},
    {id:'palmier',name:'Palmier',emoji:'🌴',cost:10000},
    {id:'trefle',name:'Trèfle',emoji:'🍀',cost:10000},
    {id:'bambou',name:'Bambou',emoji:'🎋',cost:12000},
    {id:'nenuphare',name:'Nénuphar',emoji:'🌺',cost:14000},
    {id:'cerisier',name:'Cerisier',emoji:'🌸',cost:16000},
    {id:'bonsai',name:'Bonsaï',emoji:'🌾',cost:24000},
    {id:'lac',name:'Lac',emoji:'🏞️',cost:25000},
    {id:'riviere',name:'Rivière',emoji:'🌊',cost:30000},
    {id:'mare',name:'Mare',emoji:'💧',cost:15000}
  ]},
  {id:'mobilier',name:'🪑 Mobilier',items:[
    {id:'boite_lettre',name:'Boîte lettres',emoji:'📮',cost:5000},
    {id:'pot_fleur',name:'Pot de fleurs',emoji:'🪴',cost:6000},
    {id:'table',name:'Table',emoji:'🪵',cost:8000},
    {id:'banc',name:'Banc',emoji:'🪑',cost:10000},
    {id:'hamac',name:'Hamac',emoji:'🛋️',cost:12000},
    {id:'lampadaire',name:'Lampadaire',emoji:'🪔',cost:15000},
    {id:'barbecue',name:'Barbecue',emoji:'🔥',cost:15000},
    {id:'balancoire',name:'Balançoire',emoji:'🎠',cost:18000},
    {id:'parasol',name:'Parasol',emoji:'⛱️',cost:20000},
    {id:'toboggan',name:'Toboggan',emoji:'🛝',cost:25000},
    {id:'borne',name:'Borne arcade',emoji:'🎮',cost:30000},
    {id:'horloge',name:'Horloge',emoji:'🕰️',cost:35000},
    {id:'telescope',name:'Télescope',emoji:'🔭',cost:40000},
    {id:'fontaine',name:'Fontaine',emoji:'⛲',cost:50000},
    {id:'statue',name:'Statue',emoji:'🗿',cost:80000},
    {id:'jacuzzi',name:'Jacuzzi',emoji:'🛁',cost:100000}
  ]},
  {id:'cloture',name:'🏗️ Clôtures',items:[
    {id:'chemin',name:'Chemin',emoji:'🟫',cost:1000},
    {id:'cloture_bois',name:'Clôture bois',emoji:'🪵',cost:2000,wood:5},
    {id:'haie',name:'Haie',emoji:'🌿',cost:3000,wood:3},
    {id:'allee',name:'Allée pavée',emoji:'⬜',cost:3000},
    {id:'muret',name:'Muret bas',emoji:'🧱',cost:4000},
    {id:'mur_pierre',name:'Mur pierre',emoji:'🧱',cost:6000},
    {id:'barriere',name:'Barrière métal',emoji:'⛓️',cost:8000},
    {id:'escalier',name:'Escalier',emoji:'🪜',cost:15000,wood:8},
    {id:'portail',name:'Portail',emoji:'🚪',cost:20000,wood:10},
    {id:'arche',name:'Arche fleurie',emoji:'🎊',cost:25000,wood:15},
    {id:'passerelle',name:'Passerelle',emoji:'🌉',cost:30000,wood:25},
    {id:'pont',name:'Pont',emoji:'🌉',cost:40000,wood:20}
  ]}
];

// --- GARDEN_VISUALS / GARDEN_SYMBOLS ---
var GARDEN_VISUALS={
  // Buildings
  cabane:'linear-gradient(180deg,#8B4513 0%,#A0522D 40%,#654321 41%,#5C4033 100%)',
  maison:'linear-gradient(180deg,#c0392b 0%,#e74c3c 35%,#f5f5dc 36%,#faf0e6 100%)',
  serre:'linear-gradient(180deg,#81c784 0%,rgba(200,255,200,.6) 40%,rgba(220,255,220,.4) 100%)',
  grange:'linear-gradient(180deg,#8B0000 0%,#B22222 35%,#DEB887 36%,#D2B48C 100%)',
  cafe:'linear-gradient(180deg,#5D4037 0%,#795548 40%,#FFCC80 41%,#FFE0B2 100%)',
  marche:'linear-gradient(180deg,#FF6F00 0%,#FFA726 35%,#FFF3E0 36%,#FFF8E1 100%)',
  moulin_d:'linear-gradient(180deg,#78909C 0%,#B0BEC5 35%,#ECEFF1 36%,#F5F5F5 100%)',
  poste:'linear-gradient(180deg,#1565C0 0%,#42A5F5 35%,#E3F2FD 36%,#BBDEFB 100%)',
  phare:'linear-gradient(180deg,#FFF176 0%,#FFEE58 20%,#E0E0E0 21%,#BDBDBD 60%,#9E9E9E 100%)',
  bibliotheque:'linear-gradient(180deg,#5D4037 0%,#795548 25%,#D7CCC8 26%,#EFEBE9 100%)',
  eglise:'linear-gradient(180deg,#FFD700 0%,#FFC107 15%,#F5F5F5 16%,#E0E0E0 100%)',
  ecole:'linear-gradient(180deg,#1976D2 0%,#42A5F5 30%,#FFF9C4 31%,#FFFDE7 100%)',
  hotel:'linear-gradient(180deg,#7B1FA2 0%,#AB47BC 30%,#F3E5F5 31%,#FCE4EC 100%)',
  chateau:'linear-gradient(180deg,#455A64 0%,#78909C 20%,#CFD8DC 21%,#B0BEC5 50%,#90A4AE 100%)',
  // Decorations
  souche:'radial-gradient(ellipse at 50% 60%,#8B4513,#654321)',
  herbe:'linear-gradient(180deg,#66BB6A 0%,#43A047 50%,#2E7D32 100%)',
  fleur_d:'radial-gradient(circle at 50% 40%,#E91E63,#F48FB1,#66BB6A 70%)',
  buisson:'radial-gradient(ellipse at 50% 55%,#4CAF50,#2E7D32,#1B5E20)',
  lierre:'linear-gradient(135deg,#4CAF50,#2E7D32,#1B5E20)',
  tournesol:'radial-gradient(circle at 50% 35%,#FDD835,#F9A825,#4CAF50 65%)',
  arbre_d:'radial-gradient(ellipse at 50% 35%,#43A047,#2E7D32 55%,#5D4037 56%,#4E342E 100%)',
  champignon_d:'radial-gradient(ellipse at 50% 40%,#D32F2F,#B71C1C 50%,#EFEBE9 51%,#D7CCC8 100%)',
  pierre_deco:'radial-gradient(ellipse at 45% 50%,#9E9E9E,#757575,#616161)',
  rose:'radial-gradient(circle at 50% 40%,#E91E63,#C2185B,#388E3C 65%)',
  sapin:'linear-gradient(180deg,#1B5E20 0%,#2E7D32 60%,#5D4037 61%,#4E342E 100%)',
  cactus:'radial-gradient(ellipse at 50% 50%,#66BB6A,#388E3C,#2E7D32)',
  palmier:'radial-gradient(ellipse at 50% 30%,#66BB6A,#43A047 45%,#8D6E63 46%,#795548 100%)',
  trefle:'radial-gradient(circle at 50% 50%,#4CAF50,#2E7D32)',
  bambou:'linear-gradient(90deg,#66BB6A 30%,#81C784 50%,#66BB6A 70%)',
  nenuphare:'radial-gradient(circle at 50% 50%,#E91E63 20%,#4CAF50 21%,#2E7D32 60%,#1565C0 61%)',
  cerisier:'radial-gradient(ellipse at 50% 35%,#F48FB1,#EC407A 50%,#795548 51%,#5D4037 100%)',
  bonsai:'radial-gradient(ellipse at 50% 35%,#388E3C,#2E7D32 55%,#5D4037 56%)',
  lac:'radial-gradient(ellipse at 50% 50%,#29B6F6,#0288D1,#01579B)',
  riviere:'linear-gradient(135deg,#4FC3F7,#0288D1,#01579B)',
  mare:'radial-gradient(ellipse at 50% 55%,#4FC3F7,#0288D1,#388E3C 85%)',
  // Furniture
  boite_lettre:'linear-gradient(180deg,#F44336 0%,#D32F2F 50%,#795548 51%,#5D4037 100%)',
  pot_fleur:'radial-gradient(ellipse at 50% 40%,#4CAF50 30%,#FF7043 31%,#BF360C 100%)',
  table:'linear-gradient(180deg,#8D6E63 0%,#6D4C41 40%,#5D4037 100%)',
  banc:'linear-gradient(180deg,#8D6E63 0%,#5D4037 50%,#4E342E 100%)',
  hamac:'linear-gradient(180deg,#29B6F6 20%,#F48FB1 50%,#29B6F6 80%)',
  lampadaire:'linear-gradient(180deg,#FFF176 0%,#FFEE58 25%,#424242 26%,#616161 100%)',
  barbecue:'linear-gradient(180deg,#FF5722 0%,#E64A19 40%,#424242 41%,#616161 100%)',
  balancoire:'linear-gradient(180deg,#FF7043 0%,#8D6E63 40%,#5D4037 100%)',
  parasol:'radial-gradient(ellipse at 50% 30%,#FF7043,#E64A19 50%,#795548 51%)',
  toboggan:'linear-gradient(135deg,#42A5F5,#1976D2,#0D47A1)',
  borne:'linear-gradient(180deg,#1A237E 0%,#283593 40%,#3F51B5 41%,#5C6BC0 100%)',
  horloge:'radial-gradient(circle at 50% 50%,#FFF9C4,#F9A825,#5D4037 70%)',
  telescope:'linear-gradient(160deg,#78909C,#546E7A,#37474F)',
  fontaine:'radial-gradient(ellipse at 50% 60%,#4FC3F7,#0288D1,#BDBDBD 70%)',
  statue:'radial-gradient(ellipse at 50% 40%,#BDBDBD,#9E9E9E,#757575)',
  jacuzzi:'radial-gradient(ellipse at 50% 55%,#80DEEA,#26C6DA,#00838F)',
  // Fences
  chemin:'linear-gradient(145deg,#A1887F,#8D6E63,#6D4C41)',
  cloture_bois:'linear-gradient(0deg,#8D6E63 0%,#A1887F 30%,transparent 31%,transparent 70%,#A1887F 71%,#8D6E63 100%)',
  haie:'linear-gradient(0deg,#388E3C 0%,#4CAF50 30%,#43A047 50%,#4CAF50 70%,#388E3C 100%)',
  allee:'linear-gradient(145deg,#E0E0E0,#BDBDBD,#9E9E9E)',
  muret:'linear-gradient(180deg,#A1887F,#8D6E63,#795548)',
  mur_pierre:'linear-gradient(180deg,#9E9E9E,#757575,#616161)',
  barriere:'linear-gradient(0deg,#78909C 0%,#90A4AE 30%,transparent 31%,transparent 70%,#90A4AE 71%,#78909C 100%)',
  escalier:'linear-gradient(180deg,#BDBDBD 25%,#9E9E9E 26%,#9E9E9E 50%,#757575 51%,#757575 75%,#616161 76%)',
  portail:'linear-gradient(180deg,#5D4037 0%,#795548 40%,#4E342E 41%,#3E2723 100%)',
  arche:'radial-gradient(ellipse at 50% 100%,transparent 40%,#F48FB1 41%,#E91E63 60%,#388E3C 61%)',
  passerelle:'linear-gradient(90deg,#8D6E63,#A1887F,#8D6E63)',
  pont:'linear-gradient(90deg,#795548,#8D6E63,#A1887F,#8D6E63,#795548)'
};
var GARDEN_SYMBOLS={
  cabane:'⌂',maison:'⌂',serre:'◇',grange:'▣',cafe:'☕',marche:'⊞',moulin_d:'⊗',
  poste:'✉',phare:'△',bibliotheque:'▤',eglise:'✝',ecole:'▥',hotel:'◈',chateau:'♜',
  souche:'◎',herbe:'≋',fleur_d:'✿',buisson:'●',lierre:'≈',tournesol:'✻',
  arbre_d:'♠',champignon_d:'Ω',pierre_deco:'◆',rose:'✿',sapin:'▲',cactus:'↑',
  palmier:'⌘',trefle:'♣',bambou:'∥',nenuphare:'◉',cerisier:'❀',bonsai:'♤',
  lac:'◯',riviere:'～',mare:'○',
  boite_lettre:'✉',pot_fleur:'⚘',table:'▬',banc:'━',hamac:'⌒',lampadaire:'♨',
  barbecue:'♨',balancoire:'∿',parasol:'☂',toboggan:'⌇',borne:'▣',horloge:'◷',
  telescope:'⌕',fontaine:'⛲',statue:'♛',jacuzzi:'◎',
  chemin:'═',cloture_bois:'┃',haie:'┃',allee:'▒',muret:'▬',mur_pierre:'▬',
  barriere:'┃',escalier:'≡',portail:'⊞',arche:'∩',passerelle:'═',pont:'═'
};

// --- ISO_W / ISO_H / ISO_D ---
var ISO_W=38,ISO_H=19,ISO_D=11;

// --- _gFlatItems ---
var _gFlatItems=['chemin','allee','lac','riviere','mare'];

// --- _ITEM_H ---
var _ITEM_H={
  cabane:1.8,maison:2.0,serre:1.6,grange:1.9,cafe:1.7,marche:1.8,moulin_d:2.2,
  poste:2.0,phare:3.0,bibliotheque:1.8,eglise:2.5,ecole:2.0,hotel:2.3,chateau:3.2,
  souche:0.7,herbe:1.2,fleur_d:1.2,buisson:1.0,lierre:0.7,tournesol:1.5,arbre_d:2.2,
  champignon_d:1.0,pierre_deco:0.6,rose:1.2,sapin:2.5,cactus:1.8,palmier:2.5,trefle:0.4,
  bambou:2.3,nenuphare:0.3,cerisier:2.3,bonsai:1.4,lac:0.2,riviere:0.2,mare:0.2,
  boite_lettre:1.3,pot_fleur:1.1,table:0.8,banc:0.7,hamac:1.0,lampadaire:2.3,
  barbecue:1.0,balancoire:1.8,parasol:1.9,toboggan:1.7,borne:1.4,horloge:1.8,
  telescope:1.6,fontaine:1.5,statue:2.0,jacuzzi:0.8,
  chemin:0.15,cloture_bois:1.1,haie:1.1,allee:0.15,muret:0.9,mur_pierre:1.3,
  barriere:1.3,escalier:0.7,portail:1.5,arche:1.9,passerelle:0.7,pont:0.9
};

// --- _ITEM_COL ---
var _ITEM_COL={
  cabane:['#c8834e','#7a3818','#dca870'],maison:['#e8d0a8','#a07840','#f8e8c0'],
  serre:['rgba(180,240,180,0.88)','#386830','rgba(210,255,210,0.72)'],
  grange:['#c85030','#8a1010','#e88068'],cafe:['#b08060','#684828','#d0a888'],
  marche:['#f0b040','#c07018','#ffe870'],moulin_d:['#c0c8d0','#8090a0','#e0e8f0'],
  poste:['#5898d8','#1850b0','#88c0f8'],phare:['#f8f0c0','#b8a060','#fffff0'],
  bibliotheque:['#c8b090','#886848','#e8d0b0'],eglise:['#f0f0f8','#9898b8','#ffffff'],
  ecole:['#e8e070','#a8a030','#f8f8a8'],hotel:['#d090e0','#9050a8','#f0c0f8'],
  chateau:['#c8d0d8','#607080','#e0e8f0'],
  souche:['#8B4513','#5a2c08','#a86030'],herbe:['#4CAF50','#2E7D32','#80C880'],
  fleur_d:['#f06090','#b81850','#f8a0c0'],buisson:['#388E3C','#1B5E20','#60B060'],
  lierre:['#43A047','#2E7D32','#72C870'],tournesol:['#FDD835','#b88010','#FFF080'],
  arbre_d:['#2E7D32','#1B5E20','#40A040'],champignon_d:['#D32F2F','#8B1010','#E07070'],
  pierre_deco:['#9E9E9E','#616161','#C0C0C0'],rose:['#E91E63','#880E4F','#F080A8'],
  sapin:['#1B5E20','#0a3010','#2E7D32'],cactus:['#43A047','#2E7D32','#60B060'],
  palmier:['#4CAF50','#2E7D32','#80C880'],trefle:['#4CAF50','#2E7D32','#A0D0A0'],
  bambou:['#66BB6A','#388E3C','#A0D0A0'],nenuphare:['#E91E63','#880E4F','#F080A8'],
  cerisier:['#F8A0C0','#C01858','#FCE0F0'],bonsai:['#388E3C','#1B5E20','#4CAF50'],
  lac:['#0288D1','#01579B','#29B6F6'],riviere:['#0277BD','#01579B','#4FC3F7'],
  mare:['#0288D1','#01579B','#29B6F6'],
  boite_lettre:['#F44336','#B71C1C','#EF9090'],pot_fleur:['#FF7043','#BF360C','#FFA880'],
  table:['#A07860','#5a3820','#C09878'],banc:['#8D6E63','#4E342E','#B89888'],
  hamac:['#29B6F6','#0277BD','#A0D8F8'],lampadaire:['#FFD700','#c09000','#FFF0A0'],
  barbecue:['#606060','#202020','#909090'],balancoire:['#a07048','#5a3020','#c89070'],
  parasol:['#FF6B35','#b04010','#FFB080'],toboggan:['#2196F3','#0D47A1','#90C8F8'],
  borne:['#311B92','#180850','#5835B0'],horloge:['#F9A825','#b06010','#FFF0A0'],
  telescope:['#546E7A','#263238','#90A0A8'],fontaine:['#29B6F6','#0277BD','#A0D8F8'],
  statue:['#B0B0B0','#707070','#D8D8D8'],jacuzzi:['#00BCD4','#006064','#80D8E8'],
  chemin:['#A1887F','#6D4C41','#D0C0B8'],cloture_bois:['#9a7050','#5a3820','#c0a078'],
  haie:['#388E3C','#1B5E20','#60B060'],allee:['#C8C8C8','#888888','#E8E8E8'],
  muret:['#B0A898','#706860','#D0C8C0'],mur_pierre:['#808080','#484848','#A8A8A8'],
  barriere:['#78909C','#37474F','#B0B8C0'],escalier:['#BCBCBC','#787878','#E0E0E0'],
  portail:['#8D6E63','#4E342E','#B89080'],arche:['#E91E63','#880E4F','#F080A8'],
  passerelle:['#8D6E63','#4E342E','#C0A080'],pont:['#9a7848','#5a4020','#c0a870']
};

// --- _CAT_COL ---
var _CAT_COL={
  batiment:['#c0b088','#806840','#e0d0a8'],deco:['#4CAF50','#2E7D32','#80C880'],
  mobilier:['#c09840','#806818','#e0c060'],cloture:['#a09070','#686040','#c8b898']
};

// --- _ROOF_COL ---
var _ROOF_COL={
  cabane:'#9B5020',maison:'#c03020',serre:'rgba(160,230,160,0.55)',grange:'#8B1010',
  cafe:'#6a3818',marche:'#d06010',moulin_d:'#5a7080',poste:'#1a4080',
  phare:'#d8d8d8',bibliotheque:'#7a5030',eglise:'#c8c8d0',ecole:'#1a5090',
  hotel:'#7840a0',chateau:'#4a6078'
};

// --- _gBLDS / _gTRS / _gPLS / _gWTS ---
var _gBLDS=['cabane','maison','serre','grange','cafe','marche','moulin_d','poste','phare','bibliotheque','eglise','ecole','hotel','chateau'];
var _gTRS=['arbre_d','cerisier','palmier','bonsai','bambou'];
var _gPLS=['fleur_d','rose','tournesol','nenuphare','trefle','lierre','herbe','buisson','cactus','champignon_d','souche','pierre_deco'];
var _gWTS=['lac','riviere','mare'];

