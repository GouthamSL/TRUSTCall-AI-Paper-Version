// src/services/webrtcService.js

// =====================================================
// GLOBAL WEBRTC STATE
// =====================================================

let peerConnection = null;

let pendingLocalStream = null;

let localStreamReadyResolve;

let localStreamReady = new Promise((resolve) => {
  localStreamReadyResolve = resolve;
});

// ICE candidates can arrive before the remote description.
let pendingIceCandidates = [];


// =====================================================
// WEBRTC CONFIGURATION
// =====================================================

const configuration = {
  // STUN helps browsers discover network candidates.
  // Multiple STUN servers improve ICE discovery reliability.
  //
  // IMPORTANT:
  // STUN alone cannot guarantee connectivity through every
  // NAT/firewall. A TURN server is required for restrictive
  // networks or some different-network deployments.

  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun1.l.google.com:19302",
    },
    {
      urls: "stun:stun.cloudflare.com:3478",
    },
  ],

  iceCandidatePoolSize: 10,

  bundlePolicy: "max-bundle",

  rtcpMuxPolicy: "require",
};


// =====================================================
// HELPER - ADD STREAM TRACKS
// =====================================================

function addStreamTracksToPeerConnection(stream) {

  if (!peerConnection) {

    console.warn(
      "⚠️ Cannot add stream tracks yet: peer connection does not exist."
    );

    return false;
  }

  if (!stream) {

    console.error(
      "❌ Cannot add stream tracks: stream missing."
    );

    return false;
  }

  console.log(
    "🎥 Adding local stream tracks:",
    stream.id
  );

  const existingTrackIds = new Set(
    peerConnection
      .getSenders()
      .map((sender) => sender.track?.id)
      .filter(Boolean)
  );

  let tracksAdded = 0;

  stream.getTracks().forEach((track) => {

    if (existingTrackIds.has(track.id)) {

      console.log(
        "⚠️ Track already added:",
        track.kind,
        track.id
      );

      return;
    }

    try {

      peerConnection.addTrack(
        track,
        stream
      );

      tracksAdded += 1;

      console.log(
        "✅ Local Track Added:",
        track.kind,
        track.id
      );

    } catch (error) {

      console.error(
        "❌ Error adding local track:",
        error
      );

    }

  });

  console.log(
    `🎥 Local stream processing complete. Tracks added: ${tracksAdded}`
  );

  // Local media is now ready.
  if (localStreamReadyResolve) {

    localStreamReadyResolve();

    localStreamReadyResolve = null;

    console.log(
      "✅ Local media is ready for WebRTC"
    );

  }

  return true;
}


// =====================================================
// CREATE PEER CONNECTION
// =====================================================

export function createPeerConnection() {

  // Close an old connection if one exists.
  if (peerConnection) {

    try {

      peerConnection.close();

    } catch (error) {

      console.warn(
        "Previous peer connection close error:",
        error
      );

    }

  }

  peerConnection =
    new RTCPeerConnection(configuration);

  pendingIceCandidates = [];

  console.log(
    "✅ Peer Connection Created"
  );


  // ===================================================
  // ADD PENDING LOCAL STREAM
  // ===================================================

  if (pendingLocalStream) {

    console.log(
      "🎥 Found pending local stream. Adding it now..."
    );

    addStreamTracksToPeerConnection(
      pendingLocalStream
    );

  } else {

    console.log(
      "⏳ No local stream yet. Waiting for camera..."
    );

  }


  // ===================================================
  // ICE CANDIDATE GENERATED
  // ===================================================

  peerConnection.onicecandidate = (event) => {

    if (event.candidate) {

      console.log(
        "🧊 ICE Candidate Generated:",
        event.candidate.candidate
      );

      if (
        peerConnection &&
        peerConnection.onIceCandidateCallback
      ) {

        peerConnection.onIceCandidateCallback(
          event.candidate
        );

      }

    } else {

      console.log(
        "🧊 ICE Candidate Gathering Complete"
      );

    }

  };


  // ===================================================
  // ICE CANDIDATE ERRORS
  // ===================================================

  peerConnection.onicecandidateerror = (event) => {

    console.warn(
      "⚠️ ICE Candidate Error:",
      {
        url: event.url,
        errorCode: event.errorCode,
        errorText: event.errorText,
        address: event.address,
        port: event.port,
      }
    );

  };


  // ===================================================
  // ICE GATHERING STATE
  // ===================================================

  peerConnection.onicegatheringstatechange = () => {

    if (!peerConnection) {
      return;
    }

    console.log(
      "🧊 ICE Gathering State:",
      peerConnection.iceGatheringState
    );

  };


  // ===================================================
  // REMOTE TRACK
  // ===================================================

  peerConnection.ontrack = (event) => {

    console.log(
      "📺 Remote Track Received:",
      event.track?.kind
    );

    if (!peerConnection) {
      return;
    }

    const remoteStream =
      event.streams &&
      event.streams[0];

    if (
      remoteStream &&
      peerConnection.onRemoteStreamCallback
    ) {

      console.log(
        "📺 Remote Stream Received:",
        remoteStream.id
      );

      peerConnection.onRemoteStreamCallback(
        remoteStream
      );

    }

  };


  // ===================================================
  // WEBRTC CONNECTION STATE
  // ===================================================

  peerConnection.onconnectionstatechange = () => {

    if (!peerConnection) {
      return;
    }

    const state =
      peerConnection.connectionState;

    console.log(
      "🌐 WebRTC Connection State:",
      state
    );

    if (state === "connected") {

      console.log(
        "✅ WEBRTC CONNECTED"
      );

    }

    if (state === "failed") {

      console.error(
        "❌ WEBRTC CONNECTION FAILED"
      );

      console.error(
        "ℹ️ ICE could not establish a usable candidate pair."
      );

    }

    if (state === "disconnected") {

      console.warn(
        "⚠️ WEBRTC DISCONNECTED"
      );

    }

    if (state === "closed") {

      console.log(
        "ℹ️ WEBRTC CONNECTION CLOSED"
      );

    }

  };


  // ===================================================
  // ICE CONNECTION STATE
  // ===================================================

  peerConnection.oniceconnectionstatechange = () => {

    if (!peerConnection) {
      return;
    }

    const state =
      peerConnection.iceConnectionState;

    console.log(
      "🧊 ICE Connection State:",
      state
    );

    if (state === "checking") {

      console.log(
        "🔎 ICE is checking candidate pairs..."
      );

    }

    if (
      state === "connected" ||
      state === "completed"
    ) {

      console.log(
        "✅ ICE CONNECTED/COMPLETED"
      );

    }

    if (state === "failed") {

      console.error(
        "❌ ICE FAILED"
      );

    }

    if (state === "disconnected") {

      console.warn(
        "⚠️ ICE DISCONNECTED"
      );

    }

  };


  // ===================================================
  // SIGNALLING STATE
  // ===================================================

  peerConnection.onsignalingstatechange = () => {

    if (!peerConnection) {
      return;
    }

    console.log(
      "📡 Signaling State:",
      peerConnection.signalingState
    );

  };


  // ===================================================
  // RETURN CONNECTION
  // ===================================================

  return peerConnection;
}


