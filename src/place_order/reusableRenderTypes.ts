export function getReusableRenderTypes() {
  const total = parseInt(document.getElementById('totalInput').value) || 0;
  const counts = [0, 0, 0];

  function updateButtonDisplays() {
    document.getElementById('button1').innerText = counts[0];
    document.getElementById('button2').innerText = counts[1];
    document.getElementById('button3').innerText = counts[2];
  }

  document.getElementById('button1').addEventListener('click', function () {
    handleClick(0);
  });

  document.getElementById('button2').addEventListener('click', function () {
    handleClick(1);
  });

  document.getElementById('button3').addEventListener('click', function () {
    handleClick(2);
  });

  document.getElementById('totalInput').addEventListener('change', handleTotalChange);

  // Initialize button displays
  updateButtonDisplays();
}

function handleClick(buttonIndex) {
  counts[buttonIndex] += 1;

  const sumCounts = counts.reduce((a, b) => a + b, 0);

  if (sumCounts > total) {
    let excess = sumCounts - total;

    // Get indices of other buttons
    const otherIndices = counts.map((_, idx) => idx).filter((idx) => idx !== buttonIndex);

    // Sort otherIndices based on counts from highest to lowest
    otherIndices.sort((a, b) => counts[b] - counts[a]);

    for (let i = 0; i < otherIndices.length; i++) {
      const idx = otherIndices[i];
      if (counts[idx] > 0) {
        const reduction = Math.min(excess, counts[idx]);
        counts[idx] -= reduction;
        excess -= reduction;
        if (excess === 0) {
          break;
        }
      }
    }

    if (excess > 0) {
      // Cannot adjust other buttons further, so revert the increment
      counts[buttonIndex] -= 1;
      // Optionally, alert the user
      // alert("Maximum total reached. Cannot increase this button's count further.");
    }
  }

  updateButtonDisplays();
}

function handleTotalChange() {
  total = parseInt(document.getElementById('totalInput').value) || 0;
  const sumCounts = counts.reduce((a, b) => a + b, 0);

  if (sumCounts > total) {
    let excess = sumCounts - total;

    // Get indices of all buttons
    const indices = counts.map((_, idx) => idx);

    // Sort indices based on counts from highest to lowest
    indices.sort((a, b) => counts[b] - counts[a]);

    for (let i = 0; i < indices.length; i++) {
      const idx = indices[i];
      if (counts[idx] > 0) {
        const reduction = Math.min(excess, counts[idx]);
        counts[idx] -= reduction;
        excess -= reduction;
        if (excess === 0) {
          break;
        }
      }
    }
  }

  updateButtonDisplays();
}
