import axios from "axios";
import * as path from "path";
import { promises as fs } from "fs";

export { notificationService };

const notificationService = {
  hasNotificationBeenSentRecently,
  sendSms,
};

async function hasNotificationBeenSentRecently(id: string) {
  const DELAY_THRESHOLD = 3 * 3600 * 1000;

  const notificationsFileContent = await fs.readFile(
    path.resolve("services/notifications.json"),
    { encoding: "utf-8" }
  );

  const lastNotificationDateById: Record<string, Date> = JSON.parse(
    notificationsFileContent
  );
  const lastNotificationDate = lastNotificationDateById[id];
  const now = Date.now();

  return (
    !!lastNotificationDate &&
    lastNotificationDate.getTime() + DELAY_THRESHOLD > now
  );
}

async function sendSms(message: string) {
  return axios.post("https://smsapi.free-mobile.fr/sendmsg", {
    user: process.env.FREE_MOBILE_USER,
    pass: process.env.FREE_MOBILE_PASS,
    msg: message,
  });
}
