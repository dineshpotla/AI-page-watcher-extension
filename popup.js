document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  const toggleWatchBtn = document.getElementById('toggleWatch');
  const watchStatus = document.getElementById('watchStatus');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const enableSmsToggle = document.getElementById('enableSms');
  const enableEmailToggle = document.getElementById('enableEmail');
  const smsSettings = document.getElementById('smsSettings');
  const emailSettings = document.getElementById('emailSettings');
  const autoRefreshToggle = document.getElementById('autoRefresh');

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(`${tab.dataset.tab}-panel`).classList.add('active');
    });
  });

  // Toggle settings sections
  enableSmsToggle.addEventListener('change', () => {
    smsSettings.style.display = enableSmsToggle.checked ? 'block' : 'none';
  });

  enableEmailToggle.addEventListener('change', () => {
    emailSettings.style.display = enableEmailToggle.checked ? 'block' : 'none';
  });

  // Load saved settings
  chrome.storage.local.get(null, (data) => {
    // Monitor settings
    if (data.customPrompt) document.getElementById('customPrompt').value = data.customPrompt;
    if (data.interval) document.getElementById('interval').value = data.interval;
    if (data.isAutoRefreshing) autoRefreshToggle.checked = data.isAutoRefreshing;
    
    // API Keys
    if (data.openrouterKey) document.getElementById('openrouterKey').value = data.openrouterKey;
    
    // SMS settings
    if (data.enableSms) {
      enableSmsToggle.checked = true;
      smsSettings.style.display = 'block';
      if (data.twilioSid) document.getElementById('twilioSid').value = data.twilioSid;
      if (data.twilioToken) document.getElementById('twilioToken').value = data.twilioToken;
      if (data.twilioMsgSid) document.getElementById('twilioMsgSid').value = data.twilioMsgSid;
      if (data.phone) document.getElementById('phone').value = data.phone;
    }

    // Email settings
    if (data.enableEmail) {
      enableEmailToggle.checked = true;
      emailSettings.style.display = 'block';
      if (data.emailAddress) document.getElementById('emailAddress').value = data.emailAddress;
    }

    // Update watching status
    if (data.isWatching) {
      toggleWatchBtn.textContent = 'Stop Watching';
      toggleWatchBtn.classList.add('stop');
      watchStatus.textContent = 'Currently monitoring';
      watchStatus.classList.remove('inactive');
      watchStatus.classList.add('active');
    }
  });

  // Save settings
  saveSettingsBtn.addEventListener('click', () => {
    const settings = {
      openrouterKey: document.getElementById('openrouterKey').value,
      enableSms: enableSmsToggle.checked,
      enableEmail: enableEmailToggle.checked
    };

    if (enableSmsToggle.checked) {
      settings.twilioSid = document.getElementById('twilioSid').value;
      settings.twilioToken = document.getElementById('twilioToken').value;
      settings.twilioMsgSid = document.getElementById('twilioMsgSid').value;
      settings.phone = document.getElementById('phone').value;
    }

    if (enableEmailToggle.checked) {
      settings.emailAddress = document.getElementById('emailAddress').value;
    }

    chrome.storage.local.set(settings, () => {
      const status = document.createElement('div');
      status.textContent = 'Settings saved successfully!';
      status.className = 'status active';
      status.style.marginTop = '10px';
      saveSettingsBtn.parentNode.insertBefore(status, saveSettingsBtn.nextSibling);
      
      setTimeout(() => status.remove(), 3000);
    });
  });

  // Toggle watching
  toggleWatchBtn.addEventListener('click', () => {
    chrome.storage.local.get(['isWatching'], (data) => {
      const newState = !data.isWatching;
      const customPrompt = document.getElementById('customPrompt').value.trim();
      const interval = parseInt(document.getElementById('interval').value);

      if (newState && !customPrompt) {
        alert('Please enter a monitoring instruction.');
        return;
      }

      chrome.storage.local.set({
        isWatching: newState,
        customPrompt: customPrompt,
        interval: interval,
        isAutoRefreshing: autoRefreshToggle.checked
      });

      toggleWatchBtn.textContent = newState ? 'Stop Watching' : 'Start Watching';
      toggleWatchBtn.classList.toggle('stop', newState);
      
      watchStatus.textContent = newState ? 'Currently monitoring' : 'Currently not monitoring';
      watchStatus.classList.toggle('active', newState);
      watchStatus.classList.toggle('inactive', !newState);

      // Request notification permission if starting
      if (newState) {
        Notification.requestPermission();
      }

      // Reload active tab to start/stop content script
      chrome.tabs.reload();
    });
  });
});
