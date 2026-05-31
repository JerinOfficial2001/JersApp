const { AccessToken } = require("livekit-server-sdk");

const LIVEKIT_API_KEY = "LK_01HZXWD3HH6N7EME7VQJ9ABCDF";
const LIVEKIT_API_SECRET = "7f92d82a96b0e12491c47e2278daa854dce2ae011240a4cdba54219e9d34f2bc";

async function createToken(roomName = "quickstart-room", participantName = "participant1") {
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantName,
    ttl: "10m",
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
  });

  return at.toJwt();
}

module.exports = {
  createToken,
};
