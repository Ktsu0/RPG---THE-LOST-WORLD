import { criarPersonagem, colors } from "./personagem/criacaoPersonagem.js";
import {
    status,
    checarLevelUp,
    danoDoJogador,
    calcularDefesaTotal,
    equiparItem,
    aplicarFuria,
} from "./personagem/status.js";
import { menuAmuleto } from "./itens/amuleto.js";
import { abrirLoja, loja } from "./itens/loja/itensLoja.js";
import { criarInimigo } from "./inimigos/monstros.js";
import { criarMiniBoss } from "./inimigos/miniBoss.js";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

// --- Utilitários ---
export function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Inicialização ---
export const ARMOR_SLOTS = ["head", "chest", "hands", "legs", "feet"];
let jogador = criarPersonagem();

// Inicializa equipamentos caso ainda não exista
jogador.equipamentos = jogador.equipamentos || {
    head: null,
    chest: null,
    hands: null,
    legs: null,
    feet: null,
};

let inimigo = criarInimigo(jogador);

// --- Usar Poção ---
export function usarPocao(jogador) {
    // Verifica se há poções no inventário
    const index = jogador.itens.findIndex((item) => item === "Poção de Cura");
    if (index === -1) {
        console.log("❌ Você não possui nenhuma Poção de Cura!");
        return false;
    }

    // Remove a poção do inventário
    jogador.itens.splice(index, 1);

    // Recupera HP (por exemplo, 30 a 50)
    const cura = rand(30, 50);
    jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);

    console.log(
        `💊 Você usou uma Poção de Cura e recuperou ${cura} HP! (HP: ${jogador.hp}/${jogador.hpMax})`
    );
    return true;
}

// --- Funções de esqueleto para necromante ---
export function verificarEsqueleto(
    jogador,
    esqueleto,
    turnosDesdeUltimoEsqueleto
) {
    if (jogador.habilidadeClasse !== "necromante")
        return { esqueleto, turnos: turnosDesdeUltimoEsqueleto };

    turnosDesdeUltimoEsqueleto++;
    if (turnosDesdeUltimoEsqueleto >= 4) {
        esqueleto = { hp: 15, dano: 3 + (jogador.nivel - 1) };
        turnosDesdeUltimoEsqueleto = 0;
        console.log("☠️ Um esqueleto aliado foi invocado!");
    }
    return { esqueleto, turnos: turnosDesdeUltimoEsqueleto };
}

export function aplicarDanoAoEsqueleto(danoInimigo, esqueleto) {
    if (!esqueleto || esqueleto.hp <= 0) return danoInimigo;
    const danoAbsorvido = Math.min(danoInimigo, esqueleto.hp);
    esqueleto.hp -= danoAbsorvido;
    danoInimigo -= danoAbsorvido;
    console.log(`🛡 O esqueleto absorveu ${danoAbsorvido} de dano!`);
    if (esqueleto.hp <= 0) console.log("💀 O esqueleto aliado caiu!");
    return danoInimigo;
}

export function ataqueEsqueleto(inimigo, esqueleto) {
    if (!esqueleto || esqueleto.hp <= 0) return;
    console.log(`☠️ O esqueleto causa ${esqueleto.dano} de dano ao inimigo!`);
    inimigo.hp -= esqueleto.dano;
    inimigo.hp = Math.max(0, inimigo.hp);
}

