/* global browser */

function deleteRow(rowTr) {
	var mainTableBody = document.getElementById('mainTableBody');
	mainTableBody.removeChild(rowTr);
}

function isNumeric(str) {
  if (typeof str != "string") {return false;} // we only process strings!
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseInt(str)) // ...and ensure strings of whitespace fail
}

function createTableRow(feed) {
	var mainTableBody = document.getElementById('mainTableBody');
	var tr = mainTableBody.insertRow();

	Object.keys(feed).sort().forEach( (key) => {

		var input = document.createElement('input');
		input.className = key;
		input.style.width = '95%';
		switch (key) {
			case 'activ':
				input.placeholder = key;
				input.type='checkbox';
				input.checked= (typeof feed[key] === 'boolean') ? feed[key]: true;
				break;
			case 'annotation':
				input.placeholder = key;
				input.value = feed[key];
				break;
			case 'code':
				input.placeholder = 'css_selector';
				input.value = feed[key];
				break;
			case 'delay':
				input.placeholder = '1000';
				input.value = (feed[key] > -1) ? feed[key] : 1000;
				input.type='number';
				input.min=0;
				break;
			case 'url_regex':
				input.placeholder = 'url_regex';
				input.value = feed[key];
				break;
			default:
				return;
		}
		tr.insertCell().appendChild(input);
	});

	var button;
	if(feed.action === 'save'){
		button = createButton("Create", "saveButton", function() {}, true );
	}else{
		button = createButton("Delete", "deleteButton", function() { deleteRow(tr); }, false );
	}
	tr.insertCell().appendChild(button);
}

function collectConfig() {
	var mainTableBody = document.getElementById('mainTableBody');
	var feeds = [];
	for (var row = 0; row < mainTableBody.rows.length; row++) {
		try {
			var url_regex = mainTableBody.rows[row].querySelector('.url_regex').value.trim() || '';
			var ses = mainTableBody.rows[row].querySelector('.code').value || '';
			var desc = mainTableBody.rows[row].querySelector('.annotation').value.trim() || '';
			var check = mainTableBody.rows[row].querySelector('.activ').checked || false ;
			var delay = mainTableBody.rows[row].querySelector('.delay').value || 0;

			if(url_regex !== '' && ses !== '' && isNumeric(delay) ) {
				delay = parseInt(delay);
				feeds.push({
					'activ': check,
					'annotation': desc,
					'url_regex': url_regex,
					'code': ses,
					'delay': ( typeof delay !== 'number' || delay < 0)? 0 : delay
				});
			}
		}catch(e){
			console.error(e);
		}
	}
	return feeds;
}

function createButton(text, id, callback, submit) {
	var span = document.createElement('span');
	var button = document.createElement('button');
	button.id = id;
	button.textContent = text;
	button.className = "browser-style";
	if (submit) {
		button.type = "submit";
	} else {
		button.type = "button";
	}
	button.name = id;
	button.value = id;
	button.addEventListener("click", callback);
	span.appendChild(button);
	return span;
}

async function saveOptions() {
	var feeds = collectConfig();
	await browser.storage.local.set({ 'selectors': feeds });
}

async function restoreOptions() {
	createTableRow({
		'activ': 1,
		'annotation': '',
		'code': '' ,
		'url_regex': '',
		'action':'save',
		'delay' : -1,
	});
	var res = await browser.storage.local.get('selectors');
	if ( !Array.isArray(res.selectors) ) { return; }
	res.selectors.forEach( (selector) => {
		selector.action = 'delete'
		createTableRow(selector);
	});
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

const impbtnWrp = document.getElementById('impbtn_wrapper');
const impbtn = document.getElementById('impbtn');
const expbtn = document.getElementById('expbtn');

expbtn.addEventListener('click', async function () {
    var dl = document.createElement('a');
    var res = await browser.storage.local.get('selectors');
    var content = JSON.stringify(res.selectors,null,4);
    dl.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content));
    dl.setAttribute('download', 'data.json');
    dl.setAttribute('visibility', 'hidden');
    dl.setAttribute('display', 'none');
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
});

// delegate to real Import Button which is a file selector
impbtnWrp.addEventListener('click', function() {
	impbtn.click();
})

impbtn.addEventListener('input', function () {
	var file  = this.files[0];
	var reader = new FileReader();
            reader.onload = async function() {
            try {
                var config = JSON.parse(reader.result);
		await browser.storage.local.set({ 'selectors': config});
		document.querySelector("form").submit();
            } catch (e) {
                console.error('error loading file: ' + e);
            }
        };
        reader.readAsText(file);
});
