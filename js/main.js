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
  allLanguages = Object.keys(langToCode);
responseText = document.querySelector(".tralated-text");
let theText = "",
  from = "";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  theText = document.querySelector("#textInput").value;
  from = document.querySelector("#from").value;

  let chosenLang = document.querySelector("#language").value,
    language = langToCode[`${chosenLang}`],
    body = {
      input_text: theText,
      source_lang: langToCode[from],
      target_lang: language,
    };

  fetch(url, {
    method: "POST", // Change to PUT or PATCH for updates
    headers: data,
    body: JSON.stringify(body),
  })
    .then((response) => response.json()) // Assuming JSON response
    .then((data) => {
      responseText.innerHTML = "";

      for (let i = 0; i < data["translation"].length; i++) {
        let paragraph = document.createElement("p"),
          div = document.createElement("div");

        paragraph.innerText = data["translation"][i]["translation_text"];
        div.appendChild(paragraph);

        for (let i = 0; i < allLanguages.length; i++) {
          if (allLanguages[i] == chosenLang) {
            continue;
          }

          addLanguage(div, paragraph, allLanguages[i]);
        }

        responseText.appendChild(div);
      }
    });
});

function addLanguage(element, textElement, language) {
  let button = document.createElement("button");
  button.innerHTML = language.toUpperCase();
  button.classList.add(
    "bg-green-500",
    "px-3",
    "py-1",
    "m-1",
    "hover:bg-green-400",
    "text-white",
    "rounded-lg"
  );

  button.addEventListener("click", () => {
    textElement.innerHTML = "";
    fetch(url, {
      method: "POST", // Change to PUT or PATCH for updates
      headers: data,
      body: JSON.stringify({
        input_text: theText,
        source_lang: from,
        target_lang: langToCode[language],
      }),
    })
      .then((response) => response.json()) // Assuming JSON response
      .then((data) => {
        textElement.innerText = data["translation"][0]["translation_text"];
      });
  });

  element.appendChild(button);
}
