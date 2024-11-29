<?php
// Configurações de cabeçalhos para CORS
header("Access-Control-Allow-Origin: https://www.epamig.br"); // Substitua pelo domínio do cliente
header("Access-Control-Allow-Credentials: true"); // Permitir envio de cookies
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

session_start();
require 'database.php'; // Conexão com o banco de dados

// Decodificar o JSON enviado pelo cliente
$data = json_decode(file_get_contents("php://input"));

// Verificar se a ação foi enviada
$action = $data->action ?? null;

if (!$action) {
    echo json_encode(["success" => false, "message" => "Action is required."]);
    exit;
}

if ($action === "login") {
    $email = $data->email ?? null;
    $password = $data->password ?? null;

    if (!$email || !$password) {
        echo json_encode(["success" => false, "message" => "Email and password are required."]);
        exit;
    }

    // Verificar o usuário no banco de dados
    $stmt = $conn->prepare("SELECT id, nome, senha FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
        exit;
    }

    $user = $result->fetch_assoc();
    if (password_verify($password, $user['senha'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['nome'];

        echo json_encode(["success" => true, "data" => ["id" => $user['id'], "nome" => $user['nome']]]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    }
} elseif ($action === "get_user") {
    if (isset($_SESSION['user_id'])) {
        echo json_encode(["success" => true, "data" => ["id" => $_SESSION['user_id'], "nome" => $_SESSION['user_name"]]]);
    } else {
        echo json_encode(["success" => false, "message" => "Not logged in."]);
    }
} elseif ($action === "logout") {
    session_destroy();
    echo json_encode(["success" => true, "message" => "Logged out successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid action."]);
}
?>
