import axios from "axios";
import * as path from "path";
import { promises as fs } from "fs";

export { notificationService };

const notificationService = {
  hasNotificationBeenSentRecently,
  sendNotification,
};

async function sendNotification(id: string, message: string) {
  await storeNotificationSent(id);
  await sendSms(message);
}

async function storeNotificationSent(id: string) {
  const lastNotificationDateById = await parseNotificationFile();
  lastNotificationDateById[id] = new Date();

  return fs.writeFile(
    path.resolve("services/notifications.json"),
    JSON.stringify(lastNotificationDateById)
  );
}

async function hasNotificationBeenSentRecently(id: string) {
  const DELAY_THRESHOLD = 3 * 3600 * 1000;

  const lastNotificationDateById = await parseNotificationFile();
  if (!lastNotificationDateById[id]) {
    return false;
  }
  const lastNotificationDate = new Date(lastNotificationDateById[id]);
  const now = Date.now();

  return lastNotificationDate.getTime() + DELAY_THRESHOLD > now;
}

async function parseNotificationFile() {
  const notificationsFileContent = await fs.readFile(
    path.resolve("services/notifications.json"),
    { encoding: "utf-8" }
  );

  const lastNotificationDateById: Record<string, Date> = JSON.parse(
    notificationsFileContent
  );
  return lastNotificationDateById;
}

async function sendSms(message: string) {
  return axios.post("https://smsapi.free-mobile.fr/sendmsg", {
    user: process.env.FREE_MOBILE_USER,
    pass: process.env.FREE_MOBILE_PASS,
    msg: message,
  });
}
