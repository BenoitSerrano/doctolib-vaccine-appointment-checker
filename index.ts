import axios from "axios";

function main() {
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

  if (total > 0) {
    sendSms();
  }
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

function sendSms() {
  console.log("SMS");
}

main();
