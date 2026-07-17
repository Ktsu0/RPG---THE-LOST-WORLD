class_name Ondas
extends RefCounted

## Porte de engine/missoes/ondas.js.

const TOTAL_ONDAS := 10

static func criar_estado_ondas(jogador: Dictionary) -> Dictionary:
	return {"jogador": jogador, "onda": 1, "fragmentosGanhos": 0}

static func avancar_onda(estado: Dictionary) -> Dictionary:
	var jogador: Dictionary = estado["jogador"]
	var fragmento_ganho: bool = Aleatorio.rand(1, 100) <= 5
	var fragmentos_ganhos: int = estado["fragmentosGanhos"] + (1 if fragmento_ganho else 0)

	jogador["hp"] = mini(jogador["hpMax"], floori(jogador["hp"] + jogador["hpMax"] * 0.1))

	var sequencia_completa: bool = estado["onda"] >= TOTAL_ONDAS
	var novo_estado: Dictionary = {"jogador": jogador, "onda": estado["onda"] + 1, "fragmentosGanhos": fragmentos_ganhos}

	return {"estado": novo_estado, "ondaVencida": true, "fragmentoGanho": fragmento_ganho, "sequenciaCompleta": sequencia_completa}
