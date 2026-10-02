from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware

from agents.vision_agent import VisionAgent
from audio.audio_agent import AudioAgent
from agents.consensus_agent import ConsensusAgent

import cv2
import numpy as np
import base64
import time
import uuid
import os
import smtplib

from email.message import EmailMessage
from dotenv import load_dotenv


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="TRUSTCall AI Backend",
    description="Multimodal AI trust analysis backend",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# LOAD AGENTS ONCE
# ============================================================

print()
print("============================================================")
print("              TRUSTCall AI BACKEND")
print("============================================================")
print("Loading Vision Agent...")

vision_agent = VisionAgent()

print("Loading Audio Agent...")

audio_agent = AudioAgent()

print("Loading Consensus Agent...")

consensus_agent = ConsensusAgent()

print("All agents loaded successfully.")
print("============================================================")
print()


# ============================================================
# SESSION STORAGE
# ============================================================

sessions = {}


def get_session(session_id):

    if session_id not in sessions:

        sessions[session_id] = {
            "frames": [],
            "last_audio_time": 0
        }

    return sessions[session_id]


# ============================================================
# SEND MEETING EMAIL
# ============================================================

def send_meeting_email(
    candidate_email,
    meeting
):

    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASS")

    if not sender_email:
        raise Exception(
            "EMAIL_USER is not configured in the Python backend .env file."
        )

    if not sender_password:
        raise Exception(
            "EMAIL_PASS is not configured in the Python backend .env file."
        )

    message = EmailMessage()

    message["From"] = f"TRUSTCall AI <{sender_email}>"
    message["To"] = candidate_email
    message["Subject"] = "TRUSTCall AI - Interview Meeting Invitation"

    meeting_link = meeting["meetingLink"]

    email_body = f"""
Dear Candidate,

You have been invited to an interview through TRUSTCall AI.

Meeting Details
----------------------------

Meeting Title: {meeting["title"]}
Interviewer: {meeting["interviewer"]}
Company / Organization: {meeting["company"]}

Date: {meeting["date"]}
Time: {meeting["time"]}
Duration: {meeting["duration"]}

Meeting ID: {meeting["meetingId"]}

Join your interview using the link below:

{meeting_link}

TRUSTCall AI provides secure communication with
AI-powered identity verification and liveness detection.

Please use the meeting link at the scheduled interview time.

Regards,

TRUSTCall AI
Secure Interview Communication Platform
"""

    message.set_content(email_body)

    # HTML version
    html_body = f"""
    <html>
    <body style="
        font-family: Arial, sans-serif;
        background-color: #f4f4f5;
        padding: 30px;
    ">

        <div style="
            max-width: 650px;
            margin: auto;
            background: white;
            padding: 30px;
            border-radius: 12px;
            border: 1px solid #ddd;
        ">

            <h1 style="color: #7c3aed;">
                TRUSTCall AI
            </h1>

            <h2>
                Interview Meeting Invitation
            </h2>

            <p>
                Dear Candidate,
            </p>

            <p>
                You have been invited to an interview through
                <strong>TRUSTCall AI</strong>.
            </p>

            <hr>

            <h3>Meeting Details</h3>

            <p>
                <strong>Meeting Title:</strong>
                {meeting["title"]}
            </p>

            <p>
                <strong>Interviewer:</strong>
                {meeting["interviewer"]}
            </p>

            <p>
                <strong>Company / Organization:</strong>
                {meeting["company"]}
            </p>

            <p>
                <strong>Date:</strong>
                {meeting["date"]}
            </p>

            <p>
                <strong>Time:</strong>
                {meeting["time"]}
            </p>

            <p>
                <strong>Duration:</strong>
                {meeting["duration"]}
            </p>

            <p>
                <strong>Meeting ID:</strong>
                {meeting["meetingId"]}
            </p>

            <br>

            <div style="text-align:center;">

                <a
                    href="{meeting_link}"
                    style="
                        display:inline-block;
                        background-color:#7c3aed;
                        color:white;
                        padding:14px 28px;
                        text-decoration:none;
                        border-radius:8px;
                        font-weight:bold;
                    "
                >
                    Join Interview
                </a>

            </div>

            <br>

            <p>
                Or copy this meeting link into your browser:
            </p>

            <p style="color:#555;">
                {meeting_link}
            </p>

            <hr>

            <p style="
                color:#777;
                font-size:13px;
            ">
                This meeting is protected by TRUSTCall AI
                using AI-powered identity verification,
                liveness detection and secure communication.
            </p>

            <p>
                Regards,<br>
                <strong>TRUSTCall AI</strong>
            </p>

        </div>

    </body>
    </html>
    """

    message.add_alternative(
        html_body,
        subtype="html"
    )

    # Gmail SMTP
    with smtplib.SMTP_SSL(
        "smtp.gmail.com",
        465
    ) as smtp:

        smtp.login(
            sender_email,
            sender_password
        )

        smtp.send_message(message)



