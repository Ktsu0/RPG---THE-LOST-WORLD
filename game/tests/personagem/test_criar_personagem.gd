extends GutTest

## Espelha engine/personagem/criarPersonagem.test.js.

func test_validar_nome_aceita_um_nome_nao_vazio() -> void:
	assert_true(CriarPersonagem.validar_nome("Thorin"))

func test_validar_nome_rejeita_string_vazia() -> void:
	assert_false(CriarPersonagem.validar_nome(""))

func test_validar_nome_rejeita_string_so_com_espacos() -> void:
	assert_false(CriarPersonagem.validar_nome("   "))

func test_validar_nome_rejeita_valores_nao_string() -> void:
	assert_false(CriarPersonagem.validar_nome(null))

func test_calcular_atributos_combina_bonus_de_raca_e_classe_anao_arqueiro() -> void:
	var atributos: Dictionary = CriarPersonagem.calcular_atributos_iniciais("Anão", "Arqueiro")
	# hp = 100 + 0 (Anão), ataque = 5 + (-3) + 0 = 2, defesa = 5 + 15 + 0 = 20
	assert_eq(atributos, {"hp": 100, "hpMax": 100, "ataque": 2, "defesa": 20})

func test_calcular_atributos_combina_bonus_de_raca_e_classe_morto_vivo_barbaro() -> void:
	var atributos: Dictionary = CriarPersonagem.calcular_atributos_iniciais("Morto-vivo", "Bárbaro")
	# hp = 100 - 10 = 90, ataque = 5 + 5 + 8 = 18, defesa = 5 + 0 + 0 = 5
	assert_eq(atributos, {"hp": 90, "hpMax": 90, "ataque": 18, "defesa": 5})

func test_criar_personagem_shape_completo_esperado_pelo_engine_de_combate() -> void:
	var jogador: Dictionary = CriarPersonagem.criar_personagem({"nome": "Thorin", "racaNome": "Anão", "classeNome": "Arqueiro"})

	assert_eq(jogador, {
		"nome": "Thorin",
		"raca": "Anão",
		"classe": "Arqueiro",
		"habilidadeClasse": "esquiva",
		"bonusClasse": {
			"habilidade": "esquiva", "atk": 0, "def": 0, "dropOuro": 10, "dropItem": 0,
			"critChance": 0, "esquiva": 10, "bloqueioChance": 0,
		},
		"hp": 100, "hpMax": 100,
		"nivel": 1, "xp": 0, "ouro": 50,
		"ataque": 2, "defesa": 20,
		"bonusRaca": {"hp": 0, "atk": -3, "def": 15, "critChance": 0},
		"restricoes": {},
		"equipamentos": {"head": null, "chest": null, "hands": null, "legs": null, "feet": null},
		"itens": [], "inventario": [], "armas": [],
		"armaEquipada": null, "amuletoEquipado": false, "amuletoCraftado": false, "status": [],
		"ativarHistoria": true,
	})

func test_criar_personagem_remove_espacos_extras_do_nome() -> void:
	var jogador: Dictionary = CriarPersonagem.criar_personagem({"nome": "  Gimli  ", "racaNome": "Anão", "classeNome": "Paladino"})
	assert_eq(jogador["nome"], "Gimli")

func test_criar_personagem_aplica_a_restricao_sem_armadura_do_dragonoide() -> void:
	var jogador: Dictionary = CriarPersonagem.criar_personagem({"nome": "Draco", "racaNome": "Dragonoide", "classeNome": "Xamã"})
	assert_eq(jogador["restricoes"], {"semArmadura": true})

func test_criar_personagem_lanca_erro_quando_o_nome_e_invalido() -> void:
	var resultado = CriarPersonagem.criar_personagem({"nome": "  ", "racaNome": "Anão", "classeNome": "Arqueiro"})
	assert_null(resultado)
	assert_push_error("Nome do personagem não pode ser vazio.")

func test_criar_personagem_lanca_erro_quando_a_raca_nao_existe() -> void:
	var resultado = CriarPersonagem.criar_personagem({"nome": "X", "racaNome": "Anjo", "classeNome": "Arqueiro"})
	assert_null(resultado)
	assert_push_error('Raça "Anjo" não existe.')
