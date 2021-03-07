import axios from "axios";
import * as sendgridMail from "@sendgrid/mail";

function main() {
  init();
  fetchAvailabilitiesFromDoctolib();
}

async function fetchAvailabilitiesFromDoctolib() {
  const bookingRequest = buildBookingRequest();
  const { data: bookingData } = await axios.get(bookingRequest);
  const centerName = bookingData.data.profile.name_with_title_and_determiner;

  const hasAvailability = bookingData.data.agendas.some(
    (agenda: { booking_disabled: boolean }) => !agenda.booking_disabled
  );
  if (!hasAvailability) {
    console.log(`No open agenda at ${centerName}`);
    return;
  }

  const visitMotive = bookingData.data.visit_motives.find(
    (visitMotive: { name: string }) =>
      visitMotive.name.includes("1ère injection")
  );

  if (!visitMotive) {
    console.log(`No visit motive at ${centerName}`);
    return;
  }

  const agendaIds = bookingData.data.agendas.map(
    (agenda: { id: string }) => agenda.id
  );

  const availabilitiesRequest = buildAvailabilitiesRequest({
    agendaIds,
    visitMotiveId: visitMotive.id,
  });
  const { data: availabilitiesData } = await axios.get(availabilitiesRequest);
  const total = availabilitiesData.total;
  console.log(`Found ${total} availibilities at ${centerName}`);

  // if (total > 0) {
  await sendEmailNotification();
  console.log("Mail sent!");
  // }
}

function buildBookingRequest() {
  return `https://www.doctolib.fr/booking/${process.env.CENTER_SLUG}.json`;
}

function buildAvailabilitiesRequest(params: {
  agendaIds: string[];
  visitMotiveId: string;
}) {
  const now = new Date();
  const startDate = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  return `https://www.doctolib.fr/availabilities.json?visit_motive_ids=${
    params.visitMotiveId
  }&agenda_ids=${params.agendaIds.join("-")}&start_date=${startDate}`;
}

function init() {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  if (!SENDGRID_API_KEY) {
    throw new Error("No SENDGRID_API_KEY provided in .env file");
  }
  sendgridMail.setApiKey(SENDGRID_API_KEY);
}

function sendEmailNotification() {
  const SENDGRID_SENDER_EMAIL = process.env.SENDGRID_SENDER_EMAIL;
  const SENDGRID_RECIPIENT_EMAIL = process.env.SENDGRID_RECIPIENT_EMAIL;
  if (!SENDGRID_SENDER_EMAIL || !SENDGRID_RECIPIENT_EMAIL) {
    throw new Error(
      "No SENDGRID_SENDER_EMAIL or SENDGRID_RECIPIENT_EMAIL provided in .env file"
    );
  }
  const message = {
    to: SENDGRID_RECIPIENT_EMAIL,
    from: SENDGRID_SENDER_EMAIL,
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  };
  return sendgridMail.send(message);
}

main();
