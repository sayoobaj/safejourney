import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { findRoute, getRouteStates, getAllRouteStates } from "@/data/routes";
import { NIGERIAN_STATES } from "@/data/states";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Send message to Telegram
async function sendMessage(chatId: string, text: string, options?: any) {
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN not configured");
    return;
  }

  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        ...options,
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}

// Format safety score for display
function formatSafetyEmoji(score: number): string {
  if (score >= 8) return "🟢";
  if (score >= 6) return "🟡";
  if (score >= 4) return "🟠";
  return "🔴";
}

// Handle /start command
async function handleStart(chatId: string) {
  const message = `🛡️ *Welcome to SafeJourney.ng Bot*

Track security incidents across Nigeria and stay safe.

*Commands:*
/route Lagos Abuja - Check route safety
/state Kaduna - Get state safety report
/alert Kaduna - Subscribe to state alerts
/alerts - View your subscriptions
/stop Kaduna - Unsubscribe from alerts
/help - Show this help

Stay informed. Stay safe. 🇳🇬`;

  await sendMessage(chatId, message);
}

// Handle /route command
async function handleRoute(chatId: string, args: string[]) {
  if (args.length < 2) {
    await sendMessage(chatId, "Usage: /route Lagos Abuja\n\nExample cities: Lagos, Abuja, Kano, Kaduna, Port Harcourt");
    return;
  }

  const from = args[0];
  const to = args.slice(1).join(" ");

  const route = findRoute(from, to);
  
  if (!route) {
    const available = getAllRouteStates().slice(0, 10).join(", ");
    await sendMessage(chatId, `❌ No known route from ${from} to ${to}\n\nAvailable cities: ${available}...`);
    return;
  }

  // Get incidents along the route
  const routeStates = getRouteStates(route);
  const dateFilter = new Date();
  dateFilter.setDate(dateFilter.getDate() - 7);

  const incidents = await prisma.incident.findMany({
    where: {
      state: { in: routeStates },
      date: { gte: dateFilter },
    },
  });

  const totalIncidents = incidents.length;
  const killed = incidents.reduce((sum, i) => sum + i.killed, 0);
  const kidnapped = incidents.reduce((sum, i) => sum + i.kidnapped, 0);

  // Calculate simple risk level
  let riskLevel = "🟢 LOW RISK";
  let advice = "Route is generally safe. Normal precautions advised.";
  
  if (totalIncidents >= 5) {
    riskLevel = "🔴 HIGH RISK";
    advice = "Frequent incidents. Consider postponing or use air travel.";
  } else if (totalIncidents >= 2) {
    riskLevel = "🟠 MODERATE RISK";
    advice = "Some incidents reported. Travel during daylight only.";
  }

  const message = `🛣️ *${route.from} → ${route.to}*

${riskLevel}

📍 *Route:* ${routeStates.join(" → ")}
📏 *Distance:* ${route.distanceKm} km
⏱️ *Duration:* ~${route.estimatedHours}h

📊 *Last 7 days:*
• ${totalIncidents} incident${totalIncidents !== 1 ? "s" : ""} on this route
${killed > 0 ? `• ${killed} killed\n` : ""}${kidnapped > 0 ? `• ${kidnapped} kidnapped\n` : ""}
💡 *Advice:* ${advice}

🕐 *Safest time:* 6 AM - 2 PM

[Subscribe to route alerts: /alert ${route.from}]`;

  await sendMessage(chatId, message);
}

