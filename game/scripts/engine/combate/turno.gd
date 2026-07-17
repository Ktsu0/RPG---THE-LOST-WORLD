class_name Turno
extends RefCounted

## Porte de engine/combate/turno.js.

static func executar_rodada(estado: Dictionary, acao: String) -> Dictionary:
	var jogador: Dictionary = estado["jogador"]
	var inimigo: Dictionary = estado["inimigo"]
	var rodada: int = estado["rodada"] + 1
	var eventos: Array[Dictionary] = []

	# 1. Efeitos passivos de início de rodada
	var cura = EfeitosDeStatus.processar_cura_xama(jogador)
	if cura != null and cura["curou"]:
		eventos.append({"tipo": "cura_xama", "valor": cura["valor"]})

	var sangramento = EfeitosDeStatus.processar_sangramento_do_turno(inimigo)
	if sangramento != null:
		eventos.append({
			"tipo": "sangramento_tick", "alvo": "inimigo",
			"dano": sangramento["dano"], "curado": sangramento["curado"],
		})
	if inimigo["hp"] <= 0:
		eventos.append({"tipo": "morte", "alvo": "inimigo"})
		var recompensa: Dictionary = Recompensas.conceder_recompensa_vitoria(jogador, inimigo)
		var evento_vitoria: Dictionary = {"tipo": "vitoria"}
		evento_vitoria.merge(recompensa)
		eventos.append(evento_vitoria)
		return {"estado": {"jogador": jogador, "inimigo": inimigo, "rodada": rodada}, "eventos": eventos, "fim": "vitoria"}

	var envenenamento = EfeitosDeStatus.processar_envenenamento_do_turno(jogador)
	if envenenamento != null:
		eventos.append({
			"tipo": "envenenamento_tick", "alvo": "jogador",
			"dano": envenenamento["dano"], "curado": envenenamento["curado"],
		})
	if jogador["hp"] <= 0:
		eventos.append({"tipo": "morte", "alvo": "jogador"})
		eventos.append({"tipo": "derrota"})
		return {"estado": {"jogador": jogador, "inimigo": inimigo, "rodada": rodada}, "eventos": eventos, "fim": "derrota"}

	# 2. Ação do jogador
	var defendendo := false
	if HabilidadesInimigo.processar_paralisia_do_turno(jogador):
		eventos.append({"tipo": "paralisado", "alvo": "jogador"})
	elif acao == "usar_pocao":
		var resultado: Dictionary = Pocao.usar_pocao_de_cura(jogador)
		if resultado["usou"]:
			eventos.append({"tipo": "pocao_usada", "valor": resultado["cura"]})
		else:
			eventos.append({"tipo": "pocao_indisponivel"})
	elif acao == "defender":
		defendendo = true
		eventos.append({"tipo": "defendendo", "alvo": "jogador"})
	elif acao == "fugir":
		var sucesso: bool = Aleatorio.rand(1, 100) > 40
		eventos.append({"tipo": "fuga", "sucesso": sucesso})
		if sucesso:
			return {"estado": {"jogador": jogador, "inimigo": inimigo, "rodada": rodada}, "eventos": eventos, "fim": "fuga"}
	elif HabilidadesInimigo.processar_invulneravel_do_turno(inimigo):
		eventos.append({"tipo": "invulneravel_ativo", "alvo": "inimigo"})
	else:
		var ataque: Dictionary = CalculoDano.resolver_ataque_jogador(jogador, inimigo)
		if ataque["esquivou"]:
			eventos.append({"tipo": "esquiva", "autor": "inimigo"})
		else:
			inimigo["hp"] = maxi(0, inimigo["hp"] - ataque["dano"])
			eventos.append({
				"tipo": "dano", "autor": "jogador", "alvo": "inimigo",
				"valor": ataque["dano"], "critico": ataque["critico"],
			})

			var sangramento_aplicado: bool = EfeitosDeStatus.aplicar_efeito_da_arma_ao_acertar(jogador, inimigo)
			if sangramento_aplicado:
				var efeito_arma: Dictionary = jogador["armaEquipada"]["efeito"]
				eventos.append({
					"tipo": "sangramento_aplicado", "alvo": "inimigo",
					"duracao": efeito_arma["duracao"], "danoPorTurno": efeito_arma["danoPorTurno"],
				})

			if inimigo["hp"] <= 0:
				eventos.append({"tipo": "morte", "alvo": "inimigo"})
				var recompensa2: Dictionary = Recompensas.conceder_recompensa_vitoria(jogador, inimigo)
				var evento_vitoria2: Dictionary = {"tipo": "vitoria"}
				evento_vitoria2.merge(recompensa2)
				eventos.append(evento_vitoria2)
				return {"estado": {"jogador": jogador, "inimigo": inimigo, "rodada": rodada}, "eventos": eventos, "fim": "vitoria"}

	# 3. Ação do inimigo
	var aplicar_dano_ao_jogador := func(dano: int) -> int:
		var dano_final: int = floori(dano / 2.0) if defendendo else dano
		jogador["hp"] = maxi(0, jogador["hp"] - dano_final)
		return dano_final

	if inimigo.get("habilidade") == "roubo_e_fuga" and HabilidadesInimigo.verificar_roubo_e_fuga():
		var roubado: int = HabilidadesInimigo.roubar_ouro_e_fugir(jogador)
		eventos.append({"tipo": "fuga_com_roubo", "valor": roubado})
		return {"estado": {"jogador": jogador, "inimigo": inimigo, "rodada": rodada}, "eventos": eventos, "fim": "fuga"}

	if HabilidadesInimigo.verificar_petrificar_ao_atacar(inimigo):
		HabilidadesInimigo.aplicar_buff_petrificar(inimigo)
		eventos.append({"tipo": "petrificar_aplicado", "defesaAtual": inimigo["defesa"]})

	var regen: Dictionary = HabilidadesInimigo.processar_regeneracao(inimigo)
	if regen["curou"]:
		eventos.append({"tipo": "regeneracao", "valor": regen["valor"]})

	if HabilidadesInimigo.verificar_ataque_duplo(inimigo):
		var golpe1: Dictionary = CalculoDano.resolver_ataque_inimigo(inimigo, jogador)
		var golpe2: Dictionary = CalculoDano.resolver_ataque_inimigo(inimigo, jogador)
		var dano_total_bruto: int = (golpe1["dano"] if golpe1["resultado"] == "dano" else 0) + (golpe2["dano"] if golpe2["resultado"] == "dano" else 0)
		var dano_total: int = aplicar_dano_ao_jogador.call(dano_total_bruto)
		eventos.append({
			"tipo": "ataque_duplo", "autor": "inimigo",
			"dano1": golpe1, "dano2": golpe2, "danoTotal": dano_total,
		})
	elif inimigo.get("habilidade") == "bloquear_e_contra_atacar" and HabilidadesInimigo.verificar_bloquear_e_contra_atacar():
		var golpe_tentado: Dictionary = CalculoDano.resolver_ataque_inimigo(inimigo, jogador)
		var dano_tentado: int = golpe_tentado.get("dano", 0)
		var contra_ataque_bruto: int = HabilidadesInimigo.calcular_contra_ataque(inimigo, dano_tentado if dano_tentado else 10)
		var contra_ataque: int = aplicar_dano_ao_jogador.call(contra_ataque_bruto)
		eventos.append({"tipo": "contra_ataque", "autor": "inimigo", "dano": contra_ataque})
	else:
		var golpe: Dictionary = CalculoDano.resolver_ataque_inimigo(inimigo, jogador)
		if golpe["resultado"] == "esquiva":
			eventos.append({"tipo": "esquiva", "autor": "jogador"})
		elif golpe["resultado"] == "bloqueio":
			eventos.append({"tipo": "bloqueio", "autor": "jogador"})
		else:
			var dano_aplicado: int = aplicar_dano_ao_jogador.call(golpe["dano"])
			eventos.append({
				"tipo": "dano", "autor": "inimigo", "alvo": "jogador",
				"valor": dano_aplicado, "critico": false,
			})
			if HabilidadesInimigo.verificar_envenenamento_ao_atacar(inimigo, jogador):
				eventos.append({"tipo": "envenenamento_aplicado", "alvo": "jogador"})

	if jogador["hp"] <= 0:
		eventos.append({"tipo": "morte", "alvo": "jogador"})
		eventos.append({"tipo": "derrota"})
		return {"estado": {"jogador": jogador, "inimigo": inimigo, "rodada": rodada}, "eventos": eventos, "fim": "derrota"}

	return {"estado": {"jogador": jogador, "inimigo": inimigo, "rodada": rodada}, "eventos": eventos, "fim": null}
