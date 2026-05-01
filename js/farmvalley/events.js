// === Events: Quizz Party, Marché Fou, Marchés Saisonniers, Roue, Memory Farm, Juste Prix, Combo Click — extracted from farmvalley.html ===

// ===== QUIZZ PARTY EVENT =====
var QUIZ_EVENT_DURATION=6;// lasts 6 months (active)
var QUIZ_EVENT_COOLDOWN=7;// cooldown 7 months (cycle=13)
var QUIZ_QUESTIONS=[
// Vrai/Faux questions (type:'vf')
{q:'La Carotte est la première culture disponible dès le niveau 1.',a:true,type:'vf'},
{q:'Ma femme est la plus belle.',a:true,type:'vf'},
{q:'Le Blé se débloque au niveau 2.',a:false,type:'vf',hint:'Niveau 3'},
{q:'La Fleur dorée est la culture la plus chère du jeu.',a:true,type:'vf'},
{q:'Les arbres nécessitent plus d\'eau que les cultures.',a:true,type:'vf'},
{q:'Le Pommier est le premier arbre disponible au niveau 3.',a:true,type:'vf'},
{q:'L\'Olivier est l\'arbre le plus cher du jeu.',a:true,type:'vf'},
{q:'La Poule est le premier animal disponible au niveau 3.',a:false,type:'vf',hint:'Niveau 5'},
{q:'La Licorne est l\'animal le plus cher du jeu.',a:true,type:'vf'},
{q:'Le Cochon produit de la viande de porc.',a:true,type:'vf'},
{q:'L\'Abeille produit du lait.',a:false,type:'vf',hint:'Du miel'},
{q:'Le Cheval produit du steak.',a:true,type:'vf'},
{q:'L\'amélioration Auto-récolte peut monter jusqu\'au niveau 30.',a:true,type:'vf'},
{q:'L\'amélioration Engrais rapide réduit le temps de 2% par niveau.',a:true,type:'vf'},
{q:'Le Réservoir augmente l\'eau max de 10 par niveau.',a:true,type:'vf'},
{q:'On peut avoir un maximum de 10 fermiers.',a:true,type:'vf'},
{q:'Les fermiers récoltent automatiquement les cultures mûres.',a:true,type:'vf'},
{q:'Un jour dans le jeu dure 5 minutes en temps réel.',a:true,type:'vf'},
{q:'Chaque mois dure 30 jours dans le jeu.',a:true,type:'vf'},
{q:'Le loyer augmente avec le niveau du joueur.',a:true,type:'vf'},
{q:'On peut emprunter de l\'argent dans le jeu via la dette.',a:true,type:'vf'},
{q:'Le Pressoir est le premier atelier disponible au niveau 3.',a:true,type:'vf'},
{q:'La Boulangerie permet de fabriquer du Pain.',a:true,type:'vf'},
{q:'Le Palace étoilé est disponible dès le niveau 25.',a:false,type:'vf',hint:'Niveau 30'},
{q:'Le jardin fait 16×16 cases.',a:true,type:'vf'},
{q:'On peut rénover les bâtiments du jardin.',a:true,type:'vf'},
{q:'Il y a 10 mini-jeux différents dans le jeu.',a:true,type:'vf'},
{q:'Chaque mini-jeu a 100 niveaux.',a:true,type:'vf'},
{q:'Le mini-jeu Snake est disponible dans le jeu.',a:true,type:'vf'},
{q:'Ma femme aime les tomates ?',a:true,type:'vf'},
{q:'Le puits produit de l\'eau automatiquement.',a:true,type:'vf'},
{q:'Le bois peut être coupé dans la section Puits & Bois.',a:true,type:'vf'},
{q:'Le Canard produit des œufs.',a:false,type:'vf',hint:'Des plumes'},
{q:'L\'amélioration Meilleur marché augmente les prix de vente de 15% par niveau.',a:true,type:'vf'},
{q:'Le taux d\'épargne peut monter jusqu\'à 10%.',a:true,type:'vf'},
{q:'La grille de cultures commence avec 12 emplacements.',a:true,type:'vf'},
{q:'Les animaux commencent avec 3 emplacements.',a:true,type:'vf'},
{q:'Les quêtes se régénèrent chaque mois.',a:true,type:'vf'},
{q:'Le système de marchander propose 9 échanges par mois.',a:true,type:'vf'},
{q:'La Fromagerie nécessite le niveau 9.',a:true,type:'vf'},
{q:'Il y a 4 catégories d\'objets de jardin.',a:true,type:'vf'},
{q:'La Fraise se débloque au niveau 5.',a:false,type:'vf',hint:'Niveau 7'},
{q:'Le Melon coûte 110 pièces à planter.',a:true,type:'vf'},
{q:'Le Bananier est disponible au niveau 11.',a:true,type:'vf'},
{q:'L\'Auto-arrosage peut monter jusqu\'au niveau 30.',a:true,type:'vf'},
{q:'La Citrouille se débloque au niveau 20.',a:false,type:'vf',hint:'Niveau 18'},
{q:'Le Paon se débloque au niveau 15.',a:true,type:'vf'},
{q:'Un Gala ultime nécessite du Parfum.',a:true,type:'vf'},
{q:'La Pizza nécessite de la Farine de blé.',a:true,type:'vf'},
{q:'Le Chocolat se fabrique à la Boulangerie.',a:false,type:'vf',hint:'À la Chocolaterie'},
{q:'On peut placer des fontaines dans le jardin.',a:true,type:'vf'},
// Questions à choix (type:'choice')
{q:'Combien de cultures différentes existe-t-il ?',opts:['23','15'],a:0,type:'choice'},
{q:'Combien d\'arbres différents peut-on planter ?',opts:['20','10'],a:0,type:'choice'},
{q:'Combien d\'animaux différents y a-t-il ?',opts:['23','20'],a:0,type:'choice'},
{q:'À quel niveau se débloque le Maïs ?',opts:['Niveau 4','Niveau 3'],a:0,type:'choice'},
{q:'Quel est le coût de la Tomate ?',opts:['8 💰','12 💰'],a:0,type:'choice'},
{q:'Que produit la Chèvre ?',opts:['Lait de chèvre','Fromage'],a:0,type:'choice'},
{q:'Quel atelier fabrique le Beurre ?',opts:['Laiterie','Fromagerie'],a:0,type:'choice'},
{q:'Combien d\'eau faut-il pour arroser une culture ?',opts:['3 💧','5 💧'],a:0,type:'choice'},
{q:'Combien d\'eau faut-il pour un arbre ?',opts:['4 💧','3 💧'],a:0,type:'choice'},
{q:'Combien d\'eau faut-il pour un animal ?',opts:['5 💧','4 💧'],a:0,type:'choice'},
{q:'Quel est le prix de la Poule ?',opts:['800 💰','500 💰'],a:0,type:'choice'},
{q:'Quel est le premier atelier du jeu ?',opts:['Pressoir','Moulin'],a:0,type:'choice'},
{q:'Combien de recettes a la Boulangerie ?',opts:['6','4'],a:0,type:'choice'},
{q:'Quel animal produit du Miel ?',opts:['Abeille','Papillon'],a:0,type:'choice'},
{q:'Quel atelier fabrique le Fromage ?',opts:['Fromagerie','Laiterie'],a:0,type:'choice'},
{q:'Combien coûte le Restaurant ?',opts:['120 000 💰','100 000 💰'],a:0,type:'choice'},
{q:'Le Cocotier se débloque à quel niveau ?',opts:['Niveau 19','Niveau 17'],a:0,type:'choice'},
{q:'Que fabrique-t-on avec des Olives à l\'Huilerie ?',opts:['Huile d\'olive','Vinaigre'],a:0,type:'choice'},
{q:'Combien de fermiers peut-on recruter au maximum ?',opts:['10','8'],a:0,type:'choice'},
{q:'Combien d\'ouvriers peut-on recruter ?',opts:['10','5'],a:0,type:'choice'},
{q:'Quel est le mini-jeu « 💣 » ?',opts:['Démineur','Bomberman'],a:0,type:'choice'},
{q:'La Vigne se débloque à quel niveau ?',opts:['Niveau 17','Niveau 15'],a:0,type:'choice'},
{q:'Le Champignon se débloque à quel niveau ?',opts:['Niveau 14','Niveau 12'],a:0,type:'choice'},
{q:'Quel est le coût du Château dans le jardin ?',opts:['500 000 💰','300 000 💰'],a:0,type:'choice'},
{q:'Combien de catégories de jardin existe-t-il ?',opts:['4','3'],a:0,type:'choice'},
{q:'Le Dinde se débloque à quel niveau ?',opts:['Niveau 13','Niveau 11'],a:0,type:'choice'},
{q:'Quel atelier est de Tier 6 (Endgame) ?',opts:['Palace étoilé','Restaurant'],a:0,type:'choice'},
{q:'La Saucisse se fabrique à quel atelier ?',opts:['Boucherie','Cuisinette'],a:0,type:'choice'},
{q:'Combien de niveaux max a l\'Engrais rapide ?',opts:['200','100'],a:0,type:'choice'},
{q:'Quel est le bonus de Quantité animaux ?',opts:['+1 ressource/niv','×2 ressource/niv'],a:0,type:'choice'},
{q:'Que produit le Lapin ?',opts:['Fourrure','Laine'],a:0,type:'choice'},
{q:'Combien de grilles de cultures peut-on avoir au maximum ?',opts:['34 lignes','15 lignes'],a:0,type:'choice'},
{q:'Le Pêcher coûte combien ?',opts:['1 100 💰','900 💰'],a:0,type:'choice'},
{q:'L\'Alpaga se débloque à quel niveau ?',opts:['Niveau 14','Niveau 12'],a:0,type:'choice'},
{q:'Quel est le prix du Manguier ?',opts:['1 500 💰','2 000 💰'],a:0,type:'choice'},
{q:'Le Cidre se fabrique à quel atelier ?',opts:['Cidrerie','Cave à vin'],a:0,type:'choice'},
{q:'Que nécessite le Vin ?',opts:['Raisin','Cerise'],a:0,type:'choice'},
{q:'Combien de parcelles animaux donne l\'amélioration (par niveau) ?',opts:['+2','+1'],a:0,type:'choice'},
{q:'L\'Huilerie se débloque à quel niveau ?',opts:['Niveau 20','Niveau 18'],a:0,type:'choice'},
{q:'Le Smoothie nécessite quel fruit tropical ?',opts:['Mangue','Ananas'],a:0,type:'choice'},
{q:'Combien d\'étoiles gagne-t-on par bonne réponse au Quizz ?',opts:['1 ⭐','2 ⭐'],a:0,type:'choice'},
{q:'Quel bâtiment de jardin rapporte des œufs ?',opts:['Cabane','Grange'],a:0,type:'choice'},
{q:'Le Perroquet se débloque à quel niveau ?',opts:['Niveau 18','Niveau 16'],a:0,type:'choice'},
{q:'Que donne la Chapelle comme récompense mensuelle ?',opts:['20 000💰 + 1⭐','10 000💰 + 2⭐'],a:0,type:'choice'},
{q:'Combien coûte la Fontaine du jardin ?',opts:['50 000 💰','30 000 💰'],a:0,type:'choice'},
{q:'Quel est le prix du Panda ?',opts:['52 000 💰','45 000 💰'],a:0,type:'choice'},
{q:'L\'Aubergine nécessite quel niveau ?',opts:['Niveau 5','Niveau 4'],a:0,type:'choice'},
{q:'Le Dauphin se débloque au niveau…',opts:['Niveau 19','Niveau 17'],a:0,type:'choice'},
{q:'Que fabrique le Bar à jus ?',opts:['Smoothie','Cidre'],a:0,type:'choice'},
{q:'Quel est le prix de la Salade ?',opts:['12 💰','8 💰'],a:0,type:'choice'},
{q:'Le Poivron se débloque à quel niveau ?',opts:['Niveau 2','Niveau 3'],a:0,type:'choice'},
{q:'Combien coûte le Concombre ?',opts:['25 💰','20 💰'],a:0,type:'choice'},
{q:'Quel est le temps de pousse du Piment ?',opts:['110 secondes','90 secondes'],a:0,type:'choice'},
{q:'Le Brocoli rapporte combien de XP ?',opts:['92','75'],a:0,type:'choice'},
{q:'Quel est le coût du Citronnier ?',opts:['600 💰','450 💰'],a:0,type:'choice'},
{q:'Combien de recettes a la Fromagerie ?',opts:['5','3'],a:0,type:'choice'},
{q:'Quel est le premier animal avec un coût supérieur à 10 000 ?',opts:['Paon','Alpaga'],a:0,type:'choice'},
{q:'La Conserverie se débloque à quel niveau ?',opts:['Niveau 14','Niveau 12'],a:0,type:'choice'},
{q:'Que produit le Mouton ?',opts:['Laine','Lait'],a:0,type:'choice'},
{q:'Combien de recettes a le Restaurant ?',opts:['6','4'],a:0,type:'choice'},
{q:'La Cuisinette se débloque à quel niveau ?',opts:['Niveau 6','Niveau 5'],a:0,type:'choice'},
{q:'Combien coûte le Cygne ?',opts:['13 000 💰','10 000 💰'],a:0,type:'choice'},
{q:'Quel atelier fabrique la Confiture ?',opts:['Conserverie','Sucrerie'],a:0,type:'choice'},
{q:'Le Flamant rose se débloque à quel niveau ?',opts:['Niveau 17','Niveau 16'],a:0,type:'choice'},
{q:'Combien coûte la Chocolaterie ?',opts:['70 000 💰','50 000 💰'],a:0,type:'choice'},
{q:'Le Hibou se débloque à quel niveau ?',opts:['Niveau 18','Niveau 16'],a:0,type:'choice'},
{q:'Quel est le coût de la Tortue ?',opts:['31 000 💰','25 000 💰'],a:0,type:'choice'},
{q:'Combien de recettes a la P\u00e2tisserie ?',opts:['8','5'],a:0,type:'choice'},
{q:'Quel atelier fabrique le Sucre ?',opts:['Sucrerie','Moulin'],a:0,type:'choice'},
{q:'La Miellerie se débloque à quel niveau ?',opts:['Niveau 15','Niveau 13'],a:0,type:'choice'},
{q:'Que nécessite la Pizza comme base ?',opts:['Farine de blé','Farine de maïs'],a:0,type:'choice'},
{q:'Combien coûte la Rôtisserie ?',opts:['90 000 💰','75 000 💰'],a:0,type:'choice'},
{q:'Quel est le prix de vente du Beurre ?',opts:['200 💰','150 💰'],a:0,type:'choice'},
{q:'L\'Ail se débloque à quel niveau ?',opts:['Niveau 16','Niveau 14'],a:0,type:'choice'},
{q:'Combien d\'eau coûte un arrosage d\'arbre ?',opts:['4 💧','3 💧'],a:0,type:'choice'},
{q:'La Pastèque se débloque à quel niveau ?',opts:['Niveau 12','Niveau 10'],a:0,type:'choice'},
{q:'Combien de catégories d\'améliorations existe-t-il ?',opts:['4','3'],a:0,type:'choice'},
{q:'Les Crêpes se fabriquent à quel atelier ?',opts:['Boulangerie','Cuisinette'],a:0,type:'choice'},
{q:'Quel est le coût de la Cave à vin ?',opts:['22 000 💰','18 000 💰'],a:0,type:'choice'},
{q:'Le Banquet du Restaurant rapporte combien d\'XP ?',opts:['2 200','1 500'],a:0,type:'choice'},
{q:'Quel bâtiment de jardin rapporte du Lait ?',opts:['Grange','Cabane'],a:0,type:'choice'},
{q:'Le Jacuzzi du jardin coûte combien ?',opts:['100 000 💰','80 000 💰'],a:0,type:'choice'},
{q:'Combien de bois faut-il pour le Pont du jardin ?',opts:['20','15'],a:0,type:'choice'},
{q:'La Statue du jardin coûte combien ?',opts:['80 000 💰','50 000 💰'],a:0,type:'choice'},
{q:'L\'Atelier luxe se débloque à quel niveau ?',opts:['Niveau 24','Niveau 22'],a:0,type:'choice'},
{q:'Combien de recettes a la Boucherie ?',opts:['6','4'],a:0,type:'choice'},
{q:'Le Vin premium nécessite combien de Raisin ?',opts:['5','3'],a:0,type:'choice'},
{q:'Combien de colonnes a la grille de cultures ?',opts:['6','8'],a:0,type:'choice'},
{q:'L\'amélioration Auto-alimentation concerne quoi ?',opts:['Les animaux','Les cultures'],a:0,type:'choice'},
{q:'Quel est le prix du Flamant ?',opts:['16 000 💰','12 000 💰'],a:0,type:'choice'},
{q:'Le Mag. laine se débloque à quel niveau ?',opts:['Niveau 8','Niveau 7'],a:0,type:'choice'},
{q:'Combien coûte la Pizzeria ?',opts:['28 000 💰','22 000 💰'],a:0,type:'choice'},
{q:'Quel mini-jeu utilise l\'icône 🎵 ?',opts:['Simon','Mémoire'],a:0,type:'choice'},
{q:'Combien coûte la Cabane du jardin ?',opts:['20 000 💰','15 000 💰'],a:0,type:'choice'},
{q:'Le Café du jardin nécessite combien de bois ?',opts:['35','25'],a:0,type:'choice'},
{q:'À combien d\'états de rénovation le Café peut-il monter ?',opts:['15','10'],a:0,type:'choice'},
{q:'Le Dîner royal du Palace nécessite du Parfum.',opts:['Oui','Non'],a:0,type:'choice'},
{q:'Combien coûte le Palace étoilé ?',opts:['250 000 💰','200 000 💰'],a:0,type:'choice'},
{q:'La P.de terre se débloque à quel niveau ?',opts:['Niveau 6','Niveau 5'],a:0,type:'choice'},
{q:'Combien coûte le Potager ?',opts:['2 500 💰','2 000 💰'],a:0,type:'choice'},
{q:'Le Pressoir fabrique quel jus ?',opts:['Jus de pomme','Jus d\'orange'],a:0,type:'choice'},
{q:'La Laiterie se débloque à quel niveau ?',opts:['Niveau 10','Niveau 8'],a:0,type:'choice'},
{q:'Combien de Lait faut-il pour faire du Beurre ?',opts:['2','3'],a:0,type:'choice'},
{q:'Le Moulin fabrique quoi avec du Blé ?',opts:['Farine de blé','Pain'],a:0,type:'choice'},
{q:'Combien de recettes a le Pressoir ?',opts:['5','3'],a:0,type:'choice'},
{q:'Quel est le temps de pousse de la Carotte ?',opts:['3 secondes','5 secondes'],a:0,type:'choice'},
{q:'Le Poirier se débloque à quel niveau ?',opts:['Niveau 5','Niveau 4'],a:0,type:'choice'},
{q:'Que produit le Canard ?',opts:['Plumes','Oeufs'],a:0,type:'choice'},
{q:'Combien coûte la Vache ?',opts:['3 500 💰','2 800 💰'],a:0,type:'choice'},
{q:'Le Cochon nécessite quel aliment ?',opts:['Patate','Blé'],a:0,type:'choice'},
{q:'Combien de recettes a la Conserverie ?',opts:['6','4'],a:0,type:'choice'},
{q:'La Sauce tomate se fabrique où ?',opts:['Cuisinette','Conserverie'],a:0,type:'choice'},
{q:'Quel ingrédient faut-il pour la Fondue ?',opts:['Fromage','Beurre'],a:0,type:'choice'},
{q:'Combien coûte le Moulin ?',opts:['3 000 💰','2 500 💰'],a:0,type:'choice'},
{q:'La Compote se fabrique à quel atelier ?',opts:['Pressoir','Cuisinette'],a:0,type:'choice'},
{q:'Quel est le surnom de ma femme ?',opts:['Bijou','Caillou'],a:1,type:'choice'},
{q:'Le Pop-corn nécessite quel ingrédient principal ?',opts:['Maïs','Blé'],a:0,type:'choice'},
{q:'Combien de Tomates faut-il pour la Sauce tomate ?',opts:['3','2'],a:0,type:'choice'},
{q:'La Pelote se fabrique au Mag. laine avec combien de Laine ?',opts:['2','3'],a:0,type:'choice'},
{q:'L\'Écharpe nécessite combien de Laine ?',opts:['5','3'],a:0,type:'choice'},
{q:'Combien coûte le Mag. laine ?',opts:['4 000 💰','3 000 💰'],a:0,type:'choice'},
{q:'La Purée nécessite quel ingrédient spécial ?',opts:['Beurre','Crème'],a:0,type:'choice'},
{q:'Le Nougat se fabrique à quel atelier ?',opts:['Miellerie','Sucrerie'],a:0,type:'choice'},
{q:'Combien de Miel faut-il pour le Nougat ?',opts:['3','2'],a:0,type:'choice'},
{q:'Le Cocktail nécessite combien d\'ingrédients différents ?',opts:['3','2'],a:0,type:'choice'},
{q:'Quel est le prix de vente du Pain ?',opts:['1 500 💰','1 000 💰'],a:0,type:'choice'},
{q:'Le Gâteau nécessite combien d\'Oeufs ?',opts:['3','2'],a:0,type:'choice'},
{q:'La Tortilla se fabrique avec quelle farine ?',opts:['Farine de maïs','Farine de blé'],a:0,type:'choice'},
{q:'Combien coûte la Boulangerie ?',opts:['8 000 💰','6 000 💰'],a:0,type:'choice'},
{q:'Le Pâté nécessite quel type de viande ?',opts:['Viande de porc','Viande de dinde'],a:0,type:'choice'},
{q:'Combien coûte la Boucherie ?',opts:['10 000 💰','8 000 💰'],a:0,type:'choice'},
{q:'La Gelée se fabrique avec quel jus ?',opts:['Jus de pomme','Jus d\'orange'],a:0,type:'choice'},
{q:'Le Vinaigre nécessite du Raisin et quoi d\'autre ?',opts:['Pomme','Citron'],a:0,type:'choice'},
{q:'Combien coûte la Cidrerie ?',opts:['20 000 💰','15 000 💰'],a:0,type:'choice'},
{q:'La Tapenade nécessite combien d\'Olives ?',opts:['4','3'],a:0,type:'choice'},
{q:'Le Croissant nécessite combien de Beurre ?',opts:['3','2'],a:0,type:'choice'},
{q:'Combien coûte la Sucrerie ?',opts:['7 000 💰','5 000 💰'],a:0,type:'choice'},
{q:'Les Truffes se fabriquent à quel atelier ?',opts:['Chocolaterie','Pâtisserie'],a:0,type:'choice'},
{q:'Le Macaron nécessite combien d\'Oeufs ?',opts:['4','3'],a:0,type:'choice'},
{q:'Combien coûte le Bar à jus ?',opts:['18 000 💰','15 000 💰'],a:0,type:'choice'},
{q:'La Fontaine choco nécessite combien de Chocolat ?',opts:['4','3'],a:0,type:'choice'},
{q:'Le Festin dinde nécessite quel produit transformé ?',opts:['Rôti dinde','Charcuterie'],a:0,type:'choice'},
{q:'Le Menu gastro se fabrique où ?',opts:['Restaurant','Palace étoilé'],a:0,type:'choice'},
{q:'Le Festin royal nécessite combien de Vin ?',opts:['2','3'],a:0,type:'choice'},
{q:'Combien de recettes a le Palace \u00e9toil\u00e9 ?',opts:['5','3'],a:0,type:'choice'},
{q:'Le Buffet palace nécessite du Risotto ?',opts:['Oui','Non'],a:0,type:'choice'},
{q:'L\'Oranger se débloque à quel niveau ?',opts:['Niveau 7','Niveau 6'],a:0,type:'choice'},
{q:'Le Lapin se débloque à quel niveau ?',opts:['Niveau 6','Niveau 5'],a:0,type:'choice'},
{q:'Combien coûte la Chèvre ?',opts:['2 200 💰','1 700 💰'],a:0,type:'choice'},
{q:'Le Chemin du jardin coûte combien ?',opts:['1 000 💰','500 💰'],a:0,type:'choice'},
{q:'Combien de bois faut-il pour la Clôture bois ?',opts:['5','3'],a:0,type:'choice'},
{q:'L\'Arche fleurie du jardin nécessite combien de bois ?',opts:['15','10'],a:0,type:'choice'},
{q:'Le Portail du jardin coûte combien ?',opts:['20 000 💰','15 000 💰'],a:0,type:'choice'},
{q:'Le Bonsaï du jardin coûte combien ?',opts:['24 000 💰','18 000 💰'],a:0,type:'choice'},
{q:'Le Lac du jardin coûte combien ?',opts:['25 000 💰','20 000 💰'],a:0,type:'choice'},
{q:'La Rivière du jardin coûte combien ?',opts:['30 000 💰','20 000 💰'],a:0,type:'choice'},
{q:'Le Télescope du jardin coûte combien ?',opts:['40 000 💰','30 000 💰'],a:0,type:'choice'},
{q:'L\'Hôtel du jardin coûte combien ?',opts:['350 000 💰','250 000 💰'],a:0,type:'choice'},
{q:'L\'École du jardin se rénove en combien d\'états ?',opts:['12','8'],a:0,type:'choice'},
{q:'Le Phare du jardin nécessite combien de bois ?',opts:['50','40'],a:0,type:'choice'},
{q:'La Bibliothèque du jardin coûte combien ?',opts:['180 000 💰','150 000 💰'],a:0,type:'choice'},
{q:'Le Marché du jardin rapporte quoi chaque mois ?',opts:['Ressources animaux','Pièces d\'or'],a:0,type:'choice'},
{q:'Quel animal produit directement des pièces d\'or ?',opts:['Cheval','Vache'],a:0,type:'choice'},
{q:'La Poule nécessite quel aliment ?',opts:['Maïs','Blé'],a:0,type:'choice'},
{q:'L\'Abeille nécessite quel aliment ?',opts:['Fleur','Miel'],a:0,type:'choice'},
{q:'Le Dauphin nécessite quel type d\'alimentation ?',opts:['Pièces d\'or','Poisson'],a:0,type:'choice'},
{q:'Combien coûte l\'Alpaga ?',opts:['8 500 💰','6 800 💰'],a:0,type:'choice'},
{q:'Le Perroquet coûte combien ?',opts:['20 000 💰','16 000 💰'],a:0,type:'choice'},
{q:'La Licorne coûte combien ?',opts:['70 000 💰','52 000 💰'],a:0,type:'choice'},
{q:'Le temps de production du Panda est de combien de secondes ?',opts:['530','470'],a:0,type:'choice'},
{q:'Le Canard coûte combien ?',opts:['1 000 💰','800 💰'],a:0,type:'choice'},
{q:'L\'amélioration Parcelles animaux coûte combien au niveau 1 ?',opts:['500 💰','300 💰'],a:0,type:'choice'},
{q:'L\'amélioration Réservoir augmente de combien l\'eau max ?',opts:['+10 par niveau','+20 par niveau'],a:0,type:'choice'},
{q:'Quel est le max de l\'amélioration Réservoir ?',opts:['9 990 niveaux','5 000 niveaux'],a:0,type:'choice'},
{q:'Le Cactus du jardin coûte combien ?',opts:['8 000 💰','6 000 💰'],a:0,type:'choice'},
{q:'Le Palmier du jardin coûte combien ?',opts:['10 000 💰','8 000 💰'],a:0,type:'choice'},
{q:'Le Sapin du jardin coûte combien ?',opts:['8 000 💰','6 000 💰'],a:0,type:'choice'},
{q:'La Borne arcade du jardin coûte combien ?',opts:['30 000 💰','20 000 💰'],a:0,type:'choice'},
{q:'L\'Horloge du jardin coûte combien ?',opts:['35 000 💰','25 000 💰'],a:0,type:'choice'},
{q:'Le Hamac du jardin coûte combien ?',opts:['12 000 💰','8 000 💰'],a:0,type:'choice'},
{q:'Quel est le mini-jeu 🧩 ?',opts:['Taquin','Puzzle'],a:0,type:'choice'},
{q:'Quel est le mini-jeu 🎨 ?',opts:['Flood','Peinture'],a:0,type:'choice'},
{q:'Quel est le mini-jeu 🔦 ?',opts:['Lights Out','Lampe'],a:0,type:'choice'},
{q:'Quel est le mini-jeu 🧠 ?',opts:['Mémoire','Réflexion'],a:0,type:'choice'},
{q:'Quel est le mini-jeu 🏁 ?',opts:['Labyrinthe','Course'],a:0,type:'choice'},
{q:'Quel est le mini-jeu 🔢 ?',opts:['2048','Sudoku'],a:0,type:'choice'},
{q:'Quel est le mini-jeu 🎯 ?',opts:['Pattern','Cible'],a:0,type:'choice'},
{q:'Quel est le mini-jeu 🐍 ?',opts:['Snake','Serpent'],a:0,type:'choice'},
{q:'Le Smoothie pêche se fabrique où ?',opts:['Cidrerie','Bar à jus'],a:0,type:'choice'},
{q:'Le Jus citron se fabrique où ?',opts:['Conserverie','Bar à jus'],a:0,type:'choice'},
{q:'La Marmelade nécessite quel fruit ?',opts:['Orange','Citron'],a:0,type:'choice'},
{q:'Le Calzone nécessite de la Charcuterie ?',opts:['Oui','Non'],a:0,type:'choice'},
{q:'Combien de recettes a la Pizzeria ?',opts:['5','3'],a:0,type:'choice'},
{q:'Le Risotto nécessite du Champignon ?',opts:['Oui','Non'],a:0,type:'choice'},
{q:'L\'Huile d\'olive nécessite combien d\'Olives ?',opts:['3','2'],a:0,type:'choice'},
{q:'Le Lait de coco nécessite combien de Noix de coco ?',opts:['2','3'],a:0,type:'choice'},
{q:'Le Parfum nécessite combien de Fleurs ?',opts:['3','2'],a:0,type:'choice'},
{q:'La Bougie nécessite du Lait de coco ?',opts:['Oui','Non'],a:0,type:'choice'},
{q:'Ma femme aime-t-elle la paella ?',opts:['Oui','Non'],a:0,type:'choice'},
{q:'Le Coussin nécessite de la Fourrure et quoi d\'autre ?',opts:['Plumes et Laine','Lait et Oeufs'],a:0,type:'choice'},
{q:'Combien coûte la Maison du jardin ?',opts:['30 000 💰','20 000 💰'],a:0,type:'choice'}
];
// 13 events with offsets 0-12, cycle = 13 months (6 active + 7 cooldown)
// Each month: exactly 6 events active, 7 in cooldown
// Every month 1 event deactivates, 1 reactivates → smooth rotation
var EVENT_CYCLE=13;// 6 active + 7 cooldown
function getEventInfo(offset){
  var cycle=((state.month-1-offset)%EVENT_CYCLE+EVENT_CYCLE)%EVENT_CYCLE;
  if(cycle<QUIZ_EVENT_DURATION){
    return{active:true,remaining:QUIZ_EVENT_DURATION-cycle};
  }else{
    return{active:false,until:EVENT_CYCLE-cycle};
  }
}
// ALL_EVENT_OFFSETS: id→offset mapping built once for rotation logic
var ALL_EVENT_OFFSETS=[
  {id:'quiz',offset:0,emoji:'\ud83e\udde0',name:'Quizz Party'},{id:'marche',offset:1,emoji:'\ud83e\udd2a',name:'March\u00e9 Fou'},{id:'wheel',offset:2,emoji:'\ud83c\udfb0',name:'Roue de la Chance'},
  {id:'memory',offset:3,emoji:'\ud83c\udccf',name:'Memory Farm'},{id:'justeprix',offset:4,emoji:'\ud83d\udcb0',name:'Le Juste Prix'},{id:'combo',offset:5,emoji:'\ud83d\udc46',name:'Combo Click'},
  {id:'mherbes',offset:6,emoji:'\ud83c\udf3f',name:'March\u00e9 Herbes'},{id:'mlait',offset:7,emoji:'\ud83e\udd5b',name:'March\u00e9 Laitier'},{id:'mplumes',offset:8,emoji:'\ud83e\udeb6',name:'March\u00e9 des Plumes'},
  {id:'mexotique',offset:9,emoji:'\ud83c\udf34',name:'March\u00e9 Exotique'},{id:'mfermier',offset:10,emoji:'\ud83d\ude9c',name:'March\u00e9 Fermier'},{id:'mrarete',offset:11,emoji:'\ud83e\udeb5',name:'March\u00e9 Raret\u00e9s'},{id:'msucre',offset:12,emoji:'\ud83c\udf70',name:'March\u00e9 Sucr\u00e9'}
];
function processEventRotation(){
  // Called on month change — reset re-activated events, invalidate inactive markets, notify
  var prevMonth=state.month-1;// month was already incremented
  if(prevMonth<1)return;
  var opened=[];var closed=[];
  for(var ei=0;ei<ALL_EVENT_OFFSETS.length;ei++){
    var ev=ALL_EVENT_OFFSETS[ei];
    var curCycle=((state.month-1-ev.offset)%EVENT_CYCLE+EVENT_CYCLE)%EVENT_CYCLE;
    var prevCycle=((prevMonth-1-ev.offset)%EVENT_CYCLE+EVENT_CYCLE)%EVENT_CYCLE;
    var wasActive=prevCycle<QUIZ_EVENT_DURATION;
    var isActive=curCycle<QUIZ_EVENT_DURATION;
    if(!wasActive&&isActive){
      opened.push(ev);
      // Reset event state on re-activation
      if(ev.id==='quiz'){state.quizAnswered=[];state.quizStars=0;_quizCurrent=-1;}
      else if(ev.id==='marche'){state.marcheOffers=[];state.marcheExpiry=0;state.marcheScore=0;delete state._marcheStarGiven;}
      else if(ev.id==='justeprix'){state.justePrixAnswered=[];state.justePrixScore=0;}
      else if(ev.id==='wheel'){state.wheelSpins=0;}
      else if(ev.id==='memory'){state.memoryPlays=0;}
      else if(ev.id==='combo'){state.comboClickPlays=0;}
      else if(state.themedMarkets&&state.themedMarkets[ev.id]){delete state.themedMarkets[ev.id];}
    }
    if(wasActive&&!isActive){
      closed.push(ev);
      // Invalidate market offers for now-inactive markets
      if(ev.id==='marche'){state.marcheOffers=[];state.marcheExpiry=0;}
      else if(state.themedMarkets&&state.themedMarkets[ev.id]){delete state.themedMarkets[ev.id];}
    }
  }
  // Notifications
  var yOff=110;
  for(var oi=0;oi<opened.length;oi++){
    showFloat(innerWidth/2,yOff,opened[oi].emoji+' '+opened[oi].name+' est de retour !');yOff+=30;
  }
  for(var ci=0;ci<closed.length;ci++){
    showFloat(innerWidth/2,yOff,'\ud83d\udca4 '+closed[ci].name+' entre en pause');yOff+=30;
  }
}
var _quizCurrent=-1;
var _activeEvent=null;// null=card list, 'quiz','marche','wheel','memory','justeprix','combo'

