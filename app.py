from flask import Flask, render_template, request, jsonify, send_file

import os
import io

from convert_webm_wav import convert_to_wav, transcribe, synthesize_speech, translate

QFREQ_TOKEN = os.getenv("QFREQ_TOKEN")
VULAVULA_TOKEN = os.getenv("VULAVULA_TOKEN")

app = Flask(__name__)

lang_code_map = {
        "nso_Latn": "sot-ZA-dnn-kamohelo",
        "afr_Latn": "afr-ZA-dnn-maryna",
        "sot_Latn": "sot-ZA-dnn-kamohelo",
        "ssw_Latn": "ssw-ZA-dnn-temaswati",
        "tso_Latn": "tso-ZA-dnn-sasekani",
        "tsn_Latn": "tsn-ZA-dnn-lethabo",
        "xho_Latn": "xho-ZA-dnn-zoleka",
        "zul_Latn": "zul-ZA-dnn-lindiwe",
        "eng_Latn": "eng-ZA-dnn-candice",
    }

@app.route("/")
def home():
    return render_template("pages/speech-to-speech.html")


@app.route("/speech")
def speech_to_speech():
    return render_template("pages/home.html")


@app.route("/text")
def text_to_text():
    return render_template("pages/text-to-text.html")


@app.route('/upload', methods=['POST'])
def upload():
    # Get and save audio file
    audio_file = request.files['audio_file']
    file_path = 'uploads/' + audio_file.filename
    # return jsonify({"text": "The Translation endpoint takes the provided text and translates it from the source language to the target language. The maximum text length for each request is 256 words"}), 200
    # Delete files if they exist
    if os.path.exists("uploads/recording.wav"):
        os.remove("uploads/recording.wav")
    if os.path.exists("uploads/recording.webm"):
        os.remove("uploads/recording.webm")
    
    # return jsonify({"text": "Good morning, how are you today?"})

    audio_file.save(file_path)

    # Convert file to a .wav (since .webm format is not acceptable)
    convert_to_wav()
    transcription_resp, resp_code = transcribe(os.path.getsize(file_path), VULAVULA_TOKEN)

    if resp_code == 200:
        text = transcription_resp["text"]
        print(transcription_resp)
        return jsonify({"text": text}), 200
    
    print(transcription_resp)
    return jsonify({"text": "Could not translate"}), 500
    

@app.route("/translate", methods={'POST'})
def translate_text():
    # Get text
    data = request.json
    text = data["text"]
    source_lang = data["sourceLang"]
    language = data["language"]
    
    print("Now translating")
    translated_text, trns_code = translate(VULAVULA_TOKEN, source_lang, language, text)
    if trns_code == 200:
        return {"translated-text": translated_text}, 200
    else:
        return {}, 500


@app.route("/get-audio", methods=['POST'])
def synthesize():
    print("Now synthesizing")
    # Get text
    data = request.json
    translated_text = data["text"]
    language = data["language"]

    synthesize_speech(QFREQ_TOKEN, lang_code_map[language], translated_text)
    

    # Load or generate the WAV file
    with open('uploads/output.wav', 'rb') as f:
        wav_data = f.read()  # Read the file into memory

    # Convert the audio data to a BytesIO stream
    audio_stream = io.BytesIO(wav_data)
    audio_stream.seek(0)  # Go to the start of the stream

    # Send the file using send_file(), specifying the correct MIME type
    return send_file(audio_stream, mimetype='audio/wav', as_attachment=False), 200


if __name__ == "__main__":
    app.run(debug=True)
