function cms_page(instance)
{
	CMS_INSTANCE = "";
	this.CMS_styles = ".current{background-color: silver; cursor: pointer; border: navy 1px solid;} \n";
	this.CMS_styles += "textarea.cms_editor{display:block;width:600px; height:400px;position:fixed;top:10px;padding:5px;left:50%;margin-left:-300px;} \n";
	this.CMS_styles += "input.cms_save{display:block;position:fixed;top:10px;right:60px;margin-right:10px;} \n";
	this.CMS_styles += "input.cms_close{display:block;position:fixed;top:10px;right:0;margin-right:10px;} \n";
	this.editables = ["a","div","p"];
	
	this.BASE_URI = window.location.toString().split("/")//.pop().join("/");
	this.BASE_URI.pop();
	this.BASE_URI = this.BASE_URI.join("/") + "/";
	
	this.ajax = function(u,f,d,x)
	{
		
		CMS_INSTANCE.JSONCode=document.createElement("script");
		CMS_INSTANCE.JSONCode.setAttribute("type","text/javascript");
		document.getElementsByTagName("head")[0].appendChild(CMS_INSTANCE.JSONCode);
		
		x=this.ActiveXObject;
		x=new(x?x:XMLHttpRequest)('Microsoft.XMLHTTP');
		x.open(d?'POST':'GET',u,1);
		x.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		x.onreadystatechange=function()
		{
			if(x.readyState>3&&f)
			{
				CMS_INSTANCE.JSONCode.text=x.responseText;
				f();
			};
		};
		x.send(d)
	}
	
	this.setup = function()
	{
		
		CMS_INSTANCE.EDITStyles=document.createElement("style");
		CMS_INSTANCE.EDITStyles.setAttribute("type","text/css");
		document.getElementsByTagName("head")[0].appendChild(CMS_INSTANCE.EDITStyles);
		CMS_INSTANCE.EDITStyles.id = "cms_styles";
		
		var location = window.location.toString();
		if(location.indexOf("edit_mode") != -1)
		{
			CMS_INSTANCE.ajax("lite/cms.php", function(){
				if(typeof response != undefined && response.authenticated != "false")
				{
					CMS_INSTANCE.authenticated = response.authenticated;
					CMS_INSTANCE.create_UI();
				}
				else
					return false;
			}, "uri_string="+escape(location));
		}
	}
	
	this.hasClass = function (ele,cls) {
		return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
	}

	this.addClass = function (ele,cls) {
		if (!this.hasClass(ele,cls)) ele.className += " "+cls;
	}

	this.removeClass = function (ele,cls) {
		if (hasClass(ele,cls)) {
			var reg = new RegExp('(\\s{0,1}|^)'+cls+'(\\s{0,1}|$)');
			ele.className=ele.className.replace(reg,'');
		}
	}
	
	this.getEditables = function()
	{
		var block_elements = new Array();
		var i = 0;
		for (e in CMS_INSTANCE.editables)
		{
			var elements = document.getElementsByTagName(editables[e]);
			for(var k=0; k < elements.length ; i++, k++)
				block_elements[i] = elements.item(k);
		}
		return block_elements;
	}
	
	this.create_UI = function()
	{
		CMS_INSTANCE.EDITStyles.innerHTML = this.CMS_styles;
		
		var block_elements = CMS_INSTANCE.getEditables();
		
		for(el in block_elements)
		{
			elem = block_elements[el];
			elem.onmouseover = function(event) { 
				CMS_INSTANCE.addClass(event.target, "current"); event.stopPropagation(); return false; };
			elem.onmouseout = function(event) { 
				CMS_INSTANCE.removeClass(event.target, "current"); event.stopPropagation(); return false;};
			elem.onclick = function(event) {
				CMS_INSTANCE.editElement(event.target); event.stopPropagation(); return false;}
		}
	}
	
	this.develop = function (el)
	{
		CMS_INSTANCE.currentElement = el;
		CMS_INSTANCE.cms_editor = document.createElement("textarea");
		document.getElementsByTagName("body")[0].appendChild(CMS_INSTANCE.cms_editor);
		CMS_INSTANCE.addClass(CMS_INSTANCE.cms_editor, "cms_editor");
		CMS_INSTANCE.cms_editor.id = "the_cms_editor";
		CMS_INSTANCE.cms_editor.value = el.innerHTML;
		
		CMS_INSTANCE.cms_save = document.createElement("input");
		CMS_INSTANCE.cms_save.type = "button";
		CMS_INSTANCE.cms_save.value = "Save your changes";
		CMS_INSTANCE.addClass(CMS_INSTANCE.cms_save, "cms_save");
		
		var node = document.getElementsByTagName("body")[0];
		node.insertBefore(CMS_INSTANCE.cms_save, CMS_INSTANCE.cms_editor);
		
		CMS_INSTANCE.cms_close = document.createElement("input");
		CMS_INSTANCE.cms_close.type = "button";
		CMS_INSTANCE.cms_close.value = "Close";
		CMS_INSTANCE.addClass(CMS_INSTANCE.cms_close, "cms_close");
		
		var node = document.getElementsByTagName("body")[0];
		node.insertBefore(CMS_INSTANCE.cms_close, CMS_INSTANCE.cms_editor);
	}
	
	this.removeUI = function()
	{
		var block_elements = CMS_INSTANCE.getEditables();

		for(el in block_elements)
		{
			elem = block_elements[el];
			elem.onmouseover = null;
			elem.onmouseout = null;
			elem.onclick = null;
		}
	}
	
	this.removeEditor = function()
	{
		CMS_INSTANCE.cms_editor.parentNode.removeChild(CMS_INSTANCE.cms_editor);
		CMS_INSTANCE.cms_save.parentNode.removeChild(CMS_INSTANCE.cms_save);
		CMS_INSTANCE.cms_close.parentNode.removeChild(CMS_INSTANCE.cms_close);
		CMS_INSTANCE.create_UI();
	}
	
	this.duplicate = function(data)
	{
		CMS_INSTANCE.newpage = data.replace("cms-duplicate", "").replace(/^\s+|\s+$/g,"");
		var postData = "token="+CMS_INSTANCE.authenticated
						+"&new_page="+escape(CMS_INSTANCE.newpage)
						+"&curi="+window.location.toString();
		
		CMS_INSTANCE.ajax("lite/cms.php", function(){
			if(response.duplicated == true)
				window.location.href = CMS_INSTANCE.BASE_URI + CMS_INSTANCE.newpage + "?edit_mode=" + CMS_INSTANCE.authenticated;
		}, postData);
		
		return true;
	}
	
	this.editElement = function(el)
	{
		
		CMS_INSTANCE.removeUI();
		CMS_INSTANCE.develop(el);
		
		CMS_INSTANCE.cms_close.onclick = function(){
			CMS_INSTANCE.removeEditor();
		}
		
		CMS_INSTANCE.cms_save.onclick = function(){
			
			if(CMS_INSTANCE.cms_editor.value.indexOf("cms-duplicate") != -1)
			{
				CMS_INSTANCE.duplicate(CMS_INSTANCE.cms_editor.value);
				return;
			}
			
			var newHTML = CMS_INSTANCE.cms_editor.value;
			var oldHTML = CMS_INSTANCE.currentElement.innerHTML;
			
			CMS_INSTANCE.currentElement.innerHTML = CMS_INSTANCE.cms_editor.value;
			CMS_INSTANCE.unsetup();
			CMS_INSTANCE.removeEditor();
						
			var htmlnode = document.getElementsByTagName("html")[0];
			var pageHTML = "<!DOCTYPE html> \n <html> \n" + htmlnode.innerHTML + "\n </html>";
			
			var postData = "token="+CMS_INSTANCE.authenticated
							+"&edited_text="+escape(pageHTML)
							+"&curi="+window.location.toString();
			
			CMS_INSTANCE.ajax("lite/cms.php", function(){
				window.location.href = window.location.href + "&rand=" + Math.random();
			}, postData);
			
			
		}
	}
	
	this.unsetup = function()
	{
		elements = CMS_INSTANCE.getElementsByClassName("current");
		for(el in elements)
			CMS_INSTANCE.removeClass(elements[el], "current");
				
		CMS_INSTANCE.JSONCode.parentNode.removeChild(CMS_INSTANCE.JSONCode);
		CMS_INSTANCE.EDITStyles.parentNode.removeChild(CMS_INSTANCE.EDITStyles);
	}
	
	this.getElementsByClassName = function (className, tag, elm){
		if (document.getElementsByClassName) {
			getElementsByClassName = function (className, tag, elm) {
				elm = elm || document;
				var elements = elm.getElementsByClassName(className),
					nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
					returnElements = [],
					current;
				for(var i=0, il=elements.length; i<il; i+=1){
					current = elements[i];
					if(!nodeName || nodeName.test(current.nodeName)) {
						returnElements.push(current);
					}
				}
				return returnElements;
			};
		}
		else if (document.evaluate) {
			getElementsByClassName = function (className, tag, elm) {
				tag = tag || "*";
				elm = elm || document;
				var classes = className.split(" "),
					classesToCheck = "",
					xhtmlNamespace = "http://www.w3.org/1999/xhtml",
					namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
					returnElements = [],
					elements,
					node;
				for(var j=0, jl=classes.length; j<jl; j+=1){
					classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
				}
				try	{
					elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
				}
				catch (e) {
					elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
				}
				while ((node = elements.iterateNext())) {
					returnElements.push(node);
				}
				return returnElements;
			};
		}
		else
		{
			getElementsByClassName = function (className, tag, elm) {
				tag = tag || "*";
				elm = elm || document;
				var classes = className.split(" "),
					classesToCheck = [],
					elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
					current,
					returnElements = [],
					match;
				for(var k=0, kl=classes.length; k<kl; k+=1){
					classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
				}
				for(var l=0, ll=elements.length; l<ll; l+=1){
					current = elements[l];
					match = false;
					for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
						match = classesToCheck[m].test(current.className);
						if (!match) {
							break;
						}
					}
					if (match) {
						returnElements.push(current);
					}
				}
				return returnElements;
			};
		}
		return getElementsByClassName(className, tag, elm);
	};
	
	if (instance == true)
		CMS_INSTANCE = new cms_page(false);
	
	return CMS_INSTANCE;
}


window.onload=function(){
	var page = cms_page(true);
	page.setup();
	page.test = "asdasda";
}