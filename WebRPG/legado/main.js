import { racasDisponiveis } from "../JogoRPG/personagem/criacao/raca.js";
import {
  classesDisponiveis,
  classesBonus,
} from "../JogoRPG/personagem/criacao/classe.js";
import { missoes } from "../JogoRPG/missao/createMissoes.js";
import { templates } from "../JogoRPG/inimigos/createMostro.js";
import { armasDisponiveis } from "../JogoRPG/loja/itensLoja/armas.js";
import { conjuntos } from "../JogoRPG/loja/itensLoja/armaduras.js";
import { consumiveis } from "../JogoRPG/loja/itensLoja/consumiveis.js";
import { ENEMY_IMG_MAP, HERO_SPRITE_MAP, CLASS_ABILITIES } from "./data.js";

// Mapeamento de Ícones para itens do JogoRPG
const ICON_MAP = {
  // Armas
  "Espada Longa": "fa-sword",
  "Arco Élfico": "fa-bow-arrow",
  "Adaga Sombria": "fa-dagger",
  "Martelo de Guerra": "fa-hammer",
  "Cajado do Caos": "fa-wand-sparkles",
  "Cajado Congelante": "fa-snowflake",
  "Machado Flamejante": "fa-fire-flame-curved",
  "Lança Sagrada": "fa-khanda",
  "Punhais Gêmeos": "fa-xmarks-lines",
  "Foice do Ceifador": "fa-skull",
  // Armaduras
  "Elmo de Ferro": "fa-helmet-safety",
  "Peitoral de Ferro": "fa-shirt",
  "Manoplas de Ferro": "fa-mitten",
  "Grevas de Ferro": "fa-socks",
  "Botas de Ferro": "fa-shoe-prints",
  "Capuz de Velo": "fa-user-ninja",
  "Túnica Ligeira": "fa-shirt",
  "Luvas Leves": "fa-hand-fist",
  "Calças Ligeiras": "fa-person-running",
  "Botas Ágeis": "fa-shoe-prints",
  "Máscara das Sombras": "fa-mask",
  "Peitoral das Sombras": "fa-user-secret",
  "Luvas das Sombras": "fa-hand-sparkles",
  "Calças das Sombras": "fa-person-walking",
  "Botas das Sombras": "fa-shoe-prints",
  "Elmo do Dragão": "fa-dragon",
  "Peitoral do Dragão": "fa-shield-heart",
  "Manoplas do Dragão": "fa-hand-back-fist",
  "Grevas do Dragão": "fa-person-military-toons",
  "Botas do Dragão": "fa-shoe-prints",
  // Consumíveis
  "Poção de Cura": "fa-flask",
};

let jogador = null;
let inimigo = null;
let selecionados = { raca: 0, classe: 0 };

const screens = {
  title: document.getElementById("title-screen"),
  creation: document.getElementById("creation-screen"),
  hub: document.getElementById("hub-screen"),
  battle: document.getElementById("battle-screen"),
  mission: document.getElementById("mission-screen"),
  shop: document.getElementById("shop-screen"),
};

// --- Sistema de Notificações Globais ---
let notificationQueue = [];
let isNotificationActive = false;

function showNotification(title, message, callback = null) {
  notificationQueue.push({ title, message, callback });
  if (!isNotificationActive) {
    processNotificationQueue();
  }
}

function processNotificationQueue() {
  if (notificationQueue.length === 0) {
    isNotificationActive = false;
    return;
  }

  isNotificationActive = true;
  const { title, message, callback } = notificationQueue.shift();

  const modal = document.getElementById("global-notification");
  const titleEl = document.getElementById("notification-title");
  const msgEl = document.getElementById("notification-msg");
  const btnOk = document.getElementById("btn-notification-ok");

  titleEl.textContent = title;
  msgEl.textContent = message;
  modal.classList.remove("hidden");

  btnOk.onclick = () => {
    modal.classList.add("hidden");
    if (callback) callback();
    // Pequeno delay para a animação de fechar antes da próxima nota
    setTimeout(processNotificationQueue, 100);
  };
}

// --- Sistema Navegação ---
function showScreen(name) {
  Object.values(screens).forEach((s) => {
    if (s) s.classList.add("hidden");
  });
  if (screens[name]) screens[name].classList.remove("hidden");
}