// --- Missões ---
export const missoes = [{
        descricao: "Escoltar um mercador até a cidade",
        historia: "O mercador teme bandidos na estrada. Sua escolta é discreta, mas precisa ser rápida e firme.",
        tipo: "comum",
        nivelMinimo: 1,
        chanceSucesso: 85,
        xp: 15,
        ouro: 10,
        chanceMiniBoss: 1,
        chanceMissaoExtra: 2,
        chanceMasmorra: 0.1,
        falha: { tipo: "hp", percentual: 10 },
    },
    {
        descricao: "Encontrar um amuleto escondido na floresta",
        historia: "Dizem que animais guardam um amuleto perdido. A floresta é traiçoeira; ouça os sinais antes de avançar.",
        tipo: "comum",
        nivelMinimo: 1,
        chanceSucesso: 65,
        xp: 25,
        ouro: 20,
        chanceMiniBoss: 1,
        chanceMissaoExtra: 2,
        chanceMasmorra: 0.1,
        falha: { tipo: "hp", percentual: 10 },
    },
    {
        descricao: "Ajudar o ferreiro local com materiais",
        historia: "O ferreiro precisa de minério raro para forjar uma lâmina. Trabalho braçal e risco de acidentes.",
        tipo: "comum",
        nivelMinimo: 1,
        chanceSucesso: 90,
        xp: 10,
        ouro: 8,
        chanceMiniBoss: 1,
        chanceMissaoExtra: 2,
        chanceMasmorra: 0.1,
        falha: { tipo: "hp", percentual: 10 },
    },
    {
        descricao: "Resgatar um aldeão perdido na floresta sombria",
        historia: "Gritos abafados ecoam entre as árvores. Encontrar o aldeão antes da noite é imperativo.",
        tipo: "comum",
        nivelMinimo: 2,
        chanceSucesso: 85,
        xp: 18,
        ouro: 12,
        item: { nome: "Pena do Corvo Sombrio", raridade: "comum" },
        chanceMiniBoss: 10,
        chanceMissaoExtra: 5,
        chanceMasmorra: 1,
        falha: { tipo: "hp", percentual: 10 },
    },
    {
        descricao: "Recuperar uma espada amaldiçoada em cavernas",
        historia: "A lâmina chama por sangue. Há sombras vivas nas profundezas — recupere a gema que a contém.",
        tipo: "lendario",
        nivelMinimo: 8,
        chanceSucesso: 60,
        xp: 40,
        ouro: 35,
        item: { nome: "Gema da Escuridão", raridade: "lendario" },
        chanceMiniBoss: 10,
        chanceMissaoExtra: 5,
        chanceMasmorra: 1,
        falha: { tipo: "item", chancePerdaItemPercent: 2 },
    },
    {
        descricao: "Proteger uma caravana de monstros à noite",
        historia: "Sob a lua, criaturas atacam em bando. Proteja a caravana e mantenha a rota aberta.",
        tipo: "raro",
        nivelMinimo: 4,
        chanceSucesso: 70,
        xp: 30,
        ouro: 25,
        item: { nome: "Essência da Noite", raridade: "raro" },
        chanceMiniBoss: 10,
        chanceMissaoExtra: 5,
        chanceMasmorra: 1,
        falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
    },
    {
        descricao: "Domar uma criatura mística",
        historia: "Domar o resistente espírito bestial exige coragem. Uma tentativa mal feita pode ferir gravemente.",
        tipo: "lendario",
        nivelMinimo: 8,
        chanceSucesso: 55,
        xp: 50,
        ouro: 40,
        item: { nome: "Escama de Dragão Azul", raridade: "lendario" },
        chanceMiniBoss: 10,
        chanceMissaoExtra: 5,
        chanceMasmorra: 1,
        falha: { tipo: "hp", percentual: 20 },
    },
    {
        descricao: "Roubar relíquias de um templo antigo",
        historia: "Guardas e armadilhas protegem tesouros sagrados. A audácia traz lucros, mas pode trazer caça.",
        tipo: "raro",
        nivelMinimo: 4,
        chanceSucesso: 50,
        xp: 45,
        ouro: 38,
        item: { nome: "Relíquia Brilhante", raridade: "raro" },
        chanceMiniBoss: 10,
        chanceMissaoExtra: 5,
        chanceMasmorra: 1,
        falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
    },
    {
        descricao: "Salvar um sábio em ruínas místicas",
        historia: "Um sábio preso pode oferecer conhecimento raro em troca da sua bravura. Corra contra o tempo.",
        tipo: "comum",
        nivelMinimo: 2,
        chanceSucesso: 65,
        xp: 28,
        ouro: 18,
        item: { nome: "Pergaminho Arcano", raridade: "comum" },
        chanceMiniBoss: 10,
        chanceMissaoExtra: 5,
        chanceMasmorra: 1,
        falha: { tipo: "hp", percentual: 10 },
    },
    {
        descricao: "Recuperar um livro proibido na biblioteca sombria",
        historia: "Entre estantes empoeiradas, o livro sussurra segredos que podem corromper ou capacitar.",
        tipo: "raro",
        nivelMinimo: 4,
        chanceSucesso: 55,
        xp: 42,
        ouro: 32,
        item: { nome: "Página Amaldiçoada", raridade: "raro" },
        chanceMiniBoss: 10,
        chanceMissaoExtra: 5,
        chanceMasmorra: 1,
        falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
    },
    {
        descricao: "Explorar o vulcão em erupção",
        historia: "Calor e cinzas testam sua resistência. No coração do vulcão, o poder ardente espera ser tomado.",
        tipo: "lendario",
        nivelMinimo: 8,
        chanceSucesso: 45,
        xp: 55,
        ouro: 50,
        item: { nome: "Coração de Magma", raridade: "lendario" },
        chanceMiniBoss: 10,
        chanceMissaoExtra: 5,
        chanceMasmorra: 1,
        falha: { tipo: "item", chancePerdaItemPercent: 2 },
    },
    {
        descricao: "Eliminar uma seita secreta",
        historia: "Rituais obscuros se aproximam do auge. Interrompa-os antes que criaturas sejam invocadas.",
        tipo: "raro",
        nivelMinimo: 4,
        chanceSucesso: 60,
        xp: 38,
        ouro: 28,
        item: { nome: "Máscara Sombria", raridade: "raro" },
        chanceMiniBoss: 10,
        chanceMissaoExtra: 5,
        chanceMasmorra: 1,
        falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
    },
    {
        descricao: "Ajudar a curandeira a coletar ervas raras",
        historia: "Ervas que florescem apenas ao amanhecer são preciosas. Proteja a curandeira durante a coleta.",
        tipo: "comum",
        nivelMinimo: 2,
        chanceSucesso: 85,
        xp: 20,
        ouro: 15,
        item: { nome: "Flor da Aurora", raridade: "comum" },
        chanceMiniBoss: 10,
        chanceMissaoExtra: 5,
        chanceMasmorra: 1,
        falha: { tipo: "hp", percentual: 10 },
    },
];

// --- Função para invocar ou atualizar esqueleto aliado ---
function gerenciarEsqueleto(jogador, esqueleto, turnosDesdeUltimoEsqueleto) {
    // Incrementa turnos
    turnosDesdeUltimoEsqueleto++;

    // Invoca esqueleto a cada 4 turnos
    if (
        jogador.habilidadeClasse === "necromante" &&
        turnosDesdeUltimoEsqueleto >= 4
    ) {
        esqueleto = { hp: 15, dano: 3 + (jogador.nivel - 1) };
        turnosDesdeUltimoEsqueleto = 0;
        console.log("☠️ Um esqueleto aliado foi invocado!");
    }

    return { esqueleto, turnosDesdeUltimoEsqueleto };
}

// --- Função para aplicar dano do esqueleto ---
function esqueletoAtaca(esqueleto, inimigo) {
    if (esqueleto && esqueleto.hp > 0 && inimigo.hp > 0) {
        console.log(`☠️ O esqueleto causa ${esqueleto.dano} de dano ao inimigo!`);
        inimigo.hp -= esqueleto.dano;
        inimigo.hp = Math.max(0, inimigo.hp);
    }
}

