//const fetch = require("node-fetch");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

exports.handler = async function (event) {
    // Extract playlist ID from query params
    const playlistID = event.queryStringParameters.id;
    if (!playlistID) {
        return { statusCode: 400, body: "Missing playlist ID" };
    }

    try {
        // Get Spotify API token
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
            },
            body: "grant_type=client_credentials",
        });

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Fetch playlist data
        const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}`, {
            headers: { "Authorization": `Bearer ${accessToken}` },
        });

        const playlistData = await playlistResponse.json();
        return {
            statusCode: 200,
            body: JSON.stringify(playlistData),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch playlist data" }),
        };
    }
};
