import promptSync from "prompt-sync";
import { colors } from "./../utilitarios.js";
const prompt = promptSync({ sigint: true });

export const loja = [
    // --- Conjunto Ferro (Defesa Pura) ---
    {
        id: 1,
        nome: "Elmo de Ferro",
        slot: "head",
        defesa: 6,
        atkBonus: 0,
        preco: 2050,
        set: "Ferro",
        raridade: "comum",
    },
    {
        id: 2,
        nome: "Peitoral de Ferro",
        slot: "chest",
        defesa: 12,
        atkBonus: 0,
        preco: 2880,
        set: "Ferro",
        raridade: "comum",
    },
    {
        id: 3,
        nome: "Manoplas de Ferro",
        slot: "hands",
        defesa: 5,
        atkBonus: 1,
        preco: 1990,
        set: "Ferro",
        raridade: "comum",
    },
    {
        id: 4,
        nome: "Grevas de Ferro",
        slot: "legs",
        defesa: 7,
        atkBonus: 0,
        preco: 2250,
        set: "Ferro",
        raridade: "comum",
    },
    {
        id: 5,
        nome: "Botas de Ferro",
        slot: "feet",
        defesa: 4,
        atkBonus: 0,
        preco: 1850,
        set: "Ferro",
        raridade: "comum",
    },

    // --- Conjunto Ligeiro (Velocidade e Crítico) ---
    {
        id: 6,
        nome: "Capuz de Velo",
        slot: "head",
        defesa: 3,
        atkBonus: 1,
        preco: 2050,
        set: "Ligeiro",
        raridade: "comum",
    },
    {
        id: 7,
        nome: "Túnica Ligeira",
        slot: "chest",
        defesa: 6,
        atkBonus: 2,
        preco: 2910,
        set: "Ligeiro",
        raridade: "raro",
    },
    {
        id: 8,
        nome: "Luvas Leves",
        slot: "hands",
        defesa: 2,
        atkBonus: 2,
        preco: 1850,
        set: "Ligeiro",
        raridade: "comum",
    },
    {
        id: 9,
        nome: "Calças Ligeiras",
        slot: "legs",
        defesa: 4,
        atkBonus: 1,
        preco: 2050,
        set: "Ligeiro",
        raridade: "comum",
    },
    {
        id: 10,
        nome: "Botas Ágeis",
        slot: "feet",
        defesa: 3,
        atkBonus: 1,
        preco: 1950,
        set: "Ligeiro",
        raridade: "comum",
    },

    // --- Conjunto Sombra (Crítico e Evasão) ---
    {
        id: 11,
        nome: "Máscara das Sombras",
        slot: "head",
        defesa: 4,
        atkBonus: 2,
        preco: 5450,
        set: "Sombra",
        raridade: "raro",
    },
    {
        id: 12,
        nome: "Peitoral das Sombras",
        slot: "chest",
        defesa: 8,
        atkBonus: 3,
        preco: 5960,
        set: "Sombra",
        raridade: "raro",
    },
    {
        id: 13,
        nome: "Luvas das Sombras",
        slot: "hands",
        defesa: 3,
        atkBonus: 2,
        preco: 5350,
        set: "Sombra",
        raridade: "raro",
    },
    {
        id: 14,
        nome: "Calças das Sombras",
        slot: "legs",
        defesa: 5,
        atkBonus: 2,
        preco: 5610,
        set: "Sombra",
        raridade: "raro",
    },
    {
        id: 15,
        nome: "Botas das Sombras",
        slot: "feet",
        defesa: 4,
        atkBonus: 2,
        preco: 5580,
        set: "Sombra",
        raridade: "raro",
    },

    // --- Conjunto Dragão (Poder Extremo) ---
    {
        id: 16,
        nome: "Elmo do Dragão",
        slot: "head",
        defesa: 12,
        atkBonus: 5,
        preco: 15510,
        set: "Dragão",
        raridade: "lendario",
    },
    {
        id: 17,
        nome: "Peitoral do Dragão",
        slot: "chest",
        defesa: 20,
        atkBonus: 7,
        preco: 17510,
        set: "Dragão",
        raridade: "lendario",
    },
    {
        id: 18,
        nome: "Manoplas do Dragão",
        slot: "hands",
        defesa: 8,
        atkBonus: 4,
        preco: 14950,
        set: "Dragão",
        raridade: "lendario",
    },
    {
        id: 19,
        nome: "Grevas do Dragão",
        slot: "legs",
        defesa: 12,
        atkBonus: 4,
        preco: 15810,
        set: "Dragão",
        raridade: "lendario",
    },
    {
        id: 20,
        nome: "Botas do Dragão",
        slot: "feet",
        defesa: 10,
        atkBonus: 3,
        preco: 14900,
        set: "Dragão",
        raridade: "lendario",
    },

    // Consumíveis
    {
        id: 21,
        nome: "Poção de Cura",
        slot: "consumable",
        defesa: 0,
        atkBonus: 0,
        preco: 200,
        set: null,
        raridade: "comum",
    },
];

