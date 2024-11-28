<?php
$servername = "localhost";
$username = "u711845530_germoplasma";
$password = "*Desenvolvimento2023";
$database = "u711845530_germoplasma";

$conn = new mysqli($servername,$username,$password,$database);

if($conn->connect_error){
    die("A conexão falhou: ".$conn->connect_error);
}



?>