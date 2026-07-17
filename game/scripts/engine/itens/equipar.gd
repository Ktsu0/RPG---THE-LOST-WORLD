class_name Equipar
extends RefCounted

## Porte de engine/itens/equipar.js.

static func _aplicar_bonus_ferro(jogador: Dictionary) -> void:
	jogador["bonusBloqueio"] += 15

static func _aplicar_bonus_ligeiro(jogador: Dictionary) -> void:
	jogador["bonusEsquiva"] += 15

static func _aplicar_bonus_sombra(jogador: Dictionary) -> void:
	jogador["bonusEsquiva"] += 10
	jogador["bonusCritico"] += 10

static func _aplicar_bonus_dragao(jogador: Dictionary) -> void:
	jogador["bonusHP"] += 10
	jogador["bonusAtk"] += 10

static func aplicar_bonus_de_conjunto(jogador: Dictionary) -> void:
	jogador["bonusEsquiva"] = 0
	jogador["bonusCritico"] = 0
	jogador["bonusBloqueio"] = 0
	jogador["bonusHP"] = 0
	jogador["bonusAtk"] = 0

	var sets_equipados: Dictionary = {}
	var equipamentos: Dictionary = jogador["equipamentos"]
	for slot in equipamentos.keys():
		var item = equipamentos[slot]
		if item != null and item.get("set") != null:
			var set_nome = item["set"]
			sets_equipados[set_nome] = sets_equipados.get(set_nome, 0) + 1

	for set_nome in sets_equipados.keys():
		if sets_equipados[set_nome] == 5:
			match set_nome:
				"Ferro": _aplicar_bonus_ferro(jogador)
				"Ligeiro": _aplicar_bonus_ligeiro(jogador)
				"Sombra": _aplicar_bonus_sombra(jogador)
				"Dragão": _aplicar_bonus_dragao(jogador)

static func equipar_armadura_no_slot(jogador: Dictionary, armadura: Dictionary) -> Dictionary:
	var equipamentos: Dictionary = jogador["equipamentos"]
	var item_antigo = equipamentos.get(armadura["slot"])
	equipamentos[armadura["slot"]] = armadura
	aplicar_bonus_de_conjunto(jogador)
	return {"itemAntigo": item_antigo}

static func equipar_arma(jogador: Dictionary, arma: Dictionary) -> Dictionary:
	var item_antigo = jogador.get("armaEquipada")
	jogador["armaEquipada"] = arma
	return {"itemAntigo": item_antigo}

static func comparar_atributos(item_atual: Variant, item_novo: Dictionary) -> Dictionary:
	var defesa_atual: int = 0
	var atk_atual: int = 0
	if item_atual != null:
		defesa_atual = item_atual.get("defesa", 0)
		atk_atual = item_atual.get("atkBonus", 0)
	var defesa_novo: int = item_novo.get("defesa", 0)
	var atk_novo: int = item_novo.get("atkBonus", 0)
	return {
		"defesa": defesa_novo - defesa_atual,
		"atkBonus": atk_novo - atk_atual,
	}
