class_name EfeitosDeStatus
extends RefCounted

## Porte de engine/combate/efeitosDeStatus.js.

static func processar_cura_xama(jogador: Dictionary) -> Variant:
	if jogador.get("classe") != "Xamã" or jogador["hp"] <= 0:
		return null

	var chance: float = Aleatorio.fonte.call()
	if chance < 0.5:
		var cura: int = floori(jogador["hpMax"] * 0.05)
		var hp_anterior: int = jogador["hp"]
		jogador["hp"] = mini(jogador["hp"] + cura, jogador["hpMax"])
		var cura_efetiva: int = jogador["hp"] - hp_anterior
		return {"curou": cura_efetiva > 0, "valor": cura_efetiva}
	return {"curou": false, "valor": 0}

static func _encontrar_status(status: Array, tipo: String) -> Variant:
	for s in status:
		if s["tipo"] == tipo:
			return s
	return null

static func aplicar_sangramento(inimigo: Dictionary, duracao: int, dano_por_turno: int) -> void:
	if not inimigo.has("status") or inimigo["status"] == null:
		inimigo["status"] = []
	inimigo["status"].append({"tipo": "sangramento", "duracao": duracao, "dano": dano_por_turno})

static func processar_sangramento_do_turno(inimigo: Dictionary) -> Variant:
	if not inimigo.has("status") or inimigo["status"] == null:
		return null
	var status: Array = inimigo["status"]
	var efeito = _encontrar_status(status, "sangramento")
	if efeito == null:
		return null

	inimigo["hp"] = maxi(0, inimigo["hp"] - efeito["dano"])
	efeito["duracao"] -= 1
	var curado: bool = efeito["duracao"] <= 0
	if curado:
		inimigo["status"] = status.filter(func(s): return s["tipo"] != "sangramento")
	return {"dano": efeito["dano"], "curado": curado}

static func aplicar_envenenamento(jogador: Dictionary, duracao: int, dano_por_turno: int) -> void:
	if not jogador.has("status") or jogador["status"] == null:
		jogador["status"] = []
	jogador["status"].append({"tipo": "envenenamento", "duracao": duracao, "dano": dano_por_turno})

static func processar_envenenamento_do_turno(jogador: Dictionary) -> Variant:
	if not jogador.has("status") or jogador["status"] == null:
		return null
	var status: Array = jogador["status"]
	var efeito = _encontrar_status(status, "envenenamento")
	if efeito == null:
		return null

	jogador["hp"] = maxi(0, jogador["hp"] - efeito["dano"])
	efeito["duracao"] -= 1
	var curado: bool = efeito["duracao"] <= 0
	if curado:
		jogador["status"] = status.filter(func(s): return s["tipo"] != "envenenamento")
	return {"dano": efeito["dano"], "curado": curado}

static func aplicar_efeito_da_arma_ao_acertar(jogador: Dictionary, inimigo: Dictionary) -> bool:
	var arma = jogador.get("armaEquipada")
	if arma == null:
		return false
	var efeito = arma.get("efeito")
	if efeito == null or efeito["tipo"] != "sangramento":
		return false

	var chance = efeito.get("chance")
	if chance and Aleatorio.rand(1, 100) > chance:
		return false

	aplicar_sangramento(inimigo, efeito["duracao"], efeito["danoPorTurno"])
	return true
