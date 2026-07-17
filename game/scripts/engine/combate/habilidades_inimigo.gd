class_name HabilidadesInimigo
extends RefCounted

## Porte de engine/combate/habilidadesInimigo.js.

static func verificar_esquiva_inimigo(inimigo: Dictionary) -> bool:
	return inimigo.get("habilidade") == "esquiva" and Aleatorio.rand(1, 100) <= 15

static func verificar_ataque_duplo(inimigo: Dictionary) -> bool:
	return inimigo.get("habilidade") == "ataque_duplo" and Aleatorio.rand(1, 100) <= 15

static func verificar_envenenamento_ao_atacar(inimigo: Dictionary, jogador: Dictionary) -> bool:
	if inimigo.get("habilidade") != "envenenamento" or Aleatorio.rand(1, 100) > 20:
		return false
	EfeitosDeStatus.aplicar_envenenamento(jogador, Aleatorio.rand(3, 5), 5)
	return true

static func aplicar_invulneravel(inimigo: Dictionary) -> void:
	if not inimigo.has("status") or inimigo["status"] == null:
		inimigo["status"] = []
	inimigo["status"].append({"tipo": "invulneravel", "duracao": 1})

static func _encontrar_status(status: Array, tipo: String) -> Variant:
	for s in status:
		if s["tipo"] == tipo:
			return s
	return null

static func processar_invulneravel_do_turno(inimigo: Dictionary) -> bool:
	if not inimigo.has("status") or inimigo["status"] == null:
		return false
	var status: Array = inimigo["status"]
	var efeito = _encontrar_status(status, "invulneravel")
	if efeito == null:
		return false
	efeito["duracao"] -= 1
	if efeito["duracao"] <= 0:
		inimigo["status"] = status.filter(func(s): return s["tipo"] != "invulneravel")
	return true

static func verificar_paralisia() -> bool:
	return Aleatorio.rand(1, 100) <= 12

static func aplicar_paralisia(jogador: Dictionary, duracao: int) -> void:
	if not jogador.has("status") or jogador["status"] == null:
		jogador["status"] = []
	jogador["status"].append({"tipo": "paralisado", "duracao": duracao})

static func processar_paralisia_do_turno(jogador: Dictionary) -> bool:
	if not jogador.has("status") or jogador["status"] == null:
		return false
	var status: Array = jogador["status"]
	var efeito = _encontrar_status(status, "paralisado")
	if efeito == null:
		return false
	efeito["duracao"] -= 1
	if efeito["duracao"] <= 0:
		jogador["status"] = status.filter(func(s): return s["tipo"] != "paralisado")
	return true

static func verificar_roubo_e_fuga() -> bool:
	return Aleatorio.rand(1, 100) <= 20

static func roubar_ouro_e_fugir(jogador: Dictionary) -> int:
	var roubo: int = mini(jogador["ouro"], Aleatorio.rand(20, 50))
	jogador["ouro"] -= roubo
	return roubo

static func verificar_petrificar_ao_atacar(inimigo: Dictionary) -> bool:
	return inimigo.get("habilidade") == "petrificar" and Aleatorio.rand(1, 100) <= 20

static func aplicar_buff_petrificar(inimigo: Dictionary) -> void:
	inimigo["defesa"] += floori(inimigo["defesa"] * 0.05) + 1

static func processar_regeneracao(inimigo: Dictionary) -> Dictionary:
	if inimigo.get("habilidade") != "regeneracao" or Aleatorio.fonte.call() >= 0.3:
		return {"curou": false, "valor": 0}
	var cura: int = floori(inimigo["hpMax"] * 0.07)
	inimigo["hp"] = mini(inimigo["hp"] + cura, inimigo["hpMax"])
	return {"curou": true, "valor": cura}

static func verificar_bloquear_e_contra_atacar() -> bool:
	return Aleatorio.rand(1, 100) <= 10

static func calcular_contra_ataque(_inimigo: Variant, dano_original: int) -> int:
	return floori(dano_original * 0.9)
