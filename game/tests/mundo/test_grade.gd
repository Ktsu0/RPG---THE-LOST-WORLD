extends GutTest

## Espelha engine/mundo/grade.test.js.

var legenda := {
	"#": {"tipo": "parede", "conteudo": null},
	".": {"tipo": "chao", "conteudo": null},
}

func test_converte_tracado_em_grade_de_celulas_com_coordenadas() -> void:
	var grade := Grade.criar_grade_de_tracado(["##", ".#"], legenda)
	assert_eq(grade.size(), 2)
	assert_eq(grade[0].size(), 2)
	assert_eq(grade[0][0], {"x": 0, "y": 0, "tipo": "parede", "conteudo": null})
	assert_eq(grade[1][0], {"x": 0, "y": 1, "tipo": "chao", "conteudo": null})

func test_lanca_erro_para_simbolo_fora_da_legenda() -> void:
	var resultado = Grade.criar_grade_de_tracado(["#X"], legenda)
	assert_eq(resultado, [])
	assert_push_error('Símbolo "X"')

func test_celula_em_retorna_a_celula_dentro_dos_limites() -> void:
	var grade := Grade.criar_grade_de_tracado(["..", ".."], legenda)
	assert_eq(Grade.celula_em(grade, 1, 1), {"x": 1, "y": 1, "tipo": "chao", "conteudo": null})

func test_celula_em_retorna_null_fora_dos_limites() -> void:
	var grade := Grade.criar_grade_de_tracado(["..", ".."], legenda)
	assert_null(Grade.celula_em(grade, -1, 0))
	assert_null(Grade.celula_em(grade, 2, 0))
	assert_null(Grade.celula_em(grade, 0, -1))
	assert_null(Grade.celula_em(grade, 0, 2))

func test_caminho_ate_retorna_vazio_quando_origem_e_destino_sao_iguais() -> void:
	var grade := Grade.criar_grade_de_tracado(["..."], legenda)
	assert_eq(Grade.caminho_ate(grade, {"x": 1, "y": 0}, {"x": 1, "y": 0}), [])

func test_caminho_ate_retorna_a_sequencia_ate_o_destino() -> void:
	var grade := Grade.criar_grade_de_tracado(["...."], legenda)
	var caminho: Array = Grade.caminho_ate(grade, {"x": 0, "y": 0}, {"x": 3, "y": 0})
	var coords: Array = caminho.map(func(c): return {"x": c["x"], "y": c["y"]})
	assert_eq(coords, [{"x": 1, "y": 0}, {"x": 2, "y": 0}, {"x": 3, "y": 0}])

func test_caminho_ate_retorna_null_quando_inalcancavel() -> void:
	var grade := Grade.criar_grade_de_tracado(["...", "###", "..."], legenda)
	assert_null(Grade.caminho_ate(grade, {"x": 0, "y": 0}, {"x": 2, "y": 2}))

func test_alcancavel_true_quando_existe_caminho() -> void:
	var grade := Grade.criar_grade_de_tracado(["...", "#.#", "..."], legenda)
	assert_true(Grade.alcancavel(grade, {"x": 0, "y": 0}, {"x": 2, "y": 2}))

func test_alcancavel_false_quando_paredes_bloqueiam() -> void:
	var grade := Grade.criar_grade_de_tracado(["...", "###", "..."], legenda)
	assert_false(Grade.alcancavel(grade, {"x": 0, "y": 0}, {"x": 2, "y": 2}))
