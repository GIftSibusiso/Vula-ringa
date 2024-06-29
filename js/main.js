const form = document.querySelector("#myForm"),
  url = "https://vulavula-services.lelapa.ai/api/v1/translate/process",
  key =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA4YWNhOGZjOWU2MjQ1ZjVhY2QwYzU0N2YzYjI4ZGU2IiwiY2xpZW50X2lkIjoyMSwicmVxdWVzdHNfcGVyX21pbnV0ZSI6MCwibGFzdF9yZXF1ZXN0X3RpbWUiOm51bGx9.5pVkRy24RyUKfAc_2qrdtwrxzKRMkr1HBiDN2X1LHzA",
  data = {
    "Content-Type": "application/json",
    "X-CLIENT-TOKEN": key,
  },
  langToCode = {
    "northern sotho": "nso_Latn",
    afrikaans: "afr_Latn",
    "southern sotho": "sot_Latn",
    swati: "ssw_Latn",
    tsonga: "tso_Latn",
    Tswana: "tsn_Latn",
    xhosa: "xho_Latn",
    zulu: "zul_Latn",
    english: "eng_Latn",
    swahili: "swh_Latn",
  },
  responseText = document.querySelector(".tralated-text");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  let text = document.querySelector("#textInput").value,
    language = langToCode[`${document.querySelector("#language").value}`],
    body = {
      input_text: text,
      source_lang: "eng_Latn",
      target_lang: language,
    };

  fetch(url, {
    method: "POST", // Change to PUT or PATCH for updates
    headers: data,
    body: JSON.stringify(body),
  })
    .then((response) => response.json()) // Assuming JSON response
    .then((data) => {
      console.log("Response:", data);
      let paragraph = document.createElement("p");

      paragraph.innerText = data["translation"][0]["translation_text"];
      //console.log(data["translation"][0]["translation_text"])
      responseText.appendChild(paragraph);
    });
});
