window.addEventListener("load", () => {
	async function postRequest(input, output) {
		try {
			fetch("https://factcheckerback.onrender.com/stream", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(input)
			})
			.then(response => response.json())
			.then(data => {
				if (data.output) {
					output.innerHTML = "";
					const htmlText = convertToHTML(data.output, data.image_url);
					displayWithOpacityWave(htmlText, output);
				} else {
					output.innerHTML = "Something went wrong! Please try again";
				}
			})
			.catch(error => {
				output.innerHTML = "There seems to be some problem with the server, please contact: hanxyz1818@gmail.com";
			});
		} catch (error) {
			output.innerHTML = "There seems to be some problem with the server, please contact hanxyz1818@gmail.com";
		}
	}

	function start() {
		const tweets = document.querySelectorAll("article[data-testid='tweet']");
		tweets.forEach(tweet => {
			if (tweet.querySelector(".custom-button")) {
				return;
			}

			const actionDiv = [...tweet.querySelectorAll("div[aria-label]")].find(
				div => div.getAttribute("role") === "group"
			);

			if (actionDiv) {
				const buttonWrapper = document.createElement("div");
				const button = document.createElement("div");
				buttonWrapper.appendChild(button);
				buttonWrapper.className = "custom-button-wrapper";
				button.className = "custom-button";
				button.addEventListener("click", event => parsingAndPost(tweet, event, actionDiv));

				actionDiv.appendChild(buttonWrapper);
			}
		});
	}

	function parsingAndPost(tweet, event, actionDiv) {
		event.stopPropagation();
		var elements = tweet.querySelectorAll('[data-testid="tweetText"] img, [data-testid="tweetText"] span');
		var tweetText = Array.from(elements).map(element => {
			if (element.tagName.toLowerCase() === 'img') {
				return element.alt;
			} else if (element.tagName.toLowerCase() === 'span') {
				return element.textContent;
			}
		});
		console.log("tweetText", tweetText);
	
		const imageElement = tweet.querySelector('img[src*="twimg.com"][alt="Image"]');
		const imageUrl = imageElement ? imageElement.src : null;

		const timeElement = tweet.querySelector('time');
		const time = timeElement ? timeElement.getAttribute('datetime') : null;
		console.log("time", time);
	
		let responseDiv = tweet.querySelector(".response-div");
		if (!responseDiv) {
			responseDiv = document.createElement("div");
			responseDiv.className = "response-div";
			const parent = actionDiv.parentElement;
			parent.appendChild(responseDiv);
		}
	
		responseDiv.innerHTML = "";
		const loadingAnimation = createLoadingAnimation();
		responseDiv.appendChild(loadingAnimation);
	
		setTimeout(() => {
			responseDiv.scrollIntoView({ behavior: "smooth", block: "center" });
		}, 100);
	
		const postData = {
			input: tweetText,
			image: imageUrl,
			time: time
		};
		console.log("postData", postData);
		postRequest(postData, responseDiv)
	}

	setInterval(start, 2000);
});



function convertToHTML(text, imageURL) {
	// Convert links
	let html = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
	// Convert bold
	html = html.replace(/\*\*([^\*]+)\*\*/g, "<strong>$1</strong>");
	// Convert italics
	html = html.replace(/\*([^\*]+)\*/g, "<em>$1</em>");
	// Convert headers
	html = html.replace(/###### ([^\n]+)\n/g, "<h6>$1</h6>");
	html = html.replace(/##### ([^\n]+)\n/g, "<h5>$1</h5>");
	html = html.replace(/#### ([^\n]+)\n/g, "<h4>$1</h4>");
	html = html.replace(/### ([^\n]+)\n/g, "<h3>$1</h3>");
	html = html.replace(/## ([^\n]+)\n/g, "<h2>$1</h2>");
	html = html.replace(/# ([^\n]+)\n/g, "<h1>$1</h1>");
	// Convert newlines to paragraphs
	html = html.replace(/\n\n/g, "</p><p>");

    if (imageURL) {
        html += `<p><img src="${imageURL}" alt="image"></p>`;
    }
	
	return html;
}



function createLoadingAnimation() {
	const loadingContainer = document.createElement("div");
	loadingContainer.className = "circular-progress";

	const progressCircle = document.createElement("div");
	progressCircle.className = "progress-circle";

	loadingContainer.appendChild(progressCircle);

	return loadingContainer;
}

function displayWithOpacityWave(text, element) {
	element.innerHTML = "";
	const wrapper = document.createElement("div");
	wrapper.className = "opacity-wave";
	const span = document.createElement("span");
	span.innerHTML = text;
	wrapper.appendChild(span);
	element.appendChild(wrapper);
}
