class_name EfeitosArma
extends RefCounted

## Porte de engine/itens/efeitosArma.js.

static func _efeito_da_arma(jogador: Dictionary) -> Variant:
	var arma = jogador.get("armaEquipada")
	if arma == null:
		return null
	return arma.get("efeito")

static func aplicar_roubo_de_vida(jogador: Dictionary, dano_causado: int) -> void:
	var efeito = _efeito_da_arma(jogador)
	if efeito == null or efeito["tipo"] != "roubo_de_vida":
		return
	var vida_roubada: int = floori(dano_causado * efeito["percentual"])
	jogador["hp"] = mini(jogador["hp"] + vida_roubada, jogador["hpMax"])

static func verificar_critico_arma(jogador: Dictionary) -> bool:
	var efeito = _efeito_da_arma(jogador)
	if efeito == null or efeito["tipo"] != "critico":
		return false
	return Aleatorio.rand(1, 100) <= efeito["chance"]

static func aplicar_ataque_duplo_arma(jogador: Dictionary, inimigo: Dictionary) -> Dictionary:
	var efeito = _efeito_da_arma(jogador)
	if efeito == null or efeito["tipo"] != "ataque_duplo" or Aleatorio.rand(1, 100) > efeito["chance"]:
		return {"ativou": false, "danoExtra": 0}
	var dano_extra: int = jogador["ataque"]
	inimigo["hp"] = maxi(0, inimigo["hp"] - dano_extra)
	return {"ativou": true, "danoExtra": dano_extra}

static func aplicar_confusao(inimigo: Dictionary, duracao: int) -> void:
	if not inimigo.has("status") or inimigo["status"] == null:
		inimigo["status"] = []
	inimigo["status"].append({"tipo": "confusao", "duracao": duracao})

static func aplicar_congelamento(inimigo: Dictionary, duracao: int) -> void:
	if not inimigo.has("status") or inimigo["status"] == null:
		inimigo["status"] = []
	inimigo["status"].append({"tipo": "congelamento", "duracao": duracao})

static func aplicar_incendio(inimigo: Dictionary, duracao: int, dano_por_turno: int) -> void:
	if not inimigo.has("status") or inimigo["status"] == null:
		inimigo["status"] = []
	inimigo["status"].append({"tipo": "incendio", "duracao": duracao, "dano": dano_por_turno})

static func _encontrar_status(status: Array, tipo: String) -> Variant:
	for s in status:
		if s["tipo"] == tipo:
			return s
	return null

static func _processar_status_simples(alvo: Dictionary, tipo: String) -> Variant:
	if not alvo.has("status") or alvo["status"] == null:
		return null
	var status: Array = alvo["status"]
	var efeito = _encontrar_status(status, tipo)
	if efeito == null:
		return null
	efeito["duracao"] -= 1
	var curado: bool = efeito["duracao"] <= 0
	if curado:
		alvo["status"] = status.filter(func(s): return s["tipo"] != tipo)
	return {"efeito": efeito, "curado": curado}

static func processar_confusao_do_turno(inimigo: Dictionary) -> Variant:
	var resultado = _processar_status_simples(inimigo, "confusao")
	if resultado == null:
		return null
	var dano: int = floori(inimigo["atk"] * 0.5)
	inimigo["hp"] = maxi(0, inimigo["hp"] - dano)
	return {"puloTurno": true, "dano": dano}

static func processar_congelamento_do_turno(inimigo: Dictionary) -> Variant:
	var resultado = _processar_status_simples(inimigo, "congelamento")
	if resultado == null:
		return null
	return {"puloTurno": true}

static func processar_incendio_do_turno(inimigo: Dictionary) -> Variant:
	if not inimigo.has("status") or inimigo["status"] == null:
		return null
	var status: Array = inimigo["status"]
	var efeito = _encontrar_status(status, "incendio")
	if efeito == null:
		return null
	inimigo["hp"] = maxi(0, inimigo["hp"] - efeito["dano"])
	efeito["duracao"] -= 1
	var curado: bool = efeito["duracao"] <= 0
	if curado:
		inimigo["status"] = status.filter(func(s): return s["tipo"] != "incendio")
	return {"dano": efeito["dano"], "curado": curado}