// --- Criação Personagem (Tab System) ---
function setupCreation() {
  const raceOptions = document.getElementById("race-options");
  const classOptions = document.getElementById("class-options");
  const tabRace = document.getElementById("tab-race");
  const tabClass = document.getElementById("tab-class");
  const raceView = document.getElementById("race-selection-view");
  const classView = document.getElementById("class-selection-view");

  raceOptions.innerHTML = "";
  classOptions.innerHTML = "";

  // Render Raças
  racasDisponiveis.forEach((r, i) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn" + (i === selecionados.raca ? " active" : "");
    btn.innerHTML = `<span class="pixel-text-small">${r.nome}</span>`;
    btn.onclick = () => selectRaca(i);
    raceOptions.appendChild(btn);
  });

  // Render Classes
  classesDisponiveis.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn" + (i === selecionados.classe ? " active" : "");
    btn.innerHTML = `<span class="pixel-text-small">${c.nome}</span>`;
    btn.onclick = () => selectClasse(i + 1); // +1 because classesBonus is 1-indexed
    classOptions.appendChild(btn);
  });

  // Lógica das Tabs v2
  tabRace.onclick = () => {
    tabRace.classList.add("active");
    tabClass.classList.remove("active");
    raceView.classList.remove("hidden");
    classView.classList.add("hidden");
    document.getElementById("selection-title-v2").textContent =
      "Linhagem disponível";
  };

  tabClass.onclick = () => {
    tabClass.classList.add("active");
    tabRace.classList.remove("active");
    classView.classList.remove("hidden");
    raceView.classList.add("hidden");
    document.getElementById("selection-title-v2").textContent =
      "Senda de combate";
  };

  updateHeroPreview();

  document.getElementById("btn-confirm-creation").onclick = () => {
    const nomeInput = document.getElementById("hero-name-input");
    const nome = nomeInput.value || "Herói";
    const raca = racasDisponiveis[selecionados.raca];
    const classeIndex = selecionados.classe;
    const bonusClasse = classesBonus[classeIndex];
    const nomeClasse = classesDisponiveis[classeIndex - 1].nome;

    jogador = {
      nome,
      raca: raca.nome,
      classe: nomeClasse,
      nivel: 1,
      xp: 0,
      ouro: 100,
      hpMax: 100 + raca.bonus.hp,
      hp: 100 + raca.bonus.hp,
      ataque: 5 + raca.bonus.atk + (bonusClasse.atk || 0),
      defesa: 5 + raca.bonus.def + (bonusClasse.def || 0),
      habilidade: bonusClasse.habilidade,
      sprite: HERO_SPRITE_MAP[raca.nome] || HERO_SPRITE_MAP["Humano"],
      bonus: bonusClasse, // Store for reference
      critChance: (raca.bonus.critChance || 0) + (bonusClasse.critChance || 0),
      inventario: [
        {
          id: "pot_hp_small",
          nome: "Poção de Cura",
          tipo: "cura",
          valor: 50,
          qtd: 2,
          icon: "fa-flask",
        },
      ],
    };

    setupHub();
    showScreen("hub");
  };
}

function selectRaca(index) {
  selecionados.raca = index;
  document.querySelectorAll("#race-options .opt-btn").forEach((b, i) => {
    b.classList.toggle("active", i === index);
  });
  updateHeroPreview();
}

function selectClasse(index) {
  selecionados.classe = index;
  document.querySelectorAll("#class-options .opt-btn").forEach((b, i) => {
    b.classList.toggle("active", i + 1 === index);
  });
  updateHeroPreview();
}

function updateHeroPreview() {
  const raca = racasDisponiveis[selecionados.raca];
  const bonusClasse = classesBonus[selecionados.classe || 1];
  const classeInfo = classesDisponiveis[(selecionados.classe || 1) - 1];

  const baseAtk = 5;
  const baseDef = 5;
  const baseHp = 100;

  const finalAtk = baseAtk + raca.bonus.atk + (bonusClasse.atk || 0);
  const finalDef = baseDef + raca.bonus.def + (bonusClasse.def || 0);
  const finalHp = baseHp + raca.bonus.hp;
  const finalCrit =
    (raca.bonus.critChance || 0) + (bonusClasse.critChance || 0);

  updateStatDisplay("stat-atk", finalAtk, baseAtk);
  updateStatDisplay("stat-def", finalDef, baseDef);
  updateStatDisplay("stat-hp", finalHp, baseHp);
  updateStatDisplay("stat-crit", finalCrit + "%", 0);

  renderHeroPerks(raca, classeInfo);
}

// --- LOJA ---
let currentShopTab = "diversos";

