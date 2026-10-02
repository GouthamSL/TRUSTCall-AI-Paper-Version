// ============================================================
// TRUSTCall AI - COMMUNICATION SERVER
// ============================================================
// Responsibilities:
// 1. Meeting creation
// 2. Interviewer / Candidate joining
// 3. Candidate join-request approval
// 4. Candidate rejection
// 5. Meeting start synchronization
// 6. Shared meeting timer timestamp
// 7. WebRTC offer / answer / ICE signaling
// 8. AI result forwarding
// 9. Meeting chat
// 10. Meeting ending
// 11. Socket.IO communication
// 12. AI backend proxy
// ============================================================

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const crypto = require("crypto");
const { createProxyMiddleware } = require("http-proxy-middleware");


// ============================================================
// APP
// ============================================================

const app = express();

const server = http.createServer(app);


// ============================================================
// CONFIGURATION
// ============================================================

const PORT = process.env.PORT || 3002;

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

const PUBLIC_URL =
    process.env.PUBLIC_URL ||
    "https://sublime-succulent-relenting.ngrok-free.dev";

const AI_BACKEND_URL =
    process.env.AI_BACKEND_URL ||
    "http://localhost:8001";


// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
    FRONTEND_URL,
    PUBLIC_URL
];

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests such as Postman / PowerShell
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log(
                "CORS blocked origin:",
                origin
            );

            return callback(null, false);
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],

        credentials: true
    })
);


// ============================================================
// AI BACKEND PROXY
// ============================================================

app.use(
    "/ai",
    createProxyMiddleware({

        target: AI_BACKEND_URL,

        changeOrigin: true,

        pathRewrite: {
            "^/ai": ""
        }
    })
);


// ============================================================
// JSON BODY
// ============================================================

app.use(express.json());


// ============================================================
// SOCKET.IO
// ============================================================

const io = new Server(server, {

    cors: {
        origin: allowedOrigins,

        methods: [
            "GET",
            "POST"
        ],

        credentials: true
    },

    transports: [
        "polling",
        "websocket"
    ],

    pingTimeout: 20000,

    pingInterval: 10000
});


// ============================================================
// MEETING STORAGE
// ============================================================

const meetings = new Map();


// ============================================================
// GENERATE MEETING ID
// ============================================================

function generateMeetingId() {

    return (
        "TC-" +
        crypto
            .randomBytes(3)
            .toString("hex")
            .toUpperCase()
    );
}


// ============================================================
// NORMALIZE MEETING ID
// ============================================================

function normalizeMeetingId(meetingId) {

    return String(meetingId || "")
        .trim()
        .toUpperCase();
}


// ============================================================
// NORMALIZE ROLE
// ============================================================

function normalizeRole(role) {

    const value =
        String(role || "")
            .trim()
            .toLowerCase();

    if (value === "interviewer") {
        return "interviewer";
    }

    if (value === "candidate") {
        return "candidate";
    }

    return null;
}


// ============================================================
// SEND MEETING INVITATION THROUGH PYTHON EMAIL SERVICE
// ============================================================

async function sendMeetingInvitation(meeting) {

    try {

        const response = await fetch(
            `${AI_BACKEND_URL}/api/meeting/send-invitation`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ meeting })
            }
        );

        const data = await response.json();

        if (!response.ok || data.success !== true) {
            throw new Error(
                data.message ||
                data.error ||
                "Email sending failed."
            );
        }

        console.log(
            `MEETING EMAIL SENT SUCCESSFULLY TO: ${meeting.email}`
        );

        return {
            success: true,
            message: data.message || "Meeting invitation email sent successfully."
        };

    } catch (error) {

        console.error(
            "EMAIL SENDING FAILED:",
            error.message
        );

        return {
            success: false,
            message: error.message
        };
    }
}


// ============================================================
// ENSURE COMMUNICATION MEETING
// ============================================================