// ===== JUSTE PRIX QUESTIONS (generated from game data) =====
var JUSTE_PRIX_QUESTIONS=[];
(function(){
  var sk=Object.keys(RES_SELL);
  for(var i=0;i<sk.length;i++){
    var k=sk[i],ri=RES_INFO[k];if(!ri)continue;
    var p=RES_SELL[k];
    var w1=Math.max(1,Math.round(p*(0.4+(i%5)*0.1)));
    var w2=Math.round(p*(1.6+(i%4)*0.4));
    if(w1===p)w1=Math.max(1,p-5);if(w2===p)w2=p+10;
    JUSTE_PRIX_QUESTIONS.push({q:'Combien se vend '+ri.emoji+' '+ri.name+' ?',opts:[p+' 💰',w1+' 💰',w2+' 💰'],a:0});
  }
  for(var c=0;c<CROPS.length;c++){
    var cr=CROPS[c],cost=cr[CO];
    var cw1=Math.max(1,Math.round(cost*(0.5+(c%3)*0.1)));
    var cw2=Math.round(cost*(1.8+(c%4)*0.3));
    if(cw1===cost)cw1=Math.max(1,cost-2);if(cw2===cost)cw2=cost+5;
    JUSTE_PRIX_QUESTIONS.push({q:'Combien coûte '+cr[E]+' '+cr[N]+' à planter ?',opts:[cost+' 💰',cw1+' 💰',cw2+' 💰'],a:0});
  }
  for(var t=0;t<TREES.length;t++){
    var tr=TREES[t],tcost=tr[CO];
    var tw1=Math.max(10,Math.round(tcost*(0.4+(t%3)*0.15)));
    var tw2=Math.round(tcost*(1.5+(t%4)*0.5));
    if(tw1===tcost)tw1=tcost-20;if(tw2===tcost)tw2=tcost+50;
    JUSTE_PRIX_QUESTIONS.push({q:'Combien coûte '+tr[E]+' '+tr[N]+' à planter ?',opts:[tcost+' 💰',tw1+' 💰',tw2+' 💰'],a:0});
  }
  for(var a=0;a<ANIMALS.length;a++){
    var an=ANIMALS[a],acost=an[CO];
    var aw1=Math.max(100,Math.round(acost*(0.3+(a%5)*0.1)));
    var aw2=Math.round(acost*(1.4+(a%3)*0.5));
    if(aw1===acost)aw1=acost-50;if(aw2===acost)aw2=acost+100;
    JUSTE_PRIX_QUESTIONS.push({q:'Combien coûte '+an[E]+' '+an[N]+' ?',opts:[acost+' 💰',aw1+' 💰',aw2+' 💰'],a:0});
  }
  // Comparison questions
  for(var ci=0;ci<sk.length-1;ci+=3){
    var kA=sk[ci],kB=sk[Math.min(ci+2,sk.length-1)];
    var rA=RES_INFO[kA],rB=RES_INFO[kB];if(!rA||!rB||kA===kB)continue;
    var pA=RES_SELL[kA],pB=RES_SELL[kB];
    var winner=pA>=pB?rA.emoji+' '+rA.name:rB.emoji+' '+rB.name;
    var loser=pA>=pB?rB.emoji+' '+rB.name:rA.emoji+' '+rA.name;
    JUSTE_PRIX_QUESTIONS.push({q:'Quel produit se vend le plus cher ?',opts:[winner,loser],a:0});
  }
})();

