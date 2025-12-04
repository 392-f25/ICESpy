/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });
const { onValueCreated } = require("firebase-functions/database");
const admin = require("firebase-admin");
admin.initializeApp();

// Triggered when a new sighting is created under /sightings/{pushId}
export const onDatabaseWrite = onValueCreated("/sightings/{pushId}", async (event: any) => {
  try {
    // Read the users path from the Realtime Database
    const usersRef = admin.database().ref('/users');
    const usersSnap = await usersRef.once('value');
    const users = usersSnap.val();

    const emails: string[] = [];
    if (users && typeof users === 'object') {
      Object.values(users).forEach((u: any) => {
        if (u && (u.email)) {
          emails.push(u.email);
        }
      });
    }
    const bccList = emails.join(",")

    // TODO: send notification emails, fan-out updates, etc. using SendGrid or similar

    // Return a small summary for visibility in logs/emulator
    return { emailsCount: emails.length };
  } catch (error: any) {
    console.error('Error fetching user emails:', error);
    // Surface error to the invoker/emulator
    throw error;
  }
});