// --- Função para absorver dano pelo esqueleto ---
function esqueletoAbsorveDano(esqueleto, dano) {
    if (esqueleto && esqueleto.hp > 0 && dano > 0) {
        const danoAbsorvido = Math.min(dano, esqueleto.hp);
        esqueleto.hp -= danoAbsorvido;
        dano -= danoAbsorvido;
        console.log(`🛡 O esqueleto absorveu ${danoAbsorvido} de dano!`);
        if (esqueleto.hp <= 0) console.log("💀 O esqueleto aliado caiu!");
    }
    return dano;
}

// --- Função de batalha principal ---
function batalha(inimigo, jogador) {
    console.log(
        `\n🔥 Você encontrou um ${inimigo.nome}! (HP: ${inimigo.hp}, ATK: ${inimigo.atk})`
    );

    if (!inimigo.status) inimigo.status = [];
    let esqueleto = null;
    let turnosDesdeUltimoEsqueleto = 0;

    const finalizarVitoria = (jogador) => {
        console.log(
            `\n✅ Você derrotou o ${inimigo.nome}! Ganhou ${inimigo.xp || 0} XP.`
        );
        jogador.xp += inimigo.xp || 0;

        let ouroDrop = inimigo.ouro || 0;
        if (jogador.bonusClasse && jogador.bonusClasse.dropOuro) {
            ouroDrop = Math.floor(
                ouroDrop * (1 + jogador.bonusClasse.dropOuro / 100)
            );
        }
        jogador.ouro += ouroDrop;
        console.log(`Você ganhou ${ouroDrop} de ouro.`);

        // Drops de itens
        const chancePocao =
            15 + ((jogador.bonusClasse && jogador.bonusClasse.dropItem) || 0);
        const chanceArmadura =
            10 + ((jogador.bonusClasse && jogador.bonusClasse.dropItem) || 0);

        if (rand(1, 100) <= chancePocao) {
            jogador.itens.push("Poção de Cura");
            console.log("🎁 Você encontrou uma Poção de Cura!");
        }

        if (rand(1, 100) <= chanceArmadura) {
            const armors = loja.filter((i) => i.slot !== "consumable");
            if (armors.length > 0) {
                const drop = armors[rand(0, armors.length - 1)];
                equiparItem(jogador, drop);
                console.log(
                    `🎁 O inimigo dropou e você equipou: ${drop.nome} (Set: ${
            drop.set || "Nenhum"
          })`
                );
            }
        }

        checarLevelUp(jogador);
    };

    while (inimigo.hp > 0 && jogador.hp > 0) {
        console.log(
            `\nSeu HP: ${jogador.hp}/${jogador.hpMax} | ${inimigo.nome} HP: ${inimigo.hp}`
        );

        if (jogador.habilidadeClasse === "suporte") {
            const cura = Math.floor(jogador.hpMax * 0.1);
            jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);
            console.log(`💚 Suporte cura ${cura} HP!`);
        }

        console.log("[1] Atacar  [2] Usar Poção  [3] Fugir");
        const escolha = prompt("Escolha: ");

        if (escolha === "1") {
            let dmg = danoDoJogador(jogador); // calcula dano base
            dmg = aplicarFuria(jogador, dmg); // aplica fúria se for Bárbaro com <= 30% HP

            const critTotal =
                ((jogador.bonusClasse && jogador.bonusClasse.critChance) || 0) +
                ((jogador.bonusRaca && jogador.bonusRaca.critChance) || 0) +
                (jogador.bonusCritico || 0);

            if (critTotal > 0 && rand(1, 100) <= critTotal) {
                console.log("💥 Golpe crítico! Dano dobrado!");
                dmg *= 2;
            }

            if (jogador.armaEquipada && jogador.armaEquipada.efeito) {
                switch (jogador.armaEquipada.efeito) {
                    case "sangramento":
                        if (rand(1, 100) <= 30) {
                            const duracao = rand(3, 6);
                            console.log(
                                `🩸 A arma causou sangramento por ${duracao} turnos!`
                            );
                            inimigo.status.push({ tipo: "sangramento", duracao, dano: 5 });
                        }
                        break;
                    case "critico":
                        if (rand(1, 100) <= 15) {
                            console.log("💥 Golpe crítico da arma! Dano dobrado!");
                            dmg *= 2;
                        }
                        break;
                }
            }

            inimigo.hp -= dmg;
            inimigo.hp = Math.max(0, inimigo.hp);
            console.log(`Você causou ${dmg} de dano ao ${inimigo.nome}.`);

            if (jogador.habilidadeClasse === "sangramento" && rand(1, 100) <= 20) {
                const duracao = rand(3, 6);
                console.log(`🩸 O inimigo começou a sangrar por ${duracao} turnos!`);
                inimigo.status.push({ tipo: "sangramento", duracao, dano: 5 });
            }

            ({ esqueleto, turnosDesdeUltimoEsqueleto } = gerenciarEsqueleto(
                jogador,
                esqueleto,
                turnosDesdeUltimoEsqueleto
            ));

            if (inimigo.hp === 0) {
                finalizarVitoria();
                return true;
            }
        } else if (escolha === "2") {
            usarPocao(jogador);
        } else if (escolha === "3") {
            if (rand(1, 100) <= 60) {
                console.log("🏃 Você conseguiu fugir!");
                return false;
            } else {
                console.log("❌ Falha na fuga!");
            }
        } else {
            console.log("Opção inválida.");
        }

        inimigo.status.forEach((efeito, index) => {
            if (efeito.tipo === "sangramento") {
                console.log(
                    `🩸 O inimigo sofre ${efeito.dano} de dano por sangramento!`
                );
                inimigo.hp -= efeito.dano;
                efeito.duracao--;
                if (efeito.duracao <= 0) {
                    console.log("✅ O sangramento no inimigo parou.");
                    inimigo.status.splice(index, 1);
                }
            }
        });

        if (inimigo.hp > 0) {
            const defesaTotal = calcularDefesaTotal(jogador);
            let danoInimigo = Math.max(
                1,
                inimigo.atk + rand(0, 3) - Math.floor(defesaTotal / 5)
            );

            const esquivaTotal =
                (jogador.bonusEsquiva || 0) + // bônus de equipamentos ou set
                (jogador.habilidadeClasse === "suporte" ? 10 : 0); // bônus da classe suporte

            if (rand(1, 100) <= esquivaTotal) {
                console.log("💨 Você esquivou do ataque inimigo!");
                danoInimigo = 0;
            }

            let chanceBloqueio =
                (jogador.habilidadeClasse === "bloqueio" ? 10 : 0) +
                (jogador.bonusBloqueio || 0);
            if (rand(1, 100) <= chanceBloqueio) {
                console.log("🛡 Você bloqueou o ataque inimigo!");
                danoInimigo = 0;
            }

            danoInimigo = esqueletoAbsorveDano(esqueleto, danoInimigo);

            jogador.hp -= danoInimigo;
            jogador.hp = Math.max(0, jogador.hp);

            if (danoInimigo > 0)
                console.log(
                    `${inimigo.nome} atacou e causou ${danoInimigo} de dano. (Defesa: ${defesaTotal})`
                );

            esqueletoAtaca(esqueleto, inimigo);
        }
    }

    if (jogador.hp === 0) {
        console.log("\n💀 Você foi derrotado... Fim de jogo.");
        return false;
    }

    return true;
}

