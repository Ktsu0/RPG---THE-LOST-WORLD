class_name MasmorraGerador
extends RefCounted

## Algoritmo de geração de grade portado de engine/masmorra/gerador.js
## (já testado: entrada no centro, boss na célula mais distante, minibosses/
## mobs/armadilhas/segredos/tesouros distribuídos pelo resto da grade).
##
## DADOS dos 10 temas portados de JogoRPG/masmorra/masmorra.js (DUNGEON_TEMPLATES,
## fonte completa e correta — não do engine/masmorra/gerador.js simplificado, que
## tinha nomes genéricos e bosses reciclados da Torre), com 3 nomes de boss
## atualizados por decisão do usuário (2026-07-17): Dolgarth, Vel'Thyra, Zerakth.
## Ver docs/superpowers/specs/2026-07-17-lista-mestra-conteudo-sprites.md seção 3.3.
##
## Nota de porte: o campo "poder" de JogoRPG é um texto de flavor (ex. "Necromancia"),
## não um multiplicador numérico — mantido aqui como "habilidadeEspecial". O
## multiplicador numérico "poder" (usado por InimigoDaSala para escalar hp/atk)
## é derivado do campo "dificuldade" de JogoRPG (1-10), mapeado para a mesma faixa
## 1.3-1.6 que os templates antigos do engine/ já usavam: poder = 1.3 + (dificuldade-1)/9*0.3.

static var DUNGEON_TEMPLATES: Array[Dictionary] = [
	{
		"id": "catacumbas-sombras", "nome": "Catacumbas Sombras", "tema": "cripta",
		"mobs": ["Esqueleto Errante", "Zumbi Corrompido", "Rato Gigante", "Espectro Sombrio"],
		"minibosses": ["Coveiro Errante", "Ceifador", "Mago Negro"],
		"boss": {"nome": "Kaelthos, Mestre das Catacumbas", "poder": 1.3, "habilidadeEspecial": "Necromancia"},
		"trapChance": 20, "secretChance": 18, "treasureMultiplier": 1.1,
	},
	{
		"id": "ruinas-da-floresta", "nome": "Ruínas da Floresta", "tema": "floresta",
		"mobs": ["Lobo Selvagem", "Aranha Venenosa", "Bandido da Selva"],
		"minibosses": ["Feiticeiro das Asas Negras", "Lobo Espectral", "Ent Enraizado"],
		"boss": {"nome": "Verdanth, Guardião Primordial da Selva", "poder": 1.33, "habilidadeEspecial": "Raízes Presas"},
		"trapChance": 12, "secretChance": 22, "treasureMultiplier": 1.0,
	},
	{
		"id": "caverna-do-gelo", "nome": "Caverna do Gelo", "tema": "gelo",
		"mobs": ["Guerreiro Congelado", "Harpia Gelada", "Caranguejo de Cristal"],
		"minibosses": ["Lorde Glacial", "Górgula de Gelo", "Urso de Cristal"],
		"boss": {"nome": "Aurlion, o Dragão Glacial", "poder": 1.43, "habilidadeEspecial": "Sopro Glaciar"},
		"trapChance": 10, "secretChance": 15, "treasureMultiplier": 1.2,
	},
	{
		"id": "fornalha-infernal", "nome": "Fornalha Infernal", "tema": "fogo",
		"mobs": ["Lacaio de Fogo", "Golem de Lava", "Escorpião Flamejante"],
		"minibosses": ["Forjador Ardente", "Senhor das Brasas", "Ancião de Magma"],
		"boss": {"nome": "Ignarok, Senhor das Chamas Eternas", "poder": 1.43, "habilidadeEspecial": "Erupção Infernal"},
		"trapChance": 25, "secretChance": 10, "treasureMultiplier": 1.4,
	},
	{
		"id": "biblioteca-antiga", "nome": "Biblioteca Antiga", "tema": "arcano",
		"mobs": ["Acólito Corrompido", "Livro Animado", "Gárgula de Pedra"],
		"minibosses": ["Bibliotecário Louco", "Escriba Profano", "Ancião Arcano"],
		"boss": {"nome": "Thal'Mor, Guardião dos Segredos Proibidos", "poder": 1.37, "habilidadeEspecial": "Feitiços Antigos"},
		"trapChance": 8, "secretChance": 30, "treasureMultiplier": 1.3,
	},
	{
		"id": "mina-abandonada", "nome": "Mina Abandonada", "tema": "mina",
		"mobs": ["Rato do Subsolo", "Bandido Mineiro", "Autômato Danificado"],
		"minibosses": ["Capataz Caído", "Gárgula de Minério", "Homem de Pedra das Minas"],
		"boss": {"nome": "Dolgarth, o Golem das Profundezas", "poder": 1.33, "habilidadeEspecial": "Impacto Sísmico"},
		"trapChance": 18, "secretChance": 14, "treasureMultiplier": 1.0,
	},
	{
		"id": "pantano-putrefato", "nome": "Pântano Putrefato", "tema": "pântano",
		"mobs": ["Répteis do Lodo", "Híbrido Putrefato", "Mosca Gigante"],
		"minibosses": ["Xamã Venenoso", "Feiticeira do Brejo", "Monstro da Lama"],
		"boss": {"nome": "Morghul, o Decompositor", "poder": 1.37, "habilidadeEspecial": "Praga da Corrupção"},
		"trapChance": 22, "secretChance": 16, "treasureMultiplier": 0.9,
	},
	{
		"id": "templo-das-sombras", "nome": "Templo das Sombras", "tema": "templo",
		"mobs": ["Sentinela Obscura", "Acólito Maldito", "Neófito Sombrio"],
		"minibosses": ["Sacerdote Negro", "Arauto das Trevas", "Sentinela Eterna"],
		"boss": {"nome": "Vel'Thyra, Soberana das Trevas", "poder": 1.5, "habilidadeEspecial": "Lâmina Etérea"},
		"trapChance": 20, "secretChance": 18, "treasureMultiplier": 1.2,
	},
	{
		"id": "forja-elemental", "nome": "Forja Elemental", "tema": "forja",
		"mobs": ["Faísca Viva", "Metalúnculo", "Operário Enlouquecido"],
		"minibosses": ["Mestre Ferreiro", "Centurião Metálico", "Arcanista de Ferros"],
		"boss": {"nome": "Forjador Elemental, Senhor do Martelo", "poder": 1.43, "habilidadeEspecial": "Martelo Incandescente"},
		"trapChance": 15, "secretChance": 12, "treasureMultiplier": 1.5,
	},
	{
		"id": "torre-dos-ecos", "nome": "Torre dos Ecos", "tema": "torre",
		"mobs": ["Eco Errante", "Guardião de Pedra", "Magus Errático"],
		"minibosses": ["Senhor do Eco", "Mestre das Runas", "Sentinela Temporal"],
		"boss": {"nome": "Zerakth, Guardião do Fluxo Temporal", "poder": 1.6, "habilidadeEspecial": "Ruptura Temporal"},
		"trapChance": 14, "secretChance": 20, "treasureMultiplier": 1.6,
	},
]

