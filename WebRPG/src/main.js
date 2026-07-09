import "./estilos/variaveis.css";
import "./estilos/base.css";
import "./estilos/paineis.css";
import "./estilos/batalha.css";
import { inicializarRoteador, registrarTela, mostrarTela } from "./rotas/roteador.js";
import { montarTelaInicial } from "./telas/inicial.js";
import { iniciarBatalha } from "./telas/batalha/controladorBatalha.js";

const jogadorDeTeste = {
  nome: "Soldado",
  nivel: 3,
  ataque: 12,
  defesa: 6,
  hp: 100,
  hpMax: 100,
  xp: 0,
  ouro: 0,
  classe: "Guerreiro",
  equipamentos: {},
  armaEquipada: {
    nome: "Adaga Sombria",
    atk: 2,
    efeito: { tipo: "sangramento", chance: 60, duracao: 3, danoPorTurno: 4 },
  },
  bonusClasse: {},
  bonusRaca: {},
  bonusCritico: 10,
  bonusEsquiva: 0,
  bonusBloqueio: 0,
  bonusAtk: 0,
  bonusDef: 0,
  status: [],
};

const orcDeTeste = {
  nome: "Orc",
  atk: 9,
  defesa: 3,
  hp: 40,
  hpMax: 40,
  xp: 18,
  ouro: 15,
  habilidade: "envenenamento",
  status: [],
};

const app = document.getElementById("app");
inicializarRoteador(app);
registrarTela("inicial", montarTelaInicial);
registrarTela("batalha", (container) => iniciarBatalha(container, jogadorDeTeste, orcDeTeste));
mostrarTela("batalha");
