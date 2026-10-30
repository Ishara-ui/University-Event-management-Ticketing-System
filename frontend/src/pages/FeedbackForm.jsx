JavaScript;
import React, { useState } from "react";
import axios from "axios";

const FeedbackForm = ({ eventId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/feedback",
        { eventId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Thank you for your feedback!");
      setComment("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit feedback");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow max-w-md mx
auto mt-6"
    >
      <h3 className="text-xl font-bold mb-4 text-blue-600">Event Feedback</h3>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Ra ng (1-5)
        </label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full p-2 border rounded"
        >
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Very Good</option>
          <option value={3}>3 - Good</option>
          <option value={2}>2 - Fair</option>
          <option value={1}>1 - Poor</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded"
          rows="3"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue
700 font-bold"
      >
        Submit Feedback
      </button>
    </form>
  );
};
export default FeedbackForm;
