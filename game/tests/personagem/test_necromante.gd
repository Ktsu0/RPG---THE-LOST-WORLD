extends GutTest

## Espelha engine/personagem/necromante.test.js.

func after_each() -> void:
	Aleatorio.fonte = func() -> float: return randf()

func test_deve_invocar_esqueleto_true_para_necromante_em_rodada_multipla_de_4() -> void:
	assert_true(Necromante.deve_invocar_esqueleto({"classe": "Necromante"}, 4))
	assert_true(Necromante.deve_invocar_esqueleto({"classe": "Necromante"}, 8))

func test_deve_invocar_esqueleto_false_para_outras_classes_ou_rodadas() -> void:
	assert_false(Necromante.deve_invocar_esqueleto({"classe": "Guerreiro"}, 4))
	assert_false(Necromante.deve_invocar_esqueleto({"classe": "Necromante"}, 5))

func test_quantidade_de_esqueletos_retorna_1_na_faixa_comum() -> void:
	Aleatorio.fonte = func() -> float: return 0.0
	assert_eq(Necromante.quantidade_de_esqueletos(), 1)

func test_quantidade_de_esqueletos_retorna_4_no_extremo_raro() -> void:
	Aleatorio.fonte = func() -> float: return 0.999
	assert_eq(Necromante.quantidade_de_esqueletos(), 4)

func test_criar_esqueleto_escala_hp_e_atk_com_o_nivel_do_jogador() -> void:
	var esqueleto := Necromante.criar_esqueleto({"nivel": 4})
	assert_eq(esqueleto, {"hp": 21, "atk": 7}) # 15+floor(4*1.5)=21, 5+floor(4*0.5)=7

func test_ataque_esqueletos_soma_o_ataque_de_todos_os_esqueletos_vivos() -> void:
	var inimigo := {"hp": 50}
	var esqueletos: Array[Dictionary] = [{"hp": 10, "atk": 5}, {"hp": 8, "atk": 3}]
	var total := Necromante.ataque_esqueletos(inimigo, esqueletos)
	assert_eq(total, 8)
	assert_eq(inimigo["hp"], 42)

func test_absorver_dano_primeiro_esqueleto_absorve_e_sobrevive() -> void:
	var esqueletos: Array[Dictionary] = [{"hp": 10, "atk": 5}, {"hp": 20, "atk": 3}]
	var resultado := Necromante.absorver_dano_com_esqueletos(esqueletos, 6)
	assert_eq(resultado["danoRestante"], 0)
	assert_eq(resultado["esqueletos"], [{"hp": 4, "atk": 5}, {"hp": 20, "atk": 3}])

func test_absorver_dano_remove_o_esqueleto_da_fila_quando_ele_morre() -> void:
	var esqueletos: Array[Dictionary] = [{"hp": 5, "atk": 5}, {"hp": 20, "atk": 3}]
	var resultado := Necromante.absorver_dano_com_esqueletos(esqueletos, 6)
	assert_eq(resultado["danoRestante"], 0)
	assert_eq(resultado["esqueletos"], [{"hp": 20, "atk": 3}])

func test_absorver_dano_retorna_o_dano_cheio_quando_nao_ha_esqueletos() -> void:
	var esqueletos: Array[Dictionary] = []
	var resultado := Necromante.absorver_dano_com_esqueletos(esqueletos, 10)
	assert_eq(resultado, {"esqueletos": [], "danoRestante": 10})
