<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
        "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <META HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE">

    <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
    <meta content="01 Jan 1970 00:00:00 GMT, -1" http-equiv="Expires">
    <meta content="no-cache, no-store, must-revalidate" http-equiv="Cache-Control">
    <meta content="no-cache" http-equiv="Pragma">

    <link rel="stylesheet" type="text/css"  href="../../themes/default/todo/todo.css" />

    <?php include("deps.inc"); ?>

</head>

<script type="text/javascript">

    function Config(){
        var model = newTransientObject("todo");
        initialiseShape(document.getElementById("main"), model);
    }
    Config.prototype.globalCfg_BaseURL = "http://localhost";


    if(!$.isReady){
        $(document).ready(Config);
        jQuery(Config);
    }else{
        Config();
    }

    alert(getBaseUrl());
</script>

<body >
<div id="main" shape-view="todo/todo" > Not loaded!!! </div>
</body>
</html>