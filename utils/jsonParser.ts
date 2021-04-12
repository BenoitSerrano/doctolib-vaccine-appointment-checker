import * as path from "path";
import { promises as fs } from "fs";

export { jsonParser };

const jsonParser = {
  parse,
  store,
};

async function parse<JsonT>(pathname: string) {
  const fileContent = await fs.readFile(path.resolve(pathname), {
    encoding: "utf-8",
  });

  const lastNotificationDateById: JsonT = JSON.parse(fileContent);
  return lastNotificationDateById;
}

async function store<JsonT>(jsonContent: JsonT) {
  return fs.writeFile(
    path.resolve("services/notifications.json"),
    JSON.stringify(jsonContent)
  );
}
