var pandoraTabId = null;
var pandoraWindowId = null;
var isPlaying = false;
var wasPlaying = false;

var pandoraUrl = "https://www.pandora.com/";

function isPandoraUrl(url) {
  // Return whether the URL starts with the Pandora prefix.
  return url.indexOf(pandoraUrl) == 0;
}

function onInit()
{
  console.log("onInit");
}

function checkIfPandoraHasScripts()
{
  chrome.tabs.sendMessage(pandoraTabId, {greeting: "pandoraplayersayswhat"}, function(response) {
    console.log("response: " + response);
    if (response)
    {
        console.log("Content scripts already present");
    }
    else
    {
        console.log("Content scripts not there, injecting content scripts");
        chrome.tabs.executeScript(pandoraTabId, {file: "pppandora.js"});
    }
  });
}

function pandoraTabRemoved(tabId, oRemoveInfo)
{
  console.log(tabId + " " + pandoraTabId);
  if (tabId == pandoraTabId)
  {
    console.log("Pandora tab closed");
    chrome.browserAction.setIcon({path:"action-play.png"});
    isPlaying = false;
    pandoraTabId = null;
  }
}

function getAllWindows()
{
  chrome.windows.getAll({populate:true},function (windows)
  {
    for (var i = 0; i < windows.length; i++)
    {
      getPandoraTabId(windows[i].id);
    };
  });
}

function getPandoraTabId(windowId) {
  chrome.tabs.getAllInWindow(windowId, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && isPandoraUrl(tab.url)) {
        console.log("Found tab id: " + tab.id + " in window: " + windowId);
        pandoraTabId = tab.id;
        pandoraWindowId = window.id;
        onPandoraTabFound();
        checkIfPandoraHasScripts();
      }
    }
  });
}

function onPandoraTabFound() {
  chrome.browserAction.setIcon({path:"action-pause.png"});
  isPlaying = true;
}

function browserActionClicked() {
    if (pandoraTabId != null)
    {
      if (isPlaying)
      {
        chrome.browserAction.setIcon({path:"action-play.png"});
        isPlaying = false;
      }
      chrome.tabs.executeScript(pandoraTabId, {
        code: "clickActionButton();"
      });
    }
    else
    {
      console.log('Going to pandora...');
      chrome.browserAction.setIcon({path:"action-pause.png"});
      isPlaying = true;
      chrome.tabs.create({url: pandoraUrl});
      getAllWindows();
    }
}

function onMessage(request, sender, sendResponse)
{
  console.log("Received message: ", request.message);
  switch (request.message)
  {
    case "paused":
      chrome.browserAction.setIcon({path:"action-play.png"});
      isPlaying = false;
      break;
    case "playing":
      chrome.browserAction.setIcon({path:"action-pause.png"});
      isPlaying = true;
      break;
  }
}

function onCreated(tab) {
  console.log("Tab Created", tab);
  if (isPandoraUrl(tab.url)) {
    chrome.browserAction.setIcon({path:"action-pause.png"});
    isPlaying = true;
    pandoraTabId = tab.id;
  }
}

function onUpdated(tabId, oChangeInfo, tab) {
  console.log("Tab Updated", tab);
  if (tab.status == "complete" && isPandoraUrl(tab.url))
  {
    chrome.tabs.executeScript(pandoraTabId, { code: "notifyPlayState();" });    
    chrome.browserAction.setIcon({ path:"action-pause.png" });
    isPlaying = true;
    pandoraTabId = tab.id;
  }
  else if (tab.id == pandoraTabId && !isPandoraUrl(tab.url))
  {
    chrome.browserAction.setIcon({ path:"action-play.png" });
    isPlaying = false;
    pandoraTabId = null;
  }
}

getAllWindows();
chrome.browserAction.onClicked.addListener(browserActionClicked);
chrome.tabs.onRemoved.addListener(pandoraTabRemoved);
chrome.runtime.onMessage.addListener(onMessage);
chrome.runtime.onInstalled.addListener(onInit);
chrome.tabs.onCreated.addListener(onCreated);
chrome.tabs.onUpdated.addListener(onUpdated);
