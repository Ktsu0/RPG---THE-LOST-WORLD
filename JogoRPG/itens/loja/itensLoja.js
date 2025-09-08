import promptSync from "prompt-sync";

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
        raridade: "lendário",
    },
    {
        id: 17,
        nome: "Peitoral do Dragão",
        slot: "chest",
        defesa: 20,
        atkBonus: 7,
        preco: 17510,
        set: "Dragão",
        raridade: "lendário",
    },
    {
        id: 18,
        nome: "Manoplas do Dragão",
        slot: "hands",
        defesa: 8,
        atkBonus: 4,
        preco: 14950,
        set: "Dragão",
        raridade: "lendário",
    },
    {
        id: 19,
        nome: "Grevas do Dragão",
        slot: "legs",
        defesa: 12,
        atkBonus: 4,
        preco: 15810,
        set: "Dragão",
        raridade: "lendário",
    },
    {
        id: 20,
        nome: "Botas do Dragão",
        slot: "feet",
        defesa: 10,
        atkBonus: 3,
        preco: 14900,
        set: "Dragão",
        raridade: "lendário",
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
const armasDisponiveis = [{
        nome: "Espada Longa",
        preco: 1050,
        atk: 5,
        efeito: null,
        raridade: "comum",
    },
    {
        nome: "Arco Elfico",
        preco: 1620,
        atk: 4,
        efeito: "esquiva",
        raridade: "raro",
    },
    {
        nome: "Adaga Sombria",
        preco: 1790,
        atk: 6,
        efeito: "sangramento",
        raridade: "raro",
    },
    {
        nome: "Martelo de Guerra",
        preco: 1910,
        atk: 8,
        efeito: "bloqueio",
        raridade: "raro",
    },
    {
        nome: "Lança Sagrada",
        preco: 2050,
        atk: 10,
        efeito: "critico",
        raridade: "lendario",
    },
];

function mostrarBonusDoSet(set) {
    switch (set) {
        case "Ferro":
            return "+10% chance de bloquear ataque!";
        case "Ligeiro":
            return "+15% esquiva!";
        case "Sombra":
            return "+10% crítico e +10% esquiva!";
        case "Dragão":
            return "+20% HP e +20% ATK!";
        default:
            return "Nenhum bônus especial.";
    }
}

export function abrirLoja() {
    let sairLoja = false;

    while (!sairLoja) {
        console.log("\n🏪 Bem-vindo à Loja!");
        console.log(`Você tem ${jogador.ouro} de ouro`);
        console.log("O que deseja comprar?");
        console.log("[1] Armaduras");
        console.log("[2] Armas");
        console.log("[0] Sair");

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

                console.log(`Você tem ${jogador.ouro} de ouro`);
                console.log("\nConjuntos disponíveis:");
                conjuntos.forEach((set, i) => console.log(`[${i + 1}] ${set}`));
                console.log("[0] Voltar");

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
                    voltarConjuntos = true; // volta para o menu principal
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
                        `\n⚠ Complete o conjunto ${setNome} para ganhar bônus: ${mostrarBonusDoSet(
              setNome
            )}`
                    );
                    console.log(`Você tem ${jogador.ouro} de ouro`);
                    console.log(`\nPeças disponíveis do conjunto ${setNome}:`);
                    pecas.forEach((p, i) => {
                        console.log(
                            `[${i + 1}] ${p.slot.toUpperCase()}: ${p.nome} (+${
                p.defesa
              } DEF, +${p.atkBonus} ATK) - ${p.preco} ouro`
                        );
                    });
                    console.log("[0] Voltar");

                    const pecaEscolhaRaw = prompt("Escolha a peça pelo número: ");
                    const pecaEscolha = parseInt(pecaEscolhaRaw);

                    if (pecaEscolha === 0) {
                        voltarPecas = true; // volta para menu de conjuntos
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
                console.log(`\nVocê tem ${jogador.ouro} de ouro`);
                console.log("⚔ Armas disponíveis:");
                armasDisponiveis.forEach((arma, i) => {
                            console.log(
                                    `[${i + 1}] ${arma.nome} (+${arma.atk} ATK) ${
              arma.efeito ? `(Efeito: ${arma.efeito})` : ""
            } - ${arma.preco} ouro`
          );
        });
        console.log("[0] Voltar");

        const armaEscolhaRaw = prompt("Escolha a arma pelo número: ");
        const armaEscolha = parseInt(armaEscolhaRaw);

        if (armaEscolha === 0) {
          voltarArmas = true; // volta para o menu principal
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