// === Armas Disponíveis ===
export const armasDisponiveis = [{
        id: 1,
        nome: "Espada Longa",
        slot: "weapon",
        preco: 2500,
        atk: 5,
        efeito: null,
        raridade: "comum",
    },
    {
        id: 2,
        nome: "Arco Élfico",
        slot: "weapon",
        preco: 5000,
        atk: 4,
        efeito: {
            tipo: "esquiva",
            chance: 10,
        },
        raridade: "raro",
    },
    {
        id: 3,
        nome: "Adaga Sombria",
        slot: "weapon",
        preco: 6500,
        atk: 6,
        efeito: {
            tipo: "sangramento",
            chance: 20,
            danoPorTurno: 5,
            duracao: 3,
        },
        raridade: "raro",
    },
    {
        id: 4,
        nome: "Martelo de Guerra",
        slot: "weapon",
        preco: 7200,
        atk: 8,
        efeito: {
            tipo: "bloqueio",
            chance: 20,
        },
        raridade: "raro",
    },
    {
        id: 7,
        nome: "Cajado do Caos",
        slot: "weapon",
        preco: 7800,
        atk: 7,
        efeito: {
            tipo: "confusao",
            chance: 25,
            duracao: 1,
        },
        raridade: "raro",
    },
    {
        id: 8,
        nome: "Cajado Congelante",
        slot: "weapon",
        preco: 8500,
        atk: 6,
        efeito: {
            tipo: "congelamento",
            chance: 15,
            duracao: 1,
        },
        raridade: "raro",
    },
    {
        id: 9,
        nome: "Machado Flamejante",
        slot: "weapon",
        preco: 9200,
        atk: 9,
        efeito: {
            tipo: "incendio",
            chance: 25,
            danoPorTurno: 7,
            duracao: 3,
        },
        raridade: "lendario",
    },
    {
        id: 5,
        nome: "Lança Sagrada",
        slot: "weapon",
        preco: 10000,
        atk: 10,
        efeito: {
            tipo: "critico",
            chance: 15,
        },
        raridade: "lendario",
    },
    {
        id: 10,
        nome: "Punhais Gêmeos",
        slot: "weapon",
        preco: 11500,
        atk: 5,
        efeito: {
            tipo: "ataque_duplo",
            chance: 20,
        },
        raridade: "lendario",
    },
    {
        id: 6,
        nome: "Foice do Ceifador",
        slot: "weapon",
        preco: 12500,
        atk: 12,
        efeito: {
            tipo: "roubo_de_vida",
            percentual: 0.15,
        },
        raridade: "lendario",
    },
];

function mostrarBonusDoSet(set) {
    switch (set) {
        case "Ferro":
            return "+15% chance de bloquear ataque!";
        case "Ligeiro":
            return "+15% esquiva!";
        case "Sombra":
            return "+10% crítico e +10% esquiva!";
        case "Dragão":
            return "+10% HP e +10% ATK!";
        default:
            return "Nenhum bônus especial.";
    }
}

// Adicione esta função em seu arquivo, idealmente no topo.
export function getRaridadeCor(raridade) {
    switch (raridade) {
        case "comum":
            return colors.green; // Cinza para itens comuns
        case "raro":
            return colors.blue; // Azul para itens raros
        case "lendario":
            return colors.yellow; // Amarelo para itens lendarios
        default:
            return colors.reset; // Cor padrão
    }
}

