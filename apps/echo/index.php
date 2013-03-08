<?php
    header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
?>
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

    <!-- <?php include("theme.cfg"); ?> -->

    <?php include("dependencies.inc"); ?>

</head>

<script type="text/javascript">

    function initShape(){
        $.ajaxSetup({ cache: false });
        <?php include("shapes.js"); ?>
        shape.baseUrl = "http://localhost";
        var model = shape.newTransient("echo");
        shape.expandShapeComponent(document.getElementById("main"),null, model);
    }

    if(!$.isReady){
        //$(document).ready(initShape);
        jQuery(initShape);
    }else{
        initShape();
    }

    //alert(getBaseUrl());
</script>

<body >
    <div id="main" shape-view="mainViewEcho" shape-ctrl="echo" > Not loaded!!! </div>
</body>
</html>