// Exemplo: lista de bosses com flags de habilidade
const torreBosses = [{
        nome: "Guardião de Pedra",
        hpBase: 80,
        atkBase: 12,
        defBase: 6,
        xpBase: 50,
        ouroBase: 30,
        habilidades: { blockChance: 20 }, // 1) chance de bloquear golpes
    },
    {
        nome: "Sentinela de Ferro",
        hpBase: 100,
        atkBase: 14,
        defBase: 8,
        xpBase: 70,
        ouroBase: 40,
        habilidades: { defBoostEveryTurns: { every: 2, amount: 4 } }, // 2) a cada 2 rodadas defesa aumenta
    },
    {
        nome: "Mago Sombrio",
        hpBase: 120,
        atkBase: 16,
        defBase: 10,
        xpBase: 90,
        ouroBase: 50,
        habilidades: { invisívelChance: 25 }, // 3) chance de ficar invisível no turno (faz jogador perder ataque)
    },
    {
        nome: "Lobo Alfa",
        hpBase: 140,
        atkBase: 18,
        defBase: 12,
        xpBase: 110,
        ouroBase: 60,
        habilidades: { critChanceBonus: 25 }, // 4) crítico alto (aumenta chance de crítico do boss)
    },
    {
        nome: "Cavaleiro Sombrio",
        hpBase: 160,
        atkBase: 20,
        defBase: 14,
        xpBase: 130,
        ouroBase: 70,
        habilidades: { blockChance: 20, critChanceBonus: 15 }, // 5) bloqueia ataques e chance de critical
    },
    {
        nome: "Hidra das Sombras",
        hpBase: 180,
        atkBase: 22,
        defBase: 16,
        xpBase: 150,
        ouroBase: 80,
        habilidades: { petrificarChance: 12, petrificarTurns: 2 }, // 6) chance de pedrificar por 2 turnos
    },
    {
        nome: "Golem Titânico",
        hpBase: 200,
        atkBase: 24,
        defBase: 18,
        xpBase: 170,
        ouroBase: 90,
        habilidades: { defIncreasePerTurn: 2, breakEquipChance: 10 }, // 7) defesa aumenta cada turno + chance quebrar equipamento
    },
    {
        nome: "Senhor dos Mortos",
        hpBase: 220,
        atkBase: 26,
        defBase: 20,
        xpBase: 190,
        ouroBase: 100,
        habilidades: {
            summonSkeletonsEveryTurns: 2,
            summonedSkeletonHp: 12,
            summonedSkeletonDmgBase: 3,
        }, // 8) invoca 2 esqueletos a cada 2 turnos
    },
    {
        nome: "Dragão Negro",
        hpBase: 250,
        atkBase: 30,
        defBase: 22,
        xpBase: 220,
        ouroBase: 120,
        habilidades: { highDef: true, dragonBreathChance: 18 }, // 9) defesa alta + chance 'sopro do dragão' (100% crítico)
    },
    {
        nome: "Lorde do Caos",
        hpBase: 300,
        atkBase: 35,
        defBase: 25,
        xpBase: 300,
        ouroBase: 200,
        habilidades: { canSummonMiniBoss: true, onDeathResurrect: true }, // 10) invoca miniBoss; ressuscita com mudança de stats
    },
];
// aplica checagens ANTES do jogador atacar (block / invisibilidade)
function bossPreAttackChecagens(boss, jogador) {
    // se boss está invisível, jogador tem chance de errar o ataque (tratado no cálculo do dano)
    if (boss.estado.invisivel) {
        console.log(`👻 ${boss.nome} está invisível — seu ataque pode falhar!`);
    }

    // chance de boss bloquear (avalie quando o jogador causar dano; aqui apenas retorna a prob)
    const blockChance = boss.habilidades.blockChance || 0;

    return { blockChance, invisivel: boss.estado.invisivel };
}

