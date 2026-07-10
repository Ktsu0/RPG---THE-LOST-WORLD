import { obterRaca } from "./racas.js";
import { obterClasse } from "./classes.js";

export function validarNome(nome) {
  return typeof nome === "string" && nome.trim().length > 0;
}

export function calcularAtributosIniciais(racaNome, classeNome) {
  const { bonus: bonusRaca } = obterRaca(racaNome);
  const { bonus: bonusClasse } = obterClasse(classeNome);
  return {
    hp: 100 + bonusRaca.hp,
    hpMax: 100 + bonusRaca.hp,
    ataque: 5 + bonusRaca.atk + bonusClasse.atk,
    defesa: 5 + bonusRaca.def + bonusClasse.def,
  };
}

export function criarPersonagem({ nome, racaNome, classeNome }) {
  if (!validarNome(nome)) {
    throw new Error("Nome do personagem não pode ser vazio.");
  }
  const raca = obterRaca(racaNome);
  const classe = obterClasse(classeNome);
  const atributos = calcularAtributosIniciais(racaNome, classeNome);

  return {
    nome: nome.trim(),
    raca: raca.nome,
    classe: classe.nome,
    habilidadeClasse: classe.bonus.habilidade,
    bonusClasse: classe.bonus,
    hp: atributos.hp,
    hpMax: atributos.hpMax,
    nivel: 1,
    xp: 0,
    ouro: 50,
    ataque: atributos.ataque,
    defesa: atributos.defesa,
    bonusRaca: raca.bonus,
    restricoes: raca.restricoes,
    equipamentos: { head: null, chest: null, hands: null, legs: null, feet: null },
    itens: [],
    inventario: [],
    armas: [],
    armaEquipada: null,
    amuletoEquipado: false,
    status: [],
    ativarHistoria: true,
  };
}
