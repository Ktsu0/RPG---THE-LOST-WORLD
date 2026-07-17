extends GutTest

## Espelha engine/combate/efeitosDeStatus.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_cura_xama_retorna_null_para_outras_classes() -> void:
	var jogador := {"classe": "Guerreiro", "hp": 50, "hpMax": 100}
	assert_null(EfeitosDeStatus.processar_cura_xama(jogador))

func test_cura_xama_cura_5_por_cento_quando_a_chance_de_50_acerta() -> void:
	var jogador := {"classe": "Xamã", "hp": 80, "hpMax": 100}
	Aleatorio.fonte = func() -> float: return 0.4 # < 0.5
	var resultado = EfeitosDeStatus.processar_cura_xama(jogador)
	assert_eq(resultado, {"curou": true, "valor": 5})
	assert_eq(jogador["hp"], 85)

func test_cura_xama_nao_cura_quando_a_chance_falha() -> void:
	var jogador := {"classe": "Xamã", "hp": 80, "hpMax": 100}
	Aleatorio.fonte = func() -> float: return 0.9 # >= 0.5
	assert_eq(EfeitosDeStatus.processar_cura_xama(jogador), {"curou": false, "valor": 0})
	assert_eq(jogador["hp"], 80)

func test_sangramento_retorna_null_sem_status_ativo() -> void:
	var inimigo := {"hp": 30, "status": []}
	assert_null(EfeitosDeStatus.processar_sangramento_do_turno(inimigo))

func test_sangramento_aplica_dano_e_mantem_status_com_duracao_restante() -> void:
	var inimigo := {"hp": 30, "status": []}
	EfeitosDeStatus.aplicar_sangramento(inimigo, 2, 5)
	var resultado = EfeitosDeStatus.processar_sangramento_do_turno(inimigo)
	assert_eq(resultado, {"dano": 5, "curado": false})
	assert_eq(inimigo["hp"], 25)
	assert_eq(inimigo["status"], [{"tipo": "sangramento", "duracao": 1, "dano": 5}])

func test_sangramento_remove_status_quando_a_duracao_termina() -> void:
	var inimigo := {"hp": 30, "status": []}
	EfeitosDeStatus.aplicar_sangramento(inimigo, 1, 5)
	var resultado = EfeitosDeStatus.processar_sangramento_do_turno(inimigo)
	assert_eq(resultado, {"dano": 5, "curado": true})
	assert_eq(inimigo["status"], [])

func test_envenenamento_retorna_null_sem_status() -> void:
	var jogador := {"hp": 100, "status": []}
	assert_null(EfeitosDeStatus.processar_envenenamento_do_turno(jogador))

func test_envenenamento_aplica_dano_e_mantem_status() -> void:
	var jogador := {"hp": 100, "status": []}
	EfeitosDeStatus.aplicar_envenenamento(jogador, 3, 5)
	var resultado = EfeitosDeStatus.processar_envenenamento_do_turno(jogador)
	assert_eq(resultado, {"dano": 5, "curado": false})
	assert_eq(jogador["hp"], 95)

func test_envenenamento_remove_status_quando_termina() -> void:
	var jogador := {"hp": 100, "status": []}
	EfeitosDeStatus.aplicar_envenenamento(jogador, 1, 5)
	var resultado = EfeitosDeStatus.processar_envenenamento_do_turno(jogador)
	assert_eq(resultado, {"dano": 5, "curado": true})
	assert_eq(jogador["status"], [])

func test_efeito_da_arma_falso_sem_arma_equipada() -> void:
	var jogador := {"armaEquipada": null}
	var inimigo := {"status": []}
	assert_false(EfeitosDeStatus.aplicar_efeito_da_arma_ao_acertar(jogador, inimigo))

func test_efeito_da_arma_falso_quando_nao_e_sangramento() -> void:
	var jogador := {"armaEquipada": {"efeito": {"tipo": "critico"}}}
	var inimigo := {"status": []}
	assert_false(EfeitosDeStatus.aplicar_efeito_da_arma_ao_acertar(jogador, inimigo))

func test_efeito_da_arma_aplica_sangramento_quando_a_chance_acerta() -> void:
	var jogador := {"armaEquipada": {"nome": "Adaga Sombria", "efeito": {"tipo": "sangramento", "chance": 60, "duracao": 3, "danoPorTurno": 4}}}
	var inimigo := {"status": []}
	Aleatorio.fonte = func() -> float: return 0.0 # rand(1,100)=1, <=60 sucesso
	assert_true(EfeitosDeStatus.aplicar_efeito_da_arma_ao_acertar(jogador, inimigo))
	assert_eq(inimigo["status"], [{"tipo": "sangramento", "duracao": 3, "dano": 4}])

func test_efeito_da_arma_nao_aplica_quando_a_chance_falha() -> void:
	var jogador := {"armaEquipada": {"nome": "Adaga Sombria", "efeito": {"tipo": "sangramento", "chance": 60, "duracao": 3, "danoPorTurno": 4}}}
	var inimigo := {"status": []}
	Aleatorio.fonte = func() -> float: return 0.99 # rand(1,100)=100, >60 falha
	assert_false(EfeitosDeStatus.aplicar_efeito_da_arma_ao_acertar(jogador, inimigo))
	assert_eq(inimigo["status"], [])
