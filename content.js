// State
let lastState = null;
let refreshInterval = null;

// Get API keys from storage
async function getApiKeys() {
  return new Promise((resolve) => {
    chrome.storage.local.get([
      'openrouterKey',
      'enableSms',
      'twilioSid',
      'twilioToken',
      'twilioMsgSid',
      'phone',
      'enableEmail',
      'emailAddress'
    ], (data) => resolve(data));
  });
}

// Check if phrase is present using LLaMA 4 Maverick
async function checkPageLLM(text, customPrompt) {
  const settings = await getApiKeys();
  if (!settings.openrouterKey) {
    throw new Error('OpenRouter API key not configured');
  }
  const prompt = `Answer ONLY in this JSON format:\n{\n  "changed": true/false,\n  "summary": "A brief half-line summary of what changed (or 'No change detected')"\n}\n\n${customPrompt}\n\nPage Text:\n"${text}"`;
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.openrouterKey}`,
      'HTTP-Referer': 'https://github.com/PageChangeWatcher',
      'X-Title': 'Page Change Watcher'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-maverick:free',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  let llmText = data.choices[0].message.content.trim();
  // Try to extract JSON from response
  let result = {changed: false, summary: 'No change detected'};
  try {
    // Remove code block markers if present
    llmText = llmText.replace(/^```json|```$/g, '').trim();
    result = JSON.parse(llmText);
  } catch (e) {
    // fallback: try to parse for changed/summary manually
    if (/true/i.test(llmText)) result.changed = true;
    const summaryMatch = llmText.match(/summary\s*[:=]\s*"([^"]+)"/i);
    if (summaryMatch) result.summary = summaryMatch[1];
  }
  return result;
}

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.openrouterKey}`,
      'HTTP-Referer': 'https://github.com/PageChangeWatcher',
      'X-Title': 'Page Change Watcher'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-maverick:free',
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  const data = await response.json();
  const answer = data.choices[0].message.content.trim().toUpperCase();
  return answer === 'YES';
}

