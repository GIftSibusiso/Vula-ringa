document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start");
  const stopButton = document.getElementById("stop");
  const sendButton = document.getElementById("send");
  const audioPlayback = document.getElementById("audioPlayback");

  let mediaRecorder;
  let audioChunks = [];

  startButton.addEventListener("click", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayback.src = audioUrl;
      sendButton.disabled = false;
    };

    mediaRecorder.start();
    startButton.disabled = true;
    stopButton.disabled = false;
  });

  stopButton.addEventListener("click", () => {
    mediaRecorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
  });

  sendButton.addEventListener("click", () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");

    fetch("https://vulavula-services.lelapa.ai/api/v1/transport/file-upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Audio file sent successfully", data);
      })
      .catch((error) => {
        console.error("Error sending audio file", error);
      });

    // Reset audio chunks for the next recording
    audioChunks = [];
    sendButton.disabled = true;
  });
});
