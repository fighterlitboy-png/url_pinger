// pinger.js
var pinger_default = {
  // ✅ Ping လုပ်မည့် URLs
  urlsToPing: [
    "https://oscar-library-bot.onrender.com"
    // နောက်ထပ် URLs ထည့်လို့ ရ
    // "https://your-bot-2.onrender.com",
  ],

  async scheduled(event, env, ctx) {
    if (this.urlsToPing.length === 0) {
      console.log("⚠️ No URLs configured to ping");
      return;
    }

    // ✅ Scheduled Time ပြ
    const scheduledTime = new Date(event.scheduledTime).toISOString();
    console.log(`⏰ Scheduled ping at ${scheduledTime}`);

    const pingPromises = this.urlsToPing.map(async (url) => {
      try {
        // ✅ Browser User-Agent + Headers
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,my;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          redirect: 'follow',
        });

        console.log(`✅ Pinged ${url}: ${response.status} at ${new Date().toISOString()}`);
        return { url, status: response.status, success: true };
        
      } catch (error) {
        console.error(`❌ Failed to ping ${url}: ${error.message}`);
        return { url, status: 0, success: false, error: error.message };
      }
    });

    const results = await Promise.all(pingPromises);
    
    // ✅ Summary
    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Ping Summary: ${successCount}/${results.length} successful`);
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      // ✅ URLs စာရင်း ပြ
      const urlsList = this.urlsToPing.length > 0
        ? this.urlsToPing.map(u => `  • ${u}`).join("\n")
        : "  (No URLs configured)";
      
      return new Response(
        `🤖 Cloudflare Worker - Keep Alive\n\n` +
        `📋 Configured URLs to ping:\n${urlsList}\n\n` +
        `⏰ Schedule: Every 5 minutes\n` +
        `📊 Total: ${this.urlsToPing.length} URL(s)`,
        { 
          status: 200, 
          headers: { 
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache"
          } 
        }
      );
    }

    // ✅ Manual Ping Endpoint
    if (url.pathname === "/ping") {
      const results = [];
      
      for (const targetUrl of this.urlsToPing) {
        try {
          const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          });
          results.push(`✅ ${targetUrl}: ${response.status}`);
        } catch (error) {
          results.push(`❌ ${targetUrl}: ${error.message}`);
        }
      }
      
      return new Response(
        `📊 Manual Ping Results:\n\n${results.join("\n")}`,
        { 
          status: 200, 
          headers: { "Content-Type": "text/plain; charset=utf-8" } 
        }
      );
    }

    return new Response("Not Found", { status: 404 });
  }
};

export {
  pinger_default as default
};
