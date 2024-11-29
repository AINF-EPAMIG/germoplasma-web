<?php
// Cabeçalhos CORS e JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require 'database.php'; // Arquivo de conexão com o banco de dados

// Decodificar o JSON enviado pelo cliente
$data = json_decode(file_get_contents("php://input"));

// Verificar se a ação foi enviada
$action = $data->action ?? null;

if (!$action) {
    echo json_encode(["success" => false, "message" => "Action is required.", "data" => []]);
    exit;
}

if ($action === "register") {
    // Cadastro de um novo usuário
    $nome = $data->nome ?? null;
    $email = $data->email ?? null;
    $password = $data->password ?? null;

    if (!$nome) {
        echo json_encode(["success" => false, "message" => "Name is required for registration.", "data" => []]);
        exit;
    }

    if (!$email || !$password) {
        echo json_encode(["success" => false, "message" => "Email and password are required for registration.", "data" => []]);
        exit;
    }

    // Verificar se o e-mail já está em uso
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email already in use.", "data" => []]);
        exit;
    }

    // Gerar hash da senha
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Inserir usuário no banco de dados
    $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, nivel_permissao, status, data_cadastro) VALUES (?, ?, ?, ?, ?, ?)");
    $nivel_permissao = 1; // Nível padrão
    $status = 1; // Ativo por padrão
    $data_cadastro = date('Y-m-d H:i:s');
    $stmt->bind_param("sssiss", $nome, $email, $hashedPassword, $nivel_permissao, $status, $data_cadastro);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "User registered successfully.", "data" => []]);
    } else {
        echo json_encode(["success" => false, "message" => "Error registering user.", "data" => []]);
    }

} elseif ($action === "login") {
    // Login do usuário
    $email = $data->email ?? null;
    $password = $data->password ?? null;

    if (!$email || !$password) {
        echo json_encode(["success" => false, "message" => "Email and password are required for login.", "data" => []]);
        exit;
    }

    // Buscar usuário pelo email
    $stmt = $conn->prepare("SELECT id, nome, senha, nivel_permissao, status, data_cadastro FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Invalid email or password.", "data" => []]);
        exit;
    }

    $user = $result->fetch_assoc();

    // Verificar se o usuário está ativo
    if ($user['status'] == 0) {
        echo json_encode(["success" => false, "message" => "User is inactive.", "data" => []]);
        exit;
    }

    // Verificar senha
    if (password_verify($password, $user['senha'])) {
        unset($user['senha']); // Remover a senha para não enviar ao cliente
        echo json_encode(["success" => true, "message" => "Login successful.", "data" => $user]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid email or password.", "data" => []]);
    }

} else {
    echo json_encode(["success" => false, "message" => "Invalid action.", "data" => []]);
}
?>
