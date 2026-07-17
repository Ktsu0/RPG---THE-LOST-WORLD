class_name Catalogo
extends RefCounted

## Porte de engine/itens/catalogo.js.

const CONJUNTOS_ARMADURA := {
	"Ferro": [
		{"nome": "Elmo de Ferro", "slot": "head", "defesa": 6, "atkBonus": 0, "preco": 2050, "raridade": "comum"},
		{"nome": "Peitoral de Ferro", "slot": "chest", "defesa": 12, "atkBonus": 0, "preco": 2880, "raridade": "comum"},
		{"nome": "Manoplas de Ferro", "slot": "hands", "defesa": 5, "atkBonus": 1, "preco": 1990, "raridade": "comum"},
		{"nome": "Grevas de Ferro", "slot": "legs", "defesa": 7, "atkBonus": 0, "preco": 2250, "raridade": "comum"},
		{"nome": "Botas de Ferro", "slot": "feet", "defesa": 4, "atkBonus": 0, "preco": 1850, "raridade": "comum"},
	],
	"Ligeiro": [
		{"nome": "Capuz de Velo", "slot": "head", "defesa": 3, "atkBonus": 1, "preco": 2050, "raridade": "comum"},
		{"nome": "Túnica Ligeira", "slot": "chest", "defesa": 6, "atkBonus": 2, "preco": 2910, "raridade": "raro"},
		{"nome": "Luvas Leves", "slot": "hands", "defesa": 2, "atkBonus": 2, "preco": 1850, "raridade": "comum"},
		{"nome": "Calças Ligeiras", "slot": "legs", "defesa": 4, "atkBonus": 1, "preco": 2050, "raridade": "comum"},
		{"nome": "Botas Ágeis", "slot": "feet", "defesa": 3, "atkBonus": 1, "preco": 1950, "raridade": "comum"},
	],
	"Sombra": [
		{"nome": "Máscara das Sombras", "slot": "head", "defesa": 4, "atkBonus": 2, "preco": 5450, "raridade": "raro"},
		{"nome": "Peitoral das Sombras", "slot": "chest", "defesa": 8, "atkBonus": 3, "preco": 5960, "raridade": "raro"},
		{"nome": "Luvas das Sombras", "slot": "hands", "defesa": 3, "atkBonus": 2, "preco": 5350, "raridade": "raro"},
		{"nome": "Calças das Sombras", "slot": "legs", "defesa": 5, "atkBonus": 2, "preco": 5610, "raridade": "raro"},
		{"nome": "Botas das Sombras", "slot": "feet", "defesa": 4, "atkBonus": 2, "preco": 5580, "raridade": "raro"},
	],
	"Dragão": [
		{"nome": "Elmo do Dragão", "slot": "head", "defesa": 12, "atkBonus": 5, "preco": 15510, "raridade": "lendario"},
		{"nome": "Peitoral do Dragão", "slot": "chest", "defesa": 20, "atkBonus": 7, "preco": 17510, "raridade": "lendario"},
		{"nome": "Manoplas do Dragão", "slot": "hands", "defesa": 8, "atkBonus": 4, "preco": 14950, "raridade": "lendario"},
		{"nome": "Grevas do Dragão", "slot": "legs", "defesa": 12, "atkBonus": 4, "preco": 15810, "raridade": "lendario"},
		{"nome": "Botas do Dragão", "slot": "feet", "defesa": 10, "atkBonus": 3, "preco": 14900, "raridade": "lendario"},
	],
}

const CATALOGO_ARMAS: Array[Dictionary] = [
	{"nome": "Espada Longa", "slot": "weapon", "atk": 5, "preco": 2500, "efeito": null, "raridade": "comum"},
	{"nome": "Arco Élfico", "slot": "weapon", "atk": 4, "preco": 5000, "efeito": {"tipo": "esquiva", "chance": 10}, "raridade": "raro"},
	{"nome": "Adaga Sombria", "slot": "weapon", "atk": 6, "preco": 6500, "efeito": {"tipo": "sangramento", "chance": 20, "danoPorTurno": 5, "duracao": 3}, "raridade": "raro"},
	{"nome": "Martelo de Guerra", "slot": "weapon", "atk": 8, "preco": 7200, "efeito": {"tipo": "bloqueio", "chance": 20}, "raridade": "raro"},
	{"nome": "Cajado do Caos", "slot": "weapon", "atk": 7, "preco": 7800, "efeito": {"tipo": "confusao", "chance": 25, "duracao": 1}, "raridade": "raro"},
	{"nome": "Cajado Congelante", "slot": "weapon", "atk": 6, "preco": 8500, "efeito": {"tipo": "congelamento", "chance": 15, "duracao": 1}, "raridade": "raro"},
	{"nome": "Machado Flamejante", "slot": "weapon", "atk": 9, "preco": 9200, "efeito": {"tipo": "incendio", "chance": 25, "danoPorTurno": 7, "duracao": 3}, "raridade": "lendario"},
	{"nome": "Lança Sagrada", "slot": "weapon", "atk": 10, "preco": 10000, "efeito": {"tipo": "critico", "chance": 15}, "raridade": "lendario"},
	{"nome": "Punhais Gêmeos", "slot": "weapon", "atk": 5, "preco": 11500, "efeito": {"tipo": "ataque_duplo", "chance": 20}, "raridade": "lendario"},
	{"nome": "Foice do Ceifador", "slot": "weapon", "atk": 12, "preco": 12500, "efeito": {"tipo": "roubo_de_vida", "percentual": 0.15}, "raridade": "lendario"},
]

const CATALOGO_CONSUMIVEIS: Array[Dictionary] = [
	{"nome": "Poção de Cura", "slot": "consumable", "preco": 200, "raridade": "comum"},
]

static func catalogo_loja() -> Array[Dictionary]:
	var id_atual := 1
	var resultado: Array[Dictionary] = []

	for set_nome in CONJUNTOS_ARMADURA.keys():
		for peca in CONJUNTOS_ARMADURA[set_nome]:
			var item: Dictionary = peca.duplicate()
			item["id"] = id_atual
			item["set"] = set_nome
			id_atual += 1
			resultado.append(item)

	for consumivel in CATALOGO_CONSUMIVEIS:
		var item: Dictionary = consumivel.duplicate()
		item["id"] = id_atual
		item["defesa"] = 0
		item["atkBonus"] = 0
		item["set"] = null
		id_atual += 1
		resultado.append(item)

	for arma in CATALOGO_ARMAS:
		var item: Dictionary = arma.duplicate()
		item["id"] = id_atual
		id_atual += 1
		resultado.append(item)

	return resultado