// =====================================================
// LOCAL CAMERA / MICROPHONE
// =====================================================

export function addLocalStream(stream) {

  if (!stream) {

    console.error(
      "❌ Cannot add local stream: stream missing"
    );

    return;
  }

  // Keep the stream even if the peer connection
  // has not been created yet.
  pendingLocalStream = stream;

  console.log(
    "🎥 Local stream received:",
    stream.id
  );


  // ===================================================
  // PEER CONNECTION NOT READY
  // ===================================================

  if (!peerConnection) {

    console.warn(
      "⏳ Peer connection not ready."
    );

    console.log(
      "⏳ Local stream saved and will be added when WebRTC starts."
    );

    return;
  }


  // ===================================================
  // PEER CONNECTION READY
  // ===================================================

  addStreamTracksToPeerConnection(
    stream
  );

}


// =====================================================
// CREATE OFFER
// =====================================================

export async function createOffer() {

  if (!peerConnection) {

    console.error(
      "❌ Cannot create offer: peer connection missing"
    );

    return null;
  }

  // Wait until camera/microphone tracks exist.
  await localStreamReady;

  console.log(
    "📤 Creating WebRTC Offer..."
  );

  const offer =
    await peerConnection.createOffer();

  await peerConnection.setLocalDescription(
    offer
  );

  console.log(
    "✅ Offer Created and Local Description Set"
  );

  return peerConnection.localDescription;
}


// =====================================================
// CREATE ANSWER
// =====================================================

export async function createAnswer() {

  if (!peerConnection) {

    console.error(
      "❌ Cannot create answer: peer connection missing"
    );

    return null;
  }

  // Wait until camera/microphone tracks exist.
  await localStreamReady;

  console.log(
    "📥 Creating WebRTC Answer..."
  );

  const answer =
    await peerConnection.createAnswer();

  await peerConnection.setLocalDescription(
    answer
  );

  console.log(
    "✅ Answer Created and Local Description Set"
  );

  return peerConnection.localDescription;
}


// =====================================================
// SET REMOTE DESCRIPTION
// =====================================================

export async function setRemoteDescription(
  description
) {

  if (!peerConnection) {

    console.error(
      "❌ Cannot set remote description: peer connection missing"
    );

    return;
  }

  if (!description) {

    console.error(
      "❌ Remote description is empty"
    );

    return;
  }

  try {

    console.log(
      "🌍 Setting Remote Description:",
      description.type
    );

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(description)
    );

    console.log(
      "✅ Remote Description Set"
    );


    // =================================================
    // ADD QUEUED ICE CANDIDATES
    // =================================================

    if (
      pendingIceCandidates.length > 0
    ) {

      console.log(
        `🧊 Adding ${pendingIceCandidates.length} queued ICE candidates`
      );

      const candidates =
        [...pendingIceCandidates];

      pendingIceCandidates = [];

      for (
        const candidate of candidates
      ) {

        try {

          await peerConnection.addIceCandidate(
            new RTCIceCandidate(candidate)
          );

          console.log(
            "✅ Queued ICE Candidate Added"
          );

        } catch (error) {

          console.error(
            "❌ Queued ICE Candidate Error:",
            error
          );

        }

      }

    }

  } catch (error) {

    console.error(
      "❌ Remote Description Error:",
      error
    );

    throw error;
  }

}


