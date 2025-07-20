<!DOCTYPE html>
<html>
    <head>

        <link rel="stylesheet" href="./assets/css/style.css">

        <script src="./assets/js/jquery.js" type="text/javascript"></script>
        <script src="./assets/js/models.js" type="text/javascript"></script>

        <link rel="icon" href="./assets/img/favicons/favicon-16.png" sizes="16x16">
		<link rel="icon" href="./assets/img/favicons/favicon-32.png" sizes="32x32">
		<link rel="icon" href="./assets/img/favicons/favicon-64.png" sizes="64x64">

        <title>Space Impact</title>
    </head>
    <body>

        <div class="section">
            <div class="box-game">
                <div class="game">
                     <?php
                        $cols = 84;
                        $rows = 48;
                        for ($y = 0; $y < $rows; $y++) {
                            for ($x = 0; $x < $cols; $x++) {
                                $id = "p-{$x}-{$y}";
                                echo "<div class=\"pixel\" id=\"$id\"></div>";
                            }
                        }
                    ?>
                </div>
                <div class="bg-game"></div>
                <span id="msg-game">CARREGANDO...</span>
            </div>
        </div>
       
    </body>
</hrml>