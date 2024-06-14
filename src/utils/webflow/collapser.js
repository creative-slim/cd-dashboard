export function makeSmallCardCollapsable(button, targetAttribute) {
  console.log('collapser', button, targetAttribute);
  const targetElement = button.closest(`[${targetAttribute}]`);
  const content = targetElement.querySelector('[data-collapse="target"]');

  let isOpen;
  if (content.clientHeight <= 70) {
    isOpen = false;
  } else {
    isOpen = true;
  }

  button.addEventListener('click', () => {
    if (isOpen) {
      gsap.to(content, { height: 70, duration: 0.5 });
      button.style.transform = 'rotate(-90deg)';
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
      button.style.transform = 'rotate(0deg)';
    }
    isOpen = !isOpen;
  });
}

export function makeCheckBoxCollapsable(checkbox, targetAttribute) {
  console.log('collapser', checkbox, targetAttribute);
  const targetElement = checkbox.closest(`[${targetAttribute}]`);
  const content = targetElement.querySelector('[data-collapse-checkbox="target"]');

  let isOpen;
  if (content.clientHeight <= 10) {
    isOpen = false;
  } else {
    isOpen = true;
  }

  checkbox.addEventListener('change', () => {
    if (isOpen) {
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
    isOpen = !isOpen;
  });
}
