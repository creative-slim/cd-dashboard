// export function makeSmallCardCollapsable(button, targetAttribute) {
//   // console.log('collapser', button, targetAttribute);
//   if (!button) {
//     return;
//   }
//   if (!targetAttribute) {
//     return;
//   }
//   const targetElement = button.closest(`[${targetAttribute}]`);
//   if (!targetElement) {
//     return;
//   }
//   const content = targetElement.querySelector('[data-collapse="target"]');

//   if (!content) {
//     return;
//   }
//   let isOpen;
//   if (content.clientHeight <= 70) {
//     isOpen = false;
//   } else {
//     isOpen = true;
//   }

//   button.addEventListener('click', () => {
//     if (isOpen) {
//       gsap.to(content, { height: 70, duration: 0.5 });
//       button.style.transform = 'rotate(-90deg)';
//     } else {
//       gsap.to(content, {
//         height: 'auto',
//         duration: 0.5,
//         onStart: () => {
//           content.style.height = 'auto';
//           const height = content.clientHeight;
//           content.style.height = '0px';
//           gsap.to(content, { height: height, duration: 0.5 });
//         },
//       });
//       button.style.transform = 'rotate(0deg)';
//     }
//     isOpen = !isOpen;
//   });
// }

export function makeRadioCollapsable(radio, targetAttribute, toOpen) {
  if (!radio || radio.type !== 'radio') {
    return;
  }
  if (!targetAttribute) {
    return;
  }

  // Find the closest target element based on the provided attribute
  const targetElement = radio.closest(`[${targetAttribute}]`);
  if (!targetElement) {
    return;
  }

  // Select the content element to be collapsed/expanded
  const content = targetElement.querySelector('[data-collapse-checkbox="target"]');
  if (!content) {
    return;
  }

  // make the input field inside the content element required
  const input = content.querySelectorAll('input');
  if (!input) {
    return;
  }

  // Add event listener to handle radio button changes
  radio.addEventListener('change', () => {
    input.forEach((input) => {
      logger.log(toOpen, 'input', input);

      toOpen ? input.setAttribute('required', 'required') : input.removeAttribute('required');
    });
    // Only proceed if the radio button is checked
    if (!toOpen) {
      gsap.to(content, { height: 0, duration: 0.5 });
    } else {
      gsap.to(content, {
        height: 'auto',
        duration: 0.5,
        onStart: () => {
          content.style.height = 'auto';
          const height = content.clientHeight;
          content.style.height = '0px';
          gsap.to(content, { height: height, duration: 0.5 });
        },
      });
    }
  });
}

export function makeCheckBoxCollapsable(checkbox, targetAttribute) {
  if (!checkbox || checkbox.type !== 'checkbox') {
    return;
  }
  if (!targetAttribute) {
    return;
  }

  // Find the closest target element based on the provided attribute
  const targetElement = checkbox.closest(`[${targetAttribute}]`);
  if (!targetElement) {
    return;
  }

  // Select the content element to be collapsed/expanded
  const content = targetElement.querySelector('[data-collapse-checkbox="target"]');
  if (!content) {
    return;
  }

  // Find all input fields inside the content element
  const inputFields = content.querySelectorAll('input');
  if (!inputFields) {
    return;
  }

  // Function to toggle the required attribute
  const toggleRequiredAttribute = (toOpen) => {
    inputFields.forEach((input) => {
      toOpen ? input.setAttribute('required', 'required') : input.removeAttribute('required');
    });
  };

  // Add event listener to handle checkbox state changes
  checkbox.addEventListener('change', () => {
    const toOpen = checkbox.checked; // True if checked, false if unchecked

    toggleRequiredAttribute(toOpen); // Set or remove 'required' attribute based on checkbox state

    // Collapse or expand content based on checkbox state
    if (!toOpen) {
      gsap.to(content, { height: 0, duration: 0.5 });
    } else {
      gsap.to(content, {
        height: 'auto',
        duration: 0.5,
        onStart: () => {
          content.style.height = 'auto';
          const height = content.clientHeight;
          content.style.height = '0px';
          gsap.to(content, { height: height, duration: 0.5 });
        },
      });
    }
  });
}