# ============================================================
# SEND EXISTING MEETING INVITATION
# ============================================================

@app.post("/api/meeting/send-invitation")
async def send_existing_meeting_invitation(
    data: dict = Body(...)
):

    try:

        print()
        print("========== SEND INVITATION HIT ==========")

        meeting = data.get("meeting")

        if not meeting:
            return {
                "success": False,
                "message": "Meeting data is required."
            }

        candidate_email = (
            meeting.get("email")
            or meeting.get("candidateEmail")
        )

        if not candidate_email:
            return {
                "success": False,
                "message": "Candidate email is required."
            }

        meeting_id = str(
            meeting.get("meetingId", "")
        ).strip().upper()

        if not meeting_id:
            return {
                "success": False,
                "message": "Meeting ID is required."
            }

        meeting_link = (
            meeting.get("meetingLink")
            or
            f"https://sublime-succulent-relenting.ngrok-free.dev/meeting/{meeting_id}"
        )

        meeting["meetingId"] = meeting_id
        meeting["meetingLink"] = meeting_link

        # Use the existing Gmail email function.
        send_meeting_email(
            candidate_email,
            meeting
        )

        print()
        print("============================================================")
        print("MEETING EMAIL SENT SUCCESSFULLY")
        print(f"Candidate: {candidate_email}")
        print(f"Meeting ID: {meeting_id}")
        print(f"Meeting Link: {meeting_link}")
        print("============================================================")

        return {
            "success": True,
            "message": "Meeting invitation email sent successfully.",
            "meetingId": meeting_id,
            "meetingLink": meeting_link
        }

    except Exception as e:

        print()
        print("============================================================")
        print("EMAIL SENDING FAILED")
        print(str(e))
        print("============================================================")

        return {
            "success": False,
            "message": "Failed to send meeting invitation.",
            "error": str(e)
        }


# ============================================================
# CREATE MEETING
# ============================================================

@app.post("/api/meeting/create")
async def create_meeting(
    data: dict = Body(...)
):

    print()
    print("========== MEETING CREATE HIT ==========")
    print(data)

    # --------------------------------------------------------
    # REQUIRED FIELDS
    # --------------------------------------------------------

    required_fields = [
        "title",
        "interviewer",
        "company",
        "email",
        "date",
        "time",
        "duration"
    ]

    for field in required_fields:

        value = data.get(field)

        if value is None or str(value).strip() == "":

            return {
                "success": False,
                "message": f"{field} is required."
            }


    # --------------------------------------------------------
    # CANDIDATE EMAIL
    # --------------------------------------------------------

    candidate_email = data.get("email").strip()


    # --------------------------------------------------------
    # GENERATE MEETING ID
    # --------------------------------------------------------

    meeting_id = str(
        uuid.uuid4()
    )[:8].upper()


    # --------------------------------------------------------
    # GENERATE MEETING LINK
    # --------------------------------------------------------

    public_meeting_url = os.getenv(
        "PUBLIC_MEETING_URL",
        "https://sublime-succulent-relenting.ngrok-free.dev/meeting/"
    )

    public_meeting_url = public_meeting_url.rstrip("/") + "/"

    meeting_link = (
        public_meeting_url +
        meeting_id
    )


    # --------------------------------------------------------
    # MEETING OBJECT
    # --------------------------------------------------------

    meeting = {

        "meetingId": meeting_id,

        "meetingLink": meeting_link,

        "title": data.get(
            "title",
            ""
        ),

        "interviewer": data.get(
            "interviewer",
            ""
        ),

        "company": data.get(
            "company",
            ""
        ),

        "email": candidate_email,

        "date": data.get(
            "date",
            ""
        ),

        "time": data.get(
            "time",
            ""
        ),

        "duration": data.get(
            "duration",
            "30 Minutes"
        ),

        "type": data.get(
            "type",
            "Technical"
        ),

        "aiMonitoring": data.get(
            "aiMonitoring",
            True
        )
    }


    # --------------------------------------------------------
    # SEND EMAIL TO CANDIDATE
    # --------------------------------------------------------

    try:

        send_meeting_email(
            candidate_email,
            meeting
        )

        print()
        print(
            "============================================================"
        )

        print(
            "MEETING EMAIL SENT SUCCESSFULLY"
        )

        print(
            f"Candidate: {candidate_email}"
        )

        print(
            f"Meeting Link: {meeting_link}"
        )

        print(
            "============================================================"
        )

    except Exception as email_error:

        print()
        print(
            "============================================================"
        )

        print(
            "EMAIL SENDING FAILED"
        )

        print(
            str(email_error)
        )

        print(
            "============================================================"
        )

        return {
            "success": False,
            "message": "Meeting was created but the candidate email could not be sent.",
            "error": str(email_error)
        }


    # --------------------------------------------------------
    # RETURN RESPONSE
    # --------------------------------------------------------

    return {

        "success": True,

        "message": (
            "Meeting created and invitation "
            "sent successfully."
        ),

        "meeting": meeting
    }


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "TRUSTCall AI Backend Running",
        "status": "active",
        "agents": [
            "VisionAgent",
            "AudioAgent",
            "ConsensusAgent"
        ]
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "vision_agent": True,
        "audio_agent": True,
        "consensus_agent": True
    }