// Handle /state command
async function handleState(chatId: string, args: string[]) {
  if (args.length < 1) {
    await sendMessage(chatId, "Usage: /state Kaduna\n\nGet safety report for a Nigerian state.");
    return;
  }

  const stateName = args.join(" ");
  const state = NIGERIAN_STATES.find(
    (s) => s.name.toLowerCase() === stateName.toLowerCase()
  );

  if (!state) {
    const suggestions = NIGERIAN_STATES.slice(0, 5).map((s) => s.name).join(", ");
    await sendMessage(chatId, `❌ Unknown state: ${stateName}\n\nExamples: ${suggestions}...`);
    return;
  }

  // Get incidents for this state
  const dateFilter = new Date();
  dateFilter.setDate(dateFilter.getDate() - 7);

  const incidents = await prisma.incident.findMany({
    where: {
      state: state.name,
      date: { gte: dateFilter },
    },
    orderBy: { date: "desc" },
    take: 5,
  });

  const totalIncidents = incidents.length;
  const killed = incidents.reduce((sum, i) => sum + i.killed, 0);
  const kidnapped = incidents.reduce((sum, i) => sum + i.kidnapped, 0);

  // Calculate score
  const score = Math.max(1, 10 - totalIncidents * 1.5);
  const emoji = formatSafetyEmoji(score);

  let recentList = "";
  if (incidents.length > 0) {
    recentList = "\n\n📰 *Recent incidents:*\n" + 
      incidents.slice(0, 3).map((i) => 
        `• ${i.title.slice(0, 50)}${i.title.length > 50 ? "..." : ""}`
      ).join("\n");
  }

  const message = `📍 *${state.name} State*
_${state.zone} Region_

${emoji} Safety Score: *${score.toFixed(1)}/10*

📊 *Last 7 days:*
• ${totalIncidents} incident${totalIncidents !== 1 ? "s" : ""}
${killed > 0 ? `• ${killed} killed\n` : ""}${kidnapped > 0 ? `• ${kidnapped} kidnapped` : ""}${recentList}

🔔 Subscribe: /alert ${state.name}`;

  await sendMessage(chatId, message);
}

// Handle /alert command (subscribe)
async function handleAlert(chatId: string, args: string[]) {
  if (args.length < 1) {
    await sendMessage(chatId, "Usage: /alert Kaduna\n\nSubscribe to alerts for a state.");
    return;
  }

  const stateName = args.join(" ");
  const state = NIGERIAN_STATES.find(
    (s) => s.name.toLowerCase() === stateName.toLowerCase()
  );

  if (!state) {
    await sendMessage(chatId, `❌ Unknown state: ${stateName}`);
    return;
  }

  try {
    await prisma.alertSubscription.upsert({
      where: {
        platform_userId_type_target: {
          platform: "telegram",
          userId: chatId,
          type: "state",
          target: state.name,
        },
      },
      update: { active: true },
      create: {
        platform: "telegram",
        userId: chatId,
        type: "state",
        target: state.name,
        minSeverity: "MODERATE",
        active: true,
      },
    });

    await sendMessage(chatId, `✅ Subscribed to alerts for *${state.name}*\n\nYou'll receive notifications when security incidents are reported.\n\nUnsubscribe: /stop ${state.name}`);
  } catch (error) {
    await sendMessage(chatId, "❌ Failed to subscribe. Please try again.");
  }
}

// Handle /alerts command (list subscriptions)
async function handleAlerts(chatId: string) {
  const subscriptions = await prisma.alertSubscription.findMany({
    where: {
      platform: "telegram",
      userId: chatId,
      active: true,
    },
  });

  if (subscriptions.length === 0) {
    await sendMessage(chatId, "📭 No active subscriptions.\n\nSubscribe with: /alert Kaduna");
    return;
  }

  const list = subscriptions.map((s) => `• ${s.target} (${s.type})`).join("\n");
  await sendMessage(chatId, `🔔 *Your Alert Subscriptions:*\n\n${list}\n\nUnsubscribe: /stop [state]`);
}

// Handle /stop command (unsubscribe)
async function handleStop(chatId: string, args: string[]) {
  if (args.length < 1) {
    await sendMessage(chatId, "Usage: /stop Kaduna\n\nUnsubscribe from state alerts.");
    return;
  }

  const target = args.join(" ");

  try {
    await prisma.alertSubscription.updateMany({
      where: {
        platform: "telegram",
        userId: chatId,
        target: { equals: target, mode: "insensitive" },
      },
      data: { active: false },
    });

    await sendMessage(chatId, `✅ Unsubscribed from alerts for *${target}*`);
  } catch (error) {
    await sendMessage(chatId, "❌ Failed to unsubscribe. Please try again.");
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    // Parse command
    const parts = text.split(/\s+/);
    const command = parts[0].toLowerCase().replace("@safejourney_ng_bot", "");
    const args = parts.slice(1);

    switch (command) {
      case "/start":
      case "/help":
        await handleStart(chatId);
        break;
      case "/route":
        await handleRoute(chatId, args);
        break;
      case "/state":
        await handleState(chatId, args);
        break;
      case "/alert":
        await handleAlert(chatId, args);
        break;
      case "/alerts":
        await handleAlerts(chatId);
        break;
      case "/stop":
        await handleStop(chatId, args);
        break;
      default:
        // Try to interpret as a route query
        if (parts.length >= 2 && !text.startsWith("/")) {
          await handleRoute(chatId, parts);
        }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: "SafeJourney Bot webhook active" });
}
