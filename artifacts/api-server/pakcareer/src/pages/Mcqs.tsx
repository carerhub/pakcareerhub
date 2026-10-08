import React, { useState } from "react";
import { Link } from "wouter";
import { useListMcqs } from "@workspace/api-client-react";
import { McqDifficulty, McqCorrectAnswer } from "@workspace/api-client-react";
import { BookOpen, CheckCircle2, XCircle, ChevronRight, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function Mcqs() {
  const [category, setCategory] = useState<string>("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const { data: mcqs, isLoading } = useListMcqs({
    category: category || undefined,
    limit: 50
  });

  const categories = ["General Knowledge", "Pakistan Affairs", "Islamic Studies", "Everyday Science", "English", "Mathematics"];

  const handleSelect = (mcqId: number, option: string) => {
    if (selectedAnswers[mcqId]) return; // prevent re-answering
    setSelectedAnswers(prev => ({ ...prev, [mcqId]: option }));
  };

  const toggleExplanation = (mcqId: number) => {
    setShowExplanation(prev => ({ ...prev, [mcqId]: !prev[mcqId] }));
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowExplanation({});
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'easy') return 'bg-green-500/10 text-green-700 border-green-500/20';
    if (diff === 'medium') return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    return 'bg-red-500/10 text-red-700 border-red-500/20';
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
          Practice MCQs
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Prepare for your competitive exams (FPSC, PPSC, NTS) with our interactive multiple choice questions.
        </p>

        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          <Badge 
            variant="outline" 
            className={`cursor-pointer px-4 py-2 text-sm ${!category ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            onClick={() => setCategory("")}
          >
            All Subjects
          </Badge>
          {categories.map(cat => (
            <Badge 
              key={cat}
              variant="outline" 
              className={`cursor-pointer px-4 py-2 text-sm ${category === cat ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-secondary">{mcqs?.length || 0} Questions Found</h2>
        {Object.keys(selectedAnswers).length > 0 && (
          <Button variant="outline" onClick={resetQuiz} className="h-9">
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset Practice
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : mcqs?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <p className="text-muted-foreground">No MCQs found for this category.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {mcqs?.map((mcq, index) => {
            const isAnswered = !!selectedAnswers[mcq.id];
            const isCorrect = selectedAnswers[mcq.id] === mcq.correctAnswer;
            
            return (
              <Card key={mcq.id} className="border-border shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className={getDifficultyColor(mcq.difficulty)}>
                      {mcq.difficulty.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary">{mcq.category}</Badge>
                  </div>
                  
                  <h3 className="text-lg font-bold text-secondary mb-6 leading-relaxed">
                    <span className="text-primary mr-2">Q{index + 1}.</span> 
                    {mcq.question}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                      const optionText = mcq[`option${opt}` as keyof typeof mcq];
                      const isSelected = selectedAnswers[mcq.id] === opt;
                      const isCorrectOption = mcq.correctAnswer === opt;
                      
                      let btnClass = "justify-start h-auto min-h-12 py-3 px-4 border text-left font-normal whitespace-normal transition-all ";
                      
                      if (!isAnswered) {
                        btnClass += "hover:bg-muted/50 hover:border-primary/50 text-foreground";
                      } else if (isCorrectOption) {
                        btnClass += "bg-green-50 border-green-500 text-green-800";
                      } else if (isSelected && !isCorrect) {
                        btnClass += "bg-red-50 border-red-500 text-red-800";
                      } else {
                        btnClass += "opacity-50 pointer-events-none";
                      }

                      return (
                        <Button 
                          key={opt}
                          variant="outline" 
                          className={btnClass}
                          onClick={() => handleSelect(mcq.id, opt)}
                        >
                          <span className="font-bold mr-3">{opt}.</span>
                          <span className="flex-1">{optionText}</span>
                          {isAnswered && isCorrectOption && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 ml-2" />}
                          {isAnswered && isSelected && !isCorrectOption && <XCircle className="h-5 w-5 text-red-600 shrink-0 ml-2" />}
                        </Button>
                      );
                    })}
                  </div>

                  {isAnswered && mcq.explanation && (
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary font-medium p-0 h-auto hover:bg-transparent"
                        onClick={() => toggleExplanation(mcq.id)}
                      >
                        {showExplanation[mcq.id] ? "Hide Explanation" : "View Explanation"}
                        <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${showExplanation[mcq.id] ? 'rotate-90' : ''}`} />
                      </Button>
                      
                      {showExplanation[mcq.id] && (
                        <div className="mt-3 p-4 bg-muted/50 rounded-lg text-sm text-foreground/80 border leading-relaxed">
                          <span className="font-bold text-secondary block mb-1">Explanation:</span>
                          {mcq.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
