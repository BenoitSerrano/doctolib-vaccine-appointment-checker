import axios from "axios";
import { jsonParser } from "../utils/jsonParser";

export { notificationService };

type notificationFileType = Record<string, Date>;

const notificationPathname = "services/notifications.json";

const notificationService = {
  hasNotificationBeenSentRecently,
  sendNotification,
};

async function sendNotification(id: string, message: string) {
  await storeNotificationSent(id);
  await sendSms(message);
}

async function storeNotificationSent(id: string) {
  const lastNotificationDateById = await jsonParser.parse<notificationFileType>(
    notificationPathname
  );
  lastNotificationDateById[id] = new Date();

  return jsonParser.store(lastNotificationDateById);
}

async function hasNotificationBeenSentRecently(id: string) {
  const DELAY_THRESHOLD = 3 * 3600 * 1000;

  const lastNotificationDateById = await jsonParser.parse<notificationFileType>(
    notificationPathname
  );
  if (!lastNotificationDateById[id]) {
    return false;
  }
  const lastNotificationDate = new Date(lastNotificationDateById[id]);
  const now = Date.now();

  return lastNotificationDate.getTime() + DELAY_THRESHOLD > now;
}

async function sendSms(message: string) {
  return axios.post("https://smsapi.free-mobile.fr/sendmsg", {
    user: process.env.FREE_MOBILE_USER,
    pass: process.env.FREE_MOBILE_PASS,
    msg: message,
  });
}
