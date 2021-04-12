import axios from "axios";
import { jsonParser } from "../utils/jsonParser";
import { notificationService } from "./notificationService";

export { fetchAvailabilitiesFromDoctolib };

const AVAILABLE_APPOINTMENTS_THRESHOLD_TO_SEND_NOTIFICATION = 2;

type vaccineType = "AstraZeneca" | "Pfizer";

type doctolibProfileType = {
  centerSlugs: string[];
  notificationMean: "SMS";
  vaccines: Array<vaccineType>;
};

type bookingResponseType = {
  data: {
    data: {
      agendas: Array<{ id: string; booking_disabled: boolean }>;
      profile: {
        name_with_title_and_determiner: string;
        id: string;
      };
      visit_motives: Array<{ id: string; name: string }>;
    };
  };
};

async function fetchAvailabilitiesFromDoctolib() {
  const doctolibProfiles = await extractDoctolibProfiles();
  await Promise.all(
    doctolibProfiles.map(async (doctolibProfile) =>
      fetchAvailabilitiesForDoctolibProfile(doctolibProfile)
    )
  );
  console.log("All Doctolib profiles treated!");
}

async function fetchAvailabilitiesForDoctolibProfile(
  doctolibProfile: doctolibProfileType
) {
  return Promise.all(
    doctolibProfile.centerSlugs.map(async (centerSlug) => {
      const bookingRequest = buildBookingRequest(centerSlug);
      const { data: bookingData }: bookingResponseType = await axios.get(
        bookingRequest
      );
      const centerName =
        bookingData.data.profile.name_with_title_and_determiner;
      const centerId = bookingData.data.profile.id;

      const hasAvailability = bookingData.data.agendas.some(
        (agenda: { booking_disabled: boolean }) => !agenda.booking_disabled
      );
      if (!hasAvailability) {
        console.log(`No open agenda at ${centerName}`);
        return undefined;
      }

      const visitMotive = bookingData.data.visit_motives.find(
        (visitMotive: { name: string }) =>
          visitMotive.name.includes("1ère injection") &&
          doctolibProfile.vaccines.some((vaccine) =>
            visitMotive.name.toLowerCase().includes(vaccine.toLowerCase())
          )
      );

      if (!visitMotive) {
        console.log(`No visit motive at ${centerName}`);
        return undefined;
      }

      const agendaIds = bookingData.data.agendas.map((agenda) => agenda.id);

      const availabilitiesRequest = buildAvailabilitiesRequest({
        agendaIds,
        visitMotiveId: visitMotive.id,
      });
      const { data: availabilitiesData } = await axios.get(
        availabilitiesRequest
      );
      const total = availabilitiesData.total;
      console.log(`Found ${total} availabilities at ${centerName}`);

      const hasNotificationBeenSentRecently = await notificationService.hasNotificationBeenSentRecently(
        centerId
      );
      const shouldNotificationBeSent =
        total > AVAILABLE_APPOINTMENTS_THRESHOLD_TO_SEND_NOTIFICATION &&
        !hasNotificationBeenSentRecently;

      if (shouldNotificationBeSent) {
        const message = `Rendez-vous disponible à ${centerName}`;
        await notificationService.sendNotification(
          centerId,
          message,
          doctolibProfile.notificationMean
        );
      }
    })
  );
}

async function extractDoctolibProfiles() {
  const doctolibProfilesPathname = "services/doctolibProfiles.json";
  const doctolibProfiles = await jsonParser.parse<doctolibProfileType[]>(
    doctolibProfilesPathname
  );
  return doctolibProfiles;
}

function buildBookingRequest(centerSlug: string) {
  return `https://www.doctolib.fr/booking/${centerSlug}.json`;
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
