<?php
header("Access-Control-Allow-Origin: https://www.epamig.tech, https://www.epamig.br");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

session_start();
require 'database.php'; // Inclua a conexão com o banco de dados

$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? null;

if (!$action) {
    echo json_encode(["success" => false, "message" => "Ação é obrigatória.", "data" => []]);
    exit;
}

if ($action === "register") {
    // Lógica existente para registro de novos usuários
    $nome = htmlspecialchars($data->nome ?? '', ENT_QUOTES, 'UTF-8');
    $email = filter_var($data->email ?? '', FILTER_SANITIZE_EMAIL);
    $password = $data->password ?? '';

    if (!$nome || !$email || !$password) {
        echo json_encode(["success" => false, "message" => "Todos os campos são obrigatórios.", "data" => []]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "E-mail inválido.", "data" => []]);
        exit;
    }

    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "E-mail já está em uso.", "data" => []]);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, nivel_permissao, status, data_cadastro) VALUES (?, ?, ?, ?, ?, ?)");
    $nivel_permissao = 1; // Permissão padrão
    $status = 1; // Ativo
    $data_cadastro = date('Y-m-d H:i:s');
    $stmt->bind_param("sssiss", $nome, $email, $hashedPassword, $nivel_permissao, $status, $data_cadastro);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Usuário cadastrado com sucesso.", "data" => []]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao cadastrar usuário.", "data" => []]);
    }
} elseif ($action === "login") {
    // Lógica existente para login
    $email = $data->email ?? null;
    $password = $data->password ?? null;

    if (!$email || !$password) {
        echo json_encode(["success" => false, "message" => "Email e senha são obrigatórios.", "data" => []]);
        exit;
    }

    $stmt = $conn->prepare("SELECT id, nome, senha, nivel_permissao, status FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "E-mail ou senha inválidos.", "data" => []]);
        exit;
    }

    $user = $result->fetch_assoc();

    if ($user['status'] == 0) {
        echo json_encode(["success" => false, "message" => "Usuário inativo.", "data" => []]);
        exit;
    }

    if (password_verify($password, $user['senha'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['nome'];

        unset($user['senha']); // Não enviar a senha para o cliente
        echo json_encode(["success" => true, "message" => "Login realizado com sucesso.", "data" => $user]);
    } else {
        echo json_encode(["success" => false, "message" => "E-mail ou senha inválidos.", "data" => []]);
    }
} elseif ($action === "get_user") {
    // Lógica existente para obter dados do usuário logado
    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        $stmt = $conn->prepare("SELECT nome, email, DATE_FORMAT(data_cadastro, '%d/%m/%Y') as data_cadastro FROM usuarios WHERE id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            echo json_encode(["success" => true, "data" => $user]);
        } else {
            echo json_encode(["success" => false, "message" => "Usuário não encontrado."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Usuário não logado.", "data" => []]);
    }
} elseif ($action === "change_password") {
    // Nova lógica para alteração de senha
    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        $current_password = $data->current_password ?? null;
        $new_password = $data->new_password ?? null;

        if (!$current_password || !$new_password) {
            echo json_encode(["success" => false, "message" => "Todos os campos são obrigatórios.", "data" => []]);
            exit;
        }

        $stmt = $conn->prepare("SELECT senha FROM usuarios WHERE id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();

            if (password_verify($current_password, $user['senha'])) {
                $hashedPassword = password_hash($new_password, PASSWORD_BCRYPT);
                $update_stmt = $conn->prepare("UPDATE usuarios SET senha = ? WHERE id = ?");
                $update_stmt->bind_param("si", $hashedPassword, $user_id);

                if ($update_stmt->execute()) {
                    echo json_encode(["success" => true, "message" => "Senha alterada com sucesso."]);
                } else {
                    echo json_encode(["success" => false, "message" => "Erro ao alterar a senha.", "data" => []]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Senha atual incorreta.", "data" => []]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Usuário não encontrado.", "data" => []]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Usuário não logado.", "data" => []]);
    }
}
?>