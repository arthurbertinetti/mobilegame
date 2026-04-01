/* ============================================================
   LEADERBOARD – Système de classement partagé (localStorage)
   ============================================================ */

const Leaderboard = {
    // Récupère le classement d'un jeu (max 10 entrées)
    get(gameId) {
        const raw = localStorage.getItem('lb-' + gameId);
        return raw ? JSON.parse(raw) : [];
    },

    // Ajoute un score et retourne le classement mis à jour
    add(gameId, name, score) {
        const lb = this.get(gameId);
        lb.push({ name: name.substring(0, 20), score, date: Date.now() });
        lb.sort((a, b) => b.score - a.score);
        const trimmed = lb.slice(0, 10);
        localStorage.setItem('lb-' + gameId, JSON.stringify(trimmed));
        return trimmed;
    },

    // Meilleur score d'un jeu { name, score } ou null
    best(gameId) {
        const lb = this.get(gameId);
        return lb.length > 0 ? lb[0] : null;
    },

    // Demande le nom du joueur via un overlay
    promptName(score, callback) {
        // Créer l'overlay dynamiquement
        const overlay = document.createElement('div');
        overlay.id = 'name-overlay';
        overlay.style.cssText = `
            position:fixed; top:0; left:0; right:0; bottom:0;
            background:rgba(0,0,0,.8); display:flex; flex-direction:column;
            align-items:center; justify-content:center; z-index:999;
            backdrop-filter:blur(4px);
        `;
        overlay.innerHTML = `
            <div style="background:linear-gradient(145deg,#14203a,#0d1829);
                padding:28px 24px; border-radius:20px; text-align:center;
                border:1px solid rgba(255,255,255,.08);
                box-shadow:0 8px 30px rgba(0,0,0,.6); max-width:320px; width:90%;">
                <h2 style="color:#ffd93d; font-size:1.6rem; margin-bottom:6px;
                    text-shadow:0 0 15px rgba(255,217,61,.4);">🏆 Score : ${score}</h2>
                <p style="color:#aaa; font-size:.9rem; margin-bottom:16px;">
                    Entre ton nom pour le classement :</p>
                <input id="lb-name-input" type="text" maxlength="20" placeholder="Ton pseudo..."
                    autocomplete="off"
                    style="width:100%; padding:12px 14px; font-size:1.1rem;
                    border-radius:12px; border:1px solid rgba(255,255,255,.15);
                    background:#0a0e1a; color:#eee; outline:none;
                    text-align:center; margin-bottom:14px;">
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button id="lb-save-btn" style="padding:12px 28px; font-size:1rem;
                        border-radius:12px; background:linear-gradient(145deg,#27ae60,#1e8449);
                        color:#eee; border:1px solid rgba(255,255,255,.1); font-weight:bold;
                        cursor:pointer;">Enregistrer</button>
                    <button id="lb-skip-btn" style="padding:12px 20px; font-size:1rem;
                        border-radius:12px; background:linear-gradient(145deg,#1a3a5c,#0d2137);
                        color:#aaa; border:1px solid rgba(255,255,255,.06); font-weight:bold;
                        cursor:pointer;">Passer</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = document.getElementById('lb-name-input');
        const lastUsed = localStorage.getItem('lb-last-name') || '';
        input.value = lastUsed;
        setTimeout(() => input.focus(), 100);

        const finish = (name) => {
            overlay.remove();
            callback(name);
        };

        document.getElementById('lb-save-btn').onclick = () => {
            const name = input.value.trim() || 'Anonyme';
            localStorage.setItem('lb-last-name', name);
            finish(name);
        };
        document.getElementById('lb-skip-btn').onclick = () => finish(null);

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                document.getElementById('lb-save-btn').click();
            }
        });
    }
};