function setupShop() {
  updateShopGold();
  renderShopTab(currentShopTab);

  document.getElementById("shop-btn-back").onclick = () => {
    showScreen("hub");
    updateHubStats();
  };

  const tabs = document.querySelectorAll(".shop-tab-btn");
  tabs.forEach((tab) => {
    tab.onclick = () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentShopTab = tab.dataset.tab;
      renderShopTab(currentShopTab);
    };
  });
}

function updateShopGold() {
  if (jogador)
    document.getElementById("shop-gold-val").textContent = jogador.ouro;
}

function renderShopTab(tab) {
  const content = document.getElementById("shop-content");
  content.innerHTML = "";

  if (tab === "armaduras") {
    for (const [setName, itens] of Object.entries(conjuntos)) {
      const setHeader = document.createElement("div");
      setHeader.className = "shop-set-section";
      setHeader.innerHTML = `<div class="shop-set-title">CONJUNTO ${setName.toUpperCase()}</div>`;
      content.appendChild(setHeader);

      const grid = document.createElement("div");
      grid.className = "shop-items-grid";

      itens.forEach((item) => {
        const itemComIcone = { ...item, icon: ICON_MAP[item.nome] || "fa-box" };
        grid.appendChild(createShopItemCard(itemComIcone));
      });
      content.appendChild(grid);
    }
  } else {
    const grid = document.createElement("div");
    grid.className = "shop-items-grid";
    const listaOrigem = tab === "armas" ? armasDisponiveis : consumiveis;

    listaOrigem.forEach((item) => {
      const itemComIcone = { ...item, icon: ICON_MAP[item.nome] || "fa-box" };
      grid.appendChild(createShopItemCard(itemComIcone));
    });
    content.appendChild(grid);
  }
}

function createShopItemCard(item) {
  const card = document.createElement("div");
  card.className = "shop-item-card";

  let stats = "";
  if (item.atk) stats = `ATK: +${item.atk}`;
  if (item.defesa) stats = `DEF: +${item.defesa}`;
  if (item.slot === "consumable") stats = `CURA: 50 HP`;

  let rarityClass = item.raridade || "comum";

  card.innerHTML = `
        <div class="shop-item-name">${item.nome}</div>
        <i class="fa-solid ${item.icon} shop-item-icon ${rarityClass}"></i>
        <div class="shop-item-stats">${stats}</div>
        <div class="shop-item-price"><i class="fa-solid fa-coins"></i> ${item.preco}</div>
        <button class="pixel-button btn-buy">COMPRAR</button>
    `;

  card.querySelector(".btn-buy").onclick = () => comprarItem(item);
  return card;
}

function comprarItem(item) {
  if (jogador.ouro >= item.preco) {
    jogador.ouro -= item.preco;
    updateShopGold();

    const itemInventario = {
      ...item,
      qtd: 1,
      icon: ICON_MAP[item.nome] || "fa-box",
    };

    if (item.slot === "consumable") {
      const existing = jogador.inventario.find((i) => i.nome === item.nome);
      if (existing) existing.qtd++;
      else jogador.inventario.push(itemInventario);
    } else {
      jogador.inventario.push(itemInventario);
    }

    showNotification("COMPRA REALIZADA", `Você comprou ${item.nome}!`);
  } else {
    showNotification("LOJA", "Você não tem ouro suficiente!");
  }
}

function updateStatDisplay(id, current, base) {
  const el = document.getElementById(id);
  if (!el) return;
  const currentNum = parseInt(current);

  el.textContent = current;
  el.classList.remove("buff", "debuff");

  if (currentNum > base) {
    el.classList.add("buff");
  } else if (currentNum < base) {
    el.classList.add("debuff");
  }
}

