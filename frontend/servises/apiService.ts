const makeRequest = async (url: string, method: string, body?: any) => {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API request failed with status ${response.status}: ${errorBody}`);
      throw new Error(`API request failed: ${response.statusText}`);
    }
    // Handle cases with no response body (e.g., 204 No Content)
    if (response.status === 204) {
        return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in ${method} ${url}:`, error);
    throw error;
  }
};

export const api = {
  getKeywords: (baseUrl: string): Promise<string[]> =>
    makeRequest(`${baseUrl}/api/keywords`, 'GET'),
    
  addKeyword: (baseUrl: string, keyword: string): Promise<any> =>
    makeRequest(`${baseUrl}/api/keywords`, 'POST', { keyword }),

  deleteKeyword: (baseUrl: string, keyword: string): Promise<any> =>
    makeRequest(`${baseUrl}/api/keywords`, 'DELETE', { keyword }),

  getChats: (baseUrl: string): Promise<number[]> =>
    makeRequest(`${baseUrl}/api/chats`, 'GET'),

  addChat: (baseUrl: string, chatId: string): Promise<any> =>
    makeRequest(`${baseUrl}/api/chats`, 'POST', { chat_id: chatId }),

  deleteChat: (baseUrl: string, chatId: number): Promise<any> =>
    makeRequest(`${baseUrl}/api/chats`, 'DELETE', { chat_id: chatId }),
};