let mediaRecorder;
let audioChunks = [];

// Show the progress container and reset the progress bar
function showProgress(message) {
    const progressContainer = document.getElementById("progressContainer");
    progressContainer.style.display = "block";
    document.getElementById("progressText").innerText = message;
    document.getElementById("progressBar").value = 0;
}

// Update the progress bar's value
function updateProgress(value) {
    document.getElementById("progressBar").value = value;
}

document.getElementById("startRecord").addEventListener("click", async () => {
    let audioChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
            
    mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(audioChunks, { type: 'video/webm' });
            const audioURL = window.URL.createObjectURL(blob);
            const audioPlayback = document.getElementById('audioPlayback');
                
            // Assign the blob URL to the hidden audio element
            audioPlayback.src = audioURL;

            // Enable the custom play button after recording is done
            document.getElementById("playAudioButton").disabled = false;

            // Upload the audio blob to the server
            const formData = new FormData();
            formData.append("audio_file", blob, "recording.webm");

            // Show progress for transcription
            showProgress("Transcribing...");

            const response = await fetch("/upload", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (response.status == 200) {
                const text = result["text"];
                document.getElementById("output").innerText = text;
                const language = document.getElementById("language").value;
                const sourceLang = document.getElementById("source-lang").value;

                // Update progress for translation
                updateProgress(33); // 33% for translation
                showProgress("Translating...");

                // Translate transcribed text
                const transResponse = await fetch("/translate", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({text: text, language: language, sourceLang: sourceLang})
                });

                const transData = await transResponse.json();

                if (transResponse.status == 200) {
                    const translatedText = transData["translated-text"];
                    document.getElementById("translated-text").innerText = translatedText;

                    // Update progress for synthesis
                    updateProgress(66); // 66% for synthesis
                    showProgress("Synthesizing...");

                    // Synthesize translated text
                    const synResponse = await fetch("/get-audio", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({text: translatedText, language: language})
                    });

                    synResponse.blob().then(outcome => {
                        // Generate a URL for the Blob
                        const audioURL = URL.createObjectURL(outcome);

                        // Set the audio URL to the audio player and play it
                        const audioPlayer = document.getElementById('audioPlayer');
                        audioPlayer.src = audioURL;
                        audioPlayer.play();
                    });

                    // Update progress to complete
                    updateProgress(100); // 100% complete
                    showProgress("Done!");
                }
                } else {
                    document.getElementById("output").innerText = "Server failed";
                    // Hide progress bar on failure
                    document.getElementById("progressContainer").style.display = "none";
                }
        };

    mediaRecorder.start();
    document.getElementById("startRecord").disabled = true;
    document.getElementById("stopRecord").disabled = false;
});

document.getElementById("stopRecord").addEventListener("click", () => {
    mediaRecorder.stop();
    document.getElementById("startRecord").disabled = false;
    document.getElementById("stopRecord").disabled = true;
});

// Play audio when the custom play button is clicked
document.getElementById("playAudioButton").addEventListener("click", () => {
    const audioPlayback = document.getElementById('audioPlayback');
    audioPlayback.play();
});

// Play audio when the custom play button is clicked (for recorded audio)
document.getElementById("playAudioButton").addEventListener("click", () => {
    const audioPlayback = document.getElementById('audioPlayback');
    audioPlayback.play();
});

// Play synthesized audio when the custom play button is clicked
document.getElementById("playSynthAudioButton").addEventListener("click", () => {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.play();
});

// After you generate the synthesized audio and set the source to the audioPlayer
// Enable the custom play button
document.getElementById("playSynthAudioButton").disabled = false;