// executado no turno do boss (incrementa contador, aplica buffs e habilidades ativas)
function bossExecutarTurno(boss, jogador, criarMiniBossFn) {
    const h = boss.habilidades;
    boss.estado.turnCounter = (boss.estado.turnCounter || 0) + 1;
    const t = boss.estado.turnCounter;

    // 2) def boost a cada N turns
    if (h.defBoostEveryTurns && t % (h.defBoostEveryTurns.every || 2) === 0) {
        boss.def += h.defBoostEveryTurns.amount || 3;
        console.log(
            `🛡 ${boss.nome} aumenta sua defesa! (+${h.defBoostEveryTurns.amount})`
        );
    }

    // 7) defesa aumenta a cada turno (incremental)
    if (h.defIncreasePerTurn) {
        boss.def += h.defIncreasePerTurn;
        // opcional: mensagem curta
    }

    // 3) invisibilidade: aplica chance de ficar invisível para o próximo turno
    if (h.invisívelChance && rand(1, 100) <= h.invisívelChance) {
        boss.estado.invisivel = true;
        console.log(
            `👻 ${boss.nome} desapareceu na névoa! Fica invisível este turno.`
        );
    } else {
        boss.estado.invisivel = false;
    }

    // 6) petrificar: chance de paralisar jogador
    if (h.petrificarChance && rand(1, 100) <= h.petrificarChance) {
        jogador.petrificadoTurns = Math.max(
            jogador.petrificadoTurns || 0,
            h.petrificarTurns || 2
        );
        console.log(
            `🪨 ${boss.nome} petrificou você por ${h.petrificarTurns || 2} turnos!`
        );
    }

    // 8) invocar esqueletos a cada N turns (ex.: 2)
    if (
        h.summonSkeletonsEveryTurns &&
        t %
        (h.summonSkeletonsEveryTurns === 0 ? 1 : h.summonSkeletonsEveryTurns) ===
        0
    ) {
        // invoca 2 esqueletos
        for (let i = 0; i < 2; i++) {
            const s = {
                hp: h.summonedSkeletonHp || 12,
                dano: h.summonedSkeletonDmgBase || 3,
            };
            boss.estado.summonedSkeletons.push(s);
        }
        console.log(`☠️ ${boss.nome} invocou 2 esqueletos para auxiliar!`);
    }

    // 9) dragon breath: chance de golpe crítico garantido
    if (h.dragonBreathChance && rand(1, 100) <= h.dragonBreathChance) {
        const dmg = calcularSoproDoDragao(boss, jogador); // função abaixo
        console.log(
            `🔥 ${boss.nome} usou SOPRO DO DRAGÃO e causou ${dmg} dano crítico!`
        );
        aplicarDanoAoJogador(jogador, dmg);
        // após sopro, o boss não executa ataque normal (opcional) — aqui consideramos sopro como a ação do turno
        return;
    }

    // 10) Lorde do Caos: chance de invocar um miniBoss no meio da batalha
    if (h.canSummonMiniBoss && rand(1, 100) <= (h.summonMiniBossChance || 10)) {
        const m = criarMiniBossFn("comum", jogador.nivel); // usa sua função criarMiniBoss
        boss.estado.summonedMiniBoss = m; // armazena para o fluxo de batalha lidar
        console.log(`⚠️ ${boss.nome} invocou um mini-boss: ${m.nome}!`);
    }

    // 4 & 5 => critChanceBonus e blockChance já serão considerados quando o boss atacar
    // 7) chance de quebrar arma/armadura (aplica durante ataque do boss)
}

function calcularSoproDoDragao(boss, jogador) {
    // sopro faz "100% de dano crítico" (ou seja, aplica atk do boss * 2 ignorando defesa)
    const base = boss.atk || 0;
    // opcional: considerar defesa do jogador
    return Math.max(1, Math.floor(base * 2));
}

function aplicarDanoAoJogador(jogador, dano) {
    // considera defesa simples (você pode usar calcularDefesaTotal(jogador) se existir)
    const def = calcularDefesaTotal(jogador) || 0;
    const danoFinal = Math.max(0, dano - Math.floor(def / 5));
    jogador.hp = Math.max(0, jogador.hp - danoFinal);
}

function bossAtaca(boss, jogador) {
    // chance de crítico do boss
    const crit = boss.habilidades.critChanceBonus || 0;
    let dano = boss.atk + rand(0, 3);
    if (rand(1, 100) <= crit) {
        console.log(`💥 ${boss.nome} acertou um CRÍTICO!`);
        dano *= 2;
    }

    // chance de quebrar equipamento (Golem)
    if (
        boss.habilidades.breakEquipChance &&
        rand(1, 100) <= boss.habilidades.breakEquipChance
    ) {
        // escolhe slot aleatório equipado e remove
        const slots = Object.keys(jogador.equipamentos).filter(
            (s) => jogador.equipamentos[s]
        );
        if (slots.length > 0) {
            const s = slots[rand(0, slots.length - 1)];
            const removed = jogador.equipamentos[s];
            jogador.equipamentos[s] = null;
            console.log(
                `🔨 ${boss.nome} quebrou sua peça ${removed.nome} do slot ${s}!`
            );
        }
    }

    aplicarDanoAoJogador(jogador, dano);
    if (dano > 0) console.log(`${boss.nome} atacou e causou ${dano} de dano.`);
}

function bossOnDeath(boss, jogador) {
    if (!boss.habilidades.onDeathResurrect) return false;

    if (!boss.estado.hasResurrected) {
        // mensagem dramática e buff de retorno
        console.log(
            "Você ganhou a batalha, mas seu coração está tremendo ainda..."
        );
        // recupera 20% da vida do jogador
        const heal = Math.floor(jogador.hpMax * 0.2);
        jogador.hp = Math.min(jogador.hpMax, jogador.hp + heal);
        console.log(`💚 Você recupera ${heal} HP (20% do máximo).`);

        // ressuscita o boss com metade da vida, metade da defesa, +20% ATK, e maior chance de invocar miniboss
        boss.hp = Math.max(1, Math.floor(boss.hpMax * 0.5));
        boss.hpMax = boss.hp;
        boss.def = Math.max(0, Math.floor(boss.def / 2));
        boss.atk = Math.floor(boss.atk * 1.2);
        boss.habilidades.summonMiniBossChance =
            (boss.habilidades.summonMiniBossChance || 10) * 1.5;
        boss.estado.hasResurrected = true;

        console.log(`⚠️ ${boss.nome} retornou à batalha (meio ferido, furioso)!`);
        return true; // indicamos que boss voltou e a batalha continua
    }

    return false; // já ressuscitado antes, não reaparece
}