// Send SMS via Twilio
async function sendSms(message) {
  const settings = await getApiKeys();
  
  if (!settings.enableSms || !settings.twilioSid || !settings.twilioToken || !settings.twilioMsgSid || !settings.phone) {
    console.log('SMS notifications not configured');
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${settings.twilioSid}/Messages.json`;
  const auth = btoa(`${settings.twilioSid}:${settings.twilioToken}`);

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      To: settings.phone,
      From: settings.twilioMsgSid,
      Body: message
    })
  });
}

// Send email notification
async function sendEmail(message) {
  const settings = await getApiKeys();
  
  if (!settings.enableEmail || !settings.emailAddress) {
    console.log('Email notifications not configured');
    return;
  }

  // Here you would implement your email sending logic
  // For example, using a service like SendGrid or your own SMTP server
  console.log('Sending email to:', settings.emailAddress, message);
}

// Show desktop notification
function showNotification(message) {
  new Notification('Page Change Detected', {
    body: message,
    icon: 'icon.png'
  });
}

// Play sound alarm
function playSound() {
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoODlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQgZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTGH0fPTgjQGHW/A7eSaSQ0PVqzm77BdGQc+ltrzxnUoBSh+zPPaizsIGGS57OihUBELTKXh8bllHgU1jdXzzn0vBSJ0xe/glEILElyx6OyrWRUIQ5zd8sFuJAUug8/z1YU2BRxqvu7mnEoPDlOq5O+zYRsGPJPY88p3KgUme8rx3I4+CRVht+rqpVMSC0mh4PK8aiAFM4nU8tGAMQYfccPu45ZFDBFYr+ftrVwWCECY3PLEcSYGK4DN8tiIOQgZZ7vs559NEAxPpuPxtmQcBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hWEwlGnt/yv2wiBDGH0fPTgzQGHm/A7eSaSQ0PVqzm77BdGQc+ltvyxnUoBSh9zPPaizsIGGS57OihUBELTKXh8bllHgU1jdT0z3wvBSF0xe/glEILElyx6OyrWRUIQ5zd8sFuJAUug8/z1YU2BRxqvu7mnEoPDlOq5O+zYRsGPJPY88p3KgUmfMrx3I4+CRVht+rqpVMSC0mh4PK8aiAFM4nU8tGAMQYfccLv45ZFDBFYr+ftrVwXCECY3PLEcSYGK4DN8tiIOQgZZ7vs559NEAxPpuPxtmQcBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hWEwlGnt/yv2wiBDGH0fPTgzQGHm/A7eSaSQ0PVqzm77BdGQc+ltvyxnUoBSh9zPPaizsIGGS57OihUBELTKXh8bllHgU1jdT0z3wvBSF0xe/glEILElyx6OyrWRUIQ5zd8sFuJAUug8/z1YU2BRxqvu7mnEoPDlOq5O+zYRsGPJPY88p3KgUmfMrx3I4+CRVht+rqpVMSC0mh4PK8aiAFM4nU8tGAMQYfccLv45ZFDBFYr+ftrVwXCECY3PLEcSYGK4DN8tiIOQgZZ7vs559NEAxPpuPxtmQcBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hWEwlGnt/yv2wiBDGH0fPTgzQGHm/A7eSaSQ0PVqzm77BdGQc+ltvyxnUoBSh9zPPaizsIGGS57OihUBELTKXh8bllHgU1jdT0z3wvBSF0xe/glEILElyx6OyrWRUIQ5zd8sFuJAUug8/z1YU2BRxqv+7mnEoPDlOq5O+zYRsGPJPY88p3KgUmfMrx3I4+CRVht+rqpVMSC0mh4PK8aiAFM4nU8tGAMQYfccLv45ZFDBFYr+ftrVwXCECY3PLEcSYGK4DN8tiIOQgZZ7vs559NEAxPpuPxtmQcBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hWEwlGnt/yv2wiBDGH0fPTgzQGHm/A7eSaSQ0PVqzm77BdGQc+ltvyxnUoBSh9zPPaizsIGGS57OihUBELTKXh8bllHgU1jdT0z3wvBSF0xe/glEILElyx6OyrWRUIQ5zd8sFuJAU=');
  audio.play();
}

// Main monitoring function
async function checkForChanges() {
  const settings = await chrome.storage.local.get(['isWatching', 'customPrompt']);
  if (!settings.isWatching || !settings.customPrompt) {
    return;
  }
  try {
    const pageText = document.body.innerText;
    const llmResult = await checkPageLLM(pageText, settings.customPrompt);

    // First run, just set initial state
    if (lastState === null) {
      lastState = llmResult.changed;
      return;
    }

    // Only act if LLM says changed
    if (llmResult.changed !== lastState) {
      const message = llmResult.summary || (llmResult.changed ? 'Change detected' : 'No change detected');
      if (llmResult.changed) {
        // Only send SMS/notifications if changed=true
        await Promise.all([
          sendSms(message),
          sendEmail(message),
          showNotification(message),
          playSound()
        ]);
      }
      lastState = llmResult.changed;
    }
  } catch (error) {
    console.error('Error checking for changes:', error);
    showNotification(`Error: ${error.message}`);
  }
}

// Setup monitoring and auto-refresh
async function initialize() {
  const settings = await chrome.storage.local.get(['isWatching', 'isAutoRefreshing', 'interval']);

  if (settings.isWatching) {
    // Wait 3 seconds before initial check (handled by DOMContentLoaded)
    checkForChanges();

    // Setup auto-refresh if enabled
    if (settings.isAutoRefreshing && settings.interval) {
      refreshInterval = setInterval(() => {
        window.location.reload();
      }, settings.interval * 1000);
    }
  }
}

// Start monitoring with a 3-second wait after each page load
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initialize();
  }, 3000);
});