function ensureMeeting(meetingId) {

    meetingId =
        normalizeMeetingId(meetingId);

    if (!meetingId) {
        return null;
    }

    let meeting =
        meetings.get(meetingId);

    if (!meeting) {

        meeting = {

            meetingId,

            title: "",

            interviewer: "",

            interviewerName: "",

            company: "",

            email: "",

            candidateEmail: "",

            date: "",

            time: "",

            duration: "30 Minutes",

            type: "Technical",

            aiMonitoring: true,

            interviewerSocket: null,

            candidate: null,

            candidateRequest: null,

            candidateApproved: false,

            // IMPORTANT:
            // Timer does NOT start when meeting is created.
            // Timer starts only after interviewer accepts candidate.
            startedAt: null,

            createdAt:
                new Date().toISOString()
        };

        meetings.set(
            meetingId,
            meeting
        );

        console.log(
            `Communication meeting registered: ${meetingId}`
        );
    }

    return meeting;
}


// ============================================================
// ROOT
// ============================================================

app.get("/", (req, res) => {

    res.json({

        status: "online",

        service:
            "TRUSTCall AI Communication Server"

    });
});


// ============================================================
// HEALTH
// ============================================================

app.get("/health", (req, res) => {

    res.json({

        status: "healthy",

        service: "communication",

        meetings:
            meetings.size,

        socketio: true,

        frontend:
            FRONTEND_URL,

        publicUrl:
            PUBLIC_URL,

        aiBackend:
            AI_BACKEND_URL
    });
});


// ============================================================
// CREATE MEETING
// ============================================================
// FRONTEND CALLS:
//
// POST /api/meeting/create
//
// GenerateMeeting.jsx expects:
//
// response.data.meeting
// ============================================================

app.post(
    "/api/meeting/create",
    async (req, res) => {

        try {

            const {
                title,
                interviewer,
                company,
                email,
                date,
                time,
                duration,
                type,
                aiMonitoring
            } = req.body;

            if (
                !title ||
                !interviewer ||
                !company ||
                !email ||
                !date ||
                !time ||
                !duration
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required meeting details."
                });
            }

            let meetingId;

            do {
                meetingId = generateMeetingId();
            } while (meetings.has(meetingId));

            const meetingLink =
                `${PUBLIC_URL}/meeting/${meetingId}`;

            const meeting = {
                meetingId,
                meetingLink,
                title,
                interviewer,
                interviewerName: interviewer,
                company,
                email,
                candidateEmail: email,
                date,
                time,
                duration,
                type: type || "Technical",
                aiMonitoring: aiMonitoring !== false,
                interviewerSocket: null,
                interviewer: null,
                candidate: null,
                candidateRequest: null,
                candidateApproved: false,
                startedAt: null,
                createdAt: new Date().toISOString()
            };

            meetings.set(meetingId, meeting);

            console.log("");
            console.log("==========================================");
            console.log("         MEETING CREATED");
            console.log("==========================================");
            console.log("Meeting ID:", meetingId);
            console.log("Title:", title);
            console.log("Interviewer:", interviewer);
            console.log("Candidate:", email);
            console.log("Company:", company);
            console.log("Date:", date);
            console.log("Time:", time);
            console.log("Duration:", duration);
            console.log("Meeting Link:", meetingLink);
            console.log("Started At:", meeting.startedAt);
            console.log("==========================================");
            console.log("");

            const emailResult =
                await sendMeetingInvitation(meeting);

            if (emailResult.success) {
                console.log("MEETING EMAIL SENT SUCCESSFULLY");
            } else {
                console.error(
                    "MEETING EMAIL FAILED:",
                    emailResult.message
                );
            }

            return res.status(201).json({
                success: true,
                message: emailResult.success
                    ? "Meeting created and invitation sent successfully."
                    : "Meeting created, but invitation email could not be sent.",
                meeting,
                emailStatus: emailResult.success ? "sent" : "failed",
                emailMessage: emailResult.message
            });

        } catch (error) {

            console.error("Meeting creation error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to create meeting."
            });
        }
    }
);


// ============================================================
// OLD CREATE MEETING ENDPOINT
// ============================================================
// Kept for compatibility.
// ============================================================