// === Função para criar bosses da torre com escala por nível ===
function criarBossTorre(indice, jogador) {
    const base = torreBosses[indice];
    const hp = base.hpBase + Math.floor(jogador.nivel * 5) + rand(-10, 10);
    const atk = base.atkBase + Math.floor(jogador.nivel * 1.5) + rand(0, 3);
    const def = base.defBase + Math.floor(jogador.nivel * 1);
    const xp = Math.floor(hp / 2);
    const ouro = Math.floor(hp / 3);

    // estado dinâmico do boss (turn counters, invisibilidade, etc.)
    return {
        nome: base.nome,
        hp,
        hpMax: hp,
        atk,
        def,
        xp,
        ouro,
        habilidades: base.habilidades || {},
        estado: {
            turnCounter: 0,
            invisivel: false,
            petrificadoTurns: 0,
            summonedSkeletons: [], // array de esqueletos invocados pelo boss
            hasResurrected: false, // para Lorde do Caos
        },
    };
}

// descricao: "Investigar ruínas antigas",
// historia: "As antigas pedras sussurram. Relíquias e armadilhas esperam no escuro das ruínas.",
// tipo: "raro",
// nivelMinimo: 4,
// chanceSucesso: 50,
// xp: 35,
// ouro: 30,
// item: { nome: "Fragmento Antigo", raridade: "raro" },
// chanceMiniBoss: 10,
// chanceMissaoExtra: 5,
// chanceMasmorra: 1,
// falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
// === Função para entrar na Torre do Destino com habilidades especiais dos bosses ===
function entrarNaTorre(jogador) {
    if (!jogador.talismã) {
        console.log(
            "⚠️ Você precisa do Talismã da Torre para entrar. Colete 10 Fragmentos Antigos e construa o talismã primeiro!"
        );
        return;
    }

    jogador.talismã = false;
    console.log(
        "\n🏰 Você entrou na Torre do Destino! O Talismã se desfez na entrada."
    );

    for (let i = 0; i < torreBosses.length; i++) {
        let boss = criarBossTorre(i); // Boss já escala por nível
        boss.estado = {}; // status especiais do boss
        boss.habilidades = []; // lista de habilidades especiais

        // Define habilidades de cada boss
        switch (i + 1) {
            case 1:
                boss.habilidades.push("chanceBloqueio");
                break;
            case 2:
                boss.habilidades.push("defesaCrescente");
                break;
            case 3:
                boss.habilidades.push("invisivel");
                break;
            case 4:
                boss.habilidades.push("criticoAlto");
                break;
            case 5:
                boss.habilidades.push("bloqueioCritico");
                break;
            case 6:
                boss.habilidades.push("petrificar");
                break;
            case 7:
                boss.habilidades.push("defesaQuebraArma");
                break;
            case 8:
                boss.habilidades.push("invocaEsqueletos");
                break;
            case 9:
                boss.habilidades.push("soproDragao");
                break;
            case 10:
                boss.habilidades.push("invocaMiniBoss");
                break;
        }

        console.log(
            `\n⚔️ Boss ${i + 1}: ${boss.nome} (HP: ${boss.hp}, ATK: ${boss.atk})`
        );

        const venceu = batalhaBossTorre(boss);
        if (!venceu) {
            console.log("❌ Você foi derrotado e expulso da torre!");
            return;
        }

        // Recuperação parcial de HP
        const heal = Math.floor(jogador.hpMax * 0.5);
        jogador.hp = Math.min(jogador.hpMax, jogador.hp + heal);
        console.log(`✅ Você recupera ${heal} HP após o combate.`);

        const opcao = prompt("[01] Continuar | [02] Sair da Torre: ");
        if (opcao === "2") {
            console.log("Você saiu da torre. Os bosses serão resetados!");
            return;
        }
    }

    console.log(
        "\n🎉 Você derrotou todos os bosses e salvou a princesa! FIM DE JOGO!"
    );
    process.exit();
}

