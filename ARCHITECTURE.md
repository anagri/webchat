# Webchat Architecture

## Bodhi Integration Layer

This application properly uses the **bodhijs library abstraction** instead of directly accessing browser extension APIs.

### ✅ Correct Pattern (Used in this app):

```typescript
// ✅ Use bodhijs library functions
import { isInstalled, makeRequest, chat } from '@bodhiapp/bodhijs';

// Check extension status
const extensionInstalled = isInstalled();

// Make API requests
const response = await makeRequest({
  method: 'GET',
  endpoint: '/v1/models'
});

// Chat completions
const result = await chat.completions.create(params);
```

### ❌ Incorrect Pattern (Avoid):

```typescript
// ❌ Never access window.bodhiext directly in application code
if (window.bodhiext && window.bodhiext.api) {
  const data = await window.bodhiext.api.request('GET', '/v1/models');
}
```

## Benefits of Using bodhijs Abstraction

1. **Error Handling**: Consistent error handling with `BodhiError` types
2. **Type Safety**: Proper TypeScript interfaces and type checking
3. **Future Compatibility**: Changes to extension API won't break application code
4. **Testing**: Easier to mock and test with proper abstractions
5. **Maintainability**: Centralized logic for extension communication

## Application Architecture

```
React Components
       ↓
Custom Hooks (useModels, useChat, useSystemStatus)
       ↓
bodhijs Library (isInstalled, makeRequest, chat)
       ↓
Bodhi Browser Extension (window.bodhiext)
       ↓
Bodhi App Server
```

## Key Components

- **useModels**: Fetches available models using `makeRequest()`
- **useChat**: Handles chat completions using `chat.completions.create()`
- **useSystemStatus**: Checks system availability using `isInstalled()` and `isServerAvailable()`

All components use the bodhijs library exclusively for extension communication. 