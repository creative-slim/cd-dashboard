// @ts-nocheck

export function saveInputToLocalHost() {
  // check if local storage is available
  if (typeof window === "undefined") {
    console.log("no window");
    return;
  }

  if (!window.localStorage) {
    console.log("no local storage");
    return;
  }

  let FormContent = {};
  console.log("saveInputToLocalHost");

  if (!localStorage.getItem("FormInputHolder")) {
    console.log("key not found");
    window.localStorage.setItem("FormInputHolder", JSON.stringify(FormContent));
    localStorageUpdater();
  } else {
    console.log("key found");
    FormContent = JSON.parse(localStorage.getItem("FormInputHolder"));
    formUpdater(FormContent);
    localStorageUpdater();
  }

  //   updateLocalStorage("name", "slumy");
  //   localStorageUpdater();
  //   console.log("fromLocalStorage", FormContent);
}

function updateLocalStorage(newKey, newValue) {
  console.log("updateLocalStorage", newKey, newValue);
  let FormContent = JSON.parse(localStorage.getItem("FormInputHolder"));
  FormContent[newKey] = newValue;
  window.localStorage.setItem("FormInputHolder", JSON.stringify(FormContent));
}

function localStorageUpdater() {
  // furniture-name
  document
    .querySelector("[data-name='furniture-name']")
    .addEventListener("change", (e) => {
      updateLocalStorage("furniture-name", e.target.value);
    });

  // furniture-type
  document
    .querySelectorAll("[data-name='furniture-type']")
    .forEach((radioButton) => {
      radioButton.addEventListener("change", (e) => {
        updateLocalStorage("furniture-type", e.target.value);
      });
    });

  // furniture-dimensions-width
  document
    .querySelector("[data-name='furniture-dimension-w']")
    .addEventListener("change", (e) => {
      updateLocalStorage("furniture-dimension-w", e.target.value);
    });

  // furniture-dimensions-height
  document
    .querySelector("[data-name='furniture-dimension-h']")
    .addEventListener("change", (e) => {
      updateLocalStorage("furniture-dimension-h", e.target.value);
    });

  // furniture-dimensions-length
  document
    .querySelector("[data-name='furniture-dimension-l']")
    .addEventListener("change", (e) => {
      updateLocalStorage("furniture-dimension-l", e.target.value);
    });

  // dimensions-comment
  document
    .querySelector("[data-name='dimensions-comment']")
    .addEventListener("change", (e) => {
      updateLocalStorage("dimensions-comment", e.target.value);
    });

  // color-finish
  document
    .querySelector("[data-name='color-finish']")
    .addEventListener("change", (e) => {
      updateLocalStorage("color-finish", e.target.value);
    });

  // special-functions
  document
    .querySelector("[data-name='special-functions']")
    .addEventListener("change", (e) => {
      updateLocalStorage("special-functions", e.target.value);
    });

  //lighting-comment
  document
    .querySelector("[data-name='lighting-comment']")
    .addEventListener("change", (e) => {
      updateLocalStorage("lighting-comment", e.target.value);
    });

  // function-show
  document
    .querySelector("[data-name='function-show']")
    .addEventListener("change", (e) => {
      updateLocalStorage("function-show", e.target.value);
    });

  // render-extra-viewangle
  document
    .querySelector("[data-name='render-extra-viewangle']")
    .addEventListener("change", (e) => {
      updateLocalStorage("render-extra-viewangle", e.target.value);
    });

  // room-type
  document
    .querySelector("[data-name='room-type']")
    .addEventListener("change", (e) => {
      updateLocalStorage("room-type", e.target.value);
    });

  // Materials
  // Get the container element by its ID
  var container = document.getElementById("material-selection-div");

  // Get all checkboxes inside the container
  var checkboxes = container.querySelectorAll("input[type='checkbox']");
  console.log("%ccheckboxes", "color:green", checkboxes);

  container?.addEventListener("change", (e) => {
    console.log("checkboxes", checkboxes);
    // Check each checkbox and collect them into an array
    var checkedCheckboxes = [];
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkedCheckboxes.push(checkbox.name);
      }
    });

    console.log("%cThis is a green text", "color:green", checkedCheckboxes);

    updateLocalStorage("materials", checkedCheckboxes);
  });

  var materialComments = container.querySelectorAll("input[type='text']");
  materialComments.forEach((comment) => {
    comment.addEventListener("change", (e) => {
      console.log("comment", e.target.value);
      updateLocalStorage(`comment-toggle-${e.target.name}`, e.target.value);
    });
  });
}