// ===== EVENT CARD SYSTEM =====
function buildEvent(){
  var c=$('event-content');if(!c)return;c.innerHTML='';
  if(_activeEvent){
    buildEventBack(c);
    if(_activeEvent==='quiz')buildQuizPlay(c);
    else if(_activeEvent==='marche')buildMarchePlay(c);
    else if(_activeEvent==='wheel')buildWheelPlay(c);
    else if(_activeEvent==='memory')buildMemoryPlay(c);
    else if(_activeEvent==='justeprix')buildJustePrixPlay(c);
    else if(_activeEvent==='combo')buildComboPlay(c);
    else{for(var tmi=0;tmi<THEMED_MARKETS.length;tmi++){if(_activeEvent===THEMED_MARKETS[tmi].id){buildThemedMarketPlay(THEMED_MARKETS[tmi],c);break;}}}
    return;
  }
  var evts=[
    {id:'quiz',emoji:'🧠',name:'Quizz Party',rules:'Réponds à des questions sur Farm Valley pour gagner des ⭐',color:'#9b59b6',offset:0},
    {id:'marche',emoji:'🤪',name:'Marché Fou',rules:'Un marchand propose des offres absurdes ! Accepte ou refuse avant qu\'elles expirent.',color:'#e67e22',offset:1},
    {id:'wheel',emoji:'🎰',name:'Roue de la Chance',rules:'Tourne la roue pour gagner des ressources, des ⭐ ou de l\'eau !',color:'#e74c3c',offset:2},
    {id:'memory',emoji:'🃏',name:'Memory Farm',rules:'Retourne les cartes et trouve les paires d\'émojis ferme !',color:'#2ecc71',offset:3},
    {id:'justeprix',emoji:'💰',name:'Le Juste Prix',rules:'Connais-tu les prix du marché ? Trouve le bon prix de vente !',color:'#3498db',offset:4},
    {id:'combo',emoji:'👆',name:'Combo Click',rules:'Clique le plus vite possible en 10 secondes !',color:'#e91e63',offset:5}
  ];
  for(var tmi=0;tmi<THEMED_MARKETS.length;tmi++){var tm=THEMED_MARKETS[tmi];evts.push({id:tm.id,emoji:tm.emoji,name:tm.name,rules:tm.rules,color:tm.color,offset:tm.offset});}
  // Sort: active first (by remaining desc), then inactive (by until asc)
  var evtsSorted=[];for(var si=0;si<evts.length;si++){var sinfo=getEventInfo(evts[si].offset);evtsSorted.push({ev:evts[si],info:sinfo});}
  evtsSorted.sort(function(a,b){if(a.info.active&&!b.info.active)return -1;if(!a.info.active&&b.info.active)return 1;if(a.info.active&&b.info.active)return(b.info.remaining||0)-(a.info.remaining||0);return(a.info.until||0)-(b.info.until||0);});
  // Count active + total stars
  var activeCount=0;var totalStars=state.stars||0;
  for(var ei=0;ei<evtsSorted.length;ei++){if(evtsSorted[ei].info.active)activeCount++;}
  var statusDiv=document.createElement('div');
  statusDiv.style.cssText='text-align:center;padding:8px 12px 14px;font-size:.82rem;color:#5d4037;font-weight:bold';
  statusDiv.innerHTML='\ud83d\udcc5 Mois '+state.month+' \u2014 <span style="color:#27ae60">'+activeCount+' \u00e9v\u00e9nement'+(activeCount>1?'s':'')+' actif'+(activeCount>1?'s':'')+'</span> \u2014 \u2b50 '+totalStars+' \u00e9toile'+(totalStars>1?'s':'')+' gagn\u00e9e'+(totalStars>1?'s':'');
  c.appendChild(statusDiv);
  for(var i=0;i<evtsSorted.length;i++){
    (function(ev,info){
      var card=document.createElement('div');
      card.style.cssText='background:rgba(255,255,255,.95);border-radius:14px;padding:14px;margin:0 8px 12px;box-shadow:0 4px 16px rgba(0,0,0,.1);border-left:4px solid '+(info.active?ev.color:'#ccc');
      if(!info.active)card.style.opacity='.55';
      var hdr=document.createElement('div');
      hdr.style.cssText='display:flex;align-items:center;gap:10px;margin-bottom:6px';
      var statusTag;
      if(info.active){statusTag='<span style="font-size:.6rem;background:#27ae60;color:#fff;padding:1px 6px;border-radius:4px;margin-left:6px">EN COURS</span>';}
      else if(info.until===1){statusTag='<span style="font-size:.6rem;background:#999;color:#fff;padding:1px 6px;border-radius:4px;margin-left:6px">PAUSE</span><span style="font-size:.6rem;background:#e67e22;color:#fff;padding:1px 6px;border-radius:4px;margin-left:4px">\ud83d\udd1c BIENT\u00d4T</span>';}
      else{statusTag='<span style="font-size:.6rem;background:#999;color:#fff;padding:1px 6px;border-radius:4px;margin-left:6px">PAUSE</span>';}
      hdr.innerHTML='<span style="font-size:1.8rem">'+ev.emoji+'</span><div style="flex:1"><div style="font-size:1rem;font-weight:bold;color:#5d4037">'+ev.name+statusTag+'</div><div style="font-size:.72rem;color:#888;line-height:1.4;margin-top:2px">'+ev.rules+'</div></div>';
      card.appendChild(hdr);
      if(info.active){
        var timeInfo=document.createElement('div');
        timeInfo.style.cssText='font-size:.68rem;color:#27ae60;text-align:right;margin-bottom:4px';
        timeInfo.textContent=info.remaining+' mois restant'+(info.remaining>1?'s':'');
        card.appendChild(timeInfo);
        var btn=document.createElement('button');
        btn.style.cssText='display:block;width:100%;padding:10px;background:linear-gradient(145deg,'+ev.color+','+ev.color+'cc);color:#fff;border:none;border-radius:10px;font-size:.88rem;font-weight:bold;cursor:pointer';
        btn.textContent='\u25b6 Jouer';
        btn.addEventListener('click',function(){_activeEvent=ev.id;buildEvent();});
        card.appendChild(btn);
      }else{
        var off=document.createElement('div');
        off.style.cssText='text-align:center;padding:6px;font-size:.75rem;color:'+(info.until===1?'#e67e22':'#aaa')+';font-style:italic';
        off.textContent='\ud83d\udd70 Revient dans '+info.until+' mois';
        card.appendChild(off);
      }
      c.appendChild(card);
    })(evtsSorted[i].ev,evtsSorted[i].info);
  }
}
function buildEventBack(c){
  var btn=document.createElement('button');
  btn.style.cssText='display:inline-flex;align-items:center;gap:4px;padding:8px 14px;margin:8px;background:rgba(0,0,0,.06);border:none;border-radius:8px;font-size:.82rem;color:#5d4037;cursor:pointer;font-weight:bold';
  btn.textContent='← Retour';
  btn.addEventListener('click',function(){_activeEvent=null;_quizCurrent=-1;buildEvent();});
  c.appendChild(btn);
}

