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
        console.log('cannot go to next page, disabled');
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
      console.log('requiredFields', requiredFields);

      console.log('clicked');

      const filledFields = Array.from(requiredFields).filter((field) => field.value !== '');
      if (requiredFields.length === filledFields.length) {
        return true;
      }

      //highlight the fields that are not filled
      requiredFields.forEach((field) => {
        if (field.value === '') {
          console.log('field is required', field.name, field);
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