export function abrirLoja(jogador) {
    let sairLoja = false;

    while (!sairLoja) {
        console.log(`\n🏪 ${colors.bright}Bem-vindo à Loja!${colors.reset}`);
        console.log(
            `Você tem ${colors.yellow}${jogador.ouro}${colors.reset} de ouro`
        );
        console.log("O que deseja comprar?");
        console.log(`${colors.cyan}[1] Armaduras`);
        console.log(`${colors.cyan}[2] Armas`);
        console.log(`🚪 ${colors.red}[0] Sair${colors.reset}`);

        const escolha = prompt("Escolha: ");

        if (escolha === "1") {
            // --- Armaduras ---
            let voltarConjuntos = false;
            while (!voltarConjuntos) {
                const conjuntos = [
                    ...new Set(
                        loja.filter((i) => i.slot !== "consumable").map((i) => i.set)
                    ),
                ];

                console.log(
                    `Você tem ${colors.yellow}${jogador.ouro}${colors.reset} de ouro`
                );
                console.log(`\n${colors.bright}Conjuntos disponíveis:${colors.reset}`);
                conjuntos.forEach((set, i) => {
                    // Obtém a raridade do conjunto para a cor
                    const raridadeSet = loja.find((item) => item.set === set).raridade;
                    const cor = getRaridadeCor(raridadeSet);
                    console.log(`[${i + 1}] ${cor}${set}${colors.reset}`);
                });
                console.log(`[0] Voltar`);

                const setEscolhaRaw = prompt(
                    "Escolha o conjunto pelo número ou digite o nome: "
                );
                const setEscolhaNum = parseInt(setEscolhaRaw);
                let setNome;

                if (!isNaN(setEscolhaNum) &&
                    setEscolhaNum > 0 &&
                    setEscolhaNum <= conjuntos.length
                ) {
                    setNome = conjuntos[setEscolhaNum - 1];
                } else if (setEscolhaRaw === "0") {
                    voltarConjuntos = true;
                    continue;
                } else {
                    setNome = setEscolhaRaw;
                }

                const pecas = loja.filter(
                    (i) => i.set === setNome && i.slot !== "consumable"
                );
                if (pecas.length === 0) {
                    console.log("Conjunto inválido!");
                    continue;
                }

                // --- Menu das peças ---
                let voltarPecas = false;
                while (!voltarPecas) {
                    console.log(
                        `\n${
              colors.dim
            }⚠ Complete o conjunto ${setNome} para ganhar bônus: ${mostrarBonusDoSet(
              setNome
            )}${colors.reset}`
                    );
                    console.log(
                        `Você tem ${colors.yellow}${jogador.ouro}${colors.reset} de ouro`
                    );
                    console.log(
                        `\n${colors.bright}Peças disponíveis do conjunto ${setNome}:${colors.reset}`
                    );
                    pecas.forEach((p, i) => {
                        const cor = getRaridadeCor(p.raridade);
                        console.log(
                            `[${i + 1}] ${cor}${p.slot.toUpperCase()}: ${p.nome}${
                colors.reset
              } (${colors.magenta}+${p.defesa} DEF, +${p.atkBonus} ATK) - ${
                colors.yellow
              }${p.preco}${colors.reset} ouro`
                        );
                    });
                    console.log("[0] Voltar");

                    const pecaEscolhaRaw = prompt("Escolha a peça pelo número: ");
                    const pecaEscolha = parseInt(pecaEscolhaRaw);

                    if (pecaEscolha === 0) {
                        voltarPecas = true;
                        continue;
                    }

                    const itemEscolhido = pecas[pecaEscolha - 1];
                    if (!itemEscolhido) {
                        console.log("Peça inválida!");
                        continue;
                    }

                    if (jogador.ouro >= itemEscolhido.preco) {
                        jogador.ouro -= itemEscolhido.preco;
                        jogador.equipamentos[itemEscolhido.slot] = itemEscolhido;
                        console.log(`✅ Você comprou e equipou: ${itemEscolhido.nome}`);
                    } else {
                        console.log("Ouro insuficiente!");
                    }
                } // fim do menu peças
            } // fim do menu conjuntos
        } else if (escolha === "2") {
            // --- Armas ---
            let voltarArmas = false;
            while (!voltarArmas) {
                console.log(
                    `\nVocê tem ${colors.yellow}${jogador.ouro}${colors.reset} de ouro`
                );
                console.log(`⚔ ${colors.bright}Armas disponíveis:${colors.reset}`);
                armasDisponiveis.forEach((arma, i) => {
                            const cor = getRaridadeCor(arma.raridade);
                            console.log(
                                    `[${i + 1}] ${cor}${arma.nome}${colors.reset} (${colors.magenta}+${
              arma.atk
            } ATK) ${colors.cyan}${
              arma.efeito ? `(Efeito: ${arma.efeito.tipo})` : ""
            } - ${colors.yellow}${arma.preco}${colors.reset} ouro`
          );
        });
        console.log("[0] Voltar");

        const armaEscolhaRaw = prompt("Escolha a arma pelo número: ");
        const armaEscolha = parseInt(armaEscolhaRaw);

        if (armaEscolha === 0) {
          voltarArmas = true;
          continue;
        }

        const arma = armasDisponiveis[armaEscolha - 1];
        if (!arma) {
          console.log("Escolha inválida!");
          continue;
        }

        if (jogador.ouro >= arma.preco) {
          jogador.ouro -= arma.preco;
          jogador.armas.push(arma);
          jogador.armaEquipada = arma;
          console.log(
            `✅ Você comprou e equipou: ${arma.nome} (+${arma.atk} ATK)`
          );
        } else {
          console.log("Ouro insuficiente!");
        }
      } // fim menu armas
    } else if (escolha === "0") {
      sairLoja = true;
      console.log("Saindo da loja.");
    } else {
      console.log("Escolha inválida!");
    }
  } // fim loop principal da loja
}