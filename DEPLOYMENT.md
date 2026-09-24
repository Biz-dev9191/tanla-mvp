# Deployment Guide: AI Customer Communication Orchestrator

This guide details how to deploy the **Aurora Cloud AI Customer Communication Orchestrator** to production on **Vercel** or **Cloudflare Pages**.

---

## 1. Zero-Config Deployment on Vercel (Recommended)

Vercel provides native, optimized hosting for Next.js App Router applications with zero configuration required.

### Method A: Deploy via Vercel CLI (Fastest)

1. Open your terminal in the project directory:
   ```bash
   cd "c:\Users\rachi\Desktop\Tanla MVP"
   ```

2. Run the Vercel deploy command:
   ```bash
   npx vercel
   ```

3. Follow the CLI prompts to link your Vercel account and project.

4. To deploy directly to production:
   ```bash
   npx vercel --prod
   ```

### Method B: Deploy via GitHub / GitLab

1. Push this repository to GitHub or GitLab.
2. Visit [vercel.com/new](https://vercel.com/new).
3. Import your repository.
4. Set the Framework Preset to **Next.js**.
5. Add Environment Variables (see Section 3 below).
6. Click **Deploy**.

---

## 2. Deployment on Cloudflare Pages

1. Install Cloudflare Next.js adapter:
   ```bash
   npm install --save-dev @cloudflare/next-on-pages
   ```

2. Build the project using the Cloudflare adapter:
   ```bash
   npx @cloudflare/next-on-pages
   ```

3. Deploy via Cloudflare Wrangler:
   ```bash
   npx wrangler pages deploy .vercel/output/static
   ```

---

## 3. Environment Variables & Production Secrets

Configure the following environment variables in your Vercel / Cloudflare Project Settings:

| Variable | Description | Required? | Default / Fallback |
| :--- | :--- | :--- | :--- |
| `RESEND_API_KEY` | Resend API Key for sending live outbound emails | Optional | Simulation Mode |
| `EMAIL_FROM` | Sender display name and address | Optional | `onboarding@resend.dev` |
| `GEMINI_API_KEY` | Google Gemini API Key for online LLM agents | Optional | Built-in Multi-Agent Engine |
| `OPENAI_API_KEY` | OpenAI API Key (alternative LLM backend) | Optional | Built-in Multi-Agent Engine |

> [!NOTE]
> If API keys are omitted in the environment, the application will automatically run with the **Built-in Deterministic Multi-Agent Engine**, ensuring 100% uptime with zero runtime failures. Users can also enter their keys directly in the in-app **API Keys & Settings** modal.

---

## 4. Production Build Verification

To verify the production build locally before deploying:

```bash
# 1. Build the production bundle
npm run build

# 2. Start the production server
npm run start
```

---

## 5. Security & Brand Compliance Checklist

- [x] **Aurora Cloud Design System**: `#2B4C7E` primary, `#1A1D21` neutral-900, `#F5F6F8` canvas, Inter typography.
- [x] **Deterministic Safety Guardrails**: Opt-in consent enforcement, fatigue limits ($> 2$ promo / $> 3$ tx per 24h), PII redaction.
- [x] **Zero Exclamation Marks**: Product copy adheres strictly to calm, competent, direct tone.
- [x] **Multi-Channel Delivery**: Interactive previews for WhatsApp, SMS, Email, and Voice.
- [x] **Live Email Dispatch**: Verified Resend API integration with error handling and simulation fallback.
