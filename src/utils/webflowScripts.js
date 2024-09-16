export function updateUserAddress() {
  const formWrapper = document.querySelector('[data-modal="address"]');
  if (!formWrapper) {
    return;
  }
  const form = formWrapper.querySelector('form');

  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    let api = 'https://creative-directors-dropbox.sa-60b.workers.dev';

    const response = await fetch(api + '/api/cd/webflow/user/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      formWrapper.getElementsByClassName('w-form-done')[0].style.display = 'block';
      form.style.display = 'none';
    } else {
      formWrapper.getElementsByClassName('w-form-fail')[0].style.display = 'block';
    }
  });
}

//! DEMO DESABLED
/*
export function dataChecker() {
  let currentTabIndex = 0; // Start with the first tab
  let currentClick;
  const tabs = document.querySelectorAll('.order-tab-selector');

  const showHideNavButtons = () => {
    // Determine button visibility based on current tab index
    document.querySelector('[data-tab-nav="prev"]').style.display =
      currentTabIndex === 0 || currentTabIndex === 99 ? 'none' : 'flex';
    document.querySelector('[data-tab-nav="next"]').style.display =
      currentTabIndex === tabs.length - 1 || currentTabIndex === 2 || currentTabIndex === 99
        ? 'none'
        : 'flex';
    document.querySelector('[data-tab-nav="submit"]').style.display =
      currentTabIndex === tabs.length - 2 ? 'flex' : 'none';
    //document.querySelector('[data-tab-nav="done"]').style.display = currentTabIndex === tabs.length ? 'flex' : 'none';

    //pointer events on order Tabs
    document.querySelector('[data-tab-nav="1"]').style.pointerEvents =
      currentTabIndex + 1 === tabs.length ? 'none' : 'auto';
    document.querySelector('[data-tab-nav="2"]').style.pointerEvents =
      currentTabIndex + 1 === tabs.length ? 'none' : 'auto';
  };
  // Function to mimic clicking a tab
  const clickTab = (index) => {
    tabs[index].click();
    currentTabIndex = index; // Update current tab index
    showHideNavButtons(); // Update navigation buttons visibility
  };
  // Initial button visibility setup
  showHideNavButtons();
  clickTab(1);
  // Event listeners for navigation buttons
  document.querySelectorAll('[data-tab-nav]').forEach((button) => {
    button.addEventListener('click', function () {
      //SA added this 1 line
      if (!checkRequiredFields()) {
        //console.log('cannot go to next page, disabled');
      } else {
        const action = this.getAttribute('data-tab-nav');
        if (action === 'next' && currentTabIndex < tabs.length - 1) {
          clickTab(currentTabIndex + 1);
        } else if (action === 'prev' && currentTabIndex > 0) {
          clickTab(currentTabIndex - 1);
        } else if (action === 'backHome') {
          // Custom code for 'Back Home' action
        } else if (!isNaN(parseInt(action))) {
          currentTabIndex = parseInt(action) - 1;
          showHideNavButtons();
        }
      }
    });

    const checkRequiredFields = () => {
      const form = document.querySelector('#wf-form-mainFormSubmission');
      const requiredFields = form.querySelectorAll('.w--tab-active [required]');
      const nextButton = form.querySelector('[data-tab-nav="next"]');
      //console.log('requiredFields', requiredFields);

      //console.log('clicked');

      const filledFields = Array.from(requiredFields).filter((field) => field.value !== '');
      if (requiredFields.length === filledFields.length) {
        return true;
      }

      //highlight the fields that are not filled
      requiredFields.forEach((field) => {
        if (field.value === '') {
          //console.log('field is required', field.name, field);
          field.style.border = '1px solid red';
        }
      });
      //remove the red border after 2 seconds
      setTimeout(() => {
        requiredFields.forEach((field) => {
          field.style.border = '1px solid #777';
        });
      }, 2000);

      return false;
    };
  });
}
*/

// clear local storage when user logs out from webflow
export function clearLocalStorageOnLogout() {
  const logoutButtons = document.querySelectorAll('[data-wf-user-logout]');

  // Check if any logout buttons exist
  if (logoutButtons.length === 0) {
    return;
  }

  logoutButtons.forEach((button) => {
    // Check if the button's text contains "log out" (case insensitive)
    if (button.innerText.toLowerCase().includes('log out')) {
      //console.log('Logout button found');
    } else {
      return; // Skip this button if it doesn't contain "log out"
    }

    // Add click event listener to clear local storage
    button.addEventListener('click', () => {
      localStorage.clear();
      //console.log('Local storage cleared');
    });
  });
}

export function checkUserAddressData() {
  const elementsWithDataUser = document.querySelectorAll('[data-user]');

  // remove elements that have class name class="w-dyn-bind-empty"

  let allDataPresent = true;

  elementsWithDataUser.forEach((element) => {
    const { attributes } = element;
    let dataUserPresent = true;
    for (let i = 0; i < attributes.length; i++) {
      const attributeName = attributes[i].nodeName;
      if (attributeName.startsWith('data-user')) {
        if (attributes[i].nodeValue) {
          //console.log('User data present', element, attributes[i].nodeValue);
        } else {
          //console.log('User data missing', element, attributes[i].nodeValue);
          dataUserPresent = false;
        }

        //console.log(`${attributeName}: ${attributes[i].nodeValue}`);
      }
    }
    if (!dataUserPresent) {
      allDataPresent = false;
    }
  });

  return allDataPresent;
}

// export function renderSetupParams(){
//   const renderPickersWrapper = document.querySelector('#order-render-pickers');
//   if (!renderPickersWrapper) {
//     return;
//   }
//   const renderPickers = renderPickersWrapper.querySelectorAll('[order-render-picker]');
// }

export function renderSetupParams() {
  // dorpdownsSetup();
  addNewRequestItem();
}

function dorpdownsSetup() {
  const dropdowns = document.querySelectorAll('[picker-dropdown="container"]');
  dropdowns.forEach((dropdown) => {
    const dropdownToggle = dropdown.querySelector('[picker-dropdown="trigger"]');
    const dropdownMenu = dropdown.querySelector('[picker-dropdown="target"]');
    dropdownToggle.addEventListener('click', () => {
      dropdownMenu.classList.toggle('show');
    });
  });
}

function addNewRequestItem() {
  const itemTemplate = document.querySelector('[render-template="request"]');
  const addItemBtn = document.querySelector('[render-action="new-item"]');
  const mainWrapper = document.querySelector('[data-render="main-wrapper"]');

  addItemBtn.addEventListener('click', () => {
    const newItem = itemTemplate.cloneNode(true);
    // add id to the new item
    newItem.id = `request-${Date.now()}`;
    itemTemplate.parentNode.appendChild(newItem);
    addDeleteFunctionality(newItem);
  });
}

function addDeleteFunctionality(item) {
  const deleteBtn = item.querySelector('[render-item="delete"]');
  deleteBtn.addEventListener('click', () => {
    item.remove();
  });
}