static func determinar_dificuldade(nivel: int) -> int:
	if nivel < 5:
		return Aleatorio.rand(1, 5)
	if nivel < 10:
		return Aleatorio.rand(3, 8)
	return Aleatorio.rand(5, 10)

static func _criar_grade_vazia(size: int) -> Array:
	var grid: Array = []
	for y in size:
		var linha: Array = []
		for x in size:
			linha.append({"x": x, "y": y, "visited": false, "roomType": "vazio", "content": null})
		grid.append(linha)
	return grid

static func _distancia_manhattan(a: Dictionary, b: Dictionary) -> int:
	return absi(a["x"] - b["x"]) + absi(a["y"] - b["y"])

static func gerar_masmorra(jogador: Dictionary, template_id: String, options: Dictionary = {}) -> Dictionary:
	var size: int = options.get("size", 5)
	var template: Dictionary = DUNGEON_TEMPLATES[0]
	for t in DUNGEON_TEMPLATES:
		if t["id"] == template_id:
			template = t
			break

	var grid: Array = _criar_grade_vazia(size)
	var centro: Dictionary = {"x": floori(size / 2.0), "y": floori(size / 2.0)}

	grid[centro["y"]][centro["x"]]["roomType"] = "entrada"
	grid[centro["y"]][centro["x"]]["visited"] = true

	var candidatos: Array = []
	for y in size:
		for x in size:
			if not (x == centro["x"] and y == centro["y"]):
				candidatos.append(grid[y][x])

	var candidatos_por_distancia: Array = candidatos.duplicate()
	candidatos_por_distancia.sort_custom(func(a, b): return _distancia_manhattan(b, centro) < _distancia_manhattan(a, centro))
	var celula_boss: Dictionary = candidatos_por_distancia[0]
	celula_boss["roomType"] = "boss"
	celula_boss["content"] = {"nome": template["boss"]["nome"], "poder": template["boss"]["poder"]}

	var restantes: Array = candidatos.filter(func(c): return c != celula_boss)
	var miniboss_count: int = mini(restantes.size(), Aleatorio.rand(1, 3))
	for i in miniboss_count:
		var idx: int = Aleatorio.rand(0, restantes.size() - 1)
		var celula: Dictionary = restantes[idx]
		restantes.remove_at(idx)
		celula["roomType"] = "miniboss"
		var minibosses: Array = template["minibosses"]
		celula["content"] = {"nome": minibosses[Aleatorio.rand(0, minibosses.size() - 1)]}

	var mob_rooms_count: int = mini(restantes.size(), Aleatorio.rand(4, 8))
	for i in mob_rooms_count:
		var idx: int = Aleatorio.rand(0, restantes.size() - 1)
		var celula: Dictionary = restantes[idx]
		restantes.remove_at(idx)
		celula["roomType"] = "monstro"
		var mobs: Array = template["mobs"]
		celula["content"] = {"nome": mobs[Aleatorio.rand(0, mobs.size() - 1)]}

	for celula in restantes:
		var rolagem: int = Aleatorio.rand(1, 100)
		var trap_chance: int = template["trapChance"]
		var secret_chance: int = template["secretChance"]
		if rolagem <= trap_chance:
			celula["roomType"] = "trap"
		elif rolagem <= trap_chance + secret_chance:
			celula["roomType"] = "secret"
		elif rolagem <= trap_chance + secret_chance + 10:
			celula["roomType"] = "treasure"

	return {
		"template": template, "size": size, "grid": grid, "entrance": centro,
		"bossPos": {"x": celula_boss["x"], "y": celula_boss["y"]},
	}
