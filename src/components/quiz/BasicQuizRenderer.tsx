import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EssayRenderer } from "./renderers/EssayRenderer";

interface BasicQuizRendererProps {
  question: any;
  onAnswer: (answer: any) => void;
  disabled?: boolean;
}

export const BasicQuizRenderer: React.FC<BasicQuizRendererProps> = ({
  question,
  onAnswer,
  disabled,
}) => {
  // Determine type
  const type = question.categoryCode || question.type || "unknown";

  // Parse options if needed
  const options = Array.isArray(question.options)
    ? question.options
    : typeof question.options === "string"
      ? JSON.parse(question.options)
      : [];

  // --- RENDERERS ---

  // 1. Multiple Choice / Single Choice
  if (["multiple_choice", "single_choice", "multiple_answers"].includes(type)) {
    return (
      <ChoiceRenderer
        options={options}
        onAnswer={onAnswer}
        disabled={disabled}
        isMultiple={type === "multiple_answers"}
      />
    );
  }

  // 2. Essay / Short Answer
  if (["essay", "short_answer"].includes(type)) {
    return <EssayRenderer onAnswer={onAnswer} disabled={disabled} />;
  }

  // 3. Fill in the Blank
  if (type === "fill_in_the_blank") {
    return <FillRenderer onAnswer={onAnswer} disabled={disabled} />;
  }

  // 4. Matching (Simplified Fallback)
  if (type === "matching") {
    return (
      <div className="text-center p-4 bg-gray-50 rounded">
        <p className="text-muted-foreground mb-2">Câu hỏi nối (Matching)</p>
        <p className="text-xs text-red-500">
          Chưa hỗ trợ giao diện nối đầy đủ (Đang porting từ Game Mode).
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4 text-left">
          <div className="border-r pr-4">
            <h4 className="font-semibold mb-2">Cột A</h4>
            {options
              .filter((o: any) => o.column === "A" || !o.column)
              .map((o: any, i: number) => (
                <div key={i} className="p-2 border rounded mb-2 bg-white">
                  {o.text || o.content}
                </div>
              ))}
          </div>
          <div className="pl-4">
            <h4 className="font-semibold mb-2">Cột B</h4>
            {options
              .filter((o: any) => o.column === "B")
              .map((o: any, i: number) => (
                <div key={i} className="p-2 border rounded mb-2 bg-white">
                  {o.text || o.content}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Default Fallback
  return (
    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
      <p className="font-bold">Loại câu hỏi chưa hỗ trợ: {type}</p>
      <pre className="text-xs mt-2 text-left bg-white p-2 rounded border overflow-auto max-h-40">
        {JSON.stringify(question, null, 2)}
      </pre>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ChoiceRenderer = ({ options, onAnswer, disabled, isMultiple }: any) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    if (disabled) return;
    if (isMultiple) {
      const newSelected = selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id];
      setSelected(newSelected);
      onAnswer(newSelected);
    } else {
      setSelected([id]);
      onAnswer([id]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((opt: any, idx: number) => {
        const isSelected = selected.includes(opt.id);
        return (
          <Button
            key={opt.id || idx}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "h-auto py-4 px-6 justify-start text-left whitespace-normal",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "hover:bg-gray-50",
            )}
            onClick={() => toggle(opt.id)}
            disabled={disabled}
          >
            <span
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold shrink-0",
                isSelected
                  ? "bg-white text-primary"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              {String.fromCharCode(65 + idx)}
            </span>
            <span>{opt.text || opt.content}</span>
          </Button>
        );
      })}
    </div>
  );
};

const FillRenderer = ({ onAnswer, disabled }: any) => {
  const [text, setText] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
    onAnswer([val]);
  };

  return (
    <div className="w-full">
      <Input
        placeholder="Nhập đáp án..."
        className="h-14 text-lg px-4"
        value={text}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
};
