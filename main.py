import requests
from flask import Flask, render_template, request

url = 'https://vulavula-services.lelapa.ai/api/v1/translate/process'
app = Flask(__name__)
# Allowed languages
languages = {
    "northern sotho": "nso_Latn",
    "afrikaans": "afr_Latn",
    "southern sotho": "sot_Latn",
    "swati": "ssw_Latn",
    "tsonga": "tso_Latn",
    "Tswana": "tsn_Latn",
    "xhosa": "xho_Latn",
    "zulu": "zul_Latn",
    "english": "eng_Latn",
    "swahili": "swh_Latn",
}
# Headers
headers = {
    'Content-Type': 'application/json',
    'X-CLIENT-TOKEN': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA4YWNhOGZjOWU2MjQ1ZjVhY2QwYzU0N2YzYjI4ZGU2IiwiY2xpZW50X2lkIjoyMSwicmVxdWVzdHNfcGVyX21pbnV0ZSI6MCwibGFzdF9yZXF1ZXN0X3RpbWUiOm51bGx9.5pVkRy24RyUKfAc_2qrdtwrxzKRMkr1HBiDN2X1LHzA' # Replace '<INSERT_TOKEN>' with your actual client token
}

# Request body
data = {
  "input_text": "Lo musho ubhalwe ngesiZulu.",
  "source_lang": "eng_Latn",
  "target_lang": "eng_Latn"
}

# Sending POST request
response = requests.post(url, headers=headers, json=data)

# Printing response
print(response.json())

@app.route("/")
@app.route("/home")
def home():
    return render_template("index.html")

@app.route("/translate", methods=["POST"])
def translate():
    form = request.form

    data["input_text"] = form["text"]
    data["target_lang"] = languages[form["language"]]
    print(data)
    print(form["text"])
    print(form["language"])
    response = requests.post(url, headers=headers, json=data)

    
    data["source_lang"] = "zul_Latn"
    return render_template('/show-response.html', response=response.json())



if __name__ == "__main__":
    app.run('0.0.0.0', debug=True)