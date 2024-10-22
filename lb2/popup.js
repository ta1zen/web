document.addEventListener('DOMContentLoaded', function() {
  if (typeof chrome.storage === 'undefined') {
    console.error('chrome.storage is not available');
    return;
  }

  const slider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');
  const muteButton = document.getElementById('muteButton');
  const unmuteButton = document.getElementById('unmuteButton');
  let isMuted = false; 

  chrome.storage.local.get(['volume', 'isMuted'], function(result) {
      const savedVolume = result.volume !== undefined ? result.volume : 100;
      isMuted = result.isMuted !== undefined ? result.isMuted : false;
      slider.value = savedVolume;
      volumeValue.textContent = savedVolume;
      
      updateMuteButtons();
      setVolume(savedVolume / 100);
  });

  slider.addEventListener('input', function() {
      const volume = slider.value;
      volumeValue.textContent = volume;

      chrome.storage.local.set({ volume: volume }, function() {
          console.log('Volume saved:', volume);
      });

      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const tabId = tabs[0].id;
          if (!tabs[0].url.startsWith("chrome://")) {
              chrome.scripting.executeScript({
                  target: { tabId: tabId },
                  func: setVolume,
                  args: [volume / 100]
              }, (result) => {
                  console.log('Volume set result:', result);
              });
          } else {
              console.log('Cannot access chrome:// URL');
          }
      });
  });

  //Mute
  muteButton.addEventListener('click', function() {
      isMuted = true; 
      updateMuteButtons(); 

      chrome.storage.local.set({ isMuted: isMuted }, function() {
          console.log('Mute state saved:', isMuted);
      });

      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const tabId = tabs[0].id;
          if (!tabs[0].url.startsWith("chrome://")) {
              chrome.scripting.executeScript({
                  target: { tabId: tabId },
                  func: setMute,
                  args: [isMuted]
              }, (result) => {
                  console.log('Mute state set:', result);
              });
          } else {
              console.log('Cannot access chrome:// URL');
          }
      });
  });

  //Unmute
  unmuteButton.addEventListener('click', function() {
      isMuted = false; 
      updateMuteButtons(); 

      chrome.storage.local.set({ isMuted: isMuted }, function() {
          console.log('Mute state saved:', isMuted);
      });

      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const tabId = tabs[0].id;
          if (!tabs[0].url.startsWith("chrome://")) {
              chrome.scripting.executeScript({
                  target: { tabId: tabId },
                  func: setMute,
                  args: [isMuted]
              }, (result) => {
                  console.log('Mute state set:', result);
              });
          } else {
              console.log('Cannot access chrome:// URL');
          }
      });
  });

  function updateMuteButtons() {
      muteButton.disabled = isMuted; 
      unmuteButton.disabled = !isMuted; 
  }
});

function setVolume(volume) {
  const videos = document.querySelectorAll('video, audio');
  videos.forEach(video => {
      video.volume = volume;
  });
}

function setMute(muted) {
  const videos = document.querySelectorAll('video, audio');
  videos.forEach(video => {
      video.muted = muted;
  });
}
