let bookmark_urls = new Set();

function recGetBookmarkUrls(bookmarkItem){
	let urls = [];
	if(bookmarkItem.url){
		urls.push(bookmarkItem.url);
	}else
	if(bookmarkItem.children){
		for(var child of bookmarkItem.children){
			urls = urls.concat(recGetBookmarkUrls(child));
		}
	}
	return urls;
}

async function updateBookmarkUrls() {
	bookmark_urls = new Set(recGetBookmarkUrls((await browser.bookmarks.getTree())[0]));
}

async function checkIfBookmarked(message) {
	return bookmark_urls.has(message.url);
}

browser.runtime.onMessage.addListener(checkIfBookmarked);
browser.runtime.onStartup.addListener(updateBookmarkUrls);
browser.runtime.onInstalled.addListener(updateBookmarkUrls);
browser.bookmarks.onCreated.addListener(updateBookmarkUrls);
browser.bookmarks.onRemoved.addListener(updateBookmarkUrls);

