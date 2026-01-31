
# Fix AI Study Assistant - Rate Limit Issue

## Problem Summary
The AI Chat is failing because:
1. **429 Rate Limit errors** from OpenAI API
2. **169 messages** being sent per request (too large)
3. OpenAI quota/rate limits are being exceeded

## Recommended Solution: Migrate to Lovable AI + Message Limits

This approach solves both issues: uses the built-in AI gateway (no external API key needed) and limits message history.

---

## Changes Overview

### 1. Update Edge Function (`supabase/functions/ai-chat/index.ts`)

| Change | Description |
|--------|-------------|
| Switch API endpoint | Use `https://ai.gateway.lovable.dev/v1/chat/completions` |
| Use LOVABLE_API_KEY | Already configured, no setup needed |
| Add message truncation | Limit to last 20 messages to avoid token overflow |
| Update model | Use `google/gemini-3-flash-preview` (fast, efficient) |

**Key code changes:**
```typescript
// Before
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
  body: JSON.stringify({ model: "gpt-4o-mini", messages: [...] })
});

// After
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
// Truncate messages to last 20 to prevent token overflow
const truncatedMessages = messages.slice(-20);
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
  body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages: [...] })
});
```

### 2. Update Frontend Error Handling (`src/components/AIChatBox.tsx`)

Add user-friendly error messages for rate limits:
- Show toast notification when rate limited
- Suggest clearing chat history if messages are too many
- Add "Clear old messages" option

---

## Technical Details

### Message Truncation Strategy
```typescript
// Keep system prompt + last 20 user/assistant messages
const MAX_MESSAGES = 20;
const truncatedMessages = transformedMessages.length > MAX_MESSAGES 
  ? transformedMessages.slice(-MAX_MESSAGES)
  : transformedMessages;
```

### Updated Error Responses
```typescript
if (response.status === 429) {
  return new Response(
    JSON.stringify({ 
      error: "Too many requests. Please wait a moment and try again.",
      shouldClearHistory: transformedMessages.length > 50
    }),
    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/ai-chat/index.ts` | Switch to Lovable AI, add message truncation, update model |
| `src/components/AIChatBox.tsx` | Better error handling, suggest clearing history |

---

## Expected Results
- AI Chat will work reliably without rate limit errors
- Uses built-in Lovable AI (no external API key dependencies)
- Message history is automatically truncated to prevent overflows
- Better error messages guide users when issues occur
