class_name CalculoDano
extends RefCounted

## Porte de engine/combate/calculoDano.js.

static func calcular_ataque_jogador(jogador: Dictionary) -> int:
	var atk: int = jogador.get("ataque", 0)
	atk += floori(jogador["nivel"] * 2)

	var equipamentos: Dictionary = jogador["equipamentos"]
	var atk_bonus := 0
	for it in equipamentos.values():
		if it != null:
			atk_bonus += int(it.get("atkBonus", 0))
	atk += atk_bonus
	atk += jogador.get("bonusAtk", 0)

	if jogador.get("amuletoEquipado", false):
		var atk_base: int = jogador.get("ataqueOriginal", jogador.get("ataque", 0))
		atk += floori(atk_base * 0.02)

	var arma = jogador.get("armaEquipada")
	if arma != null and arma.get("atk"):
		atk += int(arma.get("atk", 0))

	return atk

static func calcular_defesa_jogador(jogador: Dictionary) -> int:
	var def: int = jogador.get("defesa", 0)
	var equipamentos: Dictionary = jogador["equipamentos"]
	for it in equipamentos.values():
		if it != null:
			def += int(it.get("defesa", 0))
	def += jogador.get("bonusDef", 0)
	return def

static func calcular_dano_base_jogador(jogador: Dictionary) -> int:
	return maxi(1, floori(calcular_ataque_jogador(jogador)) + Aleatorio.rand(0, 4))

static func calcular_chance_critica_jogador(jogador: Dictionary) -> int:
	var arma = jogador.get("armaEquipada")
	var bonus_critico_arma := 0
	if arma != null:
		var efeito = arma.get("efeito")
		if efeito != null and efeito.get("tipo") == "critico":
			bonus_critico_arma = efeito["chance"]
	var bonus_classe: Dictionary = jogador.get("bonusClasse", {})
	var bonus_raca: Dictionary = jogador.get("bonusRaca", {})
	return (
		int(bonus_classe.get("critChance", 0))
		+ int(bonus_raca.get("critChance", 0))
		+ int(jogador.get("bonusCritico", 0))
		+ bonus_critico_arma
	)

static func aplicar_furia_barbaro(jogador: Dictionary, dano: int) -> int:
	if jogador.get("classe") == "Bárbaro" and jogador["hp"] <= jogador["hpMax"] * 0.35:
		return floori(dano * 1.5)
	return dano

static func calcular_defesa_inimigo(inimigo: Dictionary) -> int:
	var def: int = int(inimigo.get("defesa", 0))
	def += int(inimigo.get("bonusDef", 0))
	return def

static func resolver_ataque_jogador(jogador: Dictionary, inimigo: Dictionary) -> Dictionary:
	var dano_bruto: int = calcular_dano_base_jogador(jogador)
	var defesa_efetiva: int = calcular_defesa_inimigo(inimigo)
	var dano: int = maxi(1, dano_bruto - defesa_efetiva)
	dano = aplicar_furia_barbaro(jogador, dano)

	var chance_critica: int = calcular_chance_critica_jogador(jogador)
	var critico := false
	if chance_critica > 0 and Aleatorio.rand(1, 100) <= chance_critica:
		critico = true
		dano *= 2

	if inimigo.get("habilidade") == "esquiva" and Aleatorio.rand(1, 100) <= 15:
		return {"dano": 0, "critico": false, "esquivou": true}

	return {"dano": dano, "critico": critico, "esquivou": false}

static func resolver_ataque_inimigo(inimigo: Dictionary, jogador: Dictionary) -> Dictionary:
	var dano_base: int = maxi(1, inimigo["atk"] + Aleatorio.rand(0, 3) - floori(calcular_defesa_jogador(jogador) / 5.0))

	var bonus_classe: Dictionary = jogador.get("bonusClasse", {})
	var esquiva_total: int = int(bonus_classe.get("esquiva", 0)) + int(jogador.get("bonusEsquiva", 0))
	if Aleatorio.rand(1, 100) <= esquiva_total:
		return {"resultado": "esquiva", "dano": 0}

	var chance_bloqueio: int = int(bonus_classe.get("bloqueioChance", 0)) + int(jogador.get("bonusBloqueio", 0))
	if Aleatorio.rand(1, 100) <= chance_bloqueio:
		return {"resultado": "bloqueio", "dano": 0}

	return {"resultado": "dano", "dano": dano_base}