function renderHeroPerks(raca, classe) {
  const container = document.getElementById("hero-advantages");
  if (!container) return;
  container.innerHTML = "";

  // Race Buffs/Debuffs
  Object.entries(raca.bonus).forEach(([stat, val]) => {
    if (val !== 0) {
      const perk = document.createElement("div");
      const isBuff = val > 0;
      perk.className = `perk-icon ${isBuff ? "buff-icon" : "debuff-icon"}`;

      const iconMap = {
        hp: "fa-heart",
        atk: "fa-khanda",
        def: "fa-shield",
        critChance: "fa-bullseye",
      };

      const icon = iconMap[stat] || "fa-plus";
      const sign = isBuff ? "+" : "";

      perk.innerHTML = `
                <i class="fa-solid ${icon} ${
        isBuff ? "buff-color" : "debuff-color"
      }"></i>
                <div class="tooltip">${
                  raca.nome
                }: ${sign}${val} ${stat.toUpperCase()}</div>
            `;
      container.appendChild(perk);
    }
  });

  // Class Perks from data.js Map
  const abilities = CLASS_ABILITIES[classe.nome];
  if (abilities) {
    abilities.forEach((ability) => {
      const perk = document.createElement("div");
      perk.className = "perk-icon";
      perk.innerHTML = `
                <i class="fa-solid ${ability.icon}"></i>
                <div class="tooltip"><strong>${ability.name}</strong>: ${ability.desc}</div>
            `;
      container.appendChild(perk);
    });
  }

  // Dragonoid Restriction
  if (raca.restricoes && raca.restricoes.semArmadura) {
    const perk = document.createElement("div");
    perk.className = "perk-icon debuff-icon";
    perk.innerHTML = `
            <i class="fa-solid fa-shirt-slash debuff-color"></i>
            <div class="tooltip">Restrição: Pele escamosa não permite o uso de armaduras.</div>
        `;
    container.appendChild(perk);
  }
}

// --- HUB / CIDADE ---
function setupHub() {
  updateHubStats();

  document.getElementById("hub-btn-quests").onclick = () => {
    setupMission();
    showScreen("mission");
  };

  document.getElementById("hub-btn-explore").onclick = () => {
    const chance = Math.floor(Math.random() * 100) + 1;
    if (chance <= 85) {
      startBattle("Exploração");
    } else {
      const ouroGanhado = Math.floor(Math.random() * 20) + 10;
      jogador.ouro += ouroGanhado;
      showNotification(
        "EXPLORAÇÃO",
        `Você explorou os arredores e encontrou um baú com ${ouroGanhado} moedas de ouro!`
      );
      updateHubStats();
    }
  };

  document.getElementById("hub-btn-rest").onclick = () => {
    const custo = 10;
    if (jogador.ouro >= custo) {
      jogador.ouro -= custo;
      jogador.hp = jogador.hpMax;
      showNotification(
        "ESTALAGEM",
        "Você descansou na estalagem e recuperou todo seu HP!"
      );
      updateHubStats();
    } else {
      showNotification(
        "SISTEMA",
        "Você não tem ouro suficiente para descansar!"
      );
    }
  };

  document.getElementById("hub-btn-exit").onclick = () => {
    showNotification(
      "SAIR",
      "Deseja realmente voltar ao menu principal?",
      () => {
        showScreen("title");
      }
    );
  };
}

function updateHubStats() {
  if (!jogador) return;
  document.getElementById("hub-player-name").textContent = jogador.nome;
  document.getElementById(
    "hub-player-level"
  ).textContent = `LVL: ${jogador.nivel}`;
  document.getElementById("hub-hp-val").textContent = `${Math.ceil(
    jogador.hp
  )}/${jogador.hpMax}`;
  document.getElementById("hub-gold-val").textContent = jogador.ouro;
  document.getElementById(
    "hero-hub-sprite"
  ).style.backgroundImage = `url('${jogador.sprite}')`;
}

// --- MISSÃO ---
let missaoAtual = null;

function setupMission() {
  updateMissionStats();

  // Estado inicial: Esconde detalhes
  document.getElementById("mission-details-container").classList.add("hidden");

  // Botão Voltar
  document.getElementById("mission-btn-back").onclick = () => {
    showScreen("hub");
  };

  // Botão Missão/Aceitar
  document.getElementById("mission-btn-start").onclick = () => {
    const details = document.getElementById("mission-details-container");

    // Se a janela de detalhes estiver visível, iniciamos a missão (Aceitar)
    if (!details.classList.contains("hidden")) {
      concluirMissao();
      return;
    }

    // Caso contrário, abre o painel temático de missões
    abrirPainelMissao();
  };
}

function abrirPainelMissao() {
  const details = document.getElementById("mission-details-container");
  details.classList.remove("hidden");

  // Filtra missões por nível
  const missoesPossiveis = missoes.filter(
    (m) => jogador.nivel >= m.nivelMinimo
  );
  missaoAtual =
    missoesPossiveis[Math.floor(Math.random() * missoesPossiveis.length)];

  // Atualiza o card de missão
  details.querySelector("h3").textContent = missaoAtual.descricao;
  details.querySelector(".mission-desc-stone").textContent =
    missaoAtual.historia;

  // Recompensas escaláveis (baseadas na lógica de JogoRPG)
  missaoAtual.xpFinal = Math.round(missaoAtual.xp(jogador.nivel));
  missaoAtual.ouroFinal = Math.round(missaoAtual.ouro(jogador.nivel));

  details.querySelector(".mission-rewards-stone").innerHTML = `
    <span><i class="fa-solid fa-coins gold-text"></i> ${missaoAtual.ouroFinal} OURO</span>
    <span><i class="fa-solid fa-star blue-text"></i> ${missaoAtual.xpFinal} XP</span>
  `;

  document
    .getElementById("mission-btn-start")
    .querySelector("span").textContent = "ACEITAR";
}

