import { colors } from "./../utilitarios.js";

import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });

export function criarPersonagem() {
    console.log(
        `${colors.bright}${colors.cyan}🎭 Escolha sua RAÇA:${colors.reset}`
    );
    console.log(
        `[1] ${colors.magenta}Anão${colors.reset} (${colors.green}+15 DEF${colors.reset}, ${colors.red}-3 ATK${colors.reset})`
    );
    console.log(
        `[2] ${colors.magenta}Elfo${colors.reset} (${colors.green}+20 HP${colors.reset}, ${colors.red}-2 ATK${colors.reset})`
    );
    console.log(
        `[3] ${colors.magenta}Humano${colors.reset} (${colors.white}Balanceado${colors.reset})`
    );
    console.log(
        `[4] ${colors.magenta}Morto-vivo${colors.reset} (${colors.green}+5 ATK${colors.reset}, ${colors.red}-10 HP${colors.reset})`
    );
    console.log(
        `[5] ${colors.magenta}Orc${colors.reset} (${colors.green}+8 ATK${colors.reset}, ${colors.red}-5 DEF${colors.reset})`
    );
    console.log(
        `[6] ${colors.magenta}Drow${colors.reset} (${colors.green}+10% Crítico${colors.reset}, ${colors.red}-10 HP${colors.reset})`
    );
    console.log(
        `[7] ${colors.magenta}Dragãoide${colors.reset} (${colors.green}+15 HP, +5 ATK${colors.reset}, ${colors.red}não pode usar armaduras${colors.reset})`
    );

    let racaEscolha;
    do {
        racaEscolha = prompt("Escolha sua raça (1-7): ");
    } while (!["1", "2", "3", "4", "5", "6", "7"].includes(racaEscolha));

    let raca = "",
        bonusRaca = { hp: 0, atk: 0, def: 0, critChance: 0 },
        restricoes = {};

    switch (racaEscolha) {
        case "1":
            raca = "Anão";
            bonusRaca.def = 15;
            bonusRaca.atk = -3;
            break;
        case "2":
            raca = "Elfo";
            bonusRaca.hp = 20;
            bonusRaca.atk = -2;
            break;
        case "3":
            raca = "Humano";
            break;
        case "4":
            raca = "Morto-vivo";
            bonusRaca.atk = 5;
            bonusRaca.hp = -10;
            break;
        case "5":
            raca = "Orc";
            bonusRaca.atk = 8;
            bonusRaca.def = -5;
            break;
        case "6":
            raca = "Drow";
            bonusRaca.critChance = 10;
            bonusRaca.hp = -10;
            break;
        case "7":
            raca = "Dragãoide";
            bonusRaca.hp = 15;
            bonusRaca.atk = 5;
            restricoes.semArmadura = true;
            break;
    }

    console.log(
        `\n${colors.bright}${colors.cyan}⚔ Agora escolha sua CLASSE:${colors.reset}`
    );
    console.log(
        `[1] ${colors.magenta}Arqueiro${colors.reset} (${colors.yellow}Esquiva + bônus drop de ouro${colors.reset})`
    );
    console.log(
        `[2] ${colors.magenta}Paladino${colors.reset} (${colors.yellow}Crítico + chance de bloquear ataques${colors.reset})`
    );
    console.log(
        `[3] ${colors.magenta}Assassino${colors.reset} (${colors.yellow}Sangramento + bônus drop de itens${colors.reset})`
    );
    console.log(
        `[4] ${colors.magenta}Bárbaro${colors.reset} (${colors.yellow}Fúria quando HP baixo${colors.reset})`
    );
    console.log(
        `[5] ${colors.magenta}Necromante${colors.reset} (${colors.yellow}Invocar esqueleto aliado${colors.reset})`
    );
    console.log(
        `[6] ${colors.magenta}Druida${colors.reset} (${colors.yellow}Cura 10% HP por turno + bônus esquiva${colors.reset})`
    );

    let classeEscolha;
    do {
        classeEscolha = prompt("Escolha sua classe (1-6): ");
    } while (!["1", "2", "3", "4", "5", "6"].includes(classeEscolha));

    let classe = "",
        habilidadeClasse = "",
        bonusClasse = {
            atk: 0,
            def: 0,
            dropOuro: 0,
            dropItem: 0,
            critChance: 0,
            esquiva: 0,
        };

    switch (classeEscolha) {
        case "1":
            classe = "Arqueiro";
            habilidadeClasse = "esquiva";
            bonusClasse.dropOuro = 10;
            bonusClasse.esquiva = 10;
            break;
        case "2":
            classe = "Paladino";
            habilidadeClasse = "bloqueio";
            bonusClasse.critChance = 10;
            bonusClasse.bloqueioChance = 10;
            break;
        case "3":
            classe = "Assassino";
            habilidadeClasse = "sangramento";
            bonusClasse.dropItem = 10;
            break;
        case "4":
            classe = "Bárbaro";
            habilidadeClasse = "furia";
            bonusClasse.atk = 8;
            break;
        case "5":
            classe = "Necromante";
            habilidadeClasse = "invocacao";
            bonusClasse.atk = 5;
            break;
        case "6":
            classe = "Druida";
            habilidadeClasse = "cura";
            bonusClasse.esquiva = 15;
            break;
    }

    let nome;
    do {
        nome = prompt("Digite o nome do seu personagem: ").trim();
    } while (!nome);

    let jogador = {
        nome,
        raca,
        classe,
        habilidadeClasse,
        bonusClasse,
        hp: 100 + bonusRaca.hp,
        hpMax: 100 + bonusRaca.hp,
        nivel: 1,
        xp: 0,
        ouro: 0,

        ataque: 8 + bonusRaca.atk + bonusClasse.atk,
        defesa: 5 + bonusRaca.def + bonusClasse.def,
        criticoExtra: bonusRaca.critChance || 0,
        restricoes,
        equipamentos: {
            head: null,
            chest: null,
            hands: null,
            legs: null,
            feet: null,
        },
        itens: [],
        inventario: [],
        armas: [],
        armaEquipada: null,
        amuletoEquipado: false,
    };

    return jogador;
}