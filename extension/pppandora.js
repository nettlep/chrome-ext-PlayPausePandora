chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
		console.log("Message received: ", request);
        if (request.greeting == "pandoraplayersayswhat") {
            sendResponse({message: "what?"});
            getSongInfo();
        }
 });

function getActionButton()
{
	return document.getElementsByClassName("Tuner__Control__Play__Button")[0];
}

function isPlaying(actionButton)
{
	return actionButton.outerHTML.indexOf("pause_button") != -1;
}

function isPaused(actionButton)
{
	return actionButton.outerHTML.indexOf("play_button") != -1;
}

function notifyPlayState()
{
	var actionButton = getActionButton();
	if (!actionButton)
	{
		chrome.runtime.sendMessage({ message: "play_state_unknown" });
	}
	else
	{
		chrome.runtime.sendMessage({ message: isPlaying(actionButton) ? "playing" : "paused" });
	}
}

function clickActionButton()
{
	var actionButton = getActionButton()
	if (actionButton)
	{
		var event = new MouseEvent('click', { 'view': window, 'bubbles': true, 'cancelable': true });
  		if (!actionButton.dispatchEvent(event))
		{
			console.log("Action button click was cancelled :/");
		}
		else
		{
			notifyPlayState();
		}
	}
	else
	{
		console.log("Unable to click the action button - not found :/");
	}
}

function pause()
{
	if (isPlaying())
	{
		clickActionButton();
	}
}

function play()
{
	if (isPaused())
	{
		clickActionButton();
	}
}

setupActionButtonHandler();
notifyPlayState();