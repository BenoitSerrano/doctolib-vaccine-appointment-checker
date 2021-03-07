import axios from "axios";

function main() {
  fetchAvailabilitiesFromDoctolib();
}

async function fetchAvailabilitiesFromDoctolib() {
  console.log(process.env.CENTER_ID);
  const doctolibRequest = buildDoctolibRequest();
  const result = await axios.get(doctolibRequest);
}

function buildDoctolibRequest() {
  const CENTER_ID = 5511046;
  const COVID_SPECIALITY_ID = 5494;
  return `https://www.doctolib.fr/search_results/${CENTER_ID}.json?limit=6&speciality_id=${COVID_SPECIALITY_ID}&search_result_format=json`;
}

main();
