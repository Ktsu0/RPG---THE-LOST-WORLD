import { rand } from "../jogo.js";

// --- Funções de criação de inimigos ---
export function criarInimigo(jogador) {
    const templates = [
        { nome: "Goblin", baseHp: 18, baseAtk: 4, escalaHp: 3.5, escalaAtk: 0.7 },
        {
            nome: "Lobo das Sombras",
            baseHp: 25,
            baseAtk: 6,
            escalaHp: 4.5,
            escalaAtk: 0.9,
        },
        { nome: "Bandido", baseHp: 30, baseAtk: 7, escalaHp: 5.2, escalaAtk: 1.0 },
        {
            nome: "Arauto do Pântano",
            baseHp: 28,
            baseAtk: 8,
            escalaHp: 5.5,
            escalaAtk: 1.1,
        },
        {
            nome: "Espectro Errante",
            baseHp: 34,
            baseAtk: 9,
            escalaHp: 6.0,
            escalaAtk: 1.2,
        },
        {
            nome: "Mercenário Caído",
            baseHp: 40,
            baseAtk: 11,
            escalaHp: 7.0,
            escalaAtk: 1.4,
        },
    ];

    const t = templates[rand(0, templates.length - 1)];

    const hp = Math.round(
        t.baseHp + Math.floor(jogador.nivel * t.escalaHp) + rand(-5, 5)
    );
    const atk = Math.round(
        t.baseAtk + Math.floor(jogador.nivel * t.escalaAtk) + rand(-1, 2)
    );

    return {
        nome: t.nome,
        hp,
        atk,
    };
}