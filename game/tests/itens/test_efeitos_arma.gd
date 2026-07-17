extends GutTest

## Espelha engine/itens/efeitosArma.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_roubo_de_vida_cura_15_por_cento_do_dano_sem_passar_do_hpmax() -> void:
	var jogador := {"armaEquipada": {"efeito": {"tipo": "roubo_de_vida", "percentual": 0.15}}, "hp": 50, "hpMax": 100}
	EfeitosArma.aplicar_roubo_de_vida(jogador, 40) # floor(40*0.15) = 6
	assert_eq(jogador["hp"], 56)

func test_roubo_de_vida_nao_cura_acima_do_hpmax() -> void:
	var jogador := {"armaEquipada": {"efeito": {"tipo": "roubo_de_vida", "percentual": 0.15}}, "hp": 98, "hpMax": 100}
	EfeitosArma.aplicar_roubo_de_vida(jogador, 40)
	assert_eq(jogador["hp"], 100)

func test_roubo_de_vida_nao_faz_nada_sem_o_efeito() -> void:
	var jogador := {"armaEquipada": {"efeito": {"tipo": "critico", "chance": 15}}, "hp": 50, "hpMax": 100}
	EfeitosArma.aplicar_roubo_de_vida(jogador, 40)
	assert_eq(jogador["hp"], 50)

func test_critico_arma_retorna_true_quando_a_chance_acerta() -> void:
	var jogador := {"armaEquipada": {"efeito": {"tipo": "critico", "chance": 15}}}
	Aleatorio.fonte = func() -> float: return 0.0 # rand(1,100)=1 <=15
	assert_true(EfeitosArma.verificar_critico_arma(jogador))

func test_critico_arma_retorna_false_sem_efeito_critico() -> void:
	var jogador := {"armaEquipada": {"efeito": {"tipo": "sangramento", "chance": 100}}}
	assert_false(EfeitosArma.verificar_critico_arma(jogador))

func test_ataque_duplo_causa_dano_extra_quando_a_chance_acerta() -> void:
	var jogador := {"armaEquipada": {"efeito": {"tipo": "ataque_duplo", "chance": 20}}, "ataque": 12}
	var inimigo := {"hp": 30}
	Aleatorio.fonte = func() -> float: return 0.0 # rand(1,100)=1 <=20
	var resultado := EfeitosArma.aplicar_ataque_duplo_arma(jogador, inimigo)
	assert_eq(resultado, {"ativou": true, "danoExtra": 12})
	assert_eq(inimigo["hp"], 18)

func test_ataque_duplo_nao_ativa_quando_a_chance_falha() -> void:
	var jogador := {"armaEquipada": {"efeito": {"tipo": "ataque_duplo", "chance": 20}}, "ataque": 12}
	var inimigo := {"hp": 30}
	Aleatorio.fonte = func() -> float: return 0.99 # rand(1,100)=100 >20
	var resultado := EfeitosArma.aplicar_ataque_duplo_arma(jogador, inimigo)
	assert_eq(resultado, {"ativou": false, "danoExtra": 0})
	assert_eq(inimigo["hp"], 30)

func test_confusao_aplica_e_processa_inimigo_se_fere_e_pula_o_turno() -> void:
	var inimigo := {"atk": 10, "hp": 30, "status": []}
	EfeitosArma.aplicar_confusao(inimigo, 1)
	var resultado = EfeitosArma.processar_confusao_do_turno(inimigo)
	assert_eq(resultado, {"puloTurno": true, "dano": 5}) # floor(10*0.5)=5
	assert_eq(inimigo["hp"], 25)
	assert_eq(inimigo["status"], []) # duração 1 -> expira neste turno

func test_congelamento_aplica_e_processa_inimigo_pula_o_turno_sem_dano() -> void:
	var inimigo := {"atk": 10, "hp": 30, "status": []}
	EfeitosArma.aplicar_congelamento(inimigo, 1)
	var resultado = EfeitosArma.processar_congelamento_do_turno(inimigo)
	assert_eq(resultado, {"puloTurno": true})
	assert_eq(inimigo["status"], [])

func test_incendio_aplica_e_processa_dano_por_turno() -> void:
	var inimigo := {"hp": 30, "status": []}
	EfeitosArma.aplicar_incendio(inimigo, 2, 7)
	var resultado = EfeitosArma.processar_incendio_do_turno(inimigo)
	assert_eq(resultado, {"dano": 7, "curado": false})
	assert_eq(inimigo["hp"], 23)
	assert_eq(inimigo["status"], [{"tipo": "incendio", "duracao": 1, "dano": 7}])

func test_retorna_null_quando_nao_ha_o_status_correspondente() -> void:
	var inimigo := {"atk": 10, "hp": 30, "status": []}
	assert_null(EfeitosArma.processar_confusao_do_turno(inimigo))
	assert_null(EfeitosArma.processar_congelamento_do_turno(inimigo))
	assert_null(EfeitosArma.processar_incendio_do_turno(inimigo))