function concluirMissao() {
  if (!missaoAtual) return;

  const chance = Math.random() * 100;
  const sucessoBase = missaoAtual.chanceSucesso || 80;

  if (chance <= sucessoBase) {
    jogador.ouro += missaoAtual.ouroFinal;
    jogador.xp += missaoAtual.xpFinal;
    showNotification(
      "MISSÃO CONCLUÍDA",
      `Sucesso! Você completou a missão: ${missaoAtual.descricao}\nGanhou ${missaoAtual.ouroFinal} Ouro e ${missaoAtual.xpFinal} XP.`
    );

    if (jogador.xp >= 100 * jogador.nivel) {
      jogador.nivel++;
      jogador.xp = 0;
      showNotification(
        "LEVEL UP!",
        `Parabéns! Você agora está no nível ${jogador.nivel}!`
      );
    }
  } else {
    const perdaHp = Math.floor(jogador.hpMax * 0.15);
    jogador.hp = Math.max(1, jogador.hp - perdaHp);
    showNotification(
      "MISSÃO FALHOU",
      `Falha! Você se feriu durante a missão e perdeu ${perdaHp} de HP.`
    );
  }

  showScreen("hub");
  updateHubStats();
}

function updateMissionStats() {
  if (!jogador) return;
  document.getElementById("mission-player-name").textContent = jogador.nome;
  document.getElementById(
    "mission-player-level"
  ).textContent = `LVL: ${jogador.nivel}`;
  document.getElementById("mission-hp-val").textContent = `${Math.ceil(
    jogador.hp
  )}/${jogador.hpMax}`;
  document.getElementById("mission-gold-val").textContent = jogador.ouro;
  document.getElementById(
    "hero-mission-sprite"
  ).style.backgroundImage = `url('${jogador.sprite}')`;

  document
    .getElementById("mission-btn-start")
    .querySelector("span").textContent = "MISSÃO";
  missaoAtual = null;
}

// --- Sistema Batalha ---
function startBattle(loc) {
  const possiveis = templates.filter((e) => jogador.nivel >= e.minNivel);
  const template = possiveis[Math.floor(Math.random() * possiveis.length)];

  inimigo = {
    nome: template.nome,
    hp: Math.round(template.baseHp + jogador.nivel * template.escalaHp),
    hpMax: Math.round(template.baseHp + jogador.nivel * template.escalaHp),
    atk: Math.round(template.baseAtk + jogador.nivel * template.escalaAtk),
    img: ENEMY_IMG_MAP[template.nome] || ENEMY_IMG_MAP["Goblin Ladrão"],
  };

  const enemySprite = document.getElementById("enemy-sprite");
  if (enemySprite) enemySprite.style.backgroundImage = `url('${inimigo.img}')`;
  document.getElementById("enemy-name").textContent = inimigo.nome;

  const battleLog = document.getElementById("battle-log");
  if (battleLog) battleLog.innerHTML = "";

  showNotification("COMBATE!", `Um ${inimigo.nome} apareceu na ${loc}!`, () => {
    updateBattleUI();
    showScreen("battle");
  });
}

function updateBattleUI() {
  if (!inimigo || !jogador) return;
  const enemyPercent = (inimigo.hp / inimigo.hpMax) * 100;
  document.getElementById("enemy-hp-fill").style.width = `${enemyPercent}%`;

  const playerPercent = (jogador.hp / jogador.hpMax) * 100;
  document.getElementById("player-hp-fill").style.width = `${playerPercent}%`;
  document.getElementById("player-hp-text").textContent = `${Math.ceil(
    jogador.hp
  )}/${jogador.hpMax}`;

  if (inimigo.hp <= 0) {
    addLog(`${inimigo.nome} foi derrotado!`);
    setTimeout(() => {
      showScreen("hub");
      updateHubStats();
    }, 2000);
  }
}

