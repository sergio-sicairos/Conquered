# Test the Bar Crawl app on your phone (served from your Mac)

Your Mac runs the app locally. A tool called `cloudflared` gives you a temporary
secure `https://` link that forwards to your Mac, so your phone can open it with
camera + GPS working. Nothing is uploaded or published — close the terminals and
the link disappears.

You'll keep **two Terminal windows** open at the end: one running the web server,
one running the tunnel.

---

## Step 1 — Save the app file

From the chat, save **`sf_bar_checkin_prototype.html`** to your **Desktop**.
(Keep the exact filename.)

## Step 2 — Open Terminal

Press **Cmd + Space**, type **Terminal**, press **Enter**.

## Step 3 — Install Homebrew (Mac's app installer)

Copy–paste this whole line into Terminal and press Enter:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

- It will ask for your **Mac login password** (typing shows nothing — that's normal), then Enter.
- It may install "Command Line Tools" too — let it. This takes **5–15 minutes** the first time.
- When it finishes, if it prints a "Next steps" box telling you to run two commands,
  paste those. On most modern Macs they are:

```
(echo; echo 'eval "$(/opt/homebrew/bin/brew shellenv)"') >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Check it worked:

```
brew --version
```

You should see a version number.

## Step 4 — Install cloudflared

```
brew install cloudflared
```

## Step 5 — Start the local web server

```
cd ~/Desktop
python3 -m http.server 8000
```

- If macOS pops up "install the command line developer tools," click **Install**, wait, then run the two lines again.
- Success looks like: `Serving HTTP on :: port 8000 ...`
- **Leave this window open and running.**

## Step 6 — Start the tunnel (new window)

Open a second Terminal window: **Cmd + N**. Then:

```
cloudflared tunnel --url http://localhost:8000
```

It prints a line with a link like:

```
https://random-words-1234.trycloudflare.com
```

Copy that link. **Leave this window open too.**

## Step 7 — Open it on your phone

In your phone's browser, go to the link **plus the filename**, e.g.:

```
https://random-words-1234.trycloudflare.com/sf_bar_checkin_prototype.html
```

Tip: text/email the link to yourself so you don't type it by hand.

## Step 8 — Try a check-in

1. Confirm the **21+** prompt.
2. Tap a bar pin (or a bar in the list) → **Check in here**.
3. **Allow location** and **allow camera** when asked.
4. If you're not physically at that bar, it'll say you're too far — that's the geofence working.
   To preview the camera step anyway, turn on **"Test mode (skip geofence)"** in the top bar.
5. Record a real sip → it confirms ✅. Hold still like a photo → it flags 🚫.

---

## When you're done

Click each Terminal window and press **Ctrl + C** to stop the server and the tunnel.
The link stops working immediately.

## Troubleshooting

- **Camera won't open:** make sure you used the `https://...trycloudflare.com` link, not an `http://` or IP address. Camera only works over https.
- **"command not found: brew":** re-run the two `eval` lines from Step 3, or close and reopen Terminal.
- **"command not found: python3":** run `xcode-select --install`, finish that install, then retry Step 5.
- **Page won't load on phone:** confirm both Terminal windows are still running, and that you added `/sf_bar_checkin_prototype.html` to the end of the link.
- **Tunnel link changed:** it's random every run. If you restart Step 6, use the new link.
- **Prefer not to install Homebrew?** Tell me and I'll give you the `ngrok` route or a direct `cloudflared` download instead.
