const axios = require("axios");
const unzipper = require("unzipper");
const zlib = require("zlib");
const { AMPLITUDE_API_ENDPOINT } = require("./config");

function parseNDJSON(jsonString) {
  const jsonLines = jsonString.split("\n");
  const results = [];

  for (const line of jsonLines) {
    if (line.trim() === "") continue; // skip empty lines

    try {
      const { event_properties, event_type, event_time } = JSON.parse(line);

      // Filter here
      if (event_type === "Predicción modelo AI") {
        results.push({
          event_properties,
          event_type,
          event_time,
        });
      }
    } catch (err) {
      console.error("Failed to parse a line in NDJSON:", err.message);
      console.error("Problematic line:", line);
    }
  }

  return results;
}

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

async function fetchEventsFromAmplitude(start, end) {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${API_KEY}:${SECRET_KEY}`).toString(
      "base64"
    )}`,
  };

  const response = await axios.get(AMPLITUDE_API_ENDPOINT, {
    headers,
    params: {
      start,
      end,
    },
    responseType: "stream",
  });

  // The response is a zipped archive, so we need to unzip it on-the-fly and parse JSON files inside it
  let events = [];
  await response.data
    .pipe(unzipper.Parse())
    .on("entry", async (entry) => {
      const fileName = entry.path;

      // Check if the file has the .json.gz extension
      if (!fileName.endsWith(".json.gz")) {
        entry.autodrain(); // Ignore other files
        return;
      }

      let gunzippedContent;

      try {
        // Decompress the gzip content
        const bufferContent = await entry.buffer();
        gunzippedContent = zlib.gunzipSync(bufferContent).toString("utf-8");
      } catch (decompressionError) {
        console.error("Error during gunzipping:", decompressionError);
        entry.autodrain();
        return;
      }

      let parsedEvents;
      parsedEvents = parseNDJSON(gunzippedContent);

      if (!parsedEvents || parsedEvents.length === 0) {
        console.error("Error parsing JSON from:", fileName);
        entry.autodrain();
        return;
      }

      events = events.concat(parsedEvents);
      entry.autodrain();
    })
    .promise();

  return events;
}

module.exports = {
  fetchEventsFromAmplitude,
};