function addLog(text) {
  const log = document.getElementById("battle-log");
  if (!log) return;
  const p = document.createElement("p");
  p.textContent = `> ${text}`;
  log.prepend(p);
}

document.getElementById("action-attack").onclick = () => {
  if (!inimigo || jogador.hp <= 0) return;
  const dano = Math.floor(Math.random() * jogador.ataque) + 5;
  inimigo.hp -= dano;
  addLog(`Você atacou e causou ${dano} de dano!`);
  updateBattleUI();
  if (inimigo.hp > 0) setTimeout(enemyTurn, 800);
};

// --- Sistema de Inventário (Batalha) ---
document.getElementById("action-item").onclick = () => {
  if (!inimigo || jogador.hp <= 0) return;
  renderBattleInventory();
  document.getElementById("inventory-modal").classList.remove("hidden");
};

document.getElementById("btn-close-inv").onclick = () => {
  document.getElementById("inventory-modal").classList.add("hidden");
};

function renderBattleInventory() {
  const list = document.getElementById("inv-list");
  list.innerHTML = "";

  if (jogador.inventario.length === 0) {
    list.innerHTML =
      '<span class="pixel-text-tiny white-text centered">Mochila vazia...</span>';
    return;
  }

  jogador.inventario.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "inv-item";
    div.innerHTML = `
            <div style="display:flex; gap:10px; align-items:center;">
                <i class="fa-solid ${item.icon} white-text"></i>
                <span class="pixel-text-tiny white-text">${item.nome} (x${item.qtd})</span>
            </div>
            <span class="pixel-text-tiny gold-text" style="font-size:0.5rem">USAR</span>
        `;

    div.onclick = () => usarItemBatalha(index);
    list.appendChild(div);
  });
}

function usarItemBatalha(index) {
  const item = jogador.inventario[index];

  if (item.tipo === "cura") {
    const hpAnterior = jogador.hp;
    if (jogador.hp >= jogador.hpMax) {
      showNotification("SISTEMA", "Vida cheia!");
      return;
    }
    jogador.hp = Math.min(jogador.hpMax, jogador.hp + item.valor);
    const curado = jogador.hp - hpAnterior;
    addLog(`Usou ${item.nome} e curou ${curado} HP.`);
  } else if (item.tipo === "dano") {
    inimigo.hp -= item.valor;
    addLog(`Jogou ${item.nome} causando ${item.valor} de dano!`);
  }

  // Consome 1
  item.qtd--;
  if (item.qtd <= 0) {
    jogador.inventario.splice(index, 1);
  }

  document.getElementById("inventory-modal").classList.add("hidden");
  updateBattleUI();

  // Passa turno se ainda estiver em combate
  if (inimigo.hp > 0) {
    setTimeout(enemyTurn, 800);
  }
}

document.getElementById("action-flee").onclick = () => {
  if (!inimigo || jogador.hp <= 0) return;
  const chance = Math.random() * 100;
  // Chance base 50% + bonus de sorte/classe (aqui fixo por enquanto)
  if (chance > 50) {
    addLog(`Você conseguiu fugir com sucesso!`);
    setTimeout(() => {
      showScreen("hub");
      updateHubStats();
    }, 1000);
  } else {
    addLog(`Falha ao fugir! O inimigo aproveita sua hesitação.`);
    setTimeout(enemyTurn, 800);
  }
};

function enemyTurn() {
  const dano = Math.max(
    1,
    Math.floor(Math.random() * inimigo.atk) - Math.floor(jogador.defesa / 2)
  );
  jogador.hp -= dano;
  addLog(`${inimigo.nome} atacou você causando ${dano} de dano!`);
  updateBattleUI();
  if (jogador.hp <= 0) {
    addLog("Você morreu...");
    setTimeout(() => location.reload(), 3000);
  }
}

// --- Init ---
document.getElementById("btn-start").onclick = () => {
  showScreen("creation");
  setupCreation();
};

document.getElementById("btn-load").onclick = () => {
  const save = localStorage.getItem("rpg_save");
  if (save) {
    jogador = JSON.parse(save);
    showNotification("CARREGAR", "Jogo carregado com sucesso!");
    setupHub();
    showScreen("hub");
  } else {
    showNotification("ERRO", "Nenhum save encontrado!");
  }
};

// Auto-save logic
function saveGame() {
  if (jogador) {
    localStorage.setItem("rpg_save", JSON.stringify(jogador));
  }
}
// Save periodically or after major events
setInterval(saveGame, 30000);
