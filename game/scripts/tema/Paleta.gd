extends Node

## Paleta oficial do jogo — mesmos valores hexadecimais de
## WebRPG/src/estilos/variaveis.css, preservados na migração para Godot.

const FUNDO := Color("#14121a")
const FUNDO_PAINEL := Color("#1f1c29")
const BORDA := Color("#3a3450")
const TEXTO := Color("#e8e3f0")
const TEXTO_FRACO := Color("#a89fc2")
const DESTAQUE := Color("#d4af37")
const PERIGO := Color("#d64545")
const SUCESSO := Color("#4caf6d")
const COR_HP := Color("#d64545")
const COR_MP := Color("#4a7fd6")
const BARRA_VAZIA := Color("#2a2635")

## Mapeamento de raridade → cor, usado identicamente em loja, inventário,
## drops e tooltips (mesma regra de engine/itens/raridade.js).
func cor_raridade(raridade: String) -> Color:
	match raridade:
		"comum": return SUCESSO
		"raro": return COR_MP
		"lendario": return DESTAQUE
		_: return TEXTO
