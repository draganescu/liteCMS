<?php
require_once("cms.class.php");
define("EDIT_MODE", "secret");

$cms = cms::instance();
$cms->JS_VAR = "response";
$cms->EDIT_MODE = "secret";
$cms->DEFAULT = "index.html";

$cms->authenticate();
$cms->edit_page();
$cms->handle_file();

exit;

