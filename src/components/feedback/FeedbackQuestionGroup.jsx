import React from "react";
import { Input } from "../FormControls";

const RATING_OPTIONS = ["1", "2", "3", "4", "5"];
const YES_NO_OPTIONS = ["Yes", "No"];

const FeedbackQuestionGroup = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  const answer = value?.answer || "";
  const otherText = value?.otherText || "";
  const type = question.type || "choice";

  const options =
    type === "yes_no"
      ? YES_NO_OPTIONS
      : type === "rating"
        ? RATING_OPTIONS
        : Array.isArray(question.options) && question.options.length
          ? question.options
          : ["Yes", "No", "Other"];

  const setAnswer = (opt, clearOther = true) => {
    onChange(question.key, {
      answer: opt,
      otherText: clearOther && opt !== "Other" ? "" : otherText,
      questionText: question.text,
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <p className="text-sm font-medium text-gray-800 mb-3">{question.text}</p>

      {type === "text" ? (
        <Input
          label="Response"
          required
          value={answer}
          disabled={disabled}
          onChange={(e) =>
            onChange(question.key, {
              answer: e.target.value,
              otherText: "",
              questionText: question.text,
            })
          }
          placeholder="Patient response"
          className="py-1.5 text-sm"
        />
      ) : type === "dropdown" ? (
        <select
          className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm bg-white disabled:opacity-50"
          value={answer}
          disabled={disabled}
          onChange={(e) => setAnswer(e.target.value)}
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-1">
            {options.map((opt) => (
              <label
                key={opt}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium cursor-pointer
                  ${
                    answer === opt
                      ? "border-sky-500 bg-sky-50 text-sky-800"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-sky-300"
                  }
                  ${disabled ? "opacity-50 pointer-events-none" : ""}`}
              >
                <input
                  type="radio"
                  name={question.key}
                  value={opt}
                  checked={answer === opt}
                  disabled={disabled}
                  onChange={() => setAnswer(opt)}
                  className="text-sky-600 w-3.5 h-3.5"
                />
                {type === "rating" ? `${opt}` : opt}
              </label>
            ))}
          </div>
          {answer === "Other" && (
            <div className="mt-2 max-w-md">
              <Input
                label="Other – Please specify"
                required
                value={otherText}
                disabled={disabled}
                onChange={(e) =>
                  onChange(question.key, {
                    answer: "Other",
                    otherText: e.target.value,
                    questionText: question.text,
                  })
                }
                placeholder="Patient response"
                className="py-1.5 text-sm"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeedbackQuestionGroup;