// ===== QUIZZ PARTY =====
function buildQuizPlay(c){
  var info=getEventInfo(0);
  if(!info.active){_activeEvent=null;buildEvent();return;}
  var hdr=document.createElement('div');
  hdr.style.cssText='text-align:center;padding:8px';
  hdr.innerHTML='<div style="font-size:2rem">🧠</div><div style="font-size:1rem;font-weight:bold;color:#5d4037">Quizz Party</div>';
  c.appendChild(hdr);
  var answered=(state.quizAnswered||[]).length;
  var stars=state.quizStars||0;
  var statsDiv=document.createElement('div');
  statsDiv.style.cssText='display:flex;justify-content:center;gap:16px;padding:6px;font-size:.82rem';
  statsDiv.innerHTML='<span>📊 <b>'+answered+'</b>/'+QUIZ_QUESTIONS.length+'</span><span>⭐ <b>'+stars+'</b></span>';
  c.appendChild(statsDiv);
  if(answered>=QUIZ_QUESTIONS.length){
    var done=document.createElement('div');
    done.style.cssText='text-align:center;padding:20px;font-size:1rem;color:#e67e22;font-weight:bold';
    done.innerHTML='🏆 Bravo ! Toutes les '+QUIZ_QUESTIONS.length+' questions répondues !<br><span style="font-size:.8rem;color:#666;font-weight:normal">Score : '+stars+' ⭐</span>';
    c.appendChild(done);
    var resetBtn=document.createElement('button');
    resetBtn.style.cssText='display:block;margin:12px auto;padding:12px 28px;background:linear-gradient(145deg,#e67e22,#d35400);color:#fff;border:none;border-radius:10px;font-size:.9rem;font-weight:bold;cursor:pointer';
    resetBtn.textContent='🔄 Recommencer';
    resetBtn.addEventListener('click',function(){state.quizAnswered=[];_quizCurrent=-1;saveGame();buildEvent();});
    c.appendChild(resetBtn);
    return;
  }
  if(_quizCurrent<0){
    var playBtn=document.createElement('button');
    playBtn.style.cssText='display:block;margin:16px auto;padding:14px 36px;background:linear-gradient(145deg,#9b59b6,#8e44ad);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:bold;cursor:pointer;box-shadow:0 4px 12px rgba(155,89,182,.3)';
    playBtn.textContent='🎯 Question suivante';
    playBtn.addEventListener('click',function(){
      var avail=[];
      for(var i=0;i<QUIZ_QUESTIONS.length;i++){if((state.quizAnswered||[]).indexOf(i)<0)avail.push(i);}
      if(avail.length===0)return;
      shuffle(avail);_quizCurrent=avail[0];buildEvent();
    });
    c.appendChild(playBtn);
  }else{
    renderQuizQuestion(c,_quizCurrent);
  }
}
function renderQuizQuestion(container,qIdx){
  var qq=QUIZ_QUESTIONS[qIdx];
  var card=document.createElement('div');
  card.style.cssText='background:rgba(255,255,255,.95);border-radius:14px;padding:16px;margin:8px;box-shadow:0 4px 16px rgba(0,0,0,.12)';
  var num=document.createElement('div');
  num.style.cssText='text-align:center;font-size:.7rem;color:#999;margin-bottom:6px';
  num.textContent='Question #'+((state.quizAnswered||[]).length+1)+' / '+QUIZ_QUESTIONS.length;
  card.appendChild(num);
  var qtxt=document.createElement('div');
  qtxt.style.cssText='text-align:center;font-size:.92rem;font-weight:bold;color:#333;padding:12px 8px;line-height:1.5';
  qtxt.textContent=qq.q;
  card.appendChild(qtxt);
  var ansDiv=document.createElement('div');
  ansDiv.style.cssText='display:flex;flex-direction:column;gap:8px;padding:8px 0';
  if(qq.type==='vf'){
    ansDiv.appendChild(createQuizBtn('✅ Vrai',true===qq.a,qIdx,ansDiv));
    ansDiv.appendChild(createQuizBtn('❌ Faux',false===qq.a,qIdx,ansDiv));
  }else{
    var order=[0,1];if(Math.random()>0.5)order=[1,0];
    for(var oi=0;oi<order.length;oi++){
      ansDiv.appendChild(createQuizBtn(qq.opts[order[oi]],order[oi]===qq.a,qIdx,ansDiv));
    }
  }
  card.appendChild(ansDiv);container.appendChild(card);
}
function createQuizBtn(label,isCorrect,qIdx,ansDiv){
  var btn=document.createElement('button');
  btn.style.cssText='padding:12px 16px;border:2px solid rgba(0,0,0,.1);border-radius:10px;background:rgba(255,255,255,.9);font-size:.88rem;font-weight:bold;cursor:pointer;transition:all .2s;text-align:center';
  btn.textContent=label;
  btn.addEventListener('click',function(){
    var btns=ansDiv.querySelectorAll('button');
    for(var i=0;i<btns.length;i++){btns[i].disabled=true;btns[i].style.cursor='default';btns[i].style.opacity='.7';}
    if(isCorrect){
      btn.style.background='#c8e6c9';btn.style.borderColor='#4CAF50';btn.style.opacity='1';
      state.quizStars=(state.quizStars||0)+1;state.stars=(state.stars||0)+1;
      showFloat(innerWidth/2,100,'⭐ +1');
    }else{
      btn.style.background='#ffcdd2';btn.style.borderColor='#e74c3c';btn.style.opacity='1';
      for(var j=0;j<btns.length;j++){if(btns[j]!==btn){btns[j].style.background='#c8e6c9';btns[j].style.borderColor='#4CAF50';btns[j].style.opacity='1';}}
    }
    if(!state.quizAnswered)state.quizAnswered=[];
    state.quizAnswered.push(qIdx);_quizCurrent=-1;saveGame();updateUI();
    setTimeout(function(){buildEvent();},1200);
  });
  return btn;
}