# ============================================================
# ORIGINAL VISION-ONLY ENDPOINT
# ============================================================

@app.post("/live-analyze")
async def live_analyze(
    data: dict = Body(...)
):

    try:

        image_data = data["image"]

        if "," in image_data:

            image_data = image_data.split(
                ",",
                1
            )[1]

        image_bytes = base64.b64decode(
            image_data
        )

        np_arr = np.frombuffer(
            image_bytes,
            np.uint8
        )

        frame = cv2.imdecode(
            np_arr,
            cv2.IMREAD_COLOR
        )

        if frame is None:

            return {
                "status": "INVALID_FRAME",
                "faces_detected": 0
            }

        result = vision_agent.analyze_frame(
            frame
        )

        return result

    except Exception as error:

        return {
            "status": "ERROR",
            "message": str(error)
        }


# ============================================================
# MULTIMODAL LIVE ANALYSIS
# ============================================================

@app.post("/live-multimodal")
async def live_multimodal(
    data: dict = Body(...)
):

    try:

        session_id = data.get(
            "session_id",
            "default"
        )

        image_data = data.get(
            "image"
        )

        audio_data = data.get(
            "audio"
        )

        sample_rate = int(
            data.get(
                "sample_rate",
                16000
            )
        )


        # ====================================================
        # GET SESSION
        # ====================================================

        session = get_session(
            session_id
        )


        # ====================================================
        # DECODE VIDEO FRAME
        # ====================================================

        frame = None

        if image_data:

            if "," in image_data:

                image_data = image_data.split(
                    ",",
                    1
                )[1]

            image_bytes = base64.b64decode(
                image_data
            )

            np_arr = np.frombuffer(
                image_bytes,
                np.uint8
            )

            frame = cv2.imdecode(
                np_arr,
                cv2.IMREAD_COLOR
            )


        # ====================================================
        # STORE FRAME
        # ====================================================

        if frame is not None:

            session["frames"].append(
                frame
            )

            if len(
                session["frames"]
            ) > 100:

                session["frames"] = (
                    session["frames"][-100:]
                )


        # ====================================================
        # RUN VISION
        # ====================================================

        vision_result = None

        if frame is not None:

            vision_result = (
                vision_agent.analyze_frame(
                    frame
                )
            )


        # ====================================================
        # AUDIO
        # ====================================================

        audio_result = None

        if audio_data:

            try:

                audio_bytes = base64.b64decode(
                    audio_data
                )

                audio = np.frombuffer(
                    audio_bytes,
                    dtype=np.float32
                ).copy()

                if len(audio) > 0:

                    audio_result = (
                        audio_agent.process_multimodal(
                            audio=audio,
                            frames=session["frames"],
                            sample_rate=sample_rate
                        )
                    )

            except Exception as audio_error:

                audio_result = {

                    "agent": "audio",

                    "audio_status": "ERROR",

                    "voice_status": "ERROR",

                    "av_status": "ERROR",

                    "audio_trust_score": None,

                    "error": str(audio_error)
                }


        # ====================================================
        # CONSENSUS
        # ====================================================

        consensus_result = (
            consensus_agent.analyze(
                vision_result=vision_result,
                audio_result=audio_result
            )
        )


        # ====================================================
        # RESPONSE
        # ====================================================

        response = {

            "timestamp": time.time(),

            "vision": vision_result,

            "audio": audio_result,

            "consensus": consensus_result
        }


        return response


    except Exception as error:

        return {

            "status": "ERROR",

            "message": str(error)
        }


# ============================================================
# RESET SESSION
# ============================================================

@app.post("/reset-session")
async def reset_session(
    data: dict = Body(...)
):

    session_id = data.get(
        "session_id",
        "default"
    )

    sessions.pop(
        session_id,
        None
    )

    return {

        "status": "RESET",

        "session_id": session_id
    }   