// === Função de batalha para bosses da torre com habilidades especiais ===
function batalhaBossTorre(boss, jogador) {
    if (!boss.status) boss.status = [];
    let turnosDesdeUltimoEsqueleto = 0;
    let esqueletos = [];

    while (boss.hp > 0 && jogador.hp > 0) {
        console.log(
            `\nSeu HP: ${jogador.hp}/${jogador.hpMax} | ${boss.nome} HP: ${boss.hp}`
        );

        // Turno do jogador
        console.log("[1] Atacar  [2] Usar Poção  [3] Fugir");
        const escolha = prompt("Escolha: ");

        if (escolha === "1") {
            let dano = aplicarFuria(jogador, danoDoJogador());

            // Crítico e efeitos de arma
            const critTotal =
                (jogador.bonusClasse.critChance || 0) +
                (jogador.bonusRaca && jogador.bonusRaca.critChance ?
                    jogador.bonusRaca.critChance :
                    0) +
                (jogador.bonusCritico || 0);

            if (rand(1, 100) <= critTotal) {
                console.log("💥 Golpe crítico! Dano dobrado!");
                dano *= 2;
            }

            // Aplica dano ao boss
            boss.hp -= dano;
            boss.hp = Math.max(0, boss.hp);
            console.log(`Você causou ${dano} de dano ao ${boss.nome}.`);

            // Checa morte do boss
            if (boss.hp === 0) {
                // Caso especial do Lorde do Caos (boss 10)
                if (
                    boss.habilidades.includes("invocaMiniBoss") &&
                    !boss.estado.ressureito
                ) {
                    console.log(
                        "\n💔 Você derrotou o Lorde do Caos, mas seu coração ainda treme..."
                    );
                    const heal = Math.floor(jogador.hpMax * 0.2);
                    jogador.hp = Math.min(jogador.hpMax, jogador.hp + heal);
                    console.log(`Você recupera ${heal} HP.`);

                    // Lorde do Caos retorna com buffs
                    boss.hp = Math.floor(boss.hpMax / 2);
                    boss.defesa = Math.floor(boss.defesa / 2);
                    boss.atk = Math.floor(boss.atk * 1.2);
                    boss.estado.ressureito = true;
                    console.log("🔥 O Lorde do Caos retorna à batalha com mais fúria!");
                    continue;
                }

                console.log(`✅ Você derrotou ${boss.nome}!`);
                return true;
            }
        } else if (escolha === "2") {
            usarPocao();
        } else if (escolha === "3") {
            if (rand(1, 100) <= 60) {
                console.log("🏃 Você conseguiu fugir!");
                return false;
            } else {
                console.log("❌ Falha na fuga!");
            }
        } else {
            console.log("Opção inválida.");
        }

        // Aplica status do boss (sangramento, petrificação etc)
        boss.status.forEach((efeito, idx) => {
            switch (efeito.tipo) {
                case "sangramento":
                    console.log(
                        `🩸 ${boss.nome} sofre ${efeito.dano} de dano por sangramento!`
                    );
                    boss.hp -= efeito.dano;
                    efeito.duracao--;
                    if (efeito.duracao <= 0) boss.status.splice(idx, 1);
                    break;
                case "petrificado":
                    efeito.duracao--;
                    if (efeito.duracao <= 0) {
                        console.log(`✅ ${boss.nome} recuperou a mobilidade.`);
                        boss.status.splice(idx, 1);
                    }
                    break;
            }
        });

        // Turno do boss
        if (boss.hp > 0) {
            bossExecutarTurno(boss, jogador, esqueletos);
        }

        // Turno de esqueletos aliados
        esqueletos.forEach((s, idx) => {
            if (s.hp > 0) {
                console.log(`☠️ Esqueleto causa ${s.dano} de dano ao ${boss.nome}!`);
                boss.hp -= s.dano;
                boss.hp = Math.max(0, boss.hp);
            }
        });
    }

    if (jogador.hp <= 0) {
        console.log("\n💀 Você foi derrotado... Fim de jogo.");
        return false;
    }

    return true;
}

// === Verificação do Amuleto Supremo ===
function verificarAmuletoSupremo(jogador) {
    const itensNecessarios = [
        "Pena do Corvo Sombrio",
        "Gema da Escuridão",
        "Essência da Noite",
        "Escama de Dragão Azul",
        "Relíquia Brilhante",
        "Pergaminho Arcano",
        "Página Amaldiçoada",
        "Coração de Magma",
        "Máscara Sombria",
        "Flor da Aurora",
    ];

    const possuiTodos = itensNecessarios.every((item) =>
        jogador.inventario.includes(item)
    );

    if (possuiTodos && !jogador.inventario.includes("Amuleto Supremo")) {
        jogador.inventario.push("Amuleto Supremo");
        console.log("\n🔥 Você combinou todos os itens e criou o Amuleto Supremo!");
        console.log("O poder do amuleto aumenta seu ataque e defesa em 20 cada!");
        jogador.ataque += 20;
        jogador.defesa += 20;
    }
}

function aplicarPenalidade(tipo, jogador) {
    if (tipo === "ouro") {
        const perda = Math.floor(jogador.ouro * (rand(15, 20) / 100));
        jogador.ouro = Math.max(0, jogador.ouro - perda);
        return `💰 Você perdeu ${perda} de ouro!`;
    }
    if (tipo === "hp") {
        const perda = Math.floor(jogador.hp * 0.2);
        jogador.hp = Math.max(1, jogador.hp - perda);
        return `❤️ Você perdeu ${perda} de HP!`;
    }
    if (tipo === "item" && jogador.setCompleto) {
        if (rand(1, 100) <= 2) {
            const itemPerdido = jogador.removerItemAleatorio(); // retorna nome do item removido
            return `🛡️ Você perdeu uma peça do seu set: ${itemPerdido}!`;
        } else {
            return `Por sorte, não perdeu nenhum item.`;
        }
    }
    return `Sem penalidades graves desta vez.`;
}

