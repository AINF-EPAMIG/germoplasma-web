<?php
header("Access-Control-Allow-Origin: https://epamig.tech");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
session_start();
require 'database.php';

// Verifica se o usuário está autenticado
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado."]);
    exit;
}

// Verifica se a requisição é do tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Método HTTP inválido. Apenas POST é permitido."]);
    exit;
}

// Lê e decodifica os dados enviados no corpo da requisição
$data = json_decode(file_get_contents("php://input"), true);

// Valida os campos obrigatórios
$requiredFields = [
    "numero_acesso",
    "designacao_material",
    "local_coleta",
    "proprietario",
    "municipio_estado",
    "idade_lavoura",
    "data_coleta",
    "coletor"
];

foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "O campo $field é obrigatório."]);
        exit;
    }
}

// Insere o novo item no banco de dados
$stmt = $conn->prepare("INSERT INTO germoplasma_cafe (numero_acesso, designacao_material, local_coleta, proprietario, municipio_estado, idade_lavoura, data_coleta, coletor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param(
    "ssssssss",
    $data['numero_acesso'],
    $data['designacao_material'],
    $data['local_coleta'],
    $data['proprietario'],
    $data['municipio_estado'],
    $data['idade_lavoura'],
    $data['data_coleta'],
    $data['coletor']
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Item adicionado com sucesso."]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao adicionar item."]);
}

$stmt->close();
$conn->close();
?>
