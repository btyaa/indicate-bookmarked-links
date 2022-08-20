/* global browser */

function reset(e) {

	e.target.classList.remove('isBookmarked');
	//e.target.classList.remove('isNotBookmarked');

	e.target.title = e.target.oldtitle;
	e.target.oldtitle = '';
}

async function getInfo(e) {
	if (e.target.tagName === "A") {
		const isbookmarked = await browser.runtime.sendMessage({"url": e.target.href});
		e.target.oldtitle = e.target.title;
		if(isbookmarked){
			e.target.classList.add('isBookmarked');
			e.target.title ='already bookmarked';
		}
		/*else{
			e.target.classList.add('isNotBookmarked');
			e.target.title ='not bookmarked yet';
		}*/
	}
}

function updateEventListeners() {
	const links = document.querySelectorAll('a');
	for(const link of links) {
		link.removeEventListener("mouseenter", getInfo);
		link.removeEventListener("mouseleave", reset);
		link.addEventListener("mouseenter", getInfo);
		link.addEventListener("mouseleave", reset);
	}
}

updateEventListeners();

(new MutationObserver(updateEventListeners)).observe(document.body, { attributes: false, childList: true, subtree: true });