// ===== MARCHÉ FOU =====
function generateMarcheOffers(){
  var allKeys=BRUT_KEYS.concat(TRANSFO_KEYS);
  shuffle(allKeys);
  var count=3+Math.floor(Math.random()*3);// 3-5 offers
  var offers=[];
  for(var i=0;i<count&&i<allKeys.length-1;i++){
    var giveKey=allKeys[i],receiveKey=allKeys[(i+count)%allKeys.length];
    if(giveKey===receiveKey)continue;
    var giveRI=RES_INFO[giveKey],recRI=RES_INFO[receiveKey];
    if(!giveRI||!recRI)continue;
    // Absurd ratios: sometimes amazing deal, sometimes terrible
    var isGood=Math.random()>0.5;
    var giveQty,recQty;
    if(isGood){
      giveQty=1+Math.floor(Math.random()*3);
      recQty=10+Math.floor(Math.random()*40);
    }else{
      giveQty=10+Math.floor(Math.random()*30);
      recQty=1+Math.floor(Math.random()*3);
    }
    offers.push({giveKey:giveKey,giveQty:giveQty,receiveKey:receiveKey,receiveQty:recQty,accepted:false});
  }
  state.marcheOffers=offers;
  state.marcheExpiry=Date.now()+3*DAY_MS;
  saveGame();
}
function buildMarchePlay(c){
  var info=getEventInfo(1);
  if(!info.active){_activeEvent=null;buildEvent();return;}
  var hdr=document.createElement('div');
  hdr.style.cssText='text-align:center;padding:8px';
  hdr.innerHTML='<div style="font-size:2rem">🤪</div><div style="font-size:1rem;font-weight:bold;color:#5d4037">Marché Fou</div><div style="font-size:.72rem;color:#888;margin-top:2px">Score total : <b>'+(state.marcheScore||0)+' échanges</b></div>';
  c.appendChild(hdr);
  // Check if offers expired or empty
  var offers=state.marcheOffers||[];
  var expired=state.marcheExpiry&&Date.now()>state.marcheExpiry;
  var allDone=offers.length>0&&offers.every(function(o){return o.accepted;});
  if(offers.length===0||expired||allDone){
    var msg=document.createElement('div');
    msg.style.cssText='text-align:center;padding:16px;font-size:.85rem;color:#888';
    msg.textContent=expired?'⏰ Les offres ont expiré !':allDone?'✅ Toutes les offres acceptées !':'Aucune offre en cours.';
    c.appendChild(msg);
    if(allDone){
      var reward=document.createElement('div');
      reward.style.cssText='text-align:center;padding:10px;font-size:1rem;color:#e67e22;font-weight:bold';
      reward.innerHTML='🏆 Bonus : +1 ⭐';
      c.appendChild(reward);
      if(!state._marcheStarGiven){
        state.stars=(state.stars||0)+1;
        state._marcheStarGiven=true;
        saveGame();updateUI();
        showFloat(innerWidth/2,100,'⭐ +1');
      }
    }
    var genBtn=document.createElement('button');
    genBtn.style.cssText='display:block;margin:12px auto;padding:12px 28px;background:linear-gradient(145deg,#e67e22,#d35400);color:#fff;border:none;border-radius:10px;font-size:.9rem;font-weight:bold;cursor:pointer';
    genBtn.textContent='🔄 Nouvelles offres';
    genBtn.addEventListener('click',function(){state._marcheStarGiven=false;generateMarcheOffers();buildEvent();});
    c.appendChild(genBtn);
    return;
  }
  // Timer
  var remaining=Math.max(0,state.marcheExpiry-Date.now());
  var mins=Math.floor(remaining/60000);var secs=Math.floor((remaining%60000)/1000);
  var timer=document.createElement('div');
  timer.style.cssText='text-align:center;padding:6px;font-size:.78rem;color:#e74c3c;font-weight:bold';
  timer.textContent='⏱️ Expire dans '+mins+'m '+secs+'s';
  c.appendChild(timer);
  // Offers
  for(var i=0;i<offers.length;i++){
    (function(idx){
      var o=offers[idx];
      var gRI=RES_INFO[o.giveKey],rRI=RES_INFO[o.receiveKey];
      if(!gRI||!rRI)return;
      var have=(state.resources[o.giveKey]||0);
      var canAfford=have>=o.giveQty;
      var row=document.createElement('div');
      row.style.cssText='background:rgba(255,255,255,.9);border-radius:10px;padding:12px;margin:8px;display:flex;align-items:center;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,.08)';
      if(o.accepted){row.style.opacity='.5';row.style.background='rgba(200,230,200,.9)';}
      else if(!canAfford){row.style.opacity='.6';}
      var txt=document.createElement('div');
      txt.style.cssText='flex:1;font-size:.82rem;line-height:1.5';
      var haveColor=canAfford?'#27ae60':'#e74c3c';
      txt.innerHTML='Donne <b>'+o.giveQty+' '+gRI.emoji+' '+gRI.name+'</b> <span style="font-size:.7rem;color:'+haveColor+'">('+have+')</span><br>Reçois <b>'+o.receiveQty+' '+rRI.emoji+' '+rRI.name+'</b>';
      row.appendChild(txt);
      if(!o.accepted){
        var accBtn=document.createElement('button');
        if(canAfford){
          accBtn.style.cssText='padding:8px 14px;background:#27ae60;color:#fff;border:none;border-radius:8px;font-size:.78rem;font-weight:bold;cursor:pointer';
          accBtn.textContent='✅ Échanger';
        }else{
          accBtn.style.cssText='padding:8px 14px;background:#ccc;color:#888;border:none;border-radius:8px;font-size:.78rem;font-weight:bold;cursor:default';
          accBtn.textContent='❌ Manque';
          accBtn.disabled=true;
        }
        accBtn.addEventListener('click',function(){
          var h=(state.resources[o.giveKey]||0);
          if(h<o.giveQty){showFloat(innerWidth/2,100,'❌ Pas assez !');return;}
          state.resources[o.giveKey]-=o.giveQty;
          state.resources[o.receiveKey]=(state.resources[o.receiveKey]||0)+o.receiveQty;
          o.accepted=true;state.marcheScore=(state.marcheScore||0)+1;
          saveGame();updateUI();buildEvent();
          showFloat(innerWidth/2,100,'+'+o.receiveQty+' '+rRI.emoji);
        });
        row.appendChild(accBtn);
      }else{
        var done=document.createElement('span');
        done.style.cssText='font-size:.8rem;color:#27ae60;font-weight:bold';
        done.textContent='✅ Fait';
        row.appendChild(done);
      }
      c.appendChild(row);
    })(i);
  }
}

