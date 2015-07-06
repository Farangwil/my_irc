<?php
if(isset($_POST)){
	switch($_POST['action']){
		case 'login':
			echo 'login';
		break;
		case 'register' :
			var_dump($_POST);
			die('totototo');
		break;
	}
}
?>