// === Missões com drops por raridade ===
function fazerMissao(jogador) {
    const missao = missoes[rand(0, missoes.length - 1)];

    // Verificar nível mínimo
    if (jogador.nivel < missao.nivelMinimo) {
        console.log(
            `⚠ Nível insuficiente! Precisa ser pelo menos nível ${missao.nivelMinimo}.`
        );
        return;
    }

    console.log(`\n📜 Missão: ${missao.descricao}`);
    console.log(`📖 ${missao.historia}`);

    let recompensaTexto = `Chance de sucesso: ${missao.chanceSucesso}% | Recompensa: ${missao.xp} XP e ${missao.ouro} ouro`;
    if (missao.item) {
        if (typeof missao.item === "string") {
            recompensaTexto += ` + item (${missao.item})`;
        } else {
            recompensaTexto += ` + item ${missao.item.nome} [${missao.item.raridade}]`;
        }
    }
    console.log(recompensaTexto + ".");

    const confirmar = prompt("Deseja tentar a missão? (s/n) ");
    if (confirmar.toLowerCase() !== "s") {
        console.log("Missão cancelada.");
        return;
    }

    // 🔥 1% de chance de masmorra secreta
    if (rand(1, 100) <= missao.chanceMasmorra) {
        console.log(
            "⚠ Você encontrou uma MASMORRA SECRETA! Prepare-se para um desafio insano!"
        );
        // Aqui você pode chamar uma função especial para masmorra
        return;
    }

    // 🔥 10% de chance de miniboss (balanceado por tipo da missão)
    if (rand(1, 100) <= missao.chanceMiniBoss) {
        const miniboss = criarMiniBoss(missao.tipo, jogador.nivel);
        console.log(
            `⚠ Um MiniBoss apareceu: ${miniboss.nome} (HP: ${miniboss.hp}, ATK: ${miniboss.atk})`
        );
        // Aqui você pode chamar uma função para lutar com miniboss
    }

    // 🎲 Resultado da missão
    const resultado = rand(1, 100);
    if (resultado <= missao.chanceSucesso) {
        console.log("✅ Missão completada com sucesso!");
        jogador.xp += missao.xp;
        jogador.ouro += missao.ouro;

        // Entregar item (com chance por raridade)
        if (missao.item && typeof missao.item === "object") {
            const raridade = (missao.item.raridade || "comum").toLowerCase();
            let baseChance = 0;
            if (raridade === "comum") baseChance = 80;
            else if (raridade === "raro") baseChance = 50;
            else if (raridade === "lendario") baseChance = 30;

            const bonusClasse = jogador.classe === "Assassino" ? 10 : 0;
            const chanceFinal = Math.min(100, baseChance + bonusClasse);

            const rollDrop = rand(1, 100);
            if (rollDrop <= chanceFinal) {
                jogador.inventario.push(missao.item.nome);
                console.log(
                    `🎁 Você obteve o item da missão: ${
            missao.item.nome
          } (${missao.item.raridade.toUpperCase()})`
                );
                verificarAmuletoSupremo();
            } else {
                console.log("Você não conseguiu pegar o item especial da missão.");
            }
        } else if (missao.item && typeof missao.item === "string") {
            jogador.inventario.push(missao.item);
            console.log(`Você obteve o item: ${missao.item}`);
            verificarAmuletoSupremo();
        }

        // Chance extra de encontrar Poção de Cura
        if (rand(1, 100) <= 30) {
            jogador.itens.push("Poção de Cura");
            console.log("Além disso, você encontrou uma Poção de Cura!");
        }

        // Chance de missão extra
        if (rand(1, 100) <= missao.chanceMissaoExtra) {
            console.log("🔥 Uma missão extra apareceu! Continue sua aventura...");
            // Aqui pode chamar fazerMissao() novamente ou outra função
        }

        checarLevelUp();
    } else {
        console.log("❌ Falhou na missão!");
        aplicarPenalidade(missao.falha.tipo, jogador);
    }
}

// --- Descansar ---
function descansar(jogador) {
    const cura = Math.min(jogador.hpMax - jogador.hp, rand(15, 30));
    jogador.hp += cura;
    console.log(
        `\n🛌 Você descansou e recuperou ${cura} HP. (HP: ${jogador.hp}/${jogador.hpMax})`
    );
    // custo de tempo/risco: chance encontrar inimigo leve
    if (rand(1, 100) <= 20) {
        console.log("Durante o descanso você foi surpreendido!");
        batalha(criarInimigo(jogador));
    }
}

// --- Jogo principal ---
function iniciarJogo(jogador) {
    console.clear();
    console.log("=== RPG - THE LOST WORLD ===");
    console.log(
        `\nBem-vindo, ${jogador.nome}! Sua missão: ficar forte e salvar a princesa da Torre.\n`
    );
    console.log(
        `\n${colors.bright}${colors.green}✅ Personagem criado:${colors.reset} ${colors.yellow}${jogador.nome}${colors.reset} | ${colors.cyan}${jogador.raca}${colors.reset} ${colors.magenta}${jogador.classe}${colors.reset}`
    );
    console.log(
        `${colors.green}HP:${colors.reset} ${jogador.hp} | ${colors.green}ATK:${colors.reset} ${jogador.ataque} | ${colors.green}DEF:${colors.reset} ${jogador.defesa}`
    );
    let jogoAtivo = true;

    while (jogoAtivo) {
        if (jogador.hp <= 0) {
            console.log("\n💀 Você está inconsciente. Fim de jogo.");
            break;
        }

        console.log("\nO que deseja fazer agora?");
        console.log("[1] Explorar");
        console.log("[2] Fazer uma missão");
        console.log("[3] Descansar");
        console.log("[4] Status / Inventário");
        console.log("[5] Amuleto");
        console.log("[6] Loja");
        console.log("[7] Enfrentar Torre");
        console.log("[0] Sair do jogo");

        const escolha = prompt("Escolha: ");

        switch (escolha) {
            case "1":
                if (rand(1, 100) <= 90) {
                    if (jogador.nivel > 10 && rand(1, 100) <= 10) {
                        const miniboss = criarMiniBoss();
                        console.log("\n⚠️ Atenção! Um MINI-BOSS apareceu!");
                        batalha(miniboss);
                    } else {
                        inimigo = criarInimigo(jogador);
                        batalha(inimigo);
                    }
                } else {
                    console.log("Você explorou, mas não encontrou nada interessante.");
                }
                break;

            case "2":
                fazerMissao();
                break;

            case "3":
                descansar();
                break;

            case "4":
                status(jogador);
                break;

            case "5":
                menuAmuleto();
                break;

            case "6":
                abrirLoja();
                break;

            case "7":
                entrarNaTorre();
                break;

            case "0":
                console.log("Saindo do jogo. Até a próxima!");
                jogoAtivo = false;
                break;

            default:
                console.log("Escolha inválida, tente novamente.");
                break;
        }

        // Recuperação passiva
        if (jogador.hp > 0 && rand(1, 100) <= 25) {
            const regen = rand(2, 6);
            jogador.hp = Math.min(jogador.hp + regen, jogador.hpMax);
            console.log(
                `\n💚 Recuperação passiva: +${regen} HP (HP: ${jogador.hp}/${jogador.hpMax})`
            );
        }
    }

    console.log("\n--- JOGO ENCERRADO ---");
}

// Inicia o jogo
iniciarJogo(jogador);