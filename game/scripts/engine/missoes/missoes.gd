class_name Missoes
extends RefCounted

## Porte de engine/missoes/index.js.

static func filtro_missao(jogador: Dictionary) -> Variant:
	var disponiveis: Array = MissoesCatalogo.LISTA.filter(func(m): return jogador["nivel"] >= m["nivelMinimo"])
	if disponiveis.is_empty():
		return null

	var com_peso: Array = []
	for missao in disponiveis:
		var peso: int = 1 if missao.get("tipoBatalha") else 5
		for i in peso:
			com_peso.append(missao)
	return com_peso[Aleatorio.rand(0, com_peso.size() - 1)]

static func aplicar_penalidade(tipo: String, jogador: Dictionary) -> Dictionary:
	if tipo == "ouro":
		var perda: int = Aleatorio.rand(15, 100)
		jogador["ouro"] = maxi(0, jogador["ouro"] - perda)
		return {"tipo": "ouro", "valor": perda, "mensagem": "Você perdeu %d de ouro." % perda}

	if tipo == "hp":
		var perda: int = floori(jogador["hp"] * 0.2)
		jogador["hp"] = maxi(1, jogador["hp"] - perda)
		return {"tipo": "hp", "valor": perda, "mensagem": "Você perdeu %d de HP." % perda}

	# tipo "item" só age se jogador.setCompleto for truthy — nada no jogo popula esse
	# campo hoje, então esta branch nunca dispara na prática (fiel ao console/engine original).
	if tipo == "item" and jogador.get("setCompleto"):
		if Aleatorio.rand(1, 100) <= 2:
			return {"tipo": "item", "valor": 1, "mensagem": "Você perdeu uma peça do seu equipamento."}
		return {"tipo": "nenhuma", "valor": 0, "mensagem": "Por sorte, não perdeu nenhum item."}

	return {"tipo": "nenhuma", "valor": 0, "mensagem": "Sem penalidades graves desta vez."}

static func resolver_resultado_missao(jogador: Dictionary, missao: Dictionary) -> Dictionary:
	var resultado: int = Aleatorio.rand(1, 100)

	if resultado > missao["chanceSucesso"]:
		return {"sucesso": false, "penalidade": aplicar_penalidade(missao["falha"]["tipo"], jogador)}

	var xp_fn: Callable = missao["xp"]
	var ouro_fn: Callable = missao["ouro"]
	var xp_ganho: int = roundi(xp_fn.call(jogador["nivel"]))
	var ouro_ganho: int = roundi(ouro_fn.call(jogador["nivel"]))
	jogador["xp"] += xp_ganho
	jogador["ouro"] += ouro_ganho

	var item_ganho = null
	var missao_item = missao.get("item")
	if missao_item != null and typeof(missao_item) == TYPE_DICTIONARY:
		var raridade: String = String(missao_item.get("raridade", "comum")).to_lower()
		var base_chance: int = 80 if raridade == "comum" else (50 if raridade == "raro" else (30 if raridade == "lendario" else 0))
		var bonus_classe: int = 10 if jogador.get("classe") == "Assassino" else 0
		var chance_final: int = mini(100, base_chance + bonus_classe)
		if Aleatorio.rand(1, 100) <= chance_final:
			jogador["inventario"].append(missao_item["nome"])
			item_ganho = missao_item["nome"]
	elif missao_item != null and typeof(missao_item) == TYPE_STRING:
		jogador["inventario"].append(missao_item)
		item_ganho = missao_item

	var pocao_ganha: bool = Aleatorio.rand(1, 100) <= 30
	if pocao_ganha:
		jogador["itens"].append("Poção de Cura")

	var missao_extra_apareceu: bool = Aleatorio.rand(1, 100) <= missao["chanceMissaoExtra"]

	var eventos_level_up: Array[Dictionary] = Experiencia.checar_level_up(jogador)

	return {
		"sucesso": true, "xpGanho": xp_ganho, "ouroGanho": ouro_ganho,
		"itemGanho": item_ganho, "pocaoGanha": pocao_ganha,
		"missaoExtraApareceu": missao_extra_apareceu, "eventosLevelUp": eventos_level_up,
	}
