export default function makeCollapsible(button, attribute) {
  const targetElement = button.closest(`[${attribute}]`);
  const content = targetElement.querySelector('[data-collapse="target"]');

  let isOpen = false;

  button.addEventListener('click', () => {
    if (isOpen) {
      gsap.to(content, { height: 0, duration: 0.5 });
      button.style.transform = 'rotate(0deg)';
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
      button.style.transform = 'rotate(180deg)';
    }
    isOpen = !isOpen;
  });
}