app.post(
    "/api/meetings",
    (req, res) => {

        try {

            let meetingId;

            do {

                meetingId =
                    generateMeetingId();

            } while (
                meetings.has(meetingId)
            );


            const meeting = {

                meetingId,

                title:
                    req.body?.title || "",

                interviewer:
                    req.body?.interviewer || "",

                interviewerName:
                    req.body?.interviewer || "",

                company:
                    req.body?.company || "",

                email:
                    req.body?.email || "",

                candidateEmail:
                    req.body?.email || "",

                date:
                    req.body?.date || "",

                time:
                    req.body?.time || "",

                duration:
                    req.body?.duration ||
                    "30 Minutes",

                type:
                    req.body?.type ||
                    "Technical",

                aiMonitoring:
                    req.body?.aiMonitoring !== false,

                interviewerSocket:
                    null,

                candidate:
                    null,

                candidateRequest:
                    null,

                candidateApproved:
                    false,

                startedAt:
                    null,

                createdAt:
                    new Date().toISOString()
            };


            meetings.set(
                meetingId,
                meeting
            );


            console.log(
                `Meeting created through /api/meetings: ${meetingId}`
            );


            return res.status(201).json({

                success: true,

                meeting
            });

        } catch (error) {

            console.error(
                "Meeting creation error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to create meeting."
            });
        }
    }
);


// ============================================================
// GET MEETING
// ============================================================

app.get(
    "/api/meetings/:meetingId",
    (req, res) => {

        const meetingId =
            normalizeMeetingId(
                req.params.meetingId
            );


        const meeting =
            meetings.get(
                meetingId
            );


        if (!meeting) {

            return res.status(404).json({

                success: false,

                message:
                    "Meeting not found"
            });
        }


        return res.json({

            success: true,

            meeting
        });
    }
);


// ============================================================
// SOCKET.IO CONNECTION
// ============================================================