// =====================================================
// ADD ICE CANDIDATE
// =====================================================

export async function addIceCandidate(
  candidate
) {

  if (!peerConnection) {

    console.warn(
      "⏳ Peer connection not ready. Queuing ICE candidate."
    );

    if (candidate) {
      pendingIceCandidates.push(candidate);
    }

    return;
  }

  if (!candidate) {
    return;
  }

  try {

    // =================================================
    // REMOTE DESCRIPTION NOT READY
    // =================================================

    if (
      !peerConnection.remoteDescription
    ) {

      console.log(
        "⏳ Remote description not ready."
      );

      console.log(
        "🧊 Queuing ICE candidate..."
      );

      pendingIceCandidates.push(
        candidate
      );

      return;
    }


    // =================================================
    // ADD ICE IMMEDIATELY
    // =================================================

    await peerConnection.addIceCandidate(
      new RTCIceCandidate(candidate)
    );

    console.log(
      "✅ ICE Candidate Added"
    );

  } catch (error) {

    console.error(
      "❌ ICE Candidate Error:",
      error
    );

  }

}


// =====================================================
// ICE CALLBACK
// =====================================================

export function onIceCandidate(
  callback
) {

  if (!peerConnection) {

    console.warn(
      "⏳ Peer connection not ready. ICE callback will be registered when connection exists."
    );

    return;
  }

  peerConnection.onIceCandidateCallback =
    callback;
}


// =====================================================
// REMOTE STREAM CALLBACK
// =====================================================

export function onRemoteStream(
  callback
) {

  if (!peerConnection) {

    console.warn(
      "⏳ Peer connection not ready. Remote stream callback cannot be registered yet."
    );

    return;
  }

  peerConnection.onRemoteStreamCallback =
    callback;
}


// =====================================================
// WEBRTC DIAGNOSTICS
// =====================================================

export async function getWebRTCStats() {

  if (!peerConnection) {
    return null;
  }

  try {

    const stats =
      await peerConnection.getStats();

    const candidates = [];
    const candidatePairs = [];

    stats.forEach((report) => {

      if (
        report.type === "local-candidate" ||
        report.type === "remote-candidate"
      ) {

        candidates.push({
          type: report.type,
          candidateType: report.candidateType,
          protocol: report.protocol,
          address: report.address,
          port: report.port,
        });

      }

      if (
        report.type === "candidate-pair" &&
        (
          report.state === "succeeded" ||
          report.nominated
        )
      ) {

        candidatePairs.push({
          state: report.state,
          nominated: report.nominated,
          bytesSent: report.bytesSent,
          bytesReceived: report.bytesReceived,
          localCandidateId:
            report.localCandidateId,
          remoteCandidateId:
            report.remoteCandidateId,
        });

      }

    });

    return {

      connectionState:
        peerConnection.connectionState,

      iceConnectionState:
        peerConnection.iceConnectionState,

      iceGatheringState:
        peerConnection.iceGatheringState,

      signalingState:
        peerConnection.signalingState,

      candidates,

      candidatePairs,

    };

  } catch (error) {

    console.error(
      "❌ WebRTC stats error:",
      error
    );

    return null;
  }

}


// =====================================================
// GET PEER CONNECTION
// =====================================================

export function getPeerConnection() {

  return peerConnection;

}


// =====================================================
// CLOSE PEER CONNECTION
// =====================================================

export function closePeerConnection() {

  if (peerConnection) {

    try {

      peerConnection.ontrack = null;

      peerConnection.onicecandidate = null;

      peerConnection.onicecandidateerror = null;

      peerConnection.onicegatheringstatechange =
        null;

      peerConnection.onconnectionstatechange =
        null;

      peerConnection.oniceconnectionstatechange =
        null;

      peerConnection.onsignalingstatechange =
        null;

      peerConnection.close();

    } catch (error) {

      console.warn(
        "Peer connection close error:",
        error
      );

    }

    peerConnection = null;

    console.log(
      "❌ Peer Connection Closed"
    );

  }


  // ===================================================
  // CLEAR QUEUED ICE CANDIDATES
  // ===================================================

  pendingIceCandidates = [];


  // ===================================================
  // RESET LOCAL STREAM READY STATE
  // ===================================================

  localStreamReady =
    new Promise((resolve) => {

      localStreamReadyResolve =
        resolve;

    });


  // IMPORTANT:
  // Do NOT clear pendingLocalStream here.
  //
  // The camera may still be running and a new
  // peer connection may be created immediately.
  //
  // Keeping the stream allows createPeerConnection()
  // to attach it automatically.

}