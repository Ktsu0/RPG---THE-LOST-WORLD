import "./estilos/variaveis.css";
import "./estilos/base.css";
import "./estilos/paineis.css";
import "./estilos/batalha.css";
import { inicializarRoteador, registrarTela, mostrarTela } from "./rotas/roteador.js";
import { montarTelaInicial } from "./telas/inicial.js";

const app = document.getElementById("app");
inicializarRoteador(app);
registrarTela("inicial", montarTelaInicial);
mostrarTela("inicial");
