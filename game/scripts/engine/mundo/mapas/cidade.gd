class_name Cidade
extends RefCounted

## Porte de engine/mundo/mapas/cidade.js.

const LEGENDA_CIDADE := {
	"#": {"tipo": "parede", "conteudo": null},
	".": {"tipo": "chao", "conteudo": null},
	"@": {"tipo": "chao", "conteudo": null},
	"G": {"tipo": "hotspot", "conteudo": {"hotspot": "guilda", "rotulo": "Guilda"}},
	"L": {"tipo": "hotspot", "conteudo": {"hotspot": "loja", "rotulo": "Loja"}},
	"P": {"tipo": "hotspot", "conteudo": {"hotspot": "personagem", "rotulo": "Personagem"}},
	"T": {"tipo": "hotspot", "conteudo": {"hotspot": "torre", "rotulo": "Torre"}},
	"C": {"tipo": "hotspot", "conteudo": {"hotspot": "configuracao", "rotulo": "Configurações"}},
	"M": {"tipo": "hotspot", "conteudo": {"hotspot": "masmorra", "rotulo": "Masmorra"}},
	"A": {"tipo": "hotspot", "conteudo": {"hotspot": "arena", "rotulo": "Arena"}},
	"E": {"tipo": "hotspot", "conteudo": {"hotspot": "explorar", "rotulo": "Explorar"}},
}

## "@" marca a posição inicial só como referência visual do traçado — a
## posição real é POSICAO_INICIAL_CIDADE abaixo, mantidas em sincronia manualmente.
const TRACADO_CIDADE: Array[String] = [
	"###########",
	"#G.L.P.T.C#",
	"#.........#",
	"#M...@...A#",
	"#.........#",
	"#....E....#",
	"###########",
]

const POSICAO_INICIAL_CIDADE := {"x": 5, "y": 3}

static func criar_mapa_cidade() -> Array:
	return Grade.criar_grade_de_tracado(TRACADO_CIDADE, LEGENDA_CIDADE)
