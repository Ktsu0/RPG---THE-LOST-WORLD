class_name Torre
extends RefCounted

## Porte de engine/torre/index.js.

static func criar_estado_torre(jogador: Dictionary) -> Dictionary:
	return {"jogador": jogador, "andar": 0, "bossAtual": null}

static func avancar_andar(estado: Dictionary) -> Dictionary:
	var proximo_andar: int = estado["andar"] + 1
	var boss: Dictionary = TorreBosses.criar_boss_torre(proximo_andar - 1, estado["jogador"])
	return {"estado": {"jogador": estado["jogador"], "andar": proximo_andar, "bossAtual": boss}, "boss": boss}

static func _resolver_ataque_jogador_no_boss(jogador: Dictionary, boss: Dictionary) -> int:
	return maxi(1, CalculoDano.calcular_ataque_jogador(jogador) + Aleatorio.rand(0, 4) - boss["defesa"])

static func executar_turno_torre(estado: Dictionary, acao: String) -> Dictionary:
	var jogador: Dictionary = estado["jogador"]
	var boss: Dictionary = estado["bossAtual"]
	var eventos: Array[Dictionary] = []

	if acao == "fugir":
		var sucesso: bool = Aleatorio.rand(1, 100) <= 60
		eventos.append({"tipo": "fuga", "sucesso": sucesso})
		if sucesso:
			return {"estado": estado, "eventos": eventos, "fim": "fuga"}
	else:
		var dano: int = _resolver_ataque_jogador_no_boss(jogador, boss)
		var habilidades: Dictionary = boss["habilidades"]
		if habilidades.get("blockChance") and Aleatorio.rand(1, 100) <= habilidades["blockChance"]:
			eventos.append({"tipo": "bloqueio", "autor": "boss"})
			dano = 0
		else:
			boss["hp"] = maxi(0, boss["hp"] - dano)
			eventos.append({"tipo": "dano", "autor": "jogador", "alvo": "boss", "valor": dano})

		if boss["hp"] <= 0:
			eventos.append({"tipo": "morte", "alvo": "boss"})
			jogador["hp"] = mini(jogador["hpMax"], floori(jogador["hp"] + jogador["hpMax"] * 0.35))
			jogador["xp"] += boss["xp"]
			jogador["ouro"] += boss["ouro"]
			var fim: String = "torre_completa" if estado["andar"] >= TorreBosses.LISTA.size() else "venceu_andar"
			if fim == "torre_completa":
				var ouro_bonus := 10000
				jogador["ouro"] += ouro_bonus
				jogador["inventario"].append("Cálice da Vitória")
				eventos.append({"tipo": "torre_completa", "ouroBonus": ouro_bonus, "item": "Cálice da Vitória"})
			return {"estado": {"jogador": jogador, "andar": estado["andar"], "bossAtual": null}, "eventos": eventos, "fim": fim}

	# Turno do boss
	var boss_estado: Dictionary = boss["estado"]
	boss_estado["turnoContador"] += 1
	var habilidades: Dictionary = boss["habilidades"]

	if habilidades.get("defBoostEveryTurns") and boss_estado["turnoContador"] % habilidades["defBoostEveryTurns"]["every"] == 0:
		boss["defesa"] += habilidades["defBoostEveryTurns"]["amount"]
		eventos.append({"tipo": "boss_buff_defesa", "valor": habilidades["defBoostEveryTurns"]["amount"]})
	if habilidades.get("defIncreasePerTurn"):
		boss["defesa"] += habilidades["defIncreasePerTurn"]

	var chance_critico: int = habilidades.get("critChanceBonus", 0)
	var dano_boss: int = maxi(1, boss["atk"] + Aleatorio.rand(0, 4) - floori(CalculoDano.calcular_defesa_jogador(jogador) / 5.0))
	var critico: bool = chance_critico > 0 and Aleatorio.rand(1, 100) <= chance_critico
	if critico:
		dano_boss *= 2

	if habilidades.get("dragonBreathChance") and Aleatorio.rand(1, 100) <= habilidades["dragonBreathChance"]:
		dano_boss = boss["atk"] * 2
		eventos.append({"tipo": "sopro_do_dragao"})

	if habilidades.get("petrificarChance") and Aleatorio.rand(1, 100) <= habilidades["petrificarChance"]:
		boss_estado["petrificadoJogadorTurns"] = habilidades["petrificarTurns"]
		eventos.append({"tipo": "petrificado", "alvo": "jogador"})

	if habilidades.get("summonSkeletonsEveryTurns") and boss_estado["turnoContador"] % habilidades["summonSkeletonsEveryTurns"] == 0:
		boss_estado["esqueletosInvocados"].append({"hp": habilidades["summonedSkeletonHp"], "atk": habilidades["summonedSkeletonDmgBase"]})
		eventos.append({"tipo": "miniboss_invocado"})
		dano_boss = floori(dano_boss * 1.3)

	jogador["hp"] = maxi(0, jogador["hp"] - dano_boss)
	eventos.append({"tipo": "dano", "autor": "boss", "alvo": "jogador", "valor": dano_boss, "critico": critico})

	if jogador["hp"] <= 0:
		eventos.append({"tipo": "morte", "alvo": "jogador"})
		return {"estado": {"jogador": jogador, "andar": estado["andar"], "bossAtual": boss}, "eventos": eventos, "fim": "derrota"}

	return {"estado": {"jogador": jogador, "andar": estado["andar"], "bossAtual": boss}, "eventos": eventos, "fim": null}

static func pode_acessar_torre(jogador: Dictionary) -> bool:
	return jogador["inventario"].has("Talismã da Torre")

static func consumir_talisma_da_torre(jogador: Dictionary) -> void:
	var indice: int = jogador["inventario"].find("Talismã da Torre")
	if indice != -1:
		jogador["inventario"].remove_at(indice)