io.on(
    "connection",
    (socket) => {

        console.log("");

        console.log(
            "=========================================="
        );

        console.log(
            `Socket connected: ${socket.id}`
        );

        console.log(
            `Transport: ${socket.conn.transport.name}`
        );

        console.log(
            "=========================================="
        );


        // ========================================================
        // TRANSPORT UPGRADE
        // ========================================================

        socket.conn.on(
            "upgrade",
            () => {

                console.log(
                    `Socket upgraded to: ${socket.conn.transport.name}`
                );
            }
        );


        // ========================================================
        // JOIN MEETING
        // ========================================================

        socket.on(
            "join-meeting",
            ({
                meetingId,
                role
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );

                const normalizedRole =
                    normalizeRole(role);


                console.log("");

                console.log(
                    "========== JOIN MEETING =========="
                );

                console.log(
                    "Meeting:",
                    meetingId
                );

                console.log(
                    "Role:",
                    normalizedRole
                );

                console.log(
                    "Socket:",
                    socket.id
                );


                // ------------------------------------------------
                // VALIDATION
                // ------------------------------------------------

                if (!meetingId) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "Meeting ID is required"
                        }
                    );

                    return;
                }


                if (!normalizedRole) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "Invalid role"
                        }
                    );

                    return;
                }


                // ------------------------------------------------
                // FIND MEETING
                // ------------------------------------------------

                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (!meeting) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "Meeting ID not found"
                        }
                    );

                    console.log(
                        `Meeting not found: ${meetingId}`
                    );

                    return;
                }


                // ------------------------------------------------
                // CANDIDATE CANNOT DIRECTLY JOIN
                // ------------------------------------------------

                if (
                    normalizedRole ===
                    "candidate"
                ) {

                    if (
                        !meeting.candidateApproved
                    ) {

                        socket.emit(
                            "join-request-status",
                            {

                                status:
                                    "waiting-for-interviewer",

                                message:
                                    "Please request permission to join."
                            }
                        );

                        console.log(
                            `Candidate ${socket.id} is waiting for approval`
                        );

                        return;
                    }
                }


                // ------------------------------------------------
                // DUPLICATE INTERVIEWER
                // ------------------------------------------------

                if (
                    normalizedRole ===
                        "interviewer" &&
                    meeting.interviewer &&
                    meeting.interviewer !==
                        socket.id
                ) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "An interviewer is already connected."
                        }
                    );

                    return;
                }


                // ------------------------------------------------
                // DUPLICATE CANDIDATE
                // ------------------------------------------------

                if (
                    normalizedRole ===
                        "candidate" &&
                    meeting.candidate &&
                    meeting.candidate !==
                        socket.id
                ) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "A candidate is already connected."
                        }
                    );

                    return;
                }


                // ------------------------------------------------
                // JOIN ROOM
                // ------------------------------------------------

                socket.join(
                    meetingId
                );

                socket.data.meetingId =
                    meetingId;

                socket.data.role =
                    normalizedRole;

                socket.data.waitingForApproval =
                    false;


                meeting[
                    normalizedRole
                ] = socket.id;


                if (
                    normalizedRole ===
                    "interviewer"
                ) {

                    meeting.interviewerSocket =
                        socket.id;
                }


                console.log(
                    `${normalizedRole} joined meeting ${meetingId}`
                );


                // ------------------------------------------------
                // SUCCESS
                // ------------------------------------------------

                socket.emit(
                    "meeting-joined",
                    {

                        meetingId,

                        role:
                            normalizedRole,

                        startedAt:
                            meeting.startedAt
                    }
                );


                // ------------------------------------------------
                // IF MEETING ALREADY STARTED
                // ------------------------------------------------
                // Important for refresh/reconnect.

                if (
                    meeting.startedAt
                ) {

                    socket.emit(
                        "meeting-started",
                        {

                            meetingId,

                            startedAt:
                                meeting.startedAt
                        }
                    );
                }


                // ------------------------------------------------
                // NOTIFY OTHER PARTICIPANT
                // ------------------------------------------------

                socket
                    .to(meetingId)
                    .emit(
                        "participant-joined",
                        {
                            role:
                                normalizedRole
                        }
                    );


                console.log(
                    "=================================="
                );
            }
        );


        // ========================================================
        // JOIN-ROOM ALIAS
        // ========================================================
        // Kept for compatibility with existing frontend.

        socket.on(
            "join-room",
            ({
                meetingId,
                username,
                role
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );

                const normalizedRole =
                    normalizeRole(
                        role || username
                    );


                if (!meetingId) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "Meeting ID is required"
                        }
                    );

                    return;
                }


                if (!normalizedRole) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "Invalid role"
                        }
                    );

                    return;
                }


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (!meeting) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "Meeting ID not found"
                        }
                    );

                    return;
                }


                // Candidate must be approved.

                if (
                    normalizedRole ===
                        "candidate" &&
                    !meeting.candidateApproved
                ) {

                    socket.emit(
                        "join-request-status",
                        {

                            status:
                                "waiting-for-interviewer",

                            message:
                                "Please wait for interviewer approval."
                        }
                    );

                    return;
                }


                socket.join(
                    meetingId
                );

                socket.data.meetingId =
                    meetingId;

                socket.data.role =
                    normalizedRole;

                socket.data.waitingForApproval =
                    false;


                meeting[
                    normalizedRole
                ] = socket.id;


                if (
                    normalizedRole ===
                    "interviewer"
                ) {

                    meeting.interviewerSocket =
                        socket.id;
                }


                socket.emit(
                    "meeting-joined",
                    {

                        meetingId,

                        role:
                            normalizedRole,

                        startedAt:
                            meeting.startedAt
                    }
                );


                if (
                    meeting.startedAt
                ) {

                    socket.emit(
                        "meeting-started",
                        {

                            meetingId,

                            startedAt:
                                meeting.startedAt
                        }
                    );
                }


                socket
                    .to(meetingId)
                    .emit(
                        "participant-joined",
                        {
                            role:
                                normalizedRole
                        }
                    );
            }
        );


        // ========================================================
        // CANDIDATE REQUESTS TO JOIN
        // ========================================================

        socket.on(
            "candidate-request-join",
            ({
                meetingId
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (!meeting) {

                    socket.emit(
                        "join-request-status",
                        {

                            status:
                                "meeting-not-found",

                            message:
                                "Meeting ID not found."
                        }
                    );

                    return;
                }


                // ------------------------------------------------
                // ALREADY APPROVED
                // ------------------------------------------------

                if (
                    meeting.candidateApproved
                ) {

                    socket.emit(
                        "candidate-approved",
                        {

                            meetingId,

                            startedAt:
                                meeting.startedAt
                        }
                    );

                    return;
                }


                // ------------------------------------------------
                // CANDIDATE ALREADY CONNECTED
                // ------------------------------------------------

                if (
                    meeting.candidate
                ) {

                    socket.emit(
                        "join-request-status",
                        {

                            status:
                                "meeting-full",

                            message:
                                "A candidate is already in the meeting."
                        }
                    );

                    return;
                }


                // ------------------------------------------------
                // SAVE REQUEST
                // ------------------------------------------------

                meeting.candidateRequest = {

                    socketId:
                        socket.id,

                    requestedAt:
                        new Date().toISOString()
                };


                socket.data.meetingId =
                    meetingId;

                socket.data.role =
                    "candidate";

                socket.data.waitingForApproval =
                    true;


                console.log("");

                console.log(
                    "========== CANDIDATE REQUEST =========="
                );

                console.log(
                    `Meeting: ${meetingId}`
                );

                console.log(
                    `Candidate socket: ${socket.id}`
                );


                // ------------------------------------------------
                // TELL CANDIDATE
                // ------------------------------------------------

                socket.emit(
                    "join-request-sent",
                    {
                        meetingId
                    }
                );


                // ------------------------------------------------
                // TELL INTERVIEWER
                // ------------------------------------------------

                if (
                    meeting.interviewer
                ) {

                    io
                        .to(
                            meeting.interviewer
                        )
                        .emit(
                            "join-request-received",
                            {

                                candidateSocketId:
                                    socket.id,

                                meetingId
                            }
                        );

                    console.log(
                        "Join request sent to interviewer"
                    );

                } else {

                    socket.emit(
                        "join-request-status",
                        {

                            status:
                                "waiting-for-interviewer",

                            message:
                                "Waiting for interviewer to open the meeting."
                        }
                    );
                }


                console.log(
                    "========================================"
                );
            }
        );


        // ========================================================
        // ACCEPT CANDIDATE
        // ========================================================
        // THIS IS THE OFFICIAL MEETING START.
        //
        // Timer starts ONLY here.
        // ========================================================

        socket.on(
            "accept-candidate",
            ({
                meetingId
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (!meeting) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "Meeting not found."
                        }
                    );

                    return;
                }


                // ------------------------------------------------
                // ONLY INTERVIEWER
                // ------------------------------------------------

                if (
                    socket.data.role !==
                    "interviewer"
                ) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "Only the interviewer can accept a candidate."
                        }
                    );

                    return;
                }


                if (
                    meeting.interviewer !==
                    socket.id
                ) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "You are not the interviewer for this meeting."
                        }
                    );

                    return;
                }


                // ------------------------------------------------
                // CHECK REQUEST
                // ------------------------------------------------

                if (
                    !meeting.candidateRequest
                ) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "No candidate is waiting for approval."
                        }
                    );

                    return;
                }


                const candidateSocketId =
                    meeting
                        .candidateRequest
                        .socketId;


                const candidateSocket =
                    io.sockets.sockets.get(
                        candidateSocketId
                    );


                if (!candidateSocket) {

                    meeting.candidateRequest =
                        null;

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "Candidate disconnected before approval."
                        }
                    );

                    return;
                }


                // ------------------------------------------------
                // APPROVE CANDIDATE
                // ------------------------------------------------

                meeting.candidateApproved =
                    true;

                meeting.candidate =
                    candidateSocketId;

                meeting.candidateRequest =
                    null;


                candidateSocket.data.role =
                    "candidate";

                candidateSocket.data.meetingId =
                    meetingId;

                candidateSocket.data.waitingForApproval =
                    false;


                // ------------------------------------------------
                // CANDIDATE JOINS ROOM NOW
                // ------------------------------------------------

                candidateSocket.join(
                    meetingId
                );


                // ------------------------------------------------
                // START TIMER
                // ------------------------------------------------
                // ONLY ACCEPT triggers this.

                if (
                    !meeting.startedAt
                ) {

                    meeting.startedAt =
                        new Date().toISOString();
                }


                console.log("");

                console.log(
                    "=========================================="
                );

                console.log(
                    "       CANDIDATE APPROVED"
                );

                console.log(
                    "=========================================="
                );

                console.log(
                    "Meeting:",
                    meetingId
                );

                console.log(
                    "Candidate:",
                    candidateSocketId
                );

                console.log(
                    "Started At:",
                    meeting.startedAt
                );

                console.log(
                    "=========================================="
                );


                // ------------------------------------------------
                // BOTH PARTICIPANTS GET SAME TIMESTAMP
                // ------------------------------------------------

                io
                    .to(meetingId)
                    .emit(
                        "meeting-started",
                        {

                            meetingId,

                            startedAt:
                                meeting.startedAt
                        }
                    );


                // ------------------------------------------------
                // CANDIDATE APPROVED
                // ------------------------------------------------

                candidateSocket.emit(
                    "candidate-approved",
                    {

                        meetingId,

                        startedAt:
                            meeting.startedAt
                    }
                );


                // ------------------------------------------------
                // INTERVIEWER CONFIRMATION
                // ------------------------------------------------

                socket.emit(
                    "candidate-accepted",
                    {

                        candidateSocketId,

                        meetingId,

                        startedAt:
                            meeting.startedAt
                    }
                );


                // ------------------------------------------------
                // NOTIFY INTERVIEWER
                // ------------------------------------------------

                socket.emit(
                    "participant-joined",
                    {
                        role:
                            "candidate"
                    }
                );


                console.log(
                    "Waiting for candidate-ready..."
                );
            }
        );


        // ========================================================
        // REJECT CANDIDATE
        // ========================================================

        socket.on(
            "reject-candidate",
            ({
                meetingId
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (!meeting) {
                    return;
                }


                if (
                    socket.data.role !==
                    "interviewer"
                ) {
                    return;
                }


                if (
                    meeting.interviewer !==
                    socket.id
                ) {
                    return;
                }


                if (
                    !meeting.candidateRequest
                ) {

                    socket.emit(
                        "meeting-error",
                        {
                            message:
                                "No candidate is waiting."
                        }
                    );

                    return;
                }


                const candidateSocketId =
                    meeting
                        .candidateRequest
                        .socketId;


                const candidateSocket =
                    io.sockets.sockets.get(
                        candidateSocketId
                    );


                meeting.candidateRequest =
                    null;


                if (candidateSocket) {

                    candidateSocket.data.waitingForApproval =
                        false;


                    candidateSocket.emit(
                        "candidate-rejected",
                        {

                            meetingId,

                            message:
                                "The interviewer rejected your request to join."
                        }
                    );
                }


                socket.emit(
                    "candidate-rejected-confirmed",
                    {
                        meetingId
                    }
                );


                console.log(
                    `Candidate ${candidateSocketId} rejected from ${meetingId}`
                );
            }
        );


        // ========================================================
        // CANDIDATE READY
        // ========================================================

        socket.on(
            "candidate-ready",
            ({
                meetingId
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (!meeting) {
                    return;
                }


                if (
                    !meeting.candidateApproved
                ) {

                    console.log(
                        "Candidate-ready ignored: not approved."
                    );

                    return;
                }


                if (
                    meeting.candidate !==
                    socket.id
                ) {

                    console.log(
                        "Candidate-ready ignored from unknown socket."
                    );

                    return;
                }


                console.log("");

                console.log(
                    "========== CANDIDATE READY =========="
                );

                console.log(
                    "Meeting:",
                    meetingId
                );

                console.log(
                    "Candidate:",
                    socket.id
                );


                // ------------------------------------------------
                // SEND ONLY TO INTERVIEWER
                // ------------------------------------------------

                if (
                    meeting.interviewer
                ) {

                    io
                        .to(
                            meeting.interviewer
                        )
                        .emit(
                            "candidate-ready",
                            {
                                meetingId
                            }
                        );
                }


                console.log(
                    "======================================"
                );
            }
        );


        // ========================================================
        // WEBRTC OFFER
        // ========================================================

        socket.on(
            "webrtc-offer",
            ({
                meetingId,
                offer
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (
                    !meeting ||
                    !meeting.candidateApproved
                ) {
                    return;
                }


                console.log(
                    `WEBRTC OFFER from ${socket.data.role}`
                );


                socket
                    .to(meetingId)
                    .emit(
                        "webrtc-offer",
                        {

                            offer,

                            from:
                                socket.data.role
                        }
                    );
            }
        );


        // ========================================================
        // OFFER ALIAS
        // ========================================================

        socket.on(
            "offer",
            ({
                meetingId,
                offer
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (
                    !meeting ||
                    !meeting.candidateApproved
                ) {
                    return;
                }


                socket
                    .to(meetingId)
                    .emit(
                        "offer",
                        {

                            offer,

                            from:
                                socket.data.role
                        }
                    );
            }
        );


        // ========================================================
        // WEBRTC ANSWER
        // ========================================================

        socket.on(
            "webrtc-answer",
            ({
                meetingId,
                answer
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (
                    !meeting ||
                    !meeting.candidateApproved
                ) {
                    return;
                }


                console.log(
                    `WEBRTC ANSWER from ${socket.data.role}`
                );


                socket
                    .to(meetingId)
                    .emit(
                        "webrtc-answer",
                        {

                            answer,

                            from:
                                socket.data.role
                        }
                    );
            }
        );


        // ========================================================
        // ANSWER ALIAS
        // ========================================================

        socket.on(
            "answer",
            ({
                meetingId,
                answer
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (
                    !meeting ||
                    !meeting.candidateApproved
                ) {
                    return;
                }


                socket
                    .to(meetingId)
                    .emit(
                        "answer",
                        {

                            answer,

                            from:
                                socket.data.role
                        }
                    );
            }
        );


        // ========================================================
        // WEBRTC ICE CANDIDATE
        // ========================================================

        socket.on(
            "webrtc-ice-candidate",
            ({
                meetingId,
                candidate
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (
                    !meeting ||
                    !meeting.candidateApproved
                ) {
                    return;
                }


                socket
                    .to(meetingId)
                    .emit(
                        "webrtc-ice-candidate",
                        {

                            candidate,

                            from:
                                socket.data.role
                        }
                    );
            }
        );


        // ========================================================
        // ICE ALIAS
        // ========================================================

        socket.on(
            "ice-candidate",
            ({
                meetingId,
                candidate
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (
                    !meeting ||
                    !meeting.candidateApproved
                ) {
                    return;
                }


                socket
                    .to(meetingId)
                    .emit(
                        "ice-candidate",
                        {

                            candidate,

                            from:
                                socket.data.role
                        }
                    );
            }
        );


        // ========================================================
        // AI RESULT
        // ========================================================

        socket.on(
            "ai-result",
            ({
                meetingId,
                result
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (
                    !meeting ||
                    !meeting.candidateApproved
                ) {
                    return;
                }


                // Only candidate sends AI results.

                if (
                    socket.data.role !==
                    "candidate"
                ) {
                    return;
                }


                if (!result) {
                    return;
                }


                if (
                    meeting.interviewer
                ) {

                    io
                        .to(
                            meeting.interviewer
                        )
                        .emit(
                            "ai-result",
                            {

                                meetingId,

                                result,

                                from:
                                    "candidate"
                            }
                        );
                }


                console.log(
                    `AI result forwarded for ${meetingId}`
                );
            }
        );


        // ========================================================
        // CHAT
        // ========================================================

        socket.on(
            "meeting-message",
            ({
                meetingId,
                message
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (
                    !meeting ||
                    !meeting.candidateApproved
                ) {
                    return;
                }


                socket
                    .to(meetingId)
                    .emit(
                        "meeting-message",
                        {

                            message,

                            from:
                                socket.data.role
                        }
                    );
            }
        );


        // ========================================================
        // END MEETING
        // ========================================================

        socket.on(
            "end-meeting",
            ({
                meetingId
            }) => {

                meetingId =
                    normalizeMeetingId(
                        meetingId
                    );


                const meeting =
                    meetings.get(
                        meetingId
                    );


                if (!meeting) {
                    return;
                }


                io
                    .to(meetingId)
                    .emit(
                        "meeting-ended"
                    );


                meetings.delete(
                    meetingId
                );


                console.log(
                    `Meeting ended: ${meetingId}`
                );
            }
        );


        // ========================================================
        // DISCONNECT
        // ========================================================

        socket.on(
            "disconnect",
            (reason) => {

                const meetingId =
                    socket.data.meetingId;

                const role =
                    socket.data.role;


                console.log("");

                console.log(
                    `Socket disconnected: ${socket.id}`
                );

                console.log(
                    `Reason: ${reason}`
                );


                if (
                    !meetingId ||
                    !meetings.has(
                        meetingId
                    )
                ) {
                    return;
                }


                const meeting =
                    meetings.get(
                        meetingId
                    );


                // ------------------------------------------------
                // WAITING CANDIDATE
                // ------------------------------------------------

                if (
                    role === "candidate" &&
                    meeting
                        .candidateRequest
                        ?.socketId ===
                        socket.id
                ) {

                    meeting.candidateRequest =
                        null;


                    console.log(
                        `Waiting candidate disconnected from ${meetingId}`
                    );


                    if (
                        meeting.interviewer
                    ) {

                        io
                            .to(
                                meeting.interviewer
                            )
                            .emit(
                                "candidate-request-cancelled",
                                {
                                    meetingId
                                }
                            );
                    }
                }


                // ------------------------------------------------
                // APPROVED CANDIDATE
                // ------------------------------------------------

                if (
                    role === "candidate" &&
                    meeting.candidate ===
                        socket.id
                ) {

                    meeting.candidate =
                        null;

                    meeting.candidateApproved =
                        false;


                    console.log(
                        `Candidate disconnected from ${meetingId}`
                    );


                    socket
                        .to(meetingId)
                        .emit(
                            "participant-left",
                            {
                                role:
                                    "candidate"
                            }
                        );
                }


                // ------------------------------------------------
                // INTERVIEWER
                // ------------------------------------------------

                if (
                    role === "interviewer" &&
                    meeting.interviewer ===
                        socket.id
                ) {

                    meeting.interviewer =
                        null;

                    meeting.interviewerSocket =
                        null;


                    console.log(
                        `Interviewer disconnected from ${meetingId}`
                    );


                    socket
                        .to(meetingId)
                        .emit(
                            "participant-left",
                            {
                                role:
                                    "interviewer"
                            }
                        );
                }
            }
        );
    }
);


// ============================================================
// FRONTEND SPA PROXY
// ============================================================
// IMPORTANT:
// Do NOT use ws:true here.
// Socket.IO handles its own WebSocket upgrades.
// ============================================================

app.use(
    "/",
    createProxyMiddleware({

        target:
            FRONTEND_URL,

        changeOrigin: true
    })
);


// ============================================================
// START SERVER
// ============================================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");

        console.log(
            "=========================================="
        );

        console.log(
            "     TRUSTCall AI Communication Server"
        );

        console.log(
            "=========================================="
        );

        console.log(
            `Port: ${PORT}`
        );

        console.log(
            `Frontend: ${FRONTEND_URL}`
        );

        console.log(
            `Public URL: ${PUBLIC_URL}`
        );

        console.log(
            `AI Backend: ${AI_BACKEND_URL}`
        );

        console.log(
            "Socket.IO: enabled"
        );

        console.log(
            "Meeting creation: /api/meeting/create"
        );

        console.log(
            "Candidate approval: enabled"
        );

        console.log(
            "Shared meeting timer: enabled"
        );

        console.log(
            "=========================================="
        );

        console.log("");
    }
);