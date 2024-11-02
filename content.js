const devMode = false;

window.addEventListener("load", () => {
	console.log("Twitter bot running...");
	if (devMode) {
		console.log("Dev mode active");
	}

	async function fetchPostData(postData, responseDiv) {
		if (!devMode) {
			try {
				fetch("https://factcheckerback.onrender.com/stream", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(postData)
				})
				.then(response => response.json())
				.then(data => {
					if (data.output) {
						responseDiv.innerHTML = "";
						const formattedText = convertMarkdownToHTML(data.output, data.image_url);
						displayWithOpacityWave(formattedText, responseDiv);
					} else {
						responseDiv.innerHTML = "No result returned";
					}
				})
				.catch(error => {
					console.error("Error fetching the API: ", error);
					responseDiv.innerHTML = "Error fetching the API";
				});
			} catch (error) {
				console.error("Error in fetchPostData:", error);
				responseDiv.innerHTML = "An error occurred. Please try reloading the page.";
			}
		} else {
			// Dev mode code remains unchanged
			setTimeout(() => {
				let data = "Test response data for development mode.";
				responseDiv.innerHTML = "";
				const formattedText = convertMarkdownToHTML(data);
				displayWithOpacityWave(formattedText, responseDiv);
			}, 2000);
		}
	}

	function addButtonToTweets() {
		console.log("Adding button to tweets");
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
				console.log("Adding button to tweet11");
				button.addEventListener("click", event => triggerFunctionality(tweet, event, actionDiv));

				actionDiv.appendChild(buttonWrapper);
			}
		});
	}

	function triggerFunctionality(tweet, event, actionDiv) {
		event.stopPropagation();
		var elements = tweet.querySelectorAll('[data-testid="tweetText"] img, [data-testid="tweetText"] span');
		var tweetText = Array.from(elements).map(element => {
			if (element.tagName.toLowerCase() === 'img') {
				return element.alt;  // 对于 img 标签，返回 alt 属性
			} else if (element.tagName.toLowerCase() === 'span') {
				return element.textContent;  // 对于 span 标签，返回包括所有嵌套文本的文本内容
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
		fetchPostData(postData, responseDiv)
	}

	setInterval(addButtonToTweets, 2000);
});



function convertMarkdownToHTML(markdown, imageURL) {
	// Convert links
	console.log("markdown", markdown);
	let html = markdown.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
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

	// Add an image if imageURL is provided
    if (imageURL) {
        html += `<p><img src="${imageURL}" alt="Markdown Image"></p>`;
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

function removeLoadingAnimation(loadingContainer) {
	return new Promise(resolve => {
			loadingContainer.classList.remove("fade-in");
			loadingContainer.addEventListener(
				"transitionend",
				() => {
					loadingContainer.remove();
					resolve();
				},
				{ once: true }
			);
		});
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