// ===== MARCHÉS SAISONNIERS =====
var THEMED_MARKETS=[
  {id:'mherbes',name:'March\u00e9 Herbes',emoji:'\ud83c\udf3f',color:'#27ae60',offset:6,
   rules:'\u00c9changes sp\u00e9ciaux herbes et produits cosm\u00e9tiques/herboristerie !',
   pool:['basilic','persil','thym','camomille','sauge','origan','menthe','coriandre','lavande','romarin','citronnelle','verveine','melisse',
         'pommade','baume_levres','creme_hydratante','lotion_apaisante','masque_beaute','shampoing','gel_douche','savon','huile_lavande','huile_menthe','parfum_naturel','serum_visage',
         'tisane_relaxante','tisane_digestive','sirop_medicinal','vinaigre_aromatique','pesto_basilic','huile_aromatisee','sel_herbes','sirop_citronnelle',
         'bougie_aromatique','encens','sachet_parfume','spray_maison']},
  {id:'mlait',name:'March\u00e9 Laitier',emoji:'\ud83e\udd5b',color:'#5dade2',offset:7,
   rules:'\u00c9changes sp\u00e9ciaux produits laitiers et fromagers !',
   pool:['lait','oeuf','lait_chevre','beurre','creme','fromage','yaourt','glace','milkshake_abricot','fromage_blanc','fromage_chevre','milkshake_fraise']},
  {id:'mplumes',name:'March\u00e9 des Plumes',emoji:'\ud83e\udeb6',color:'#8e44ad',offset:8,
   rules:'\u00c9changes sp\u00e9ciaux plumes et produits en plumes !',
   pool:['plume','plume_blanche','plume_rose','plume_verte','plume_luxe','plume_irisee','manteau_plumes','coussin','echarpe','chapeau_plume','plumeau_enchante','cape_prestige']},
  {id:'mexotique',name:'March\u00e9 Exotique',emoji:'\ud83c\udf34',color:'#f39c12',offset:9,
   rules:'Fruits exotiques et cocktails tropicaux \u00e0 \u00e9changer !',
   pool:['kiwi','papaye','grenade','avocat','litchi','mangue','banane','noix_coco','abricot','prune','figue','chataigne','noix',
         'jus_kiwi','smoothie_papaye','jus_grenade','guacamole','jus_mangue','smoothie','jus_tropical','punch_exotique','confiture_litchi','confiture_abricot','compote_prune','tapenade_figue','creme_chataigne','pate_amande','lait_coco']},
  {id:'mfermier',name:'March\u00e9 Fermier',emoji:'\ud83d\ude9c',color:'#795548',offset:10,
   rules:'Cultures de base en grande quantit\u00e9 \u00e0 \u00e9changer !',
   pool:['ble','mais','tomate','carotte','oignon','patate','salade','poivron','concombre','aubergine','piment','brocoli','melon','pasteque','ail','radis','epinards','petits_pois','fraise','champignon','citrouille','cerise']},
  {id:'mrarete',name:'March\u00e9 Raret\u00e9s',emoji:'\ud83e\udeb5',color:'#c0392b',offset:11,
   rules:'\u00c9changes de ressources rares et pr\u00e9cieuses !',
   pool:['bois','carapace','corail','corne_magique','ecaille_dragon','cendre_magique','pelisse','bois_cerf','fourrure','poisson','oeuf_geant','steak',
         'collier_corail','huile_tortue','bijou_corail','potion_magique','aquarium_deco']},
  {id:'msucre',name:'March\u00e9 Sucr\u00e9',emoji:'\ud83c\udf70',color:'#e91e63',offset:12,
   rules:'\u00c9changes de douceurs et p\u00e2tisseries !',
   pool:['sucre','miel','chocolat','confiture','caramel','macaron','tarte_fruits','brownie','mousse_choco','chocolat_caramel','truffes','pralines','fontaine_choco',
         'barbe_a_papa','gateau','bonbon_miel','nougat','flan_caramel','tarte_caramel','pain_epices','crepes','confiture_cerise','confiture_melon','confiture_litchi','confiture_abricot','hydromel']}
];
function getThemedMarketState(mkId){
  if(!state.themedMarkets)state.themedMarkets={};
  if(!state.themedMarkets[mkId])state.themedMarkets[mkId]={offers:[],expiry:0,score:0};
  return state.themedMarkets[mkId];
}
function generateThemedOffers(mk){
  var ms=getThemedMarketState(mk.id);
  var pool=mk.pool.slice();shuffle(pool);
  var count=3+Math.floor(Math.random()*3);
  var offers=[];
  for(var i=0;i<count&&i<pool.length-1;i++){
    var giveKey=pool[i],receiveKey=pool[(i+count)%pool.length];
    if(giveKey===receiveKey)continue;
    var giveRI=RES_INFO[giveKey],recRI=RES_INFO[receiveKey];
    if(!giveRI||!recRI)continue;
    var isGood=Math.random()>0.5;
    var giveQty,recQty;
    if(isGood){giveQty=1+Math.floor(Math.random()*3);recQty=10+Math.floor(Math.random()*40);}
    else{giveQty=10+Math.floor(Math.random()*30);recQty=1+Math.floor(Math.random()*3);}
    offers.push({giveKey:giveKey,giveQty:giveQty,receiveKey:receiveKey,receiveQty:recQty,accepted:false});
  }
  ms.offers=offers;ms.expiry=Date.now()+3*DAY_MS;
  saveGame();
}
function buildThemedMarketPlay(mk,c){
  var info=getEventInfo(mk.offset);
  if(!info.active){_activeEvent=null;buildEvent();return;}
  var ms=getThemedMarketState(mk.id);
  var hdr=document.createElement('div');
  hdr.style.cssText='text-align:center;padding:8px';
  hdr.innerHTML='<div style="font-size:2rem">'+mk.emoji+'</div><div style="font-size:1rem;font-weight:bold;color:#5d4037">'+mk.name+'</div><div style="font-size:.72rem;color:#888;margin-top:2px">Score total : <b>'+(ms.score||0)+' \u00e9changes</b></div>';
  c.appendChild(hdr);
  var offers=ms.offers||[];
  var expired=ms.expiry&&Date.now()>ms.expiry;
  var allDone=offers.length>0&&offers.every(function(o){return o.accepted;});
  if(offers.length===0||expired||allDone){
    var msg=document.createElement('div');
    msg.style.cssText='text-align:center;padding:16px;font-size:.85rem;color:#888';
    msg.textContent=expired?'\u23f0 Les offres ont expir\u00e9 !':allDone?'\u2705 Toutes les offres accept\u00e9es !':'Aucune offre en cours.';
    c.appendChild(msg);
    if(allDone){
      var reward=document.createElement('div');
      reward.style.cssText='text-align:center;padding:10px;font-size:1rem;color:'+mk.color+';font-weight:bold';
      reward.innerHTML='\ud83c\udfc6 Bonus : +1 \u2b50';
      c.appendChild(reward);
      if(!ms._starGiven){ms._starGiven=true;state.stars=(state.stars||0)+1;saveGame();updateUI();showFloat(innerWidth/2,100,'\u2b50 +1');}
    }
    var genBtn=document.createElement('button');
    genBtn.style.cssText='display:block;margin:12px auto;padding:12px 28px;background:linear-gradient(145deg,'+mk.color+','+mk.color+'cc);color:#fff;border:none;border-radius:10px;font-size:.9rem;font-weight:bold;cursor:pointer';
    genBtn.textContent='\ud83d\udd04 Nouvelles offres';
    genBtn.addEventListener('click',function(){ms._starGiven=false;generateThemedOffers(mk);buildEvent();});
    c.appendChild(genBtn);return;
  }
  var remaining=Math.max(0,ms.expiry-Date.now());
  var mins=Math.floor(remaining/60000);var secs=Math.floor((remaining%60000)/1000);
  var timer=document.createElement('div');
  timer.style.cssText='text-align:center;padding:6px;font-size:.78rem;color:#e74c3c;font-weight:bold';
  timer.textContent='\u23f1\ufe0f Expire dans '+mins+'m '+secs+'s';
  c.appendChild(timer);
  for(var i=0;i<offers.length;i++){
    (function(idx){
      var o=offers[idx];
      var gRI=RES_INFO[o.giveKey],rRI=RES_INFO[o.receiveKey];
      if(!gRI||!rRI)return;
      var have=(state.resources[o.giveKey]||0);
      var canAfford=have>=o.giveQty;
      var row=document.createElement('div');
      row.style.cssText='background:rgba(255,255,255,.9);border-radius:10px;padding:12px;margin:8px;display:flex;align-items:center;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,.08)';
      if(o.accepted){row.style.opacity='.5';row.style.background='rgba(200,230,200,.9)';}
      else if(!canAfford){row.style.opacity='.6';}
      var txt=document.createElement('div');
      txt.style.cssText='flex:1;font-size:.82rem;line-height:1.5';
      var haveColor=canAfford?'#27ae60':'#e74c3c';
      txt.innerHTML='Donne <b>'+o.giveQty+' '+gRI.emoji+' '+gRI.name+'</b> <span style="font-size:.7rem;color:'+haveColor+'">('+have+')</span><br>Re\u00e7ois <b>'+o.receiveQty+' '+rRI.emoji+' '+rRI.name+'</b>';
      row.appendChild(txt);
      if(!o.accepted){
        var accBtn=document.createElement('button');
        if(canAfford){
          accBtn.style.cssText='padding:8px 14px;background:#27ae60;color:#fff;border:none;border-radius:8px;font-size:.78rem;font-weight:bold;cursor:pointer';
          accBtn.textContent='\u2705 \u00c9changer';
        }else{
          accBtn.style.cssText='padding:8px 14px;background:#ccc;color:#888;border:none;border-radius:8px;font-size:.78rem;font-weight:bold;cursor:default';
          accBtn.textContent='\u274c Manque';
          accBtn.disabled=true;
        }
        accBtn.addEventListener('click',function(){
          var h=(state.resources[o.giveKey]||0);
          if(h<o.giveQty){showFloat(innerWidth/2,100,'\u274c Pas assez !');return;}
          state.resources[o.giveKey]-=o.giveQty;
          state.resources[o.receiveKey]=(state.resources[o.receiveKey]||0)+o.receiveQty;
          o.accepted=true;ms.score=(ms.score||0)+1;
          saveGame();updateUI();buildEvent();
          showFloat(innerWidth/2,100,'+'+o.receiveQty+' '+rRI.emoji);
        });
        row.appendChild(accBtn);
      }else{
        var dn=document.createElement('span');
        dn.style.cssText='font-size:.8rem;color:#27ae60;font-weight:bold';
        dn.textContent='\u2705 Fait';
        row.appendChild(dn);
      }
      c.appendChild(row);
    })(i);
  }
}
// ===== ROUE DE LA CHANCE =====
var _wheelSpinning=false;
function buildWheelPlay(c){
  var info=getEventInfo(2);
  if(!info.active){_activeEvent=null;buildEvent();return;}
  var hdr=document.createElement('div');
  hdr.style.cssText='text-align:center;padding:8px';
  hdr.innerHTML='<div style="font-size:2rem">🎰</div><div style="font-size:1rem;font-weight:bold;color:#5d4037">Roue de la Chance</div><div style="font-size:.72rem;color:#888;margin-top:2px">Tours joués : <b>'+(state.wheelSpins||0)+'</b></div>';
  c.appendChild(hdr);
  // Wheel sectors
  var sectors=[
    {label:'⭐ 1',type:'star',qty:1,color:'#f1c40f'},
    {label:'💧 200',type:'water',qty:200,color:'#3498db'},
    {label:'❌ Rien',type:'nothing',qty:0,color:'#95a5a6'},
    {label:'💰 2000',type:'coins',qty:2000,color:'#e67e22'},
    {label:'🪵 100',type:'wood',qty:100,color:'#8d6e63'},
    {label:'⭐ 10',type:'star',qty:10,color:'#bdc3c7'},
    {label:'⭐ 2',type:'star',qty:2,color:'#f39c12'},
    {label:'🎁 25 Ressources',type:'random',qty:25,color:'#9b59b6'},
    {label:'❌ Rien',type:'nothing',qty:0,color:'#95a5a6'},
    {label:'💰 5000',type:'coins',qty:5000,color:'#e74c3c'},
    {label:'💧 500',type:'water',qty:500,color:'#2980b9'},
    {label:'🎁 10 Ressources',type:'random',qty:10,color:'#8e44ad'}
  ];
  // Canvas wheel
  var canvas=document.createElement('canvas');
  canvas.width=280;canvas.height=280;
  canvas.style.cssText='display:block;margin:10px auto;';
  var ctx=canvas.getContext('2d');
  var cx=140,cy=140,r=130;
  var sliceAngle=2*Math.PI/sectors.length;
  var rotation=0;
  function drawWheel(rot){
    ctx.clearRect(0,0,280,280);
    for(var s=0;s<sectors.length;s++){
      var start=rot+s*sliceAngle;
      ctx.beginPath();ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,start,start+sliceAngle);
      ctx.closePath();ctx.fillStyle=sectors[s].color;ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
      // Label
      ctx.save();ctx.translate(cx,cy);ctx.rotate(start+sliceAngle/2);
      ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';
      ctx.fillText(sectors[s].label,r*0.62,4);
      ctx.restore();
    }
    // Center
    ctx.beginPath();ctx.arc(cx,cy,18,0,2*Math.PI);ctx.fillStyle='#fff';ctx.fill();
    ctx.strokeStyle='#333';ctx.lineWidth=2;ctx.stroke();
    // Arrow
    ctx.beginPath();ctx.moveTo(cx+r+5,cy-8);ctx.lineTo(cx+r+5,cy+8);ctx.lineTo(cx+r-10,cy);ctx.closePath();
    ctx.fillStyle='#e74c3c';ctx.fill();
  }
  drawWheel(0);
  c.appendChild(canvas);
  // Cost to spin
  var costDiv=document.createElement('div');
  costDiv.style.cssText='text-align:center;font-size:.78rem;color:#888;margin:4px 0';
  costDiv.textContent='Coût : 50 💰 par tour';
  c.appendChild(costDiv);
  // Spin button
  var spinBtn=document.createElement('button');
  spinBtn.style.cssText='display:block;margin:10px auto;padding:12px 32px;background:linear-gradient(145deg,#e74c3c,#c0392b);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:bold;cursor:pointer';
  spinBtn.textContent='🎰 Tourner (50 💰)';
  if(_wheelSpinning)spinBtn.disabled=true;
  spinBtn.addEventListener('click',function(){
    if(_wheelSpinning)return;
    if(state.coins<50){showFloat(innerWidth/2,100,'❌ Pas assez de 💰 !');return;}
    state.coins-=50;_wheelSpinning=true;spinBtn.disabled=true;
    state.wheelSpins=(state.wheelSpins||0)+1;
    var target=Math.floor(Math.random()*sectors.length);
    var totalRotation=2*Math.PI*6+target*sliceAngle+Math.random()*sliceAngle*0.8;// 6 full turns + target
    var startTime=Date.now();var duration=3000;
    function animSpin(){
      var elapsed=Date.now()-startTime;
      var t=Math.min(1,elapsed/duration);
      var ease=1-Math.pow(1-t,3);// ease out cubic
      rotation=ease*totalRotation;
      drawWheel(-rotation);
      if(t<1){requestAnimationFrame(animSpin);}
      else{
        // Determine winning sector (sector at right = arrow position)
        var finalAngle=(rotation%(2*Math.PI));
        var winIdx=Math.floor(finalAngle/sliceAngle)%sectors.length;
        var win=sectors[winIdx];
        _wheelSpinning=false;
        // Apply reward
        var rewardText='';
        if(win.type==='star'){state.stars=(state.stars||0)+win.qty;rewardText='+'+win.qty+' ⭐';}
        else if(win.type==='coins'){state.coins+=win.qty;rewardText='+'+win.qty+' 💰';}
        else if(win.type==='water'){state.water=state.water+win.qty;rewardText='+'+win.qty+' 💧';}
        else if(win.type==='wood'){state.resources.bois=(state.resources.bois||0)+win.qty;rewardText='+'+win.qty+' 🪵';}
        else if(win.type==='random'){
          var pool=BRUT_KEYS.concat(CROP_KEYS);
          var rk=pool[Math.floor(Math.random()*pool.length)];
          state.resources[rk]=(state.resources[rk]||0)+win.qty;
          var ri=RES_INFO[rk];
          rewardText=ri?'+'+win.qty+' '+ri.emoji:'+ ressource';
        }
        else{rewardText='❌ Rien !';}
        saveGame();updateUI();
        showFloat(innerWidth/2,100,rewardText);
        setTimeout(function(){buildEvent();},1500);
      }
    }
    animSpin();
  });
  c.appendChild(spinBtn);
}

