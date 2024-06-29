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
    const file = new File(audioChunks, "audio.wav", {
      type: "audio/wav",
    });

    if (!file) {
      alert("Please select a file");
      return;
    }

    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = async () => {
      const arrayBuffer = fileReader.result;
      const base64String = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );

      // Create the request body
      const transportRequestBody = {
        file_name: file.name,
        audio_blob: base64String,
        file_size: file.size,
      };

      // Set the headers
      const headers = {
        "X-CLIENT-TOKEN": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU1YjQ1MGY5MDcyOTRlM2ZhMzAyZDU0Nzg4NWNiYmEzIiwiY2xpZW50X2lkIjoyNywicmVxdWVzdHNfcGVyX21pbnV0ZSI6MCwibGFzdF9yZXF1ZXN0X3RpbWUiOm51bGx9.3xQ7MpYDtjvy7uJfIpYZ4mwI_OdVH2JTuX4OzqUmJyQ", // Replace with your actual client token
        "Content-Type": "application/json",
      };

      try {
        const response = await fetch(
          "https://vulavula-services.lelapa.ai/api/v1/transport/file-upload",
          {
            method: "POST",
            headers: headers,
            body: JSON.stringify(transportRequestBody),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("File uploaded successfully:", data);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    };

    fileReader.onerror = (error) => {
      console.error("Error reading file:", error);
    };

    // Reset audio chunks for the next recording
    audioChunks = [];
    sendButton.disabled = true;
  });
});
