extends Control

@onready var botao_nova_jornada: Button = %BotaoNovaJornada
@onready var botao_continuar: Button = %BotaoContinuar

func _ready() -> void:
	botao_nova_jornada.pressed.connect(_ao_pressionar_nova_jornada)
	# Fase 3 liga isso a um save real em user://save.json; por enquanto não há
	# save nenhum, então Continuar fica sempre desabilitado.
	botao_continuar.disabled = true

func _ao_pressionar_nova_jornada() -> void:
	get_tree().change_scene_to_file("res://scenes/criacao/Criacao.tscn")