// ===== MEMORY FARM =====
var _memoryCards=[];var _memoryFlipped=[];var _memoryMatched=[];var _memoryLocked=false;var _memoryMoves=0;
function buildMemoryPlay(c){
  var info=getEventInfo(3);
  if(!info.active){_activeEvent=null;buildEvent();return;}
  var hdr=document.createElement('div');
  hdr.style.cssText='text-align:center;padding:8px';
  hdr.innerHTML='<div style="font-size:2rem">🃏</div><div style="font-size:1rem;font-weight:bold;color:#5d4037">Memory Farm</div><div style="font-size:.72rem;color:#888;margin-top:2px">Parties jouées : <b>'+(state.memoryPlays||0)+'</b> — Meilleur : <b>'+(state.memoryBest||'—')+' coups</b></div>';
  c.appendChild(hdr);
  // Start new game if no cards
  if(_memoryCards.length===0){
    var startBtn=document.createElement('button');
    startBtn.style.cssText='display:block;margin:16px auto;padding:14px 36px;background:linear-gradient(145deg,#2ecc71,#27ae60);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:bold;cursor:pointer';
    startBtn.textContent='🃏 Nouvelle partie';
    startBtn.addEventListener('click',function(){startMemoryGame();buildEvent();});
    c.appendChild(startBtn);
    return;
  }
  // Stats
  var statDiv=document.createElement('div');
  statDiv.style.cssText='text-align:center;padding:4px;font-size:.8rem;color:#666';
  statDiv.textContent='Coups : '+_memoryMoves+' — Paires : '+_memoryMatched.length+'/'+(_memoryCards.length/2);
  c.appendChild(statDiv);
  // Grid 4x4
  var grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:10px;max-width:300px;margin:0 auto';
  for(var i=0;i<_memoryCards.length;i++){
    (function(idx){
      var cardDiv=document.createElement('div');
      var isFlipped=_memoryFlipped.indexOf(idx)>=0;
      var isMatched=_memoryMatched.indexOf(_memoryCards[idx])>=0;
      cardDiv.style.cssText='aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:1.6rem;border-radius:10px;cursor:pointer;transition:all .3s;user-select:none;'
        +(isFlipped||isMatched?'background:#e8f5e9;box-shadow:0 2px 8px rgba(0,0,0,.1);':'background:linear-gradient(145deg,#5d4037,#795548);box-shadow:0 2px 8px rgba(0,0,0,.15);');
      cardDiv.textContent=isFlipped||isMatched?_memoryCards[idx]:'❓';
      if(!isFlipped&&!isMatched){
        cardDiv.addEventListener('click',function(){flipMemoryCard(idx);});
      }
      grid.appendChild(cardDiv);
    })(i);
  }
  c.appendChild(grid);
  // Check win
  if(_memoryMatched.length>=_memoryCards.length/2){
    var winDiv=document.createElement('div');
    winDiv.style.cssText='text-align:center;padding:16px;font-size:1rem;color:#27ae60;font-weight:bold';
    winDiv.innerHTML='🏆 Bravo ! Terminé en '+_memoryMoves+' coups !';
    c.appendChild(winDiv);
    // Reward
    var reward=Math.max(10,50-_memoryMoves*2);
    state.coins+=reward;state.memoryPlays=(state.memoryPlays||0)+1;
    if(state.memoryBest===0||_memoryMoves<state.memoryBest)state.memoryBest=_memoryMoves;
    var starBonus=_memoryMoves<=10?2:_memoryMoves<=14?1:0;
    if(starBonus>0){state.stars=(state.stars||0)+starBonus;}
    _memoryCards=[];_memoryFlipped=[];_memoryMatched=[];_memoryMoves=0;
    saveGame();updateUI();
    showFloat(innerWidth/2,100,'+'+reward+' \ud83d\udcb0'+(starBonus>0?' +'+starBonus+' \u2b50':''));
    var replayBtn=document.createElement('button');
    replayBtn.style.cssText='display:block;margin:12px auto;padding:12px 28px;background:linear-gradient(145deg,#2ecc71,#27ae60);color:#fff;border:none;border-radius:10px;font-size:.9rem;font-weight:bold;cursor:pointer';
    replayBtn.textContent='🔄 Rejouer';
    replayBtn.addEventListener('click',function(){startMemoryGame();buildEvent();});
    c.appendChild(replayBtn);
  }
}
function startMemoryGame(){
  var emojis=['🥕','🍅','🌾','🥚','🍎','🍓','🍋','🍇'];
  _memoryCards=emojis.concat(emojis);// 8 pairs = 16 cards
  shuffle(_memoryCards);
  _memoryFlipped=[];_memoryMatched=[];_memoryMoves=0;_memoryLocked=false;
}
function flipMemoryCard(idx){
  if(_memoryLocked||_memoryFlipped.indexOf(idx)>=0||_memoryMatched.indexOf(_memoryCards[idx])>=0)return;
  _memoryFlipped.push(idx);
  if(_memoryFlipped.length===2){
    _memoryMoves++;_memoryLocked=true;
    var a=_memoryFlipped[0],b=_memoryFlipped[1];
    if(_memoryCards[a]===_memoryCards[b]){
      _memoryMatched.push(_memoryCards[a]);
      _memoryFlipped=[];_memoryLocked=false;
      buildEvent();
    }else{
      buildEvent();
      setTimeout(function(){_memoryFlipped=[];_memoryLocked=false;buildEvent();},800);
    }
  }else{buildEvent();}
}