function formUpdater(FormContent) {
  // furniture-name
  document.querySelector("[data-name='furniture-name']").value =
    FormContent["furniture-name"] || "";

  // furniture-type
  document
    .querySelectorAll("[data-name='furniture-type']")
    .forEach((radioButton) => {
      //   console.log(radioButton.value, FormContent["furniture-type"]);

      if (radioButton.value == FormContent["furniture-type"]) {
        // console.log("match");

        radioButton.checked = true;
        //find the sibling label and add the checked class
        let previousDiv = radioButton.previousElementSibling;
        previousDiv.classList.add("w--redirected-checked");
        previousDiv.classList.add("w--redirected-focus");
      }
    });

  // furniture-dimensions-width
  document.querySelector("[data-name='furniture-dimension-w']").value =
    FormContent["furniture-dimension-w"] || "";

  // furniture-dimensions-height
  document.querySelector("[data-name='furniture-dimension-h']").value =
    FormContent["furniture-dimension-h"] || "";

  // furniture-dimensions-length
  document.querySelector("[data-name='furniture-dimension-l']").value =
    FormContent["furniture-dimension-l"] || "";

  // dimensions-comment
  document.querySelector("[data-name='dimensions-comment']").value =
    FormContent["dimensions-comment"] || "";

  // color-finish
  document.querySelector("[data-name='color-finish']").value =
    FormContent["color-finish"] || "";

  // special-functions
  document.querySelector("[data-name='special-functions']").value =
    FormContent["special-functions"] || "";

  //lighting-comment
  document.querySelector("[data-name='lighting-comment']").value =
    FormContent["lighting-comment"] || "";

  // function-show
  document.querySelector("[data-name='function-show']").value =
    FormContent["function-show"] || "";

  // render-extra-viewangle
  document.querySelector("[data-name='render-extra-viewangle']").value =
    FormContent["render-extra-viewangle"] || "";

  // room-type
  document.querySelector("[data-name='room-type']").value =
    FormContent["room-type"] || "";

  // Materials

  // Get the container element by its ID
  var container = document.getElementById("material-selection-div");

  // Get all checkboxes inside the container
  var checkboxes = container.querySelectorAll("input[type='checkbox']");

  if (FormContent["materials"]) {
    checkboxes.forEach((checkbox) => {
      console.log(checkbox.name, FormContent["materials"]);
      if (FormContent["materials"].includes(checkbox.name)) {
        checkbox.checked = true;

        let previousDiv = checkbox.previousElementSibling;

        //   previousDiv.click();

        const subCategoryWrapper = document.getElementById(
          `material-category-${checkbox.name.split("-")[1]}`
        );
        if (subCategoryWrapper) subCategoryWrapper.style.display = "flex";

        if (checkbox.name.split("-")[0] == "comment") {
          console.log("comment", checkbox.name.split("-toggle-")[1]);
          const commentWrapper = document.getElementById(
            `comment-${checkbox.name.split("-toggle-")[1]}`
          );
          if (commentWrapper) commentWrapper.style.display = "block";
        }

        previousDiv.classList.add("w--redirected-checked");
        previousDiv.classList.add("w--redirected-focus");
      }
    });
  }

  var materialComments = container.querySelectorAll("input[type='text']");
  materialComments.forEach((comment) => {
    comment.value = FormContent[`comment-toggle-${comment.name}`] || "";
  });
}
