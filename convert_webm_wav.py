import ffmpeg

import requests
import base64
import json
import base64

def convert_to_wav():
    stream = ffmpeg.input("uploads/recording.webm")
    stream = ffmpeg.output(stream, "uploads/recording.wav")
    ffmpeg.run(stream, overwrite_output=True)


def transcribe(file_size, TOKEN):

    with open("uploads/recording.wav", 'rb') as file:
        file_content = base64.b64encode(file.read()).decode('utf-8')
    
    json = {
        "file_name": "recording.wav",
        "audio_blob": file_content,
        "file_size": file_size,
    }

    headers = {
        'Content-Type': 'application/json',
        'X-CLIENT-TOKEN': TOKEN
    }
    print("Made a request")
    response = requests.post(
        "https://vulavula-services.lelapa.ai//api/v1/transcribe/sync",
        json = json,
        headers = headers,
    )
    print("Done with request")

    # Get the status code
    print(f'Status Code: {response.status_code}')

    # Get the response content (as text)
    print(f'Response Text: {response.text}')

    # If the response is in JSON format, you can get it as a dictionary:
    try:
        print(response.text)
        return response.json(), 200  # Converts response to JSON format
    except ValueError:
        return {"error": "error message"}, 500
  

def synthesize_speech(api_key, voice_code, text):
    url = "https://tts.qfrency.com/api/v1/synthesize"
    
    # Create the request payload
    data = {
        "voice-code": voice_code,
        "text": text,
        "sample-rate": 16000,  # Example sample rate, you can modify this if needed
        "auto-segmentation": True,
        "auto-clean": True
    }
    
    # Set the request headers including the API key
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }
    
    # Send the POST request
    response = requests.post(url, headers=headers, data=json.dumps(data))
    
    # Check if the request was successful
    if response.status_code == 200:
        result = response.json()
        wav_base64 = result["wav_64"]  # Extract the Base64 encoded WAV audio

        # Decode the base64 WAV and save it to a file
        wav_data = base64.b64decode(wav_base64)
        with open("uploads/output.wav", "wb") as f:
            f.write(wav_data)
        
        print("Audio saved as output.wav")
    else:
        print(f"Failed to synthesize speech: {response.status_code} - {response.text}")


def translate(TOKEN, source_lang, target_lang, text):
    url = 'https://vulavula-services.lelapa.ai/api/v1/translate/process'

    # Headers
    headers = {
        'Content-Type': 'application/json',
        'X-CLIENT-TOKEN': TOKEN
    }

    # Request body
    data = {
    "input_text": text,
    "source_lang": "eng_Latn",
    "target_lang": target_lang
    }

    # Sending POST request
    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        return response.json()["translation"][0]["translated_text"], 200
    
    return {}, response.status_code