extends GutTest

## Espelha engine/personagem/racas.test.js.

func test_listar_racas_retorna_as_7_racas_disponiveis() -> void:
	var racas := Racas.listar_racas()
	assert_eq(racas.size(), 7)
	var nomes: Array = racas.map(func(r): return r["nome"])
	assert_eq(nomes, ["Anão", "Elfo", "Humano", "Morto-vivo", "Orc", "Bestial", "Dragonoide"])

func test_obter_raca_retorna_o_bonus_correto_do_anao() -> void:
	var raca: Dictionary = Racas.obter_raca("Anão")
	assert_eq(raca["bonus"], {"hp": 0, "atk": -3, "def": 15, "critChance": 0})
	assert_eq(raca["restricoes"], {})

func test_obter_raca_retorna_a_restricao_sem_armadura_do_dragonoide() -> void:
	var raca: Dictionary = Racas.obter_raca("Dragonoide")
	assert_eq(raca["bonus"], {"hp": 15, "atk": 5, "def": 0, "critChance": 0})
	assert_eq(raca["restricoes"], {"semArmadura": true})

func test_obter_raca_retorna_o_bonus_de_critico_do_bestial() -> void:
	var raca: Dictionary = Racas.obter_raca("Bestial")
	assert_eq(raca["bonus"]["critChance"], 10)

func test_obter_raca_lanca_erro_para_uma_raca_que_nao_existe() -> void:
	var resultado = Racas.obter_raca("Anjo")
	assert_null(resultado)
	assert_push_error('Raça "Anjo" não existe.')
