// Netlify Forms -> Outgoing webhook -> цей файл -> Telegram Bot API.
// Викликається автоматично Netlify при кожній новій відправці форми "kontakty".
// Токен і chat_id беруться з env variables (Site settings -> Environment variables),
// щоб не зберігати секрети в репозиторії.

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: "Invalid payload" };
  }

  // Outgoing webhook надсилає заявку на верхньому рівні ({ form_name, data, ... }),
  // а подієва функція submission-created — обгорнуту в { payload: {...} }. Приймаємо обидва.
  const payload = body && (body.payload || body);
  if (!payload || payload.form_name !== "kontakty") {
    console.warn("Ignored submission, form_name =", payload && payload.form_name);
    return { statusCode: 200, body: "Ignored" };
  }

  const data = payload.data || {};
  const formatLabel = data.format === "offline" ? "Очно, Черкаси" : "Онлайн";

  const text = [
    "📩 Нова заявка з сайту",
    "Ім'я: " + (data.name || "-"),
    "Контакт: " + (data.contact || "-"),
    "Формат: " + formatLabel,
    data.message ? "Повідомлення: " + data.message : null
  ].filter(Boolean).join("\n");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars");
    return { statusCode: 500, body: "Server misconfigured" };
  }

  const response = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Telegram API error:", errText);
    return { statusCode: 502, body: "Telegram API error" };
  }

  return { statusCode: 200, body: "OK" };
};
