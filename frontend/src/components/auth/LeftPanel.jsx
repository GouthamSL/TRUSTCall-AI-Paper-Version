import Logo from "../common/Logo";
import {
  FaUserShield,
  FaMicrophone,
  FaUsers,
  FaLock,
} from "react-icons/fa";

function LeftPanel() {
  return (
    <div className="max-w-md">

      <Logo />

      <h2 className="text-5xl font-bold mt-16 leading-tight">
        AI-Powered
        <br />
        Trust & Security
        <br />
        for Every Call
      </h2>

      <p className="mt-8 text-gray-200">
        Real-time multi-modal analysis to detect
        deepfakes, verify authenticity and build
        trust in every conversation.
      </p>

      <div className="mt-12 space-y-6">

        <div className="flex gap-4">
          <FaUserShield className="text-2xl mt-1" />
          <div>
            <h3 className="font-semibold">Face Analysis</h3>
            <p className="text-sm text-gray-300">
              Detect deepfakes and verify identity
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <FaMicrophone className="text-2xl mt-1" />
          <div>
            <h3 className="font-semibold">Voice Analysis</h3>
            <p className="text-sm text-gray-300">
              Analyze voice patterns and anomalies
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <FaUsers className="text-2xl mt-1" />
          <div>
            <h3 className="font-semibold">Consensus Engine</h3>
            <p className="text-sm text-gray-300">
              Combine insights to generate trust score
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <FaLock className="text-2xl mt-1" />
          <div>
            <h3 className="font-semibold">
              Secure Communication
            </h3>
            <p className="text-sm text-gray-300">
              End-to-end encrypted communication
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default LeftPanel;