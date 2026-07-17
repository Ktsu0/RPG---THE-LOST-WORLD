class_name AmuletoTalisma
extends RefCounted

## Porte de engine/itens/amuletoTalisma.js.

const REQUISITOS_AMULETO: Array[Dictionary] = [
	{"nome": "Pena do Corvo Sombrio", "quantidade": 5},
	{"nome": "Pergaminho Arcano", "quantidade": 5},
	{"nome": "Essência da Noite", "quantidade": 2},
	{"nome": "Relíquia Brilhante", "quantidade": 2},
	{"nome": "Gema da Escuridão", "quantidade": 1},
]

const PRECO_TALISMA := {"fragmentos": 10, "ouro": 2000}

static func pode_craftar_amuleto(inventario: Array) -> bool:
	for req in REQUISITOS_AMULETO:
		var quantidade := 0
		for item in inventario:
			if item == req["nome"]:
				quantidade += 1
		if quantidade < req["quantidade"]:
			return false
	return true

static func craftar_amuleto(jogador: Dictionary) -> void:
	for req in REQUISITOS_AMULETO:
		var restante: int = req["quantidade"]
		var nova_lista: Array = []
		for item in jogador["inventario"]:
			if item == req["nome"] and restante > 0:
				restante -= 1
			else:
				nova_lista.append(item)
		jogador["inventario"] = nova_lista
	jogador["amuletoCraftado"] = true

static func alternar_amuleto(jogador: Dictionary) -> void:
	if not jogador["amuletoEquipado"]:
		jogador["_ataqueAntesDoAmuleto"] = jogador["ataque"]
		jogador["_hpMaxAntesDoAmuleto"] = jogador["hpMax"]
		jogador["ataque"] = floori(jogador["ataque"] * 1.05)
		jogador["hpMax"] = floori(jogador["hpMax"] * 1.1)
		jogador["hp"] = jogador["hpMax"]
		jogador["amuletoEquipado"] = true
	else:
		jogador["ataque"] = jogador["_ataqueAntesDoAmuleto"]
		jogador["hpMax"] = jogador["_hpMaxAntesDoAmuleto"]
		jogador["hp"] = mini(jogador["hp"], jogador["hpMax"])
		jogador["amuletoEquipado"] = false

static func pode_craftar_talisma(jogador: Dictionary) -> bool:
	var fragmentos := 0
	for item in jogador["inventario"]:
		if item == "Fragmento Antigo":
			fragmentos += 1
	return fragmentos >= PRECO_TALISMA["fragmentos"] and jogador["ouro"] >= PRECO_TALISMA["ouro"]

static func craftar_talisma(jogador: Dictionary) -> void:
	var restante: int = PRECO_TALISMA["fragmentos"]
	var nova_lista: Array = []
	for item in jogador["inventario"]:
		if item == "Fragmento Antigo" and restante > 0:
			restante -= 1
		else:
			nova_lista.append(item)
	jogador["inventario"] = nova_lista
	jogador["ouro"] -= PRECO_TALISMA["ouro"]
	jogador["inventario"].append("Talismã da Torre")
