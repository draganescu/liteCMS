<?php
class cms
{
	var $JS_VAR = "";
	var $EDIT_MODE = "";
	var $DEFAULT = "";

	private static $instance;

	function cms()
	{

	}

	function authenticate()
	{
		if(self::edit_mode())
		{
			if(strpos($_POST["uri_string"], $this->EDIT_MODE) !== false)
				self::json_output(array("authenticated"=>$this->EDIT_MODE));
			else
				self::json_output(array("authenticated"=>"false"));
		}
	}

	function getPage()
	{
		$cms = cms::instance();
		$segments = explode("/", $_POST['curi']);
		$page = explode("?", $segments[count($segments)-1]); //array pop or what?
		($page[0] == "") ? $page = $cms->DEFAULT : $page = $page[0];
		return $page;
	}

	function edit_page()
	{
		if(array_key_exists("edited_text", $_POST))
		{
			if($_POST["token"] != $this->EDIT_MODE)
				self::json_output(array("authenticated"=>"false")) and exit;
			$page = $this::getPage();
			$data = $this->handlePartials(str_replace('\"','"',stripslashes(urldecode($_POST["edited_text"]))));
			$this->handleUpdates($page, $data);
			file_put_contents("../".$page, $data);
			self::json_output(array("edited"=>true));
		}
	}

	function handleUpdates($file, $page)
	{
		$ress = preg_match_all('/<!-- res\.([a-z,_,-]*) -->/', $page, $ds);

		$files_to_edit = array();
		$dir = "../";
		if ($dh = opendir($dir)) {
			while (($filename = readdir($dh)) !== false) {

				if($filename != $file)
					if(strpos($filename, ".html") !== false)
						$files_to_edit[] = $filename;
			}
			closedir($dh);
		}

		foreach($files_to_edit as $f)
		{
			foreach($ds[0] as $key => $value) {
				$start = $value;
				$end = str_replace("<!-- ", "<!-- /", $value);
				$pos1 = strpos($page, $start) + strlen($start);
				$pos2 = strpos($page, $end) - $pos1;
				$new_data = substr($page, $pos1, $pos2);

				$drystart = "<!-- dry.".str_replace(".html","", $file).".".$ds[1][$key]." -->";
				$dryend = "<!-- /dry.".str_replace(".html","", $file).".".$ds[1][$key]." -->";

				$filedata = str_replace('\"','"',file_get_contents("../".$f));

				if(strpos($filedata, $drystart) === false)
					continue;

				$drypos1 = strpos($filedata, $drystart) + strlen($drystart);
				$drypos2 = strpos($filedata, $dryend) - $drypos1;

				$filedata = substr_replace($filedata, $new_data, $drypos1, $drypos2);

				//file_put_contents("test.txt", $drypos1."|".$drypos2."__", FILE_APPEND);
				//return;

				file_put_contents("../".$f, $filedata);

			}
		}

	}

	function handlePartials($page)
	{

		$res = preg_match_all('/<!-- dry\.([a-z,_,-,\/]*)\.([a-z,_,-]*) -->/', $page, $datastarts);

		foreach ($datastarts[0] as $key => $value) {					
			$start = $value;
			$end = str_replace("<!-- ", "<!-- /", $value);
			$pos1 = strpos($page, $start);
			$pos2 = strpos($page, $end) - $pos1 + strlen($end);

			$file = $datastarts[1][$key];

			if(!file_exists('../'.$file.".html"))
				$data = "<!-- template not found -->";
			else
			{
				if(!array_key_exists($file,$loaded_files))
					$loaded_files[$file] = file_get_contents('../'.$file.".html");

				$data = $loaded_files[$file];
			}

			$drystart = "<!-- res.".$datastarts[2][$key]." -->";
			$dryend = "<!-- /res.".$datastarts[2][$key]." -->";
			$drypos1 = strpos($data, $drystart) + strlen($drystart);
			$drypos2 = strpos($data, $dryend) - $drypos1;

			$data = $start."\n".substr($data, $drypos1, $drypos2)."\n".$end;

			$page = substr_replace($page, $data, $pos1, $pos2);
		}
		return $page;
	}

	function handle_file()
	{
		if(array_key_exists("new_page", $_POST))
		{
			if($_POST["token"] != $this->EDIT_MODE)
				self::json_output(array("authenticated"=>"false")) and exit;
			$page = self::getPage();
			$data = file_get_contents("../".$page);
			file_put_contents("../".$_POST["new_page"], $data);
			self::json_output(array("duplicated"=>true));
		}
	}

	static function edit_mode()
	{
		return array_key_exists("uri_string", $_POST);
	}

	static function json_output($data)
	{
		$app = cms::instance();
		echo "var ".$app->JS_VAR."=".json_encode($data);
	}

	static function instance()
	{
		if (!self::$instance)
		{
			self::$instance = new cms();
		}

		return self::$instance;
	}

}