class_name Necromante
extends RefCounted

## Porte de engine/personagem/necromante.js.

static func deve_invocar_esqueleto(jogador: Dictionary, rodada: int) -> bool:
	return jogador["classe"] == "Necromante" and rodada % 4 == 0

static func quantidade_de_esqueletos() -> int:
	var roll: int = Aleatorio.rand(1, 100)
	if roll <= 95:
		return 1
	if roll <= 98:
		return 2
	if roll <= 99:
		return 3
	return 4

static func criar_esqueleto(jogador: Dictionary) -> Dictionary:
	return {
		"hp": 15 + floori(jogador["nivel"] * 1.5),
		"atk": 5 + floori(jogador["nivel"] * 0.5),
	}

static func ataque_esqueletos(inimigo: Dictionary, esqueletos: Array[Dictionary]) -> int:
	var total := 0
	for esq in esqueletos:
		total += esq["atk"]
	inimigo["hp"] = maxi(0, inimigo["hp"] - total)
	return total

static func absorver_dano_com_esqueletos(esqueletos: Array[Dictionary], dano: int) -> Dictionary:
	if esqueletos.is_empty():
		return {"esqueletos": esqueletos, "danoRestante": dano}

	var primeiro: Dictionary = esqueletos[0]
	var resto: Array[Dictionary] = esqueletos.slice(1)
	var novo_primeiro: Dictionary = primeiro.duplicate()
	novo_primeiro["hp"] = primeiro["hp"] - dano

	var nova_fila: Array[Dictionary] = []
	if novo_primeiro["hp"] > 0:
		nova_fila.append(novo_primeiro)
	nova_fila.append_array(resto)
	return {"esqueletos": nova_fila, "danoRestante": 0}
