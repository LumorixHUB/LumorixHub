extends Node3D

var player: CharacterBody3D
var camera_pivot: Node3D
var mouse_sensitivity := 0.002
var gravity := 18.0

func _ready() -> void:
    _create_world()
    _create_player()
    Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _input(event: InputEvent) -> void:
    if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
        player.rotate_y(-event.relative.x * mouse_sensitivity)
        camera_pivot.rotate_x(-event.relative.y * mouse_sensitivity)
        camera_pivot.rotation.x = clamp(camera_pivot.rotation.x, -1.0, 0.6)

    if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
        Input.mouse_mode = Input.MOUSE_MODE_VISIBLE

    if event is InputEventMouseButton and event.pressed:
        Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _physics_process(delta: float) -> void:
    var input_dir := Vector2.ZERO
    input_dir.x = Input.get_action_strength("move_right") - Input.get_action_strength("move_left")
    input_dir.y = Input.get_action_strength("move_back") - Input.get_action_strength("move_forward")

    var direction := (player.global_transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()
    player.velocity.x = direction.x * 6.0
    player.velocity.z = direction.z * 6.0

    if not player.is_on_floor():
        player.velocity.y -= gravity * delta
    else:
        player.velocity.y = 0.0

    player.move_and_slide()

func _create_world() -> void:
    var ground_body := StaticBody3D.new()
    ground_body.name = "Ground"
    add_child(ground_body)

    var ground := MeshInstance3D.new()
    var ground_mesh := PlaneMesh.new()
    ground_mesh.size = Vector2(200, 200)
    ground.mesh = ground_mesh

    var grass := StandardMaterial3D.new()
    grass.albedo_color = Color(0.24, 0.42, 0.19)
    ground.material_override = grass
    ground_body.add_child(ground)

    var ground_collision := CollisionShape3D.new()
    var ground_shape := BoxShape3D.new()
    ground_shape.size = Vector3(200, 0.2, 200)
    ground_collision.shape = ground_shape
    ground_collision.position.y = -0.1
    ground_body.add_child(ground_collision)

    var environment := WorldEnvironment.new()
    var env := Environment.new()
    env.background_mode = Environment.BG_SKY
    env.sky = Sky.new()
    env.sky.sky_material = ProceduralSkyMaterial.new()
    env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    env.ambient_light_color = Color(0.65, 0.72, 0.8)
    env.ambient_light_energy = 0.8
    environment.environment = env
    add_child(environment)

    var sun := DirectionalLight3D.new()
    sun.rotation_degrees = Vector3(-48, -30, 0)
    sun.light_energy = 1.2
    add_child(sun)

    for i in range(45):
        var x := randf_range(-65, 65)
        var z := randf_range(-65, 65)
        if Vector2(x, z).length() < 9:
            continue

        var tree := Node3D.new()
        tree.position = Vector3(x, 0, z)
        add_child(tree)

        var trunk := MeshInstance3D.new()
        var trunk_mesh := CylinderMesh.new()
        trunk_mesh.top_radius = 0.25
        trunk_mesh.bottom_radius = 0.4
        trunk_mesh.height = 2.8
        trunk.mesh = trunk_mesh
        var bark := StandardMaterial3D.new()
        bark.albedo_color = Color(0.3, 0.19, 0.1)
        trunk.material_override = bark
        trunk.position.y = 1.4
        tree.add_child(trunk)

        var crown := MeshInstance3D.new()
        var crown_mesh := SphereMesh.new()
        crown_mesh.radius = 1.5
        crown_mesh.height = 3.0
        crown.mesh = crown_mesh
        var leaves := StandardMaterial3D.new()
        leaves.albedo_color = Color(0.12, randf_range(0.28, 0.42), 0.13)
        crown.material_override = leaves
        crown.position.y = 3.1
        tree.add_child(crown)

func _create_player() -> void:
    player = CharacterBody3D.new()
    player.name = "Player"
    player.position = Vector3(0, 1.2, 0)
    add_child(player)

    var body := MeshInstance3D.new()
    var capsule := CapsuleMesh.new()
    capsule.radius = 0.42
    capsule.height = 1.8
    body.mesh = capsule
    var outfit := StandardMaterial3D.new()
    outfit.albedo_color = Color(0.75, 0.56, 0.29)
    body.material_override = outfit
    player.add_child(body)

    var collider := CollisionShape3D.new()
    var shape := CapsuleShape3D.new()
    shape.radius = 0.42
    shape.height = 1.8
    collider.shape = shape
    player.add_child(collider)

    camera_pivot = Node3D.new()
    camera_pivot.position = Vector3(0, 1.35, 0)
    player.add_child(camera_pivot)

    var camera := Camera3D.new()
    camera.position = Vector3(0, 1.0, 5.5)
    camera.rotation_degrees.x = -10
    camera.current = true
    camera_pivot.add_child(camera)
