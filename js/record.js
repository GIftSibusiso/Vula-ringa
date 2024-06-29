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
      headers: {
        "X-CLIENT-TOKEN":
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU1YjQ1MGY5MDcyOTRlM2ZhMzAyZDU0Nzg4NWNiYmEzIiwiY2xpZW50X2lkIjoyNywicmVxdWVzdHNfcGVyX21pbnV0ZSI6MCwibGFzdF9yZXF1ZXN0X3RpbWUiOm51bGx9.3xQ7MpYDtjvy7uJfIpYZ4mwI_OdVH2JTuX4OzqUmJyQ",
      },
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
