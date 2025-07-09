import { BrowserContext, Page } from 'playwright-core';

// Helper function to wait for element to be visible
export async function waitForElement(page: Page, selector: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

// Helper function to wait for extension to be loaded
export async function waitForExtension(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      return typeof (window as any).bodhiext !== 'undefined';
    },
    { timeout: 5000 }
  );
}

// Helper function to wait for webchat app to be ready
export async function waitForWebchatReady(page: Page): Promise<void> {
  await page.waitForSelector('.chat-page', { state: 'visible', timeout: 10000 });
}

// Helper function to send a message in webchat
export async function sendMessage(page: Page, message: string): Promise<void> {
  await page.fill('.message-input', message);
  await page.click('.send-button');
}

// Helper function to wait for AI response
export async function waitForAIResponse(page: Page, timeout = 15000): Promise<string> {
  // Wait for loading to finish
  await page.waitForSelector('.message.assistant.loading', { state: 'hidden', timeout });
  
  // Get the last assistant message
  const messages = await page.locator('.message.assistant').all();
  if (messages.length === 0) {
    throw new Error('No AI response found');
  }
  
  const lastMessage = messages[messages.length - 1];
  const content = await lastMessage.locator('.message-content').textContent();
  
  if (!content) {
    throw new Error('AI response content is empty');
  }
  
  return content.trim();
}

// Helper function to get all messages
export async function getAllMessages(page: Page): Promise<Array<{ role: string; content: string }>> {
  const messages = await page.locator('.message').all();
  const result: Array<{ role: string; content: string }> = [];
  
  for (const message of messages) {
    const roleElement = await message.locator('.message-role').textContent();
    const contentElement = await message.locator('.message-content').textContent();
    
    if (roleElement && contentElement) {
      const role = roleElement.toLowerCase() === 'you' ? 'user' : 'assistant';
      result.push({ role, content: contentElement.trim() });
    }
  }
  
  return result;
}

// Helper function to select a model
export async function selectModel(page: Page, modelName: string): Promise<void> {
  await page.selectOption('#model-select', { label: modelName });
}

// Helper function to start a new chat
export async function startNewChat(page: Page): Promise<void> {
  await page.click('.new-chat-button');
}

// Helper function to check if error popup is visible
export async function isErrorPopupVisible(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('.error-popup', { state: 'visible', timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

// Helper function to get error popup message
export async function getErrorPopupMessage(page: Page): Promise<string> {
  const popup = await page.locator('.error-popup-content p');
  const message = await popup.textContent();
  return message?.trim() || '';
}

// Helper function to close error popup
export async function closeErrorPopup(page: Page): Promise<void> {
  await page.click('.error-popup-button');
  await page.waitForSelector('.error-popup', { state: 'hidden', timeout: 5000 });
}

// OAuth2 token acquisition function
export async function directAccessGrant(
  authUrl: string,
  realm: string,
  clientId: string,
  clientSecret: string,
  username: string,
  password: string
): Promise<string> {
  const tokenUrl = `${authUrl}/realms/${realm}/protocol/openid-connect/token`;

  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: clientId,
    client_secret: clientSecret,
    username: username,
    password: password,
    scope: ['openid', 'email', 'profile', 'roles', 'scope_user_user'].join(' '),
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Failed to get OAuth2 token: ${response.status} ${response.statusText}`);
  }

  const tokenData = await response.json();

  if (!tokenData.access_token) {
    throw new Error('Missing access_token in OAuth2 response');
  }

  return tokenData.access_token;
}

// Helper function to set backend URL via extension settings
export const setBackendUrl = async (
  browser: BrowserContext,
  extensionId: string,
  backendPort: number
) => {
  // Create a popup page to set the URL
  const popupPage = await browser.newPage();
  try {
    await popupPage.goto(`chrome-extension://${extensionId}/index.html`);
    await popupPage.waitForSelector('form');
    await popupPage.$eval('#backendUrl', (input: Element) => {
      (input as HTMLInputElement).value = '';
    });
    await popupPage.type('#backendUrl', `http://localhost:${backendPort}`, { delay: 1 });
    await popupPage.click('button[type="submit"]');

    // Wait for message-container with success or error class
    await popupPage.waitForFunction(
      () => {
        const messageContainer = document.querySelector('.message-container');
        return (
          messageContainer &&
          (messageContainer.classList.contains('success') ||
            messageContainer.classList.contains('error'))
        );
      },
      { polling: 50 }
    );

    // Check if there's an error and fail the test if so
    const hasError = await popupPage.evaluate(() => {
      const messageContainer = document.querySelector('.message-container');
      return messageContainer && messageContainer.classList.contains('error');
    });

    if (hasError) {
      const errorMessage = await popupPage.evaluate(() => {
        const element = document.querySelector('.message-container');
        return element ? element.textContent : 'Unknown error';
      });
      throw new Error(`Failed to set backend URL: ${errorMessage}`);
    }
  } finally {
    await popupPage.close();
  }
}; 