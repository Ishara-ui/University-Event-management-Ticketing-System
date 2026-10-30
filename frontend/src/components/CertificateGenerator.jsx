JavaScript;
import React from "react";

const CertificateGenerator = ({ studentName, eventName, date }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="max-w-3xl mx-auto my-10 p-10 bg-white border-8 border-double border-blue
600 rounded-lg shadow-lg text-center relative"
    >
      <h1 className="text-4xl font-bold text-blue-800 mb-2">
        Certificate of Participation
      </h1>
      <p className="text-gray-600 italic mb-6">This is proudly presented to</p>

      <h2
        className="text-3xl font-semibold text-gray-800 border-b-2 border-gray-300 pb-2 inline
block px-10 mb-6"
      >
        {studentName || "Student Name"}
      </h2>

      <p className="text-gray-700 text-lg mb-4">
        for successfully participating in the university event <br />
        <span className="font-bold text-blue-600">
          {eventName || "Event Name"}
        </span>
      </p>

      <p className="text-sm text-gray-500 mb-8">Date: {date || "2026"}</p>

      <button
        onClick={handlePrint}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 print:hidden font
bold"
      >
        Download / Print Certificate
      </button>
    </div>
  );
};
export default CertificateGenerator;
