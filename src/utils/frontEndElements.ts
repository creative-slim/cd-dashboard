// @ts-nocheck

export function frontEndElementsJS() {
  let paynowBtn = document.getElementById('pay-now-tab');
  let paylaterBtn = document.getElementById('pay-later-tab');

  let nextBtn = document.getElementById('request-next');

  nextBtn?.addEventListener('click', (e) => {
    console.log('nextBtn change', nextBtn?.innerHTML);
    if (
      paylaterBtn &&
      paynowBtn.classList.contains('w--current') &&
      nextBtn?.innerHTML == 'Submit'
    ) {
      nextBtn.classList.add('unclickable');
      nextBtn.style.pointerEvents = 'none';
    }

    if (paylaterBtn && paylaterBtn.classList.contains('w--current')) {
      nextBtn.innerHTML = 'SAVE DRAFT';
      nextBtn.classList.remove('unclickable');
      nextBtn.style.pointerEvents = 'auto';
    }
  });

  paynowBtn?.addEventListener('click', (e) => {
    nextBtn.innerHTML = 'SUBMIT';
    nextBtn.classList.add('unclickable');
    nextBtn.style.pointerEvents = 'none';
  });

  paylaterBtn?.addEventListener('click', (e) => {
    nextBtn.innerHTML = 'SAVE DRAFT';
    nextBtn.classList.remove('unclickable');
    nextBtn.style.pointerEvents = 'auto';

    $('#request-next').on('click', function () {
      $('#w-tabs-0-data-w-tab-2').triggerHandler('click');
    });
  });

  // add href="#w-tabs-0-data-w-pane-1" to nextBTn
}