// ===== LE JUSTE PRIX =====
var _justePrixCurrent=-1;
function buildJustePrixPlay(c){
  var info=getEventInfo(4);
  if(!info.active){_activeEvent=null;buildEvent();return;}
  var hdr=document.createElement('div');
  hdr.style.cssText='text-align:center;padding:8px';
  hdr.innerHTML='<div style="font-size:2rem">💰</div><div style="font-size:1rem;font-weight:bold;color:#5d4037">Le Juste Prix</div>';
  c.appendChild(hdr);
  var answered=(state.justePrixAnswered||[]).length;
  var score=state.justePrixScore||0;
  var statsDiv=document.createElement('div');
  statsDiv.style.cssText='display:flex;justify-content:center;gap:16px;padding:6px;font-size:.82rem';
  statsDiv.innerHTML='<span>📊 <b>'+answered+'</b>/'+JUSTE_PRIX_QUESTIONS.length+'</span><span>✅ <b>'+score+'</b> bonnes</span>';
  c.appendChild(statsDiv);
  if(answered>=JUSTE_PRIX_QUESTIONS.length){
    var done=document.createElement('div');
    done.style.cssText='text-align:center;padding:20px;font-size:1rem;color:#3498db;font-weight:bold';
    done.innerHTML='🏆 Toutes les '+JUSTE_PRIX_QUESTIONS.length+' questions répondues !<br><span style="font-size:.8rem;color:#666;font-weight:normal">Score : '+score+'/'+JUSTE_PRIX_QUESTIONS.length+'</span>';
    c.appendChild(done);
    var resetBtn=document.createElement('button');
    resetBtn.style.cssText='display:block;margin:12px auto;padding:12px 28px;background:linear-gradient(145deg,#3498db,#2980b9);color:#fff;border:none;border-radius:10px;font-size:.9rem;font-weight:bold;cursor:pointer';
    resetBtn.textContent='🔄 Recommencer';
    resetBtn.addEventListener('click',function(){state.justePrixAnswered=[];_justePrixCurrent=-1;saveGame();buildEvent();});
    c.appendChild(resetBtn);
    return;
  }
  if(_justePrixCurrent<0){
    var playBtn=document.createElement('button');
    playBtn.style.cssText='display:block;margin:16px auto;padding:14px 36px;background:linear-gradient(145deg,#3498db,#2980b9);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:bold;cursor:pointer;box-shadow:0 4px 12px rgba(52,152,219,.3)';
    playBtn.textContent='🎯 Question suivante';
    playBtn.addEventListener('click',function(){
      var avail=[];
      for(var i=0;i<JUSTE_PRIX_QUESTIONS.length;i++){if((state.justePrixAnswered||[]).indexOf(i)<0)avail.push(i);}
      if(avail.length===0)return;
      shuffle(avail);_justePrixCurrent=avail[0];buildEvent();
    });
    c.appendChild(playBtn);
  }else{
    renderJustePrixQ(c,_justePrixCurrent);
  }
}
function renderJustePrixQ(container,qIdx){
  var qq=JUSTE_PRIX_QUESTIONS[qIdx];
  var card=document.createElement('div');
  card.style.cssText='background:rgba(255,255,255,.95);border-radius:14px;padding:16px;margin:8px;box-shadow:0 4px 16px rgba(0,0,0,.12)';
  var num=document.createElement('div');
  num.style.cssText='text-align:center;font-size:.7rem;color:#999;margin-bottom:6px';
  num.textContent='Question #'+((state.justePrixAnswered||[]).length+1)+' / '+JUSTE_PRIX_QUESTIONS.length;
  card.appendChild(num);
  var qtxt=document.createElement('div');
  qtxt.style.cssText='text-align:center;font-size:.92rem;font-weight:bold;color:#333;padding:12px 8px;line-height:1.5';
  qtxt.textContent=qq.q;
  card.appendChild(qtxt);
  var ansDiv=document.createElement('div');
  ansDiv.style.cssText='display:flex;flex-direction:column;gap:8px;padding:8px 0';
  // Shuffle options
  var indices=[];for(var i=0;i<qq.opts.length;i++)indices.push(i);
  shuffle(indices);
  for(var oi=0;oi<indices.length;oi++){
    (function(optIdx){
      var isCorrect=optIdx===qq.a;
      var btn=document.createElement('button');
      btn.style.cssText='padding:12px 16px;border:2px solid rgba(0,0,0,.1);border-radius:10px;background:rgba(255,255,255,.9);font-size:.88rem;font-weight:bold;cursor:pointer;transition:all .2s;text-align:center';
      btn.textContent=qq.opts[optIdx];
      btn.addEventListener('click',function(){
        var btns=ansDiv.querySelectorAll('button');
        for(var j=0;j<btns.length;j++){btns[j].disabled=true;btns[j].style.cursor='default';btns[j].style.opacity='.7';}
        if(isCorrect){
          btn.style.background='#c8e6c9';btn.style.borderColor='#4CAF50';btn.style.opacity='1';
          state.justePrixScore=(state.justePrixScore||0)+1;
          state.stars=(state.stars||0)+1;
          state.coins+=20;
          showFloat(innerWidth/2,100,'\u2705 +20 \ud83d\udcb0 +1 \u2b50');
        }else{
          btn.style.background='#ffcdd2';btn.style.borderColor='#e74c3c';btn.style.opacity='1';
          for(var k=0;k<btns.length;k++){
            if(btns[k].textContent===qq.opts[qq.a]){btns[k].style.background='#c8e6c9';btns[k].style.borderColor='#4CAF50';btns[k].style.opacity='1';}
          }
        }
        if(!state.justePrixAnswered)state.justePrixAnswered=[];
        state.justePrixAnswered.push(qIdx);_justePrixCurrent=-1;saveGame();updateUI();
        setTimeout(function(){buildEvent();},1200);
      });
      ansDiv.appendChild(btn);
    })(indices[oi]);
  }
  card.appendChild(ansDiv);container.appendChild(card);
}

// ===== COMBO CLICK =====
var _comboTimer=null;var _comboClicks=0;var _comboTimeLeft=0;var _comboRunning=false;
var _comboTimerEl=null;var _comboCounterEl=null;var _comboInterval=null;
function buildComboPlay(c){
  var info=getEventInfo(5);
  if(!info.active){_activeEvent=null;buildEvent();return;}
  var hdr=document.createElement('div');
  hdr.style.cssText='text-align:center;padding:8px';
  hdr.innerHTML='<div style="font-size:2rem">👆</div><div style="font-size:1rem;font-weight:bold;color:#5d4037">Combo Click</div><div style="font-size:.72rem;color:#888;margin-top:2px">Parties : <b>'+(state.comboClickPlays||0)+'</b> — Record : <b>'+(state.comboClickBest||0)+' clics</b></div>';
  c.appendChild(hdr);
  // Tiers info
  var tiersDiv=document.createElement('div');
  tiersDiv.style.cssText='text-align:center;font-size:.68rem;color:#999;padding:2px 8px;line-height:1.6';
  tiersDiv.innerHTML='🏆 Paliers : 20→50💰 · 50→150💰 · 80→300💰 · 120→500💰 · 180→1000💰 · 250→2000💰 · 300→5000💰';
  c.appendChild(tiersDiv);
  if(_comboRunning){
    var timerDiv=document.createElement('div');
    timerDiv.style.cssText='text-align:center;padding:8px;font-size:1.4rem;font-weight:bold;color:#e74c3c';
    timerDiv.textContent='⏱️ '+(_comboTimeLeft/1000).toFixed(1)+'s';
    c.appendChild(timerDiv);
    _comboTimerEl=timerDiv;
    var counterDiv=document.createElement('div');
    counterDiv.style.cssText='text-align:center;padding:4px;font-size:2rem;font-weight:bold;color:#5d4037';
    counterDiv.textContent=_comboClicks+' 👆';
    c.appendChild(counterDiv);
    _comboCounterEl=counterDiv;
    var clickZone=document.createElement('div');
    clickZone.style.cssText='margin:12px auto;width:200px;height:200px;background:linear-gradient(145deg,#e91e63,#c2185b);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px rgba(233,30,99,.4);user-select:none;transition:transform .05s;-webkit-tap-highlight-color:transparent';
    clickZone.innerHTML='<span style="font-size:3rem;color:#fff;pointer-events:none">👆</span>';
    clickZone.addEventListener('click',function(e){
      e.preventDefault();
      _comboClicks++;
      clickZone.style.transform='scale(0.92)';
      setTimeout(function(){clickZone.style.transform='scale(1)';},50);
      if(_comboCounterEl)_comboCounterEl.textContent=_comboClicks+' 👆';
    });
    clickZone.addEventListener('touchstart',function(e){
      e.preventDefault();
      _comboClicks++;
      clickZone.style.transform='scale(0.92)';
      setTimeout(function(){clickZone.style.transform='scale(1)';},50);
      if(_comboCounterEl)_comboCounterEl.textContent=_comboClicks+' 👆';
    },{passive:false});
    c.appendChild(clickZone);
  }else{
    var startBtn=document.createElement('button');
    startBtn.style.cssText='display:block;margin:20px auto;padding:14px 36px;background:linear-gradient(145deg,#e91e63,#c2185b);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:bold;cursor:pointer;box-shadow:0 4px 12px rgba(233,30,99,.3)';
    startBtn.textContent='🚀 Go ! (10 secondes)';
    startBtn.addEventListener('click',function(){startComboClick();});
    c.appendChild(startBtn);
  }
}
function startComboClick(){
  if(_comboInterval){clearInterval(_comboInterval);_comboInterval=null;}
  _comboClicks=0;_comboTimeLeft=10000;_comboRunning=true;
  buildEvent();
  _comboInterval=setInterval(function(){
    _comboTimeLeft-=100;
    if(_comboTimerEl)_comboTimerEl.textContent='⏱️ '+(_comboTimeLeft/1000).toFixed(1)+'s';
    if(_comboTimeLeft<=0){
      clearInterval(_comboInterval);_comboInterval=null;
      _comboRunning=false;
      state.comboClickPlays=(state.comboClickPlays||0)+1;
      var wasRecord=state.comboClickBest||0;
      if(_comboClicks>state.comboClickBest)state.comboClickBest=_comboClicks;
      var newRecord=_comboClicks>wasRecord&&wasRecord>0;
      var reward=0;
      if(_comboClicks>=300)reward=5000;
      else if(_comboClicks>=250)reward=2000;
      else if(_comboClicks>=180)reward=1000;
      else if(_comboClicks>=120)reward=500;
      else if(_comboClicks>=80)reward=300;
      else if(_comboClicks>=50)reward=150;
      else if(_comboClicks>=20)reward=50;
      else reward=10;
      state.coins+=reward;
      if(newRecord){state.stars=(state.stars||0)+2;showFloat(innerWidth/2,130,'\ud83c\udfc6 Nouveau record ! +2 \u2b50');}
      saveGame();updateUI();
      showFloat(innerWidth/2,100,_comboClicks+' clics \u2192 +'+reward+' \ud83d\udcb0');
      setTimeout(function(){buildEvent();},1500);
    }
  },100);
}

